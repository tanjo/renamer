const fs = require("fs");
const path = require("path");
const pico = require("picocolors");
const DisplayService = require("./service/display_service");
const HighlightService = require("./service/highlight_service");
const KansujiService = require("./service/kansuji_service");

class RenamerController {
  constructor() {
    this.highlight = new HighlightService();
    this.display = new DisplayService();
    this.kansujiService = new KansujiService();
  }

  run({ directory, isDebug, pattern, replacement, recursive, kansujiToArabic, affixKansujiToArabic, keepKansuji, length, lengthDiff, depth = 0 }) {
    this.display.settings(depth, directory, pattern, replacement, isDebug, recursive, kansujiToArabic, affixKansujiToArabic, keepKansuji, length, lengthDiff);
    try {
      const dirents = fs.readdirSync(directory, { withFileTypes: true });
      console.log(
        `${"  ".repeat(depth)}| ${pico.magentaBright(
          "ディレクトリ内のファイル数:"
        )} ${
          dirents
            .filter((dirent) => dirent.isFile())
            .filter((dirent) => !dirent.name.startsWith(".")).length
        }`,
        `\n${"  ".repeat(depth)}| ${pico.green(
          "ディレクトリ内のサブディレクトリ数:"
        )} ${dirents.filter((dirent) => dirent.isDirectory()).length}`,
        `\n${"  ".repeat(depth)}+-+`
      );

      let seens = new Set();
      dirents.forEach((dirent) => {
        if (dirent.isDirectory()) {
          if (recursive) {
            this.run({
              directory: path.join(directory, dirent.name),
              isDebug,
              pattern,
              replacement,
              recursive,
              kansujiToArabic,
              keepKansuji,
              length,
              lengthDiff,
              depth: depth + 1,
            });
          }
          return;
        }
        if (!dirent.isFile()) return; // ファイルのみ対象
        if (dirent.name.startsWith(".")) return; // 隠しファイルは無視

        const file = dirent.name;

        if (length !== undefined) {
          if (length > 0 && file.length <= length) {
            return; // 指定された文字数以下のファイルは無視
          }
          console.log(
            `${"  ".repeat(depth + 1)}[${pico.blue(
              `長さ：`
            )}${file.length} 文字]　${pico.green(
              "ファイル名:"
            )} ${file}`
          );
          return;
        }

        const oldPath = path.join(directory, file);
        let newFileName = this.replaceNewFileName(file, pattern, replacement, kansujiToArabic, affixKansujiToArabic, keepKansuji);
        const newPath = path.join(directory, newFileName);
        if (fs.existsSync(newPath)) {
          console.error(
            `${"  ".repeat(depth + 1)}${pico.red(
              "同じ名前のファイルが存在するためリネームをスキップしました:"
            )} ${file}`
          );
          return;
        }
        if (seens.has(newFileName)) {
          console.error(
            `${"  ".repeat(depth + 1)}${pico.red(
              "同じ名前のファイルが存在するためリネームをスキップしました:"
            )} ${file}`
          );
          return;
        }
        seens.add(newFileName);
        // ファイル名が変更されている場合のみリネーム
        if (oldPath !== newPath) {
          // デバッグモードの場合は実際のリネームを行わない
          if (isDebug) {
            console.log(
              `${"  ".repeat(depth + 1)}`,
              lengthDiff ? pico.yellow(`[` + `   ${file.length}`.slice(-3) + `文字]`) : ``,
              `${pico.blue(
                "リネーム対象:"
              )} ${this.highlight.removeOnly(file, newFileName)}`,
              `\n${"  ".repeat(depth + 1)}`,
              lengthDiff ? pico.yellow(`[` + `   ${newFileName.length}`.slice(-3) + `文字]`) : ``,
              `${pico.blue(
                "           -> "
              )}${this.highlight.addOnly(file, newFileName)}`
            );
            return;
          }
          try {
            fs.renameSync(oldPath, newPath);
            console.log(
              `${"  ".repeat(depth + 1)}`,
              lengthDiff ? pico.yellow(`[` + `   ${file.length}`.slice(-3) + `文字]`) : ``,
              `${pico.green(
                "リネーム成功:"
              )} ${this.highlight.removeOnly(file, newFileName)}`,
              `\n${"  ".repeat(depth + 1)}`,
              lengthDiff ? pico.yellow(`[` + `   ${newFileName.length}`.slice(-3) + `文字]`) : ``,
              `${pico.green(
                "           -> "
              )}${this.highlight.addOnly(file, newFileName)}`
            );
          } catch (err) {
            console.error(
              `${"  ".repeat(depth + 1)}${pico.red(
                "ファイルのリネームに失敗しました:"
              )} ${err.message}`
            );
          }
        }
      });
    } catch (err) {
      console.error(
        `${"  ".repeat(depth)}${pico.red(
          "ディレクトリの読み込みに失敗しました:"
        )} ${err.message}`
      );
      process.exit(1);
    }
  }

  replaceNewFileName(file, pattern, replacement, kansujiToArabic, affix, keepKansuji) {
    if (kansujiToArabic) {
      return this.kansujiService
                 .affix(affix ? true : false)
                 .keep(keepKansuji ? true : false)
                 .toArabic(file);
    }
    return file.replace(pattern, replacement);
  }
}

module.exports = RenamerController;
