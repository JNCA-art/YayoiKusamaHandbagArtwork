import { expect } from "chai";
import { deployments } from "hardhat";
import { YayoiKusamaHandbagArtwork__factory } from "../typechain";
import DEPLOY_PARAM from "../deploy-param.json";

const setupTest = deployments.createFixture(
  async ({deployments, ethers}, options) => {
    await deployments.fixture();
    const artifact = await deployments.get("YayoiKusamaHandbagArtwork");
    const [owner, ...users] = await ethers.getSigners();
    const contract = YayoiKusamaHandbagArtwork__factory.connect(artifact.address, owner);
    const receiver = DEPLOY_PARAM.receiver;
    const provider = owner.provider;
    const mintPrice = ethers.BigNumber.from(DEPLOY_PARAM.publicPrice);
    return {
      owner,
      users,
      contract,
      receiver,
      provider,
      mintPrice,
    }
  }
)

describe("YKHA", function () {
  let tx;
  it("Should receive fund", async function () {
    const { contract, receiver, users, provider, mintPrice } = await setupTest();
    if (!provider) return;
    const balanceBefore = await provider.getBalance(receiver);
    const amount = 2;
    const fund = mintPrice.mul(amount);
    tx = await contract.mint(amount, { value: fund });
    await tx.wait();
    tx = await contract.connect(users[0]).withdraw();
    await tx.wait();
    expect(balanceBefore.add(fund)).to.equal(await provider.getBalance(receiver));
  });
});
