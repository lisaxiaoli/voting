# DID身份认证后端服务

基于区块链的DID身份认证系统后端服务，使用Node.js + Express + viem实现。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 环境配置

复制环境配置文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 前端地址（CORS配置）
FRONTEND_URL=http://localhost:3000

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# 区块链配置
BLOCKCHAIN_RPC_URL=http://localhost:8545
DID_MANAGER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3001` 启动。

## 📋 API接口

### 认证相关

#### POST /api/auth/login
DID登录验证

**请求体：**
```json
{
  "did": "did:hebeu:uuid",
  "signature": "0x...",
  "challenge": "DID Login Challenge..."
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_here",
    "did": "did:hebeu:uuid",
    "expiresIn": "24h"
  }
}
```

#### POST /api/auth/verify
验证JWT令牌

**请求体：**
```json
{
  "token": "jwt_token_here"
}
```

#### POST /api/auth/refresh
刷新JWT令牌

#### POST /api/auth/logout
用户登出

### DID相关

#### GET /api/did/:did/status
检查DID状态

#### GET /api/did/:did/public-key
获取DID主公钥

#### GET /api/did/:did/document
获取DID完整文档

#### POST /api/did/validate
批量验证DID

## 🔐 安全特性

1. **私钥安全**：私钥永远不会发送到服务器
2. **签名验证**：使用secp256k1椭圆曲线算法验证签名
3. **JWT令牌**：安全的会话管理
4. **限流保护**：防止暴力攻击
5. **输入验证**：严格的参数验证

## 🏗️ 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │    │   后端 (Node.js) │    │   区块链 (Hardhat)│
│                 │    │                 │    │                 │
│ 1. 生成挑战消息   │───▶│ 2. 验证签名      │───▶│ 3. 查询DID信息   │
│ 2. 私钥签名      │    │ 3. 验证公钥匹配   │    │ 4. 返回主公钥     │
│ 3. 发送验证请求   │◀───│ 4. 生成JWT令牌   │◀───│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 验证流程

1. **前端生成挑战**：基于DID和时间戳生成挑战消息
2. **本地签名**：使用用户私钥对挑战消息签名
3. **发送验证**：将DID、签名、挑战发送到后端
4. **后端验证**：
   - 检查DID是否存在
   - 从区块链获取主公钥
   - 验证签名与主公钥匹配
   - 生成JWT令牌
5. **返回结果**：成功返回令牌，失败返回错误信息

## 📝 开发说明

### 目录结构

```
backend/
├── src/
│   ├── app.js              # 主应用文件
│   ├── config/
│   │   └── blockchain.js   # 区块链配置
│   ├── services/
│   │   ├── authService.js  # 认证服务
│   │   └── cryptoService.js # 密码学服务
│   └── routes/
│       ├── auth.js         # 认证路由
│       └── did.js          # DID路由
├── package.json
├── env.example
└── README.md
```

### 技术栈

- **Node.js 20.11.1+**
- **Express.js** - Web框架
- **viem** - 以太坊交互库
- **jsonwebtoken** - JWT令牌
- **express-validator** - 参数验证
- **helmet** - 安全中间件
- **cors** - 跨域支持

## 🚨 注意事项

1. **私钥安全**：确保私钥不会泄露到服务器
2. **JWT密钥**：生产环境必须使用强密钥
3. **区块链网络**：确保与前端使用相同的网络配置
4. **CORS配置**：正确配置前端地址
5. **错误处理**：不要在生产环境暴露敏感错误信息

## 🧪 测试

```bash
npm test
```

## 📄 许可证

MIT License
