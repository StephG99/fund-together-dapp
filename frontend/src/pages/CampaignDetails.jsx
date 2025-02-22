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

  // Basic contract state
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [paused, setPaused] = useState(false);
  const [goal, setGoal] = useState("0.0");
  const [balance, setBalance] = useState("0.0");
  const [tiers, setTiers] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  // Additional fields
  const [deadline, setDeadline] = useState("0");
  const [status, setStatus] = useState(0); // 0=Active,1=Successful,2=Failed

  // State to track whether current user has contributed
  const [hasContributed, setHasContributed] = useState(false);

  // UI state
  const [currentUser, setCurrentUser] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTierName, setNewTierName] = useState("");
  const [newTierAmount, setNewTierAmount] = useState("");

  const toast = useToast();

  // Helper to parse numeric state into string
  const parseStatus = (s) => {
    switch (s) {
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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setCurrentUser(accounts[0].address.toLowerCase());
        }
      }
    };

    fetchCurrentUser();

    // Subscribe to account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setCurrentUser(accounts[0].toLowerCase());
        } else {
          setCurrentUser("");
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      // Cleanup on unmount
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        }
      };
    }
  }, []);

  const isOwner = currentUser && owner && currentUser === owner;

  // Helper to connect the wallet on demand
  const handleConnectWallet = async () => {
    try {
      const wallet = await connectWallet();
      if (wallet) {
        setCurrentUser(wallet.toLowerCase());
      }
    } catch (err) {
      console.error("Error connecting wallet:", err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Re-fetch tiers & balance
  const fetchTiers = async () => {
    try {
      if (!window.ethereum) return;
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

        // Off-chain data from your Node/Express backend
        const res = await fetch(
          `http://localhost:5000/api/campaigns/addr/${address}`
        );
        if (!res.ok) throw new Error("Failed to fetch campaign from backend.");
        const data = await res.json();
        setCampaign(data.data);

        // On-chain data from read-only provider
        if (!window.ethereum) {
          throw new Error("No Ethereum provider found.");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          address,
          CAMPAIGN_CONTRACT_ABI,
          provider
        );

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
          contract.deadline(),
          contract.getCampaignStatus(), // dynamic state
        ]);

        setName(cName);
        setOwner(cOwner.toLowerCase());
        setPaused(cIsPaused);
        setTiers(cTiers);
        setGoal(ethers.formatEther(cGoal));
        setBalance(ethers.formatEther(cBalance));
        setDeadline(cDeadline.toString());
        setStatus(Number(cState));
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

  // After loading tiers or status, check if user contributed
  useEffect(() => {
    if (!currentUser || tiers.length === 0) return;

    const checkContribution = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          address,
          CAMPAIGN_CONTRACT_ABI,
          provider
        );

        let contributed = false;
        // Check each tier to see if user contributed
        for (let i = 0; i < tiers.length; i++) {
          const didContribute = await contract.hasContributedTier(
            currentUser,
            i
          );
          if (didContribute) {
            contributed = true;
            break;
          }
        }
        setHasContributed(contributed);
      } catch (err) {
        console.error("Error checking user contribution:", err.message);
      }
    };

    checkContribution();
  }, [currentUser, tiers, address]);

  // Convert campaign status to a display-friendly label
  const parsed = parseStatus(status);
  const displayStatus = paused && status === 0 ? `${parsed} (Paused)` : parsed;

  // Convert deadline => date
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleString();

  // Progress bar
  const gVal = parseFloat(goal) || 0;
  const bVal = parseFloat(balance) || 0;
  let progressPct = 0;
  if (gVal > 0) {
    progressPct = (bVal / gVal) * 100;
    if (progressPct > 100) progressPct = 100;
  }

  // On-chain actions that need a signer
  const ensureWallet = async () => {
    if (!currentUser) {
      try {
        const wallet = await connectWallet();
        if (wallet) {
          setCurrentUser(wallet.toLowerCase());
        }
      } catch (err) {
        throw err;
      }
    }
  };

  const handleTogglePause = async () => {
    try {
      await ensureWallet();
      if (!currentUser) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet first.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

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
        description: paused ? "Campaign unpaused" : "Campaign paused",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error toggling pause:", err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
      await ensureWallet();
      if (!currentUser) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet first.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

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
        description: "Tier added.",
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

  const handleWithdraw = async () => {
    try {
      await ensureWallet();
      if (!currentUser) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet first.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CAMPAIGN_CONTRACT_ABI,
        signer
      );

      const tx = await contract.withdraw();
      await tx.wait();

      const cBalance = await contract.getContractBalance();
      setBalance(ethers.formatEther(cBalance));

      toast({
        title: "Success",
        description: "Funds withdrawn.",
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

  // Refund for contributors when campaign is Failed
  const handleRefund = async () => {
    try {
      await ensureWallet();
      if (!currentUser) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet first.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CAMPAIGN_CONTRACT_ABI,
        signer
      );

      const tx = await contract.refund();
      await tx.wait();

      // Refresh local balance & remove contributor status
      await fetchTiers();
      setHasContributed(false);

      toast({
        title: "Success",
        description: "Refund successful.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error claiming refund:", err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
        {/* Row with Title and Connect or Edit button */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading>{name}</Heading>
          <Box>
            {/* If you still want Connect Wallet explicitly, uncomment:
            <Button onClick={handleConnectWallet}>Connect Wallet</Button>
            */}
            {isOwner && (
              <Button
                colorScheme="blue"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Done" : "Edit"}
              </Button>
            )}
          </Box>
        </Box>

        <Text fontWeight="bold">Contract Address: {address}</Text>

        {campaign.imageURL && (
          <Image
            src={campaign.imageURL}
            alt={name}
            maxH="400px"
            objectFit="cover"
          />
        )}

        <Text fontWeight="bold">Description</Text>
        <Text>{campaign.description}</Text>

        <Box>
          <Text fontWeight="bold">Status: {displayStatus}</Text>
          <Text fontWeight="bold">Deadline: {deadlineDate}</Text>
        </Box>

        <Box>
          <Heading size="sm" mb={2}>
            Progress
          </Heading>
          <Text fontSize="sm" mb={1}>
            Raised: {balance} ETH / Goal: {goal} ETH
          </Text>
          <Progress
            value={progressPct}
            colorScheme="blue"
            size="sm"
            borderRadius="md"
          />
          <Text fontSize="sm" mt={1}>
            {progressPct.toFixed(2)}%
          </Text>
        </Box>

        <Text fontWeight="bold">Owner: {owner}</Text>

        {/* If isOwner & editing => show pause/unpause */}
        {isOwner && isEditing && (
          <Button colorScheme="red" onClick={handleTogglePause}>
            {paused ? "Unpause Campaign" : "Pause Campaign"}
          </Button>
        )}

        {/* If campaign is Successful => show Withdraw button for the owner */}
        {isOwner && status === 1 && (
          <Button colorScheme="green" onClick={handleWithdraw}>
            Withdraw Funds
          </Button>
        )}

        {/* If campaign is Failed => show Refund button for contributors only */}
        {!isOwner && status === 2 && hasContributed && (
          <Button colorScheme="red" onClick={handleRefund}>
            Claim Refund
          </Button>
        )}

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
