#!/usr/bin/env node

/**
 * 特定のディレクトリにあるファイル名の一部をすべて置換するスクリプト
 */

const RenamerProgram = require("./lib/cli/renamer_program");

new RenamerProgram().parse();
