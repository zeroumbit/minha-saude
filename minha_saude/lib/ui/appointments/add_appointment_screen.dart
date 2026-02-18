import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:minha_saude/data/models/appointment_model.dart';
import 'package:minha_saude/data/services/appointment_provider.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AddAppointmentScreen extends StatefulWidget {
  final Appointment? appointment;
  const AddAppointmentScreen({super.key, this.appointment});

  @override
  State<AddAppointmentScreen> createState() => _AddAppointmentScreenState();
}

class _AddAppointmentScreenState extends State<AddAppointmentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _doctorController = TextEditingController();
  final _specialtyController = TextEditingController();
  final _locationController = TextEditingController();
  final _notesController = TextEditingController();
  late DateTime _selectedDate;
  late TimeOfDay _selectedTime;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.appointment != null) {
      _doctorController.text = widget.appointment!.doctorName;
      _specialtyController.text = widget.appointment!.specialty;
      _locationController.text = widget.appointment!.location;
      _notesController.text = widget.appointment!.notes ?? '';
      _selectedDate = widget.appointment!.dateTime;
      _selectedTime = TimeOfDay(
        hour: widget.appointment!.dateTime.hour,
        minute: widget.appointment!.dateTime.minute,
      );
    } else {
      _selectedDate = DateTime.now();
      _selectedTime = TimeOfDay.now();
    }
  }

  @override
  void dispose() {
    _doctorController.dispose();
    _specialtyController.dispose();
    _locationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate:
          DateTime(2000), // Permite datas passadas para edição de histórico
      lastDate: DateTime(2101),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
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

    final userId = Supabase.instance.client.auth.currentUser?.id;
    if (userId == null) return;

    final finalDateTime = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    );

    final appointment = Appointment(
      id: widget.appointment?.id,
      userId: userId,
      doctorName: _doctorController.text.trim(),
      specialty: _specialtyController.text.trim(),
      dateTime: finalDateTime,
      location: _locationController.text.trim(),
      notes: _notesController.text.trim(),
    );

    try {
      if (widget.appointment != null) {
        await context.read<AppointmentProvider>().editAppointment(appointment);
      } else {
        await context.read<AppointmentProvider>().addAppointment(appointment);
      }
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao salvar consulta.')),
        );
      }
    } finally {
      if (mounted)
        setState(() {
          _isLoading = false;
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.appointment != null;
    return Scaffold(
      appBar: AppBar(
          title: Text(isEditing ? 'Editar Agendamento' : 'Agendar Consulta')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _doctorController,
                decoration: const InputDecoration(labelText: 'Nome do Médico'),
                validator: (v) =>
                    v == null || v.isEmpty ? 'Informe o médico' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _specialtyController,
                decoration: const InputDecoration(labelText: 'Especialidade'),
                validator: (v) =>
                    v == null || v.isEmpty ? 'Informe a especialidade' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ListTile(
                      title: const Text('Data'),
                      subtitle: Text(
                          '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}'),
                      onTap: () => _selectDate(context),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(color: Colors.grey[300]!),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ListTile(
                      title: const Text('Hora'),
                      subtitle: Text(_selectedTime.format(context)),
                      onTap: () => _selectTime(context),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(color: Colors.grey[300]!),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locationController,
                decoration:
                    const InputDecoration(labelText: 'Localização/Clínica'),
                validator: (v) =>
                    v == null || v.isEmpty ? 'Informe o local' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _notesController,
                decoration:
                    const InputDecoration(labelText: 'Observações (Opcional)'),
                maxLines: 3,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _save,
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Confirmar Agendamento'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
