import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Inserir lógica de verificação ou carregar dependências se necessário
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        // O redirect do GoRouter será acionado quando o estado mudar
        // Ou podemos navegar explicitamente se já estivermos prontos
        // context.go('/login'); // Exemplo
        // A lógica de redirect já lida com supabase, então aqui é só estético
      }
    });
  }

  @override
  Widget build(BuildContext context) {
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
