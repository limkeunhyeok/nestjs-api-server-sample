// https://pm2.keymetrics.io/

module.exports = {
  apps: [
    {
      name: 'server-prod',
      script: 'npm',
      args: 'run start:prod',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'prod',
      },
    },
  ],
};
