import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { PassThrough, Readable } from 'stream';

class ChildProcessApp {
  app: ChildProcessWithoutNullStreams | null = null;
  private activeCommand: { endMarker: string; outputStream: PassThrough, endCommand: string } | null = null;

  constructor({ app, args, options }: { app: string; args: string[]; options: object } = { app: 'pwsh', args: [], options: {} }) {
    this.app = spawn(app, args, { stdio: ['pipe', 'pipe', 'pipe'], ...options });
    this.app.stdin.write(this.modifiPowerShellPrompt('[xuejp]> '))
    this.setupOutputHandler();
  }

  modifiPowerShellPrompt(prompt: string) {
    return `function Prompt(){ return '${prompt}'}\n`
  }
  // 设置全局输出处理器
  private setupOutputHandler() {
    if (!this.app) return;

    let buffer = '';
    const handleOutput = (data: Buffer) => {
      const strData = data.toString();
      buffer += strData;

      // 检查是否包含结束标记
      if (this.activeCommand && strData.includes(this.activeCommand.endMarker)) {
        debugger

        const parts = buffer.split(new RegExp(`${this.activeCommand.endCommand}|${this.activeCommand.endMarker}`, 'g'));
        let aa = parts.slice(0, -1)
        // 推送结束标记前的所有内容
        parts.slice(0, -1).forEach((part) => {
          this.activeCommand?.outputStream.write(part);
        })
        // buffer = parts.slice(1).join(this.activeCommand?.endMarker || '');

        // 结束当前命令的流
        this.activeCommand.outputStream.end();
        this.activeCommand = null;
      }
    };

    this.app.stdout.on('data', handleOutput);
    this.app.stderr.on('data', (data) => {
      if (this.activeCommand) {
        this.activeCommand.outputStream.write(data);
      }
    });
  }

  execCMD(cmdStr: string): Promise<Readable> {
    return new Promise((res, rej) => {
      if (!this.app || !cmdStr) return rej('No active app or command string');
      if (this.activeCommand) return rej('Previous command still executing');

      // 生成唯一结束标记 (避免与正常输出冲突)
      const endMarker = `END_CMD_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const outputStream = new PassThrough();

      const endCommand = `Write-Output ${endMarker}`;
      // 在命令末尾添加结束标记输出
      const fullCommand = `${cmdStr};${endCommand}`;
      this.activeCommand = { endMarker, outputStream, endCommand };

      this.app.stdin.write(`${fullCommand}\n`, (err) => {
        if (err) {
          this.activeCommand = null;
          rej(err);
        } else {
          res(outputStream);
        }
      });
    });
  }
}

new ChildProcessApp().execCMD('11+22').then(stream => stream.pipe(process.stdout))