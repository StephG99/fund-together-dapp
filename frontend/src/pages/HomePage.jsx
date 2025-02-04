import { Container, SimpleGrid, Text, textDecoration, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCampaignStore } from "../store/campaign";
import CampaignCard from "../components/CampaignCard";

const HomePage = () => {
  const {fetchCampaigns, campaigns} = useCampaignStore();
  
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  console.log("Campaigns", campaigns);

  return (
    <Container>
      <VStack spacing={8}>
        <Text
          fontSize={"30"}
          fontWeight={"bold"}
          textAlign={"center"}
          bgClip={"text"}
          bgGradient={"linear(to-r,cyan.400 , blue.500)"}
          >
          Current Campaigns
        </Text>

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
          }}
          spacing={10}
          w={"full"}
        >
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </SimpleGrid>

        {campaigns.length === 0 && (
          <Text
          fontSize={"xl"}
          fontWeight={"bold"}
          textAlign={"center"}
          color={"gray.500"}
          >
           No Active Campaigns😔
          <Link to={"/create"}>
          <Text as={"span"} color={"blue.500"} _hover={{ textDecoration: "underline" }}>
            Create a new campaign
          </Text>
          
          </Link>
        </Text>
        )}
      </VStack>
    </Container>
  )
}

export default HomePage