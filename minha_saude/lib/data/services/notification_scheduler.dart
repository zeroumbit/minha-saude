import 'package:flutter/material.dart';
import 'package:minha_saude/data/models/user_model.dart';
import 'package:minha_saude/data/models/medication_model.dart';
import 'package:minha_saude/data/models/appointment_model.dart';

class NotificationScheduler {
  // Simulação de agendamento (substituir por flutter_local_notifications)
  static void scheduleMedicationNotifications(
      Medication medication, UserProfile userProfile) {
    // Lógica de cálculo baseada nas preferências do usuário
    final leadTime = Duration(minutes: userProfile.notificationLeadTimeMinutes);
    final interval = Duration(minutes: userProfile.notificationIntervalMinutes);

    // Exemplo: Próxima dose (assumindo lógica simples de horário)
    // Na prática, você iteraria sobre os horários do medicamento
    // Para simplificação neste exemplo, vamos pegar "agora + 2 horas" como exemplo de horário do medicamento
    // ou pegar o horário real se disponível no modelo.
    // O modelo Medication tem 'time' (String HH:mm) e frequency.

    final now = DateTime.now();
    // Parse do horário do medicamento (ex: "08:00")
    // Se o medicamento tem múltiplos horários, iterar sobre eles.

    // Este é um stub para demonstrar a lógica solicitada:
    debugPrint('--- Agendando Notificações para ${medication.name} ---');
    debugPrint('Configuração Global:');
    debugPrint('  Antecedência (leadTime): ${leadTime.inMinutes} min');
    debugPrint('  Intervalo (interval): ${interval.inMinutes} min');
    debugPrint('  Horário de referência (now): $now');

    // Supondo que a próxima dose seja às 14:00 e agora são 10:00
    // O sistema deve agendar:
    // 13:30 (14:00 - 30min)
    // 13:35
    // 13:40
    // ...
    // 14:00

    // Código real de agendamento entraria aqui.
  }

  static void scheduleAppointmentNotifications(
      Appointment appointment, UserProfile userProfile) {
    debugPrint(
        '--- Agendando Notificações para Consulta: ${appointment.doctorName} ---');
    // Mesma lógica de leadTime e interval.
    final leadTime = Duration(minutes: userProfile.notificationLeadTimeMinutes);
    final interval = Duration(minutes: userProfile.notificationIntervalMinutes);
    debugPrint('  Antecedência: ${leadTime.inMinutes} min');
    debugPrint('  Intervalo: ${interval.inMinutes} min');
  }

  // Método para re-agendar todas as medicações
  static void rescheduleAllMedications(
      List<Medication> medications, UserProfile userProfile) {
    debugPrint(
        '--- Re-agendando TODAS as medicações com novas configurações ---');
    debugPrint(
        'Nova Antecedência: ${userProfile.notificationLeadTimeMinutes} min');
    debugPrint(
        'Novo Intervalo: ${userProfile.notificationIntervalMinutes} min');

    for (var medication in medications) {
      scheduleMedicationNotifications(medication, userProfile);
    }
  }

  // Método para re-agendar todas as consultas
  static void rescheduleAllAppointments(
      List<Appointment> appointments, UserProfile userProfile) {
    debugPrint(
        '--- Re-agendando TODAS as consultas com novas configurações ---');
    debugPrint(
        'Nova Antecedência: ${userProfile.notificationLeadTimeMinutes} min');
    debugPrint(
        'Novo Intervalo: ${userProfile.notificationIntervalMinutes} min');

    for (var appointment in appointments) {
      scheduleAppointmentNotifications(appointment, userProfile);
    }
  }

  // Método para re-agendar tudo quando as configurações mudam
  static void rescheduleAll(UserProfile userProfile) {
    debugPrint(
        '--- Re-agendando TODAS as notificações com novas configurações ---');
    debugPrint(
        'Nova Antecedência: ${userProfile.notificationLeadTimeMinutes} min');
    debugPrint(
        'Novo Intervalo: ${userProfile.notificationIntervalMinutes} min');
    // Buscar todos os medicamentos e consultas e chamar os métodos schedule...
  }
}
