import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';
import 'package:minha_saude/core/router.dart';
import 'package:minha_saude/ui/theme/app_theme.dart';
import 'package:minha_saude/data/services/medication_provider.dart';
import 'package:minha_saude/data/services/appointment_provider.dart';
import 'package:minha_saude/data/services/profile_provider.dart';
import 'package:minha_saude/data/services/prescription_provider.dart';
import 'package:minha_saude/data/services/care_circle_provider.dart';

import 'package:intl/date_symbol_data_local.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await initializeDateFormatting('pt_BR', null);

  await Supabase.initialize(
    url: 'https://kijqhifkreohdqetcnyl.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpanFoaWZrcmVvaGRxZXRjbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE0OTksImV4cCI6MjA4Njc2NzQ5OX0.F2JjKFz9hK4i4mXDb-VUTiATC9gub-KhNlrRAagcI-I',
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => MedicationProvider()),
        ChangeNotifierProvider(create: (_) => AppointmentProvider()),
        ChangeNotifierProvider(create: (_) => ProfileProvider()),
        ChangeNotifierProvider(create: (_) => PrescriptionProvider()),
        ChangeNotifierProvider(create: (_) => CareCircleProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Minha Saúde',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('pt', 'BR'),
      ],
    );
  }
}
