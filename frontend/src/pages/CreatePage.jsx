import {Box, Button, Container, Heading, Input, useColorModeValue, useToast, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { useCampaignStore } from "../store/campaign"

const CreatePage = () => {
  const [newCampaign, setNewCampaign] = useState({
    campaignContract: '',
    description: '',
    image: 'null',
  })

  const toast = useToast()
  const {createCampaign} = useCampaignStore()
  
  const handleAddCampaign = async () => {
    try {
      // Create a FormData object and populate it with campaign data
      const formData = new FormData();
      formData.append("campaignContract", newCampaign.campaignContract);
      formData.append("description", newCampaign.description);
      formData.append("image", newCampaign.image);

      // Make the POST request to the backend with FormData
      const response = await fetch('http://localhost:5000/api/campaigns', {
        method: 'POST',
        body: formData, // Send FormData instead of JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create campaign');
      }

      const data = await response.json();
      console.log('Campaign created:', data);

      // Show success toast
      toast({
        title: 'Success',
        description: 'Campaign created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear the form on success
      setNewCampaign({
        campaignContract: '',
        description: '',
        image: null,
      });
    } catch (error) {
      console.error('Error:', error.message);

      // Show error toast
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
          Create New Campaign
        </Heading>

        <Box w={"full"} bg={useColorModeValue("white", "gray.800")}  p={6} rounded={"lg"} shadow={"md"}>
            <VStack spacing={4}>
              <Input
                placeholder="Campaign Contract Address"
                name="campaignContract"
                value={newCampaign.campaignContract}
                onChange={(e) => setNewCampaign({...newCampaign, campaignContract: e.target.value})}
              />
              <Input
                placeholder="Description"
                name="description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
              />
               <Box w="full" textAlign="center">
              <Input
                type="file"
                name="image"
                accept="image/*" // Accept only images
                onChange={(e) => setNewCampaign({ ...newCampaign, image: e.target.files[0] })}
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
              />
            </Box>

              <Button colorScheme="blue" onClick={handleAddCampaign}>
                Create Campaign
              </Button>
            </VStack>
        </Box>
      </VStack>
    </Container>
  )
};

export default CreatePage