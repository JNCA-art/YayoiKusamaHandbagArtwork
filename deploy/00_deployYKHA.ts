import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import DEPLOY_PARAM from "../deploy-param.json";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, execute } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const chainId = await hre.getChainId();
  const isMainnet = chainId === "1";

  if (!isMainnet) {
    DEPLOY_PARAM.publicPrice = ethers.utils.parseEther("0.012").toString();
    DEPLOY_PARAM.whitelsitPrice = ethers.utils.parseEther("0.01").toString();
  }
  else {
    if (!ethers.utils.parseEther("1.2").eq(DEPLOY_PARAM.publicPrice)) return;
    if (!ethers.utils.parseEther("1").eq(DEPLOY_PARAM.whitelsitPrice)) return;
  }


  // deploy
  const deployResult = await deploy("YayoiKusamaHandbagArtwork", {
    from: deployer,
    args:[
      DEPLOY_PARAM.initCoutractURI,
      DEPLOY_PARAM.initBaseURI,
      DEPLOY_PARAM.receiver,
      DEPLOY_PARAM.publicPrice,
      DEPLOY_PARAM.whitelsitPrice,
    ],
    log: true,
  });
};
export default func;
func.tags = ["YKHA"];
