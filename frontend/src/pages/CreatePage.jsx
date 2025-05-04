import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
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
    deadline: "", // Will store date/time in a format suitable for <input type="datetime-local">
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleAddCampaign = async () => {
    try {
      setLoading(true);

      // Parse the user's chosen date/time into a Unix timestamp in seconds
      const chosenDate = new Date(newCampaign.deadline);
      const deadlineTimestamp = Math.floor(chosenDate.getTime() / 1000);

      // Optional: Validate if deadline is in the future
      const now = Math.floor(Date.now() / 1000);
      if (deadlineTimestamp <= now) {
        throw new Error("Please pick a future date/time for the deadline.");
      }

      // Call your contract creation function with the correct parameters
      // (Campaign Name, Goal in ETH, Deadline Timestamp in seconds)
      const campaignContract = await createCampaignOnChain(
        newCampaign.name,
        newCampaign.goal,
        deadlineTimestamp
      );

      console.log("Deployed campaign on-chain at:", campaignContract);

      // Upload metadata (description, image, etc.) to your backend
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
        deadline: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error("Error creating campaign:", error.message);
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

            {/* Replace the old "Duration (Days)" with a date/time input */}
            <Input
              placeholder="Deadline"
              name="deadline"
              type="datetime-local" // <-- key HTML attribute
              value={newCampaign.deadline}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, deadline: e.target.value })
              }
              required
            />

            <Textarea
              placeholder="Description"
              name="description"
              value={newCampaign.description}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, description: e.target.value })
              }
              rows={4} // Adjust this to control the default visible lines
              resize="vertical" // Allow manual vertical resizing
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
