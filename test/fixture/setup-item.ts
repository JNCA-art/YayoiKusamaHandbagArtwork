import { deployments } from "hardhat";
import { MastersDAO__factory, ItemNFT__factory } from "../../typechain";

export const setupTest = deployments.createFixture(
    async ({deployments, ethers}, additionalSupply: number | undefined) => {
      await deployments.fixture();
      const daoAddress = (await deployments.get("MastersDAO")).address;
      const itemAddress = (await deployments.get("ItemNFT")).address;
      const [owner, ...users] = await ethers.getSigners();
      const contract = MastersDAO__factory.connect(daoAddress, owner);
      const itemNFT = ItemNFT__factory.connect(itemAddress, owner);
      const itemPrice = await itemNFT.PRICE();
      const provider = owner.provider;
      const tx = additionalSupply? await contract.setItemSupply(itemAddress, additionalSupply): undefined;
      await tx?.wait();
      return {
        owner,
        users,
        contract,
        itemNFT,
        itemPrice,
        provider,
      };
    }
  )