const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand('aiAgentOffice.openOffice', () => {
    const panel = vscode.window.createWebviewPanel(
      'aiAgentOffice',
      'AI Agent Office',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
      }
    );

    panel.iconPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'office-icon.svg'));
    panel.webview.html = getWebviewHtml(context, panel.webview);
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

function getWebviewHtml(context, webview) {
  const mediaPath = path.join(context.extensionPath, 'media');
  const htmlPath = path.join(mediaPath, 'office.html');
  const cssUri = webview.asWebviewUri(vscode.Uri.file(path.join(mediaPath, 'office.css')));
  const jsUri = webview.asWebviewUri(vscode.Uri.file(path.join(mediaPath, 'office.js')));
  const nonce = getNonce();

  return fs
    .readFileSync(htmlPath, 'utf8')
    .replaceAll('{{cspSource}}', webview.cspSource)
    .replaceAll('{{cssUri}}', String(cssUri))
    .replaceAll('{{jsUri}}', String(jsUri))
    .replaceAll('{{nonce}}', nonce);
}

function getNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';

  for (let index = 0; index < 32; index += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return value;
}

module.exports = {
  activate,
  deactivate
};
