const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe("Token", () => {
    let token;
    let accounts;
    let deployer;
    let receiver;

    beforeEach(async () => {
        //Fetch the token from blockchain
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Gil Token', 'GIL', '1000000');
        accounts = await hre.ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1]; 
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

    describe('Sending Token', () => {
        let amount;
        let transaction;
        let result;

        describe('Success', () => {

            beforeEach(async () => {
            //Transfers tokens
            amount = tokens(100);
            transaction = await token.connect(deployer).transfer(receiver.address, amount);
            result = transaction.wait();
            });

            it('transfers token balances', async () => {
                //Ensure that tokens were transfered (balance changed)
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
                expect(await token.balanceOf(receiver.address)).to.equal(amount);
            });

            it('emits a Transfer event', async () => {
                const event = await result;
                console.log(event.events[0]);
                
                const mainEvent = event.events[0];
                expect(mainEvent.event).to.equal('Transfer');

                const args = await mainEvent.args;
                expect(args.from).to.equal(deployer.address);
                expect(args.to).to.equal(receiver.address);
                expect(args.value).to.equal(amount);   
                
            });
        });

        describe("failure", () => {
            it('rejects insufficient balance', async () => {
                // Transfer more tokens than the deployer has
                const invalidAmount = tokens(100000000);
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;
            });

            it('rejects invalid recipient', async () => {
                // Transfer more tokens than the deployer has
                const amount = tokens(100);
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted;
            });
        });

    });

})