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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createCampaignOnChain } from "../store/web3";

const CreatePage = () => {
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    goal: "",
    deadline: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaignId, setNewCampaignId] = useState(null);
  const cancelRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  const handleAddCampaign = async () => {
    try {
      setLoading(true);

      const chosenDate = new Date(newCampaign.deadline);
      const deadlineTimestamp = Math.floor(chosenDate.getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);

      if (deadlineTimestamp <= now) {
        throw new Error("Please pick a future date/time for the deadline.");
      }

      const campaignContract = await createCampaignOnChain(
        newCampaign.name,
        newCampaign.goal,
        deadlineTimestamp
      );

      console.log("Deployed campaign on-chain at:", campaignContract);

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

      toast({
        title: "Success",
        description: "Campaign created successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Store ID or address to navigate later
      setNewCampaignId(data._id || campaignContract); // adjust depending on backend

      // Show navigation modal
      setIsModalOpen(true);

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

            <Input
              placeholder="Deadline"
              name="deadline"
              type="datetime-local"
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
              rows={4}
              resize="vertical"
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

      {/* Modal */}
      <AlertDialog
        isOpen={isModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsModalOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Campaign Created
            </AlertDialogHeader>

            <AlertDialogBody>
              Your campaign was created successfully. Where would you like to go
              next?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => navigate("/")}>
                Go to Home
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => navigate(`/campaign/${newCampaignId}`)}
                ml={3}
              >
                View Campaign
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default CreatePage;
