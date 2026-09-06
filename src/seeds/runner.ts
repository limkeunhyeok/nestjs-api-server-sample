import { spawnSync } from 'child_process';
import * as path from 'path';

const target = process.argv[2];

if (!target) {
  console.error('Specify a seed name.');
  process.exit(1);
}

const rootPath = path.resolve(__dirname, '../../');
const tsconfigPath = path.join(rootPath, 'tsconfig.json');

const cmd = `ts-node -r tsconfig-paths/register --project ${tsconfigPath} src/seeds/${target}.seed.ts`;

spawnSync(cmd, {
  stdio: 'inherit',
  cwd: rootPath,
  shell: true,
  env: { ...process.env, NODE_ENV: 'dev' }, // 환경 변수 유지
});
