// src/store/web3.js
import { ethers } from "ethers";
import { FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI } from "../config/constants";

let provider;
let signer;

/**
 * Connects to MetaMask and retrieves the signer.
 */
export const connectWallet = async () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Request access to user's wallet
    signer = provider.getSigner();

    const address = await signer.getAddress();
    console.log("Connected Wallet Address:", address);
    return address;
};

/**
 * Returns the factory contract instance.
 */
export const getFactoryContract = () => {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, signer);
};

/**
 * Creates a new campaign by interacting with the smart contract.
 */
export const createCampaignOnChain = async (name, goal, startAt, endAt) => {
    const contract = getFactoryContract();
    const goalInWei = ethers.utils.parseEther(goal.toString()); // Convert ETH to Wei
    const tx = await contract.createCampaign(name, goalInWei, startAt, endAt);
    const receipt = await tx.wait();
    console.log("Campaign created on-chain:", receipt);

    const event = receipt.events.find((e) => e.event === "CampaignCreated");
    return event.args.campaignAddress; // Return the new campaign address
};
