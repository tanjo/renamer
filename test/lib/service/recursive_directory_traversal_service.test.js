const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const RecursiveDirectoryTraversalService = require("../../../lib/service/recursive_directory_traversal_service");
const RenamerModel = require("../../../lib/model/renamer_model");

function createDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "renamer-directory-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function runWithoutConsoleOutput(run) {
  const originalLog = console.log;
  console.log = () => {};
  try {
    run();
  } finally {
    console.log = originalLog;
  }
}

test("再帰設定に従ってファイルを列挙し、隠しファイルを除外する", (t) => {
  const directory = createDirectory(t);
  const nestedDirectory = path.join(directory, "子");
  fs.mkdirSync(nestedDirectory);
  fs.writeFileSync(path.join(directory, "親.txt"), "親");
  fs.writeFileSync(path.join(directory, ".隠し.txt"), "隠し");
  fs.writeFileSync(path.join(nestedDirectory, "子.txt"), "子");

  const visitedFiles = [];
  const displayedDirectories = [];
  const displayService = {
    settings(depth, targetDirectory) {
      displayedDirectories.push({ depth, directory: targetDirectory });
    },
  };
  const singleFileRenameService = {
    renameFile({ directory: targetDirectory, file }) {
      visitedFiles.push({ directory: targetDirectory, file });
    },
  };

  runWithoutConsoleOutput(() => {
    new RecursiveDirectoryTraversalService(displayService, singleFileRenameService).traverse(
      new RenamerModel(directory, ".*", "", { recursive: true }).toRunOptions()
    );
  });

  assert.deepEqual(
    visitedFiles.map(({ file }) => file).sort(),
    ["子.txt", "親.txt"],
    "通常ファイルまたはサブディレクトリ内のファイルが列挙されていません"
  );
  assert.ok(
    visitedFiles.every(({ file }) => !file.startsWith(".")),
    "隠しファイルがリネーム対象として渡されています"
  );
  assert.ok(
    displayedDirectories.some(({ depth, directory: displayed }) => depth === 1 && displayed === nestedDirectory),
    "再帰先ディレクトリが階層付きで表示されていません"
  );
});

test("再帰設定が無効ならサブディレクトリに入らない", (t) => {
  const directory = createDirectory(t);
  const nestedDirectory = path.join(directory, "子");
  fs.mkdirSync(nestedDirectory);
  fs.writeFileSync(path.join(nestedDirectory, "子.txt"), "子");

  const visitedFiles = [];
  const singleFileRenameService = {
    renameFile({ file }) {
      visitedFiles.push(file);
    },
  };

  runWithoutConsoleOutput(() => {
    new RecursiveDirectoryTraversalService(undefined, singleFileRenameService).traverse(
      new RenamerModel(directory, ".*", "", { recursive: false }).toRunOptions()
    );
  });

  assert.deepEqual(visitedFiles, [], "再帰無効なのにサブディレクトリ内のファイルが処理されています");
});