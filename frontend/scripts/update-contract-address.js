#!/usr/bin/env node

/**
 * 自动更新合约地址脚本
 * 从deployedContracts.ts读取合约地址并更新后端配置
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_CONTRACTS_PATH = path.join(__dirname, '../packages/nextjs/contracts/deployedContracts.ts');
const BACKEND_ENV_PATH = path.join(__dirname, '../../backend/.env');
const BACKEND_ENV_EXAMPLE_PATH = path.join(__dirname, '../../backend/env.example');

// 网络ID映射
const NETWORK_ID_MAP = {
    31337: 'hardhat',
    1: 'mainnet',
    11155111: 'sepolia',
    42161: 'arbitrum',
    421614: 'arbitrumSepolia',
    10: 'optimism',
    11155420: 'optimismSepolia',
    137: 'polygon',
    80002: 'polygonAmoy'
};

/**
 * 从deployedContracts.ts提取合约地址
 */
function extractContractAddresses() {
    try {
        const content = fs.readFileSync(FRONTEND_CONTRACTS_PATH, 'utf8');

        // 使用正则表达式提取合约地址
        const addressRegex = /address:\s*"([^"]+)"/g;
        const networkRegex = /(\d+):\s*{[\s\S]*?DIDManager:\s*{[\s\S]*?address:\s*"([^"]+)"/g;

        const addresses = {};
        let match;

        while ((match = networkRegex.exec(content)) !== null) {
            const networkId = parseInt(match[1]);
            const address = match[2];
            const networkName = NETWORK_ID_MAP[networkId] || `network_${networkId}`;

            addresses[networkId] = {
                name: networkName,
                address: address
            };
        }

        return addresses;
    } catch (error) {
        console.error('❌ 读取合约地址失败:', error.message);
        return {};
    }
}

/**
 * 更新后端环境配置
 */
function updateBackendEnv(addresses) {
    try {
        // 读取现有配置
        let envContent = '';
        if (fs.existsSync(BACKEND_ENV_PATH)) {
            envContent = fs.readFileSync(BACKEND_ENV_PATH, 'utf8');
        } else if (fs.existsSync(BACKEND_ENV_EXAMPLE_PATH)) {
            envContent = fs.readFileSync(BACKEND_ENV_EXAMPLE_PATH, 'utf8');
        }

        // 获取当前网络（默认hardhat）
        const currentNetwork = process.env.NETWORK || 'hardhat';
        const currentNetworkId = Object.keys(NETWORK_ID_MAP).find(id => NETWORK_ID_MAP[id] === currentNetwork);

        let targetAddress = '';
        if (currentNetworkId && addresses[currentNetworkId]) {
            targetAddress = addresses[currentNetworkId].address;
        } else if (addresses[31337]) {
            // 默认使用hardhat地址
            targetAddress = addresses[31337].address;
        }

        if (!targetAddress) {
            console.error('❌ 未找到合约地址');
            return false;
        }

        // 更新DID_MANAGER_ADDRESS
        const updatedContent = envContent.replace(
            /DID_MANAGER_ADDRESS=.*/,
            `DID_MANAGER_ADDRESS=${targetAddress}`
        );

        // 如果文件不存在，创建它
        if (!fs.existsSync(BACKEND_ENV_PATH)) {
            fs.writeFileSync(BACKEND_ENV_PATH, updatedContent);
            console.log('✅ 创建后端环境配置文件');
        } else {
            fs.writeFileSync(BACKEND_ENV_PATH, updatedContent);
            console.log('✅ 更新后端环境配置文件');
        }

        console.log(`📋 合约地址已更新: ${targetAddress}`);
        return true;

    } catch (error) {
        console.error('❌ 更新后端配置失败:', error.message);
        return false;
    }
}

/**
 * 生成JWT密钥
 */
function generateJWTSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
}

/**
 * 更新JWT密钥
 */
function updateJWTSecret() {
    try {
        const envPath = BACKEND_ENV_PATH;
        let envContent = '';

        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        } else if (fs.existsSync(BACKEND_ENV_EXAMPLE_PATH)) {
            envContent = fs.readFileSync(BACKEND_ENV_EXAMPLE_PATH, 'utf8');
        }

        const jwtSecret = generateJWTSecret();

        // 更新JWT_SECRET
        const updatedContent = envContent.replace(
            /JWT_SECRET=.*/,
            `JWT_SECRET=${jwtSecret}`
        );

        if (!fs.existsSync(envPath)) {
            fs.writeFileSync(envPath, updatedContent);
            console.log('✅ 创建后端环境配置文件');
        } else {
            fs.writeFileSync(envPath, updatedContent);
            console.log('✅ 更新后端环境配置文件');
        }

        console.log(`🔐 JWT密钥已生成并更新`);
        return true;

    } catch (error) {
        console.error('❌ 更新JWT密钥失败:', error.message);
        return false;
    }
}

/**
 * 显示当前配置信息
 */
function showCurrentConfig(addresses) {
    console.log('\n📊 当前合约配置:');
    console.log('='.repeat(50));

    Object.entries(addresses).forEach(([networkId, info]) => {
        console.log(`🌐 ${info.name} (${networkId}): ${info.address}`);
    });

    console.log('='.repeat(50));
}

/**
 * 主函数
 */
function main() {
    console.log('🚀 开始更新合约配置...\n');

    // 提取合约地址
    const addresses = extractContractAddresses();

    if (Object.keys(addresses).length === 0) {
        console.error('❌ 未找到任何合约地址');
        process.exit(1);
    }

    // 显示当前配置
    showCurrentConfig(addresses);

    // 更新后端配置
    const updateSuccess = updateBackendEnv(addresses);
    if (!updateSuccess) {
        console.error('❌ 更新后端配置失败');
        process.exit(1);
    }

    // 更新JWT密钥
    updateJWTSecret();

    console.log('\n✅ 合约配置更新完成!');
    console.log('💡 提示: 请重启后端服务以使配置生效');
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    extractContractAddresses,
    updateBackendEnv,
    generateJWTSecret,
    updateJWTSecret
};
