//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";
import "erc721a/contracts/ERC721A.sol";
import "./MastersDAO.sol";

contract ItemNFT is ERC721A {
    MastersDAO private _masterContract;

    constructor(MastersDAO masterContract) ERC721A("TestItem", "TI") {
        _masterContract = masterContract;
    }

    function mint(uint8 amount) external {
        address msgSender = _msgSenderERC721A();
        _safeMint(msgSender, amount);
        _masterContract.additionalMint(amount);
    }
}
