import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:minha_saude/data/services/medication_provider.dart';
import 'package:go_router/go_router.dart';

class MedicationListScreen extends StatelessWidget {
  const MedicationListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Medicamentos'),
      ),
      body: Consumer<MedicationProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.medications.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.medications.isEmpty) {
            return const Center(child: Text('Nenhum medicamento cadastrado.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.medications.length,
            itemBuilder: (context, index) {
              final med = provider.medications[index];
              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey[200]!),
                ),
                child: ListTile(
                  leading: const Icon(Icons.medication, color: Color(0xFF0A0AC2)),
                  title: Text(med.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${med.dosage} - ${med.time.substring(0, 5)}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    context.push('/medication-detail', extra: med);
                  },
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/add-medication'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
