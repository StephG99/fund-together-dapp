import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { createCampaignOnChain } from "../store/web3";
const CreatePage = () => {
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    goal: "",
    duration: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleAddCampaign = async () => {
    try {
      setLoading(true);

      // Parse duration as integer
      const durationInDays = parseInt(newCampaign.duration, 10);
      if (isNaN(durationInDays) || durationInDays <= 0) {
        throw new Error("Please enter a valid duration in days.");
      }

      // Call your contract creation function
      const campaignContract = await createCampaignOnChain(
        newCampaign.name,
        newCampaign.goal,
        durationInDays
      );

      console.log("Deployed campaign on-chain at:", campaignContract);

      // Upload metadata to the backend
      const formData = new FormData();
      formData.append("campaignContract", campaignContract);
      formData.append("description", newCampaign.description);
      if (newCampaign.image) {
        formData.append("image", newCampaign.image);
      }

      const response = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create campaign.");
      }

      const data = await response.json();
      console.log("Campaign created (off-chain):", data);

      // Success toast
      toast({
        title: "Success",
        description: "Campaign created successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset the form
      setNewCampaign({
        name: "",
        goal: "",
        duration: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error("Error creating campaign:", error.message);

      // Error toast
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm">
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center" mb={8}>
          Create New Campaign
        </Heading>

        <Box
          w="full"
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          rounded="lg"
          shadow="md"
        >
          <VStack spacing={4}>
            <Input
              placeholder="Campaign Name"
              name="name"
              value={newCampaign.name}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, name: e.target.value })
              }
              required
            />
            <Input
              placeholder="Goal (ETH)"
              name="goal"
              type="number"
              value={newCampaign.goal}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, goal: e.target.value })
              }
              required
            />
            <Input
              placeholder="Duration (Days)"
              name="duration"
              type="number"
              value={newCampaign.duration}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, duration: e.target.value })
              }
              required
            />
            <Input
              placeholder="Description"
              name="description"
              value={newCampaign.description}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, description: e.target.value })
              }
              required
            />
            <Box w="full" textAlign="center">
              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    image: e.target.files[0],
                  })
                }
                sx={{
                  "::file-selector-button": {
                    background: "blue.500",
                    color: "white",
                    padding: "0.3rem 0.6rem",
                    margin: "0.15rem",
                    marginLeft: "-3.5",
                    borderRadius: "md",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    _hover: {
                      background: "blue.600",
                    },
                  },
                }}
                required
              />
            </Box>

            <Button
              colorScheme="blue"
              onClick={handleAddCampaign}
              isLoading={loading}
              loadingText="Creating..."
            >
              Create Campaign
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;
