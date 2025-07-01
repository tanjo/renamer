#!/usr/bin/env node

/**
 * 特定のディレクトリにあるファイル名の一部をすべて置換するスクリプト
 */

const fs = require("fs");
const path = require("path");

const pico = require("picocolors");
const { program } = require("commander");

const RenamerController = require("./lib/renamer");

program
  .name("renamer")
  .version(require("./package.json").version)
  .description("特定のディレクトリにあるファイル名の一部をすべて置換するスクリプト")
  .argument("<directory>", "対象のディレクトリパス")
  .argument("[pattern]", "置換するパターン（正規表現）")
  .argument("[replacement]", "置換後の文字列")
  .option("-c, --config <path>", "設定ファイルのパス")
  .option("-d, --debug", "デバッグモード（実際のリネームは行わない）")
  .option("-r, --recursive", "サブディレクトリも再帰的に処理する")
  .action((directory, pattern, replacement, options) => {
    const configPath = options.config;
    if (configPath) {
      if (!fs.existsSync(configPath)) {
        console.error(pico.redBright(`指定された設定ファイルが存在しません: ${configPath}`));
        process.exit(1);
      }
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        options.pattern = new RegExp(config.pattern) || pattern;
        options.replacement = config.replacement || replacement;
        options.debug = config.debug || options.debug;
        options.recursive = config.recursive || options.recursive;
      } catch (err) {
        console.error(pico.redBright(`設定ファイルの読み込みに失敗しました: ${err.message}`));
        process.exit(1);
      }
    }

    const targetDir = path.resolve(directory);
    if (!fs.existsSync(targetDir)) {
      console.error(pico.redBright(`指定されたディレクトリが存在しません: ${targetDir}`));
      process.exit(1);
    }
    if (!pattern || pattern === "") {
      console.error(pico.redBright("置換パターンが指定されていません。正規表現を使用してください。"));
      process.exit(1);
    }
    const targetPattern = new RegExp(pattern); // デフォルトは空の正規表現
    if (!targetPattern) {
      console.error(pico.redBright("置換パターンが正しく指定されていません。正規表現を使用してください。"));
      process.exit(1);
    }
    const targetReplacement = replacement || "";
    const isDebug = options.debug;
    const recursive = options.recursive;

    const renamerController = new RenamerController();
    renamerController.run({
      directory: targetDir,
      isDebug,
      pattern: targetPattern,
      replacement: targetReplacement,
      recursive
    });
  });
program.parse();
