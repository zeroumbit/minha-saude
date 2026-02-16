class Appointment {
  final String? id;
  final String userId;
  final String doctorName;
  final String specialty;
  final DateTime dateTime;
  final String location;
  final String? notes;

  Appointment({
    this.id,
    required this.userId,
    required this.doctorName,
    required this.specialty,
    required this.dateTime,
    required this.location,
    this.notes,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'],
      userId: json['user_id'],
      doctorName: json['doctor_name'],
      specialty: json['specialty'],
      dateTime: DateTime.parse(json['date_time']),
      location: json['location'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'user_id': userId,
      'doctor_name': doctorName,
      'specialty': specialty,
      'date_time': dateTime.toIso8601String(),
      'location': location,
      'notes': notes,
    };
  }
}
