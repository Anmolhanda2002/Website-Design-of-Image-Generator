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
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance"; // Your configured Axios instance

export default function AssignUsersPage() {
  const toast = useToast();

  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Pagination states
  const [adminPage, setAdminPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [perPage] = useState(10); // items per page
  const [totalAdminPages, setTotalAdminPages] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);

  // Fetch accounts with pagination
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/view_all_accounts/?user_page=${userPage}&admin_page=${adminPage}&per_page=${perPage}`
      );

      setAdmins(res.data.admins.results);
      setUsers(res.data.users.results);
      setTotalAdminPages(res.data.admins.total_pages);
      setTotalUserPages(res.data.users.total_pages);

      // Initialize assignment map if not exists
      const initialAssignments = {};
      res.data.admins.results.forEach((admin) => {
        if (!assignments[admin.user_id]) initialAssignments[admin.user_id] = new Set();
        else initialAssignments[admin.user_id] = assignments[admin.user_id];
      });
      setAssignments(initialAssignments);

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching accounts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPage, userPage]);

  const handleCheckboxChange = async (adminId, userId, isChecked) => {
    try {
      setUpdating(true);
      if (isChecked) {
        await axiosInstance.post("/assign_user_to_admin/", { admin_id: adminId, user_id: userId });
        setAssignments((prev) => {
          const updated = { ...prev };
          updated[adminId].add(userId);
          return updated;
        });
        toast({ title: "User assigned", status: "success", duration: 2000, isClosable: true });
      } else {
        await axiosInstance.post("/unassign_user_to_admin/", { admin_id: adminId, user_id: userId });
        setAssignments((prev) => {
          const updated = { ...prev };
          updated[adminId].delete(userId);
          return updated;
        });
        toast({ title: "User unassigned", status: "info", duration: 2000, isClosable: true });
      }
      setUpdating(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Action failed", status: "error", duration: 3000, isClosable: true });
      setUpdating(false);
    }
  };

  const cardBg = useColorModeValue("white", "gray.800");

  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box py={[8, 10, 16]} px={[4, 6, 10]} minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <VStack spacing={10} maxW="1200px" mx="auto" align="stretch">
        <Heading textAlign="center" color="blue.600" size="xl" mb={8}>
          Assign Users to Admins
        </Heading>

        {admins.map((admin) => (
          <Box key={admin.user_id} bg={cardBg} p={6} borderRadius="2xl" shadow="lg">
            <Text fontSize="lg" fontWeight="600" color="blue.500">
              {admin.username} ({admin.email})
            </Text>
            <Divider my={4} />
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
              {users.map((user) => (
                <Checkbox
                  key={user.user_id}
                  isChecked={assignments[admin.user_id]?.has(user.user_id)}
                  onChange={(e) =>
                    handleCheckboxChange(admin.user_id, user.user_id, e.target.checked)
                  }
                  size="lg"
                  colorScheme="blue"
                  isDisabled={updating}
                >
                  {user.username}
                </Checkbox>
              ))}
            </SimpleGrid>
          </Box>
        ))}

        {/* Pagination */}
        <HStack justify="center" spacing={4} mt={4}>
          <Button
            onClick={() => setAdminPage((p) => Math.max(p - 1, 1))}
            isDisabled={adminPage === 1}
          >
            Previous Admins
          </Button>
          <Text>
            Admin Page {adminPage} / {totalAdminPages}
          </Text>
          <Button
            onClick={() => setAdminPage((p) => Math.min(p + 1, totalAdminPages))}
            isDisabled={adminPage === totalAdminPages}
          >
            Next Admins
          </Button>
        </HStack>

        <HStack justify="center" spacing={4} mt={2}>
          <Button
            onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
            isDisabled={userPage === 1}
          >
            Previous Users
          </Button>
          <Text>
            User Page {userPage} / {totalUserPages}
          </Text>
          <Button
            onClick={() => setUserPage((p) => Math.min(p + 1, totalUserPages))}
            isDisabled={userPage === totalUserPages}
          >
            Next Users
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
