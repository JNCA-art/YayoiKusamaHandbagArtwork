//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "erc721a/contracts/ERC721A.sol";

/**
 @title Masters DAO
 @notice DAO for art and antique
 @author BaaSid
 */
contract MastersDAO is ERC721A, EIP712, Ownable, Pausable {
    uint16 public constant MAX_SUPPLY = 10000;

    uint8 private constant MAX_MINTED_PER_ADDRESS = 5;

    string public contractURI;

    string private __baseURI;

    address payable private _fundReceiver;

    mapping(address => uint8) public whitelistAlreadyMinted;

    mapping(address => uint256) public itemRemains;

    struct SaleInfo {
        bool isPublic;
        uint240 price;
    }
    SaleInfo public saleInfo;

    struct SnapshotInfo {
        uint64 stageId;
        uint64 stageSupply;
        uint128 stageBalance;
    }
    SnapshotInfo public snapshotInfo;

    // voucher for user to redeem
    struct NFTVoucher {
        address redeemer; // specify user to redeem this voucher
    }

    /// @dev Setup contractURI, initial base URI, ERC721
    constructor(
        string memory initContractURI,
        string memory initBaseURI,
        address payable receiver,
        uint120 initPrice
    ) ERC721A("MastersDAO", "M-DAO") EIP712("M-DAO", "1") {
        contractURI = initContractURI;
        __baseURI = initBaseURI;
        _fundReceiver = receiver;
        // sale info
        saleInfo.isPublic = false;
        saleInfo.price = initPrice;

        snapshotInfo.stageId = MAX_MINTED_PER_ADDRESS;
    }

    /// @notice Mint certain amount of tokens
    function mint(uint8 amount) external payable {
        SaleInfo memory sInfo = saleInfo;
        address user = _msgSenderERC721A();
        require(sInfo.isPublic, "not in public sale");
        _checkMintCondition(user, amount, sInfo.price);
        _safeMint(_msgSenderERC721A(), amount);
    }

    /// @notice Mint for whitelist (EIP712)
    function whitelistMint(bytes calldata signature, uint8 amount)
        external
        payable
    {
        SaleInfo memory sInfo = saleInfo;
        address user = _msgSenderERC721A();
        require(!saleInfo.isPublic, "not in whitelist sale");
        _verify(signature);
        _checkMintCondition(user, amount, sInfo.price);
        _safeMint(user, amount);
    }

    /// @dev Additinally minted by other item contracts
    function additionalMint(address to, uint8 amount) external {
        address itemAddr = _msgSenderERC721A();
        uint256 remain = itemRemains[itemAddr];
        if (remain == 0) return;
        unchecked {
            if (amount >= remain) {
                _safeMint(to, remain);
                itemRemains[itemAddr] -= remain;
            } else {
                _safeMint(to, amount);
                itemRemains[itemAddr] -= amount;
            }
        }
    }

    /// @dev Airdrop
    function airdrop(address to, uint16 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "exceed max supply");
        _safeMint(to, amount);
    }

    /// @dev Take snapshot to record current balance to allow user to claim
    function takeSnapshot() external onlyOwner {
        snapshotInfo.stageBalance = uint128(address(this).balance);
        snapshotInfo.stageSupply = uint64(totalSupply());
        ++snapshotInfo.stageId;
        _pause();
    }

    /// @dev For users to claim reward
    function claim() external whenPaused {
        address payable user = payable(_msgSenderERC721A());
        SnapshotInfo memory ssInfo = snapshotInfo;
        uint64 userStageId = _getAux(user);
        require(ssInfo.stageId > userStageId, "already claimed in this stage");
        uint256 portion = balanceOf(user);
        Address.sendValue(
            user,
            (ssInfo.stageBalance * portion) / ssInfo.stageSupply
        );
        _setAux(user, ssInfo.stageId);
    }

    /// @dev Change base URI to reveal NFT
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        __baseURI = newBaseURI;
    }

    /// @dev Set new price
    function setPrice(uint120 newPrice) external onlyOwner {
        saleInfo.price = newPrice;
    }

    /// @dev Flip public sale state
    function flipPublicSale() external onlyOwner {
        saleInfo.isPublic = !saleInfo.isPublic;
    }

    /// @dev Set additional supply for certain item NFT contract
    function setItemSupply(
        address itemContractAddress,
        uint256 additionalSupply
    ) external onlyOwner {
        itemRemains[itemContractAddress] = additionalSupply;
    }

    /// @dev Override ERC721._baseURI
    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }

    /// @dev Override _beforeTokenTransfers to integrate Pausable
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal override whenNotPaused {
        ERC721A._beforeTokenTransfers(from, to, startTokenId, quantity);
    }

    /// @dev Verify voucher
    function _verify(bytes calldata signature) private view {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("NFTVoucher(address redeemer)"),
                    _msgSenderERC721A()
                )
            )
        );
        require(
            owner() == ECDSA.recover(digest, signature),
            "invalid or unauthorized"
        );
    }

    function _checkMintCondition(
        address user,
        uint8 amount,
        uint240 price
    ) internal {
        uint64 alreadyMinted = _getAux(user);
        require(totalSupply() + amount <= MAX_SUPPLY, "exceed max supply");
        uint64 afterMinted = alreadyMinted + amount;
        require(afterMinted <= MAX_MINTED_PER_ADDRESS, "exceed mint quota");
        require(amount * price == msg.value, "payment error");
        _setAux(user, afterMinted);
        Address.sendValue(_fundReceiver, msg.value);
    }
}
