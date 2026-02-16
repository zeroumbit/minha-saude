import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:minha_saude/data/services/prescription_provider.dart';
import 'package:provider/provider.dart';

class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({super.key});

  @override
  State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PrescriptionProvider>().loadPrescriptions();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Minhas Receitas')),
      body: Consumer<PrescriptionProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.prescriptions.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.prescriptions.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long, size: 80, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text('Nenhuma receita cadastrada',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Guarde fotos das suas receitas aqui.',
                      textAlign: TextAlign.center),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadPrescriptions(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.prescriptions.length,
              itemBuilder: (context, index) {
                final prescription = provider.prescriptions[index];
                return Dismissible(
                  key: Key(prescription['id'].toString()),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  onDismissed: (direction) {
                    provider.deletePrescription(
                        prescription['id'], prescription['image_url']);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Receita removida.')),
                    );
                  },
                  child: Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(12),
                      leading: prescription['image_url'] != null
                          ? GestureDetector(
                              onTap: () {
                                showDialog(
                                  context: context,
                                  builder: (_) => Dialog(
                                    child: Image.network(
                                      prescription['image_url'],
                                      fit: BoxFit.contain,
                                    ),
                                  ),
                                );
                              },
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  prescription['image_url'],
                                  width: 60,
                                  height: 60,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      const Icon(Icons.broken_image, size: 40),
                                ),
                              ),
                            )
                          : Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.description,
                                  color: Colors.grey),
                            ),
                      title: Text(
                        prescription['title'] ?? 'Sem título',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (prescription['doctor_name'] != null)
                            Text('Médico: ${prescription['doctor_name']}'),
                          if (prescription['issue_date'] != null)
                            Text(
                              'Emitida em: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(prescription['issue_date']))}',
                              style: TextStyle(
                                  color: Colors.grey[600], fontSize: 12),
                            ),
                        ],
                      ),
                      isThreeLine: true,
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/add-prescription'),
        label: const Text('Nova Receita'),
        icon: const Icon(Icons.add_a_photo),
      ),
    );
  }
}
