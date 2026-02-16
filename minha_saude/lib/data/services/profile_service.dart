import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:minha_saude/data/models/user_model.dart';

class ProfileService {
  final _supabase = Supabase.instance.client;

  Future<UserProfile?> getProfile() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return null;

    final response =
        await _supabase.from('profiles').select().eq('id', user.id).single();

    return UserProfile.fromJson(response);
  }

  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? state,
    String? city,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    final updates = {
      if (firstName != null) 'first_name': firstName,
      if (lastName != null) 'last_name': lastName,
      if (state != null) 'state': state,
      if (city != null) 'city': city,
      'updated_at': DateTime.now().toIso8601String(),
    };

    await _supabase.from('profiles').update(updates).eq('id', user.id);

    // Sincroniza metadata básico
    if (firstName != null || lastName != null) {
      await _supabase.auth.updateUser(UserAttributes(
        data: {
          if (firstName != null) 'first_name': firstName,
          if (lastName != null) 'last_name': lastName,
        },
      ));
    }
  }
}
