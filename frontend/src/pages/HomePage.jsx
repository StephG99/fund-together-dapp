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
        let offChainCampaigns = (await response.json()).data;

        // 2) Filter out any record that matches the factory address
        offChainCampaigns = offChainCampaigns.filter((c) => {
          if (
            c.campaignContract?.toLowerCase() ===
            FACTORY_CONTRACT_ADDRESS.toLowerCase()
          ) {
            console.warn("Skipping factory address:", c.campaignContract);
            return false;
          }
          return true;
        });

        // If no MetaMask, just return
        if (!window.ethereum) {
          console.error("MetaMask not available in window.ethereum");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        // 3) For each campaign, fetch on-chain data: name, goal, balance, status, etc.
        const enrichedCampaigns = await Promise.all(
          offChainCampaigns.map(async (campaign) => {
            try {
              const contract = new ethers.Contract(
                campaign.campaignContract,
                CAMPAIGN_CONTRACT_ABI,
                provider
              );

              // name()
              const contractName = await contract.name();

              // getContractBalance() => parse from wei
              const balanceWei = await contract.getContractBalance();
              const balanceEth = ethers.formatEther(balanceWei);

              // goal() => parse from wei
              const goalWei = await contract.goal();
              const goalEth = ethers.formatEther(goalWei);

              // state() => numeric 0=Active, 1=Successful, 2=Failed
              const cState = await contract.state();
              let statusStr = "Unknown";
              switch (Number(cState)) {
                case 0:
                  statusStr = "Active";
                  break;
                case 1:
                  statusStr = "Successful";
                  break;
                case 2:
                  statusStr = "Failed";
                  break;
                default:
                  statusStr = "Unknown";
              }

              return {
                ...campaign,
                name: contractName,
                totalFunds: balanceEth,
                goal: goalEth,
                status: statusStr, // e.g. "Active", "Successful", or "Failed"
              };
            } catch (err) {
              console.error("Error reading contract data:", err);
              // If anything fails, fallback
              return {
                ...campaign,
                name: "Unknown Campaign",
                totalFunds: "0",
                goal: "0",
                status: "Unknown",
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
