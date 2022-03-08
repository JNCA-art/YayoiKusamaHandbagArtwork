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
      await expect(contract.connect(users[2]).whitelistMint(signature, 1, { value: whitelistPrice }))
      .revertedWith("not in whitelist sale");
    });
});