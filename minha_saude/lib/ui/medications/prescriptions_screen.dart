import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class Prescription {
  final String? id;
  final String title;
  final String? doctorName;
  final DateTime? issueDate;
  final String? imageUrl;
  final String? notes;

  Prescription({this.id, required this.title, this.doctorName, this.issueDate, this.imageUrl, this.notes});

  factory Prescription.fromJson(Map<String, dynamic> json) {
    return Prescription(
      id: json['id'],
      title: json['title'],
      doctorName: json['doctor_name'],
      issueDate: json['issue_date'] != null ? DateTime.parse(json['issue_date']) : null,
      imageUrl: json['image_url'],
      notes: json['notes'],
    );
  }
}

class PrescriptionsScreen extends StatelessWidget {
  const PrescriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Minhas Receitas')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long, size: 80, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('Nenhuma receita cadastrada', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Guarde fotos das suas receitas aqui.', textAlign: TextAlign.center),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: const Text('Nova Receita'),
        icon: const Icon(Icons.add_a_photo),
      ),
    );
  }
}
