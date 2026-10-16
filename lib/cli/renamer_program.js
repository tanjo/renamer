const fs = require("node:fs");
const path = require("node:path");
const pico = require("picocolors");
const { Command } = require("commander");

const RenamerController = require("../renamer");
const RenamerModel = require("../model/renamer_model");

class RenamerProgram {
  constructor() {
    this.program = new Command();
    this.program
      .name("renamer")
      .version(require("../../package.json").version)
      .description("特定のディレクトリにあるファイル名の一部をすべて置換するスクリプト")
      .argument("<directory>", "対象のディレクトリパス")
      .argument("[pattern]", "置換するパターン（正規表現）")
      .argument("[replacement]", "置換後の文字列（正規表現でマッチしたものを利用する場合は \\$1、\\$2 のように記載）")
      .option("-c, --config <path>", "設定ファイルのパス")
      .option("-d, --debug", "デバッグモード（実際のリネームは行わない）")
      .option("-r, --recursive", "サブディレクトリも再帰的に処理する")
      .option("-a, --kansuji-to-arabic", "漢数字をアラビア数字に変換する")
      .option("-x, --affix-kansuji-to-arabic", "「第XXX話」の形式の漢数字をアラビア数字に変換する")
      .option("-k, --keep-kansuji", "漢数字を残す")
      .option("-l, --length <number>", "ファイルの文字数を確認する. 指定した文字数より長いファイル名のみを対象とする", parseInt)
      .option("-s, --length-diff", "変更前・変更後のファイル名の長さを表示する")
      .action((directory, pattern, replacement, options) => {
        this.execute(directory, pattern, replacement, options);
      });
  }

  parse(argv) {
    this.program.parse(argv);
  }

  execute(directory, pattern, replacement, options) {
    try {
      const configured = this.applyConfig(options, pattern, replacement);
      const targetDirectory = path.resolve(directory);
      if (!fs.existsSync(targetDirectory)) {
        throw new Error(`指定されたディレクトリが存在しません: ${targetDirectory}`);
      }

      const model = new RenamerModel(
        targetDirectory,
        configured.pattern,
        configured.replacement,
        configured.options
      );
      new RenamerController().run(model.toRunOptions());
    } catch (err) {
      console.error(pico.redBright(err.message));
      process.exitCode = 1;
    }
  }

  applyConfig(options, pattern, replacement) {
    if (!options.config) {
      return { options, pattern, replacement };
    }
    if (!fs.existsSync(options.config)) {
      throw new Error(`指定された設定ファイルが存在しません: ${options.config}`);
    }

    let config;
    try {
      config = JSON.parse(fs.readFileSync(options.config, "utf8"));
    } catch (err) {
      throw new Error(`設定ファイルの読み込みに失敗しました: ${err.message}`);
    }

    return {
      pattern: config.pattern || pattern,
      replacement: config.replacement || replacement,
      options: {
        ...options,
        debug: config.debug || options.debug,
        recursive: config.recursive || options.recursive,
        kansujiToArabic: config.kansujiToArabic || options.kansujiToArabic,
        affixKansujiToArabic: config.affixKansujiToArabic || options.affixKansujiToArabic,
        keepKansuji: config.keepKansuji || options.keepKansuji,
        length: config.length || options.length,
        lengthDiff: config.lengthDiff || options.lengthDiff,
      },
    };
  }
}

module.exports = RenamerProgram;