import { Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  CAMPAIGN_CONTRACT_ABI,
  FACTORY_CONTRACT_ADDRESS,
} from "../config/constants";
import CampaignCard from "../components/CampaignCard";

const HomePage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);

        // 1) Fetch off-chain metadata
        const response = await fetch("http://localhost:5000/api/campaigns");
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns from backend.");
        }
        const data = await response.json();
        let offChainCampaigns = data.data;

        // 2) Filter out any record that matches the factory address
        offChainCampaigns = offChainCampaigns.filter((campaign) => {
          if (
            campaign.campaignContract?.toLowerCase() ===
            FACTORY_CONTRACT_ADDRESS.toLowerCase()
          ) {
            console.warn(
              "Skipping factory address:",
              campaign.campaignContract
            );
            return false;
          }
          return true;
        });

        if (!window.ethereum) {
          console.error("MetaMask not available in window.ethereum");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        // 3) Fetch on-chain data for each campaign (name, goal, balance, etc.)
        const enrichedCampaigns = await Promise.all(
          offChainCampaigns.map(async (campaign) => {
            try {
              const contract = new ethers.Contract(
                campaign.campaignContract,
                CAMPAIGN_CONTRACT_ABI,
                provider
              );

              console.log(
                "Calling contract.name() at address:",
                campaign.campaignContract
              );
              const contractName = await contract.name();

              // Get the current contract balance (in wei => ETH)
              const balanceWei = await contract.getContractBalance();
              const balanceEth = ethers.formatEther(balanceWei);

              // Get the goal (also stored in wei => ETH)
              const goalWei = await contract.goal();
              const goalEth = ethers.formatEther(goalWei);

              return {
                ...campaign,
                name: contractName,
                totalFunds: balanceEth, // used in CampaignCard
                goal: goalEth, // now your card can show the correct goal
              };
            } catch (err) {
              console.error("Error reading contract data:", err);

              // If anything fails, fallback
              return {
                ...campaign,
                name: "Unknown Campaign",
                totalFunds: "0",
                goal: "0",
              };
            }
          })
        );

        // 4) Update state
        setCampaigns(enrichedCampaigns);
      } catch (err) {
        console.error("Error fetching campaigns:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <Container maxW="container.xl">
      <VStack spacing={8}>
        <Text
          fontSize="30"
          fontWeight="bold"
          textAlign="center"
          bgClip="text"
          bgGradient="linear(to-r, cyan.400, blue.500)"
        >
          Current Campaigns
        </Text>

        {loading ? (
          <Text
            fontSize="xl"
            fontWeight="bold"
            textAlign="center"
            color="gray.500"
          >
            Loading campaigns...
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.campaignContract}
                campaign={campaign}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default HomePage;
