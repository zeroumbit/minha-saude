import 'package:flutter/material.dart';
import 'package:minha_saude/data/models/empresa_model.dart';
import 'package:minha_saude/data/services/empresa_service.dart';

class EmpresaProvider with ChangeNotifier {
  final _service = EmpresaService();
  List<Empresa> _empresas = [];
  bool _isLoading = false;

  List<Empresa> get empresas => _empresas;
  bool get isLoading => _isLoading;

  Future<void> loadEmpresas() async {
    debugPrint('DEBUG: EmpresaProvider loadEmpresas start');
    _isLoading = true;
    notifyListeners();
    try {
      _empresas = await _service.getActiveCompanies();
      debugPrint(
          'DEBUG: EmpresaProvider loadEmpresas success: ${_empresas.length} companies');
    } catch (e) {
      debugPrint('DEBUG: EmpresaProvider loadEmpresas error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
      debugPrint('DEBUG: EmpresaProvider loadEmpresas end');
    }
  }
}
