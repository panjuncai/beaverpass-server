export default function handler(req, res) {
  // 获取请求的来源
  const origin = req.headers.origin;
  const allowedOrigins = ['https://beaverpass-client.vercel.app'];
  
  // 设置 CORS 头
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 对于 OPTIONS 请求，直接返回 200 状态码
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 对于其他请求，返回 405 方法不允许
  return res.status(405).json({ error: 'Method not allowed' });
} 