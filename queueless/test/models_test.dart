import 'package:flutter_test/flutter_test.dart';
import 'package:queueless/models/notification_model.dart';
import 'package:queueless/models/business_model.dart';
import 'package:queueless/models/user_model.dart';
import 'package:queueless/models/appointment_model.dart';
import 'package:queueless/models/product_model.dart';
import 'package:queueless/core/utils/validators.dart';

void main() {

  group('Input Validators', () {
    test('rejects empty email and invalid format, accepts valid email', () {
      expect(Validators.validateEmail(''), 'Email is required');
      expect(Validators.validateEmail('invalid'), 'Please enter a valid email');
      expect(Validators.validateEmail('test@test.com'), null);
    });

    test('rejects empty password and short password, accepts 6+ characters', () {
      expect(Validators.validatePassword(''), 'Password is required');
      expect(Validators.validatePassword('123'), 'Password must be at least 6 characters');
      expect(Validators.validatePassword('123456'), null);
    });

    test('rejects empty name and single character, accepts valid name', () {
      expect(Validators.validateName(''), 'Name is required');
      expect(Validators.validateName('A'), 'Name must be at least 2 characters');
      expect(Validators.validateName('Test'), null);
    });

    test('rejects empty phone and short number, accepts 10-digit number', () {
      expect(Validators.validatePhone(''), 'Phone number is required');
      expect(Validators.validatePhone('123'), 'Please enter a valid phone number');
      expect(Validators.validatePhone('1234567890'), null);
    });
  });

  group('Data Model Serialization', () {
    test('NotificationModel deserializes correctly from JSON', () {
      final json = {
        'id': '1',
        'recipient_id': 'u1',
        'title': 'Queue Update',
        'body': 'Your turn is coming up.',
        'type': 'queue_update',
        'created_at': '2026-05-02T12:00:00Z',
      };
      final model = NotificationModel.fromJson(json);
      expect(model.id, '1');
      expect(model.title, 'Queue Update');
      expect(model.type, 'queue_update');
    });

    test('UserModel deserializes correctly and resolves role enum', () {
      final map = {
        'id': 'u1',
        'name': 'Jane Doe',
        'email': 'jane@example.com',
        'phone': '5551234567',
        'role': 'customer',
      };
      final model = UserModel.fromMap(map);
      expect(model.id, 'u1');
      expect(model.name, 'Jane Doe');
      expect(model.role, UserRole.customer);
    });

    test('BusinessModel deserializes correctly and returns display name and icon', () {
      final json = {
        'id': 'b1',
        'owner_id': 'o1',
        'name': 'Classic Cuts',
        'category': 'barber',
        'service_type': 'queue',
      };
      final model = BusinessModel.fromJson(json);
      expect(model.id, 'b1');
      expect(model.categoryDisplayName, 'Barber');
      expect(model.categoryIcon, '💈');
    });

    test('AppointmentModel deserializes correctly from JSON', () {
      final json = {
        'id': 'a1',
        'business_id': 'b1',
        'customer_id': 'c1',
        'service_id': 's1',
        'service_name': 'Haircut',
        'status': 'confirmed',
        'date_time': '2026-05-02T12:00:00Z',
      };
      final model = AppointmentModel.fromJson(json);
      expect(model.id, 'a1');
      expect(model.serviceName, 'Haircut');
      expect(model.status.name, 'confirmed');
    });

    test('ProductModel deserializes correctly and preserves price value', () {
      final json = {
        'id': 'p1',
        'business_id': 'b1',
        'name': 'Espresso',
        'description': 'A strong coffee shot',
        'price': 10.5,
        'is_available': 1,
        'is_off_sale': 0,
      };
      final model = ProductModel.fromJson(json);
      expect(model.id, 'p1');
      expect(model.name, 'Espresso');
      expect(model.price, 10.5);
    });
  });

}
