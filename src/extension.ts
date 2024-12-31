import * as vscode from "vscode";
import { createTaskTemplate } from "./commands";
import { openImageFileDialog } from "./commands";
import { createMarkdownTemplate } from "./commands"; // 새로 추가된 명령어 import
import { registerCommands } from "./commands/index";

// 확장 활성화
export function activate(context: vscode.ExtensionContext) {
  // TIL 템플릿 생성 명령 등록
  let disposableCreateTaskTemplate = vscode.commands.registerCommand(
    "makemd.createTaskTemplate",
    createTaskTemplate
  );
  context.subscriptions.push(disposableCreateTaskTemplate);

  // 이미지 선택 및 삽입 기능 등록
  let disposableSelectImage = vscode.commands.registerCommand(
    "makemd.selectAndInsertImage",
    () => {
      openImageFileDialog();
    }
  );
  context.subscriptions.push(disposableSelectImage);

  // 마크다운 파일 생성 기능 등록 (새로운 명령어)
  let disposableCreateMarkdown = vscode.commands.registerCommand(
    "makemd.createMarkdownFile",
    () => {
      createMarkdownTemplate();
    }
  );
  context.subscriptions.push(disposableCreateMarkdown);

  registerCommands(context);
}

// 확장 비활성화
export function deactivate() {}
