import 'package:flutter/material.dart';
import 'package:minha_saude/data/services/care_circle_provider.dart';
import 'package:provider/provider.dart';

class CareCircleScreen extends StatefulWidget {
  const CareCircleScreen({super.key});

  @override
  State<CareCircleScreen> createState() => _CareCircleScreenState();
}

class _CareCircleScreenState extends State<CareCircleScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CareCircleProvider>().loadMembers();
    });
  }

  void _showInviteDialog() {
    final emailController = TextEditingController();
    final nameController = TextEditingController();
    final relationshipController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Convidar Pessoa'),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 8),
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nome',
                    hintText: 'Nome completo',
                  ),
                  validator: (v) => v!.isEmpty ? 'Campo obrigatório' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: emailController,
                  decoration: const InputDecoration(
                    labelText: 'E-mail',
                    hintText: 'exemplo@email.com',
                  ),
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) =>
                      v!.isEmpty || !v.contains('@') ? 'E-mail inválido' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: relationshipController,
                  decoration: const InputDecoration(
                    labelText: 'Parentesco/Relação',
                    hintText: 'Ex: Esposa, Médico, Filho',
                  ),
                  validator: (v) => v!.isEmpty ? 'Campo obrigatório' : null,
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              if (formKey.currentState!.validate()) {
                context.read<CareCircleProvider>().inviteMember(
                      email: emailController.text.trim(),
                      name: nameController.text.trim(),
                      relationship: relationshipController.text.trim(),
                    );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Convite enviado!')),
                );
              }
            },
            child: const Text('Enviar Convite'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Círculo de Cuidado')),
      body: Consumer<CareCircleProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.members.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.members.isEmpty) {
            return _buildEmptyState();
          }

          return Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: Color(0xFF0A0AC2)),
                    SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        'Pessoas neste círculo podem visualizar suas informações de saúde.',
                        style: TextStyle(fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: provider.members.length,
                  itemBuilder: (context, index) {
                    final member = provider.members[index];
                    return ListTile(
                      leading: CircleAvatar(
                        child: Text(member['member_name'][0].toUpperCase()),
                      ),
                      title: Text(member['member_name']),
                      subtitle: Text(
                          '${member['relationship']} • ${member['status']}'),
                      trailing: IconButton(
                        icon: const Icon(Icons.remove_circle_outline,
                            color: Colors.red),
                        onPressed: () {
                          provider.removeMember(member['id']);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showInviteDialog,
        icon: const Icon(Icons.person_add),
        label: const Text('Convidar'),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            margin: const EdgeInsets.only(bottom: 32),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: Color(0xFF0A0AC2)),
                SizedBox(width: 16),
                Expanded(
                  child: Text(
                    'Compartilhe seu histórico com familiares ou profissionais de saúde.',
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          Icon(Icons.people_outline, size: 100, color: Colors.grey[200]),
          const SizedBox(height: 24),
          const Text(
            'Ainda não há ninguém no seu círculo',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}
