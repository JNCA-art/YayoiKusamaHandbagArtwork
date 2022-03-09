import { expect } from "chai";
import { ethers } from "hardhat";
import { setupTest } from "./fixture/setup-nothing";

const newPublicPrice = ethers.utils.parseEther("0.9");
const newWhitelistPrice = ethers.utils.parseEther("0.6");
const newSaleInfo = {
    isPublic: true,
    publicPrice: newPublicPrice,
    isWhitelist: true,
    whitelistPrice: newWhitelistPrice,
    whitelistSupply: 777,    
};

describe("YKHA sale info", function () {
  let tx;

  it("Negative: not the owner to update sale info", async function() {
    const { contract, users } = await setupTest();
    await expect(contract.connect(users[2]).updateSaleInfo(newSaleInfo))
    .revertedWith("Ownable: caller is not the owner");
  });

  it("Positive: change sale info", async function() {
    const { contract } = await setupTest();
    tx = await contract.updateSaleInfo(newSaleInfo);
    await tx.wait();
    const currentSaleInfo = await contract.saleInfo();
    expect(currentSaleInfo.isPublic).equal(newSaleInfo.isPublic);
    expect(currentSaleInfo.publicPrice).equal(newSaleInfo.publicPrice);
    expect(currentSaleInfo.isWhitelist).equal(newSaleInfo.isWhitelist);
    expect(currentSaleInfo.whitelistPrice).equal(newSaleInfo.whitelistPrice);
    expect(currentSaleInfo.whitelistSupply).equal(0);
  });
});