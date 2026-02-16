import 'package:flutter/material.dart';
import 'package:minha_saude/data/models/medication_model.dart';
import 'package:minha_saude/data/services/medication_service.dart';

class MedicationProvider with ChangeNotifier {
  final _service = MedicationService();
  List<Medication> _medications = [];
  bool _isLoading = false;

  List<Medication> get medications => _medications;
  bool get isLoading => _isLoading;

  Future<void> editMedication(Medication medication) async {
    try {
      await _service.updateMedication(medication);
      await loadMedications();
    } catch (e) {
      debugPrint('Error editing medication: $e');
      rethrow;
    }
  }

  Future<void> loadMedications() async {
    _isLoading = true;
    notifyListeners();
    try {
      _medications = await _service.getMedications();
    } catch (e) {
      debugPrint('Error loading medications: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleMedicationStatus(Medication medication) async {
    if (medication.id == null) return;

    final index = _medications.indexOf(medication);
    final newStatus = !medication.isTaken;

    try {
      await _service.updateMedicationStatus(medication.id!, newStatus);
      _medications[index] = Medication(
        id: medication.id,
        userId: medication.userId,
        name: medication.name,
        dosage: medication.dosage,
        time: medication.time,
        instructions: medication.instructions,
        frequency: medication.frequency,
        isTaken: newStatus,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Error updating medication: $e');
    }
  }

  Future<void> addMedication(Medication medication) async {
    try {
      await _service.addMedication(medication);
      await loadMedications();
    } catch (e) {
      debugPrint('Error adding medication: $e');
    }
  }

  Future<void> deleteMedication(String id) async {
    try {
      await _service.deleteMedication(id);
      await loadMedications();
    } catch (e) {
      debugPrint('Error deleting medication: $e');
      rethrow;
    }
  }
}
