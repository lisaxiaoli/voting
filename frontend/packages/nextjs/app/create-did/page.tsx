"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyIcon, ShieldCheckIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import {
    createDIDInfo,
    saveDIDToLocalStorage,
    validatePrivateKey,
    convertToContractParams,
    isLocalStorageAvailable,
    DIDInfo
} from "~~/utils/didUtils";

// 移除重复的DIDInfo接口定义，使用从utils导入的

const CreateDIDPage = () => {
    const [selectedMethod, setSelectedMethod] = useState<'system' | 'manual' | 'wallet'>('system');
    const [privateKey, setPrivateKey] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createdDID, setCreatedDID] = useState<DIDInfo | null>(null);
    const [showDIDInfo, setShowDIDInfo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    // 获取钱包连接状态
    const { address: connectedAddress, isConnected } = useAccount();

    // 获取合约写入hook
    const { writeContractAsync: writeDIDManagerAsync } = useScaffoldWriteContract({
        contractName: "DIDManager"
    });

    // 检查localStorage可用性
    const localStorageAvailable = isLocalStorageAvailable();

    // 复制到剪贴板功能
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${label}已复制到剪贴板`);
            setTimeout(() => setCopySuccess(null), 2000);
        } catch (error) {
            console.error('复制失败:', error);
            setError('复制失败，请手动复制');
        }
    };

    const handleCreateDID = async () => {
        setIsCreating(true);
        setError(null);

        try {
            // 验证输入
            if (selectedMethod === 'manual' && !validatePrivateKey(privateKey)) {
                throw new Error('私钥格式不正确，请输入64位十六进制字符串');
            }

            if (selectedMethod === 'wallet' && !isConnected) {
                throw new Error('请先连接钱包');
            }

            // 生成DID信息
            let didInfo: DIDInfo;
            if (selectedMethod === 'system') {
                didInfo = await createDIDInfo();
            } else if (selectedMethod === 'wallet') {
                // 使用钱包地址的哈希作为主私钥（简化处理）
                const walletPrivateKey = connectedAddress ?
                    connectedAddress.slice(2).padEnd(64, '0') :
                    (await createDIDInfo()).mainPrivateKey;
                didInfo = await createDIDInfo(walletPrivateKey);
            } else {
                didInfo = await createDIDInfo(privateKey);
            }

            // 调用合约创建DID
            if (writeDIDManagerAsync) {
                const contractParams = convertToContractParams(didInfo);

                await writeDIDManagerAsync({
                    functionName: "createDid",
                    args: [
                        contractParams.did,
                        BigInt(contractParams.version),
                        contractParams.mainPublicKey,
                        contractParams.recoPublicKey,
                        contractParams.serviceEndpoint,
                        contractParams.didProof
                    ]
                });
            }

            // 保存到localStorage
            if (localStorageAvailable) {
                saveDIDToLocalStorage(didInfo);
            } else {
                console.warn('localStorage不可用，无法保存DID信息');
            }

            setCreatedDID(didInfo);
            setShowDIDInfo(true);
        } catch (error) {
            console.error('创建DID失败:', error);

            // 处理不同类型的错误
            let errorMessage = '创建DID失败';

            if (error instanceof Error) {
                // 如果是用户拒绝交易
                if (error.message.includes('User rejected') || error.message.includes('用户拒绝了')) {
                    errorMessage = '用户取消了交易，DID创建被中断';
                }
                // 如果是网络错误
                else if (error.message.includes('network') || error.message.includes('Network')) {
                    errorMessage = '网络连接错误，请检查网络连接后重试';
                }
                // 如果是合约错误
                else if (error.message.includes('DID already exists')) {
                    errorMessage = '该DID已存在，请重新生成';
                }
                // 其他错误
                else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleConfirmDID = () => {
        setShowDIDInfo(false);
        setCreatedDID(null);
        // 重置表单状态，允许创建新的DID
        setPrivateKey('');
        setSelectedMethod('system');
    };

    const handleReturnToLogin = () => {
        // 跳转到登录页面
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-base-200">

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {!showDIDInfo ? (
                    <>
                        {/* 页面标题 */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-base-content mb-4">创建DID</h2>
                            <p className="text-base-content/70 max-w-2xl mx-auto">
                                选择一种方式来创建您的去中心化身份。DID将作为您在区块链上的唯一标识符。
                            </p>
                        </div>

                        {/* 创建方式选择 */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {/* 系统生成方式 */}
                            <div className={`card bg-base-100 shadow-xl border-2 transition-all duration-200 ${selectedMethod === 'system' ? 'border-primary shadow-primary/20' : 'border-base-300'
                                }`}>
                                <div className="card-body">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <KeyIcon className="h-6 w-6 text-primary" />
                                            <h3 className="text-xl font-semibold">系统生成</h3>
                                        </div>
                                        <input
                                            type="radio"
                                            name="method"
                                            className="radio radio-primary"
                                            checked={selectedMethod === 'system'}
                                            onChange={() => setSelectedMethod('system')}
                                        />
                                    </div>
                                    <p className="text-base-content/70 mb-4">
                                        由系统为您生成全新的私钥，并以此私钥创建DID。这种方式更安全，适合新用户。
                                    </p>
                                    <div className="card-actions justify-end">
                                        <button
                                            className={`btn ${selectedMethod === 'system' ? 'btn-primary' : 'btn-outline btn-primary'}`}
                                            onClick={() => setSelectedMethod('system')}
                                        >
                                            选择此方式
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 用户输入方式 */}
                            <div className={`card bg-base-100 shadow-xl border-2 transition-all duration-200 ${selectedMethod === 'manual' ? 'border-primary shadow-primary/20' : 'border-base-300'
                                }`}>
                                <div className="card-body">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheckIcon className="h-6 w-6 text-secondary" />
                                            <h3 className="text-xl font-semibold">使用现有私钥</h3>
                                        </div>
                                        <input
                                            type="radio"
                                            name="method"
                                            className="radio radio-primary"
                                            checked={selectedMethod === 'manual'}
                                            onChange={() => setSelectedMethod('manual')}
                                        />
                                    </div>
                                    <p className="text-base-content/70 mb-4">
                                        输入您现有的私钥来创建DID。系统将自动生成恢复密钥对（恢复私钥+恢复公钥）。
                                    </p>
                                    <div className="card-actions justify-end">
                                        <button
                                            className={`btn ${selectedMethod === 'manual' ? 'btn-secondary' : 'btn-outline btn-secondary'}`}
                                            onClick={() => setSelectedMethod('manual')}
                                        >
                                            选择此方式
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 钱包连接方式 */}
                            <div className={`card bg-base-100 shadow-xl border-2 transition-all duration-200 ${selectedMethod === 'wallet' ? 'border-accent shadow-accent/20' : 'border-base-300'
                                }`}>
                                <div className="card-body">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <WalletIcon className="h-6 w-6 text-accent" />
                                            <h3 className="text-xl font-semibold">钱包连接</h3>
                                        </div>
                                        <input
                                            type="radio"
                                            name="method"
                                            className="radio radio-accent"
                                            checked={selectedMethod === 'wallet'}
                                            onChange={() => setSelectedMethod('wallet')}
                                        />
                                    </div>
                                    <p className="text-base-content/70 mb-4">
                                        连接您的MetaMask或其他Web3钱包，使用现有账户创建DID。最简单的方式。
                                    </p>
                                    <div className="card-actions justify-end">
                                        <button
                                            className={`btn ${selectedMethod === 'wallet' ? 'btn-accent' : 'btn-outline btn-accent'}`}
                                            onClick={() => setSelectedMethod('wallet')}
                                        >
                                            选择此方式
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 钱包连接表单 */}
                        {selectedMethod === 'wallet' && (
                            <div className="card bg-base-100 shadow-xl mb-8">
                                <div className="card-body">
                                    <h3 className="text-xl font-semibold mb-4">连接钱包</h3>
                                    <div className="space-y-4">
                                        <div className="alert alert-info">
                                            <WalletIcon className="h-5 w-5" />
                                            <div className="text-sm">
                                                <p className="font-semibold">钱包连接说明：</p>
                                                <p>• 点击下方按钮连接您的Web3钱包</p>
                                                <p>• 系统将使用您钱包的地址创建DID</p>
                                                <p>• 无需输入私钥，更安全便捷</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <ConnectButton.Custom>
                                                {({ openConnectModal, mounted }) => {
                                                    const connected = mounted && isConnected;

                                                    if (!connected) {
                                                        return (
                                                            <button
                                                                className="btn btn-accent btn-lg"
                                                                onClick={openConnectModal}
                                                            >
                                                                <WalletIcon className="h-5 w-5 mr-2" />
                                                                连接钱包
                                                            </button>
                                                        );
                                                    }

                                                    return (
                                                        <div className="text-center">
                                                            <div className="alert alert-success mb-4">
                                                                <WalletIcon className="h-5 w-5" />
                                                                <span>钱包已连接</span>
                                                            </div>
                                                            <div className="text-sm">
                                                                <p className="font-medium">连接地址：</p>
                                                                <Address address={connectedAddress} />
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            </ConnectButton.Custom>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 输入表单 */}
                        {selectedMethod === 'manual' && (
                            <div className="card bg-base-100 shadow-xl mb-8">
                                <div className="card-body">
                                    <h3 className="text-xl font-semibold mb-4">输入密钥信息</h3>
                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-medium">私钥</span>
                                                <span className="label-text-alt text-error">* 必填</span>
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="请输入您的私钥（64位十六进制字符串）"
                                                className="input input-bordered w-full"
                                                value={privateKey}
                                                onChange={(e) => setPrivateKey(e.target.value)}
                                            />
                                            <label className="label">
                                                <span className="label-text-alt">
                                                    格式：64位十六进制字符串，如：a1b2c3d4e5f6...
                                                </span>
                                            </label>
                                        </div>
                                        <div className="alert alert-info">
                                            <ShieldCheckIcon className="h-4 w-4" />
                                            <div className="text-sm">
                                                <p className="font-semibold">安全提示：</p>
                                                <p>• 私钥必须正确，否则无法创建DID</p>
                                                <p>• 系统会自动生成恢复密钥对（恢复私钥+恢复公钥）</p>
                                                <p>• 恢复公钥对应恢复私钥，用于身份恢复验证</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 错误提示 */}
                        {error && (
                            <div className="alert alert-error mb-6 max-w-2xl mx-auto">
                                <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" />
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium">创建DID失败</span>
                                    <div className="text-xs text-error-content/80 break-words overflow-hidden">
                                        {error.length > 200 ? (
                                            <details className="cursor-pointer">
                                                <summary className="hover:text-error-content">
                                                    {error.substring(0, 200)}...
                                                </summary>
                                                <div className="mt-2 p-2 bg-error/20 rounded text-xs font-mono break-all">
                                                    {error}
                                                </div>
                                            </details>
                                        ) : (
                                            <span className="break-words">{error}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* localStorage状态提示 */}
                        {!localStorageAvailable && (
                            <div className="alert alert-warning mb-6 max-w-md mx-auto">
                                <ShieldCheckIcon className="h-4 w-4" />
                                <span className="text-sm">localStorage不可用，DID信息将无法保存到本地</span>
                            </div>
                        )}

                        {/* 复制成功提示 */}
                        {copySuccess && (
                            <div className="alert alert-success mb-6 max-w-md mx-auto">
                                <span className="text-sm">✅ {copySuccess}</span>
                            </div>
                        )}

                        {/* 创建按钮 */}
                        <div className="text-center">
                            <button
                                className={`btn btn-primary btn-lg ${isCreating ? 'loading' : ''}`}
                                onClick={handleCreateDID}
                                disabled={isCreating || (selectedMethod === 'manual' && !privateKey) || (selectedMethod === 'wallet' && !isConnected)}
                            >
                                {isCreating ? '创建中...' : '创建DID'}
                            </button>

                            {/* 状态提示 */}
                            {selectedMethod === 'wallet' && !isConnected && (
                                <div className="alert alert-warning mt-4 max-w-md mx-auto">
                                    <WalletIcon className="h-4 w-4" />
                                    <span className="text-sm">请先连接钱包才能创建DID</span>
                                </div>
                            )}

                            {selectedMethod === 'manual' && !privateKey && (
                                <div className="alert alert-warning mt-4 max-w-md mx-auto">
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    <span className="text-sm">请输入有效的私钥</span>
                                </div>
                            )}

                        </div>

                    </>
                ) : (
                    /* DID信息显示 */
                    <div className="text-center">
                        <div className="alert alert-success mb-8">
                            <KeyIcon className="h-6 w-6" />
                            <span className="text-lg font-semibold">DID创建成功！</span>
                        </div>

                        <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
                            <div className="card-body">
                                <h3 className="text-2xl font-bold mb-4">DID信息</h3>
                                <div className="alert alert-warning mb-4">
                                    <ShieldCheckIcon className="h-5 w-5" />
                                    <div>
                                        <span className="font-semibold">请安全保存以下密钥信息</span>
                                        <div className="text-sm mt-2">
                                            <p>• <strong>主私钥</strong>：用于日常DID操作，请妥善保管</p>
                                            <p>• <strong>恢复私钥</strong>：用于恢复丢失的主私钥，请安全存储</p>
                                            <p>• <strong>恢复公钥</strong>：对应恢复私钥的公钥，用于验证恢复操作，可以公开</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">DID标识符</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="input input-bordered flex-1 font-mono text-sm truncate"
                                                value={createdDID?.did}
                                                readOnly
                                                title={createdDID?.did}
                                            />
                                            <button
                                                className="btn btn-square"
                                                onClick={() => copyToClipboard(createdDID?.did || '', 'DID标识符')}
                                                title="复制DID标识符"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">主私钥</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                className="input input-bordered flex-1 font-mono text-sm"
                                                value={createdDID?.mainPrivateKey}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-square"
                                                onClick={() => copyToClipboard(createdDID?.mainPrivateKey || '', '主私钥')}
                                                title="复制主私钥"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">主公钥</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="input input-bordered flex-1 font-mono text-sm"
                                                value={createdDID?.mainPublicKey}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-square"
                                                onClick={() => copyToClipboard(createdDID?.mainPublicKey || '', '主公钥')}
                                                title="复制主公钥"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">恢复私钥</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                className="input input-bordered flex-1 font-mono text-sm"
                                                value={createdDID?.recoveryPrivateKey}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-square"
                                                onClick={() => copyToClipboard(createdDID?.recoveryPrivateKey || '', '恢复私钥')}
                                                title="复制恢复私钥"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">恢复公钥</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="input input-bordered flex-1 font-mono text-sm"
                                                value={createdDID?.recoveryPublicKey}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-square"
                                                onClick={() => copyToClipboard(createdDID?.recoveryPublicKey || '', '恢复公钥')}
                                                title="复制恢复公钥"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions justify-center mt-6">
                                    <button className="btn btn-primary" onClick={handleConfirmDID}>
                                        我已保存密钥信息
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-outline btn-lg mt-8"
                            onClick={handleReturnToLogin}
                        >
                            返回登录
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateDIDPage;
