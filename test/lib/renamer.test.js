const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const RenamerController = require("../../lib/renamer");

function createDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "renamer-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function runWithoutConsoleOutput(run) {
  const originalLog = console.log;
  const originalError = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    run();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

test("再帰モードではサブディレクトリも処理し、隠しファイルは変更しない", (t) => {
  const directory = createDirectory(t);
  const nestedDirectory = path.join(directory, "nested");
  fs.mkdirSync(nestedDirectory);
  fs.writeFileSync(path.join(directory, "ふが.txt"), "root");
  fs.writeFileSync(path.join(directory, ".ふが.txt"), "hidden");
  fs.writeFileSync(path.join(nestedDirectory, "ほげふが.txt"), "nested");

  runWithoutConsoleOutput(() => {
    new RenamerController().run({
      directory,
      pattern: /ふが/,
      replacement: "んひぃ",
      recursive: true,
    });
  });

  assert.equal(fs.readFileSync(path.join(directory, "んひぃ.txt"), "utf8"), "root", "直下のファイルが変更されていません");
  assert.equal(fs.readFileSync(path.join(directory, ".ふが.txt"), "utf8"), "hidden", "隠しファイルが変更されています");
  assert.equal(
    fs.readFileSync(path.join(nestedDirectory, "ほげんひぃ.txt"), "utf8"),
    "nested",
    "サブディレクトリ内のファイルが変更されていません"
  );
});

test("デバッグモードでは対象を表示するだけでファイルを変更しない", (t) => {
  const directory = createDirectory(t);
  const originalPath = path.join(directory, "old.txt");
  fs.writeFileSync(originalPath, "content");

  runWithoutConsoleOutput(() => {
    new RenamerController().run({
      directory,
      pattern: /old/,
      replacement: "new",
      isDebug: true,
    });
  });

  assert.equal(fs.readFileSync(originalPath, "utf8"), "content", "デバッグモードで元ファイルが変更されています");
  assert.equal(fs.existsSync(path.join(directory, "new.txt")), false, "デバッグモードで新しいファイルが作成されています");
});

test("変換先が既に存在する場合はファイルを上書きしない", (t) => {
  const directory = createDirectory(t);
  fs.writeFileSync(path.join(directory, "old.txt"), "source");
  fs.writeFileSync(path.join(directory, "new.txt"), "destination");

  runWithoutConsoleOutput(() => {
    new RenamerController().run({
      directory,
      pattern: /old/,
      replacement: "new",
    });
  });

  assert.equal(fs.readFileSync(path.join(directory, "old.txt"), "utf8"), "source", "変換元ファイルが失われています");
  assert.equal(fs.readFileSync(path.join(directory, "new.txt"), "utf8"), "destination", "既存の変換先ファイルが上書きされています");
});