// https://pm2.keymetrics.io/
module.exports = {
  apps: [
    {
      name: 'server-dev',
      script: 'npm',
      args: 'run start:dev',
      exec_mode: 'fork',
      instance_var: 'INSTANCE_ID',
      instances: 1,
      autorestart: true,
      env: {},
    },
    {
      name: 'server-prod',
      script: 'npm',
      args: 'run start:prod',
      exec_mode: 'fork',
      instance_var: 'INSTANCE_ID',
      instances: 1,
      autorestart: true,
      env: {},
    },
  ],
};
