"use client";

import { useAuth } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

const DebugAuthPage = () => {
    const { isLoggedIn, currentDID, isLoading, authToken, login } = useAuth();
    const { address, isConnected } = useAccount();

    const checkLocalStorage = () => {
        if (typeof window === "undefined") return {};

        return {
            isLoggedIn: localStorage.getItem("isLoggedIn"),
            currentDID: localStorage.getItem("currentDID"),
            authToken: localStorage.getItem("auth_token"),
            userInfo: localStorage.getItem("user_info"),
        };
    };

    const localStorageData = checkLocalStorage();

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">认证状态调试页面</h1>

                <div className="grid gap-6">
                    {/* AuthContext 状态 */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">AuthContext 状态</h2>
                            <div className="space-y-2">
                                <p><strong>isLoggedIn:</strong> {isLoggedIn ? 'true' : 'false'}</p>
                                <p><strong>currentDID:</strong> {currentDID || 'undefined'}</p>
                                <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
                                <p><strong>authToken:</strong> {authToken ? '存在' : '不存在'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 钱包状态 */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">钱包状态</h2>
                            <div className="space-y-2">
                                <p><strong>isConnected:</strong> {isConnected ? 'true' : 'false'}</p>
                                <p><strong>address:</strong> {address || 'undefined'}</p>
                            </div>
                        </div>
                    </div>

                    {/* localStorage 数据 */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">localStorage 数据</h2>
                            <div className="space-y-2">
                                <p><strong>isLoggedIn:</strong> {localStorageData.isLoggedIn || 'undefined'}</p>
                                <p><strong>currentDID:</strong> {localStorageData.currentDID || 'undefined'}</p>
                                <p><strong>authToken:</strong> {localStorageData.authToken ? '存在' : '不存在'}</p>
                                <p><strong>userInfo:</strong> {localStorageData.userInfo || 'undefined'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cookie 数据 */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Cookie 数据</h2>
                            <div className="space-y-2">
                                <p><strong>document.cookie:</strong></p>
                                <pre className="bg-base-200 p-2 rounded text-sm overflow-auto">
                                    {typeof window !== "undefined" ? document.cookie : "SSR"}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">测试操作</h2>
                            <div className="flex gap-4">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        // 直接调用login函数
                                        login("did:hebeu:test-uuid", "test-token");
                                    }}
                                >
                                    测试AuthContext登录
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        // 直接设置localStorage
                                        localStorage.setItem("isLoggedIn", "true");
                                        localStorage.setItem("currentDID", "did:hebeu:test-uuid");
                                        localStorage.setItem("auth_token", "test-token");
                                        window.location.reload();
                                    }}
                                >
                                    手动设置localStorage
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        localStorage.setItem("isLoggedIn", "true");
                                        localStorage.setItem("currentDID", "did:hebeu:test-uuid");
                                        window.location.reload();
                                    }}
                                >
                                    手动设置localStorage
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={() => {
                                        localStorage.clear();
                                        window.location.reload();
                                    }}
                                >
                                    清除所有数据
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugAuthPage;
