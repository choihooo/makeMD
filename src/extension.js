"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function activate(context) {
    let disposable = vscode.commands.registerCommand("makemd.makemd", async () => {
        try {
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
            // 파일 내용 정의
            const content = `---
title: Your title
date: ${formattedDateTime}
categories: []
tags: []		
---`;
            const fileName = `${formattedDate}-.md`;
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage("워크스페이스 폴더가 열려 있지 않습니다.");
                return;
            }
            const filePath = path.join(workspaceFolder.uri.fsPath, fileName);
            const uri = vscode.Uri.file(filePath);
            // 파일 생성 및 내용 쓰기
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
            // 문서 열기
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document);
            vscode.window.showInformationMessage(`파일이 생성되었습니다: ${fileName}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`파일 생성 실패: ${error.message}`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map