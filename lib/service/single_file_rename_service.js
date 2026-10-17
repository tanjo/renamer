const fs = require("node:fs");
const pico = require("picocolors");

const HighlightService = require("./highlight_service");
const KansujiService = require("./kansuji_service");
const FileRenamePlan = require("../model/file_rename_plan");

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

    const newFileName = this.createNewFileName(file, options);
    const plan = new FileRenamePlan(directory, file, newFileName);
    if (fs.existsSync(plan.targetPath) || seenFileNames.has(plan.targetName)) {
      console.error(
        `${"  ".repeat(depth + 1)}${pico.red(
          "同じ名前のファイルが存在するためリネームをスキップしました:"
        )} ${file}`
      );
      return;
    }
    seenFileNames.add(plan.targetName);

    if (!plan.hasChanges) return;
    if (options.isDebug) {
      this.displayRename(plan, options.lengthDiff, depth, true);
      return;
    }

    try {
      fs.renameSync(plan.sourcePath, plan.targetPath);
      this.displayRename(plan, options.lengthDiff, depth, false);
    } catch (err) {
      console.error(
        `${"  ".repeat(depth + 1)}${pico.red("ファイルのリネームに失敗しました:")} ${err.message}`
      );
    }
  }

  createNewFileName(file, options) {
    if (options.kansujiToArabic || options.affixKansujiToArabic) {
      return this.kansujiService
        .affix(options.affixKansujiToArabic ? true : false)
        .keep(options.keepKansuji ? true : false)
        .toArabic(file);
    }
    return file.replace(options.pattern, options.replacement);
  }

  displayRename(plan, lengthDiff, depth, isDebug) {
    const color = isDebug ? pico.blue : pico.green;
    console.log(
      `${"  ".repeat(depth + 1)}`,
      lengthDiff ? pico.yellow(`[${`   ${plan.sourceName.length}`.slice(-3)}文字]`) : "",
      `${color(isDebug ? "リネーム対象:" : "リネーム成功:")} ${this.highlight.removeOnly(
        plan.sourceName,
        plan.targetName
      )}`,
      `\n${"  ".repeat(depth + 1)}`,
      lengthDiff ? pico.yellow(`[${`   ${plan.targetName.length}`.slice(-3)}文字]`) : "",
      `${color("           -> ")}${this.highlight.addOnly(plan.sourceName, plan.targetName)}`
    );
  }
}

module.exports = SingleFileRenameService;