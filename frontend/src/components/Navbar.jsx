import React, { useState, useEffect } from "react";
import { Button, Container, Flex, HStack, Text, useColorMode } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { connectWallet } from "../store/web3";

const Navbar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const [walletAddress, setWalletAddress] = useState("");

    const handleConnectWallet = async () => {
        try {
            const address = await connectWallet(); // Call the connectWallet function
            if (!address) {
                alert("Failed to connect wallet. Please ensure MetaMask is installed and try again.");
                return;
            }
            setWalletAddress(address); // Update the wallet address state
            alert(`Wallet connected: ${address}`);
        } catch (err) {
            console.error("Error connecting wallet:", err.message);
            alert("Failed to connect wallet. Please try again.");
        }
    };

    useEffect(() => {
        console.log("Wallet Address Updated:", walletAddress);
    }, [walletAddress]);

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
                {/* App Title */}
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

                {/* Navigation and Controls */}
                <HStack spacing={2} alignItems={"center"}>
                    {/* Create Campaign Button */}
                    <Link to="/create">
                        <Button leftIcon={<PlusSquareIcon fontSize={20} />}>
                            Create
                        </Button>
                    </Link>

                    {/* Toggle Light/Dark Mode */}
                    <Button onClick={toggleColorMode}>
                        {colorMode === "light" ? <IoMoon /> : <LuSun />}
                    </Button>

                    {/* Connect Wallet Button */}
                    <Button
                        colorScheme="blue"
                        onClick={handleConnectWallet}
                    >
                        {walletAddress
                            ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                            : "Connect Wallet"}
                    </Button>
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;
