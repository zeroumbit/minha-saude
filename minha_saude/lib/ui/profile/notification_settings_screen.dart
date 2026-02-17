import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:minha_saude/data/services/profile_provider.dart';
import 'package:minha_saude/data/services/medication_provider.dart';
import 'package:minha_saude/data/services/appointment_provider.dart';
import 'package:minha_saude/data/services/notification_scheduler.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  int _selectedLeadTime = 30;
  int _selectedInterval = 5;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadCurrentSettings();
  }

  void _loadCurrentSettings() {
    final profile = context.read<ProfileProvider>().profile;
    if (profile != null) {
      setState(() {
        _selectedLeadTime = profile.notificationLeadTimeMinutes;
        _selectedInterval = profile.notificationIntervalMinutes;
      });
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isLoading = true);
    try {
      await context.read<ProfileProvider>().updateProfile(
            notificationLeadTimeMinutes: _selectedLeadTime,
            notificationIntervalMinutes: _selectedInterval,
          );

      // Re-agendar notificações
      if (mounted) {
        final profile = context.read<ProfileProvider>().profile;
        if (profile != null) {
          final medications = context.read<MedicationProvider>().medications;
          final appointments = context.read<AppointmentProvider>().appointments;

          NotificationScheduler.rescheduleAllMedications(medications, profile);
          NotificationScheduler.rescheduleAllAppointments(
              appointments, profile);
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Configurações de notificação salvas!')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Erro ao salvar configurações: $e'),
              backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configurar Notificações'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Calibre o tempo dos alertas',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Esses tempos serão aplicados de forma global para todos os medicamentos e consultas.',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Começar a notificar antes:',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  _buildLeadTimeOption(30, '30 minutos (Padrão)'),
                  _buildLeadTimeOption(60, '1 hora'),
                  _buildLeadTimeOption(90, '1 hora e 30 minutos'),
                  const SizedBox(height: 32),
                  const Text(
                    'Intervalo entre alertas:',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  _buildIntervalOption(5, '5 minutos'),
                  _buildIntervalOption(10, '10 minutos'),
                  const SizedBox(height: 48),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saveSettings,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: const Color(0xFF0A0AC2),
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Salvar Configurações'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildLeadTimeOption(int value, String label) {
    return RadioListTile<int>(
      title: Text(label),
      value: value,
      groupValue: _selectedLeadTime,
      onChanged: (val) {
        if (val != null) setState(() => _selectedLeadTime = val);
      },
      contentPadding: EdgeInsets.zero,
      activeColor: const Color(0xFF0A0AC2),
    );
  }

  Widget _buildIntervalOption(int value, String label) {
    return RadioListTile<int>(
      title: Text(label),
      value: value,
      groupValue: _selectedInterval,
      onChanged: (val) {
        if (val != null) setState(() => _selectedInterval = val);
      },
      contentPadding: EdgeInsets.zero,
      activeColor: const Color(0xFF0A0AC2),
    );
  }
}
