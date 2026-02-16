class UserProfile {
  final String id;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? state;
  final String? city;
  final String? photoUrl;

  UserProfile({
    required this.id,
    this.email,
    this.firstName,
    this.lastName,
    this.state,
    this.city,
    this.photoUrl,
  });

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      email: json['email'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      state: json['state'],
      city: json['city'],
      photoUrl: json['photo_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'state': state,
      'city': city,
      'photo_url': photoUrl,
    };
  }
}
