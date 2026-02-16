import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:minha_saude/data/models/medication_model.dart';

class MedicationService {
  final _supabase = Supabase.instance.client;

  Future<List<Medication>> getMedications() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return [];

    final response = await _supabase
        .from('medications')
        .select()
        .eq('user_id', user.id)
        .order('time', ascending: true);

    return (response as List).map((json) => Medication.fromJson(json)).toList();
  }

  Future<void> addMedication(Medication medication) async {
    await _supabase.from('medications').insert(medication.toJson());
  }

  Future<void> updateMedicationStatus(String id, bool isTaken) async {
    await _supabase
        .from('medications')
        .update({'is_taken': isTaken}).match({'id': id});
  }

  Future<void> updateMedication(Medication medication) async {
    if (medication.id == null) return;
    await _supabase
        .from('medications')
        .update(medication.toJson())
        .match({'id': medication.id!});
  }

  Future<void> deleteMedication(String id) async {
    await _supabase.from('medications').delete().match({'id': id});
  }
}
