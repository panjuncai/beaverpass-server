# 改造说明
## 原架构
 前端：React+Tailwindcss
 后端：Express+Mongodb
 会话数据库：Redis
 图片上传：Amazon S3
 接口：Restful
 模块导入：CommonJS 
 架构比较简单，
 - Mongodb 不适合关系型业务
 - 前后端交互用 Restful 不太灵活
 - 缺少中间层 ORM，后期若再换别的数据库，成本较高

## 新架构
 前端：React+Tailwindcss（不变）
 后端：Express+**Prisma+Supabase(Postgresql)**
 会话数据库：Redis(不变)
 图片上传：Amazon S3(不变)
 接口：**GraphQL**
 模块导入：**ESModule**
 后端改动较大，
 - 使用 Supabase云端 Postgresql 数据库
 - Supabase 作为云端BaaS(Backend-as-a-Service)应用，无需本地部署，减少运维成本
 - Prisma 做 ORM 映射，适配多种数据库，对前后端字段转换有优势
 - 接口改为GraphQL,更为灵活与现代化，对前端灵活变化需求更适合
 - 模块导入方式改为更现代化的 ESM 方式

## 后续开发
 - 鉴权使用 Supabase，去掉 Redis 会话管理,可以实现 Apple、Google、Facebook 登录，月活 5w 免费
 - 前端可以改为 Next.js，通过 Vercel 托管（支持Https）
 - 接口方式可以用 tRPC，为 Expo（React Native） 扩展 Ios 与安卓App 打下基础