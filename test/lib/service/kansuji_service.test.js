const assert = require("node:assert/strict");
const test = require("node:test");

const KansujiService = require("../../../lib/service/kansuji_service");

test("漢数字の連続表記をアラビア数字に変換する", () => {
  const service = new KansujiService();

  assert.equal(
    service.toArabic("二〇二五.txt"),
    "2025.txt",
    "漢数字の各桁がアラビア数字に変換されていません"
  );
});

test("話数を変換し、必要に応じて元の漢数字も残す", () => {
  const service = new KansujiService();

  assert.equal(
    service.affix().toArabic("第十二話.txt"),
    "第12話.txt",
    "第十二話が第12話に変換されていません"
  );
  assert.equal(
    service.affix().keep().toArabic("第十二話.txt"),
    "第12（十二）話.txt",
    "漢数字を残す設定が結果に反映されていません"
  );
});