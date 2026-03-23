# PLAN - やりたいこと
`tube-mobile` プロジェクトの Firebase 依存（Auth, DB, Storage）をすべて Google スプレッドシート（GAS 経由）に置き換える。

## 目標
- Firebase Auth -> スプレッドシートによる独自のユーザー管理（ID/PW）
- Firestore -> スプレッドシートをデータベースとして利用
- Firebase Storage -> 代替案（必要に応じて Google Drive 等）

## 作業ステップ
1.  **現状調査**: Firebase が使われている箇所（screens/ components/ services/）をすべて特定。
2.  **GAS API 設計**: ユーザー登録・ログイン・データ保存のための GAS エンドポイントを作成。
3.  **アプリ側リファクタリング**: Firebase SDK を削除し、GAS API との通信に差し替える。
4.  **動作検証**: ログインからデータ取得までが正常に行えるか確認。
