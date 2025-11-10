'use client';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  IconButton,
  Spinner,
  useColorModeValue,
  useBreakpointValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import Swal from 'sweetalert2';
import Card from 'components/card/Card';
import axiosInstance from 'utils/AxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useSelectedUser } from 'utils/SelectUserContext';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';

export default function VideoGuidelineTable() {
  const [guidelines, setGuidelines] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { selectedUser } = useSelectedUser();
  const prevUserIdRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // ✅ Fetch video guidelines from backend (with search)
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

        // ✅ Server-side search
        const response = await axiosInstance.get('/list_video_guidelines/', {
          params: {
            user_id: userId,
            search: search, // backend search query
            limit: 50,
            page: 1,
          },
        });

        if (response.data?.status === 'success') {
          const data = Array.isArray(response.data.results)
            ? response.data.results
            : Array.isArray(response.data)
            ? response.data
            : [];
          setGuidelines(data);
          setTotalPages(1);
        } else {
          console.warn('Unexpected response:', response.data);
          setGuidelines([]);
        }
      } catch (error) {
        console.error('Error fetching video guidelines:', error);
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  // ✅ Run when user changes
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

  // ✅ Search input with debounce (server call)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      fetchGuidelines(globalFilter.trim());
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [globalFilter, fetchGuidelines]);

  // ✅ Delete Guideline
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3182ce',
      cancelButtonColor: '#e53e3e',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.post(`/factory_development_delete_video_guideline/`, {
        guideline_id: id,
        user_id: selectedUser?.user_id,
      });
      Swal.fire('Deleted!', 'The guideline has been deleted.', 'success');
      fetchGuidelines(globalFilter);
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Failed to delete the guideline.', 'error');
    }
  };

  // ✅ Set Default Guideline
  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.post(`/factory_development_activate_video_guideline/`, {
        user_id: selectedUser?.user_id,
        guideline_id: id,
      });
      Swal.fire('Success!', 'This guideline is now set as default.', 'success');
      fetchGuidelines(globalFilter);
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Failed to set the guideline as default.', 'error');
    }
  };

  // ✅ Add new guideline
  const handleAddGuideline = () => {
    navigate('/admin/add/videoguidelines');
  };

  // ✅ Table setup
  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor('guideline_id', {
        header: 'ID',
        cell: (info) => <Text fontSize="sm">{info.getValue()}</Text>,
      }),
      columnHelper.accessor('guideline_name', {
        header: 'Guideline Name',
        cell: (info) => (
          <Text fontSize="sm" fontWeight="500">
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('is_default', {
        header: 'Default',
        cell: (info) => {
          const isDefault = info.getValue();
          const row = info.row.original;
          return isDefault ? (
            <Text color="green.500" fontWeight="bold">
              Default
            </Text>
          ) : (
            <Button
              size="xs"
              colorScheme="green"
              leftIcon={<CheckIcon />}
              onClick={() => handleSetDefault(row.guideline_id)}
            >
              Set Default
            </Button>
          );
        },
      }),
      // columnHelper.display({
      //   id: 'actions',
      //   header: 'Actions',
      //   cell: (info) => {
      //     const row = info.row.original;
      //     return (
      //       <Flex gap={2}>
      //         <IconButton
      //           aria-label="Edit"
      //           icon={<EditIcon />}
      //           size="xs"
      //           variant="outline"
      //           onClick={() => navigate(`/admin/edit/videoguideline/${row.guideline_id}`)}
      //         />
      //         <IconButton
      //           aria-label="Delete"
      //           icon={<DeleteIcon />}
      //           size="xs"
      //           colorScheme="red"
      //           variant="outline"
      //           onClick={() => handleDelete(row.guideline_id)}
      //         />
      //       </Flex>
      //     );
      //   },
      // }),
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

  // ✅ UI
  return (
    <Card w="100%" p={5} mt="100px" bg={cardBg} boxShadow="md" borderRadius="xl">
      <Flex justify="space-between" align="center" mb={5}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Video Guidelines
        </Text>

      </Flex>

      <Input
        placeholder="Search guidelines..."
        mb={4}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={cardBg}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th key={header.id} fontSize="sm">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id} _hover={{ bg: borderColor }}>
                  {row.getVisibleCells().map((cell) => (
                    <Td key={cell.id} fontSize="sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}
              {guidelines.length === 0 && !loading && (
                <Tr>
                  <Td colSpan={columns.length}>
                    <Text textAlign="center" color="gray.500">
                      No guidelines found.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </Card>
  );
}
