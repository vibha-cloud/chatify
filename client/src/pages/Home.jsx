import React, { useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      navigate("/chats");
    }
  }, [navigate]);
  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="inherit"
        w="100%"
        m="30px 0 15px 0"
        border="2px"
        borderColor="white"
        borderRadius="lg"
      >
        <Text fontSize="4xl">Chatify</Text>
      </Box>
      <Box
        bg="inherit"
        w="100%"
        p={4}
        border="2px"
        borderColor="white"
        borderRadius="lg"
      >
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb="1em">
            <Tab w="50%">Login</Tab>
            <Tab w="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Home;
