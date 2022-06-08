import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, get } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const daoAddress = (await get("MastersDAO")).address;

  // deploy
  await deploy("ItemNFT", {
    from: deployer,
    args:[
        daoAddress
    ],
    log: true,
  });
};
export default func;
func.tags = ["ItemNFT"];
