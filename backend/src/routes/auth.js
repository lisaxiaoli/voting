const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/authService');

const router = express.Router();
const authService = new AuthService();

/**
 * POST /api/auth/challenge
 * 生成登录挑战消息
 */
router.post('/challenge', [
    body('did')
        .notEmpty()
        .withMessage('DID不能为空')
        .matches(/^did:hebeu:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        .withMessage('DID格式不正确')
], async (req, res) => {
    try {
        // 验证请求参数
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: '请求参数验证失败',
                details: errors.array()
            });
        }

        const { did } = req.body;

        console.log(`🎲 生成挑战消息请求: ${did}`);

        // 生成挑战消息
        const challenge = authService.generateChallenge(did);

        res.json({
            success: true,
            message: '挑战消息生成成功',
            data: {
                challenge,
                did
            }
        });

    } catch (error) {
        console.error('生成挑战消息失败:', error);

        res.status(500).json({
            success: false,
            error: error.message || '生成挑战消息失败'
        });
    }
});

/**
 * POST /api/auth/login
 * DID登录验证
 */
router.post('/login', [
    body('did')
        .notEmpty()
        .withMessage('DID不能为空')
        .matches(/^did:hebeu:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        .withMessage('DID格式不正确'),
    body('signature')
        .notEmpty()
        .withMessage('签名不能为空')
        .matches(/^0x[0-9a-f]{130}$/i)
        .withMessage('签名格式不正确'),
    body('challenge')
        .notEmpty()
        .withMessage('挑战消息不能为空')
        .isLength({ min: 10 })
        .withMessage('挑战消息长度不足')
], async (req, res) => {
    try {
        // 验证请求参数
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: '请求参数验证失败',
                details: errors.array()
            });
        }

        const { did, signature, challenge } = req.body;

        console.log(`🔐 收到登录请求: ${did}`);

        // 执行DID登录验证
        const result = await authService.verifyDIDLogin(did, signature, challenge);

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token: result.token,
                did: result.did,
                expiresIn: result.expiresIn
            }
        });

    } catch (error) {
        console.error('登录失败:', error);
        console.error('错误详情:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(401).json({
            success: false,
            error: error.message || '登录验证失败'
        });
    }
});

/**
 * POST /api/auth/verify
 * 验证JWT令牌
 */
router.post('/verify', [
    body('token')
        .notEmpty()
        .withMessage('令牌不能为空')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: '请求参数验证失败',
                details: errors.array()
            });
        }

        const { token } = req.body;

        console.log(`🔍 验证令牌请求`);

        // 验证JWT令牌
        const decoded = await authService.verifyJWT(token);

        res.json({
            success: true,
            message: '令牌验证成功',
            data: {
                did: decoded.did,
                publicKey: decoded.publicKey,
                type: decoded.type,
                iat: decoded.iat,
                exp: decoded.exp
            }
        });

    } catch (error) {
        console.error('令牌验证失败:', error);

        res.status(401).json({
            success: false,
            error: error.message || '令牌验证失败'
        });
    }
});

/**
 * POST /api/auth/refresh
 * 刷新JWT令牌
 */
router.post('/refresh', [
    body('token')
        .notEmpty()
        .withMessage('令牌不能为空')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: '请求参数验证失败',
                details: errors.array()
            });
        }

        const { token } = req.body;

        console.log(`🔄 刷新令牌请求`);

        // 刷新JWT令牌
        const newToken = await authService.refreshToken(token);

        res.json({
            success: true,
            message: '令牌刷新成功',
            data: {
                token: newToken,
                expiresIn: authService.jwtExpiresIn
            }
        });

    } catch (error) {
        console.error('令牌刷新失败:', error);

        res.status(401).json({
            success: false,
            error: error.message || '令牌刷新失败'
        });
    }
});

/**
 * POST /api/auth/logout
 * 登出（客户端删除令牌）
 */
router.post('/logout', (req, res) => {
    console.log(`🚪 用户登出`);

    res.json({
        success: true,
        message: '登出成功'
    });
});

module.exports = router;
