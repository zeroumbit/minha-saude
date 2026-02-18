import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:minha_saude/data/models/empresa_model.dart';
import 'package:flutter/foundation.dart';

class EmpresaService {
  final _supabase = Supabase.instance.client;

  Future<List<Empresa>> getActiveCompanies() async {
    try {
      // Fetching companies that are 'ACTIVE'
      // We also check 'status' based on the enum in schema
      final response = await _supabase
          .from('empresas')
          .select()
          .eq('status', 'ACTIVE')
          .order('nome_fantasia', ascending: true);

      return (response as List).map((json) => Empresa.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error fetching companies (advertisers): $e');
      return [];
    }
  }
}
