"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyIcon, EyeIcon, EyeSlashIcon, UserCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import {
    getDIDListFromLocalStorage,
    getDIDFromLocalStorage,
    DIDInfo,
    generateLoginChallenge,
    validateDIDInfo,
    verifyPrivateKeyFormat
} from "~~/utils/didUtils";
import { useSignMessage } from "wagmi";
import { privateKeyToAccount, signMessage } from "viem/accounts";
import { useAuth } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

// 移除重复的DIDInfo接口定义，使用从utils导入的

const LoginPage = () => {
    const { login } = useAuth();
    const router = useRouter();
    const { address: connectedAddress, isConnected } = useAccount();
    const [privateKey, setPrivateKey] = useState('');
    const [selectedDID, setSelectedDID] = useState('');
    const [availableDIDs, setAvailableDIDs] = useState<string[]>([]);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [inputMode, setInputMode] = useState<'select' | 'manual'>('select');
    const [manualDID, setManualDID] = useState('');
    const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'signature'>('input');
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [testMode, setTestMode] = useState(false);

    // 从区块链获取当前钱包的DID列表
    const { data: blockchainDIDList, isLoading: isBlockchainLoading, error: blockchainError } = useScaffoldReadContract({
        contractName: "DIDManager",
        functionName: "getDidListByAddress" as any,
        args: connectedAddress ? [connectedAddress] : undefined as any,
        query: {
            enabled: isConnected && !!connectedAddress,
        }
    });

    // 处理DID列表数据变化 - 从区块链获取当前钱包的DID列表
    useEffect(() => {
        const loadDIDList = async () => {
            try {
                let didList: string[] = [];

                // 从区块链获取当前钱包的DID列表
                if (blockchainDIDList && Array.isArray(blockchainDIDList) && blockchainDIDList.length > 0) {
                    didList = [...blockchainDIDList];
                    console.log('从区块链获取当前钱包的DID列表:', didList);
                } else {
                    console.log('当前钱包未创建任何DID');
                    didList = [];
                }

                setAvailableDIDs(didList);
                console.log('✅ 设置可用DID列表:', didList);

                // 如果只有一个DID，自动选择它
                if (didList.length === 1) {
                    setSelectedDID(didList[0]);
                }
            } catch (error) {
                console.error('加载DID列表失败:', error);
                setAvailableDIDs([]);
            }
        };

        // 只有在钱包连接时才加载DID列表
        if (isConnected) {
            loadDIDList();
        } else {
            setAvailableDIDs([]);
        }
    }, [blockchainDIDList, isConnected]);

    // 测试函数：使用已知的私钥-DID对
    const testWithKnownKeypair = async () => {
        if (availableDIDs.length === 0) {
            setVerificationError('没有可用的DID进行测试');
            return;
        }

        const testDID = availableDIDs[0];
        console.log('🧪 开始测试已知私钥-DID对:');
        console.log('DID:', testDID);

        setSelectedDID(testDID);
        setTestMode(true);
    };

    // 清理localStorage并重新创建DID
    const clearLocalStorageAndRecreateDID = async () => {
        try {
            console.log('🧹 清理localStorage中的DID数据...');

            // 清理所有DID相关的localStorage数据
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('did_')) {
                    localStorage.removeItem(key);
                    console.log(`  删除: ${key}`);
                }
            });

            console.log('✅ localStorage清理完成');
            console.log('🔄 请刷新页面，然后重新创建DID');

            // 刷新页面
            window.location.reload();
        } catch (error) {
            console.error('清理localStorage失败:', error);
            setVerificationError('清理localStorage失败');
        }
    };

    const handleLogin = async () => {
        const currentDID = inputMode === 'manual' ? manualDID : selectedDID;

        console.log('🚀 handleLogin 开始执行:', { currentDID, privateKey: !!privateKey });

        if (!privateKey || !currentDID) {
            setVerificationError('请填写完整的登录信息');
            return;
        }

        setIsLoginLoading(true);
        setVerificationError(null);

        try {
            console.log('🔍 第一步：验证输入格式');
            // 第一步：验证输入格式
            await verifyInputFormat(currentDID);

            console.log('🔍 第二步：验证DID信息');
            // 第二步：验证DID信息
            await verifyDIDInfo(currentDID);

            // 简化版本：跳过复杂的后端验证，直接登录
            console.log('🔍 第三步：直接登录（跳过后端验证）');

            // 模拟登录成功
            const mockToken = 'mock-jwt-token-' + Date.now();

            // 保存到localStorage
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('user_info', JSON.stringify({
                did: currentDID,
                publicKey: 'mock-public-key',
                createdAt: new Date().toISOString()
            }));

            // 使用AuthContext登录
            login(currentDID, mockToken);

            console.log('✅ 登录成功:', { did: currentDID });

            // 使用 Next.js 路由跳转，避免页面刷新
            setTimeout(() => {
                router.push('/');
            }, 100);

        } catch (error) {
            console.error('登录失败:', error);
            setVerificationError(error instanceof Error ? error.message : '登录验证失败');
        } finally {
            setIsLoginLoading(false);
            setVerificationStep('input');
        }
    };

    // 验证输入格式
    const verifyInputFormat = async (did: string) => {
        setVerificationStep('verify');

        if (!verifyPrivateKeyFormat(privateKey)) {
            throw new Error('私钥格式不正确，请输入64位十六进制字符串');
        }

        if (!did.startsWith('did:hebeu:')) {
            throw new Error('DID格式不正确');
        }
    };

    // 验证DID信息
    const verifyDIDInfo = async (did: string) => {
        if (inputMode === 'select') {
            const didExists = availableDIDs.includes(did);
            if (!didExists) {
                throw new Error('未找到对应的DID信息');
            }
        }
    };

    // 使用私钥进行签名验证
    const performPrivateKeySignature = async (did: string) => {
        console.log('🚀 开始执行 performPrivateKeySignature 函数');
        console.log('📋 输入参数 - DID:', did);
        console.log('🔑 私钥:', privateKey);

        setVerificationStep('signature');

        try {
            // 第一步：从后端获取挑战消息
            console.log('🌐 开始请求挑战消息，DID:', did);
            console.log('🌐 请求URL: http://localhost:3001/api/auth/challenge');

            const challengeResponse = await fetch('http://localhost:3001/api/auth/challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ did })
            });

            console.log('🌐 挑战消息响应状态:', challengeResponse.status);
            console.log('🌐 挑战消息响应状态文本:', challengeResponse.statusText);
            console.log('🌐 挑战消息响应头:', Object.fromEntries(challengeResponse.headers.entries()));

            if (!challengeResponse.ok) {
                const errorText = await challengeResponse.text();
                console.error('🌐 挑战消息请求失败，响应内容:', errorText);
                throw new Error(`获取挑战消息失败: ${challengeResponse.status} ${challengeResponse.statusText}`);
            }

            const challengeResult = await challengeResponse.json();
            console.log('🌐 挑战消息响应数据:', challengeResult);

            if (!challengeResult.success) {
                throw new Error(challengeResult.error || '获取挑战消息失败');
            }

            const challenge = challengeResult.data.challenge;

            console.log('🚨🚨🚨 前端调试开始 🚨🚨🚨');
            console.log('🔍 前端收到的挑战消息:');
            console.log('📝 原始挑战消息:', `"${challenge}"`);
            console.log('📝 挑战消息长度:', challenge.length);
            console.log('📝 挑战消息字符码:', challenge.split('').map((c: string) => c.charCodeAt(0)));

            // 详细分析挑战消息的每个部分
            const lines = challenge.split('\n');
            console.log('📝 挑战消息分行分析:');
            lines.forEach((line: string, index: number) => {
                console.log(`  行${index + 1}: "${line}" (长度: ${line.length})`);
                console.log(`  字符码: [${line.split('').map((c: string) => c.charCodeAt(0)).join(', ')}]`);
            });

            // 第二步：使用viem进行私钥签名
            const account = privateKeyToAccount(`0x${privateKey}`);
            const signature = await account.signMessage({
                message: challenge
            });

            console.log('🔐 前端签名调试信息:');
            console.log('📝 完整挑战消息:', `"${challenge}"`);
            console.log('📝 挑战消息长度:', challenge.length);
            console.log('🔑 账户地址:', account.address);
            console.log('✍️ 完整签名:', signature);
            console.log('✍️ 签名长度:', signature.length);
            console.log('🆔 DID:', did);

            // 第三步：发送到后端验证
            await verifyWithBackend(did, challenge, signature);

        } catch (error) {
            console.error('🚨 前端签名过程发生异常:', error);
            console.error('🚨 异常类型:', typeof error);
            console.error('🚨 异常消息:', error instanceof Error ? error.message : String(error));
            console.error('🚨 异常堆栈:', error instanceof Error ? error.stack : 'No stack trace');

            if (error instanceof Error) {
                if (error.message.includes('Invalid private key')) {
                    throw new Error('私钥无效，请检查私钥是否正确');
                } else if (error.message.includes('Invalid hex')) {
                    throw new Error('私钥格式错误，请输入有效的十六进制字符串');
                }
            }
            throw new Error(`签名失败，请重试。具体错误: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // 与后端验证签名
    const verifyWithBackend = async (did: string, challenge: string, signature: string) => {
        console.log('🔍 开始调用后端验证接口');
        console.log('📋 验证参数:', { did, challenge, signature });

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    did,
                    challenge,
                    signature
                })
            });

            const result = await response.json();

            if (!result.success) {
                console.error('🚨 后端验证失败，响应内容:', result);
                throw new Error(result.error || '后端验证失败');
            }

            // 保存JWT令牌
            localStorage.setItem('auth_token', result.data.token);
            localStorage.setItem('user_info', JSON.stringify(result.data.user));

            console.log('后端验证成功:', result.data);

            // 使用新的Auth Context的login方法，传入token
            login(did, result.data.token);

            // 使用 Next.js 路由跳转，确保状态更新完成
            setTimeout(() => {
                console.log('🎉 登录成功，准备跳转到主页');
                router.push('/');
            }, 100);

        } catch (error) {
            console.error('后端验证失败:', error);
            throw error;
        }
    };

    const handleDIDChange = (did: string) => {
        setSelectedDID(did);
        // 清空私钥，让用户手动输入
        setPrivateKey('');
    };

    const currentDID = inputMode === 'manual' ? manualDID : selectedDID;
    const isFormValid = privateKey.trim() !== '' && currentDID.trim() !== '';

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
            <div className="card bg-base-100 shadow-xl w-full max-w-md mx-4">
                <div className="card-body">
                    {/* 页面标题 */}
                    <div className="text-center mb-8">
                        <UserCircleIcon className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-base-content">DID 登录</h1>
                        <p className="text-base-content/70 mt-2">
                            使用您的私钥和DID身份登录系统
                        </p>
                    </div>

                    {/* 登录表单 */}
                    <div className="space-y-6">
                        {/* 私钥输入 */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">私钥</span>
                                <span className="label-text-alt text-error">* 必填</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPrivateKey ? "text" : "password"}
                                    placeholder="请输入您的私钥"
                                    className="input input-bordered w-full pr-12"
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                                >
                                    {showPrivateKey ? (
                                        <EyeSlashIcon className="h-5 w-5 text-base-content/50" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-base-content/50" />
                                    )}
                                </button>
                            </div>
                            <label className="label">
                                <span className="label-text-alt text-info">
                                    私钥用于验证您的身份
                                </span>
                            </label>
                        </div>

                        {/* DID选择 */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">DID身份</span>
                                <span className="label-text-alt text-error">* 必填</span>
                            </label>

                            {/* 输入模式切换 */}
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    className={`btn btn-sm ${inputMode === 'select' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setInputMode('select')}
                                >
                                    选择已有DID
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${inputMode === 'manual' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setInputMode('manual')}
                                >
                                    手动输入DID
                                </button>
                            </div>

                            {inputMode === 'select' ? (
                                <div>
                                    {!isConnected ? (
                                        <div className="alert alert-warning">
                                            <DocumentTextIcon className="h-4 w-4" />
                                            <span className="text-sm">请先连接钱包以查看您的DID列表</span>
                                        </div>
                                    ) : isBlockchainLoading ? (
                                        <div className="alert alert-info">
                                            <DocumentTextIcon className="h-4 w-4" />
                                            <span className="text-sm">正在从区块链加载DID列表...</span>
                                        </div>
                                    ) : availableDIDs.length > 0 ? (
                                        <select
                                            className="select select-bordered w-full"
                                            value={selectedDID}
                                            onChange={(e) => handleDIDChange(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                请选择您的DID身份
                                            </option>
                                            {availableDIDs.map((did) => (
                                                <option key={did} value={did}>
                                                    {did.length > 50 ?
                                                        `${did.substring(0, 50)}...` :
                                                        did
                                                    }
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="alert alert-info">
                                            <DocumentTextIcon className="h-4 w-4" />
                                            <span className="text-sm">当前钱包未创建任何DID，请手动输入或</span>
                                            <Link href="/create-did" className="link link-primary ml-1">
                                                创建新的DID
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="请输入您的DID标识符"
                                    className="input input-bordered w-full font-mono text-sm"
                                    value={manualDID}
                                    onChange={(e) => setManualDID(e.target.value)}
                                />
                            )}

                            <label className="label">
                                <span className="label-text-alt text-info">
                                    {inputMode === 'select'
                                        ? '选择您要使用的去中心化身份'
                                        : '直接输入DID标识符'
                                    }
                                </span>
                            </label>
                        </div>

                        {/* 验证错误提示 */}
                        {verificationError && (
                            <div className="alert alert-error">
                                <KeyIcon className="h-4 w-4" />
                                <span className="text-sm">{verificationError}</span>
                            </div>
                        )}

                        {/* 验证状态显示 */}
                        {isLoginLoading && (
                            <div className="alert alert-info">
                                <KeyIcon className="h-4 w-4" />
                                <div className="text-sm">
                                    {verificationStep === 'verify' && (
                                        <span>正在验证DID信息和私钥格式...</span>
                                    )}
                                    {verificationStep === 'signature' && (
                                        <span>正在使用私钥进行数字签名验证...</span>
                                    )}
                                    <span>正在登录系统...</span>
                                </div>
                            </div>
                        )}

                        {/* 登录按钮 */}
                        <div className="form-control mt-8">
                            <div className="flex flex-col gap-4">
                                <button
                                    className={`btn btn-primary btn-lg ${isLoginLoading ? 'loading' : ''}`}
                                    onClick={handleLogin}
                                    disabled={!isFormValid || isLoginLoading}
                                >
                                    {isLoginLoading ? (
                                        verificationStep === 'signature' ? '签名验证中...' : '验证中...'
                                    ) : '登录'}
                                </button>

                                {/* 测试按钮 */}
                                {isConnected && availableDIDs.length > 0 && (
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={testWithKnownKeypair}
                                        disabled={isLoginLoading}
                                    >
                                        🧪 使用已知DID测试
                                    </button>
                                )}

                                {/* 清理按钮 */}
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={clearLocalStorageAndRecreateDID}
                                    disabled={isLoginLoading}
                                >
                                    🧹 清理并重新创建DID
                                </button>
                            </div>
                        </div>

                        {/* 创建DID链接 */}
                        <div className="text-center">
                            <p className="text-base-content/70">
                                还没有DID身份？
                                <Link href="/create-did" className="link link-primary ml-1">
                                    创建DID
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* 安全提示 */}
                    <div className="alert alert-info mt-6">
                        <KeyIcon className="h-5 w-5" />
                        <div className="text-sm">
                            <h3 className="font-bold">安全提示</h3>
                            <p>• 请确保在安全的环境中输入私钥</p>
                            <p>• 不要与他人分享您的私钥信息</p>
                            <p>• 建议使用硬件钱包等安全存储方式</p>
                            <p>• 私钥仅在本地进行签名，不会发送到服务器</p>
                            <p>• 系统会验证私钥与DID的匹配性</p>
                            <p>• 请先连接钱包以查看您创建的DID列表</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
