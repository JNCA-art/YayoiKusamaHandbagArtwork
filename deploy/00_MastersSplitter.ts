import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const [ dev0, dev1, dev2 ] = await ethers.getSigners();
  const chainId = await hre.getChainId();
  const isMainnet = chainId === "1";

  const payees = isMainnet?
  [
    dev0.address,
    dev1.address,
    dev2.address, // TODO
  ]:
  [
    dev0.address,
    dev1.address,
    dev2.address,
  ];

  const shares = isMainnet?
  [
    7,
    2,
    1, // TODO
  ]:
  [
    7,
    2,
    1,
  ];

  // deploy
  await deploy("MastersSplitter", {
    from: deployer,
    args:[
      payees,
      shares,
    ],
    log: true,
  });
};
export default func;
func.tags = ["MastersSplitter"];
