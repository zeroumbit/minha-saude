import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:minha_saude/data/models/user_model.dart';

class ProfileService {
  final _supabase = Supabase.instance.client;

  Future<UserProfile?> getProfile() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return null;

    final response = await _supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();

    return UserProfile.fromJson(response);
  }

  Future<void> updateProfile(String name) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    await _supabase.from('profiles').update({
      'name': name,
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', user.id);
    
    // Também atualiza o metadata do Auth para manter sincronizado se possível
    await _supabase.auth.updateUser(UserAttributes(
      data: {'name': name},
    ));
  }
}
