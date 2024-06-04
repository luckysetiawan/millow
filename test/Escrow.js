const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    it('saves the addresses', async () => {
        // Setup accounts
        [ buyer, seller, inspector, lender ] = await ethers.getSigners();

        // Deploy Real Estate
        const RealEstateFactory = await ethers.getContractFactory('RealEstate');
        realEstate = await RealEstateFactory.deploy();
        // console.log(await realEstate.getAddress());

        // Mint
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        const EscrowFactory = await ethers.getContractFactory('Escrow');
        escrow = await EscrowFactory.deploy(
            realEstate.getAddress(),
            seller.getAddress(),
            inspector.getAddress(),
            lender.getAddress()
        );

        expect(await escrow.nftAddress()).to.be.equal(await realEstate.getAddress());
        expect(await escrow.seller()).to.be.equal(await seller.getAddress());
        expect(await escrow.inspector()).to.be.equal(await inspector.getAddress());
        expect(await escrow.lender()).to.be.equal(await lender.getAddress());
    })
})
