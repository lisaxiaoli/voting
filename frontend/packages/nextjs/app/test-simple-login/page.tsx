"use client";

import { useState } from "react";

const TestSimpleLoginPage = () => {
  const [loginStatus, setLoginStatus] = useState({
    isLoggedIn: false,
    currentDID: undefined as string | undefined,
    authToken: undefined as string | undefined,
  });

  const handleLogin = () => {
    console.log('🚀 开始简单登录测试...');
    
    // 直接设置localStorage
    const testDID = "did:hebeu:test-" + Date.now();
    const testToken = "token-" + Date.now();
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentDID", testDID);
    localStorage.setItem("auth_token", testToken);
    
    console.log('✅ localStorage 已设置:', {
      isLoggedIn: "true",
      currentDID: testDID,
      authToken: testToken
    });
    
    // 直接更新组件状态
    setLoginStatus({
      isLoggedIn: true,
      currentDID: testDID,
      authToken: testToken,
    });
    
    console.log('✅ 组件状态已更新:', {
      isLoggedIn: true,
      currentDID: testDID,
      authToken: testToken
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    setLoginStatus({
      isLoggedIn: false,
      currentDID: undefined,
      authToken: undefined,
    });
    console.log('✅ 已登出');
  };

  const checkLocalStorage = () => {
    const data = {
      isLoggedIn: localStorage.getItem("isLoggedIn"),
      currentDID: localStorage.getItem("currentDID"),
      authToken: localStorage.getItem("auth_token"),
    };
    console.log('🔍 当前localStorage:', data);
    return data;
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">简单登录测试</h1>
        
        <div className="grid gap-6">
          {/* 当前状态 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">当前状态</h2>
              <div className="space-y-2">
                <p><strong>isLoggedIn:</strong> {loginStatus.isLoggedIn ? 'true' : 'false'}</p>
                <p><strong>currentDID:</strong> {loginStatus.currentDID || 'undefined'}</p>
                <p><strong>authToken:</strong> {loginStatus.authToken ? '存在' : '不存在'}</p>
              </div>
            </div>
          </div>

          {/* localStorage 数据 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">localStorage 数据</h2>
              <div className="space-y-2">
                {(() => {
                  const data = checkLocalStorage();
                  return (
                    <>
                      <p><strong>isLoggedIn:</strong> {data.isLoggedIn || 'undefined'}</p>
                      <p><strong>currentDID:</strong> {data.currentDID || 'undefined'}</p>
                      <p><strong>authToken:</strong> {data.authToken ? '存在' : '不存在'}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">测试操作</h2>
              <div className="flex gap-4">
                <button className="btn btn-primary" onClick={handleLogin}>
                  简单登录测试
                </button>
                <button className="btn btn-error" onClick={handleLogout}>
                  登出
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => window.location.href = '/'}
                >
                  返回主页测试
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSimpleLoginPage;
