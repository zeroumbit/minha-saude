import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:minha_saude/data/models/servico_model.dart';
import 'package:flutter/foundation.dart';

class ServicoService {
  final _supabase = Supabase.instance.client;

  Future<List<Servico>> getServicos() async {
    // For now, let's fetch all active services.
    // In a multi-tenant app, we might want to filter by clinic or user preference.
    // However, the user is likely testing with the services they just created.

    try {
      final response = await _supabase.from('servicos').select('''
            *,
            unidades:servico_unidades(
              unidade:unidades(nome)
            ),
            profissionais:servico_profissionais(
              profissional:profissionais(nome, sobrenome)
            )
          ''').eq('ativo', true).order('nome', ascending: true);

      return (response as List).map((json) => Servico.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error fetching services: $e');
      return [];
    }
  }
}
