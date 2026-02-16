import 'package:flutter/material.dart';
import 'package:minha_saude/data/services/care_circle_service.dart';

class CareCircleProvider with ChangeNotifier {
  final _service = CareCircleService();
  List<Map<String, dynamic>> _members = [];
  bool _isLoading = false;

  List<Map<String, dynamic>> get members => _members;
  bool get isLoading => _isLoading;

  Future<void> loadMembers() async {
    _isLoading = true;
    notifyListeners();
    try {
      _members = await _service.getMembers();
    } catch (e) {
      debugPrint('Error loading care circle: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> inviteMember({
    required String email,
    required String name,
    required String relationship,
    String accessLevel = 'view_only',
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _service.inviteMember(
        email: email,
        name: name,
        relationship: relationship,
        accessLevel: accessLevel,
      );
      await loadMembers();
    } catch (e) {
      debugPrint('Error inviting member: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeMember(String id) async {
    try {
      await _service.removeMember(id);
      _members.removeWhere((m) => m['id'] == id);
      notifyListeners();
    } catch (e) {
      debugPrint('Error removing member: $e');
    }
  }
}
