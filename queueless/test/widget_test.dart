import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:queueless/app.dart';

void main() {
  group('Application Bootstrap', () {
    testWidgets('App launches and renders the root MaterialApp widget', (WidgetTester tester) async {
      await tester.pumpWidget(const QueueLessApp());
      expect(find.byType(MaterialApp), findsOneWidget);
    });
  });
}
