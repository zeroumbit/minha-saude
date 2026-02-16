import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    print('DEBUG: SplashScreen initState');
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        final session = Supabase.instance.client.auth.currentSession;
        print('DEBUG: SplashScreen timeout - session: ${session != null}');
        if (session != null) {
          context.go('/home');
        } else {
          context.go('/login');
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    print('DEBUG: SplashScreen building');
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 20),
            Text('Carregando Minha Saúde...'),
          ],
        ),
      ),
    );
  }
}
