"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon, KeyIcon, UserCircleIcon, DocumentTextIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton, DIDInfoDisplay } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork, useAuth } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

// 游客可见的顶部导航
export const guestMenuLinks: HeaderMenuLink[] = [
  {
    label: "首页",
    href: "/",
  },
  {
    label: "创建DID",
    href: "/create-did",
    icon: <KeyIcon className="h-4 w-4" />,
  },
  {
    label: "调试",
    href: "/debug",
    icon: <WrenchScrewdriverIcon className="h-4 w-4" />,
  },
  {
    label: "登录",
    href: "/login",
    icon: <UserCircleIcon className="h-4 w-4" />,
  },
];

// 登录用户可见的顶部导航
export const loggedInMenuLinks: HeaderMenuLink[] = [
  {
    label: "首页",
    href: "/",
  },
  {
    label: "创建DID",
    href: "/create-did",
    icon: <KeyIcon className="h-4 w-4" />,
  },
  {
    label: "获取DID文档",
    href: "/get-did-document",
    icon: <DocumentTextIcon className="h-4 w-4" />,
  },
  {
    label: "调试",
    href: "/debug",
    icon: <WrenchScrewdriverIcon className="h-4 w-4" />,
  },
];

interface HeaderMenuLinksProps {
  isLoggedIn: boolean;
}

export const HeaderMenuLinks: React.FC<HeaderMenuLinksProps> = ({ isLoggedIn }) => {
  const pathname = usePathname();
  const menuLinks = isLoggedIn ? loggedInMenuLinks : guestMenuLinks;

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${isActive ? "bg-secondary shadow-md" : ""
                } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { address: connectedAddress, isConnected } = useAccount();
  const { isLoggedIn, currentDID, isLoading } = useAuth();

  console.log('🔍 Header 组件状态:', {
    connectedAddress,
    isConnected,
    isLoggedIn,
    currentDID,
    isLoading
  });


  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    // 触发自定义事件通知MainLayout
    window.dispatchEvent(new CustomEvent('toggleSidebar', {
      detail: { isCollapsed: !isSidebarCollapsed }
    }));
  };


  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        {/* 移动端汉堡菜单 */}
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            {/* 移动端DID信息 */}
            <DIDInfoDisplay isMobile={true} />
            <HeaderMenuLinks isLoggedIn={isLoggedIn} />
          </ul>
        </details>

        {/* 侧边栏切换按钮 */}
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-sm lg:hidden mr-2"
          aria-label="切换侧边栏"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">LC Voting</span>
            <span className="text-xs">DID管理系统</span>
          </div>
        </Link>

        {/* 桌面端导航菜单 */}
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks isLoggedIn={isLoggedIn} />
        </ul>
      </div>

      {/* 右侧区域 */}
      <div className="navbar-end grow mr-4 flex items-center gap-2">
        {/* 钱包连接按钮 */}
        <RainbowKitCustomConnectButton />

        {/* 用户信息区域 - 显示在钱包连接按钮右侧 */}
        <DIDInfoDisplay className="hidden lg:flex" />

        {/* 水龙头按钮 */}
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
