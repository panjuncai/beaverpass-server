module.exports = {
  apps: [
    {
      name: "beaverpass",
      script: "src/index.js",
      // 在启动时预加载 dotenv
      node_args: "-r dotenv/config",
      env: {
        NODE_ENV: "production",
        SUPABASE_URL:"https://xruwlkmlmswfbwfffqkj.supabase.co",
        SUPABASE_SERVICE_KEY:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydXdsa21sbXN3ZmJ3ZmZmcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODA5ODAsImV4cCI6MjA1Njc1Njk4MH0.SZaR3YVqLLERDIXFoM9uCC6YCKTVlm06FIGyp4NPIW8"
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
}; 