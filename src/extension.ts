import * as vscode from "vscode";
import { makemdWithTitle, makemdWithError, autoCommit } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  let disposableWithTitle = vscode.commands.registerCommand(
    "makemd.makemdWithTitle",
    makemdWithTitle
  );

  let disposableWithError = vscode.commands.registerCommand(
    "makemd.makemdWithError",
    makemdWithError
  );

  let disposableAutoCommit = vscode.commands.registerCommand(
    "makemd.autoCommit",
    autoCommit
  );

  context.subscriptions.push(disposableAutoCommit);
  context.subscriptions.push(disposableWithTitle);
  context.subscriptions.push(disposableWithError);

  vscode.workspace.onDidSaveTextDocument((document) => {
    if (
      document.fileName.endsWith(".md") ||
      document.fileName.match(/\.(jpg|jpeg|png|gif)$/)
    ) {
      autoCommit();
    }
  });
}

export function deactivate() {}
