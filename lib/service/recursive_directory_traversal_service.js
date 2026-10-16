const fs = require("node:fs");
const path = require("node:path");
const pico = require("picocolors");

const DisplayService = require("./display_service");
const SingleFileRenameService = require("./single_file_rename_service");

class RecursiveDirectoryTraversalService {
  constructor(displayService = new DisplayService(), singleFileRenameService = new SingleFileRenameService()) {
    this.display = displayService;
    this.singleFileRenamer = singleFileRenameService;
  }

  traverse(options) {
    this.traverseDirectory(options.directory, options, options.depth || 0);
  }

  traverseDirectory(directory, options, depth) {
    this.display.settings(
      depth,
      directory,
      options.pattern,
      options.replacement,
      options.isDebug,
      options.recursive,
      options.kansujiToArabic,
      options.affixKansujiToArabic,
      options.keepKansuji,
      options.length,
      options.lengthDiff
    );

    const dirents = fs.readdirSync(directory, { withFileTypes: true });
    console.log(
      `${"  ".repeat(depth)}| ${pico.magentaBright("ディレクトリ内のファイル数:")} ${
        dirents.filter((dirent) => dirent.isFile() && !dirent.name.startsWith(".")).length
      }`,
      `\n${"  ".repeat(depth)}| ${pico.green("ディレクトリ内のサブディレクトリ数:")} ${
        dirents.filter((dirent) => dirent.isDirectory()).length
      }`,
      `\n${"  ".repeat(depth)}+-+`
    );

    const seenFileNames = new Set();
    dirents.forEach((dirent) => {
      if (dirent.isDirectory()) {
        if (options.recursive) {
          this.traverseDirectory(
            path.join(directory, dirent.name),
            options,
            depth + 1
          );
        }
        return;
      }
      if (!dirent.isFile() || dirent.name.startsWith(".")) return;

      this.singleFileRenamer.renameFile({
        directory,
        file: dirent.name,
        options,
        depth,
        seenFileNames,
      });
    });
  }
}

module.exports = RecursiveDirectoryTraversalService;