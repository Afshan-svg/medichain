let Web3 = require('web3');
let solc = require('solc');
const fs = require('fs');

// Connect to the local Ethereum node
let web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

// Path to your Solidity contract
const contractPath = "C:/Users/SJI-GOA-69/Desktop/MediVault/MediVault/backend/contracts/Cruds.sol";

// Read the Solidity source code
const sourceCode = fs.readFileSync(contractPath, 'utf8');

// Define the input JSON for Solidity compiler
const input = {
    language: 'Solidity',
    sources: {
        'Cruds.sol': {
            content: sourceCode,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

// Compile the contract
try {
    const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    if (compiledCode.errors && compiledCode.errors.length > 0) {
        compiledCode.errors.forEach((err) => {
            console.error(err.formattedMessage);
        });
        process.exit(1);
    }

    // Retrieve the compiled contract
    const contractName = Object.keys(compiledCode.contracts['Cruds.sol'])[0]; // e.g., 'Cruds'
    const abi = compiledCode.contracts['Cruds.sol'][contractName].abi;
    const bytecode = compiledCode.contracts['Cruds.sol'][contractName].evm.bytecode.object;

    // Log ABI and Bytecode
    console.log("Contract ABI:", abi);
    console.log("Contract Bytecode:", bytecode);

    // Example: Deploy the contract
    const contract = new web3.eth.Contract(abi);
    web3.eth.getAccounts().then((accounts) => {
        const deploy = contract.deploy({
            data: bytecode,
        });

        deploy
            .send({
                from: accounts[0],
                gas: 4700000,
            })
            .then((newContractInstance) => {
                console.log("Contract deployed at:", newContractInstance.options.address);
            })
            .catch((err) => {
                console.error("Deployment Error:", err);
            });
    });
} catch (error) {
    console.error("Compilation Error:", error);
    process.exit(1);
}
