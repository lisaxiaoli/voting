/**
 * DID工具函数
 * 用于生成密钥、创建DID证明、管理localStorage等
 */

// DID信息接口
export interface DIDInfo {
    did: string;
    mainPrivateKey: string;
    recoveryPrivateKey: string;
    recoveryPublicKey: string;
    mainPublicKey: string;
    didProof: string;
}

// DID文档接口（对应合约结构）
export interface DIDDocument {
    did: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    mainPublicKey: string;
    recoPublicKey: string;
    serviceEndpoint: string;
    didProof: string;
    owner: string;
}

/**
 * 生成UUID
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 生成随机私钥（64位十六进制）
 */
export function generatePrivateKey(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 从私钥生成公钥（使用viem的椭圆曲线算法）
 */
export function generatePublicKey(privateKey: string): string {
    try {
        // 使用viem的椭圆曲线算法生成真正的公钥
        const { privateKeyToAccount } = require('viem/accounts');
        const account = privateKeyToAccount(`0x${privateKey}`);

        // 获取公钥
        const publicKey = account.publicKey;
        console.log('🔍 原始公钥:', publicKey, '长度:', publicKey.length);

        // 处理不同格式的公钥
        if (publicKey.startsWith('0x')) {
            const cleanKey = publicKey.slice(2); // 去掉0x前缀

            if (cleanKey.length === 66) {
                // 压缩公钥，去掉第一个字符（0x02或0x03）
                return cleanKey.slice(2); // 返回64位
            } else if (cleanKey.length === 130) {
                // 未压缩公钥，去掉0x04前缀
                return cleanKey.slice(2); // 返回128位
            } else {
                throw new Error(`未知的公钥格式: ${cleanKey.length}位`);
            }
        } else {
            throw new Error(`公钥格式错误: ${publicKey}`);
        }
    } catch (error) {
        console.error('生成公钥失败:', error);
        throw new Error('私钥格式错误，无法生成公钥');
    }
}

/**
 * 生成DID证明（使用viem的数字签名）
 */
export async function generateDIDProof(did: string, privateKey: string): Promise<string> {
    try {
        // 使用viem进行真正的数字签名
        const { privateKeyToAccount } = require('viem/accounts');
        const account = privateKeyToAccount(`0x${privateKey}`);

        // 创建DID证明消息
        const proofMessage = `DID Proof\nDID: ${did}\nTimestamp: ${Date.now()}`;

        // 使用私钥签名
        const signature = await account.signMessage({
            message: proofMessage
        });

        return signature;
    } catch (error) {
        console.error('生成DID证明失败:', error);
        throw new Error('私钥格式错误，无法生成DID证明');
    }
}

/**
 * 创建完整的DID信息
 */
export async function createDIDInfo(
    mainPrivateKey?: string,
    recoveryPrivateKey?: string,
    didPrefix: string = 'did:hebeu'
): Promise<DIDInfo> {
    // 生成或使用提供的密钥
    const mainPrivKey = mainPrivateKey || generatePrivateKey();
    const recoveryPrivKey = recoveryPrivateKey || generatePrivateKey();

    // 生成公钥
    const mainPublicKey = generatePublicKey(mainPrivKey);
    const recoveryPublicKey = generatePublicKey(recoveryPrivKey);

    // 生成DID
    const did = `${didPrefix}:${generateUUID()}`;

    // 生成DID证明
    const didProof = await generateDIDProof(did, mainPrivKey);

    return {
        did,
        mainPrivateKey: mainPrivKey,
        recoveryPrivateKey: recoveryPrivKey,
        recoveryPublicKey,
        mainPublicKey,
        didProof
    };
}

/**
 * 将DID信息保存到localStorage
 */
export function saveDIDToLocalStorage(didInfo: DIDInfo): void {
    try {
        const key = `did_${didInfo.did}`;
        localStorage.setItem(key, JSON.stringify(didInfo));

        // 同时保存到DID列表
        const didList = getDIDListFromLocalStorage();
        if (!didList.includes(didInfo.did)) {
            didList.push(didInfo.did);
            localStorage.setItem('did_list', JSON.stringify(didList));
        }

        console.log('DID信息已保存到localStorage:', didInfo.did);
    } catch (error) {
        console.error('保存DID到localStorage失败:', error);
        throw new Error('保存DID信息失败');
    }
}

/**
 * 从localStorage获取DID信息
 */
export function getDIDFromLocalStorage(did: string): DIDInfo | null {
    try {
        const key = `did_${did}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('从localStorage获取DID失败:', error);
        return null;
    }
}

/**
 * 从localStorage获取DID列表
 */
export function getDIDListFromLocalStorage(): string[] {
    try {
        const data = localStorage.getItem('did_list');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('从localStorage获取DID列表失败:', error);
        return [];
    }
}

/**
 * 从localStorage删除DID信息
 */
export function deleteDIDFromLocalStorage(did: string): void {
    try {
        const key = `did_${did}`;
        localStorage.removeItem(key);

        // 从DID列表中移除
        const didList = getDIDListFromLocalStorage();
        const updatedList = didList.filter(d => d !== did);
        localStorage.setItem('did_list', JSON.stringify(updatedList));

        console.log('DID信息已从localStorage删除:', did);
    } catch (error) {
        console.error('从localStorage删除DID失败:', error);
        throw new Error('删除DID信息失败');
    }
}

/**
 * 验证私钥格式
 */
export function validatePrivateKey(privateKey: string): boolean {
    // 检查是否为64位十六进制字符串
    const hexRegex = /^[0-9a-f]{64}$/i;
    return hexRegex.test(privateKey);
}

/**
 * 生成服务端点URL
 */
export function generateServiceEndpoint(did: string): string {
    // 可以根据实际需求生成服务端点
    return `https://api.hebeu.edu.cn/did/${did}`;
}

/**
 * 将DID信息转换为合约调用参数
 */
export function convertToContractParams(didInfo: DIDInfo): {
    did: string;
    version: number;
    mainPublicKey: string;
    recoPublicKey: string;
    serviceEndpoint: string;
    didProof: string;
} {
    return {
        did: didInfo.did,
        version: 1, // 初始版本
        mainPublicKey: didInfo.mainPublicKey,
        recoPublicKey: didInfo.recoveryPublicKey,
        serviceEndpoint: generateServiceEndpoint(didInfo.did),
        didProof: didInfo.didProof
    };
}

/**
 * 检查localStorage是否可用
 */
export function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 生成登录挑战消息
 */
export function generateLoginChallenge(did: string, timestamp?: number): string {
    const nonce = timestamp || Date.now();
    const message = `DID Login Challenge\nDID: ${did}\nTimestamp: ${nonce}\nNonce: ${Math.random().toString(36).substring(2, 15)}`;
    return message;
}

/**
 * 验证DID信息完整性
 */
export function validateDIDInfo(didInfo: DIDInfo): boolean {
    return !!(
        didInfo.did &&
        didInfo.mainPrivateKey &&
        didInfo.mainPublicKey &&
        didInfo.recoveryPrivateKey &&
        didInfo.recoveryPublicKey &&
        didInfo.didProof
    );
}

/**
 * 验证私钥格式
 */
export function verifyPrivateKeyFormat(privateKey: string): boolean {
    // 检查是否为64位十六进制字符串
    const hexRegex = /^[0-9a-f]{64}$/i;
    return hexRegex.test(privateKey);
}
