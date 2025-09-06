const fs = require("fs");
const path = require("path");
const pico = require("picocolors");
const Diff = require("diff");

class RenamerController {
  run({ directory, isDebug, pattern, replacement, recursive, kansujiToArabic, keepKansuji, length, lengthDiff, depth = 0 }) {
    console.log(
      `${"  ".repeat(depth)}+ ${pico.cyanBright("対象ディレクトリ:")} ${directory}`,
      `\n${"  ".repeat(depth)}| ${pico.cyanBright("置換パターン:")} ${pattern}`,
      `\n${"  ".repeat(depth)}| ${pico.cyanBright("置換後の文字列:")} ${
        replacement
          ? replacement
          : replacement === undefined
          ? "未指定"
          : "空文字列"
      }`,
      `\n${"  ".repeat(depth)}| ${pico.yellowBright("デバッグモード:")} ${
        isDebug ? "有効" : "無効"
      }`,
      `\n${"  ".repeat(depth)}| ${pico.yellowBright("再帰処理:")} ${
        recursive ? "有効" : "無効"
      }`,
      `\n${"  ".repeat(depth)}| ${pico.yellowBright("漢数字をアラビア数字に変換:")} ${
        kansujiToArabic ? "有効" : "無効"
      }`,
      `\n${"  ".repeat(depth)}| ${pico.yellowBright("漢数字を残す:")} ${
        keepKansuji ? "有効" : "無効"
      }`,
      `\n${"  ".repeat(depth)}| ${pico.yellowBright("ファイルの文字数を確認:")} ${
        !(length === undefined) ? "有効" : "無効"
      }`
    );
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
        let newFileName = this.replaceNewFileName(file, pattern, replacement, kansujiToArabic, keepKansuji);
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
              )} ${this._highlightDifferences(file, newFileName, { isRemoveOnly: true })}`,
              `\n${"  ".repeat(depth + 1)}`,
              lengthDiff ? pico.yellow(`[` + `   ${newFileName.length}`.slice(-3) + `文字]`) : ``,
              `${pico.blue(
                "           -> "
              )}${this._highlightDifferences(file, newFileName, { isAddOnly: true })}`
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
              )} ${this._highlightDifferences(file, newFileName, { isRemoveOnly: true })}`,
              `\n${"  ".repeat(depth + 1)}`,
              lengthDiff ? pico.yellow(`[` + `   ${newFileName.length}`.slice(-3) + `文字]`) : ``,
              `${pico.green(
                "           -> "
              )}${this._highlightDifferences(file, newFileName, { isAddOnly: true })}`
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

  replaceNewFileName(file, pattern, replacement, kansujiToArabic, keepKansuji) {
    if (kansujiToArabic) {
      return this._convertKansujiToArabic(file, keepKansuji);
    }
    return file.replace(pattern, replacement);
  }

  _convertKansujiToArabic(file, keepKansuji) {
    // 漢数字の文字列を検索するための正規表現
    const kansujiRegex = /([〇一二三四五六七八九十百千万億兆]+)/g;

    /**
     * 漢数字の文字列をアラビア数字に変換する内部関数
     * @param {string} kanji - 漢数字のみで構成された文字列 (例: "千二百三十四")
     * @returns {number|string} 変換後の数値または文字列
     */
    const convert = (kanji) => {
      // 「二〇二五」のように、単位（十, 百..）を使わず数字を並べる表記法に対応
      if (/^[〇一二三四五六七八九]+$/.test(kanji)) {
        const digitMap = { '〇': '0', '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '七': '7', '八': '8', '九': '9' };
        return kanji.split('').map(c => digitMap[c] || c).join('');
      }

      // 「千二百三十四」のような単位を含む標準的な表記法に対応
      const numMap = { '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
      const unitMap = { '十': 10, '百': 100, '千': 1000 };
      const largeUnitMap = { '万': 10000, '億': 100000000, '兆': 1000000000000 };

      let total = 0;          // 最終的な合計値
      let segmentTotal = 0;   // 万、億、兆の単位で区切られた部分の合計値
      let currentNum = 0;     // 現在処理中の数値 (例: "二"百の"二")

      for (const char of kanji) {
        if (char in numMap) {
          // 数字の場合
          currentNum = numMap[char];
        } else if (char in unitMap) {
          // 単位が「十」「百」「千」の場合
          const val = (currentNum === 0) ? 1 : currentNum; // 「十」のように数字が省略されている場合は1とする
          segmentTotal += val * unitMap[char];
          currentNum = 0;
        } else if (char in largeUnitMap) {
          // 単位が「万」「億」「兆」の場合
          const val = (currentNum === 0 && segmentTotal === 0) ? 1 : currentNum;
          segmentTotal += val;
          total += segmentTotal * largeUnitMap[char];
          segmentTotal = 0;
          currentNum = 0;
        }
      }

      // ループ後に残った数を合計に加算
      total += segmentTotal + currentNum;
      return total;
    };

    if (keepKansuji) {
      return file.replace(kansujiRegex, (match) => {
        const arabic = convert(match);
        // 元の漢数字と変換後のアラビア数字を併記する
        // 例: 「三十一」を「三十一（31）」に置換
        return `${arabic}（${match}）`;
      });
    } else {
      // ファイル文字列内の漢数字部分を検索し、`convert`関数で変換する
      return file.replace(kansujiRegex, (match) => convert(match));
    }
  }

  _highlightDifferences(str1, str2, { isAddOnly = false, isRemoveOnly = false } = {}) {
    const diff = Diff.diffChars(str1, str2);
    let result = '';

    diff.forEach((part) => {
      // part.added: 追加された部分 -> 緑色
      // part.removed: 削除された部分 -> 赤色（背景）
      // それ以外 (part.value): 変更のない部分 -> そのまま
      if (part.added) {
        if (isRemoveOnly) return;
        result += pico.green(part.value);
      } else if (part.removed) {
        if (isAddOnly) return;
        result += pico.bgRed(part.value);
      } else {
        result += part.value;
      }
    });

    return result;
  }
}

module.exports = RenamerController;
