import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';

class PrescriptionService {
  final _supabase = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> getPrescriptions() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return [];

    return await _supabase
        .from('prescriptions')
        .select()
        .eq('user_id', user.id)
        .order('created_at', ascending: false);
  }

  Future<void> addPrescription({
    required String title,
    String? doctorName,
    DateTime? issueDate,
    XFile? image, // XFile works for both Web and Mobile
    String? notes,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    String? imageUrl;

    if (image != null) {
      final fileExtension = image.path.split('.').last;
      final fileName =
          '${DateTime.now().millisecondsSinceEpoch}.$fileExtension';
      final filePath = '${user.id}/$fileName';

      // Upload to 'prescriptions' bucket
      // Note: Bucket must exist! I'll assume it exists or need to be created.
      try {
        final bytes = await image.readAsBytes();
        await _supabase.storage.from('prescriptions').uploadBinary(
              filePath,
              bytes,
              fileOptions:
                  const FileOptions(cacheControl: '3600', upsert: false),
            );

        imageUrl =
            _supabase.storage.from('prescriptions').getPublicUrl(filePath);
      } catch (e) {
        debugPrint('Error uploading image: $e');
        // Continue without image or rethrow depending on requirement
      }
    }

    await _supabase.from('prescriptions').insert({
      'user_id': user.id,
      'title': title,
      'doctor_name': doctorName,
      'issue_date': issueDate?.toIso8601String(),
      'image_url': imageUrl,
      'notes': notes,
    });
  }

  Future<void> deletePrescription(String id, String? imageUrl) async {
    await _supabase.from('prescriptions').delete().eq('id', id);

    if (imageUrl != null) {
      // Logic to delete from storage if needed
      try {
        final uri = Uri.parse(imageUrl);
        final path = uri.pathSegments
            .sublist(uri.pathSegments.indexOf('prescriptions') + 1)
            .join('/');
        await _supabase.storage.from('prescriptions').remove([path]);
      } catch (e) {
        debugPrint('Error deleting image from storage: $e');
      }
    }
  }
}
