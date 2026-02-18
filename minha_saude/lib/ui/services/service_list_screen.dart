import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:minha_saude/data/services/servico_provider.dart';

class ServiceListScreen extends StatefulWidget {
  const ServiceListScreen({super.key});

  @override
  State<ServiceListScreen> createState() => _ServiceListScreenState();
}

class _ServiceListScreenState extends State<ServiceListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ServicoProvider>().loadServicos();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Serviços Disponíveis'),
      ),
      body: Consumer<ServicoProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.servicos.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.servicos.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.medical_services_outlined,
                      size: 80, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text(
                    'Nenhum serviço disponível',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text('Verifique mais tarde ou contate a clínica.'),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadServicos(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.servicos.length,
              itemBuilder: (context, index) {
                final service = provider.servicos[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Theme.of(context)
                                    .primaryColor
                                    .withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(Icons.medical_services,
                                  color: Theme.of(context).primaryColor),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    service.nome,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (service.unidades != null &&
                                      service.unidades!.isNotEmpty)
                                    Text(
                                      'Disponível em: ${service.unidades!.map((u) => u.nome).join(", ")}',
                                      style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 13),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (service.profissionais != null &&
                            service.profissionais!.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 8),
                          const Text(
                            'Profissionais:',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            children: service.profissionais!.map((p) {
                              return Chip(
                                label: Text(p.fullName,
                                    style: const TextStyle(fontSize: 12)),
                                backgroundColor: Colors.blue[50],
                                avatar: const Icon(Icons.person,
                                    size: 16, color: Colors.blue),
                              );
                            }).toList(),
                          ),
                        ],
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content:
                                        Text('Agendamento pelo App em breve!')),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Agendar Agora'),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
