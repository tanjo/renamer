class RenamerModel {
  constructor(directory, pattern, replacement, options = {}) {
    this.directory = directory;

    this.kansujiToArabic = options.kansujiToArabic;
    this.affixKansujiToArabic = options.affixKansujiToArabic;
    this.keepKansuji = options.keepKansuji;
    this.replacement = replacement || "";
    this.isDebug = options.debug;
    this.recursive = options.recursive;
    this.length = options.length;
    this.lengthDiff = options.lengthDiff;

    if (
      !this.kansujiToArabic &&
      !this.affixKansujiToArabic &&
      (!pattern || pattern === "") &&
      this.length === undefined
    ) {
      throw new Error("置換パターンが指定されていません。正規表現を使用してください。");
    }

    try {
      this.pattern = new RegExp(pattern);
    } catch {
      throw new Error("置換パターンが正しく指定されていません。正規表現を使用してください。");
    }
  }

  toRunOptions() {
    return { ...this };
  }
}

module.exports = RenamerModel;