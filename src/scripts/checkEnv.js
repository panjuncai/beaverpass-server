#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 
 * 使用方法：
 * node src/scripts/checkEnv.js
 * 
 * 此脚本用于检查环境变量是否正确设置，可以在应用程序启动前单独运行。
 */

import loadEnv from '../config/env.js';

// 加载环境变量
loadEnv();

// 定义环境变量检查配置
const ENV_CONFIG = {
  // 必需的环境变量及其描述
  required: {
    'DATABASE_URL': '数据库连接URL',
    'SESSION_SECRET': '会话密钥',
    'NODE_ENV': '运行环境 (development/production)',
    'SUPABASE_URL': 'Supabase项目URL',
    'SUPABASE_KEY': 'Supabase API密钥'
  },
  
  // 可选但推荐的环境变量及其描述
  recommended: {
    'PORT': '服务器端口号',
    'DIRECT_URL': '直接数据库连接URL（用于Prisma）',
    'AWS_REGION': 'AWS区域',
    'AWS_ACCESS_KEY_ID': 'AWS访问密钥ID',
    'AWS_SECRET_ACCESS_KEY': 'AWS秘密访问密钥',
    'AWS_S3_BUCKET_NAME': 'S3存储桶名称',
    'USE_PRISMA': '是否使用Prisma (true/false)'
  },
  
  // 特定环境的环境变量
  environments: {
    development: {
      'DEBUG': '调试模式 (true/false)'
    },
    production: {
      'SENTRY_DSN': 'Sentry错误跟踪DSN'
    }
  }
};

/**
 * 检查环境变量是否设置
 * @param {Object} vars - 要检查的环境变量及其描述
 * @param {boolean} isRequired - 是否为必需的环境变量
 * @returns {boolean} 是否所有必需的环境变量都已设置
 */
function checkVars(vars, isRequired = false) {
  let allSet = true;
  
  for (const [name, description] of Object.entries(vars)) {
    if (process.env[name]) {
      // 对于敏感信息，只显示是否存在，不显示具体值
      const isSensitive = name.includes('SECRET') || 
                         name.includes('KEY') || 
                         name.includes('PASSWORD') || 
                         name.includes('URL') ||
                         name.includes('TOKEN');
      
      const value = isSensitive ? '[已设置]' : process.env[name];
      console.log(`✅ ${name}: ${value} - ${description}`);
    } else {
      const prefix = isRequired ? '❌' : '⚠️';
      console.log(`${prefix} ${name}: 未设置 - ${description}`);
      if (isRequired) {
        allSet = false;
      }
    }
  }
  
  return allSet;
}

// 主函数
function main() {
  console.log('\n======== 环境变量检查 ========');
  console.log('当前环境:', process.env.NODE_ENV || 'development');
  console.log('\n--- 必需的环境变量 ---');
  const requiredCheck = checkVars(ENV_CONFIG.required, true);
  
  console.log('\n--- 推荐的环境变量 ---');
  checkVars(ENV_CONFIG.recommended);
  
  // 检查特定环境的环境变量
  const currentEnv = process.env.NODE_ENV || 'development';
  if (ENV_CONFIG.environments[currentEnv]) {
    console.log(`\n--- ${currentEnv} 环境特定的环境变量 ---`);
    checkVars(ENV_CONFIG.environments[currentEnv]);
  }
  
  console.log('\n--- 总结 ---');
  if (requiredCheck) {
    console.log('✅ 所有必需的环境变量已设置。');
  } else {
    console.log('❌ 一些必需的环境变量未设置，这可能导致应用程序无法正常工作。');
  }
  
  console.log('==============================\n');
  
  return requiredCheck;
}

// 运行主函数
const result = main();

// 如果是直接运行此脚本（而不是作为模块导入），则根据检查结果设置退出码
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(result ? 0 : 1);
}

export default main; 