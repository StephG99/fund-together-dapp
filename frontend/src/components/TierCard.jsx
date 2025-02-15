import React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { connectWallet } from "../store/web3";
import { CAMPAIGN_CONTRACT_ABI } from "../config/constants";

/**
 * Props:
 * - tier: { name, amount, backers }
 * - index: number
 * - campaignAddress: string
 * - isOwner: boolean (true if user is the owner *and* is editing)
 * - paused: boolean
 * - refreshTiers: function
 */
const TierCard = ({
  tier,
  index,
  campaignAddress,
  isOwner,
  paused,
  refreshTiers,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");

  const amountInEth = ethers.formatEther(tier.amount);

  // Contribute to the tier
  const handleContribute = async () => {
    try {
      const address = await connectWallet();
      if (!address) throw new Error("Wallet not connected.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        campaignAddress,
        CAMPAIGN_CONTRACT_ABI,
        signer
      );

      // contribute(_tierIndex) with msg.value = tier.amount
      const tx = await contract.contribute(index, { value: tier.amount });
      await tx.wait();

      toast({
        title: "Success",
        description: `Contributed to tier #${index}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refreshTiers();
    } catch (err) {
      console.error("Error contributing to tier:", err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Remove this tier
  const handleRemoveTier = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        campaignAddress,
        CAMPAIGN_CONTRACT_ABI,
        signer
      );

      const tx = await contract.removeTier(index);
      await tx.wait();

      toast({
        title: "Success",
        description: `Removed tier #${index}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refreshTiers();
    } catch (err) {
      console.error("Error removing tier:", err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={4}
      bg={cardBg}
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minH="180px"
    >
      <Heading as="h3" size="md" mb={2}>
        {tier.name}
      </Heading>
      <Text>
        <b>Amount:</b> {amountInEth} ETH
      </Text>
      <Text>
        <b>Backers:</b> {tier.backers.toString()}
      </Text>

      {/* Contribute button is disabled if paused */}
      <Button
        mt={3}
        colorScheme="blue"
        onClick={handleContribute}
        isDisabled={paused}
      >
        Contribute
      </Button>

      {/* Show remove button only if isOwner === true */}
      {isOwner && (
        <Button
          mt={2}
          colorScheme="red"
          onClick={handleRemoveTier}
          isDisabled={paused}
        >
          Remove Tier
        </Button>
      )}
    </Box>
  );
};

export default TierCard;
