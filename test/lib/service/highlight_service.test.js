const assert = require("node:assert/strict");
const test = require("node:test");

const HighlightService = require("../../../lib/service/highlight_service");

test("削除部分の表示から追加部分を除外する", () => {
  const highlight = new HighlightService();
  const result = highlight.removeOnly("旧名前.txt", "新名前.txt");

  assert.ok(result.includes("旧"), "削除された文字が結果に含まれていません");
  assert.ok(!result.includes("新"), "追加された文字が削除部分の結果に含まれています");
  assert.ok(result.includes("名前.txt"), "変更されていない文字が結果に残っていません");
});

test("追加部分の表示から削除部分を除外する", () => {
  const highlight = new HighlightService();
  const result = highlight.addOnly("旧名前.txt", "新名前.txt");

  assert.ok(result.includes("新"), "追加された文字が結果に含まれていません");
  assert.ok(!result.includes("旧"), "削除された文字が追加部分の結果に含まれています");
  assert.ok(result.includes("名前.txt"), "変更されていない文字が結果に残っていません");
});