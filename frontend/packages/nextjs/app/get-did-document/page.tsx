"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ArrowLeftOnRectangleIcon,
    ArrowPathIcon,
    ClipboardDocumentIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon
} from "@heroicons/react/24/outline";
import { Address, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { useAuth } from "~~/hooks/scaffold-eth";

// DID文档接口（对应合约结构）
interface DIDDocument {
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

// DID选择组件
interface DIDSelectorProps {
    availableDIDs: string[];
    selectedDID: string;
    onSelectDID: (did: string) => void;
    isLoading: boolean;
    currentDID?: string;
}

const DIDSelector = ({ availableDIDs, selectedDID, onSelectDID, isLoading, currentDID }: DIDSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭下拉列表
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (did: string) => {
        onSelectDID(did);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="flex border-2 border-base-300 bg-base-200 rounded-full text-accent">
                <input
                    className="input input-ghost focus-within:border-transparent focus:outline-hidden focus:bg-transparent h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/70 text-base-content/70 focus:text-base-content/70"
                    placeholder="选择DID文档..."
                    value={selectedDID}
                    readOnly
                    onClick={() => setIsOpen(!isOpen)}
                />
                <button
                    className="btn btn-ghost btn-sm px-2"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isLoading || availableDIDs.length === 0}
                >
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="px-4 py-2 text-center text-base-content/70">
                            <ArrowPathIcon className="h-4 w-4 animate-spin mx-auto mb-1" />
                            加载中...
                        </div>
                    ) : availableDIDs.length === 0 ? (
                        <div className="px-4 py-2 text-center text-base-content/70">
                            当前钱包账户未创建任何DID
                        </div>
                    ) : (
                        availableDIDs.map((did, index) => (
                            <button
                                key={index}
                                className={`w-full text-left px-4 py-2 hover:bg-base-200 transition-colors ${did === selectedDID ? 'bg-primary/10 text-primary' : 'text-base-content'
                                    } ${did === currentDID ? 'font-semibold' : ''}`}
                                onClick={() => handleSelect(did)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs break-all flex-1">{did}</span>
                                    {did === currentDID && (
                                        <span className="badge badge-primary badge-xs ml-2">
                                            当前登录
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const GetDIDDocumentPage = () => {
    const [selectedDID, setSelectedDID] = useState<string>('');
    const [documentData, setDocumentData] = useState<DIDDocument | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [availableDIDs, setAvailableDIDs] = useState<string[]>([]);
    const [isLoadingDIDs, setIsLoadingDIDs] = useState<boolean>(false);

    // 获取钱包连接状态和认证状态
    const { address: connectedAddress, isConnected } = useAccount();
    const { isLoggedIn, currentDID, logout } = useAuth();

    // 初始化时设置当前登录的DID为默认选择（如果可用）
    useEffect(() => {
        if (currentDID && isLoggedIn) {
            setSelectedDID(currentDID);
        }
    }, [currentDID, isLoggedIn]);

    // 使用Scaffold-ETH hook读取合约数据
    const { data: contractDocument, isLoading: isContractLoading, error: contractError } = useScaffoldReadContract({
        contractName: "DIDManager",
        functionName: "getDocument",
        args: selectedDID ? [selectedDID] : [""],
        query: {
            enabled: !!selectedDID && selectedDID.trim() !== '',
        }
    });

    // 从区块链获取当前钱包的DID列表
    const { data: blockchainDIDList, isLoading: isBlockchainLoading, error: blockchainError } = useScaffoldReadContract({
        contractName: "DIDManager",
        functionName: "getDidListByAddress" as any,
        args: connectedAddress ? [connectedAddress] : undefined as any,
        query: {
            enabled: isConnected && !!connectedAddress,
        }
    });

    // 调试信息
    console.log('🔍 DID列表获取调试信息:', {
        isConnected,
        connectedAddress,
        blockchainDIDList,
        isBlockchainLoading,
        blockchainError
    });

    // 调试availableDIDs
    console.log('🔍 渲染时availableDIDs:', availableDIDs, '长度:', availableDIDs?.length);

    // 额外调试：检查钱包地址
    console.log('🔍 当前连接的钱包地址:', connectedAddress);
    console.log('🔍 从DID文档获取的owner地址:', documentData?.owner);
    console.log('🔍 地址是否匹配:', connectedAddress === documentData?.owner);

    // 处理合约数据变化
    useEffect(() => {
        if (contractDocument && selectedDID) {
            setIsLoading(false);
            setError(null);

            // 转换合约返回的数据格式
            const document: DIDDocument = {
                did: contractDocument.did,
                version: Number(contractDocument.version),
                createdAt: formatTimestamp(contractDocument.createdAt),
                updatedAt: formatTimestamp(contractDocument.updatedAt),
                mainPublicKey: contractDocument.mainPublicKey,
                recoPublicKey: contractDocument.recoPublicKey,
                serviceEndpoint: contractDocument.serviceEndpoint,
                didProof: contractDocument.didProof,
                owner: contractDocument.owner
            };

            setDocumentData(document);
        } else if (contractError && selectedDID) {
            setIsLoading(false);
            setError('DID不存在或获取失败');
        }
    }, [contractDocument, contractError, selectedDID]);

    // 处理DID列表数据变化 - 只从区块链获取当前钱包的DID列表
    useEffect(() => {
        const loadDIDList = async () => {
            setIsLoadingDIDs(true);
            try {
                let didList: string[] = [];

                // 只从区块链获取当前钱包的DID列表
                if (blockchainDIDList && Array.isArray(blockchainDIDList) && blockchainDIDList.length > 0) {
                    didList = [...blockchainDIDList];
                    console.log('从区块链获取当前钱包的DID列表:', didList);
                } else {
                    console.log('当前钱包未创建任何DID');
                    didList = [];
                }

                setAvailableDIDs(didList);
                console.log('✅ 设置可用DID列表:', didList);

                // 智能选择DID逻辑 - 优先选择当前登录的DID，如果不在列表中则选择第一个
                if (didList.length > 0) {
                    const currentDIDInList = didList.find(did => did === currentDID);
                    if (currentDIDInList) {
                        // 如果当前登录的DID在列表中，优先选择它
                        setSelectedDID(currentDIDInList);
                        console.log('✅ 选择当前登录的DID:', currentDIDInList);
                    } else {
                        // 如果当前登录的DID不在列表中，选择第一个
                        setSelectedDID(didList[0]);
                        console.log('✅ 当前登录DID不在列表中，选择第一个:', didList[0]);
                    }
                }
            } catch (error) {
                console.error('加载DID列表失败:', error);
                setAvailableDIDs([]);
            } finally {
                setIsLoadingDIDs(false);
            }
        };

        // 只有在钱包连接时才加载DID列表
        if (isConnected) {
            loadDIDList();
        } else {
            setAvailableDIDs([]);
            setIsLoadingDIDs(false);
        }
    }, [blockchainDIDList, isConnected]);

    // 格式化时间戳
    const formatTimestamp = (timestamp: string): string => {
        try {
            const date = new Date(Number(timestamp) * 1000);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return timestamp;
        }
    };

    // 处理选择DID
    const handleSelectDID = (did: string) => {
        setSelectedDID(did);
        setError(null);
        setDocumentData(null);
    };

    // 刷新DID列表
    const handleRefreshDIDList = () => {
        console.log('🔄 手动刷新DID列表...');
        console.log('当前blockchainDIDList:', blockchainDIDList);
        console.log('当前availableDIDs:', availableDIDs);
        console.log('当前selectedDID:', selectedDID);
        setIsLoadingDIDs(true);
        // 重新触发useEffect
        setAvailableDIDs([]);
        // 强制刷新页面数据
        window.location.reload();
    };

    // 手动测试合约调用
    const testContractCall = async () => {
        if (!isConnected) {
            alert('请先连接钱包');
            return;
        }

        try {
            console.log('🧪 手动测试合约调用...');
            console.log('钱包地址:', connectedAddress);
            console.log('合约地址:', '0x5FbDB2315678afecb367f032d93F642f64180aa3');
            console.log('当前DID列表长度:', Array.isArray(blockchainDIDList) ? blockchainDIDList.length : 0);
            console.log('当前DID列表内容:', blockchainDIDList);

            // 检查是否有DID文档数据
            if (documentData) {
                console.log('🔍 DID文档owner地址:', documentData.owner);
                console.log('🔍 当前钱包地址:', connectedAddress);
                console.log('🔍 地址是否匹配:', connectedAddress === documentData.owner);
            }

            // 建议用户检查调试页面
            console.log('💡 建议在调试页面验证：');
            console.log('1. 调用 getDidList 方法');
            console.log('2. 检查返回结果');
            console.log('3. 如果返回空数组，说明 ownerDIDs 映射有问题');

            alert(`测试完成！\n钱包地址: ${connectedAddress}\nDID列表长度: ${Array.isArray(blockchainDIDList) ? blockchainDIDList.length : 0}\n\n建议：\n1. 在调试页面调用 getDidList\n2. 检查返回结果\n3. 如果返回空数组，说明 ownerDIDs 映射有问题`);
        } catch (error) {
            console.error('测试合约调用失败:', error);
            alert('测试失败，请查看控制台');
        }
    };


    // 复制到剪贴板
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${label}已复制到剪贴板`);
            setTimeout(() => setCopySuccess(null), 2000);
        } catch (error) {
            console.error('复制失败:', error);
        }
    };

    // 处理退出登录
    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-base-200">
            {/* 顶部导航栏 */}
            <div className="navbar bg-base-100 shadow-sm">
                <div className="flex-1">
                    <Link href="/" className="btn btn-ghost text-xl">
                        <DocumentTextIcon className="h-6 w-6 mr-2" />
                        DID管理系统
                    </Link>
                </div>
                <div className="flex-none">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">当前DID:</span>
                                <span className="font-mono text-xs max-w-32 truncate">
                                    {currentDID || '未登录'}
                                </span>
                            </div>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li>
                                <button onClick={handleLogout} className="text-error">
                                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                                    退出
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-base-content mb-4">DID文档管理</h1>
                    <p className="text-base-content/70 max-w-2xl mx-auto">
                        查看和管理当前钱包账户下所有DID的文档信息
                    </p>
                </div>

                {/* DID选择区域 */}
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <MagnifyingGlassIcon className="h-6 w-6" />
                            选择DID文档
                        </h2>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">选择DID文档</span>
                                <div className="flex items-center gap-2">
                                    <span className="label-text-alt text-info">
                                        {isConnected ? '已连接钱包' : '未连接钱包'}
                                    </span>
                                    <button
                                        className="btn btn-xs btn-ghost"
                                        onClick={handleRefreshDIDList}
                                        disabled={isLoadingDIDs}
                                        title="刷新DID列表"
                                    >
                                        <ArrowPathIcon className={`h-3 w-3 ${isLoadingDIDs ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </label>

                            {/* DID选择器 */}
                            {Array.isArray(availableDIDs) && availableDIDs.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-sm text-base-content/60">
                                        当前钱包账户共创建了 {availableDIDs.length} 个DID，请选择要查看的DID文档：
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <DIDSelector
                                    availableDIDs={availableDIDs}
                                    selectedDID={selectedDID}
                                    onSelectDID={handleSelectDID}
                                    isLoading={isLoadingDIDs}
                                    currentDID={currentDID}
                                />
                            </div>

                            {/* 空状态提示 */}
                            {!isLoadingDIDs && isConnected && (!Array.isArray(availableDIDs) || availableDIDs.length === 0) && (
                                <div className="alert alert-info">
                                    <DocumentTextIcon className="h-4 w-4" />
                                    <span className="text-sm">
                                        当前钱包未创建任何DID，请先
                                        <Link href="/create-did" className="link link-primary ml-1">
                                            创建DID
                                        </Link>
                                    </span>
                                </div>
                            )}

                            {/* DID列表状态提示 */}
                            {isLoadingDIDs && (
                                <div className="label">
                                    <span className="label-text-alt text-info">
                                        <ArrowPathIcon className="h-3 w-3 animate-spin inline mr-1" />
                                        正在从区块链加载DID列表...
                                    </span>
                                </div>
                            )}

                            {/* 调试信息显示 */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 p-3 bg-base-300 rounded-lg">
                                    <h4 className="text-sm font-bold mb-2">调试信息</h4>
                                    <div className="text-xs space-y-1">
                                        <div>钱包连接: {isConnected ? '✅' : '❌'}</div>
                                        <div>钱包地址: {connectedAddress || '未连接'}</div>
                                        <div>区块链加载中: {isBlockchainLoading ? '是' : '否'}</div>
                                        <div>区块链错误: {blockchainError ? blockchainError.message : '无'}</div>
                                        <div>DID列表长度: {blockchainDIDList?.length || 0}</div>
                                        <div>DID列表内容: {JSON.stringify(blockchainDIDList || [])}</div>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline mt-2"
                                        onClick={testContractCall}
                                    >
                                        测试合约调用
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 错误提示 */}
                        {error && (
                            <div className="alert alert-error mt-4">
                                <ExclamationTriangleIcon className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* 复制成功提示 */}
                        {copySuccess && (
                            <div className="alert alert-success mt-4">
                                <ClipboardDocumentIcon className="h-5 w-5" />
                                <span>{copySuccess}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DID文档显示区域 */}
                {documentData && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">
                                <DocumentTextIcon className="h-6 w-6" />
                                Document
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <tbody>
                                        <tr>
                                            <td className="bg-base-200 font-medium w-1/4">context</td>
                                            <td className="font-mono text-sm">https://w3id.org/did/v1</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">version</td>
                                            <td className="font-mono text-sm">{documentData.version}</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">DID</td>
                                            <td className="font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="break-all">{documentData.did}</span>
                                                    <button
                                                        className="btn btn-xs btn-ghost"
                                                        onClick={() => copyToClipboard(documentData.did, 'DID')}
                                                        title="复制DID"
                                                    >
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">createdTime</td>
                                            <td className="font-mono text-sm">{documentData.createdAt}</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">updatedTime</td>
                                            <td className="font-mono text-sm">{documentData.updatedAt}</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">encryptType</td>
                                            <td className="font-mono text-sm">Secp256k1</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">mainPubKey</td>
                                            <td className="font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="break-all">{documentData.mainPublicKey}</span>
                                                    <button
                                                        className="btn btn-xs btn-ghost"
                                                        onClick={() => copyToClipboard(documentData.mainPublicKey, '主公钥')}
                                                        title="复制主公钥"
                                                    >
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">recoPubKey</td>
                                            <td className="font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="break-all">{documentData.recoPublicKey}</span>
                                                    <button
                                                        className="btn btn-xs btn-ghost"
                                                        onClick={() => copyToClipboard(documentData.recoPublicKey, '恢复公钥')}
                                                        title="复制恢复公钥"
                                                    >
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">serviceEndpoint</td>
                                            <td className="font-mono text-sm">{documentData.serviceEndpoint}</td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">creator</td>
                                            <td className="font-mono text-sm">
                                                <Address address={documentData.owner} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-base-200 font-medium">signatureValue</td>
                                            <td className="font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="break-all">{documentData.didProof}</span>
                                                    <button
                                                        className="btn btn-xs btn-ghost"
                                                        onClick={() => copyToClipboard(documentData.didProof, '签名值')}
                                                        title="复制签名值"
                                                    >
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 加载状态 */}
                {isLoading && !documentData && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center">
                            <div className="loading loading-spinner loading-lg text-primary"></div>
                            <p className="text-base-content/70 mt-4">正在获取DID文档...</p>
                        </div>
                    </div>
                )}

                {/* 空状态 */}
                {!isLoading && !documentData && !error && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center">
                            <DocumentTextIcon className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                            <p className="text-base-content/70">
                                {Array.isArray(availableDIDs) && availableDIDs.length > 0 ? '请从下拉列表中选择DID来查看文档' : '当前钱包账户未创建任何DID'}
                            </p>
                            {(!Array.isArray(availableDIDs) || availableDIDs.length === 0) && (
                                <Link href="/create-did" className="btn btn-primary mt-4">
                                    创建DID
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GetDIDDocumentPage;
