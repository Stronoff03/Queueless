import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Application Bootstrap', () {
    testWidgets('Standalone MaterialApp widget renders without errors', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(child: Text('Queueless')),
          ),
        ),
      );
      expect(find.byType(MaterialApp), findsOneWidget);
      expect(find.text('Queueless'), findsOneWidget);
    });
  });
}

