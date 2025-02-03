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

const CampaignCard = ({campaign}) => {
    const [updatedCampaign, setUpdatedCampaign] = useState(campaign)
    const textColor = useColorModeValue("gray.600", "gray.200");
    const bg = useColorModeValue("white", "gray.800");

    const {deleteCampaign, updateCampaign} = useCampaignStore()
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
        const {success, message} = await updateCampaign(campaignId, updatedCampaign);
        onClose();
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
                description: "Campaign updated successfully",
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }
    }

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

            <Text fontweight='bold' fontSize="xl" color={textColor} mb={4}>
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
                                onChange={(e) => setUpdatedCampaign({...updatedCampaign, campaignContract: e.target.value})}    
                            />
                            <Input 
                                placeholder="Description" 
                                name="description"
                                value={updatedCampaign.description}
                                onChange={(e) => setUpdatedCampaign({...updatedCampaign, description: e.target.value})}
                            />
                            <Input 
                                placeholder="Image URL"
                                name='imageURL'
                                value={updatedCampaign.imageURL}
                                onChange={(e) => setUpdatedCampaign({...updatedCampaign, imageURL: e.target.value})}
                            />
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