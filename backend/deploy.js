const fs = require('fs');
const Web3 = require('web3');

const abi = JSON.parse(fs.readFileSync("C:\\Users\\SJI-GOA-69\\Desktop\\MediVault\\MediVault\\backend\\contracts\\Cruds.abi"));
const bytecode = fs.readFileSync("C:\\Users\\SJI-GOA-69\\Desktop\\MediVault\\MediVault\\backend\\contracts\\Cruds.bin").toString();

const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545"));

async function deploy() {
    let contract = new web3.eth.Contract(abi);
    contract = contract.deploy({data: bytecode});

    // Add your private key to sign transactions
    const privateKey = '0x523f228aeb1a8fa894d4e0bce3201fcfd15960a5454ac55d3903bdd74bddb43e'; // Replace with your private key
    web3.eth.accounts.wallet.add(privateKey);
    const fromAddress = web3.eth.accounts.wallet[0].address; // First address in the wallet

    // Estimate gas for deployment
    const deployGas = await contract.deploy({data: bytecode}).estimateGas({from: fromAddress});

    const deployContract = await contract.send({
        from: fromAddress,
        gas: deployGas,
    });

    console.log("Contract deployed at address:", deployContract.options.address);
}

deploy();
