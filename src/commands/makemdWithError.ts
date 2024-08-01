import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export async function makemdWithError() {
  try {
    // 사용자로부터 타이틀 입력 받기
    const title = await vscode.window.showInputBox({
      placeHolder: "Enter the title for the post",
      prompt: "Please enter a title for the post",
      validateInput: (input: string) => {
        return input.trim() === "" ? "Title cannot be empty" : null;
      },
    });

    if (!title) {
      vscode.window.showErrorMessage("타이틀이 입력되지 않았습니다.");
      return;
    }

    // 현재 날짜와 시간 정보 가져오기
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const formattedDateTime = `${formattedDate} ${hours}:${minutes}:${seconds}+0900`;

    // 파일 이름 및 내용 정의
    const fileName = `${formattedDate}-${title}.md`;
    const content = `---
title: ${title}
date: ${formattedDateTime}
categories: []
tags: []
---

#  🧑‍🏫 ${title} 

##  💥 문제상황

##  🖋 해결방법

##  💬 배운점`;

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      vscode.window.showErrorMessage("워크스페이스 폴더가 열려 있지 않습니다.");
      return;
    }

    // _posts 폴더 경로
    const postsFolderPath = path.join(workspaceFolder.uri.fsPath, "_posts");

    // _posts 폴더가 없으면 생성
    if (!fs.existsSync(postsFolderPath)) {
      fs.mkdirSync(postsFolderPath, { recursive: true });
    }

    const filePath = path.join(postsFolderPath, fileName);
    const uri = vscode.Uri.file(filePath);

    // 파일 생성 및 내용 쓰기
    await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));

    // 문서 열기
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(`파일이 생성되었습니다: ${fileName}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`파일 생성 실패: ${error.message}`);
  }
}
