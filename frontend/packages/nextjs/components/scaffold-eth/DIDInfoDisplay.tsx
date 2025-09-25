"use client";

import React from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "~~/hooks/scaffold-eth";

interface DIDInfoDisplayProps {
  className?: string;
  isMobile?: boolean;
}

export const DIDInfoDisplay: React.FC<DIDInfoDisplayProps> = ({ 
  className = "", 
  isMobile = false 
}) => {
  const { isLoggedIn, currentDID, logout, isLoading } = useAuth();

  // 如果正在加载，显示加载状态
  if (isLoading) {
    if (isMobile) {
      return (
        <li className="px-3 py-2 border-b border-base-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
            <div className="text-xs text-base-content/70">检查登录状态...</div>
          </div>
        </li>
      );
    }
    return (
      <div className={`flex items-center gap-3 px-4 py-2 bg-base-200 rounded-lg border border-base-300 ${className}`}>
        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
        <div className="text-xs text-base-content/70">检查登录状态...</div>
      </div>
    );
  }

  if (!isLoggedIn || !currentDID) {
    return null;
  }

  if (isMobile) {
    return (
      <li className="px-3 py-2 border-b border-base-300">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <div className="text-xs flex-1">
            <div className="text-base-content/70">当前DID</div>
            <div className="font-mono text-xs truncate max-w-40">
              {currentDID}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-ghost btn-xs p-1 hover:bg-error hover:text-error-content transition-colors"
            aria-label="登出"
            title="登出"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </li>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-2 bg-base-200 rounded-lg border border-base-300 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-success rounded-full"></div>
        <div className="text-sm">
          <div className="text-xs text-base-content/70 mb-1">当前DID</div>
          <div className="font-mono text-xs max-w-40 truncate font-medium">
            {currentDID}
          </div>
        </div>
      </div>
      <div className="divider divider-horizontal h-6"></div>
      <button
        onClick={logout}
        className="btn btn-ghost btn-sm p-2 hover:bg-error hover:text-error-content transition-colors"
        aria-label="登出"
        title="登出"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
