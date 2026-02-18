class Empresa {
  final String id;
  final String nome;
  final String? logoUrl;
  final String? descricao;
  final List<String> categorias;
  final bool isPublicPartner;

  Empresa({
    required this.id,
    required this.nome,
    this.logoUrl,
    this.descricao,
    this.categorias = const [],
    this.isPublicPartner = false,
  });

  factory Empresa.fromJson(Map<String, dynamic> json) {
    return Empresa(
      id: json['id'],
      nome: json['nome_fantasia'] ?? '',
      logoUrl: json['logo_url'],
      descricao: json['descricao'],
      categorias: json['categorias'] != null
          ? List<String>.from(json['categorias'])
          : [],
      isPublicPartner: json['is_public_partner'] ?? false,
    );
  }
}
