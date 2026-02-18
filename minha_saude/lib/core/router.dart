import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:minha_saude/ui/home/home_screen.dart';
import 'package:minha_saude/ui/auth/login_screen.dart';
import 'package:minha_saude/ui/splash/splash_screen.dart';
import 'package:minha_saude/ui/medications/medication_list_screen.dart';
import 'package:minha_saude/ui/medications/medication_detail_screen.dart';
import 'package:minha_saude/ui/medications/add_medication_screen.dart';
import 'package:minha_saude/ui/medications/prescriptions_screen.dart';
import 'package:minha_saude/ui/medications/add_prescription_screen.dart';
import 'package:minha_saude/ui/appointments/appointments_screen.dart';
import 'package:minha_saude/ui/appointments/add_appointment_screen.dart';
import 'package:minha_saude/ui/profile/profile_screen.dart';
import 'package:minha_saude/ui/profile/care_circle_screen.dart';
import 'package:minha_saude/ui/profile/notification_settings_screen.dart';
import 'package:minha_saude/ui/shell/main_shell.dart';
import 'package:minha_saude/data/models/medication_model.dart';
import 'package:minha_saude/data/models/appointment_model.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final GoRouter router = GoRouter(
  initialLocation: '/',
  refreshListenable: _SupabaseAuthStateNotifier(),
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),

    // Shell Route with bottom navigation bar
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return MainShell(navigationShell: navigationShell);
      },
      branches: [
        // Branch 0: Home
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/home',
              builder: (context, state) => const HomeScreen(),
            ),
          ],
        ),
        // Branch 1: Remédios
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/medications',
              builder: (context, state) => const MedicationListScreen(),
              routes: [
                GoRoute(
                  path: 'add',
                  builder: (context, state) => AddMedicationScreen(
                      medication: state.extra as Medication?),
                ),
              ],
            ),
          ],
        ),
        // Branch 2: Agenda
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/appointments',
              builder: (context, state) => const AppointmentsScreen(),
              routes: [
                GoRoute(
                  path: 'add',
                  builder: (context, state) => AddAppointmentScreen(
                      appointment: state.extra as Appointment?),
                ),
              ],
            ),
          ],
        ),
        // Branch 3: Receitas
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/prescriptions',
              builder: (context, state) => const PrescriptionsScreen(),
              routes: [
                GoRoute(
                  path: 'add',
                  builder: (context, state) => AddPrescriptionScreen(
                      prescription: state.extra as Map<String, dynamic>?),
                ),
              ],
            ),
          ],
        ),
        // Branch 4: Perfil
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen(),
            ),
          ],
        ),
      ],
    ),

    // Routes outside the shell (no bottom nav)
    GoRoute(
      path: '/add-medication',
      builder: (context, state) =>
          AddMedicationScreen(medication: state.extra as Medication?),
    ),
    GoRoute(
      path: '/medication-detail',
      builder: (context, state) {
        final medication = state.extra as Medication;
        return MedicationDetailScreen(medication: medication);
      },
    ),
    GoRoute(
      path: '/add-appointment',
      builder: (context, state) => const AddAppointmentScreen(),
    ),
    GoRoute(
      path: '/add-prescription',
      builder: (context, state) => const AddPrescriptionScreen(),
    ),
    GoRoute(
      path: '/care-circle',
      builder: (context, state) => const CareCircleScreen(),
    ),
    GoRoute(
      path: '/notification-settings',
      builder: (context, state) => const NotificationSettingsScreen(),
    ),
  ],
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    final isLoggingIn = state.uri.toString() == '/login';
    final isSplash = state.uri.toString() == '/';

    // Se não estiver logado
    if (session == null) {
      if (isSplash || isLoggingIn) return null;
      return '/login';
    }

    // Se estiver logado
    if (isLoggingIn || isSplash) {
      return '/home';
    }

    return null;
  },
);

class _SupabaseAuthStateNotifier extends ChangeNotifier {
  _SupabaseAuthStateNotifier() {
    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      notifyListeners();
    });
  }
}
