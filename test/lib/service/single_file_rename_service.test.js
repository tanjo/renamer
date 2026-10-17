const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const SingleFileRenameService = require("../../../lib/service/single_file_rename_service");
const RenamerModel = require("../../../lib/model/renamer_model");

function createDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "renamer-file-test-"));
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

test("指定したファイルを新しい名前に変更する", (t) => {
  const directory = createDirectory(t);
  fs.writeFileSync(path.join(directory, "old.txt"), "content");

  runWithoutConsoleOutput(() => {
    new SingleFileRenameService().renameFile({
      directory,
      file: "old.txt",
      options: new RenamerModel(directory, /old/, "new").toRunOptions(),
      depth: 0,
      seenFileNames: new Set(),
    });
  });

  assert.equal(fs.existsSync(path.join(directory, "old.txt")), false, "変更前の名前のファイルが残っています");
  assert.equal(
    fs.readFileSync(path.join(directory, "new.txt"), "utf8"),
    "content",
    "変更後のファイル名または内容が正しくありません"
  );
});

test("接頭辞付き変換だけでも章番号を変換する", (t) => {
  const directory = createDirectory(t);
  fs.writeFileSync(path.join(directory, "第一章.txt"), "content");

  runWithoutConsoleOutput(() => {
    new SingleFileRenameService().renameFile({
      directory,
      file: "第一章.txt",
      options: new RenamerModel(directory, undefined, undefined, {
        affixKansujiToArabic: true,
        keepKansuji: true,
      }).toRunOptions(),
      depth: 0,
      seenFileNames: new Set(),
    });
  });

  assert.equal(fs.existsSync(path.join(directory, "第一章.txt")), false, "変更前の名前のファイルが残っています");
  assert.equal(
    fs.readFileSync(path.join(directory, "第1（一）章.txt"), "utf8"),
    "content",
    "-x と -k のみで章番号が変換されていません"
  );
});

test("変換先が既に存在する場合は上書きしない", (t) => {
  const directory = createDirectory(t);
  fs.writeFileSync(path.join(directory, "old.txt"), "source");
  fs.writeFileSync(path.join(directory, "new.txt"), "destination");

  runWithoutConsoleOutput(() => {
    new SingleFileRenameService().renameFile({
      directory,
      file: "old.txt",
      options: new RenamerModel(directory, /old/, "new").toRunOptions(),
      depth: 0,
      seenFileNames: new Set(),
    });
  });

  assert.equal(fs.readFileSync(path.join(directory, "old.txt"), "utf8"), "source", "変換元ファイルが失われています");
  assert.equal(fs.readFileSync(path.join(directory, "new.txt"), "utf8"), "destination", "既存の変換先ファイルが上書きされています");
});