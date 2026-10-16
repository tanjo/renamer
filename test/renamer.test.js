const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const RenamerController = require("../lib/renamer");

function createDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "renamer-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("replaces a filename using the supplied regular expression", () => {
  const renamer = new RenamerController();

  assert.equal(
    renamer.replaceNewFileName("video-12.mp4", /(\d+)/, "part-$1"),
    "video-part-12.mp4"
  );
});

test("converts kanji numerals and can retain the original numeral", () => {
  const renamer = new RenamerController();

  assert.equal(
    renamer.replaceNewFileName("第十二話.txt", undefined, undefined, true, true),
    "第12話.txt"
  );
  assert.equal(
    renamer.replaceNewFileName("第十二話.txt", undefined, undefined, true, true, true),
    "第12（十二）話.txt"
  );
});

test("renames files recursively and leaves hidden files unchanged", (t) => {
  const directory = createDirectory(t);
  const nestedDirectory = path.join(directory, "nested");
  fs.mkdirSync(nestedDirectory);
  fs.writeFileSync(path.join(directory, "ふが.txt"), "root");
  fs.writeFileSync(path.join(directory, ".ふが.txt"), "hidden");
  fs.writeFileSync(path.join(nestedDirectory, "ほげふが.txt"), "nested");

  new RenamerController().run({
    directory,
    pattern: /ふが/,
    replacement: "んひぃ",
    recursive: true,
  });

  assert.equal(fs.readFileSync(path.join(directory, "んひぃ.txt"), "utf8"), "root");
  assert.equal(fs.readFileSync(path.join(directory, ".ふが.txt"), "utf8"), "hidden");
  assert.equal(
    fs.readFileSync(path.join(nestedDirectory, "ほげんひぃ.txt"), "utf8"),
    "nested"
  );
});

test("debug mode reports candidates without renaming files", (t) => {
  const directory = createDirectory(t);
  const originalPath = path.join(directory, "old.txt");
  fs.writeFileSync(originalPath, "content");

  new RenamerController().run({
    directory,
    pattern: /old/,
    replacement: "new",
    isDebug: true,
  });

  assert.equal(fs.readFileSync(originalPath, "utf8"), "content");
  assert.equal(fs.existsSync(path.join(directory, "new.txt")), false);
});

test("does not overwrite an existing destination file", (t) => {
  const directory = createDirectory(t);
  fs.writeFileSync(path.join(directory, "old.txt"), "source");
  fs.writeFileSync(path.join(directory, "new.txt"), "destination");

  new RenamerController().run({
    directory,
    pattern: /old/,
    replacement: "new",
  });

  assert.equal(fs.readFileSync(path.join(directory, "old.txt"), "utf8"), "source");
  assert.equal(fs.readFileSync(path.join(directory, "new.txt"), "utf8"), "destination");
});