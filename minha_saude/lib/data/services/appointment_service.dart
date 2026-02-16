import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:minha_saude/data/models/appointment_model.dart';

class AppointmentService {
  final _supabase = Supabase.instance.client;

  Future<List<Appointment>> getAppointments() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return [];

    final response = await _supabase
        .from('appointments')
        .select()
        .eq('user_id', user.id)
        .order('date_time', ascending: true);

    return (response as List).map((json) => Appointment.fromJson(json)).toList();
  }

  Future<void> addAppointment(Appointment appointment) async {
    await _supabase.from('appointments').insert(appointment.toJson());
  }

  Future<void> deleteAppointment(String id) async {
    await _supabase.from('appointments').delete().match({'id': id});
  }
}
