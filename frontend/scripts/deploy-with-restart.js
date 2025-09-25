#!/usr/bin/env node

/**
 * 部署合约并自动重启后端服务
 * 1. 部署合约到指定网络
 * 2. 自动更新合约地址
 * 3. 重启后端服务
 */

const { execSync, spawn } = require('child_process');
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
 * 检查后端服务是否运行
 */
function isBackendRunning() {
    try {
        const result = execSync('netstat -ano | findstr :3001', { encoding: 'utf8' });
        return result.trim().length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * 停止后端服务
 */
function stopBackendService() {
    if (isBackendRunning()) {
        log('🛑 停止后端服务...', 'yellow');
        try {
            // 查找并终止后端进程
            const result = execSync('netstat -ano | findstr :3001', { encoding: 'utf8' });
            const lines = result.trim().split('\n');
            for (const line of lines) {
                if (line.includes(':3001')) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== '0') {
                        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                        log(`✅ 已停止进程 PID: ${pid}`, 'green');
                    }
                }
            }
        } catch (error) {
            log('⚠️  停止后端服务时出现警告，但继续执行', 'yellow');
        }
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

        // 启动后端服务
        log('🔄 启动后端服务...', 'green');
        const backendProcess = spawn('npm', ['run', 'dev'], {
            cwd: backendPath,
            stdio: 'inherit',
            shell: true
        });

        // 等待服务启动
        setTimeout(() => {
            if (isBackendRunning()) {
                log('✅ 后端服务启动成功!', 'green');
                log('📍 后端地址: http://localhost:3001', 'cyan');
            } else {
                log('⚠️  后端服务可能未正常启动，请手动检查', 'yellow');
            }
        }, 3000);

        return backendProcess;

    } catch (error) {
        log('❌ 后端服务启动失败', 'red');
        throw error;
    }
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
 * 主函数
 */
function main() {
    log('🎯 DID系统部署和自动重启脚本', 'bright');
    log('='.repeat(50), 'cyan');

    try {
        // 解析命令行参数
        const args = process.argv.slice(2);
        const network = args[0] || 'localhost';

        log(`📋 目标网络: ${network}`, 'green');

        // 停止后端服务
        stopBackendService();

        // 部署合约
        deployContracts(network);

        // 更新配置
        updateConfiguration();

        // 启动后端服务
        const backendProcess = startBackendService();

        log('\n🎉 部署和重启完成!', 'green');
        log('='.repeat(50), 'cyan');
        log('📋 下一步操作:', 'bright');
        log('1. 启动前端: cd frontend/packages/nextjs && yarn dev', 'yellow');
        log('2. 访问应用: http://localhost:3000', 'yellow');
        log('3. 后端服务已自动启动: http://localhost:3001', 'yellow');
        log('='.repeat(50), 'cyan');

        // 处理进程退出
        process.on('SIGINT', () => {
            log('\n🛑 正在停止后端服务...', 'yellow');
            if (backendProcess) {
                backendProcess.kill();
            }
            process.exit(0);
        });

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
    deployContracts,
    updateConfiguration,
    stopBackendService,
    startBackendService
};
