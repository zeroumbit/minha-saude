import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _stateController = TextEditingController();
  final _cityController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _isSignUpMode = false;
  bool _obscurePassword = true;

  Future<void> _signIn() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError('Por favor, preencha todos os campos.');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
      debugPrint('Login sucesso: ${response.user?.email}');
    } on AuthException catch (e) {
      debugPrint('AuthException: ${e.message}');
      _showError('Erro ao entrar: ${e.message}');
    } catch (e, stackTrace) {
      debugPrint('Erro inesperado: $e');
      debugPrint('Stack: $stackTrace');
      _showError('Erro ao conectar com servidor. Verifique sua internet.');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _processAuth() async {
    if (_isSignUpMode) {
      await _signUp();
    } else {
      await _signIn();
    }
  }

  Future<void> _signUp() async {
    if (_emailController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _firstNameController.text.isEmpty ||
        _lastNameController.text.isEmpty ||
        _stateController.text.isEmpty ||
        _cityController.text.isEmpty) {
      _showError('Por favor, preencha todos os campos.');
      return;
    }

    if (_passwordController.text.length < 6) {
      _showError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await Supabase.instance.client.auth.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
        data: {
          'first_name': _firstNameController.text.trim(),
          'last_name': _lastNameController.text.trim(),
          'state': _stateController.text.trim(),
          'city': _cityController.text.trim(),
        },
      );

      debugPrint('Signup response: ${response.user?.email}');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text(
                  'Cadastro realizado! Verifique seu e-mail para confirmar.')),
        );
        setState(() {
          _isSignUpMode = false;
        });
      }
    } on AuthException catch (e) {
      debugPrint('AuthException signup: ${e.message}');
      _showError('Erro ao cadastrar: ${e.message}');
    } catch (e, stackTrace) {
      debugPrint('Erro inesperado signup: $e');
      debugPrint('Stack: $stackTrace');
      _showError('Erro ao conectar com servidor. Verifique sua internet.');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _stateController.dispose();
    _cityController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(
                Icons.health_and_safety,
                size: 80,
                color: Color(0xFF0A0AC2),
              ),
              const SizedBox(height: 16),
              const Text(
                'Minha Saúde',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0A0AC2),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _isSignUpMode ? 'Crie sua conta agora' : 'Bem-vindo de volta',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 48),
              if (_isSignUpMode) ...[
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _firstNameController,
                        decoration: const InputDecoration(
                          labelText: 'Nome',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _lastNameController,
                        decoration: const InputDecoration(
                          labelText: 'Sobrenome',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _cityController,
                        decoration: const InputDecoration(
                          labelText: 'Cidade',
                          prefixIcon: Icon(Icons.location_city_outlined),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _stateController,
                        decoration: const InputDecoration(
                          labelText: 'Estado',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'E-mail',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Senha',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword
                        ? Icons.visibility_off
                        : Icons.visibility),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                ),
                obscureText: _obscurePassword,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _processAuth,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: const Color(0xFF0A0AC2),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : Text(_isSignUpMode ? 'Criar Conta' : 'Entrar'),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  setState(() {
                    _isSignUpMode = !_isSignUpMode;
                  });
                },
                child: Text(_isSignUpMode
                    ? 'Já tem uma conta? Entre aqui'
                    : 'Ainda não tem conta? Cadastre-se'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
