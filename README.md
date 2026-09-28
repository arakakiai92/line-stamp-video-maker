# LINEスタンプ告知動画メーカー

ブラウザだけで動く静的サイトです（サーバー・ビルド・外部ライブラリ不要）。

## ファイル構成
- `index.html` … 画面
- `style.css` … デザイン
- `app.js` … 処理（画像読込・並べ替え・背景・プレビュー・動画生成・保存）
- `.nojekyll` … GitHub Pages用（Jekyll処理を無効化）

## GitHub Pagesで公開する手順
1. GitHubで新しいリポジトリを作成（例: `line-stamp-video-maker`）
2. このフォルダの中身をすべてリポジトリ直下にアップロード（`index.html`が直下にあること）
3. リポジトリの **Settings → Pages → Build and deployment**
   - Source: `Deploy from a branch`
   - Branch: `main` / `(root)` → Save
4. 数分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開されます（HTTPSで配信されます）

## 動作メモ
- MP4はブラウザのMediaRecorderで書き出します。最新のChrome/Edge/Safariで直接MP4、非対応の場合はWebM保存になります。
- 動画作成は実時間15秒かかります。その間はタブを開いたままにしてください。
- 背景色などの設定はブラウザのlocalStorageに保存されます（壁紙画像は保存されません）。
- 画像はすべてブラウザ内で処理され、外部へ送信されません。
