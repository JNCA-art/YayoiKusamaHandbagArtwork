import { expect } from "chai";
import { setupTest } from "./fixture/setup-nothing";

const newBaseURI = "ipfs://new-base-uri/";

describe("YKHA token URI", function () {
  let tx;

  it("Negative: not the owner to set base URI", async function() {
    const { contract, users } = await setupTest();
    await expect(contract.connect(users[2]).setBaseURI(newBaseURI))
    .revertedWith("Ownable: caller is not the owner");
  });

  it("Positive: right contract URI", async function() {
    const { contract, contractURI } = await setupTest();
    expect(await contract.contractURI()).equal(contractURI);
  });

  it("Positive: change token URI", async function() {
    const { contract, publicPrice, baseURI } = await setupTest();
    tx = await contract.flipPublicSale();
    await tx.wait();
    tx = await contract.mint(1, { value: publicPrice });
    await tx.wait();
    expect(await contract.tokenURI(0)).equal(baseURI + 0);
    tx = await contract.setBaseURI(newBaseURI);
    await tx.wait();
    expect(await contract.tokenURI(0)).equal(newBaseURI + 0);
  });
});