#!/usr/bin/env node

/**
 * 环境变量设置辅助脚本
 * 
 * 使用方法：
 * node src/scripts/setupEnv.js
 * 
 * 此脚本帮助用户设置环境变量，复制示例文件并提供指导。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 检查.env文件是否存在
function checkEnvFile() {
  const envPath = path.join(rootDir, '.env');
  const exampleEnvPath = path.join(rootDir, '.env.example');
  
  console.log('\n======== 环境变量设置助手 ========');
  
  if (!fs.existsSync(exampleEnvPath)) {
    console.error('错误: .env.example 文件不存在。请确保项目文件完整。');
    rl.close();
    return;
  }
  
  if (fs.existsSync(envPath)) {
    console.log('检测到 .env 文件已存在。');
    rl.question('是否要覆盖现有的 .env 文件? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        copyEnvFile(exampleEnvPath, envPath);
      } else {
        console.log('保留现有的 .env 文件。');
        promptForEnvCheck();
      }
    });
  } else {
    console.log('未检测到 .env 文件。');
    copyEnvFile(exampleEnvPath, envPath);
  }
}

// 复制.env.example到.env
function copyEnvFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log('✅ 已成功创建 .env 文件。');
    console.log('\n请编辑 .env 文件，填入实际的环境变量值。');
    promptForEnvEdit();
  } catch (error) {
    console.error(`❌ 创建 .env 文件时出错: ${error.message}`);
    rl.close();
  }
}

// 提示用户编辑.env文件
function promptForEnvEdit() {
  rl.question('\n是否要查看必需的环境变量列表? (Y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'n') {
      showRequiredEnvVars();
    }
    promptForEnvCheck();
  });
}

// 显示必需的环境变量
function showRequiredEnvVars() {
  console.log('\n必需的环境变量:');
  console.log('- DATABASE_URL: 数据库连接URL');
  console.log('- SESSION_SECRET: 会话密钥');
  console.log('- NODE_ENV: 运行环境 (development/production)');
  
  console.log('\n数据库说明:');
  console.log('- 系统默认使用 Prisma ORM 进行数据库操作');
  console.log('- 确保 DATABASE_URL 正确配置，指向您的 PostgreSQL 数据库');
}

// 提示用户运行环境变量检查
function promptForEnvCheck() {
  rl.question('\n是否要运行环境变量检查脚本? (Y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'n') {
      console.log('\n运行环境变量检查脚本...');
      console.log('执行: npm run check-env');
      console.log('\n请手动运行以下命令检查环境变量:');
      console.log('npm run check-env');
    }
    
    console.log('\n完成环境变量设置后，您可以启动服务器:');
    console.log('- 开发环境: npm run dev');
    console.log('- 生产环境: npm start');
    
    rl.close();
  });
}

// 主函数
function main() {
  checkEnvFile();
}

// 运行主函数
main();

// 处理退出
rl.on('close', () => {
  console.log('\n======== 环境变量设置助手结束 ========\n');
  process.exit(0);
}); 