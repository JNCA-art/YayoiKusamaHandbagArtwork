import { expect } from "chai";
import { setupTest } from "./fixture/setup-supply";
import LOCAL_WHITELIST from "../whitelist/whitelist_1337.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

function getSignature(user: SignerWithAddress): any {
    // @ts-ignore
    return LOCAL_WHITELIST[user.address.toLowerCase()];
}

describe("YKHA supply", function () {
  let tx;

  it("Negative: public exceed max supply", async function() {
    const { contract, publicPrice } = await setupTest();
    await expect(contract.mint(1, { value: publicPrice }))
    .revertedWith("exceed max supply");
  });

  it("Negative: whitelist exceed max supply", async function() {
    const { contract, users, whitelistPrice } = await setupTest();
    const user = users[0];
    const signature = getSignature(user);
    await expect(contract.connect(user).whitelistMint(signature, 1, { value: whitelistPrice }))
    .revertedWith("exceed max supply");    
  });
});