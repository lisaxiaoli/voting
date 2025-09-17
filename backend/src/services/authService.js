const jwt = require('jsonwebtoken');
const CryptoService = require('./cryptoService');
const { getDIDPublicKey, checkDIDExists, getDIDDocument } = require('../config/blockchain');

/**
 * 身份认证服务
 */
class AuthService {

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    /**
     * 验证DID登录
     * @param {string} did - DID标识符
     * @param {string} signature - 签名
     * @param {string} challenge - 挑战消息
     * @returns {Promise<Object>} 验证结果
     */
    async verifyDIDLogin(did, signature, challenge) {
        try {
            console.log(`🔐 开始DID登录验证...`);
            console.log(`📋 DID: ${did}`);
            console.log(`✍️ 签名: ${signature.substring(0, 20)}...`);
            console.log(`📝 挑战: ${challenge.substring(0, 100)}...`);

            // 第一步：验证输入格式
            this.validateInputs(did, signature, challenge);

            // 第二步：检查DID是否存在
            const didExists = await checkDIDExists(did);
            if (!didExists) {
                throw new Error('DID不存在于区块链中');
            }

            // 第三步：获取DID的主公钥
            const publicKey = await getDIDPublicKey(did);
            if (!publicKey) {
                throw new Error('无法获取DID主公钥');
            }

            // 第四步：验证签名
            console.log(`🔍 公钥匹配验证:`);
            console.log(`  区块链返回的公钥: ${publicKey}`);
            console.log(`  公钥长度: ${publicKey.length}`);

            const isValidSignature = await CryptoService.verifySignature(
                challenge,
                signature,
                publicKey
            );

            if (!isValidSignature) {
                throw new Error('签名验证失败，私钥与DID不匹配');
            }

            // 第五步：生成JWT令牌
            const token = this.generateJWT(did, publicKey);

            console.log(`✅ DID登录验证成功`);

            return {
                success: true,
                token,
                did,
                publicKey,
                expiresIn: this.jwtExpiresIn
            };

        } catch (error) {
            console.error(`❌ DID登录验证失败:`, error);
            throw error;
        }
    }

    /**
     * 验证输入参数
     * @param {string} did - DID标识符
     * @param {string} signature - 签名
     * @param {string} challenge - 挑战消息
     */
    validateInputs(did, signature, challenge) {
        if (!did || !signature || !challenge) {
            throw new Error('缺少必要的验证参数');
        }

        if (!CryptoService.validateDIDFormat(did)) {
            throw new Error('DID格式不正确');
        }

        if (!CryptoService.validateSignatureFormat(signature)) {
            throw new Error('签名格式不正确');
        }

        if (typeof challenge !== 'string' || challenge.length < 10) {
            throw new Error('挑战消息格式不正确');
        }
    }

    /**
     * 生成JWT令牌
     * @param {string} did - DID标识符
     * @param {string} publicKey - 公钥
     * @returns {string} JWT令牌
     */
    generateJWT(did, publicKey) {
        const payload = {
            did,
            publicKey,
            type: 'did_auth',
            iat: Math.floor(Date.now() / 1000)
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn,
            algorithm: 'HS256'
        });
    }

    /**
     * 验证JWT令牌
     * @param {string} token - JWT令牌
     * @returns {Promise<Object>} 令牌信息
     */
    async verifyJWT(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);

            // 验证令牌类型
            if (decoded.type !== 'did_auth') {
                throw new Error('无效的令牌类型');
            }

            // 验证DID是否仍然存在
            const didExists = await checkDIDExists(decoded.did);
            if (!didExists) {
                throw new Error('DID已失效');
            }

            return decoded;

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error('无效的令牌');
            } else if (error.name === 'TokenExpiredError') {
                throw new Error('令牌已过期');
            }
            throw error;
        }
    }

    /**
     * 获取过期时间（秒）
     * @returns {number} 过期秒数
     */
    getExpirationSeconds() {
        const unit = this.jwtExpiresIn.slice(-1);
        const value = parseInt(this.jwtExpiresIn.slice(0, -1));

        switch (unit) {
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            case 'm': return value * 60;
            case 's': return value;
            default: return 86400; // 默认24小时
        }
    }

    /**
     * 生成挑战消息
     * @param {string} did - DID标识符
     * @returns {string} 挑战消息
     */
    generateChallenge(did) {
        const timestamp = Date.now();
        const nonce = Math.random().toString(36).substring(2, 15);
        const message = `DID Login Challenge\nDID: ${did}\nTimestamp: ${timestamp}\nNonce: ${nonce}`;

        console.log(`🎲 生成挑战消息: ${message}`);
        return message;
    }

    /**
     * 刷新令牌
     * @param {string} token - 当前令牌
     * @returns {Promise<string>} 新令牌
     */
    async refreshToken(token) {
        const decoded = await this.verifyJWT(token);

        // 生成新令牌
        return this.generateJWT(decoded.did, decoded.publicKey);
    }
}

module.exports = AuthService;
