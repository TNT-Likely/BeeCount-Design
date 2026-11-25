import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:beecount/data/db.dart';
import 'package:beecount/data/repositories/local/local_repository.dart';
import 'package:beecount/l10n/app_localizations.dart';
import 'package:beecount/pages/cloud/cloud_service_page.dart';
import 'package:beecount/pages/cloud/configuration/bindings/cloud_configuration_controls.dart';
import 'package:beecount/pages/transaction/transaction_detail_page.dart';
import 'package:beecount/providers.dart';
import 'package:beecount_business_ui/transaction_detail.dart';
import 'package:beecount_ui/beecount_ui.dart';
import 'package:drift/native.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_cloud_sync/flutter_cloud_sync.dart'
    show CloudServiceConfig;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<void> loadFonts(String family, List<String> paths) async {
  final loader = FontLoader(family);
  for (final path in paths) {
    final bytes = await File(path).readAsBytes();
    loader.addFont(Future.value(ByteData.sublistView(bytes)));
  }
  await loader.load();
}

Future<void> waitForPage(WidgetTester t, Finder expected) async {
  for (int i = 0; i < 100; i++) {
    await t
        .runAsync(() => Future<void>.delayed(const Duration(milliseconds: 10)));
    await t.pump(const Duration(milliseconds: 40));
    if (expected.evaluate().isNotEmpty) break;
  }
  expect(expected, findsWidgets);
  await t.pumpAndSettle();
  expect(t.takeException(), isNull);
}

