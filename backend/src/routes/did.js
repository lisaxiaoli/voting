const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDIDPublicKey, checkDIDExists, getDIDDocument } = require('../config/blockchain');

const router = express.Router();

/**
 * GET /api/did/:did/status
 * 检查DID状态
 */
router.get('/:did/status', async (req, res) => {
    try {
        const { did } = req.params;

        console.log(`🔍 检查DID状态: ${did}`);

        const exists = await checkDIDExists(did);

        res.json({
            success: true,
            data: {
                did,
                exists,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('检查DID状态失败:', error);

        res.status(500).json({
            success: false,
            error: error.message || '检查DID状态失败'
        });
    }
});

/**
 * GET /api/did/:did/public-key
 * 获取DID主公钥
 */
router.get('/:did/public-key', async (req, res) => {
    try {
        const { did } = req.params;

        console.log(`🔑 获取DID主公钥: ${did}`);

        // 先检查DID是否存在
        const exists = await checkDIDExists(did);
        if (!exists) {
            return res.status(404).json({
                success: false,
                error: 'DID不存在'
            });
        }

        const publicKey = await getDIDPublicKey(did);

        res.json({
            success: true,
            data: {
                did,
                publicKey,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('获取DID主公钥失败:', error);

        res.status(500).json({
            success: false,
            error: error.message || '获取DID主公钥失败'
        });
    }
});

/**
 * GET /api/did/:did/document
 * 获取DID完整文档
 */
router.get('/:did/document', async (req, res) => {
    try {
        const { did } = req.params;

        console.log(`📄 获取DID文档: ${did}`);

        // 先检查DID是否存在
        const exists = await checkDIDExists(did);
        if (!exists) {
            return res.status(404).json({
                success: false,
                error: 'DID不存在'
            });
        }

        const document = await getDIDDocument(did);

        res.json({
            success: true,
            data: {
                did,
                document,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('获取DID文档失败:', error);

        res.status(500).json({
            success: false,
            error: error.message || '获取DID文档失败'
        });
    }
});

/**
 * POST /api/did/validate
 * 批量验证DID
 */
router.post('/validate', [
    body('dids')
        .isArray({ min: 1, max: 10 })
        .withMessage('DID列表必须是包含1-10个元素的数组'),
    body('dids.*')
        .matches(/^did:hebeu:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        .withMessage('DID格式不正确')
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

        const { dids } = req.body;

        console.log(`🔍 批量验证DID: ${dids.length}个`);

        const results = await Promise.all(
            dids.map(async (did) => {
                try {
                    const exists = await checkDIDExists(did);
                    return { did, exists, error: null };
                } catch (error) {
                    return { did, exists: false, error: error.message };
                }
            })
        );

        res.json({
            success: true,
            data: {
                results,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('批量验证DID失败:', error);

        res.status(500).json({
            success: false,
            error: error.message || '批量验证DID失败'
        });
    }
});

module.exports = router;
