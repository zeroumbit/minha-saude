import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:minha_saude/data/services/prescription_service.dart';

class PrescriptionProvider with ChangeNotifier {
  final _service = PrescriptionService();
  List<Map<String, dynamic>> _prescriptions = [];
  bool _isLoading = false;

  List<Map<String, dynamic>> get prescriptions => _prescriptions;
  bool get isLoading => _isLoading;

  Future<void> loadPrescriptions() async {
    _isLoading = true;
    notifyListeners();
    try {
      _prescriptions = await _service.getPrescriptions();
    } catch (e) {
      debugPrint('Error loading prescriptions: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addPrescription({
    required String title,
    String? doctorName,
    DateTime? issueDate,
    XFile? image,
    String? notes,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _service.addPrescription(
        title: title,
        doctorName: doctorName,
        issueDate: issueDate,
        image: image,
        notes: notes,
      );
      await loadPrescriptions();
    } catch (e) {
      debugPrint('Error adding prescription: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> editPrescription({
    required String id,
    required String title,
    String? doctorName,
    DateTime? issueDate,
    XFile? image,
    String? oldImageUrl,
    String? notes,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _service.updatePrescription(
        id: id,
        title: title,
        doctorName: doctorName,
        issueDate: issueDate,
        image: image,
        oldImageUrl: oldImageUrl,
        notes: notes,
      );
      await loadPrescriptions();
    } catch (e) {
      debugPrint('Error editing prescription: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deletePrescription(String id, String? imageUrl) async {
    try {
      await _service.deletePrescription(id, imageUrl);
      _prescriptions.removeWhere((p) => p['id'] == id);
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting prescription: $e');
      rethrow;
    }
  }
}
