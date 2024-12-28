import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// 마크다운 파일 생성 함수
export async function createMarkdownTemplate() {
  const offset = 9; // 한국은 UTC+9
  const today = new Date(new Date().getTime() + offset * 3600 * 1000);
  const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD 형식

  // 타이틀 입력 (기본값: [LOG]YYYY-MM-DD)
  const title = await vscode.window.showInputBox({
    prompt: "마크다운 파일 제목을 입력하세요",
    value: `[LOG]${formattedDate}`,
    placeHolder: "예: 프로젝트 회의록, 일일 보고서 등",
  });

  if (!title) {
    vscode.window.showWarningMessage("파일 생성이 취소되었습니다.");
    return;
  }

  // 카테고리 선택
  const mainCategory = await vscode.window.showQuickPick(
    ["all", "dev", "uiux", "story", "plan"],
    {
      placeHolder: "메인 카테고리를 선택하세요",
    }
  );

  if (!mainCategory) {
    vscode.window.showWarningMessage("카테고리 선택이 취소되었습니다.");
    return;
  }

  // 워크스페이스 폴더 확인
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("워크스페이스 폴더가 열려 있지 않습니다.");
    return;
  }

  // 마크다운 파일 내용
  const content = `---
title: "${title}"
date: "${formattedDate}"
tags: ["example", ""]
category:
  main: "${mainCategory}"
  sub: ""
---

### 오늘의 할 일

- [ ] Add tasks here

### 내일의 할 일

- [ ] Plan tomorrow's tasks
`;

  const fileName = `${title}.md`; // 파일명: 사용자가 입력한 제목
  const filePath = path.join(
    workspaceFolder.uri.fsPath,
    "public",
    "posts",
    fileName
  );

  // 파일 중복 확인 및 덮어쓰기 여부 확인
  if (fs.existsSync(filePath)) {
    const overwrite = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "파일이 이미 존재합니다. 덮어쓰시겠습니까?",
    });
    if (overwrite === "No") {
      vscode.window.showInformationMessage("파일 생성을 취소했습니다.");
      return;
    }
  }

  // 파일 생성 및 작성
  const uri = vscode.Uri.file(filePath);
  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));

  // 생성된 파일을 에디터에서 열기
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);

  vscode.window.showInformationMessage(
    `마크다운 파일이 생성되었습니다: ${fileName}`
  );
}
