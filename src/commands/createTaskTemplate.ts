import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export async function createTaskTemplate() {
  const offset = 9; // 한국은 UTC+9
  const today = new Date(new Date().getTime() + offset * 3600 * 1000);
  const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD 형식
  const title = `[LOG]${formattedDate}`;
  const tags = ["example", ""];
  const category = {
    main: "dev", // 메인 카테고리를 "dev"로 자동 설정
    sub: "",
  };

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("워크스페이스 폴더가 열려 있지 않습니다.");
    return;
  }

  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const yesterdaysFileName = `[LOG]${yesterday}.md`;
  const yesterdaysFilePath = path.join(
    workspaceFolder.uri.fsPath,
    "public",
    "posts",
    yesterdaysFileName
  );

  let tomorrowsTasks = "";
  let somedayTasks = "";

  if (fs.existsSync(yesterdaysFilePath)) {
    const yesterdaysContent = fs.readFileSync(yesterdaysFilePath, "utf8");
    const tasksMatch = yesterdaysContent.match(/### 내일의 할 일\n\n([^#]*)/);
    if (tasksMatch) {
      tomorrowsTasks = tasksMatch[1].trim();
    }
    const somedayMatch = yesterdaysContent.match(/### 언젠가 할 일\n\n([^#]*)/);
    if (somedayMatch) {
      somedayTasks = somedayMatch[1].trim();
    }
  }

  const content = `---
title: "${title} TIL"
date: "${formattedDate}"
tags: ${JSON.stringify(tags)}
category:
  main: "${category.main}"  // main 카테고리 자동 설정
  sub: "${category.sub}"
---

### 오늘의 할 일

${tomorrowsTasks}

### 내일의 할 일

- [ ] Add future tasks here

### 언젠가 할 일

${somedayTasks}`;

  const fileName = `${title}.md`; // 파일 이름 형식 설정

  const filePath = path.join(
    workspaceFolder.uri.fsPath,
    "public",
    "posts",
    fileName
  ); // public/posts 폴더에 파일 저장

  if (fs.existsSync(filePath)) {
    const overwrite = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "파일이 이미 존재합니다. 덮어쓰시겠습니까?",
    });
    if (overwrite === "No") {
      vscode.window.showInformationMessage("템플릿 생성을 취소했습니다.");
      return;
    }
  }

  const uri = vscode.Uri.file(filePath);

  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);

  vscode.window.showInformationMessage(`템플릿이 생성되었습니다: ${fileName}`);
}
