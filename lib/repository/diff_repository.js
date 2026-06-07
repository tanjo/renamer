const pico = require("picocolors");
const Diff = require("diff");

// part.added: 追加された部分 -> 緑色
// part.removed: 削除された部分 -> 赤色（背景）
// それ以外 (part.value): 変更のない部分 -> そのまま

/**
 * 文字列の差分をハイライトするリポジトリクラス。
 * `diff` ライブラリを使用して差分を計算し、コンソール出力用に色付けされた文字列を生成します。
 */
class DiffRepository {
  /**
   * DiffRepositoryのインスタンスを生成します。
   * 追加、削除、および変更なしのテキスト部分に使用する色の関数を初期化します。
   */
  constructor() {
    this.addedColor = pico.green;
    this.removedColor = pico.bgRed;
    this.baseColor = (text) => text;
  }

  /**
   * 2つの文字列を比較し、差分をハイライトした文字列を返します。
   *
   * @param {string} oldStr - 変更前の文字列。
   * @param {string} newStr - 変更後の文字列。
   * @param {object} [options={}] - ハイライト表示のオプション。
   * @param {boolean} [options.isAddOnly=false] - 追加された部分のみをハイライトする場合にtrueを指定します。
   * @param {boolean} [options.isRemoveOnly=false] - 削除された部分のみをハイライトする場合にtrueを指定します。
   * @returns {string} 差分がハイライトされた文字列。
   */
  highlight(oldStr, newStr, { isAddOnly = false, isRemoveOnly = false } = {}) {
    const diff = Diff.diffChars(oldStr, newStr);
    let result = "";

    diff.forEach((part) => {
      if (part.added) {
        if (isRemoveOnly) return;
        result += this.addedColor(part.value);
      } else if (part.removed) {
        if (isAddOnly) return;
        result += this.removedColor(part.value);
      } else {
        result += this.baseColor(part.value);
      }
    });

    return result;
  }
}
module.exports = DiffRepository;
