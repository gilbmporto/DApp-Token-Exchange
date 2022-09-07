const { expect } = require('chai');
const { ethers } = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe("Token", () => {
    let token;
    let accounts;
    let deployer;

    beforeEach(async () => {
        //Fetch the token from blockchain
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Gil Token', 'GIL', '1000000');
        accounts = await hre.ethers.getSigners();
        deployer = accounts[0];
    });

    describe('Deployment', () => {
        const name = 'Gil Token';
        const symbol = 'GIL';
        const decimals = '18';
        const totalSupply = tokens(1000000);

        it("has correct name", async () => {
            expect(await token.name()).to.equal(name);
        });
    
        it("has correct symbol", async () => {
            //check that symbol is correct
            expect(await token.symbol()).to.equal(symbol);
        });
    
        it("has correct decimals quantity", async () => {
            expect(await token.decimals()).to.equal(decimals);
        });
    
        it("has correct total Supply", async () => {
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it("assigns total supply to deployer", async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        });
    });

    //Tests go inside here...

})