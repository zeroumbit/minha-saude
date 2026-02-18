import 'package:flutter/material.dart';
import 'package:minha_saude/data/models/servico_model.dart';
import 'package:minha_saude/data/services/servico_service.dart';

class ServicoProvider with ChangeNotifier {
  final _service = ServicoService();
  List<Servico> _servicos = [];
  bool _isLoading = false;

  List<Servico> get servicos => _servicos;
  bool get isLoading => _isLoading;

  Future<void> loadServicos() async {
    _isLoading = true;
    notifyListeners();
    try {
      _servicos = await _service.getServicos();
    } catch (e) {
      debugPrint('Error loading services: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
