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
  
    it("Negative: not in whitelist sale", async function() {
      const { contract, users, whitelistPrice } = await setupTest();
      const user = users[2];
      const signature = getSignature(user);
      await expect(contract.connect(user).whitelistMint(signature, 1, { value: whitelistPrice }))
      .revertedWith("not in whitelist sale");
    });

    it("Negative: not the owner to flip", async function() {
      const { contract, users } = await setupTest();
      await expect(contract.connect(users[3]).flipWhitelistSale())
      .revertedWith("Ownable: caller is not the owner");
    });

    it("Negative: invalid signature", async function() {
      const { contract, users, whitelistPrice } = await setupTest();
      const user = users[5];
      const signature = getSignature(users[6]);
      await expect(contract.connect(user).whitelistMint(signature, 1, { value: whitelistPrice }))
      .revertedWith("invalid or unauthorized");
    });

    it("Negative: exceed whitelist quota", async function() {
      const { contract, users, whitelistPrice } = await setupTest();
      tx = await contract.flipWhitelistSale();
      await tx.wait();
      const user = users[8];
      const signature = getSignature(user);
      tx = await contract.connect(user).whitelistMint(signature, 3, { value: whitelistPrice.mul(3) });
      await tx.wait();
      await expect(contract.connect(user).whitelistMint(signature, 3, { value: whitelistPrice.mul(3) }))
      .revertedWith("exceed whitelist quota");
    });

    it("Negative: payment too high", async function() {
      const { contract, users, whitelistPrice, publicPrice } = await setupTest();
      tx = await contract.flipWhitelistSale();
      await tx.wait();
      const user = users[9];
      const signature = getSignature(user);
      await expect(contract.connect(user).whitelistMint(signature, 1, { value:  publicPrice }))
      .revertedWith("payment error");
    });

    it("Negative: payment too low", async function() {
      const { contract, users, whitelistPrice } = await setupTest();
      tx = await contract.flipWhitelistSale();
      await tx.wait();
      const user = users[9];
      const signature = getSignature(user);
      const amount = 3;
      await expect(contract.connect(user).whitelistMint(signature, amount, { value:  whitelistPrice.mul(amount-1) }))
      .revertedWith("payment error");
    });

    it("Positive: whitelist mint token and claim fund", async function() {
      const { contract, receiver, users, provider, whitelistPrice } = await setupTest();
      if (!provider) return;
      const balanceBefore = await provider.getBalance(receiver);
      tx = await contract.flipWhitelistSale();
      await tx.wait();
      const amount = 3;
      const fund = whitelistPrice.mul(amount);
      const user = users[8];
      const signature = getSignature(user);
      tx = await contract.connect(users[8]).whitelistMint(signature, amount, { value: fund });
      await tx.wait();
      const currentSaleInfo = await contract.saleInfo();
      expect(currentSaleInfo.whitelistSupply).equal(amount);
      expect(await contract.totalSupply()).equal(amount);
      tx = await contract.connect(users[10]).withdraw();
      await tx.wait();
      expect(balanceBefore.add(fund)).equal(await provider.getBalance(receiver));
    });
});