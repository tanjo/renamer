const assert = require("node:assert/strict");
const test = require("node:test");

const RenamerModel = require("../../../lib/model/renamer_model");

test("リネーム要求の設定を実行オプションにまとめる", () => {
  const model = new RenamerModel("/tmp/対象", "old", undefined, {
    kansujiToArabic: true,
    affixKansujiToArabic: true,
    keepKansuji: true,
    debug: true,
    recursive: true,
    length: 10,
    lengthDiff: true,
  });

  assert.deepEqual(model.toRunOptions(), {
    directory: "/tmp/対象",
    kansujiToArabic: true,
    affixKansujiToArabic: true,
    keepKansuji: true,
    replacement: "",
    isDebug: true,
    recursive: true,
    length: 10,
    lengthDiff: true,
    pattern: /old/,
  }, "要求の値や既定値が実行オプションに反映されていません");
});

test("漢数字変換または文字数確認を使わない場合はパターンを必須にする", () => {
  assert.throws(
    () => new RenamerModel("/tmp/対象"),
    /置換パターンが指定されていません/,
    "パターン未指定の要求が受け入れられました"
  );
  assert.equal(
    new RenamerModel("/tmp/対象", undefined, undefined, { kansujiToArabic: true }).kansujiToArabic,
    true,
    "漢数字変換が有効なのにパターンなしの要求を作成できません"
  );
  assert.equal(
    new RenamerModel("/tmp/対象", undefined, undefined, { length: 10 }).length,
    10,
    "文字数確認が有効なのにパターンなしの要求を作成できません"
  );
});

test("不正な正規表現を拒否する", () => {
  assert.throws(
    () => new RenamerModel("/tmp/対象", "["),
    /置換パターンが正しく指定されていません/,
    "不正な正規表現が要求に設定されました"
  );
});