import 'package:flutter/material.dart';
import 'package:minha_saude/data/models/user_model.dart';
import 'package:minha_saude/data/services/profile_service.dart';

class ProfileProvider with ChangeNotifier {
  final _service = ProfileService();
  UserProfile? _profile;
  bool _isLoading = false;

  UserProfile? get profile => _profile;
  bool get isLoading => _isLoading;

  Future<void> loadProfile() async {
    _isLoading = true;
    notifyListeners();
    try {
      _profile = await _service.getProfile();
    } catch (e) {
      debugPrint('Error loading profile: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProfile(String name) async {
    try {
      await _service.updateProfile(name);
      if (_profile != null) {
        _profile = UserProfile(
          id: _profile!.id,
          email: _profile!.email,
          name: name,
          photoUrl: _profile!.photoUrl,
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error updating profile: $e');
      rethrow;
    }
  }
}
