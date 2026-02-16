import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:minha_saude/data/models/medication_model.dart';
import 'package:minha_saude/data/services/medication_provider.dart';
import 'package:intl/intl.dart';

class MedicationDetailScreen extends StatelessWidget {
  final Medication medication;

  const MedicationDetailScreen({super.key, required this.medication});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalhes do Remédio'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => context.push('/add-medication', extra: medication),
            tooltip: 'Editar',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.medication,
                    size: 64, color: Theme.of(context).primaryColor),
              ),
            ),
            const SizedBox(height: 32),
            _buildDetailSection(context, 'Nome', medication.name, Icons.title),
            _buildDetailSection(
                context, 'Dosagem', medication.dosage, Icons.scale),
            _buildDetailSection(context, 'Horário Próxima Dose',
                medication.time.substring(0, 5), Icons.access_time),
            _buildDetailSection(context, 'Frequência',
                _formatFrequency(medication.frequency), Icons.repeat),
            if (medication.instructions != null &&
                medication.instructions!.isNotEmpty)
              _buildDetailSection(context, 'Instruções',
                  medication.instructions!, Icons.description),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Excluir Medicamento'),
                      content: const Text(
                          'Tem certeza que deseja remover este medicamento?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Cancelar'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('Excluir',
                              style: TextStyle(color: Colors.red)),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true && context.mounted) {
                    try {
                      final provider = context.read<MedicationProvider>();
                      await provider.deleteMedication(medication.id!);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Medicamento removido.')),
                        );
                        context.pop();
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Erro ao excluir medicamento.')),
                        );
                      }
                    }
                  }
                },
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                label: const Text('Excluir Medicamento',
                    style: TextStyle(color: Colors.red)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailSection(
      BuildContext context, String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.grey[400], size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                const SizedBox(height: 4),
                Text(value,
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatFrequency(MedicationFrequency freq) {
    switch (freq) {
      case MedicationFrequency.daily:
        return 'Diariamente';
      case MedicationFrequency.weekly:
        return 'Semanalmente';
      case MedicationFrequency.asNeeded:
        return 'Se necessário';
    }
  }
}
