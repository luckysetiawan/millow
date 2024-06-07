// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
}

async function main() {
  // Setup accounts
  [ buyer, seller, inspector, lender ] = await ethers.getSigners();

  // Deploy Real Estate
  const RealEstateFactory = await ethers.getContractFactory('RealEstate');
  const realEstate = await RealEstateFactory.deploy();
  await realEstate.waitForDeployment();

  console.log(`Deployed Real Estate Contract at: ${await realEstate.getAddress()}`);
  console.log(`Minting 3 properties...\n`);

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`);
    await transaction.wait();
  }

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory('Escrow');
  const escrow = await Escrow.deploy(
    realEstate.getAddress(),
    seller.getAddress(),
    inspector.getAddress(),
    lender.getAddress()
  );
  await escrow.waitForDeployment();

  console.log(`Deployed Escrow Contract at: ${await escrow.getAddress()}`);
  console.log(`Listing 3 properties...\n`);

  for (let i = 0; i < 3; i++) {
    // Approve properties...
    let transaction = await realEstate.connect(seller).approve(escrow.getAddress(), i + 1);
    await transaction.wait();
  }

   // Listing properties...
   transaction = await escrow.connect(seller).list(1, tokens(20), tokens(10), buyer.getAddress());
   await transaction.wait();
 
   transaction = await escrow.connect(seller).list(2, tokens(15), tokens(5), buyer.getAddress());
   await transaction.wait();
 
   transaction = await escrow.connect(seller).list(3, tokens(10), tokens(5), buyer.getAddress());
   await transaction.wait();
 
   console.log(`Finished.`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
