import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:beecount_business_ui/beecount_business_ui.dart';
import 'package:beecount_ui/beecount_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> loadFamily(String family, Iterable<String> files) async {
  final loader = FontLoader(family);
  for (final path in files) {
    final data = await File(path).readAsBytes();
    loader.addFont(Future.value(ByteData.sublistView(data)));
  }
  await loader.load();
}

Directory materialFonts() {
  var root = File(Platform.resolvedExecutable).parent;
  while (root.parent.path != root.path) {
    final fonts = Directory('${root.path}/material_fonts');
    if (fonts.existsSync()) return fonts;
    root = root.parent;
  }
  throw StateError('Flutter SDK material_fonts not found.');
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  final source = Platform.environment['BEECOUNT_CREATIVE_SOURCE'];
  if (source == null)
    throw StateError('Set BEECOUNT_CREATIVE_SOURCE to this source directory.');
  final output =
      Directory(Platform.environment['BEECOUNT_ROW_OUTPUT'] ?? '$source/rows');
  final locales = jsonDecode(File('$source/locales.json').readAsStringSync())
      as Map<String, dynamic>;
  setUpAll(() async {
    output.createSync(recursive: true);
    final fonts = materialFonts();
    await loadFamily('StoreUi', [
      for (final w in ['Regular', 'Medium', 'Bold'])
        '${fonts.path}/Roboto-$w.ttf'
    ]);
    for (final script in ['sc', 'tc']) {
      await loadFamily('StoreUi-$script', [
        for (final w in [400, 500])
          '$source/fonts/NotoSans${script.toUpperCase()}-$w.ttf'
      ]);
    }
  });
  for (final entry in locales.entries) {
    final locale = entry.key;
    final item = Map<String, String>.from(entry.value['transaction'] as Map);
    final script = locale == 'zh-Hant' ? 'tc' : 'sc';
    testWidgets('Capture BeeCount transaction row for $locale', (tester) async {
      final capture = GlobalKey();
      final base = beeTheme(brightness: Brightness.light);
      await tester.pumpWidget(MaterialApp(
        theme: base.copyWith(
            textTheme: base.textTheme.apply(
                fontFamily: 'StoreUi',
                fontFamilyFallback: ['StoreUi-$script'])),
        home: Scaffold(
            body: Center(
                child: SizedBox(
                    width: 283,
                    child: RepaintBoundary(
                      key: capture,
                      child: ColoredBox(
                          color: Colors.white,
                          child: BeeTransactionRow(
                            horizontalInset: 12,
                            title: item['title']!,
                            amount: item['amount']!,
                            icon: Builder(
                                builder: (context) => Container(
                                    width: 34,
                                    height: 34,
                                    decoration: BoxDecoration(
                                        color: BeeCardTheme.of(context).soft,
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                    child: const Center(
                                        child:
                                            BeeLineIcon('Coffee', size: 19)))),
                            accountName: item['account'],
                            tags: [
                              BeeTagData('daily', item['tag']!,
                                  const Color(0xffbc8820))
                            ],
                            onTap: () {},
                            onCategoryTap: () {},
                          )),
                    )))),
      ));
      await tester.pumpAndSettle();
      await tester.runAsync(
          () => Future<void>.delayed(const Duration(milliseconds: 120)));
      await tester.pump();
      expect(tester.takeException(), isNull);
      final boundary =
          capture.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      await tester.runAsync(() async {
        final image = await boundary.toImage(pixelRatio: 8);
        final bytes = (await image.toByteData(format: ui.ImageByteFormat.png))!;
        await File('${output.path}/$locale.png')
            .writeAsBytes(bytes.buffer.asUint8List());
        image.dispose();
      });
    });
  }
}
