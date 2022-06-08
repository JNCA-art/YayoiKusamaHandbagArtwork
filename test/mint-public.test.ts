import { expect } from "chai";
import { setupTest } from "./fixture/setup-contracts";

describe("M-DAO public mint", function () {
  let tx;

  it("Negative: not in public sale", async function() {
    const { contract, users, price } = await setupTest();
    await expect(contract.connect(users[2]).mint(1, { value: price }))
    .revertedWith("not in public sale");
  });

  it("Negative: not the owner to flip", async function() {
    const { contract, users } = await setupTest();
    await expect(contract.connect(users[3]).flipPublicSale())
    .revertedWith("Ownable: caller is not the owner");
  });

  it("Negative: exceed batch size", async function() {
    const { contract, users, price } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 5 + 1;
    await expect(contract.connect(users[4]).mint(amount, { value: price.mul(amount)}))
    .revertedWith("exceed batch size");
  });

  it("Negative: payment too low", async function() {
    const { contract, users, price } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 4;
    await expect(contract.connect(users[6]).mint(amount, { value: price.mul(amount-1) }))
    .revertedWith("payment error");
  });

  it("Negative: payment too high", async function() {
    const { contract, users, price } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 2;
    await expect(contract.connect(users[7]).mint(amount, { value: price.mul(amount+2) }))
    .revertedWith("payment error");
  });

  it("Positive: mint and claim fund", async function () {
    const { contract, splitter, users, provider, price } = await setupTest();
    if (!provider) return;
    const balanceBefore = await provider.getBalance(splitter.address);
    tx = await contract.flipPublicSale();
    await tx.wait();
    const amount = 2;
    const fund = price.mul(amount);
    tx = await contract.connect(users[8]).mint(amount, { value: fund });
    await tx.wait();
    expect(await contract.totalSupply()).equal(amount);
    await tx.wait();
    expect(balanceBefore.add(fund)).equal(await provider.getBalance(splitter.address));
  });
});
