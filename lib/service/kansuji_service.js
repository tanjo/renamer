class KansujiService {
  constructor() {
    this._prefix = "第";
    this._suffix = "話";
    this._affix = false;
  }

  // 漢数字の文字列を検索するための正規表現
  get kansujiRgex() {
    return /([〇一二三四五六七八九十百千万億兆]+)/g;
  }

  get daiXwaRgex() {
    return /第([〇一壱ニ二弐三参四五六七八九十百千万億兆]+)([話席章])/g;
  }

  get regex() {
    return this._affix ? this.daiXwaRgex : this.kansujiRgex;
  }

  affix(affix = true) {
    this._affix = affix;
    return this;
  }

  keep(keep = true) {
    this._keepKansuji = keep;
    return this;
  }

  get prefix() {
    if (this._affix) {
      return this._prefix;
    }
    return "";
  }

  get suffix() {
    if (this._affix) {
      return this._suffix;
    }
    return "";
  }

  /**
   * 漢数字の文字列をアラビア数字に変換する内部関数
   * @param {string} kanji - 漢数字のみで構成された文字列 (例: "千二百三十四")
   * @returns {number|string} 変換後の数値または文字列
   */
  convert(kanji, p1, p2) {
    if (this._affix) {
      this._suffix = p2;
    }
    kanji = kanji.replace(this.prefix, "").replace(this.suffix, "");
    // 「二〇二五」のように、単位（十, 百..）を使わず数字を並べる表記法に対応
    if (/^[零〇壱一弐ニ二参三四五六七八九]+$/.test(kanji)) {
      const digitMap = {
        零: "0",
        〇: "0",
        壱: "1",
        一: "1",
        弐: "2",
        ニ: "2",
        二: "2",
        参: "3",
        三: "3",
        四: "4",
        五: "5",
        六: "6",
        七: "7",
        八: "8",
        九: "9",
      };
      return `${this.prefix}${kanji
        .split("")
        .map((c) => digitMap[c] || c)
        .join("")}${this._keepKansuji ? "（" + kanji + "）" : ""}${this.suffix}`;
    }

    // 「千二百三十四」のような単位を含む標準的な表記法に対応
    const numMap = {
      零: 0,
      〇: 0,
      壱: 1,
      一: 1,
      弐: 2,
      ニ: 2,
      二: 2,
      参: 3,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
    };
    const unitMap = { 十: 10, 百: 100, 千: 1000 };
    const largeUnitMap = {
      萬: 10000,
      万: 10000,
      億: 100000000,
      兆: 1000000000000,
    };

    let total = 0; // 最終的な合計値
    let segmentTotal = 0; // 万、億、兆の単位で区切られた部分の合計値
    let currentNum = 0; // 現在処理中の数値 (例: "二"百の"二")

    for (const char of kanji) {
      if (char in numMap) {
        // 数字の場合
        currentNum = numMap[char];
      } else if (char in unitMap) {
        // 単位が「十」「百」「千」の場合
        const val = currentNum === 0 ? 1 : currentNum; // 「十」のように数字が省略されている場合は1とする
        segmentTotal += val * unitMap[char];
        currentNum = 0;
      } else if (char in largeUnitMap) {
        // 単位が「万」「億」「兆」の場合
        const val = currentNum === 0 && segmentTotal === 0 ? 1 : currentNum;
        segmentTotal += val;
        total += segmentTotal * largeUnitMap[char];
        segmentTotal = 0;
        currentNum = 0;
      }
    }

    // ループ後に残った数を合計に加算
    total += segmentTotal + currentNum;
    return `${this.prefix}${total}${this._keepKansuji ? "（" + kanji + "）" : ""}${this.suffix}`;
  }

  toArabic(fileName) {
      return fileName.replace(this.regex, this.convert.bind(this));
  }
}
module.exports = KansujiService;
