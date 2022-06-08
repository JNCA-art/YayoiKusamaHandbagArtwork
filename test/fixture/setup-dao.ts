import { deployments } from "hardhat";
import { MastersDAO__factory, MastersSplitter__factory } from "../../typechain";
import { contractURI, baseURI } from "../../misc/constants";

export const setupTest = deployments.createFixture(
    async ({deployments, ethers}, initSupply: number | undefined) => {
      await deployments.fixture();
      const daoAddress = (await deployments.get("MastersDAO")).address;
      const splitterAddress = (await deployments.get("MastersSplitter")).address;
      const [owner, ...users] = await ethers.getSigners();
      const contract = MastersDAO__factory.connect(daoAddress, owner);
      const splitter = MastersSplitter__factory.connect(splitterAddress, owner);
      const provider = owner.provider;
      const { price } = await contract.saleInfo();
      const tx = initSupply? await contract.airdrop(owner.address, initSupply): undefined;
      await tx?.wait();
      return {
        owner,
        users,
        contract,
        splitter,
        provider,
        price,
        baseURI,
        contractURI,
      };
    }
  )