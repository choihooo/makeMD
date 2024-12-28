import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// 커서 위치 및 활성 에디터
let cursorPosition: vscode.Position | null = null;
let activeEditor: vscode.TextEditor | undefined =
  vscode.window.activeTextEditor;

// 이미지 파일 선택 창 열기 및 마크다운 삽입
export async function openImageFileDialog() {
  activeEditor = vscode.window.activeTextEditor;
  cursorPosition = activeEditor ? activeEditor.selection.start : null;

  // 파일 선택 창 설정
  const fileUri = await vscode.window.showOpenDialog({
    canSelectMany: false, // 하나의 파일만 선택 가능
    openLabel: "이미지 선택",
    filters: {
      Images: ["png", "jpg", "jpeg", "gif", "svg"], // 이미지 파일 필터링
    },
  });

  // 파일이 선택되지 않은 경우
  if (!fileUri || fileUri.length === 0) {
    vscode.window.showWarningMessage("파일이 선택되지 않았습니다.");
    return;
  }

  const selectedFilePath = fileUri[0].fsPath; // 선택된 파일 경로
  vscode.window.showInformationMessage(`선택된 파일: ${selectedFilePath}`);

  // 이미지 복사 및 마크다운 삽입
  insertImageIntoMarkdown(selectedFilePath);
}

// 선택한 이미지를 복사하고 마크다운 파일에 삽입
export async function insertImageIntoMarkdown(selectedFilePath: string) {
  if (!activeEditor || activeEditor.document.languageId !== "markdown") {
    vscode.window.showErrorMessage(
      "마크다운 파일에서만 이미지를 삽입할 수 있습니다."
    );
    return;
  }

  const markdownFileName = path.basename(activeEditor.document.fileName, ".md");
  const imageFolderPath = path.join(
    vscode.workspace.rootPath || "",
    "public",
    "images",
    markdownFileName
  );

  if (!fs.existsSync(imageFolderPath)) {
    fs.mkdirSync(imageFolderPath, { recursive: true });
  }

  const imageFileName = path.basename(selectedFilePath);
  let finalImagePath = path.join(imageFolderPath, imageFileName);
  let imageCounter = 1;

  while (fs.existsSync(finalImagePath)) {
    const baseName = path.basename(imageFileName, path.extname(imageFileName));
    finalImagePath = path.join(
      imageFolderPath,
      `${baseName}(${imageCounter})${path.extname(imageFileName)}`
    );
    imageCounter++;
  }

  fs.copyFileSync(selectedFilePath, finalImagePath);

  const relativePath = path.relative(
    path.dirname(activeEditor.document.fileName),
    finalImagePath
  );

  if (activeEditor) {
    await activeEditor.edit((editBuilder) => {
      const position = cursorPosition ?? new vscode.Position(0, 0);
      editBuilder.insert(position, `![이미지 설명](${relativePath})\n`);
    });
    vscode.window.showInformationMessage(
      `이미지가 추가되었습니다: ${finalImagePath}`
    );
  } else {
    vscode.window.showErrorMessage("활성화된 에디터가 없습니다.");
  }
}
