import * as vscode from "vscode";

export * from "./insertImageIntoMarkdown";
export { createTaskTemplate } from "./createTaskTemplate";
export * from "./createMarkdown";
import { registerHighlightCommand } from "./highlightText";

export function registerCommands(context: vscode.ExtensionContext) {
  registerHighlightCommand(context);
}
