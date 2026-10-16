const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const RenamerModel = require("../../../lib/model/renamer_model");

test("入力値をコントローラー用の形式に整える", () => {
  const directory = path.join("/tmp", "renamer-model-test");
  const model = new RenamerModel(directory, "old", undefined, {
    debug: true,
    recursive: true,
    length: 10,
    lengthDiff: true,
  });

  assert.deepEqual(model.toRunOptions(), {
    directory,
    kansujiToArabic: undefined,
    affixKansujiToArabic: undefined,
    keepKansuji: undefined,
    replacement: "",
    isDebug: true,
    recursive: true,
    length: 10,
    lengthDiff: true,
    pattern: /old/,
  }, "入力値、既定値、正規表現がコントローラー用データに反映されていません");
});

test("漢数字変換または文字数確認を使わない場合はパターンを必須にする", () => {
  const directory = path.join("/tmp", "renamer-model-test");

  assert.throws(
    () => new RenamerModel(directory),
    /置換パターンが指定されていません/,
    "パターンが未指定なのに入力が受け入れられました"
  );
  assert.equal(
    new RenamerModel(directory, undefined, undefined, { kansujiToArabic: true }).kansujiToArabic,
    true,
    "漢数字変換を有効にした場合はパターンなしで受け入れる必要があります"
  );
  assert.equal(
    new RenamerModel(directory, undefined, undefined, { length: 10 }).length,
    10,
    "文字数確認を有効にした場合はパターンなしで受け入れる必要があります"
  );
});

test("不正な正規表現を拒否する", () => {
  const directory = path.join("/tmp", "renamer-model-test");

  assert.throws(
    () => new RenamerModel(directory, "["),
    /置換パターンが正しく指定されていません/,
    "不正な正規表現が受け入れられました"
  );
});