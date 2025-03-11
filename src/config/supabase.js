import { createClient } from '@supabase/supabase-js';
import loadEnv from './env.js';
loadEnv();

// 检查是否使用 Prisma
const USE_PRISMA = process.env.USE_PRISMA === 'true';

let supabase;

// 如果使用 Prisma，则创建一个模拟的 Supabase 客户端
if (USE_PRISMA) {
  console.log('使用 Prisma，创建模拟的 Supabase 客户端');
  
  // 创建一个模拟的 Supabase 客户端
  supabase = {
    from: () => ({
      insert: () => ({ 
        select: () => ({ 
          single: () => ({ data: null, error: new Error('使用 Prisma 模式，Supabase 不可用') }) 
        }) 
      }),
      select: () => ({ 
        eq: () => ({ 
          maybeSingle: () => ({ data: null, error: new Error('使用 Prisma 模式，Supabase 不可用') }) 
        }),
        limit: () => ({ data: null, error: new Error('使用 Prisma 模式，Supabase 不可用') })
      }),
      update: () => ({ 
        eq: () => ({ 
          select: () => ({ 
            maybeSingle: () => ({ data: null, error: new Error('使用 Prisma 模式，Supabase 不可用') }) 
          }) 
        }) 
      }),
    }),
  };
} else {
  // 使用真实的 Supabase 客户端
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_KEY environment variable');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
}

export default supabase; 