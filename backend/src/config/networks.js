const { hardhat, mainnet, sepolia, arbitrum, arbitrumSepolia, optimism, optimismSepolia, polygon, polygonAmoy } = require('viem/chains');

/**
 * 网络配置映射
 */
const NETWORK_CONFIG = {
    // 本地开发网络
    hardhat: {
        chain: hardhat,
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        chainId: 31337,
        name: 'Hardhat Local'
    },

    // 以太坊主网
    mainnet: {
        chain: mainnet,
        rpcUrl: process.env.MAINNET_RPC_URL || 'https://mainnet.rpc.buidlguidl.com',
        chainId: 1,
        name: 'Ethereum Mainnet'
    },

    // 以太坊测试网
    sepolia: {
        chain: sepolia,
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',
        chainId: 11155111,
        name: 'Ethereum Sepolia'
    },

    // Arbitrum
    arbitrum: {
        chain: arbitrum,
        rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',
        chainId: 42161,
        name: 'Arbitrum One'
    },

    arbitrumSepolia: {
        chain: arbitrumSepolia,
        rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://arb-sepolia.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',
        chainId: 421614,
        name: 'Arbitrum Sepolia'
    },

    // Optimism
    optimism: {
        chain: optimism,
        rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://opt-mainnet.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',
        chainId: 10,
        name: 'Optimism'
    },

    optimismSepolia: {
        chain: optimismSepolia,
        rpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://opt-sepolia.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',
        chainId: 11155420,
        name: 'Optimism Sepolia'
    },

    // Polygon
    polygon: {
        chain: polygon,
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',
        chainId: 137,
        name: 'Polygon'
    },

    polygonAmoy: {
        chain: polygonAmoy,
        rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',
        chainId: 80002,
        name: 'Polygon Amoy'
    }
};

/**
 * 获取当前网络配置
 */
function getCurrentNetworkConfig() {
    const networkName = process.env.BLOCKCHAIN_NETWORK || 'hardhat';
    const config = NETWORK_CONFIG[networkName];

    if (!config) {
        console.warn(`⚠️  未找到网络配置: ${networkName}，使用默认hardhat配置`);
        return NETWORK_CONFIG.hardhat;
    }

    return config;
}

/**
 * 获取所有支持的网络
 */
function getAllNetworks() {
    return Object.keys(NETWORK_CONFIG);
}

/**
 * 根据链ID获取网络配置
 */
function getNetworkByChainId(chainId) {
    const network = Object.values(NETWORK_CONFIG).find(config => config.chainId === chainId);
    return network || null;
}

/**
 * 验证网络连接
 */
async function validateNetworkConnection(config) {
    try {
        const { createPublicClient, http } = require('viem');

        const client = createPublicClient({
            chain: config.chain,
            transport: http(config.rpcUrl)
        });

        const blockNumber = await client.getBlockNumber();
        console.log(`✅ 网络连接成功: ${config.name} (Block: ${blockNumber})`);
        return true;

    } catch (error) {
        console.error(`❌ 网络连接失败: ${config.name}`, error.message);
        return false;
    }
}

module.exports = {
    NETWORK_CONFIG,
    getCurrentNetworkConfig,
    getAllNetworks,
    getNetworkByChainId,
    validateNetworkConnection
};
