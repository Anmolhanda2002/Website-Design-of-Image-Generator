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
  Input,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import axiosInstance from "utils/AxiosInstance";

export default function AssignUsersPage(adminid) {

    console.log(adminid.adminid)
  // ✅ Get adminId from URL params
  const { id: adminId } = useParams(); 
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  const [assignedUsers, setAssignedUsers] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [assignments, setAssignments] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");

  const [assignedPage, setAssignedPage] = useState(1);
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [perPage] = useState(10);
  const [totalAssignedPages, setTotalAssignedPages] = useState(1);
  const [totalUnassignedPages, setTotalUnassignedPages] = useState(1);

  // ✅ Fetch users for this admin
  const fetchUsers = async () => {
    if (!adminId) return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/admin_profile_and_search_users/?admin_user_id=${adminid.adminid}&search=${search}&assigned_page=${assignedPage}&unassigned_page=${unassignedPage}&per_page=${perPage}`
      );

      const { assigned_users, unassigned_users } = res.data;

      setAssignedUsers(assigned_users.results || []);
      setUnassignedUsers(unassigned_users.results || []);
      setTotalAssignedPages(assigned_users.total_pages || 1);
      setTotalUnassignedPages(unassigned_users.total_pages || 1);

      setAssignments(new Set((assigned_users.results || []).map((u) => u.user_id)));
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId, search, assignedPage, unassignedPage]);

  // ✅ Assign / Unassign user
  const handleCheckboxChange = async (userId, isChecked) => {
    try {
      setUpdating(true);
      const endpoint = isChecked
        ? "/assign_user_to_admin/"
        : "/unassign_user_to_admin/";

      await axiosInstance.post(endpoint, { admin_id: adminId, user_id: userId });

      setAssignments((prev) => {
        const updated = new Set(prev);
        if (isChecked) updated.add(userId);
        else updated.delete(userId);
        return updated;
      });

      toast({
        title: isChecked ? "User assigned" : "User unassigned",
        status: isChecked ? "success" : "info",
        duration: 2000,
        isClosable: true,
      });

      fetchUsers();
      setUpdating(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Action failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box py={[8, 10, 16]} px={[4, 6, 10]} minH="100vh" bg={pageBg}>
      <VStack spacing={10} maxW="1200px" mx="auto" align="stretch">
        <Heading textAlign="center" color="blue.600" size="xl" mb={8}>
          Assign Users to Admin
        </Heading>

        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb={4}
        />

        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="lg">
          <Text fontSize="lg" fontWeight="600" color="blue.500">
            Assigned Users
          </Text>
          <Divider my={4} />
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

          <HStack justify="center" spacing={4} mt={4}>
            <Button
              onClick={() => setAssignedPage((p) => Math.max(p - 1, 1))}
              isDisabled={assignedPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {assignedPage} / {totalAssignedPages}
            </Text>
            <Button
              onClick={() =>
                setAssignedPage((p) => Math.min(p + 1, totalAssignedPages))
              }
              isDisabled={assignedPage === totalAssignedPages}
            >
              Next
            </Button>
          </HStack>
        </Box>

        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="lg">
          <Text fontSize="lg" fontWeight="600" color="blue.500">
            Unassigned Users
          </Text>
          <Divider my={4} />
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

          <HStack justify="center" spacing={4} mt={4}>
            <Button
              onClick={() => setUnassignedPage((p) => Math.max(p - 1, 1))}
              isDisabled={unassignedPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {unassignedPage} / {totalUnassignedPages}
            </Text>
            <Button
              onClick={() =>
                setUnassignedPage((p) => Math.min(p + 1, totalUnassignedPages))
              }
              isDisabled={unassignedPage === totalUnassignedPages}
            >
              Next
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
