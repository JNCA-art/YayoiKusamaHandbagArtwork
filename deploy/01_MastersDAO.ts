import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, get } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const splitterAddress = (await get("MastersSplitter")).address;

  const coutractURI = "ipfs://QmafcRHT1EwasBR7KteNTmctGGv4mkNAyVfWEwYAfT9XAg"; // TODO
  const baseURI = "ipfs://QmazDA25V9CyL55vuPJqqAH7dMe5TtAWjH2KdzXKHminH5/"; // TODO
  const fundReceiver = splitterAddress;
  const price = ethers.utils.parseEther("0.1");

  // deploy
  await deploy("MastersDAO", {
    from: deployer,
    args:[
      coutractURI,
      baseURI,
      fundReceiver,
      price,
    ],
    log: true,
  });
};
export default func;
func.tags = ["MastersDAO"];
