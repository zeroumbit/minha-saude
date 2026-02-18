import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import 'package:minha_saude/data/services/medication_provider.dart';
import 'package:minha_saude/data/services/profile_provider.dart';
import 'package:minha_saude/data/services/empresa_provider.dart';
import 'package:minha_saude/data/models/medication_model.dart';
import 'package:minha_saude/data/models/empresa_model.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MedicationProvider>().loadMedications();
      context.read<ProfileProvider>().loadProfile();
      context.read<EmpresaProvider>().loadEmpresas();
    });
  }

  Future<void> _signOut(BuildContext context) async {
    await Supabase.instance.client.auth.signOut();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Minha Saúde'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _signOut(context),
            tooltip: 'Sair',
          ),
        ],
      ),
      body: Consumer3<MedicationProvider, ProfileProvider, EmpresaProvider>(
        builder: (context, medProvider, profileProvider, empProvider, child) {
          if ((medProvider.isLoading && medProvider.medications.isEmpty) ||
              profileProvider.isLoading ||
              (empProvider.isLoading && empProvider.empresas.isEmpty)) {
            return const Center(child: CircularProgressIndicator());
          }

          final userName = profileProvider.profile?.firstName ?? 'Usuário';
          final takenMedications =
              medProvider.medications.where((m) => m.isTaken).toList();

          return RefreshIndicator(
            onRefresh: () async {
              await Future.wait([
                medProvider.loadMedications(),
                profileProvider.loadProfile(),
                empProvider.loadEmpresas(),
              ]);
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Olá, $userName!',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat("EEEE, d 'de' MMMM", 'pt_BR')
                        .format(DateTime.now()),
                    style: TextStyle(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (empProvider.empresas.isNotEmpty) ...[
                    _buildAdvertisersSection(context, empProvider.empresas),
                    const SizedBox(height: 32),
                  ],
                  Text(
                    'Aqui está o resumo do seu dia.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  const SizedBox(height: 24),
                  if (medProvider.medications.isNotEmpty)
                    _buildNextMedicationCard(
                        context, medProvider.medications.first)
                  else
                    _buildEmptyMedicationCard(context),
                  const SizedBox(height: 24),
                  Text(
                    'Acesso Rápido',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    alignment: WrapAlignment.center,
                    children: [
                      _buildQuickAccessButton(context, Icons.medication,
                          'Remédios', () => context.push('/medications')),
                      _buildQuickAccessButton(context, Icons.calendar_month,
                          'Consultas', () => context.push('/appointments')),
                      _buildQuickAccessButton(context, Icons.medical_services,
                          'Serviços', () => context.push('/services')),
                      _buildQuickAccessButton(context, Icons.person, 'Perfil',
                          () => context.push('/profile')),
                    ],
                  ),
                  if (takenMedications.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text(
                      'Atividades de Hoje',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    ...takenMedications
                        .take(3)
                        .map((med) => _buildRecentActivityItem(
                              context,
                              'Medicamento tomado',
                              med.name,
                              'Hoje às ${med.time.substring(0, 5)}',
                            )),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNextMedicationCard(BuildContext context, Medication medication) {
    return InkWell(
      onTap: () => context.push('/medication-detail', extra: medication),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color: Theme.of(context).primaryColor.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.access_time_filled,
                  color: Theme.of(context).primaryColor, size: 32),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Próximo Medicamento',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: Colors.grey[700],
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    medication.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  Text(
                    'Hoje às ${medication.time.substring(0, 5)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
            Checkbox(
              value: medication.isTaken,
              onChanged: (val) {
                context
                    .read<MedicationProvider>()
                    .toggleMedicationStatus(medication);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyMedicationCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        children: [
          Icon(Icons.medication_outlined, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 12),
          const Text(
            'Nenhum medicamento agendado',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            'Adicione seus remédios para não esquecer.',
            style: TextStyle(color: Colors.grey[600], fontSize: 13),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAccessButton(
      BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: Theme.of(context).primaryColor, size: 32),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }

  Widget _buildAdvertisersSection(
      BuildContext context, List<Empresa> empresas) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Anunciantes em Destaque',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 160,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: empresas.length,
            itemBuilder: (context, index) {
              final empresa = empresas[index];
              return _buildAdvertiserCard(context, empresa);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAdvertiserCard(BuildContext context, Empresa empresa) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 16),
      child: InkWell(
        onTap: () {
          // Future: Navigate to company details
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Empresa: ${empresa.nome}')),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: empresa.logoUrl != null
                    ? Image.network(
                        empresa.logoUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Icon(
                          Icons.business,
                          size: 40,
                          color: Theme.of(context).primaryColor,
                        ),
                      )
                    : Icon(
                        Icons.business,
                        size: 40,
                        color: Theme.of(context).primaryColor,
                      ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              empresa.nome,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivityItem(
      BuildContext context, String title, String subtitle, String time) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.5),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(subtitle,
                    style: TextStyle(color: Colors.grey[600], fontSize: 13)),
              ],
            ),
          ),
          Text(time, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
        ],
      ),
    );
  }
}
