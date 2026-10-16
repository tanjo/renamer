const fs = require("node:fs");
const path = require("node:path");
const pico = require("picocolors");

const HighlightService = require("./highlight_service");
const KansujiService = require("./kansuji_service");

class SingleFileRenameService {
  constructor(highlightService = new HighlightService(), kansujiService = new KansujiService()) {
    this.highlight = highlightService;
    this.kansujiService = kansujiService;
  }

  renameFile({ directory, file, options, depth, seenFileNames }) {
    if (options.length !== undefined) {
      if (options.length > 0 && file.length <= options.length) return;
      console.log(
        `${"  ".repeat(depth + 1)}[${pico.blue("長さ：")}${file.length} 文字]　${pico.green(
          "ファイル名:"
        )} ${file}`
      );
      return;
    }

    const oldPath = path.join(directory, file);
    const newFileName = this.replaceNewFileName(
      file,
      options.pattern,
      options.replacement,
      options.kansujiToArabic,
      options.affixKansujiToArabic,
      options.keepKansuji
    );
    const newPath = path.join(directory, newFileName);
    if (fs.existsSync(newPath) || seenFileNames.has(newFileName)) {
      console.error(
        `${"  ".repeat(depth + 1)}${pico.red(
          "同じ名前のファイルが存在するためリネームをスキップしました:"
        )} ${file}`
      );
      return;
    }
    seenFileNames.add(newFileName);

    if (oldPath === newPath) return;
    if (options.isDebug) {
      this.displayRename(file, newFileName, options.lengthDiff, depth, true);
      return;
    }

    try {
      fs.renameSync(oldPath, newPath);
      this.displayRename(file, newFileName, options.lengthDiff, depth, false);
    } catch (err) {
      console.error(
        `${"  ".repeat(depth + 1)}${pico.red("ファイルのリネームに失敗しました:")} ${err.message}`
      );
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

  displayRename(file, newFileName, lengthDiff, depth, isDebug) {
    const color = isDebug ? pico.blue : pico.green;
    console.log(
      `${"  ".repeat(depth + 1)}`,
      lengthDiff ? pico.yellow(`[${`   ${file.length}`.slice(-3)}文字]`) : "",
      `${color(isDebug ? "リネーム対象:" : "リネーム成功:")} ${this.highlight.removeOnly(
        file,
        newFileName
      )}`,
      `\n${"  ".repeat(depth + 1)}`,
      lengthDiff ? pico.yellow(`[${`   ${newFileName.length}`.slice(-3)}文字]`) : "",
      `${color("           -> ")}${this.highlight.addOnly(file, newFileName)}`
    );
  }
}

module.exports = SingleFileRenameService;