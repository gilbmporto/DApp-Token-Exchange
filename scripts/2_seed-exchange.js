const { ethers } = require("hardhat");
const config = require('../src/config.json');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
};

const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise((resolve, reject) => setTimeout(resolve, milliseconds));
};

async function main() {
    //Fetch accounts from wallet
    const accounts = await ethers.getSigners();
    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`);

    //Fetch network
    const { chainId } = await ethers.provider.getNetwork();
    console.log(`Using chainId: ${chainId}`);

    //Fetch deployed tokens
    const GilT = await ethers.getContractAt('Token', config[chainId].GilT.address);
    console.log(`Gil Token fetched: ${GilT.address}`);

    const JbtT = await ethers.getContractAt('Token', config[chainId].JbtT.address);
    console.log(`JBT Token fetched: ${JbtT.address}`);

    const mDAIT = await ethers.getContractAt('Token', config[chainId].mDAI.address);
    console.log(`mDAI Token fetched: ${mDAIT.address}\n`);

    //Fetch the deployed exchange
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
    console.log(`Exchange fetched: ${exchange.address}\n`);

    //Give tokens to account[1]
    const sender = accounts[0];
    const receiver = accounts[1];
    let amount = tokens(10000);

    //user1 transfers 10,000 JBT...
    let transaction;
    let result;
    transaction = await JbtT.connect(sender).transfer(receiver.address, amount);
    console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`);

    //Set up exchange users
    const user1 = accounts[0];
    const user2 = accounts[1];
    amount = tokens(10000);

    //user1 approves 10,000 GIL...
    transaction = await GilT.connect(user1).approve(exchange.address, amount);
    result = await transaction.wait();
    console.log(`Approved ${amount} GIL tokens from ${user1.address}`);

    //user1 deposits 10,000 GIL...
    transaction = await exchange.connect(user1).depositToken(GilT.address, amount);
    result = await transaction.wait();
    console.log(`Deposited ${amount} GILs from ${user1.address}\n`);

    //user2 approves 10,000 JBT...
    transaction = await JbtT.connect(user2).approve(exchange.address, amount);
    result = await transaction.wait();
    console.log(`Approved ${amount} JBT tokens from ${user2.address}`);

    //user2 deposits 10,000 JBT...
    transaction = await exchange.connect(user2).depositToken(JbtT.address, amount);
    result = await transaction.wait();
    console.log(`Deposited ${amount} JBTs from ${user2.address}\n`);

    ////////////////////////////////
    // Seed a cancelled order
    //

    // User 1 makes order to get tokens
    let orderId;
    transaction = await exchange.connect(user1).makeOrder(JbtT.address, tokens(100), GilT.address, tokens(5));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    // User 1 cancels order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    result = await transaction.wait();
    console.log(`Cancelled order from ${user1.address}\n`);
    
    // Wait 1 second
    await wait(1);

    ////////////////////////////////
    // Seed Filled Orders
    //

    // User 1 makes order 
    transaction = await exchange.connect(user1).makeOrder(JbtT.address, tokens(100), GilT.address, tokens(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    // User 2 fills order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Filled order from ${user1.address}\n`);

    // Wait 1 second
    await wait(1);

    // User 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(JbtT.address, tokens(50), GilT.address, tokens(15));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    // User 2 fills another order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Filled order from ${user1.address}\n`);

    // Wait 1 second
    await wait(1);

    // User 1 makes final order
    transaction = await exchange.connect(user1).makeOrder(JbtT.address, tokens(200), GilT.address, tokens(20));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    // User 2 fills final order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Filled order from ${user1.address}\n`);

    
    // Wait 1 second
    await wait(1);
    

    ////////////////////////////////
    // Seed Open Orders
    //
    
    // User 10 makes orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(JbtT.address, tokens(10 * i), GilT.address, tokens(10));
        result = await transaction.wait();
        console.log(`Made order #${i} from ${user1.address}`);

        // Wait 1 second
        await wait(1);
    };
    
    // User 2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(GilT.address, tokens(10), JbtT.address, tokens(10 * i));
        result = await transaction.wait();
        console.log(`Made order #${i} from ${user2.address}`);

        // Wait 1 second
        await wait(1);
    };
    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });