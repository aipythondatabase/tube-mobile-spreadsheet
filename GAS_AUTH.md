# tube-mobile 認証用 (Google Apps Script)

このコードを Google スプレッドシートの「Apps Script」に貼り付けてデプロイしてください。

## 1. スプレッドシートの準備
1. 新規スプレッドシートを作成し、シート名を **`Users`** にします。
2. 1行目に以下のヘッダーを入力します。
   - A1: `email`
   - B1: `password`
   - C1: `createdAt`

## 2. GAS コード (auth_api.js)

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Users';

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action; // 'login' or 'register'
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    if (action === 'register') {
      // 重複チェック
      const exists = data.some(row => row[0] === params.email);
      if (exists) {
        return createResponse({ status: 'error', code: 'auth/email-already-in-use' });
      }
      // 登録
      sheet.appendRow([params.email, params.password, new Date()]);
      return createResponse({ status: 'success', user: { email: params.email } });

    } else if (action === 'login') {
      // ログインチェック
      const userRow = data.find(row => row[0] === params.email && String(row[1]) === String(params.password));
      if (userRow) {
        return createResponse({ status: 'success', user: { email: params.email } });
      } else {
        return createResponse({ status: 'error', code: 'auth/invalid-credentials' });
      }
    }

    return createResponse({ status: 'error', message: 'Invalid action' });
  } catch (err) {
    return createResponse({ status: 'error', message: err.toString() });
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. デプロイ
- 「ウェブアプリ」としてデプロイ。
- アクセス権限を **「全員 (Anyone)」** に設定。
