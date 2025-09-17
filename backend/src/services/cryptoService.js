const { recoverPublicKey, verifyMessage, hashMessage } = require('viem');
const { keccak256, toHex } = require('viem');

/**
 * 密码学验证服务
 */
class CryptoService {

    /**
     * 验证签名
     * @param {string} message - 原始消息
     * @param {string} signature - 签名
     * @param {string} expectedPublicKey - 期望的公钥
     * @returns {Promise<boolean>} 验证结果
     */
    static async verifySignature(message, signature, expectedPublicKey) {
        try {
            console.log(`🔐 开始验证签名...`);
            console.log(`📝 完整消息内容: "${message}"`);
            console.log(`📝 消息长度: ${message.length}`);
            console.log(`📝 消息字符码: [${message.split('').map(c => c.charCodeAt(0)).join(', ')}]`);

            // 详细分析消息的每个部分
            const lines = message.split('\n');
            console.log(`📝 后端消息分行分析:`);
            lines.forEach((line, index) => {
                console.log(`  行${index + 1}: "${line}" (长度: ${line.length})`);
                console.log(`  字符码: [${line.split('').map(c => c.charCodeAt(0)).join(', ')}]`);
            });

            console.log(`🔑 期望公钥: ${expectedPublicKey}`);
            console.log(`🔑 公钥长度: ${expectedPublicKey.length}`);
            console.log(`✍️ 签名: ${signature}`);
            console.log(`✍️ 签名长度: ${signature.length}`);

            // 使用viem的verifyMessage直接验证签名
            // 从期望的公钥计算地址
            const expectedAddress = this.publicKeyToAddress(expectedPublicKey);
            console.log(`🎯 期望地址: ${expectedAddress}`);

            // 验证签名
            const isValid = await verifyMessage({
                address: expectedAddress,
                message: message,
                signature: signature
            });

            console.log(`✅ 签名验证结果: ${isValid}`);
            return isValid;

        } catch (error) {
            console.error(`❌ 签名验证失败:`, error);
            return false;
        }
    }

    /**
     * 从签名中恢复公钥
     * @param {string} message - 原始消息
     * @param {string} signature - 签名
     * @returns {Promise<string>} 恢复的公钥
     */
    static async recoverPublicKeyFromSignature(message, signature) {
        try {
            console.log(`🔍 从签名恢复公钥...`);

            const recoveredAddress = await recoverPublicKey({
                message: message,
                signature: signature
            });

            console.log(`✅ 恢复的地址: ${recoveredAddress}`);
            return recoveredAddress;

        } catch (error) {
            console.error(`❌ 恢复公钥失败:`, error);
            throw new Error(`无法从签名恢复公钥: ${error.message}`);
        }
    }

    /**
     * 将公钥转换为以太坊地址
     * @param {string} publicKey - 十六进制公钥
     * @returns {string} 以太坊地址
     */
    static publicKeyToAddress(publicKey) {
        try {
            // 移除0x前缀（如果存在）
            let cleanPublicKey = publicKey.replace(/^0x/, '');

            console.log(`🔍 输入公钥: ${publicKey}`);
            console.log(`🔍 清理后公钥: ${cleanPublicKey}`);
            console.log(`🔍 公钥长度: ${cleanPublicKey.length}`);

            let publicKeyBytes;

            // 处理不同长度的公钥
            if (cleanPublicKey.length === 128) {
                // 128位未压缩公钥，需要添加0x04前缀
                const uncompressedKey = '04' + cleanPublicKey;
                console.log(`🔍 添加0x04前缀后: ${uncompressedKey}`);
                publicKeyBytes = Buffer.from(uncompressedKey, 'hex');

            } else if (cleanPublicKey.length === 66) {
                // 66位压缩公钥（包含0x02或0x03前缀）
                publicKeyBytes = Buffer.from(cleanPublicKey, 'hex');

            } else if (cleanPublicKey.length === 64) {
                // 64位压缩公钥，需要添加0x02前缀（假设y坐标是偶数）
                const compressedKey = '02' + cleanPublicKey;
                publicKeyBytes = Buffer.from(compressedKey, 'hex');

            } else {
                throw new Error(`不支持的公钥长度: ${cleanPublicKey.length}`);
            }

            // 计算Keccak256哈希（去掉第一个字节）
            const hash = keccak256(publicKeyBytes.slice(1));

            // 取最后20字节作为地址
            const address = '0x' + hash.slice(-40);

            console.log(`🔑 公钥转换地址: ${publicKey.substring(0, 20)}... -> ${address}`);
            return address;

        } catch (error) {
            console.error(`❌ 公钥转换地址失败:`, error);
            throw new Error(`公钥转换地址失败: ${error.message}`);
        }
    }

    /**
     * 验证公钥格式
     * @param {string} publicKey - 公钥
     * @returns {boolean} 格式是否正确
     */
    static validatePublicKeyFormat(publicKey) {
        const cleanPublicKey = publicKey.replace(/^0x/, '');
        // 支持64位（压缩）和128位（未压缩，可能以04开头或不以04开头）公钥
        const hexRegex64 = /^[0-9a-f]{64}$/i;
        const hexRegex128 = /^04[0-9a-f]{126}$/i;
        const hexRegex128NoPrefix = /^[0-9a-f]{128}$/i;
        return hexRegex64.test(cleanPublicKey) || hexRegex128.test(cleanPublicKey) || hexRegex128NoPrefix.test(cleanPublicKey);
    }

    /**
     * 验证签名格式
     * @param {string} signature - 签名
     * @returns {boolean} 格式是否正确
     */
    static validateSignatureFormat(signature) {
        // 以太坊签名应该是130个字符（65字节）
        const cleanSignature = signature.replace(/^0x/, '');
        const hexRegex = /^[0-9a-f]{130}$/i;
        return hexRegex.test(cleanSignature);
    }

    /**
     * 验证DID格式
     * @param {string} did - DID标识符
     * @returns {boolean} 格式是否正确
     */
    static validateDIDFormat(did) {
        // 简单的DID格式验证：did:hebeu:uuid格式
        const didRegex = /^did:hebeu:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return didRegex.test(did);
    }

    /**
     * 生成随机挑战消息
     * @param {string} did - DID标识符
     * @returns {string} 挑战消息
     */
    static generateChallenge(did) {
        const timestamp = Date.now();
        const nonce = Math.random().toString(36).substring(2, 15);
        const message = `DID Login Challenge\nDID: ${did}\nTimestamp: ${timestamp}\nNonce: ${nonce}`;

        console.log(`🎲 生成挑战消息: ${message}`);
        return message;
    }
}

module.exports = CryptoService;
