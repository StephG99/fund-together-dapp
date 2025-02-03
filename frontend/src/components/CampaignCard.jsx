import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import {
	Box,
	Button,
	Heading,
	HStack,
	IconButton,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useColorModeValue,
	useDisclosure,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { useCampaignStore } from '../store/campaign';
import React from 'react'
import { useState } from 'react';
import { API_URL } from '../config';

const CampaignCard = ({campaign}) => {
    const [updatedCampaign, setUpdatedCampaign] = useState(campaign)
    const textColor = useColorModeValue("gray.600", "gray.200");
    const bg = useColorModeValue("white", "gray.800");

    const {deleteCampaign, updateCampaign, fetchCampaigns} = useCampaignStore()
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleDeleteCampaign = (campaignId) => async (cid) => {
        const {success, message} = await deleteCampaign(campaignId)
        if(!success){
            toast({
                title: 'Error',
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } else {
            toast({
                title: 'Success',
                description: message,
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }
    }
    
    

    const handleUpdateCampaign = async (campaignId, updatedCampaign) => {
        const formData = new FormData();
        formData.append("campaignContract", updatedCampaign.campaignContract);
        formData.append("description", updatedCampaign.description);
        if (updatedCampaign.image) {
            formData.append("image", updatedCampaign.image); // Add image only if it's updated
        }
    
        try {
            const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            if (!data.success) {
                toast({
                    title: 'Error',
                    description: data.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                // Refresh and Close the modal after successful update
                await fetchCampaigns();
                onClose();

                toast({
                    title: 'Success',
                    description: 'Campaign updated successfully',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error updating campaign:", error.message);
    
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };
    
    

  return (
    <Box
        shadow={"lg"}
        rounded={"lg"}
        overflow={"hidden"}
        transition={"all 0.3s"}
        _hover={{ transform: "translateY(-5px)", shadow: "xl",}}
        bg={bg}
    >
        <Image src={campaign.imageURL} alt={campaign.campaignContract} h={48} w='full' objectFit='cover'/>
        
        <Box p={4}>
            <Heading as={"h3"} size={"md"} textAlign={"center"} mb={4}>
                {campaign.campaignContract}
            </Heading>

            <Text fontWeight='bold' fontSize="xl" color={textColor} mb={4}>
                {campaign.description}
            </Text>

            <HStack spacing={2}>
                <IconButton icon={<EditIcon/>}
                onClick={onOpen}
                colorScheme='blue'/>
                <IconButton icon={<DeleteIcon/>} onClick={handleDeleteCampaign(campaign._id)} colorScheme='red'/>
            </HStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />

                <ModalContent>
                    <ModalHeader>Update Campaign</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Input
                                placeholder="Campaign Contract Address"
                                name="campaignContract"
                                value={updatedCampaign.campaignContract}
                                onChange={(e) => setUpdatedCampaign({ ...updatedCampaign, campaignContract: e.target.value })}
                            />
                            <Input
                                placeholder="Description"
                                name="description"
                                value={updatedCampaign.description}
                                onChange={(e) => setUpdatedCampaign({ ...updatedCampaign, description: e.target.value })}
                            />
                            <Box w="full" textAlign="center" mb={4}>
                                <Input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) => setUpdatedCampaign({ ...updatedCampaign, image: e.target.files[0] })}
                                    sx={{
                                        "::file-selector-button": {
                                            background: "blue.500",
                                            color: "white",
                                            padding: "0.3rem 0.6rem",
                                            margin: "0.15rem",
                                            marginLeft: "-2.5",
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
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' 
                        mr={3}
                        onClick={async () => await handleUpdateCampaign(campaign._id, updatedCampaign)}
                        >
                            Update
                        </Button>
                        <Button variant={"ghost"} onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>    
    </Box>
  )
}

export default CampaignCard