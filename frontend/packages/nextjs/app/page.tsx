"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon, KeyIcon, DocumentTextIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useState, useEffect } from "react";
import { useAuth } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { isLoggedIn, currentDID } = useAuth();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">欢迎来到</span>
            <span className="block text-4xl font-bold">LC Voting 系统</span>
          </h1>

          {isLoggedIn && currentDID ? (
            <div className="flex justify-center items-center space-x-2 flex-col">
              <p className="my-2 font-medium">当前DID身份:</p>
              <div className="font-mono text-sm bg-base-200 px-3 py-1 rounded">
                {currentDID}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center space-x-2 flex-col">
              <p className="my-2 font-medium">连接的钱包地址:</p>
              <Address address={connectedAddress} />
            </div>
          )}

          <p className="text-center text-lg mt-4">
            {isLoggedIn
              ? "您已成功登录DID身份管理系统，可以使用所有功能模块。"
              : "请先创建DID身份或登录现有身份以使用完整功能。"
            }
          </p>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <KeyIcon className="h-8 w-8 fill-secondary" />
              <p>
                创建您的去中心化身份{" "}
                <Link href="/create-did" passHref className="link">
                  创建DID
                </Link>{" "}
                系统。
              </p>
            </div>

            {isLoggedIn ? (
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <DocumentTextIcon className="h-8 w-8 fill-secondary" />
                <p>
                  查看您的DID文档{" "}
                  <Link href="/get-did-document" passHref className="link">
                    获取DID文档
                  </Link>{" "}
                  功能。
                </p>
              </div>
            ) : (
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <UserCircleIcon className="h-8 w-8 fill-secondary" />
                <p>
                  登录您的DID身份{" "}
                  <Link href="/login" passHref className="link">
                    登录
                  </Link>{" "}
                  系统。
                </p>
              </div>
            )}

            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                探索本地交易记录{" "}
                <Link href="/blockexplorer" passHref className="link">
                  区块浏览器
                </Link>{" "}
                功能。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
