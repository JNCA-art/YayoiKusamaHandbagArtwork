//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "./MastersDAO.sol";

contract ItemNFT is ERC721A {
    MastersDAO private _masterContract;

    uint16 public constant MAX_SUPPLY = 2000;

    uint256 public constant PRICE = 0.05 ether;

    constructor(MastersDAO masterContract) ERC721A("TestItem", "TI") {
        _masterContract = masterContract;
    }

    function mint(uint8 amount) external payable {
        require(totalSupply() + amount <= MAX_SUPPLY, "exceed max supply");
        require(amount * PRICE == msg.value, "payment error");
        address msgSender = _msgSenderERC721A();
        _safeMint(msgSender, amount);
        _masterContract.additionalMint(msgSender, amount);
    }
}