Future<void> capture(WidgetTester t, GlobalKey key, File file) async {
  final boundary =
      key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
  await t.runAsync(() async {
    final image = await boundary.toImage(pixelRatio: 3);
    final data = (await image.toByteData(format: ui.ImageByteFormat.png))!;
    await file.parent.create(recursive: true);
    await file.writeAsBytes(
        data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes));
    image.dispose();
  });
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  final output = Platform.environment['BEECOUNT_CPP_CAPTURES']!;
  final uiFonts = Platform.environment['BEECOUNT_CPP_FONTS']!;
  final material = Platform.environment['BEECOUNT_MATERIAL_FONTS']!;
  final campaign = Platform.environment['BEECOUNT_CPP_SOURCE']!;
  final copy = jsonDecode(File('$campaign/copy.json').readAsStringSync())[
      'localizations'] as Map<String, dynamic>;
  setUpAll(() async {
    await loadFonts('CPP Latin', [
      for (final v in ['Regular', 'Medium', 'Bold']) '$material/Roboto-$v.ttf'
    ]);
    await loadFonts('CPP Hans', [
      for (final w in [400, 500, 700]) '$uiFonts/NotoSansSC-$w.ttf'
    ]);
    await loadFonts('CPP Hant', [
      for (final w in [400, 500, 700]) '$uiFonts/NotoSansTC-$w.ttf'
    ]);
    await loadFonts('MaterialIcons', ['$material/MaterialIcons-Regular.otf']);
  });
  for (final code in copy.keys) {
    testWidgets('Capture real BeeCount pages in $code', (t) async {
      final fixture = copy[code]['transaction'];
      final locale = {
        'en-US': const Locale('en', 'US'),
        'zh-Hans': const Locale('zh'),
        'zh-Hant': const Locale('zh', 'TW')
      }[code]!;
      final family = {
        'en-US': 'CPP Latin',
        'zh-Hans': 'CPP Hans',
        'zh-Hant': 'CPP Hant'
      }[code]!;
      SharedPreferences.setMockInitialValues(
          {'auto_sync': false, 'multi_device_sync': false});
      t.view.physicalSize = const Size(1206, 2622);
      t.view.devicePixelRatio = 3;
      addTearDown(t.view.resetPhysicalSize);
      addTearDown(t.view.resetDevicePixelRatio);
      debugDefaultTargetPlatformOverride = TargetPlatform.iOS;
      final db = BeeDatabase.forTesting(NativeDatabase.memory());
      final repository = LocalRepository(db);
      try {
        await t.runAsync(() async {
          await db.customStatement(
              'INSERT INTO ledgers(id,name,currency) VALUES(1,?,?)',
              [fixture['ledger'], fixture['currency']]);
          await db.customStatement(
              'INSERT INTO accounts(id,ledger_id,name,currency,type) VALUES(1,1,?,?,?)',
              [fixture['wallet'], fixture['currency'], 'cash']);
          await db.customStatement(
              "INSERT INTO categories(id,name,kind,level,icon) VALUES(1,?,'expense',1,'coffee')",
              [fixture['category']]);
          await db.customStatement(
              "INSERT INTO tags(id,name,color) VALUES(1,?,'#be861a')",
              [fixture['tag']]);
          await db.customStatement(
              "INSERT INTO transactions(id,ledger_id,type,amount,category_id,account_id,happened_at,note,sync_id) VALUES(1,1,'expense',?,1,1,?,?,?)",
              [
                fixture['amount'],
                DateTime(2026, 11, 8, 9, 41).millisecondsSinceEpoch ~/ 1000,
                fixture['note'],
                'store-coffee'
              ]);
          await db.customStatement(
              'INSERT INTO transaction_tags(transaction_id,tag_id) VALUES(1,1)');
        });
        final key = GlobalKey();
        final theme = beeTheme();
        Widget host(Widget page) => ProviderScope(
              overrides: [
                databaseProvider.overrideWithValue(db),
                repositoryProvider.overrideWithValue(repository),
                currentLedgerIdProvider.overrideWith((ref) => 1),
                currencyPickerRatesProvider
                    .overrideWith((ref, base) async => <String, double>{}),
                activeCloudConfigProvider.overrideWith(
                    (ref) async => CloudServiceConfig.localStorage()),
                beecountCloudConfigProvider.overrideWith((ref) async => null),
                supabaseConfigProvider.overrideWith((ref) async => null),
                webdavConfigProvider.overrideWith((ref) async => null),
                s3ConfigProvider.overrideWith((ref) async => null),
                cloudConfigurationShowICloudProvider
                    .overrideWith((ref) => true),
              ],
              child: RepaintBoundary(
                  key: key,
                  child: MaterialApp(
                    debugShowCheckedModeBanner: false,
                    locale: locale,
                    theme: theme.copyWith(
                        platform: TargetPlatform.iOS,
                        textTheme: theme.textTheme.apply(fontFamily: family),
                        primaryTextTheme:
                            theme.primaryTextTheme.apply(fontFamily: family)),
                    localizationsDelegates:
                        AppLocalizations.localizationsDelegates,
                    supportedLocales: AppLocalizations.supportedLocales,
                    home: page,
                  )),
            );
        await t.pumpWidget(
            host(const TransactionDetailPage(transactionId: 1, ledgerId: 1)));
        await waitForPage(t, find.byType(BeeTransactionDetail));
        expect(find.text(fixture['note'] as String), findsWidgets);
        await capture(t, key, File('$output/$code/transaction.png'));
        await t.pumpWidget(host(const CloudServicePage()));
        final strings =
            AppLocalizations.of(t.element(find.byType(CloudServicePage)));
        await waitForPage(t, find.text(strings.cloudLocalStorageTitle));
        await t.tap(find.text(strings.cloudTabBackup));
        await waitForPage(t, find.text(strings.cloudCustomWebdavTitle));
        await capture(t, key, File('$output/$code/backup.png'));
        await t.tap(find.text(strings.cloudTabCloudSync));
        await waitForPage(t, find.text(strings.cloudBeeCountCloudTitle));
        await t.tap(find.text(strings.cloudBeeCountCloudTitle));
        await waitForPage(t, find.text(strings.cloudBeeCountCloudUrlLabel));
        await capture(t, key, File('$output/$code/server.png'));
      } finally {
        await t.pumpWidget(const SizedBox.shrink());
        await t.pump(const Duration(seconds: 3));
        await t.runAsync(db.close);
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}
