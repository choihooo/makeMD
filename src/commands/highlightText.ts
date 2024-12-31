import * as vscode from "vscode";

// HighlightColor 타입 정의 (yellow, blue, red만 허용)
type HighlightColor = "yellow" | "blue" | "red";

// 텍스트에 형광펜 적용
function applyHighlight(color: HighlightColor) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("활성화된 에디터가 없습니다.");
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  // 형광펜 색상 매핑
  const highlightText: Record<HighlightColor, string> = {
    yellow: `==(노랑)${text}==`,
    blue: `==(파랑)${text}==`,
    red: `==(빨강)${text}==`,
  };

  // 선택된 색상에 따라 텍스트 치환
  const highlight = highlightText[color];

  editor.edit((editBuilder) => {
    editBuilder.replace(selection, highlight);
  });
}

// 명령어 등록
export function registerHighlightCommand(context: vscode.ExtensionContext) {
  // 노랑 형광펜 명령어
  let highlightYellow = vscode.commands.registerCommand(
    "extension.highlightYellow",
    () => applyHighlight("yellow")
  );

  // 파랑 형광펜 명령어
  let highlightBlue = vscode.commands.registerCommand(
    "extension.highlightBlue",
    () => applyHighlight("blue")
  );

  // 빨강 형광펜 명령어
  let highlightRed = vscode.commands.registerCommand(
    "extension.highlightRed",
    () => applyHighlight("red")
  );

  // 명령어 구독
  context.subscriptions.push(highlightYellow, highlightBlue, highlightRed);
}
