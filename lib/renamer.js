const pico = require("picocolors");
const DisplayService = require("./service/display_service");
const RecursiveDirectoryTraversalService = require("./service/recursive_directory_traversal_service");

class RenamerController {
  constructor() {
    this.display = new DisplayService();
    this.directoryTraversal = new RecursiveDirectoryTraversalService(this.display);
  }

  run(options) {
    try {
      this.directoryTraversal.traverse(options);
    } catch (err) {
      console.error(
        `${"  ".repeat(options.depth || 0)}${pico.red(
          "ディレクトリの読み込みに失敗しました:"
        )} ${err.message}`
      );
      process.exit(1);
    }
  }
}

module.exports = RenamerController;
