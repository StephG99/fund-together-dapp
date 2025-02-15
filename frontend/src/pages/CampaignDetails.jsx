import React, { useEffect, useState } from "react";
import {
  Container,
  Heading,
  Image,
  Text,
  Button,
  VStack,
  Box,
  Progress,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { connectWallet } from "../store/web3";
import { CAMPAIGN_CONTRACT_ABI } from "../config/constants";
import TierCard from "../components/TierCard";

const CampaignDetails = () => {
  const { address } = useParams();

  // Basic info from contract
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [paused, setPaused] = useState(false);
  const [goal, setGoal] = useState("0.0");
  const [balance, setBalance] = useState("0.0");
  const [tiers, setTiers] = useState([]);
  const [campaign, setCampaign] = useState(null); // Off-chain data
  const [loading, setLoading] = useState(true);

  // Additional fields
  const [deadline, setDeadline] = useState("0");
  const [status, setStatus] = useState(0); // 0=Active, 1=Successful, 2=Failed

  // UI state
  const [currentUser, setCurrentUser] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTierName, setNewTierName] = useState("");
  const [newTierAmount, setNewTierAmount] = useState("");

  const toast = useToast();

  // Helper function to re-fetch tiers + balance
  const fetchTiers = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        address,
        CAMPAIGN_CONTRACT_ABI,
        provider
      );

      const updatedTiers = await contract.getTiers();
      setTiers(updatedTiers);

      const cBalance = await contract.getContractBalance();
      setBalance(ethers.formatEther(cBalance));
    } catch (err) {
      console.error("Error refreshing tiers:", err.message);
    }
  };

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);

        // 1) Connect wallet
        const walletAddress = await connectWallet();
        if (walletAddress) {
          setCurrentUser(walletAddress.toLowerCase());
        }

        // 2) Fetch off-chain metadata (image, description, campaignContract, etc.)
        const res = await fetch(
          `http://localhost:5000/api/campaigns/addr/${address}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch campaign from backend.");
        }
        const data = await res.json();
        setCampaign(data.data);

        // 3) Fetch on-chain data
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          address,
          CAMPAIGN_CONTRACT_ABI,
          provider
        );

        // Retrieve more fields: deadline, campaign state
        const [
          cName,
          cOwner,
          cIsPaused,
          cTiers,
          cGoal,
          cBalance,
          cDeadline,
          cState,
        ] = await Promise.all([
          contract.name(),
          contract.owner(),
          contract.paused(),
          contract.getTiers(),
          contract.goal(),
          contract.getContractBalance(),
          contract.deadline(), // number
          contract.state(), // enum stored as uint8
        ]);

        setName(cName);
        setOwner(cOwner.toLowerCase());
        setPaused(cIsPaused);
        setTiers(cTiers);

        setGoal(ethers.formatEther(cGoal));
        setBalance(ethers.formatEther(cBalance));
        setDeadline(cDeadline.toString()); // store as string for now
        setStatus(Number(cState)); // 0=Active, 1=Successful, 2=Failed
      } catch (err) {
        console.error("Error loading campaign details:", err.message);
        toast({
          title: "Error",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [address, toast]);

  // Parse the numeric status into a human-readable string
  const parseStatus = (num) => {
    switch (num) {
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

  // Convert the deadline (seconds) to a local date/time
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleString();

  // Calculate progress for progress bar
  const goalValue = parseFloat(goal) || 0;
  const balanceValue = parseFloat(balance) || 0;
  let progressPercent = 0;
  if (goalValue > 0) {
    progressPercent = (balanceValue / goalValue) * 100;
    if (progressPercent > 100) progressPercent = 100;
  }

  // Check if user is owner
  const isOwner = currentUser === owner;

  // Toggle campaign pause/unpause
  const handleTogglePause = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CAMPAIGN_CONTRACT_ABI,
        signer
      );

      const tx = await contract.togglePause();
      await tx.wait();

      setPaused(!paused);
      toast({
        title: "Success",
        description: `Campaign is now ${paused ? "unpaused" : "paused"}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error toggling pause:", err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add Tier from modal
  const handleAddTier = async () => {
    if (!newTierName || !newTierAmount) {
      toast({
        title: "Error",
        description: "Please enter both a tier name and amount.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CAMPAIGN_CONTRACT_ABI,
        signer
      );

      const tierAmountWei = ethers.parseEther(newTierAmount);
      const tx = await contract.addTier(newTierName, tierAmountWei);
      await tx.wait();

      await fetchTiers();
      setNewTierName("");
      setNewTierAmount("");
      onClose();

      toast({
        title: "Success",
        description: "Tier added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error adding tier:", err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Withdraw if campaign is successful
  const handleWithdraw = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CAMPAIGN_CONTRACT_ABI,
        signer
      );

      const tx = await contract.withdraw();
      await tx.wait();

      // Refresh balance after withdrawal
      const cBalance = await contract.getContractBalance();
      setBalance(ethers.formatEther(cBalance));

      toast({
        title: "Success",
        description: "Funds withdrawn successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error withdrawing funds:", err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // If still loading or no campaign
  if (loading) {
    return (
      <Container maxW="container.md" mt={10}>
        <Heading size="lg" textAlign="center">
          Loading Campaign...
        </Heading>
      </Container>
    );
  }
  if (!campaign) {
    return (
      <Container maxW="container.md" mt={10}>
        <Heading size="lg" textAlign="center">
          Campaign Not Found
        </Heading>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" mt={6}>
      <VStack align="stretch" spacing={6}>
        {/* Title & Edit mode toggle */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading>{name}</Heading>
          {isOwner && (
            <Button colorScheme="blue" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Done" : "Edit"}
            </Button>
          )}
        </Box>

        {/* Contract Address */}
        <Text fontWeight="bold">Contract Address: {address}</Text>

        {/* Off-chain image */}
        {campaign.imageURL && (
          <Image
            src={campaign.imageURL}
            alt={name}
            maxH="400px"
            objectFit="cover"
          />
        )}

        {/* Description */}
        <Text fontWeight="bold">Description</Text>
        <Text>{campaign.description}</Text>

        {/* Status & Deadline */}
        <Box>
          <Text fontWeight="bold">Status: {parseStatus(status)}</Text>
          <Text fontWeight="bold">Deadline: {deadlineDate}</Text>
        </Box>

        {/* Progress Bar */}
        <Box>
          <Heading size="sm" mb={2}>
            Progress
          </Heading>
          <Text fontSize="sm" mb={1}>
            Raised: {balance} ETH / Goal: {goal} ETH
          </Text>
          <Progress
            value={progressPercent}
            colorScheme="blue"
            size="sm"
            borderRadius="md"
          />
          <Text fontSize="sm" mt={1}>
            {progressPercent.toFixed(2)}%
          </Text>
        </Box>

        {/* Owner */}
        <Text fontWeight="bold">Owner: {owner}</Text>

        {/* Pause/Unpause (only if editing) */}
        {isOwner && isEditing && (
          <Button colorScheme="red" onClick={handleTogglePause}>
            {paused ? "Unpause Campaign" : "Pause Campaign"}
          </Button>
        )}

        {/* 
          If status is Successful (1) & user is owner, show withdraw button 
          (We assume the campaign uses 'withdraw()' to claim funds).
        */}
        {isOwner && status === 1 && (
          <Button colorScheme="green" onClick={handleWithdraw}>
            Withdraw Funds
          </Button>
        )}

        {/* Tiers */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Heading size="md">Tiers</Heading>
          {isOwner && isEditing && !paused && (
            <Button colorScheme="blue" onClick={onOpen}>
              + Add Tier
            </Button>
          )}
        </Box>

        {tiers.length === 0 ? (
          <Text>No tiers available</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {tiers.map((tier, i) => (
              <TierCard
                key={i}
                tier={tier}
                index={i}
                campaignAddress={address}
                isOwner={isOwner && isEditing}
                paused={paused}
                refreshTiers={fetchTiers}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Add Tier Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a New Tier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <Input
                placeholder="Tier Name"
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
              />
              <Input
                placeholder="Tier Amount in ETH"
                value={newTierAmount}
                onChange={(e) => setNewTierAmount(e.target.value)}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddTier}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CampaignDetails;
