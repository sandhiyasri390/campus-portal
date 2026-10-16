const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const isWin = process.platform === 'win32';
const npm = isWin ? 'npm.cmd' : 'npm';

function run(name, cwd, args) {
  const p = spawn(npm, args, {
    cwd,
    shell: isWin,
    stdio: 'inherit'
  });

  p.on('error', (err) => {
    console.error(`[${name}]`, err.message);
  });

  return p;
}

const install = process.argv.includes('--install');

async function main() {
  if (install) {
    for (const folder of ['backend', 'frontend']) {
      console.log(`Installing ${folder} dependencies...`);
      const code = await new Promise((resolve) => {
        const p = run(folder, path.join(root, folder), ['install']);
        p.on('close', resolve);
      });

      if (code !== 0) {
        console.error(`${folder} installation failed.`);
        process.exitCode = 1;
        return;
      }
    }

    console.log('Setup complete. Run npm.cmd run dev');
    return;
  }

  const backend = run('backend', path.join(root, 'backend'), ['start']);
  const frontend = run('frontend', path.join(root, 'frontend'), ['run', 'dev']);

  function stop() {
    backend.kill();
    frontend.kill();
  }

  process.on('SIGINT', stop);
  process.on('exit', stop);
}

main();
