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
import React from "react";
import { Link } from "react-router-dom";

const CampaignCard = ({ campaign }) => {
  // campaign might have: { name, goal, totalFunds, imageURL, description, campaignContract, ... }
  // 'goal' and 'totalFunds' are strings in ETH (e.g. "1.0") for the progress bar.

  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");

  // Convert to numeric for progress
  const goalValue = campaign.goal ? parseFloat(campaign.goal) : 0;
  const totalValue = campaign.totalFunds ? parseFloat(campaign.totalFunds) : 0;

  let progressPct = 0;
  if (goalValue > 0) {
    progressPct = (totalValue / goalValue) * 100;
    if (progressPct > 100) progressPct = 100;
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
        {/* Campaign Name */}
        <Heading as="h3" size="md" textAlign="center" mb={2}>
          {campaign.name || "Unnamed Campaign"}
        </Heading>

        {/* Remove the Address display */}
        {/* <Text>Address: {campaign.campaignContract}</Text> */}

        {/* Goal and total raised */}
        <Text fontWeight="bold" fontSize="sm" color={textColor} mb={2}>
          Goal: {goalValue.toLocaleString()} ETH
        </Text>
        <Text fontWeight="bold" fontSize="sm" color={textColor} mb={2}>
          Raised: {totalValue.toLocaleString()} ETH
        </Text>

        {/* Progress bar */}
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

        {/* "View More Details" button */}
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
