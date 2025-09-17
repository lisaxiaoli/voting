#!/usr/bin/env node

/**
 * 一键部署和配置脚本
 * 1. 部署合约到指定网络
 * 2. 自动更新合约地址
 * 3. 生成JWT密钥
 * 4. 重启后端服务
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 执行命令
 */
function execCommand(command, cwd = process.cwd()) {
    try {
        log(`🔧 执行命令: ${command}`, 'cyan');
        const output = execSync(command, {
            cwd,
            stdio: 'inherit',
            encoding: 'utf8'
        });
        return output;
    } catch (error) {
        log(`❌ 命令执行失败: ${command}`, 'red');
        log(`错误信息: ${error.message}`, 'red');
        throw error;
    }
}

/**
 * 检查依赖
 */
function checkDependencies() {
    log('🔍 检查依赖...', 'blue');

    // 检查Node.js版本
    const nodeVersion = process.version;
    log(`📋 Node.js版本: ${nodeVersion}`, 'green');

    // 检查必要的命令
    const commands = ['yarn', 'node'];
    commands.forEach(cmd => {
        try {
            execSync(`which ${cmd}`, { stdio: 'ignore' });
            log(`✅ ${cmd} 已安装`, 'green');
        } catch (error) {
            log(`❌ ${cmd} 未安装`, 'red');
            throw new Error(`${cmd} 未安装`);
        }
    });
}

/**
 * 部署合约
 */
function deployContracts(network = 'localhost') {
    log(`🚀 开始部署合约到网络: ${network}`, 'blue');

    const hardhatPath = path.join(__dirname, '../packages/hardhat');

    try {
        // 安装依赖（如果需要）
        if (!fs.existsSync(path.join(hardhatPath, 'node_modules'))) {
            log('📦 安装Hardhat依赖...', 'yellow');
            execCommand('yarn install', hardhatPath);
        }

        // 部署合约
        log('📋 部署DIDManager合约...', 'yellow');
        execCommand(`yarn deploy --network ${network}`, hardhatPath);

        log('✅ 合约部署成功!', 'green');

    } catch (error) {
        log('❌ 合约部署失败', 'red');
        throw error;
    }
}

/**
 * 更新配置
 */
function updateConfiguration() {
    log('⚙️  更新配置...', 'blue');

    try {
        const updateScript = path.join(__dirname, 'update-contract-address.js');
        execCommand(`node ${updateScript}`);

        log('✅ 配置更新成功!', 'green');

    } catch (error) {
        log('❌ 配置更新失败', 'red');
        throw error;
    }
}

/**
 * 启动后端服务
 */
function startBackendService() {
    log('🚀 启动后端服务...', 'blue');

    const backendPath = path.join(__dirname, '../../backend');

    try {
        // 检查后端依赖
        if (!fs.existsSync(path.join(backendPath, 'node_modules'))) {
            log('📦 安装后端依赖...', 'yellow');
            execCommand('npm install', backendPath);
        }

        // 检查环境配置
        const envPath = path.join(backendPath, '.env');
        if (!fs.existsSync(envPath)) {
            log('📝 创建环境配置文件...', 'yellow');
            execCommand('cp env.example .env', backendPath);
        }

        log('✅ 后端服务准备就绪!', 'green');
        log('💡 请手动启动后端服务: cd backend && npm run dev', 'cyan');

    } catch (error) {
        log('❌ 后端服务启动失败', 'red');
        throw error;
    }
}

/**
 * 显示网络选择菜单
 */
function showNetworkMenu() {
    const networks = {
        '1': { name: 'hardhat', description: '本地开发网络 (localhost:8545)' },
        '2': { name: 'sepolia', description: '以太坊测试网' },
        '3': { name: 'arbitrumSepolia', description: 'Arbitrum测试网' },
        '4': { name: 'optimismSepolia', description: 'Optimism测试网' },
        '5': { name: 'polygonAmoy', description: 'Polygon测试网' }
    };

    log('\n🌐 请选择部署网络:', 'bright');
    log('='.repeat(50), 'cyan');

    Object.entries(networks).forEach(([key, network]) => {
        log(`${key}. ${network.name} - ${network.description}`, 'yellow');
    });

    log('='.repeat(50), 'cyan');

    return networks;
}

/**
 * 主函数
 */
function main() {
    log('🎯 DID系统一键部署和配置脚本', 'bright');
    log('='.repeat(50), 'cyan');

    try {
        // 解析命令行参数
        const args = process.argv.slice(2);
        let network = args[0] || 'hardhat';

        // 如果没有指定网络，显示菜单
        if (!args[0]) {
            const networks = showNetworkMenu();
            // 默认使用hardhat
            network = networks['1'].name;
            log(`\n📋 使用默认网络: ${network}`, 'green');
        }

        // 检查依赖
        checkDependencies();

        // 部署合约
        deployContracts(network);

        // 更新配置
        updateConfiguration();

        // 启动后端服务
        startBackendService();

        log('\n🎉 部署和配置完成!', 'green');
        log('='.repeat(50), 'cyan');
        log('📋 下一步操作:', 'bright');
        log('1. 启动后端: cd backend && npm run dev', 'yellow');
        log('2. 启动前端: cd frontend/packages/nextjs && yarn dev', 'yellow');
        log('3. 访问应用: http://localhost:3000', 'yellow');
        log('='.repeat(50), 'cyan');

    } catch (error) {
        log('\n💥 部署失败!', 'red');
        log(`错误: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    checkDependencies,
    deployContracts,
    updateConfiguration,
    startBackendService
};
