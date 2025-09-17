const { createPublicClient, http, formatUnits } = require('viem');
const { getCurrentNetworkConfig } = require('./networks');

// 获取当前网络配置
const networkConfig = getCurrentNetworkConfig();

// 区块链配置
const BLOCKCHAIN_CONFIG = {
    // 使用动态网络配置
    chain: networkConfig.chain,
    rpcUrl: networkConfig.rpcUrl,
    chainId: networkConfig.chainId,
    networkName: networkConfig.name,

    // DIDManager合约地址（需要与前端保持一致）
    didManagerAddress: process.env.DID_MANAGER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',

    // 合约ABI（简化版，只包含需要的函数）
    didManagerABI: [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "did",
                    "type": "string"
                }
            ],
            "name": "getMainPubKeyHex",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "did",
                    "type": "string"
                }
            ],
            "name": "getDidStatus",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "did",
                    "type": "string"
                }
            ],
            "name": "getDocument",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "did",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "version",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "createdAt",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "updatedAt",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "mainPublicKey",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "recoPublicKey",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "serviceEndpoint",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "didProof",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct DIDManager.DIDDocument",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
};

// 创建公共客户端
const publicClient = createPublicClient({
    chain: BLOCKCHAIN_CONFIG.chain,
    transport: http(BLOCKCHAIN_CONFIG.rpcUrl)
});

// 启动时显示网络信息
console.log(`🌐 连接到网络: ${BLOCKCHAIN_CONFIG.networkName}`);
console.log(`🔗 RPC URL: ${BLOCKCHAIN_CONFIG.rpcUrl}`);
console.log(`📋 合约地址: ${BLOCKCHAIN_CONFIG.didManagerAddress}`);

/**
 * 获取DID的主公钥
 * @param {string} did - DID标识符
 * @returns {Promise<string>} 主公钥
 */
async function getDIDPublicKey(did) {
    try {
        console.log(`🔍 查询DID主公钥: ${did}`);

        const publicKey = await publicClient.readContract({
            address: BLOCKCHAIN_CONFIG.didManagerAddress,
            abi: BLOCKCHAIN_CONFIG.didManagerABI,
            functionName: 'getMainPubKeyHex',
            args: [did]
        });

        console.log(`✅ 获取主公钥成功: ${publicKey}`);
        return publicKey;

    } catch (error) {
        console.error(`❌ 获取DID主公钥失败:`, error);
        throw new Error(`无法获取DID主公钥: ${error.message}`);
    }
}

/**
 * 检查DID是否存在
 * @param {string} did - DID标识符
 * @returns {Promise<boolean>} 是否存在
 */
async function checkDIDExists(did) {
    try {
        console.log(`🔍 检查DID是否存在: ${did}`);

        const exists = await publicClient.readContract({
            address: BLOCKCHAIN_CONFIG.didManagerAddress,
            abi: BLOCKCHAIN_CONFIG.didManagerABI,
            functionName: 'getDidStatus',
            args: [did]
        });

        console.log(`✅ DID存在状态: ${exists}`);
        return exists;

    } catch (error) {
        console.error(`❌ 检查DID存在性失败:`, error);
        return false;
    }
}

/**
 * 获取完整的DID文档
 * @param {string} did - DID标识符
 * @returns {Promise<Object>} DID文档
 */
async function getDIDDocument(did) {
    try {
        console.log(`🔍 获取DID文档: ${did}`);

        const document = await publicClient.readContract({
            address: BLOCKCHAIN_CONFIG.didManagerAddress,
            abi: BLOCKCHAIN_CONFIG.didManagerABI,
            functionName: 'getDocument',
            args: [did]
        });

        console.log(`✅ 获取DID文档成功`);
        return document;

    } catch (error) {
        console.error(`❌ 获取DID文档失败:`, error);
        throw new Error(`无法获取DID文档: ${error.message}`);
    }
}

module.exports = {
    getDIDPublicKey,
    checkDIDExists,
    getDIDDocument,
    publicClient,
    BLOCKCHAIN_CONFIG
};
