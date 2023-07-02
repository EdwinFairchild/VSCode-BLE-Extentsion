import * as vscode from 'vscode';

function createWebviewPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'maxblugenWebview',
        'MaxBluGen',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        }
    );

    return panel;
}

async function setWebviewHtml(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'webview.html');

    const data = await vscode.workspace.fs.readFile(htmlPath);
    const dataAsString = new TextDecoder().decode(data);

    const htmlUrl = panel.webview.asWebviewUri(htmlPath);
    let htmlContent = dataAsString.replace(/(href|src)="\.\//g, `$1="${htmlUrl.toString()}/`);
    panel.webview.html = htmlContent;
}

function handleWebviewMessages(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    panel.webview.onDidReceiveMessage(
		async message => {
			switch (message.type) {
				case 'buttonClicked':
					vscode.window.showInformationMessage(message.text);
					break;
				case 'writeToFile':
					const filePath = vscode.Uri.joinPath(context.extensionUri, 'myFile.txt');
					const writeData = new TextEncoder().encode('Hello, file!');
					await vscode.workspace.fs.writeFile(filePath, writeData);
					vscode.window.showInformationMessage('Written to file!');
					break;
				case 'saveConfig':
					const configFilePath = vscode.Uri.joinPath(context.extensionUri, 'config.json');
					const configData = new TextEncoder().encode(JSON.stringify(message.data));
					await vscode.workspace.fs.writeFile(configFilePath, configData);
					vscode.window.showInformationMessage('Configuration saved!');
					break;
			}
		},
		undefined,
		context.subscriptions
	);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "maxblugen" is now active in the web extension host!');

    let disposable = vscode.commands.registerCommand('maxblugen.helloWorld', async () => {
        const panel = createWebviewPanel(context);
        await setWebviewHtml(panel, context);
        handleWebviewMessages(panel, context);
    });

    let writeDisposable = vscode.commands.registerCommand('maxblugen.writeToFile', async () => {
        const filePath = vscode.Uri.joinPath(context.extensionUri, 'myFile.txt');
        const writeData = new TextEncoder().encode('Hello, file!');
        await vscode.workspace.fs.writeFile(filePath, writeData);
        vscode.window.showInformationMessage('Written to file!');
    });
    context.subscriptions.push(disposable, writeDisposable);
}

export function deactivate() {}
