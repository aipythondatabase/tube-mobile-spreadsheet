# HANDOFF - 2026-03-22

## 使用ツール
Claude Code (glm-4.7)

## 現在のタスクと進捗
- [x] プロジェクト初期セットアップ（make_projectスキル）
- [x] Firebaseプロジェクトセットアップ
- [x] Firebase Authentication実装（ログイン/登録）
- [x] 動画一覧表示画面
- [x] 動画視聴画面
- [x] YouTube Data API設定
- [x] スマホで動作確認（Expo SDK 55）

## 試したこと・結果
- ✅ Expo SDK 55で動作確認完了
- ✅ react-native-webview: `npx expo install react-native-webview` で解決
- ✅ Metroキャッシュエラー: `.expo`フォルダ削除で解決
- ❌ Airtable/スプレッドシート: Firebase単体採用（API制限の理由）

## 次のセッションで最初にやること
1. Firebase ConsoleでAuthenticationの「Email/Password」を有効化（まだの場合）
2. Firestore Databaseを作成
3. 動画投稿機能の実装開始

## 注意点・ブロッカー
- Firebase設定: Authentication → Sign-in method → Email/Password を有効化する必要あり
- YouTube Data APIキー: 既に取得済み（services/youtubeApi.jsに設定済み）
- Expo起動時: `npm start` → `s`キーでExpo Goモード

## プロジェクト情報
- リポジトリ: https://github.com/aipythondatabase/tube-mobile
- 技術スタック: React Native (Expo SDK 55) + Firebase + YouTube Data API
