import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { ethers, getNamedAccounts, getChainId } from "hardhat";
import { ethers as eth } from "ethers";
import { writeFileSync, readFileSync } from "fs";

type NFTVoucher = {
  redeemer: string;
};

const VOUCHER_TYPE: Record<string, TypedDataField[]> = {
  NFTVoucher: [{ name: "redeemer", type: "address" }],
};

type AddressMap = { [chainId: string]: string };
export const CONTRACT_ADDRESS: AddressMap = {
  "1": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "4": "0xDa4df28B9961Bf5AFC72c6ddd8e7A6818077A66f",
  "1337": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};

async function main() {
  const { deployer } = await getNamedAccounts();
  console.log("Signer address:", deployer);
  const signer = await ethers.getSigner(deployer);
  // domain data
  const chainId = await getChainId();
  const contractAddr = CONTRACT_ADDRESS[chainId];
  if (!contractAddr) {
    console.log("[ERROR] contract address not set");
    return;
  }
  const domainData: TypedDataDomain = {
    name: "YKHA",
    version: "1",
    chainId: chainId,
    verifyingContract: contractAddr,
  };
  const whitelist = readFileSync(`./whitelist/whitelist_${chainId}.txt`)
    .toString()
    .split("\n");
  const sigMap = new Map<string, string>();
  await Promise.all(
    whitelist.map(async (addr) => {
      const redeemer = eth.utils.getAddress(addr);
      const voucher: NFTVoucher = { redeemer };
      const signature: string = await signer._signTypedData(
        domainData,
        VOUCHER_TYPE,
        voucher
      );
      sigMap.set(redeemer.toLocaleLowerCase(), signature);
      return signature;
    })
  );
  console.log("voucher count:", sigMap.size);
  writeFileSync(
    `./whitelist/whitelist_${chainId}.json`,
    JSON.stringify(Object.fromEntries(sigMap), null, 4)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });