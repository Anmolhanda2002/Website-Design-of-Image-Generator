'use client';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  IconButton,
  Badge,
  Spinner,
  useColorModeValue,
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import { useSelectedUser } from 'utils/SelectUserContext';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import Swal from 'sweetalert2';
import Card from 'components/card/Card';
import axiosInstance from 'utils/AxiosInstance';
import { useNavigate } from 'react-router-dom';
  import { useColorMode } from "@chakra-ui/react";
export default function GuidelineTable({userId}) {
  console.log("asdf",userId)

const { colorMode } = useColorMode();
const isDark = colorMode === "dark";
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize] = useState(10);
  const [pageIndex] = useState(0);
  const [guidelines, setGuidelines] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('gray.800', 'white');
  const subText = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'navy.800');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const navigate = useNavigate();
  const { selectedUser } = useSelectedUser();
  const prevUserIdRef = useRef(null);
  const searchTimeout = useRef(null);

  // === Fetch Guidelines (with search support) ===
  const fetchGuidelines = useCallback(
    async (search = '') => {
      try {
        setLoading(true);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userId = selectedUser?.user_id || storedUser?.user_id;

        if (!userId) {
          console.warn('⚠️ No valid user_id found.');
          setGuidelines([]);
          return;
        }

        const response = await axiosInstance.get(
          `/list_image_guidelines?user_id=${userId}&search=${encodeURIComponent(search)}`
        );

        if (response.data?.status === 'success') {
          setGuidelines(response.data.results || []);
          setTotalPages(1);
        } else {
          console.warn('Unexpected response:', response.data);
          setGuidelines([]);
        }
      } catch (error) {
        console.error('Error fetching guidelines:', error);
        setGuidelines([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );


      const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedUsers = JSON.parse(localStorage.getItem("selected_user") || "null");
  const activeUserId = selectedUsers?.user_id || user?.user_id;
  // ✅ Fetch when user changes
  useEffect(() => {
    const currentUserId = selectedUser?.user_id;
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const defaultUserId = storedUser?.user_id;

    const effectiveUserId = currentUserId || defaultUserId;

    if (effectiveUserId && effectiveUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = effectiveUserId;
      fetchGuidelines('');
    }
  }, [selectedUser, fetchGuidelines]);

  // ✅ Handle search (with debounce)
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchGuidelines(searchQuery);
    }, 500); // wait 0.5s after typing
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery, fetchGuidelines]);

  // === Delete Guideline ===
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3182CE',
      cancelButtonColor: '#E53E3E',
      confirmButtonText: 'Yes, delete it!',
        background: isDark ? "#14225C" : "#fff",
    color: isDark ? "#fff" : "#000",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.post(`/factory_development_delete_image_guideline/`, {
        guideline_id: id,
        user_id: selectedUser?.user_id,
      });
Swal.fire({
  title: 'Deleted!',
  text: 'The guideline has been deleted.',
  icon: 'success',
  background: isDark ? "#14225C" : "#fff",
  color: isDark ? "#fff" : "#000",
});
      fetchGuidelines(searchQuery);
    } catch (err) {
      console.error(err);
      Swal.fire({
  title: 'Error!',
  text: 'Failed to delete guideline.',
  icon: 'error',
  background: isDark ? "#14225C" : "#fff",
  color: isDark ? "#fff" : "#000",
  confirmButtonColor: isDark ? "#FF4D4D" : "#D33",
});
    }
  };

  // === Activate Guideline ===
  const handleActivate = async (id) => {
    try {
      await axiosInstance.post(`/factory_development_activate_image_guideline/`, {
        user_id: selectedUser?.user_id,
        guideline_id: id,
      });

     Swal.fire({
  title: 'Activated!',
  text: 'The guideline is now active.',
  icon: 'success',
  background: isDark ? "#14225C" : "#fff",
  color: isDark ? "#fff" : "#000",
  confirmButtonColor: isDark ? "#4A6CFF" : "#3085d6",
});

      fetchGuidelines(searchQuery);
    } catch (err) {
      console.error(err);
      Swal.fire({
  title: 'Error!',
  text: 'Failed to activate guideline.',
  icon: 'error',
  background: isDark ? "#14225C" : "#fff",
  color: isDark ? "#fff" : "#000",
  confirmButtonColor: isDark ? "#4A6CFF" : "#d33",
});

    }
  };

  // === Table Columns ===
  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor('guideline_id', {
        header: 'ID',
        cell: (info) => <Text fontSize="sm">{info.getValue()}</Text>,
      }),
      columnHelper.accessor('name', {
        header: 'Guideline Name',
        cell: (info) => (
          <Text fontSize="sm" fontWeight="500">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('is_active', {
        header: 'Status',
        cell: (info) =>
          info.getValue() ? (
            <Badge colorScheme="green" variant="subtle">
              Active
            </Badge>
          ) : (
            <Button
              size="xs"
              colorScheme="green"
              leftIcon={<CheckIcon />}
              onClick={() => handleActivate(info.row.original.guideline_id)}
            >
              Activate
            </Button>
          ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const row = info.row.original;
          return (
            <Flex gap={2}>
              <IconButton
                aria-label="Edit"
                icon={<EditIcon />}
                size="xs"
                variant="outline"
                onClick={() => navigate(`/admin/edit_guideline/${row.guideline_id}`)}
              />
              <IconButton
                aria-label="Delete"
                icon={<DeleteIcon />}
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => handleDelete(row.guideline_id)}
              />
            </Flex>
          );
        },
      }),
    ],
    [navigate]
  );

  const table = useReactTable({
    data: guidelines,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const textcolor = useColorModeValue("black","white")
    const handleAddGuideline = () => navigate(`/admin/add/guidelines/${activeUserId}`);
  // === Render ===
  return (
    <Card w="100%" bg={cardBg} mt="100px" shadow="md" borderRadius="lg" p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Image Guidelines
        </Text>
          <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleAddGuideline}
                  w={{ base: '100%', md: 'auto' }}
                >
                  + Add Guideline
                </Button>
      </Flex>

      <Input
        placeholder="Search guidelines..."
        mb={5}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        color={textcolor}
        _placeholder={{color:textcolor}}
      />

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : (
        <>
          {!isMobile ? (
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            textAlign: 'left',
                            padding: '10px',
                            borderBottom: `2px solid ${borderColor}`,
                            fontWeight: '600',
                            fontSize: '13px',
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} style={{ padding: '10px' }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <SimpleGrid columns={1} spacing={4}>
              {guidelines.length > 0 ? (
                guidelines.map((item) => (
                  <Box
                    key={item.guideline_id}
                    borderWidth="1px"
                    borderRadius="md"
                    p={4}
                    shadow="sm"
                  >
                    <Text fontWeight="bold">{item.name}</Text>
                    <Text fontSize="sm" color={subText} mt={1}>
                      ID: {item.guideline_id}
                    </Text>
                    <Flex justify="space-between" align="center" mt={3}>
                      {item.is_active ? (
                        <Badge colorScheme="green">Active</Badge>
                      ) : (
                        <Button
                          size="xs"
                          colorScheme="green"
                          onClick={() => handleActivate(item.guideline_id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Flex gap={2}>
                        <IconButton
                          aria-label="Edit"
                          icon={<EditIcon />}
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            navigate(`/admin/edit_guideline/${item.guideline_id}`)
                          }
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDelete(item.guideline_id)}
                        />
                      </Flex>
                    </Flex>
                  </Box>
                ))
              ) : (
                <Text textAlign="center" color={subText}>
                  No guidelines found.
                </Text>
              )}
            </SimpleGrid>
          )}
        </>
      )}
    </Card>
  );
}
