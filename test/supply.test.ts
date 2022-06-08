import { expect } from "chai";
import { setupTest } from "./fixture/setup-contracts";
import LOCAL_WHITELIST from "../whitelist/whitelist_1337.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

function getSignature(user: SignerWithAddress): any {
  const userAddress = ethers.utils.getAddress(user.address);
  // @ts-ignore
  return LOCAL_WHITELIST[userAddress];
}

describe("M-DAO supply", function () {
  let tx;

  it("Negative: public exceed max supply", async function() {
    const { contract, users, price } = await setupTest(9998);
    tx = await contract.flipPublicSale();
    const user = users[11];
    await tx.wait();
    await expect(contract.connect(user).mint(3, { value: price.mul(3) }))
    .revertedWith("exceed max supply");
  });

  it("Negative: whitelist exceed max supply", async function() {
    const { contract, users, price } = await setupTest(9997);
    const user = users[7];
    const signature = getSignature(user);
    await expect(contract.connect(user).whitelistMint(signature, 5, { value: price.mul(5) }))
    .revertedWith("exceed max supply");    
  });
});