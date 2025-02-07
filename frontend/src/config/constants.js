// src/config/constants.js

export const FACTORY_CONTRACT_ADDRESS = "0xYourFactoryContractAddress"; // Replace with your deployed address
export const FACTORY_CONTRACT_ABI = [
    {"type":"function","name":"IS_SCRIPT","inputs":[],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"run","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setUp","inputs":[],"outputs":[],"stateMutability":"nonpayable"}
];

export const CAMPAIGN_CONTRACT_ABI = [
    // Add your campaign contract ABI here
];
