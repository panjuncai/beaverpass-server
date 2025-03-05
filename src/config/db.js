const supabase = require('../lib/supabase');
require('./env')();

const connectDB = async () => {
  try {
    // 测试 Supabase 连接
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log("Supabase 连接成功");
  } catch (e) {
    console.error("Supabase 连接错误:", e);
    process.exit(1);
  }
};

module.exports = connectDB;
