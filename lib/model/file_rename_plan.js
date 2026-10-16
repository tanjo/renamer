const path = require("node:path");

class FileRenamePlan {
  constructor(directory, sourceName, targetName) {
    this.directory = directory;
    this.sourceName = sourceName;
    this.targetName = targetName;
    this.sourcePath = path.join(directory, sourceName);
    this.targetPath = path.join(directory, targetName);
  }

  get hasChanges() {
    return this.sourcePath !== this.targetPath;
  }
}

module.exports = FileRenamePlan;