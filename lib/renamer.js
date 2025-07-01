const fs = require("fs");
const path = require("path");
const pico = require("picocolors");

class RenamerController {
  run({ directory, isDebug, pattern, replacement, recursive, depth = 0 }) {
    console.log(
      `${"  ".repeat(depth)}${pico.cyanBright("対象ディレクトリ:")} ${directory}`,
      `${"  ".repeat(depth)}${pico.cyanBright("置換パターン:")} ${pattern}`,
      `${"  ".repeat(depth)}${pico.cyanBright("置換後の文字列:")} ${
        replacement
          ? replacement
          : replacement === undefined
          ? "未指定"
          : "空文字列"
      }`,
      `${"  ".repeat(depth)}${pico.yellowBright("デバッグモード:")} ${
        isDebug ? "有効" : "無効"
      }`,
      `${"  ".repeat(depth)}${pico.yellowBright("再帰処理:")} ${
        recursive ? "有効" : "無効"
      }`
    );
    try {
      const dirents = fs.readdirSync(directory, { withFileTypes: true });
      console.log(
        `${"  ".repeat(depth)}${pico.magentaBright(
          "ディレクトリ内のファイル数:"
        )} ${
          dirents
            .filter((dirent) => dirent.isFile())
            .filter((dirent) => !dirent.name.startsWith(".")).length
        }`,
        `${"  ".repeat(depth)}${pico.yellow(
          "ディレクトリ内のサブディレクトリ数:"
        )} ${dirents.filter((dirent) => dirent.isDirectory()).length}`
      );

      dirents.forEach((dirent) => {
        if (dirent.isDirectory()) {
          if (recursive) {
            this.run({
              directory: path.join(directory, dirent.name),
              isDebug,
              pattern,
              replacement,
              recursive,
              depth: depth + 1,
            });
          }
          return;
        }
        if (!dirent.isFile()) return; // ファイルのみ対象
        if (dirent.name.startsWith(".")) return; // 隠しファイルは無視

        const file = dirent.name;
        const oldPath = path.join(directory, file);
        let newFileName = file.replace(pattern, replacement);
        const newPath = path.join(directory, newFileName);

        // ファイル名が変更されている場合のみリネーム
        if (oldPath !== newPath) {
          // デバッグモードの場合は実際のリネームを行わない
          if (isDebug) {
            console.log(
              `${"  ".repeat(depth)}${pico.blue(
                "リネーム対象:"
              )} ${file} -> ${newFileName}`
            );
            return;
          }
          try {
            fs.renameSync(oldPath, newPath);
            console.log(
              `${"  ".repeat(depth)}${pico.green(
                "リネーム成功:"
              )} ${file} -> ${newFileName}`
            );
          } catch (err) {
            console.error(
              `${"  ".repeat(depth)}${pico.red(
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
}

module.exports = RenamerController;
