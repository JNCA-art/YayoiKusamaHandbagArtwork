import { expect } from "chai";
import { setupTest } from "./fixture/setup-dao";
import LOCAL_WHITELIST from "../whitelist/whitelist_1337.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

function getSignature(user: SignerWithAddress): any {
  const userAddress = user.address.toLowerCase();
  // @ts-ignore
  return LOCAL_WHITELIST[userAddress];
}

describe("M-DAO whitelist mint", function () {
  let tx;
  
  it("Negative: not in whitelist sale", async function() {
    const { contract, users, price } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    const user = users[2];
    const signature = getSignature(user);
    await expect(contract.connect(user).whitelistMint(signature, 1, { value: price }))
    .revertedWith("not in whitelist sale");
  });

  it("Negative: invalid signature", async function() {
    const { contract, users, price } = await setupTest();
    const user = users[5];
    const signature = getSignature(users[6]);
    await expect(contract.connect(user).whitelistMint(signature, 1, { value: price }))
    .revertedWith("invalid or unauthorized");
  });

  it("Negative: exceed whitelist quota", async function() {
    const { contract, users, price } = await setupTest();
    const user = users[8];
    const signature = getSignature(user);
    tx = await contract.connect(user).whitelistMint(signature, 5, { value: price.mul(5) });
    await tx.wait();
    tx = await contract.connect(user).whitelistMint(signature, 3, { value: price.mul(3) });
    await tx.wait();
    await expect(contract.connect(user).whitelistMint(signature, 3, { value: price.mul(3) }))
    .revertedWith("exceed whitelist quota");
  });

  it("Negative: payment too high", async function() {
    const { contract, users, price } = await setupTest();
    const user = users[9];
    const signature = getSignature(user);
    await expect(contract.connect(user).whitelistMint(signature, 1, { value:  price.mul(2) }))
    .revertedWith("payment error");
  });

  it("Negative: payment too low", async function() {
    const { contract, users, price } = await setupTest();
    const user = users[9];
    const signature = getSignature(user);
    const amount = 3;
    await expect(contract.connect(user).whitelistMint(signature, amount, { value:  price.mul(amount-1) }))
    .revertedWith("payment error");
  });

  it("Positive: whitelist mint token and claim fund", async function() {
    const { contract, splitter, users, provider, price } = await setupTest();
    if (!provider) return;
    const balanceBefore = await provider.getBalance(splitter.address);
    const amount = 3;
    const fund = price.mul(amount);
    const user = users[8];
    const signature = getSignature(user);
    tx = await contract.connect(users[8]).whitelistMint(signature, amount, { value: fund });
    await tx.wait();
    const currentSaleInfo = await contract.saleInfo();
    expect(await contract.totalSupply()).equal(amount);
    expect(balanceBefore.add(fund)).equal(await provider.getBalance(splitter.address));
  });
});