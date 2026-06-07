const pico = require("picocolors");

class DisplayService {

  settings(depth, directory, pattern, replacement, isDebug, recursive, kansujiToArabic, affixKansujiToArabic, keepKansuji, length, lengthDiff) {
    if (depth > 0) {
      this.subDirectory(depth, directory);
      return;
    }
    console.log([
      this.directoryString(depth, directory),
      this.patternString(depth, pattern),
      this.replacementString(depth, replacement),
      this.debugString(depth, isDebug),
      this.recursiveString(depth, recursive),
      this.kansujiToArabicString(depth, kansujiToArabic),
      this.affixKansujiToArabicString(depth, affixKansujiToArabic),
      this.keepKansujiString(depth, keepKansuji),
      this.lengthString(depth, length),
      this.lengthDiffString(depth, lengthDiff)
    ].join("\n"));
  }

  subDirectory(depth, directory) {
    console.log([
      this.directoryString(depth, directory)
    ].join("\n"));
  }

  directoryString(depth, directory) {
    return this.repeat(depth, `+ ${pico.cyanBright("対象ディレクトリ:")} ${directory}`);
  }

  patternString(depth, pattern) {
    return this.repeat(depth, `| ${pico.cyanBright("置換パターン:")} ${pattern}`);
  }

  replacementString(depth, replacement) {
    return this.repeat(depth, `| ${pico.cyanBright("置換後の文字列:")} ${this.formatReplacementOutput(replacement)}`);
  }

  formatReplacementOutput(replacement) {
    return replacement ? replacement : replacement === undefined ? "未指定" : "空文字列";
  }

  debugString(depth, isDebug) {
    return this.repeat(depth, `| ${pico.yellowBright("デバッグモード(d):")} ${this.formatDebugState(isDebug)}`);
  }

  formatDebugState(isDebug) {
    return isDebug ? pico.redBright("有効") : "無効";
  }

  recursiveString(depth, recursive) {
    return this.repeat(depth, `| ${pico.yellowBright("再帰処理(r):")} ${this.formatRecursiveState(recursive)}`);
  }

  formatRecursiveState(recursive) {
    return recursive ? pico.redBright("有効") : "無効";
  }

  kansujiToArabicString(depth, kansujiToArabic) {
    return this.repeat(depth, `| ${pico.yellowBright("漢数字をアラビア数字に変換(a):")} ${this.formatKansujiToArabicState(kansujiToArabic)}`);
  }

  formatKansujiToArabicState(kansujiToArabic) {
    return kansujiToArabic ? pico.redBright("有効") : "無効";
  }

  affixKansujiToArabicString(depth, affixKansujiToArabic) {
    return this.repeat(depth, `| ${pico.yellowBright("「第XXX話」の形式の漢数字をアラビア数字に変換(x):")} ${this.formatAffixKansujiToArabicState(affixKansujiToArabic)}`);
  }

  formatAffixKansujiToArabicState(affixKansujiToArabic) {
    return affixKansujiToArabic ? pico.redBright("有効") : "無効";
  }

  keepKansujiString(depth, keepKansuji) {
    return this.repeat(depth, `| ${pico.yellowBright("漢数字を残す(k):")} ${this.formatKeepKansujiState(keepKansuji)}`);
  }

  formatKeepKansujiState(keepKansuji) {
    return keepKansuji ? pico.redBright("有効") : "無効";
  }

  lengthString(depth, length) {
    return this.repeat(depth, `| ${pico.yellowBright("ファイルの文字数を確認(l):")} ${this.formatLengthState(length)}`);
  }

  formatLengthState(length) {
    return !(length === undefined) ? pico.redBright("有効") : "無効";
  }

  lengthDiffString(depth, lengthDiff) {
    return this.repeat(depth, `| ${pico.yellowBright("変更前・変更後のファイル名の長さを表示(s):")} ${this.formatLengthDiffState(lengthDiff)}`);
  }
  
  formatLengthDiffState(lengthDiff) {
    return lengthDiff ? pico.redBright("有効") : "無効";
  }

  repeat(depth, str) {
    return `${"  ".repeat(depth)}${str}`;
  } 
};
module.exports = DisplayService;