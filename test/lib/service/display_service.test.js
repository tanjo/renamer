const assert = require("node:assert/strict");
const test = require("node:test");

const DisplayService = require("../../../lib/service/display_service");

function removeColorCodes(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

test("置換文字列が未指定・空文字列・指定値のどれかを表示する", () => {
  const display = new DisplayService();

  assert.equal(display.formatReplacementOutput(undefined), "未指定", "未指定の表示が正しくありません");
  assert.equal(display.formatReplacementOutput(""), "空文字列", "空文字列の表示が正しくありません");
  assert.equal(display.formatReplacementOutput("置換後"), "置換後", "指定した文字列が表示されていません");
});

test("有効・無効の状態を日本語で表示する", () => {
  const display = new DisplayService();

  assert.ok(display.formatDebugState(true).includes("有効"), "有効状態が表示されていません");
  assert.equal(display.formatDebugState(false), "無効", "無効状態の表示が正しくありません");
  assert.ok(display.formatLengthState(10).includes("有効"), "文字数確認の有効状態が表示されていません");
  assert.equal(display.formatLengthState(undefined), "無効", "文字数未指定なのに有効と表示されています");
});

test("設定一覧に対象ディレクトリや置換条件を出力する", () => {
  const display = new DisplayService();
  const originalLog = console.log;
  let output = "";
  console.log = (value) => {
    output = value;
  };

  try {
    display.settings(0, "/tmp/対象", /旧/, "新", false, true, false, false, false);
  } finally {
    console.log = originalLog;
  }

  const plainOutput = removeColorCodes(output);
  assert.match(plainOutput, /対象ディレクトリ: \/tmp\/対象/, "対象ディレクトリが出力されていません");
  assert.match(plainOutput, /置換パターン: \/旧\//, "置換パターンが出力されていません");
  assert.match(plainOutput, /置換後の文字列: 新/, "置換後の文字列が出力されていません");
});

test("サブディレクトリの表示に階層分のインデントを付ける", () => {
  const display = new DisplayService();

  assert.match(
    removeColorCodes(display.directoryString(2, "/tmp/子")),
    /^    \+ 対象ディレクトリ: \/tmp\/子$/,
    "階層に応じたインデントまたはディレクトリ名が正しくありません"
  );
});