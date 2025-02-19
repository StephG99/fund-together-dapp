import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Progress,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { CAMPAIGN_CONTRACT_ABI } from "../config/constants";

const CampaignCard = ({ campaign }) => {
  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");

  // Convert 'goal' and 'totalFunds' from string to number for progress bar
  const goalValue = campaign.goal ? parseFloat(campaign.goal) : 0;
  const totalValue = campaign.totalFunds ? parseFloat(campaign.totalFunds) : 0;

  let progressPct = 0;
  if (goalValue > 0) {
    progressPct = (totalValue / goalValue) * 100;
    if (progressPct > 100) progressPct = 100;
  }

  // Local state for on-chain status and paused flag
  const [onChainStatusCode, setOnChainStatusCode] = useState(null);
  const [paused, setPaused] = useState(false);

  // Helper to convert numeric status code to a string
  const parseStatus = (code) => {
    switch (code) {
      case 0:
        return "Active";
      case 1:
        return "Successful";
      case 2:
        return "Failed";
      default:
        return "Unknown";
    }
  };

  // Fetch the on-chain status and paused values
  useEffect(() => {
    const fetchOnChainStatus = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          campaign.campaignContract,
          CAMPAIGN_CONTRACT_ABI,
          provider
        );

        // Prefer getCampaignStatus() if available; otherwise, fallback to state()
        let status;
        if (contract.getCampaignStatus) {
          status = await contract.getCampaignStatus();
        } else {
          status = await contract.state();
        }
        // Convert status to a number (in case it's a BigNumber)
        const statusCode = Number(status);
        setOnChainStatusCode(statusCode);

        const pausedValue = await contract.paused();
        setPaused(pausedValue);
      } catch (error) {
        console.error("Error fetching on-chain campaign status:", error);
      }
    };

    fetchOnChainStatus();
  }, [campaign.campaignContract]);

  // Determine the displayed status text
  let displayStatus =
    onChainStatusCode !== null ? parseStatus(onChainStatusCode) : "Loading...";
  if (displayStatus === "Active" && paused) {
    displayStatus = "Active (Paused)";
  }

  return (
    <Box
      shadow="lg"
      rounded="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
      bg={bg}
    >
      <Image
        src={campaign.imageURL || "/placeholder.png"}
        alt={campaign.name || "Unnamed Campaign"}
        h={48}
        w="full"
        objectFit="cover"
      />

      <Box p={4}>
        <Heading as="h3" size="md" textAlign="center" mb={2}>
          {campaign.name || "Unnamed Campaign"}
        </Heading>

        <Text fontWeight="bold" fontSize="sm" color={textColor} mb={2}>
          Status: {displayStatus}
        </Text>

        <Text fontWeight="bold" fontSize="sm" color={textColor} mb={2}>
          Goal: {goalValue.toLocaleString()} ETH
        </Text>
        <Text fontWeight="bold" fontSize="sm" color={textColor} mb={2}>
          Raised: {totalValue.toLocaleString()} ETH
        </Text>

        <VStack align="start" spacing={1} mb={4}>
          <Progress
            value={progressPct}
            colorScheme="blue"
            size="sm"
            w="full"
            borderRadius="md"
          />
          <Text fontSize="sm" color={textColor}>
            {progressPct.toFixed(2)}% of goal
          </Text>
        </VStack>

        <HStack spacing={2} justifyContent="center">
          <Button
            as={Link}
            to={`/campaign/${campaign.campaignContract}`}
            colorScheme="blue"
          >
            View More Details
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default CampaignCard;
