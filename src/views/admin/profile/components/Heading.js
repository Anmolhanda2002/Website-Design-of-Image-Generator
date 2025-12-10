import { Text, Box } from "@chakra-ui/react";

const GradientHeading = () => {
  return (
    <Box textAlign="center" mt={10}>
      <Text
        fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
        fontWeight="bold"
      >
        Build Your{" "}
        <Text
          as="span"
          bgGradient="linear(to-r, pink.400, purple.500, blue.400)"
          bgClip="text"
        >
          Ecommerce Catelogue
        </Text>
      </Text>
    </Box>
  );
};

export default GradientHeading;
