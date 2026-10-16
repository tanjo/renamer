const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const entryPoint = path.resolve(__dirname, "../../../index.js");

function createDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "renamer-program-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("CLI の引数で指定したパターンに従ってファイル名を変更する", (t) => {
  const directory = createDirectory(t);
  fs.writeFileSync(path.join(directory, "old.txt"), "content");

  const result = spawnSync(process.execPath, [entryPoint, directory, "old", "new"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, `CLI が正常終了しませんでした: ${result.stderr}`);
  assert.equal(fs.existsSync(path.join(directory, "old.txt")), false, "変更前のファイルが残っています");
  assert.equal(
    fs.readFileSync(path.join(directory, "new.txt"), "utf8"),
    "content",
    "変更後のファイル名または内容が正しくありません"
  );
});

test("設定ファイルのパターンと置換文字列を使ってファイル名を変更する", (t) => {
  const root = createDirectory(t);
  const directory = path.join(root, "target");
  const configPath = path.join(root, "config.json");
  fs.mkdirSync(directory);
  fs.writeFileSync(path.join(directory, "old.txt"), "content");
  fs.writeFileSync(configPath, JSON.stringify({ pattern: "old", replacement: "new" }));

  const result = spawnSync(process.execPath, [entryPoint, directory, "--config", configPath], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, `設定ファイルを使った CLI が正常終了しませんでした: ${result.stderr}`);
  assert.equal(fs.existsSync(path.join(directory, "old.txt")), false, "変更前のファイルが残っています");
  assert.equal(
    fs.readFileSync(path.join(directory, "new.txt"), "utf8"),
    "content",
    "設定ファイルの置換設定が反映されていません"
  );
});

test("パターン未指定の場合はエラーを返す", (t) => {
  const directory = createDirectory(t);

  const result = spawnSync(process.execPath, [entryPoint, directory], {
    encoding: "utf8",
  });

  assert.equal(result.status, 1, "パターン未指定なのに CLI が正常終了しました");
  assert.match(result.stderr, /置換パターンが指定されていません/, "パターン未指定のエラーが表示されていません");
});

test("存在しないディレクトリを指定した場合はエラーを返す", (t) => {
  const root = createDirectory(t);
  const missingDirectory = path.join(root, "missing");

  const result = spawnSync(process.execPath, [entryPoint, missingDirectory, "old", "new"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 1, "存在しないディレクトリなのに CLI が正常終了しました");
  assert.match(
    result.stderr,
    /指定されたディレクトリが存在しません/,
    "ディレクトリが存在しないことを示すエラーが表示されていません"
  );
});