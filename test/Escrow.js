const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    it('saves the addresses', async () => {
        const RealEstateFactory = await ethers.getContractFactory('RealEstate');
        const realEstate = await RealEstateFactory.deploy();

        console.log(await realEstate.getAddress());
    })
})
