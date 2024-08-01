import * as vscode from "vscode";
import { makemdWithTitle, makemdWithError } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  let disposableWithTitle = vscode.commands.registerCommand(
    "makemd.makemdWithTitle",
    makemdWithTitle
  );

  let disposableWithError = vscode.commands.registerCommand(
    "makemd.makemdWithError",
    makemdWithError
  );

  context.subscriptions.push(disposableWithTitle);
  context.subscriptions.push(disposableWithError);
}

export function deactivate() {}
