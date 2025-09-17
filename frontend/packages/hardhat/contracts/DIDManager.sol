// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title 去中心化身份管理合约
 * @dev 实现DID的创建、更新、删除和查询功能
 * 参考论文《基于去中心化身份验证的灵魂绑定数字简历系统》表4-4接口设计
 */
contract DIDManager {
    // DID文档存储结构
    struct DIDDocument {
        string did; // 去中心化身份标识符
        uint256 version; // 版本号
        string createdAt; // 创建时间戳
        string updatedAt; // 最后更新时间戳
        string mainPublicKey; // 主公钥信息
        string recoPublicKey; // 恢复公钥信息
        string serviceEndpoint; // 服务端点地址
        string didProof; // 认证签名信息
        address owner; // DID所有者地址
    }

    // 事件定义
    event DIDCreated(string indexed did, address indexed owner);
    event DIDUpdated(string indexed did, address indexed owner);
    event DIDDeleted(string indexed did, address indexed owner);

    // 存储映射
    mapping(string => DIDDocument) private didDocuments;
    mapping(string => bool) private didExists;
    mapping(address => string[]) private ownerDIDs;

    /**
     * @dev 创建新的去中心化身份
     * @param did 用户DID标识符
     * @param version 文档版本号
     * @param mainPublicKey 主公钥
     * @param recoPublicKey 恢复公钥
     * @param serviceEndpoint 服务端点
     * @param didProof 认证签名
     */
    function createDid(
        string memory did,
        uint256 version,
        string memory mainPublicKey,
        string memory recoPublicKey,
        string memory serviceEndpoint,
        string memory didProof
    ) public {
        require(!didExists[did], "DID already exists");

        // 创建新的DID文档
        DIDDocument memory newDoc = DIDDocument({
            did: did,
            version: version,
            createdAt: blockTimestampToString(),
            updatedAt: blockTimestampToString(),
            mainPublicKey: mainPublicKey,
            recoPublicKey: recoPublicKey,
            serviceEndpoint: serviceEndpoint,
            didProof: didProof,
            owner: msg.sender
        });

        // 存储到映射
        didDocuments[did] = newDoc;
        didExists[did] = true;
        ownerDIDs[msg.sender].push(did);

        emit DIDCreated(did, msg.sender);
    }

    /**
     * @dev 更新DID文档
     * @param did 要更新的DID标识符
     * @param newMainPublicKey 新的主公钥
     * @param newRecoPublicKey 新的恢复公钥
     * @param newServiceEndpoint 新的服务端点
     * @param newDidProof 新的认证签名
     */
    function updateDid(
        string memory did,
        string memory newMainPublicKey,
        string memory newRecoPublicKey,
        string memory newServiceEndpoint,
        string memory newDidProof
    ) public {
        require(didExists[did], "DID does not exist");
        require(didDocuments[did].owner == msg.sender, "Only DID owner can update");

        DIDDocument storage doc = didDocuments[did];
        doc.mainPublicKey = newMainPublicKey;
        doc.recoPublicKey = newRecoPublicKey;
        doc.serviceEndpoint = newServiceEndpoint;
        doc.didProof = newDidProof;
        doc.updatedAt = blockTimestampToString();

        emit DIDUpdated(did, msg.sender);
    }

    /**
     * @dev 删除DID
     * @param did 要删除的DID标识符
     */
    function deleteDid(string memory did) public {
        require(didExists[did], "DID does not exist");
        require(didDocuments[did].owner == msg.sender, "Only DID owner can delete");

        // 从所有者映射中移除
        removeFromOwnerDIDs(msg.sender, did);

        // 清理存储
        delete didDocuments[did];
        delete didExists[did];

        emit DIDDeleted(did, msg.sender);
    }

    /**
     * @dev 获取DID文档
     * @param did 要查询的DID标识符
     * @return 完整的DID文档
     */
    function getDocument(string memory did) public view returns (DIDDocument memory) {
        require(didExists[did], "DID does not exist");
        return didDocuments[did];
    }

    /**
     * @dev 获取主公钥
     * @param did 要查询的DID标识符
     * @return 主公钥字符串
     */
    function getMainPubKeyHex(string memory did) public view returns (string memory) {
        require(didExists[did], "DID does not exist");
        return didDocuments[did].mainPublicKey;
    }

    /**
     * @dev 检查DID状态
     * @param did 要检查的DID标识符
     * @return 是否存在
     */
    function getDidStatus(string memory did) public view returns (bool) {
        return didExists[did];
    }

    /**
     * @dev 获取用户的所有DID列表
     * @return DID标识符数组
     */
    function getDidList() public view returns (string[] memory) {
        return ownerDIDs[msg.sender];
    }

    // 辅助函数：从所有者映射中移除DID
    function removeFromOwnerDIDs(address owner, string memory did) private {
        string[] storage dids = ownerDIDs[owner];
        for (uint i = 0; i < dids.length; i++) {
            if (keccak256(bytes(dids[i])) == keccak256(bytes(did))) {
                if (i < dids.length - 1) {
                    dids[i] = dids[dids.length - 1];
                }
                dids.pop();
                break;
            }
        }
    }

    // 辅助函数：将区块时间戳转换为字符串
    function blockTimestampToString() private view returns (string memory) {
        return uintToString(block.timestamp);
    }

    // 辅助函数：uint转string
    function uintToString(uint value) private pure returns (string memory) {
        if (value == 0) return "0";

        uint temp = value;
        uint digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
