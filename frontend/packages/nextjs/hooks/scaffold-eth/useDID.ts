"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

interface DIDInfo {
  did: string;
  mainPrivateKey: string;
  mainPublicKey: string;
  recoPrivateKey: string;
  recoPublicKey: string;
  serviceEndpoint: string;
  createdAt: string;
}

interface DIDState {
  didList: DIDInfo[];
  currentDIDInfo: DIDInfo | null;
  isLoading: boolean;
}

interface DIDActions {
  refreshDIDList: () => void;
  getDIDInfo: (did: string) => DIDInfo | null;
  saveDIDInfo: (didInfo: DIDInfo) => void;
  deleteDIDInfo: (did: string) => void;
}

export const useDID = (): DIDState & DIDActions => {
  const { currentDID } = useAuth();
  const [didList, setDidList] = useState<DIDInfo[]>([]);
  const [currentDIDInfo, setCurrentDIDInfo] = useState<DIDInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从localStorage获取DID列表
  const refreshDIDList = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const storedDIDList = localStorage.getItem("didList");
      const dids: DIDInfo[] = storedDIDList ? JSON.parse(storedDIDList) : [];
      setDidList(dids);

      // 如果有当前DID，获取其详细信息
      if (currentDID) {
        const didInfo = dids.find(did => did.did === currentDID);
        setCurrentDIDInfo(didInfo || null);
      } else {
        setCurrentDIDInfo(null);
      }
    } catch (error) {
      console.error("获取DID列表失败:", error);
      setDidList([]);
      setCurrentDIDInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentDID]);

  // 获取特定DID信息
  const getDIDInfo = useCallback((did: string): DIDInfo | null => {
    return didList.find(didInfo => didInfo.did === did) || null;
  }, [didList]);

  // 保存DID信息
  const saveDIDInfo = useCallback((didInfo: DIDInfo) => {
    if (typeof window === "undefined") return;

    try {
      const updatedList = didList.filter(did => did.did !== didInfo.did);
      updatedList.push(didInfo);
      
      localStorage.setItem("didList", JSON.stringify(updatedList));
      setDidList(updatedList);

      // 如果是当前DID，更新当前DID信息
      if (didInfo.did === currentDID) {
        setCurrentDIDInfo(didInfo);
      }
    } catch (error) {
      console.error("保存DID信息失败:", error);
    }
  }, [didList, currentDID]);

  // 删除DID信息
  const deleteDIDInfo = useCallback((did: string) => {
    if (typeof window === "undefined") return;

    try {
      const updatedList = didList.filter(didInfo => didInfo.did !== did);
      
      localStorage.setItem("didList", JSON.stringify(updatedList));
      setDidList(updatedList);

      // 如果删除的是当前DID，清空当前DID信息
      if (did === currentDID) {
        setCurrentDIDInfo(null);
      }
    } catch (error) {
      console.error("删除DID信息失败:", error);
    }
  }, [didList, currentDID]);

  // 初始化时获取DID列表
  useEffect(() => {
    refreshDIDList();
  }, [refreshDIDList]);

  return {
    didList,
    currentDIDInfo,
    isLoading,
    refreshDIDList,
    getDIDInfo,
    saveDIDInfo,
    deleteDIDInfo,
  };
};
