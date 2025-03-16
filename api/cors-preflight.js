export default function handler(req, res) {
  // 完全开放跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 对于 OPTIONS 请求，直接返回 200 状态码
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 对于其他请求，返回 405 方法不允许
  return res.status(405).json({ error: 'Method not allowed' });
} 