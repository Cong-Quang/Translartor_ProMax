const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendDir = path.resolve(__dirname, '../server/backend');
const frontendDir = path.resolve(__dirname, './frontend');
const venvPython = path.resolve(backendDir, 'venv/Scripts/python.exe');
const pythonExec = fs.existsSync(venvPython) ? venvPython : 'python';

function log(name, data, colorCode) {
    const lines = data.toString().split(/\r?\n/);
    lines.forEach(line => {
        if (line.trim()) {
            // Hiển thị nhãn có màu sắc: 33 = Vàng (Backend), 32 = Xanh lá (Frontend)
            console.log(`\x1b[${colorCode}m[${name}]\x1b[0m ${line.trim()}`);
        }
    });
}

console.log("\x1b[1m=== Translartor ProMax Unified Launcher ===\x1b[0m\n");

// 1. Khoi chay Backend
// Boc duong dan trong dau ngoac kep de xu ly dau cach trong ten thu muc
const backend = spawn(`"${pythonExec}"`, ['main.py'], {
    cwd: backendDir,
    shell: true,
    env: { ...process.env, PYTHONUNBUFFERED: "1" }
});

backend.stdout.on('data', (d) => log('BACKEND', d, '33'));
backend.stderr.on('data', (d) => log('BACKEND', d, '31')); // Mau do cho loi

// 2. Khoi chay Frontend
// Su dung npm.cmd cho Windows
const frontend = spawn('npm.cmd', ['run', 'dev', '--', '--port', '3000', '--open', '--clearScreen', 'false'], {
    cwd: frontendDir,
    shell: true
});

frontend.stdout.on('data', (d) => log('FRONTEND', d, '32'));
frontend.stderr.on('data', (d) => log('FRONTEND', d, '31'));

// Xu ly khi tat
process.on('SIGINT', () => {
    console.log("\n[SYSTEM] Dang dung cac dich vu...");
    backend.kill();
    frontend.kill();
    process.exit();
});
