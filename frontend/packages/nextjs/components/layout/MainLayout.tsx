"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "~~/hooks/scaffold-eth";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isLoggedIn, currentDID } = useAuth();

  // 监听侧边栏切换事件
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener("toggleSidebar", handleSidebarToggle as EventListener);
    return () => window.removeEventListener("toggleSidebar", handleSidebarToggle as EventListener);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* 侧边栏 */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* 主内容区域 */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'lg:ml-0'
        } overflow-auto`}>
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
