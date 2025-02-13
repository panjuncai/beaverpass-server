module.exports = {
    apps: [
      {
        name: "beaverpass",
        script: "src/app.js",
        // 在启动时预加载 dotenv
        node_args: "-r dotenv/config",
        env: {
          NODE_ENV: "production",
        },
        env_development: {
          NODE_ENV: "development",
        },
      },
    ],
  };
  