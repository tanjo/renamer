# renamer

特定のディレクトリにあるファイル名の一部をすべて置換するスクリプトです。

## インストール

このスクリプトを使用するには、Node.js と npm が必要です。
Node.js のインストール方法は、[Node.js 公式サイト](https://nodejs.org/)を参照してください。

グローバルにインストールする場合は、以下のコマンドを実行してください。

```sh
npm install -g @tanjo/renamer
```

または、ローカルで開発する場合は、以下の手順でセットアップできます。

このリポジトリをクローンし、依存パッケージをインストールした後、ローカルでリンクして利用できます。

```sh
git clone https://github.com/tanjo/renamer.git
cd renamer
npm install
npm link
```

## 使用方法

```sh
renamer [options] <directory> [pattern] [replacement]
```

特定のディレクトリにあるファイル名の一部をすべて置換するスクリプト

```sh
Arguments:
  directory                対象のディレクトリパス
  pattern                  置換するパターン（正規表現）
  replacement              置換後の文字列

Options:
  -V, --version            output the version number
  -c, --config <path>      設定ファイルのパス
  -d, --debug              デバッグモード（実際のリネームは行わない）
  -r, --recursive          サブディレクトリも再帰的に処理する
  -k, --kansuji-to-arabic  漢数字をアラビア数字に変換する
  -K, --keep-kansuji       漢数字を残す
  -h, --help               display help for command
```

## config.json

```json
{
  "pattern": "oldPattern",
  "replacement": "newPattern",
  "debug": false,
  "recursive": false,
  "kansujiToArabic": false,
  "keepKansuji": false
}
```

## 実行結果

<pre>
> renamer -d '/Users/tanjo/project/tanjoin/DISK' 'ふが' 'んひぃ' -r
+ <span style="color:skyblue">対象ディレクトリ:</span> /Users/tanjo/project/tanjoin/DISK 
| <span style="color:skyblue">置換パターン:</span> /ふが/ 
| <span style="color:skyblue">置換後の文字列:</span> んひぃ 
| <span style="color:yellow">デバッグモード:</span> 有効 
| <span style="color:yellow">再帰処理:</span> 有効 
| <span style="color:yellow">漢数字をアラビア数字に変換:</span> 無効 
| <span style="color:yellow">漢数字を残す:</span> 無効 
| <span style="color:yellow">ファイルの文字数を確認:</span> 無効
| <span style="color:magenta">ディレクトリ内のファイル数:</span> 0 
| <span style="color:green">ディレクトリ内のサブディレクトリ数:</span> 1 
+-+
  + <span style="color:skyblue">対象ディレクトリ:</span> /Users/tanjo/project/tanjoin/DISK/SUB  
  | <span style="color:skyblue">置換パターン:</span> /ふが/ 
  | <span style="color:skyblue">置換後の文字列:</span> んひぃ 
  | <span style="color:yellow">デバッグモード:</span> 有効 
  | <span style="color:yellow">再帰処理:</span> 有効 
  | <span style="color:yellow">漢数字をアラビア数字に変換:</span> 無効 
  | <span style="color:yellow">漢数字を残す:</span> 無効 
  | <span style="color:yellow">ファイルの文字数を確認:</span> 無効
  | <span style="color:magenta">ディレクトリ内のファイル数:</span> 1 
  | <span style="color:green">ディレクトリ内のサブディレクトリ数:</span> 0 
  +-+
    <span style="color:green">リネーム成功:</span> ほげ<span style="color:white;background-color:red">ふが</span>ぴよ.mp4 
               <span style="color:green">-></span> ほげ<span style="color:green">んひぃ</span>ぴよ.mp4
</pre>

### デバッグモード

<pre>
> renamer -d '/Users/tanjo/project/tanjoin/DISK' 'ふが' 'んひぃ' -r
+ <span style="color:skyblue">対象ディレクトリ:</span> /Users/tanjo/project/tanjoin/DISK 
| <span style="color:skyblue">置換パターン:</span> /ふが/ 
| <span style="color:skyblue">置換後の文字列:</span> んひぃ 
| <span style="color:yellow">デバッグモード:</span> 有効 
| <span style="color:yellow">再帰処理:</span> 有効 
| <span style="color:yellow">漢数字をアラビア数字に変換:</span> 無効 
| <span style="color:yellow">漢数字を残す:</span> 無効 
| <span style="color:yellow">ファイルの文字数を確認:</span> 無効
| <span style="color:magenta">ディレクトリ内のファイル数:</span> 0 
| <span style="color:green">ディレクトリ内のサブディレクトリ数:</span> 1 
+-+
  + <span style="color:skyblue">対象ディレクトリ:</span> /Users/tanjo/project/tanjoin/DISK/SUB  
  | <span style="color:skyblue">置換パターン:</span> /ふが/ 
  | <span style="color:skyblue">置換後の文字列:</span> んひぃ 
  | <span style="color:yellow">デバッグモード:</span> 有効 
  | <span style="color:yellow">再帰処理:</span> 有効 
  | <span style="color:yellow">漢数字をアラビア数字に変換:</span> 無効 
  | <span style="color:yellow">漢数字を残す:</span> 無効 
  | <span style="color:yellow">ファイルの文字数を確認:</span> 無効
  | <span style="color:magenta">ディレクトリ内のファイル数:</span> 1 
  | <span style="color:green">ディレクトリ内のサブディレクトリ数:</span> 0 
  +-+
    <span style="color:skyblue">リネーム対象:</span> ほげ<span style="color:white;background-color:red">ふが</span>ぴよ.mp4 
               <span style="color:skyblue">-></span> ほげ<span style="color:green">んひぃ</span>ぴよ.mp4
</pre>

## CHANGELOG

### 2025.9.6
- 修正: 変更点のハイライト表示で、削除部分が赤色で表示されるように修正
- 修正: 変更点のハイライト表示で、追加部分が緑色で表示されるように修正
- 修正: 横に長かった表示を見やすく修正

### 2025.9.5
- 新機能: 文字列の長さを確認するオプションを追加

### 2025.7.17
- 新機能: 漢数字をアラビア数字に変換するオプションを追加
- 新機能: 漢数字を残すオプションを追加
