import 'package:flutter/material.dart';
import 'package:minha_saude/data/models/appointment_model.dart';
import 'package:minha_saude/data/services/appointment_service.dart';

class AppointmentProvider with ChangeNotifier {
  final _service = AppointmentService();
  List<Appointment> _appointments = [];
  bool _isLoading = false;

  List<Appointment> get appointments => _appointments;
  bool get isLoading => _isLoading;

  Future<void> loadAppointments() async {
    _isLoading = true;
    notifyListeners();
    try {
      _appointments = await _service.getAppointments();
    } catch (e) {
      debugPrint('Error loading appointments: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addAppointment(Appointment appointment) async {
    try {
      await _service.addAppointment(appointment);
      await loadAppointments();
    } catch (e) {
      debugPrint('Error adding appointment: $e');
      rethrow;
    }
  }

  Future<void> editAppointment(Appointment appointment) async {
    try {
      await _service.updateAppointment(appointment);
      await loadAppointments();
    } catch (e) {
      debugPrint('Error editing appointment: $e');
      rethrow;
    }
  }

  Future<void> deleteAppointment(String id) async {
    try {
      await _service.deleteAppointment(id);
      _appointments.removeWhere((a) => a.id == id);
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting appointment: $e');
      rethrow;
    }
  }
}
