const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether');
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async () => {
        // Setup accounts
        [ buyer, seller, inspector, lender ] = await ethers.getSigners();

        // Deploy Real Estate
        const RealEstateFactory = await ethers.getContractFactory('RealEstate');
        realEstate = await RealEstateFactory.deploy();
        // console.log(await realEstate.getAddress());

        // Mint
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
        await transaction.wait();

        const EscrowFactory = await ethers.getContractFactory('Escrow');
        escrow = await EscrowFactory.deploy(
            realEstate.getAddress(),
            seller.getAddress(),
            inspector.getAddress(),
            lender.getAddress()
        );

        // Approve property
        transaction = await realEstate.connect(seller).approve(await escrow.getAddress(), 1);
        await transaction.wait();

        // List property
        transaction = await escrow.connect(seller).list(1, tokens(10), tokens(5), buyer.getAddress());
        await transaction.wait();
    })

    describe('Deployment', () => {
        it('Returns NFT address', async () => {
            expect(await escrow.nftAddress()).to.be.equal(await realEstate.getAddress());
        })
    
        it('Returns seller', async () => {
            expect(await escrow.seller()).to.be.equal(await seller.getAddress());
        })
    
        it('Returns inspector', async () => {
            expect(await escrow.inspector()).to.be.equal(await inspector.getAddress());
        })
    
        it('Returns lender', async () => {
            expect(await escrow.lender()).to.be.equal(await lender.getAddress());
        })
    })

    describe('Listing', () => {
        it('Updates as listed', async () => {
            expect(await escrow.isListed(1)).to.be.equal(true);
        })

        it('Updates ownership', async () => {
            expect(await escrow.getAddress()).to.be.equal(await realEstate.ownerOf(1));
        })
        
        it('Returns buyer', async () => {
            expect(await escrow.buyer(1)).to.be.equal(await buyer.getAddress());
        })
        
        it('Returns purchase price', async () => {
            expect(await escrow.purchasePrice(1)).to.be.equal(tokens(10));
        })
        
        it('Returns escrow amount', async () => {
            expect(await escrow.escrowAmount(1)).to.be.equal(tokens(5));
        })
    })

    describe('Deposits', () => {
        it('Updates contract balance', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)});
            await transaction.wait();
            expect(await escrow.getBalance()).to.be.equal(tokens(5));
        })
    })

    describe('Inspection', () => {
        it('Updates inspection status', async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true);
            await transaction.wait();
            expect(await escrow.inspectionPassed(1)).to.be.equal(true);
        })
    })

    describe('Approval', () => {
        it('Updates approval status', async () => {
            let transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();


            expect(await escrow.approval(1, buyer.getAddress())).to.be.equal(true);
            expect(await escrow.approval(1, seller.getAddress())).to.be.equal(true);
            expect(await escrow.approval(1, buyer.getAddress())).to.be.equal(true);
        })
    })
    
})
