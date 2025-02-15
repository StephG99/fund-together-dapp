// src/store/web3.js
import { ethers } from "ethers";
import {
  FACTORY_CONTRACT_ADDRESS,
  FACTORY_CONTRACT_ABI,
} from "../config/constants";
import { BrowserProvider } from "ethers";

let provider;
let signer;

/**
 * Connects to MetaMask and retrieves the wallet address.
 */
export const connectWallet = async () => {
  console.log("Checking if MetaMask (window.ethereum) is available...");

  if (!window.ethereum) {
    alert(
      "MetaMask is not installed. Please install it to connect your wallet."
    );
    return null;
  }

  try {
    console.log("MetaMask detected. Attempting to connect...");
    provider = new BrowserProvider(window.ethereum);

    // Request access to the wallet
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log("Connected accounts:", accounts);

    // Get the connected wallet address
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log("Wallet connected:", address);

    return address; // Return the wallet address
  } catch (err) {
    console.error("Error connecting to wallet:", err.message);
    throw err; // Rethrow the error to the calling function
  }
};

/**
 * Returns the factory contract instance using the connected signer.
 */
export const getFactoryContract = () => {
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(
    FACTORY_CONTRACT_ADDRESS,
    FACTORY_CONTRACT_ABI,
    signer
  );
};

/**
 * Creates a new campaign by interacting with the CrowdfundingFactory smart contract.
 * @param {string} name - The name of the campaign.
 * @param {string} goal - The funding goal in ETH.
 * @returns {string} The blockchain address of the newly created campaign.
 */
export const createCampaignOnChain = async (name, goal, durationInDays) => {
  try {
    if (!signer) {
      console.log("Wallet not connected. Attempting to reconnect...");
      await connectWallet();
    }

    const contract = getFactoryContract();

    // Convert goal from ETH to Wei
    const goalInWei = ethers.parseEther(goal.toString());
    console.log("Creating campaign on-chain...");

    // Call the factory
    const tx = await contract.createCampaign(name, goalInWei, durationInDays);

    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    // Parse logs for the CampaignCreated event
    const parsedLogs = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch (err) {
          return null; // not our event
        }
      })
      .filter(Boolean);

    const campaignEvent = parsedLogs.find((e) => e.name === "CampaignCreated");
    if (!campaignEvent) {
      throw new Error("No CampaignCreated event found in transaction logs.");
    }

    const newCampaignAddress = campaignEvent.args.campaignAddress;
    console.log("New campaign deployed at:", newCampaignAddress);

    return newCampaignAddress; // THIS is the actual campaign's address
  } catch (err) {
    console.error("Error creating campaign on-chain:", err.message);
    throw new Error("Failed to create campaign on-chain. Please try again.");
  }
};
