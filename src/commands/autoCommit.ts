import * as vscode from "vscode";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as iconv from "iconv-lite";

// Promisify exec to use async/await
const execPromise = promisify(exec);

// Git 저장소의 루트 경로를 찾는 함수
async function findGitRoot(startPath: string): Promise<string | null> {
  let currentPath = path.resolve(startPath);
  while (currentPath !== path.parse(currentPath).root) {
    if (fs.existsSync(path.join(currentPath, ".git"))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
}

// Git 상태를 가져오는 함수
async function getGitStatus(gitRoot: string): Promise<string> {
  const { stdout } = await execPromise("git status --porcelain", {
    cwd: gitRoot,
  });
  return stdout.trim();
}

// 커밋 및 푸시를 수행하는 함수
async function commitAndPush(message: string, gitRoot: string): Promise<void> {
  await execPromise("git add .", { cwd: gitRoot });
  await execPromise(`git commit -m "${message}"`, { cwd: gitRoot });
  await execPromise("git push", { cwd: gitRoot });
}

// 파일 이름에서 제목을 추출하는 함수
function extractTitleFromFileName(fileName: string): string {
  const baseName = path.parse(fileName).name;
  // 정규 표현식을 사용하여 날짜 형식 (YYYY-MM-DD) 제거
  return baseName.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

// 파일 이름을 디코딩하는 함수
function decodeFileName(fileName: string): string {
  try {
    const decoded = iconv.decode(Buffer.from(fileName, "binary"), "utf8");
    return decoded;
  } catch {
    return fileName; // 디코딩 실패 시 원본 파일 이름 반환
  }
}

// 파일 이름을 정리하는 함수
function sanitizeFileName(fileName: string): string {
  // 날짜 형식 (YYYY-MM-DD-) 제거
  let sanitized = fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "");

  // 불필요한 공백 및 특수 문자 제거
  sanitized = sanitized.replace(/[^\w\s]/g, "").trim();

  // 이중 공백을 단일 공백으로 변환
  sanitized = sanitized.replace(/\s{2,}/g, " ");

  return sanitized;
}

// 자동 커밋 및 푸시를 수행하는 함수
async function autoCommit() {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("워크스페이스 폴더가 열려 있지 않습니다.");
      return;
    }

    const gitRoot = await findGitRoot(workspaceFolder.uri.fsPath);
    if (!gitRoot) {
      vscode.window.showErrorMessage(
        "현재 폴더 또는 상위 폴더가 Git 저장소가 아닙니다."
      );
      return;
    }

    const gitStatus = await getGitStatus(gitRoot);
    if (gitStatus === "") {
      vscode.window.showInformationMessage("변경된 파일이 없습니다.");
      return;
    }

    console.log(`Git Status: ${gitStatus}`);

    const statusMap: { [key: string]: string } = {
      A: "post",
      M: "update",
      D: "delete",
      "??": "add",
    };

    let commitMessages: string[] = [];
    for (const line of gitStatus.split("\n")) {
      const status = line.slice(0, 2).trim();
      const file = line.slice(3).trim();
      const fileName = path.basename(file);

      // 파일 이름 디코딩
      const decodedFileName = decodeFileName(fileName);

      console.log(`원본 파일 이름: ${fileName}`); // 디버깅 로그
      console.log(`디코딩된 파일 이름: ${decodedFileName}`); // 디버깅 로그

      const title = extractTitleFromFileName(decodedFileName);
      console.log(`추출된 제목: ${title}`); // 디버깅 로그

      const sanitizedTitle = sanitizeFileName(title); // 파일 이름 정리
      console.log(`정리된 제목: ${sanitizedTitle}`); // 디버깅 로그

      const statusMessage = statusMap[status as keyof typeof statusMap];

      if (statusMessage) {
        const message = `${statusMessage}: ${sanitizedTitle}`;
        commitMessages.push(message);
      }
    }

    if (commitMessages.length === 0) {
      vscode.window.showInformationMessage(
        "최근 변경된 파일의 제목을 찾을 수 없습니다."
      );
      return;
    }

    // 사용자에게 커밋 메시지 수정 요청
    const initialMessage = commitMessages.join(", ");
    const commitMessage = await vscode.window.showInputBox({
      prompt: "커밋 메시지를 수정하거나 입력하세요:",
      value: initialMessage,
    });

    if (!commitMessage) {
      vscode.window.showInformationMessage(
        "커밋 메시지가 입력되지 않았습니다."
      );
      return;
    }

    // 사용자 정의 메시지로 커밋 및 푸시
    await commitAndPush(commitMessage, gitRoot);
    vscode.window.showInformationMessage(`커밋 및 푸시 완료: ${commitMessage}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`커밋 및 푸시 실패: ${error.message}`);
    } else {
      vscode.window.showErrorMessage(
        "커밋 및 푸시 실패: 알 수 없는 오류가 발생했습니다."
      );
    }
  }
}

export { autoCommit };
