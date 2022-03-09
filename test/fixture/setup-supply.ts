import { deployments } from "hardhat";
import { YayoiKusamaHandbagArtwork__factory } from "../../typechain";

export const setupTest = deployments.createFixture(
    async ({deployments, ethers}, options) => {
      await deployments.fixture();
      const artifact = await deployments.get("YayoiKusamaHandbagArtwork");
      const [owner, ...users] = await ethers.getSigners();
      const contract = YayoiKusamaHandbagArtwork__factory.connect(artifact.address, owner);
      let tx;
      tx = await contract.flipPublicSale();
      await tx.wait();
      tx = await contract.flipWhitelistSale();
      await tx.wait();
      const { publicPrice, whitelistPrice } = await contract.saleInfo();
      const batchSize = 5;
      const turns = 7000/batchSize;
      const cost = publicPrice.mul(batchSize);
      for (let idx = 0; idx < turns; idx++) {
          await contract.mint(batchSize, { value: cost })
      }
      return {
        contract,
        users,
        publicPrice,
        whitelistPrice,
      }
    }
  )