# LC Voting Admin - 后台管理系统

基于 React + Ant Design 构建的高校去中心化身份认证系统后台管理界面。

## 🚀 技术栈

- **React 18** - 前端框架
- **Ant Design 5** - UI 组件库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

## 📁 项目结构

```
admin/
├── src/
│   ├── components/          # 公共组件
│   │   └── Layout/         # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘
│   │   ├── IdentityManagement.tsx  # 身份管理
│   │   ├── SBTManagement.tsx       # SBT管理
│   │   ├── UserManagement.tsx      # 用户管理
│   │   └── SystemSettings.tsx      # 系统设置
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── package.json            # 依赖配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目说明
```

## 🛠️ 安装和运行

### 1. 安装依赖

```bash
cd admin
npm install
# 或
yarn install
```

### 2. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3001 查看管理界面

### 3. 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 📱 功能模块

### 🏠 仪表盘
- 系统概览和关键指标
- 待处理事项列表
- 审核进度监控
- 实时数据统计

### 👥 身份管理
- DID身份审核
- 批量操作功能
- 身份状态管理
- 审核流程控制

### 🎫 SBT管理
- 灵魂绑定代币颁发
- SBT申请审核
- 证书撤销管理
- 批量操作支持

### 👤 用户管理
- 用户信息管理
- 权限级别控制
- 用户状态管理
- 批量用户操作

### ⚙️ 系统设置
- 基本配置管理
- 部门信息维护
- 验证者权限配置
- 数据库连接设置

## 🎨 界面特色

- **响应式设计** - 适配各种屏幕尺寸
- **现代化UI** - 基于 Ant Design 5 设计规范
- **直观操作** - 简洁明了的用户界面
- **数据可视化** - 丰富的图表和统计信息
- **实时反馈** - 操作状态和结果提示

## 🔧 配置说明

### 代理配置
开发环境已配置 API 代理，将 `/api` 请求转发到 `http://localhost:3000`

### 主题定制
可通过修改 `src/index.css` 自定义样式主题

### 路由配置
在 `src/App.tsx` 中配置页面路由

## 📊 数据接口

系统需要与以下后端 API 集成：

- `/api/identity` - 身份管理接口
- `/api/sbt` - SBT管理接口
- `/api/users` - 用户管理接口
- `/api/settings` - 系统设置接口

## 🚀 部署

### 开发环境
```bash
yarn dev
```

### 生产环境
```bash
yarn build
yarn preview
```

## 📝 开发说明

### 添加新页面
1. 在 `src/pages/` 目录下创建新组件
2. 在 `src/App.tsx` 中添加路由配置
3. 在 `src/components/Layout/AdminLayout.tsx` 中添加菜单项

### 自定义组件
所有可复用组件应放在 `src/components/` 目录下

### 样式规范
- 使用 Ant Design 组件优先
- 自定义样式写在 `src/index.css`
- 遵循 BEM 命名规范

## 🔗 相关项目

- [前台系统](../frontend/) - scaffold-eth-2 构建的用户界面
- [后端API](../backend/) - Node.js 后端服务

## 📄 许可证

MIT License
