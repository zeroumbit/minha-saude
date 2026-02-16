enum MedicationFrequency {
  daily,
  weekly,
  asNeeded,
}

class Medication {
  final String? id;
  final String userId;
  final String name;
  final String dosage;
  final String time;
  final String? instructions;
  final MedicationFrequency frequency;
  final bool isTaken;

  Medication({
    this.id,
    required this.userId,
    required this.name,
    required this.dosage,
    required this.time,
    this.instructions,
    this.frequency = MedicationFrequency.daily,
    this.isTaken = false,
  });

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      id: json['id'],
      userId: json['user_id'],
      name: json['name'],
      dosage: json['dosage'],
      time: json['time'],
      instructions: json['instructions'],
      frequency: MedicationFrequency.values.firstWhere(
        (e) => e.toString().split('.').last == (json['frequency'] ?? 'daily'),
        orElse: () => MedicationFrequency.daily,
      ),
      isTaken: json['is_taken'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'user_id': userId,
      'name': name,
      'dosage': dosage,
      'time': time,
      'instructions': instructions,
      'frequency': frequency.toString().split('.').last,
      'is_taken': isTaken,
    };
  }
}
