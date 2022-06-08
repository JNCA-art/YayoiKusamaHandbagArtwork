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

    uint8 public constant BATCH_SIZE = 5;

    string public contractURI;

    string private _tokenBaseURI;

    address payable private _fundReceiver;

    mapping(address => uint8) public whitelistAlreadyMinted;

    struct SaleInfo {
        bool isPublic;
        uint120 price;
        uint64 stageId;
    }
    SaleInfo public saleInfo;

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
    ) ERC721A("MastersDAO", "M-DAO") EIP712("YKHA", "1") {
        contractURI = initContractURI;
        _tokenBaseURI = initBaseURI;
        _fundReceiver = receiver;
        // sale info
        saleInfo.isPublic = false;
        saleInfo.price = initPrice;
        saleInfo.stageId = 0;
    }

    /// @notice Mint certain amount of tokens
    function mint(uint8 amount) external payable {
        require(saleInfo.isPublic, "not in public sale");
        require(totalSupply() + amount <= MAX_SUPPLY, "exceed max supply");
        require(amount * saleInfo.price == msg.value, "payment error");
        require(amount <= BATCH_SIZE, "exceed batch size");
        _safeMint(_msgSenderERC721A(), amount);
        Address.sendValue(_fundReceiver, msg.value);
    }

    /// @notice Mint for whitelist (EIP712)
    function whitelistMint(bytes calldata signature, uint8 amount)
        external
        payable
    {
        address msgSender = _msgSenderERC721A();
        require(!saleInfo.isPublic, "not in whitelist sale");
        _verify(signature);
        require(totalSupply() + amount <= MAX_SUPPLY, "exceed max supply");
        require(
            whitelistAlreadyMinted[msgSender] + amount <= 2 * BATCH_SIZE,
            "exceed whitelist quota"
        );
        whitelistAlreadyMinted[msgSender] += amount;
        require(amount * saleInfo.price == msg.value, "payment error");
        _safeMint(msgSender, amount);
        Address.sendValue(_fundReceiver, msg.value);
    }

    /// @dev Change base URI to reveal NFT
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _tokenBaseURI = newBaseURI;
    }

    /// @dev Set new price
    function setPrice(uint120 newPrice) external onlyOwner {
        saleInfo.price = newPrice;
    }

    /// @dev Flip public sale state
    function flipPublicSale() external onlyOwner {
        saleInfo.isPublic = !saleInfo.isPublic;
    }

    /// @dev Override ERC721._baseURI
    function _baseURI() internal view override returns (string memory) {
        return _tokenBaseURI;
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

    /// @dev Override _startTokenId to start from 1
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @dev Verify voucher
    function _verify(bytes calldata signature) private view {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("NFTVoucher(address redeemer)"),
                    msg.sender
                )
            )
        );
        require(
            owner() == ECDSA.recover(digest, signature),
            "invalid or unauthorized"
        );
    }
}
