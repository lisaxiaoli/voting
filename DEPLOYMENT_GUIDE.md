# 🚀 DID系统部署和配置指南

## 📋 问题解答

### 1. 合约地址自动更新

每次 `yarn deploy` 后，合约地址会自动更新到以下位置：

#### 前端自动更新：
- ✅ `frontend/packages/nextjs/contracts/deployedContracts.ts` - **自动生成，无需手动修改**

#### 后端需要更新：
- ❌ `backend/.env` 中的 `DID_MANAGER_ADDRESS` - **需要手动更新**

#### 解决方案：
```bash
# 方法1：使用自动配置脚本
yarn update-config

# 方法2：一键部署和配置
yarn setup

# 方法3：手动复制地址
# 从 deployedContracts.ts 复制地址到 backend/.env
```

### 2. JWT密钥获取

#### 自动生成（推荐）：
```bash
yarn update-config
```

#### 手动生成：
```bash
# 生成64位随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 设置到环境变量：
```bash
# 在 backend/.env 中设置
JWT_SECRET=你的64位十六进制密钥
```

### 3. 区块链网络配置

Scaffold-ETH 2 支持多链，已配置的网络：

#### 本地开发：
- **Hardhat** (localhost:8545) - 默认
- **Fork Mainnet** - 可启用主网分叉

#### 测试网：
- **Sepolia** (以太坊测试网)
- **Arbitrum Sepolia** 
- **Optimism Sepolia**
- **Polygon Amoy**

#### 主网：
- **Ethereum Mainnet**
- **Arbitrum One**
- **Optimism**
- **Polygon**

## 🎯 快速开始

### 方法1：一键部署（推荐）

```bash
# 本地开发环境
yarn setup

# 部署到测试网
yarn deploy:sepolia
yarn deploy:arbitrum
yarn deploy:polygon
```

### 方法2：手动部署

```bash
# 1. 启动本地区块链
yarn chain

# 2. 部署合约
yarn deploy

# 3. 更新配置
yarn update-config

# 4. 启动后端
cd backend
npm install
cp env.example .env
npm run dev

# 5. 启动前端
cd frontend/packages/nextjs
yarn dev
```

## 🔧 网络配置

### 切换网络

#### 1. 修改前端配置
```typescript
// frontend/packages/nextjs/scaffold.config.ts
export const scaffoldConfig = {
  targetNetworks: [chains.sepolia], // 改为目标网络
  // ...
}
```

#### 2. 修改后端配置
```bash
# backend/.env
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
```

#### 3. 部署到新网络
```bash
yarn deploy:sepolia
```

### 添加自定义网络

#### 1. 前端配置
```typescript
// frontend/packages/hardhat/hardhat.config.ts
networks: {
  customNetwork: {
    url: "https://your-rpc-url",
    accounts: [deployerPrivateKey],
  }
}
```

#### 2. 后端配置
```javascript
// backend/src/config/networks.js
customNetwork: {
  chain: yourChain,
  rpcUrl: process.env.CUSTOM_RPC_URL || 'https://your-rpc-url',
  chainId: yourChainId,
  name: 'Custom Network'
}
```

## 📊 配置检查清单

### 部署前检查：
- [ ] 确保有足够的测试币
- [ ] 检查网络连接
- [ ] 验证私钥配置

### 部署后检查：
- [ ] 合约地址已更新
- [ ] JWT密钥已生成
- [ ] 后端服务正常启动
- [ ] 前端能连接后端
- [ ] DID创建和登录功能正常

## 🛠️ 故障排除

### 常见问题：

#### 1. 合约地址不匹配
```bash
# 解决：重新运行配置更新
yarn update-config
```

#### 2. 网络连接失败
```bash
# 检查网络配置
cd backend
npm run dev
# 查看控制台输出的网络信息
```

#### 3. JWT验证失败
```bash
# 重新生成JWT密钥
yarn update-config
```

#### 4. 前端无法连接后端
```bash
# 检查CORS配置
# backend/.env
FRONTEND_URL=http://localhost:3000
```

### 调试命令：

```bash
# 检查合约部署状态
yarn hardhat:verify --network sepolia

# 检查网络连接
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# 检查后端健康状态
curl http://localhost:3001/health
```

## 📝 环境变量说明

### 前端环境变量
```bash
# .env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-walletconnect-id
```

### 后端环境变量
```bash
# backend/.env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
BLOCKCHAIN_NETWORK=hardhat
BLOCKCHAIN_RPC_URL=http://localhost:8545
DID_MANAGER_ADDRESS=0x...
```

## 🔐 安全注意事项

1. **私钥安全**：
   - 永远不要在代码中硬编码私钥
   - 使用环境变量管理私钥
   - 生产环境使用硬件钱包

2. **JWT密钥**：
   - 使用强随机密钥
   - 定期更换密钥
   - 不要提交到版本控制

3. **网络安全**：
   - 使用HTTPS（生产环境）
   - 配置正确的CORS
   - 启用请求限流

## 📞 技术支持

如果遇到问题，请检查：
1. Node.js版本 >= 20.11.1
2. 网络连接正常
3. 依赖安装完整
4. 环境变量配置正确

## 🎉 完成！

现在你的DID系统已经配置完成，可以：
- ✅ 自动更新合约地址
- ✅ 自动生成JWT密钥  
- ✅ 支持多链部署
- ✅ 一键部署和配置
