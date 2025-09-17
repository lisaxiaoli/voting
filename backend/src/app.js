const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const didRoutes = require('./routes/did');

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// 请求日志
app.use(morgan('combined'));

// 限流配置
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 15分钟内最多100个请求
    message: {
        error: '请求过于频繁，请稍后再试'
    }
});
app.use('/api/', limiter);

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'DID Authentication Backend'
    });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/did', didRoutes);

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('全局错误:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: '请求参数验证失败', details: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: '未授权访问' });
    }

    res.status(500).json({
        error: '服务器内部错误',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});

app.listen(PORT, () => {
    console.log(`🚀 DID认证后端服务启动成功`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`🔗 前端地址: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
