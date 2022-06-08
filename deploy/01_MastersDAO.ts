import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { contractURI, baseURI } from "../misc/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, get } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const splitterAddress = (await get("MastersSplitter")).address;

  const fundReceiver = splitterAddress;
  const price = ethers.utils.parseEther("0.1");

  // deploy
  await deploy("MastersDAO", {
    from: deployer,
    args:[
      contractURI,
      baseURI,
      fundReceiver,
      price,
    ],
    log: true,
  });
};
export default func;
func.tags = ["MastersDAO"];
