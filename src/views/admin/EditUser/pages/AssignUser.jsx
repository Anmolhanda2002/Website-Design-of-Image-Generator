import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Checkbox,
  Heading,
  Spinner,
  useToast,
  Divider,
  SimpleGrid,
  HStack,
  Button,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Input,
  Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import axiosInstance from "utils/AxiosInstance";

export default function AssignUsersPage() {
  const { id } = useParams();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const [assignedUsers, setAssignedUsers] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [assignments, setAssignments] = useState(new Set());
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingUnassigned, setLoadingUnassigned] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");

  const [assignedPage, setAssignedPage] = useState(1);
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [perPage] = useState(10);
  const [totalAssignedPages, setTotalAssignedPages] = useState(1);
  const [totalUnassignedPages, setTotalUnassignedPages] = useState(1);

  // ✅ Fetch Assigned Users
  const fetchAssignedUsers = async () => {
    if (!id) return;
    try {
      setLoadingAssigned(true);
      const res = await axiosInstance.get(
        `/admin_profile_and_search_users/?admin_user_id=${id}&search=${search}&assigned_page=${assignedPage}&per_page=${perPage}`
      );

      const { assigned_users } = res.data;
      setAssignedUsers(assigned_users.results || []);
      setTotalAssignedPages(assigned_users.total_pages || 1);
      setAssignments(
        new Set((assigned_users.results || []).map((u) => u.user_id))
      );
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching assigned users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingAssigned(false);
    }
  };

  // ✅ Fetch Unassigned Users
  const fetchUnassignedUsers = async () => {
    if (!id) return;
    try {
      setLoadingUnassigned(true);
      const res = await axiosInstance.get(
        `/admin_profile_and_search_users/?admin_user_id=${id}&search=${search}&unassigned_page=${unassignedPage}&per_page=${perPage}`
      );

      const { unassigned_users } = res.data;
      setUnassignedUsers(unassigned_users.results || []);
      setTotalUnassignedPages(unassigned_users.total_pages || 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching unassigned users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingUnassigned(false);
    }
  };

  // ✅ Assign / Unassign user
  const handleCheckboxChange = async (userId, isChecked) => {
    try {
      setUpdating(true);
      const endpoint = isChecked
        ? "/assign_user_to_admin/"
        : "/unassign_user_to_admin/";

      await axiosInstance.post(endpoint, { admin_id: id, user_id: userId });

      setAssignments((prev) => {
        const updated = new Set(prev);
        if (isChecked) updated.add(userId);
        else updated.delete(userId);
        return updated;
      });

      toast({
        title: isChecked
          ? "User assigned successfully"
          : "User unassigned successfully",
        status: isChecked ? "success" : "info",
        duration: 2000,
        isClosable: true,
      });

      // Only refresh affected tables
      fetchAssignedUsers();
      fetchUnassignedUsers();
    } catch (err) {
      console.error(err);
      toast({
        title: "Action failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Debounce search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setAssignedPage(1);
      setUnassignedPage(1);
      fetchAssignedUsers();
      fetchUnassignedUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // ✅ Fetch when page changes
  useEffect(() => {
    fetchAssignedUsers();
  }, [assignedPage]);

  useEffect(() => {
    fetchUnassignedUsers();
  }, [unassignedPage]);

  return (
    <Box py={[6, 8, 12]} px={[4, 6, 10]} minH="100vh" bg={pageBg}>
      <VStack spacing={10} maxW="1200px" mx="auto" align="stretch">
        <Heading textAlign="center" color="blue.600" fontSize={["2xl", "3xl", "4xl"]}>
          Assign Users to Admin
        </Heading>

        {/* Search Bar */}
        <InputGroup maxW={["100%", "80%", "50%"]} mx="auto">
          <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.400" />} />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg={cardBg}
            shadow="sm"
            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
          />
        </InputGroup>

        {/* Assigned Users Table */}
        <Box bg={cardBg} p={[4, 6, 8]} borderRadius="2xl" shadow="xl">
          <Text fontSize="xl" fontWeight="700" color="blue.500" mb={4}>
            Assigned Users
          </Text>
          <Divider mb={4} />

          {loadingAssigned ? (
            <Flex justify="center" py={10}>
              <Spinner size="lg" color="blue.500" />
            </Flex>
          ) : assignedUsers.length === 0 ? (
            <Text color={textColor} textAlign="center">No assigned users found.</Text>
          ) : (
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
              {assignedUsers.map((user) => (
                <Checkbox
                  key={user.user_id}
                  isChecked={assignments.has(user.user_id)}
                  onChange={(e) =>
                    handleCheckboxChange(user.user_id, e.target.checked)
                  }
                  size="lg"
                  colorScheme="blue"
                  isDisabled={updating}
                >
                  {user.username}
                </Checkbox>
              ))}
            </SimpleGrid>
          )}

          <HStack justify="center" spacing={4} mt={6}>
            <Button
              onClick={() => setAssignedPage((p) => Math.max(p - 1, 1))}
              isDisabled={assignedPage === 1}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Text>Page {assignedPage} / {totalAssignedPages}</Text>
            <Button
              onClick={() =>
                setAssignedPage((p) => Math.min(p + 1, totalAssignedPages))
              }
              isDisabled={assignedPage === totalAssignedPages}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </HStack>
        </Box>

        {/* Unassigned Users Table */}
        <Box bg={cardBg} p={[4, 6, 8]} borderRadius="2xl" shadow="xl">
          <Text fontSize="xl" fontWeight="700" color="blue.500" mb={4}>
            Unassigned Users
          </Text>
          <Divider mb={4} />

          {loadingUnassigned ? (
            <Flex justify="center" py={10}>
              <Spinner size="lg" color="blue.500" />
            </Flex>
          ) : unassignedUsers.length === 0 ? (
            <Text color={textColor} textAlign="center">No unassigned users found.</Text>
          ) : (
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
              {unassignedUsers.map((user) => (
                <Checkbox
                  key={user.user_id}
                  isChecked={assignments.has(user.user_id)}
                  onChange={(e) =>
                    handleCheckboxChange(user.user_id, e.target.checked)
                  }
                  size="lg"
                  colorScheme="blue"
                  isDisabled={updating}
                >
                  {user.username}
                </Checkbox>
              ))}
            </SimpleGrid>
          )}

          <HStack justify="center" spacing={4} mt={6}>
            <Button
              onClick={() => setUnassignedPage((p) => Math.max(p - 1, 1))}
              isDisabled={unassignedPage === 1}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Text>Page {unassignedPage} / {totalUnassignedPages}</Text>
            <Button
              onClick={() =>
                setUnassignedPage((p) => Math.min(p + 1, totalUnassignedPages))
              }
              isDisabled={unassignedPage === totalUnassignedPages}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
