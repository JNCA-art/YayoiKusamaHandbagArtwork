import { deployments } from "hardhat";
import { YayoiKusamaHandbagArtwork__factory } from "../../typechain";
import DEPLOY_PARAM from "../../deploy-param.json";

export const setupTest = deployments.createFixture(
    async ({deployments, ethers}, options) => {
      await deployments.fixture();
      const artifact = await deployments.get("YayoiKusamaHandbagArtwork");
      const [owner, ...users] = await ethers.getSigners();
      const contract = YayoiKusamaHandbagArtwork__factory.connect(artifact.address, owner);
      const receiver = DEPLOY_PARAM.receiver;
      const provider = owner.provider;
      const { publicPrice, whitelistPrice } = await contract.saleInfo();
      return {
        owner,
        users,
        contract,
        receiver,
        provider,
        publicPrice,
        whitelistPrice,
      }
    }
  )