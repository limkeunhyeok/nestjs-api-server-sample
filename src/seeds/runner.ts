import { spawnSync } from 'child_process';

// pnpm run seed:dev {target}
const target = process.argv[2];

if (!target) {
  console.error('specify a seed name.');
  process.exit(1);
}

const cmd = `ts-node -r tsconfig-paths/register src/seeds/${target}.seed.ts`;

spawnSync(cmd, { stdio: 'inherit', shell: true });
