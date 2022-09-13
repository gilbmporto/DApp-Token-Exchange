const { waitFor } = require("@testing-library/react");
const { ethers } = require("hardhat");
const hre = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
};

async function main() {
    console.log(`Preparing deployment...\n`);

    // Fetch contract to deploy
    const Token = await hre.ethers.getContractFactory("Token");
    const Exchange = await hre.ethers.getContractFactory("Exchange");

    const accounts = await ethers.getSigners();

    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

    //Deploy contract
    const gilToken = await Token.deploy('Gil Token', 'GIL', '1000000');
    await gilToken.deployed();
    console.log(`GIL deployed to: ${gilToken.address}`);

    const johnnyBravoToken  = await Token.deploy('Johnny Bravo Token', 'JBT', '1000000');
    await johnnyBravoToken.deployed();
    console.log(`JBT deployed to: ${johnnyBravoToken.address}`);

    const mDAI = await Token.deploy('mDAI Token', 'mDAI', '1000000');
    await mDAI.deployed();
    console.log(`mDAI deployed to: ${mDAI.address}`);

    const exchange = await Exchange.deploy(accounts[1].address, 10);
    await exchange.deployed();
    console.log(`Exchange deployed to: ${exchange.address}\n`);

};

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
