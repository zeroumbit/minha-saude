import 'package:flutter/material.dart';

class CareCircleScreen extends StatelessWidget {
  const CareCircleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Círculo de Cuidado')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Color(0xFF0A0AC2)),
                  const SizedBox(width: 16),
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
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.person_add_alt_1),
              label: const Text('Convidar Pessoa'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 56),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
