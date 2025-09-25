"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    KeyIcon,
    DocumentTextIcon,
    UserCircleIcon,
    HomeIcon,
    Bars3Icon
} from "@heroicons/react/24/outline";
import { useAuth } from "~~/hooks/scaffold-eth";

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const pathname = usePathname();
    const { isLoggedIn, currentDID, isLoading } = useAuth();

    console.log('🔍 Sidebar 组件状态:', {
        isLoggedIn,
        currentDID,
        pathname,
        isLoading
    });

    // 游客可见的导航项
    const guestNavItems = [
        {
            label: "首页",
            href: "/",
            icon: <HomeIcon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />,
        },
        {
            label: "创建DID",
            href: "/create-did",
            icon: <KeyIcon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />,
        },
        {
            label: "登录",
            href: "/login",
            icon: <UserCircleIcon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />,
        },
    ];

    // 登录用户可见的导航项
    const loggedInNavItems = [
        {
            label: "首页",
            href: "/",
            icon: <HomeIcon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />,
        },
        {
            label: "创建DID",
            href: "/create-did",
            icon: <KeyIcon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />,
        },
        {
            label: "获取DID文档",
            href: "/get-did-document",
            icon: <DocumentTextIcon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />,
        },
    ];

    const navItems = isLoggedIn ? loggedInNavItems : guestNavItems;

    return (
        <div className={`bg-base-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-full flex flex-col`}>
            {/* 侧边栏头部 */}
            <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <h2 className="text-lg font-semibold text-base-content">
                            {isLoggedIn ? 'DID管理系统' : 'LC Voting'}
                        </h2>
                    )}
                    <button
                        onClick={onToggle}
                        className="btn btn-ghost btn-sm p-1"
                        aria-label={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="h-4 w-4" />
                        ) : (
                            <ChevronLeftIcon className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* 用户信息区域 */}
            {isLoggedIn && currentDID && (
                <div className="p-4 border-b border-base-300">
                    <div className={`${isCollapsed ? 'text-center' : ''}`}>
                        <div className="text-sm text-base-content/70 mb-1">
                            {isCollapsed ? 'DID' : '当前DID'}
                        </div>
                        <div className={`text-xs font-mono break-all ${isCollapsed ? 'truncate' : ''}`}>
                            {isCollapsed ? currentDID.substring(0, 8) + '...' : currentDID}
                        </div>
                    </div>
                </div>
            )}

            {/* 导航菜单 */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary text-primary-content'
                                        : isCollapsed
                                            ? 'hover:bg-base-300 text-base-content hover:text-base-content hover:shadow-sm'
                                            : 'hover:bg-base-300 text-base-content'
                                        } ${isCollapsed ? 'justify-center px-4 py-3' : ''}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <span className={`${isActive ? 'text-primary-content' : 'text-base-content'}`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* 底部信息 */}
            {!isCollapsed && (
                <div className="p-4 border-t border-base-300">
                    <div className="text-xs text-base-content/50 text-center">
                        LC Voting System v1.0
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
