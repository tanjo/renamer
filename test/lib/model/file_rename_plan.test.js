const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const FileRenamePlan = require("../../../lib/model/file_rename_plan");

test("変更前後の名前から対象パスを組み立てる", () => {
  const directory = path.join("/tmp", "対象");
  const plan = new FileRenamePlan(directory, "old.txt", "new.txt");

  assert.equal(plan.sourceName, "old.txt", "変更前のファイル名が保持されていません");
  assert.equal(plan.targetName, "new.txt", "変更後のファイル名が保持されていません");
  assert.equal(plan.sourcePath, path.join(directory, "old.txt"), "変更元パスが正しくありません");
  assert.equal(plan.targetPath, path.join(directory, "new.txt"), "変更先パスが正しくありません");
  assert.equal(plan.hasChanges, true, "異なるファイル名なのに変更ありと判定されません");
});

test("変更前後の名前が同じなら変更なしと判定する", () => {
  const plan = new FileRenamePlan("/tmp/対象", "same.txt", "same.txt");

  assert.equal(plan.hasChanges, false, "同じファイル名なのに変更ありと判定されています");
});