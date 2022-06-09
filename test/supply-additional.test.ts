import { expect } from "chai";
import { setupTest } from "./fixture/setup-item";
import { ethers } from "hardhat";

describe("M-DAO supply", function () {
  let tx;

  it("Postive: exceed additional supply", async function() {
    const { contract, itemNFT, itemPrice, users } = await setupTest(5);
    const user1 = users[11];
    tx = await itemNFT.connect(user1).mint(7, { value: itemPrice.mul(7) });
    await tx.wait();
    expect(await itemNFT.balanceOf(user1.address)).equal(7);
    expect(await itemNFT.totalSupply()).equal(7);
    expect(await contract.balanceOf(user1.address)).equal(5);
    expect(await contract.totalSupply()).equal(5);

    const user2 = users[4];
    tx = await itemNFT.connect(user2).mint(3, { value: itemPrice.mul(3) });
    await tx.wait();
    expect(await itemNFT.balanceOf(user2.address)).equal(3);
    expect(await itemNFT.totalSupply()).equal(10);
    expect(await contract.balanceOf(user2.address)).equal(0);
    expect(await contract.totalSupply()).equal(5);
  });
  
  it("Positive: additional mint", async function() {
    const { contract, itemNFT, itemPrice, users } = await setupTest(5);
    const user = users[3];
    const amount = 3;
    tx = await itemNFT.connect(user).mint(amount, { value: itemPrice.mul(3) });
    await tx.wait();
    expect(await itemNFT.balanceOf(user.address)).equal(amount);
    expect(await itemNFT.totalSupply()).equal(amount);
    expect(await contract.balanceOf(user.address)).equal(amount);
    expect(await contract.totalSupply()).equal(amount);
  });


});