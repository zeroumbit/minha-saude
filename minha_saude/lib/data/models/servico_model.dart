class Servico {
  final String id;
  final String empresaId;
  final String nome;
  final bool ativo;
  final List<ServicoUnidadeVinculo>? unidades;
  final List<ServicoProfissionalVinculo>? profissionais;

  Servico({
    required this.id,
    required this.empresaId,
    required this.nome,
    this.ativo = true,
    this.unidades,
    this.profissionais,
  });

  factory Servico.fromJson(Map<String, dynamic> json) {
    return Servico(
      id: json['id'],
      empresaId: json['empresa_id'],
      nome: json['nome'],
      ativo: json['ativo'] ?? true,
      unidades: json['unidades'] != null
          ? (json['unidades'] as List)
              .map((u) => ServicoUnidadeVinculo.fromJson(u))
              .toList()
          : null,
      profissionais: json['profissionais'] != null
          ? (json['profissionais'] as List)
              .map((p) => ServicoProfissionalVinculo.fromJson(p))
              .toList()
          : null,
    );
  }
}

class ServicoUnidadeVinculo {
  final String? nome;

  ServicoUnidadeVinculo({this.nome});

  factory ServicoUnidadeVinculo.fromJson(Map<String, dynamic> json) {
    // Handling the nested structure from Supabase select
    final unidade = json['unidade'];
    return ServicoUnidadeVinculo(
      nome: unidade != null ? unidade['nome'] : null,
    );
  }
}

class ServicoProfissionalVinculo {
  final String? nome;
  final String? sobrenome;

  ServicoProfissionalVinculo({this.nome, this.sobrenome});

  factory ServicoProfissionalVinculo.fromJson(Map<String, dynamic> json) {
    final profissional = json['profissional'];
    return ServicoProfissionalVinculo(
      nome: profissional != null ? profissional['nome'] : null,
      sobrenome: profissional != null ? profissional['sobrenome'] : null,
    );
  }

  String get fullName => '$nome ${sobrenome ?? ''}'.trim();
}
