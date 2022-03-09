import { expect } from "chai";
import { setupTest } from "./fixture/setup-nothing";
import LOCAL_WHITELIST from "../whitelist/whitelist_1337.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

function getSignature(user: SignerWithAddress): any {
    // @ts-ignore
    return LOCAL_WHITELIST[user.address.toLowerCase()];
}

describe("YKHA whitelist mint", function () {
    let tx;
  
    it("Negative: not in whitelist mint stage", async function() {
      const { contract, users, whitelistPrice } = await setupTest();
      const user = users[2];
      const signature = getSignature(user);
      await expect(contract.connect(user).whitelistMint(signature, 1, { value: whitelistPrice }))
      .revertedWith("not in whitelist sale");
    });

    it("Negative: exceed whitelist supply", async function() {
      const { contract, users, whitelistPrice } = await setupTest();
    });

    it("Positive: whitelist mint 1 token", async function() {
      const { contract, users, publicPrice } = await setupTest();
      const user = users[3];
      const signature = getSignature(user);
      tx = await contract.flipWhitelistSale();
      await tx.wait();
      tx = await contract.connect(user).whitelistMint(signature, 1, { value: publicPrice });
      await tx.wait();
    });
});