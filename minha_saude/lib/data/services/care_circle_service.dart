import 'package:supabase_flutter/supabase_flutter.dart';

class CareCircleService {
  final _supabase = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> getMembers() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return [];

    return await _supabase
        .from('care_circle')
        .select()
        .eq('owner_id', user.id)
        .order('created_at', ascending: false);
  }

  Future<void> inviteMember({
    required String email,
    required String name,
    required String relationship,
    String accessLevel = 'view_only',
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    await _supabase.from('care_circle').insert({
      'owner_id': user.id,
      'member_email': email,
      'member_name': name,
      'relationship': relationship,
      'access_level': accessLevel,
      'status': 'pending',
    });
  }

  Future<void> removeMember(String id) async {
    await _supabase.from('care_circle').delete().eq('id', id);
  }
}
