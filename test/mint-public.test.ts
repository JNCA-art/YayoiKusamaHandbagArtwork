import { expect } from "chai";
import { setupTest } from "./fixture/setup-nothing";

describe("YKHA public mint", function () {
  let tx;

  it("Negative: not in public sale", async function() {
    const { contract, users, publicPrice } = await setupTest();
    await expect(contract.connect(users[2]).mint(1, { value: publicPrice }))
    .revertedWith("not in public sale");
  });

  it("Negative: not the owner to flip", async function() {
    const { contract, users } = await setupTest();
    await expect(contract.connect(users[3]).flipPublicSale())
    .revertedWith("Ownable: caller is not the owner");
  });

  it("Negative: exceed batch size", async function() {
    const { contract, users, publicPrice } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 5 + 1;
    await expect(contract.connect(users[4]).mint(amount, { value: publicPrice.mul(amount)}))
    .revertedWith("ERC721A: quantity to mint too high");
  });

  it("Negative: payment too low", async function() {
    const { contract, users, publicPrice } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 4;
    await expect(contract.connect(users[6]).mint(amount, { value: publicPrice.mul(amount-1) }))
    .revertedWith("payment error");
  });

  it("Negative: payment too high", async function() {
    const { contract, users, publicPrice } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 2;
    await expect(contract.connect(users[7]).mint(amount, { value: publicPrice.mul(amount+2) }))
    .revertedWith("payment error");
  });

  it("Positive: mint and claim fund", async function () {
    const { contract, receiver, users, provider, publicPrice } = await setupTest();
    if (!provider) return;
    const balanceBefore = await provider.getBalance(receiver);
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 2;
    const fund = publicPrice.mul(amount);
    tx = await contract.connect(users[8]).mint(amount, { value: fund });
    await tx.wait();
    const currentSaleInfo = await contract.saleInfo();
    expect(currentSaleInfo.whitelistSupply).equal(0);
    expect(await contract.totalSupply()).equal(amount);
    tx = await contract.connect(users[10]).withdraw();
    await tx.wait();
    expect(balanceBefore.add(fund)).equal(await provider.getBalance(receiver));
  });
});
