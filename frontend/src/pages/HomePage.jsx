import { Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import { ethers } from "ethers";
import { CAMPAIGN_CONTRACT_ABI } from "../config/constants";

const HomePage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);

                // Step 1: Fetch off-chain metadata from the backend
                const response = await fetch("http://localhost:5000/api/campaigns");
                if (!response.ok) {
                    throw new Error("Failed to fetch campaigns.");
                }
                const data = await response.json();
                const offChainCampaigns = data.data;

                // Step 2: Fetch on-chain data for each campaign
                const provider = new ethers.BrowserProvider(window.ethereum);
                const enrichedCampaigns = await Promise.all(
                    offChainCampaigns.map(async (campaign) => {
                        const contract = new ethers.Contract(campaign.campaignContract, CAMPAIGN_CONTRACT_ABI, provider);
                        const name = await contract.getName(); // Get name from the blockchain
                        const totalFunds = await contract.getTotalFundsRaised(); // Get total funds raised
                        return {
                            ...campaign,
                            name,
                            totalFunds: ethers.formatEther(totalFunds), // Convert from Wei to ETH
                        };
                    })
                );

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
        <Container>
            <VStack spacing={8}>
                <Text
                    fontSize={"30"}
                    fontWeight={"bold"}
                    textAlign={"center"}
                    bgClip={"text"}
                    bgGradient={"linear(to-r,cyan.400 , blue.500)"}
                >
                    Current Campaigns
                </Text>

                {loading ? (
                    <Text fontSize={"xl"} fontWeight={"bold"} textAlign={"center"} color={"gray.500"}>
                        Loading campaigns...
                    </Text>
                ) : (
                    <SimpleGrid
                        columns={{
                            base: 1,
                            md: 2,
                            lg: 3,
                        }}
                        spacing={10}
                        w={"full"}
                    >
                        {campaigns.map((campaign) => (
                            <CampaignCard key={campaign.campaignContract} campaign={campaign} />
                        ))}
                    </SimpleGrid>
                )}

                {!loading && campaigns.length === 0 && (
                    <Text fontSize={"xl"} fontWeight={"bold"} textAlign={"center"} color={"gray.500"}>
                        No Active Campaigns 😔
                        <Link to={"/create"}>
                            <Text as={"span"} color={"blue.500"} _hover={{ textDecoration: "underline" }}>
                                Create a new campaign
                            </Text>
                        </Link>
                    </Text>
                )}
            </VStack>
        </Container>
    );
};

export default HomePage;
