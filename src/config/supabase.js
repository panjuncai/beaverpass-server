import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量中获取 Supabase URL 和 API Key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // 使用 service_role key 以获取完整权限

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 