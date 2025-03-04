import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorMode,
  Image,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { connectWallet } from "../store/web3";
import logo from "../assets/logo2.1.png";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      if (!address) {
        alert(
          "Failed to connect wallet. Please ensure MetaMask is installed and try again."
        );
        return;
      }
      setWalletAddress(address);
      alert(`Wallet connected: ${address}`);
    } catch (err) {
      console.error("Error connecting wallet:", err.message);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  useEffect(() => {
    // On component mount, see if user is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };

    checkConnection();

    // Subscribe to account changes:
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      });
    }

    // Cleanup listener on unmount:
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <Container maxW={"1140px"} px={4}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          md: "row",
        }}
      >
        <Flex alignItems={"center"}>
          <Image src={logo} alt="Logo" boxSize="40px" mr={2} />
          <Text
            fontSize={{ base: "22", sm: "28" }}
            fontWeight={"bold"}
            textTransform={"uppercase"}
            textAlign={"center"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
          >
            <Link to="/">Fund Together</Link>
          </Text>
        </Flex>

        <HStack spacing={2} alignItems={"center"}>
          <Link to="/">
            <Button>Home</Button>
          </Link>
          {/*
          <Link to="/dashboard">
            <Button colorScheme="teal">Dashboard</Button>
          </Link>
          */}
          <Link to="/create">
            <Button leftIcon={<PlusSquareIcon fontSize={20} />}>Create</Button>
          </Link>

          <Button onClick={toggleColorMode}>
            {colorMode === "light" ? <IoMoon /> : <LuSun />}
          </Button>

          {/* Connect Wallet Button */}
          <Button colorScheme="blue" onClick={handleConnectWallet}>
            {walletAddress
              ? `Connected: ${walletAddress.slice(
                  0,
                  6
                )}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
