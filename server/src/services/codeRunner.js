import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Safe Subprocess Code Execution Service with Timeouts and Resource Limits
 */
export async function executeCodeSandbox({ code, language = 'javascript', stdin = '' }) {
  const normalizedLang = language.toLowerCase();
  const startTime = Date.now();

  const tempDir = path.join(os.tmpdir(), 'codevigil_runner');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let command = '';
  let args = [];
  let tempFilePath = '';

  if (normalizedLang === 'javascript' || normalizedLang === 'node') {
    tempFilePath = path.join(tempDir, `${executionId}.mjs`);
    fs.writeFileSync(tempFilePath, code, 'utf-8');
    command = 'node';
    args = [tempFilePath];
  } else if (normalizedLang === 'python' || normalizedLang === 'py') {
    tempFilePath = path.join(tempDir, `${executionId}.py`);
    fs.writeFileSync(tempFilePath, code, 'utf-8');
    command = 'python';
    args = [tempFilePath];
  } else {
    return {
      success: false,
      stdout: '',
      stderr: `Execution for '${language}' is not supported directly in local sandbox. Supported languages: JavaScript, Python.`,
      executionTimeMs: 0,
      exitCode: 1
    };
  }

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let isTimedOut = false;

    const child = spawn(command, args, {
      timeout: 6000,
      maxBuffer: 1024 * 512, // 512 KB
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    const timeoutTimer = setTimeout(() => {
      isTimedOut = true;
      child.kill('SIGKILL');
    }, 5000);

    if (stdin && child.stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > 50000) {
        stdout = stdout.substring(0, 50000) + '\n[Output truncated - limit reached]';
        child.kill();
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > 20000) {
        stderr = stderr.substring(0, 20000) + '\n[Stderr truncated]';
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeoutTimer);
      cleanTempFile(tempFilePath);
      resolve({
        success: false,
        stdout,
        stderr: `Process launch failed: ${err.message}`,
        executionTimeMs: Date.now() - startTime,
        exitCode: -1
      });
    });

    child.on('close', (code) => {
      clearTimeout(timeoutTimer);
      cleanTempFile(tempFilePath);

      const executionTimeMs = Date.now() - startTime;
      if (isTimedOut) {
        stderr += '\n[Execution Error]: Execution exceeded 5000ms timeout limit (Possible Infinite Loop).';
      }

      resolve({
        success: code === 0 && !isTimedOut,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        executionTimeMs,
        exitCode: code
      });
    });
  });
}

function cleanTempFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // Ignore cleanup error
    }
  }
}
