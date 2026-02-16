import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:minha_saude/data/models/medication_model.dart';
import 'package:minha_saude/data/services/medication_provider.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AddMedicationScreen extends StatefulWidget {
  const AddMedicationScreen({super.key});

  @override
  State<AddMedicationScreen> createState() => _AddMedicationScreenState();
}

class _AddMedicationScreenState extends State<AddMedicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _dosageController = TextEditingController();
  final _instructionsController = TextEditingController();
  TimeOfDay _selectedTime = TimeOfDay.now();
  MedicationFrequency _selectedFrequency = MedicationFrequency.daily;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _dosageController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null && picked != _selectedTime) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    final timeString = '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}:00';

    final medication = Medication(
      userId: user.id,
      name: _nameController.text.trim(),
      dosage: _dosageController.text.trim(),
      time: timeString,
      instructions: _instructionsController.text.trim(),
      frequency: _selectedFrequency,
    );

    try {
      await context.read<MedicationProvider>().addMedication(medication);
      if (mounted) {
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao salvar medicamento.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Adicionar Medicamento'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nome do Medicamento',
                  hintText: 'Ex: Paracetamol',
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Informe o nome' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _dosageController,
                decoration: const InputDecoration(
                  labelText: 'Dosagem',
                  hintText: 'Ex: 500mg, 1 comprimido',
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Informe a dosagem' : null,
              ),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('Horário'),
                trailing: Text(
                  _selectedTime.format(context),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                onTap: () => _selectTime(context),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey[300]!),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<MedicationFrequency>(
                value: _selectedFrequency,
                decoration: const InputDecoration(labelText: 'Frequência'),
                items: MedicationFrequency.values.map((freq) {
                  return DropdownMenuItem(
                    value: freq,
                    child: Text(freq == MedicationFrequency.daily
                        ? 'Diário'
                        : freq == MedicationFrequency.weekly
                            ? 'Semanal'
                            : 'Conforme necessário'),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedFrequency = value;
                    });
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _instructionsController,
                decoration: const InputDecoration(
                  labelText: 'Instruções Adicionais (Opcional)',
                  hintText: 'Ex: Tomar após as refeições',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _save,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Salvar Medicamento'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
