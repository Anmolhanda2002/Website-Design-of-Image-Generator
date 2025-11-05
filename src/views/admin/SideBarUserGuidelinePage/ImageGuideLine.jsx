'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  IconButton,
  Select,
  useColorModeValue,
  useBreakpointValue,
  Stack,
  Badge,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons';
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
import { useNavigate, useParams } from 'react-router-dom';

export default function GuidelineTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [guidelines, setGuidelines] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('gray.800', 'white');
  const subText = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const navigate = useNavigate();
  const { id: userIdParam } = useParams();

  // Fetch Guidelines
const fetchGuidelines = async () => {
  try {
    setLoading(true);

    // 🟢 Fetch user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // 🧩 Extract user_id safely
    const userId = storedUser?.user_id;

    if (!userId) {
      console.error("No user_id found in localStorage");
      setLoading(false);
      return;
    }

    // 🔹 API call
    const response = await axiosInstance.get(`/list_image_guidelines?user_id=${userId}`);

    if (response.data.status === "success") {
      setGuidelines(response.data.results || []);
      setTotalPages(1);
    } else {
      console.warn("Unexpected response:", response.data);
    }
  } catch (error) {
    console.error("Error fetching guidelines:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchGuidelines();
  }, []);

  const columnHelper = createColumnHelper();

  // Delete Guideline
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3182CE',
      cancelButtonColor: '#E53E3E',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const api_key = localStorage.getItem('api_key');
          if (!api_key) {
            Swal.fire('Error!', 'API key not found.', 'error');
            return;
          }
          await axiosInstance.post(`/factory_development_delete_image_guideline/`, {
            api_key,
            guideline_id: id,
          });
          Swal.fire('Deleted!', 'The guideline has been deleted.', 'success');
          fetchGuidelines();
        } catch (err) {
          console.error(err);
          Swal.fire('Error!', 'Failed to delete guideline.', 'error');
        }
      }
    });
  };

  // Activate Guideline
  const handleActivate = async (id) => {
    try {
      const api_key = localStorage.getItem('api_key');
      if (!api_key) {
        Swal.fire('Error!', 'API key not found.', 'error');
        return;
      }
      await axiosInstance.post(`/factory_development_activate_image_guideline/`, {
        api_key,
        guideline_id: id,
      });
      Swal.fire('Activated!', 'The guideline is now active.', 'success');
      fetchGuidelines();
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Failed to activate guideline.', 'error');
    }
  };



  // Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('guideline_id', {
        header: 'ID',
        cell: (info) => (
          <Text fontSize="sm" color={textColor}>
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Guideline Name',
        cell: (info) => (
          <Text fontSize="sm" fontWeight="500" color={textColor}>
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
    //   columnHelper.display({
    //     id: 'actions',
    //     header: 'Actions',
    //     cell: (info) => {
    //       const row = info.row.original;
    //       return (
    //         <Flex gap={2}>
    //           <IconButton
    //             aria-label="Edit"
    //             icon={<EditIcon />}
    //             size="xs"
    //             variant="outline"
    //             onClick={() =>
    //               navigate(`/admin/edit_guideline/${row.guideline_id}`)
    //             }
    //           />
    //           <IconButton
    //             aria-label="Delete"
    //             icon={<DeleteIcon />}
    //             size="xs"
    //             colorScheme="red"
    //             variant="outline"
    //             onClick={() => handleDelete(row.guideline_id)}
    //           />
    //         </Flex>
    //       );
    //     },
    //   }),
    ],
    [textColor, navigate]
  );

  const filteredData = useMemo(
    () =>
      guidelines.filter((row) =>
        (row.name?.toLowerCase() || '').includes(globalFilter.toLowerCase())
      ),
    [guidelines, globalFilter]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // --- Render ---
  return (
    <Card w="100%" bg={cardBg} mt={"100px"} shadow="md" borderRadius="lg">
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        mb={4}
        gap={3}
      >
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Guidelines
        </Text>

      </Flex>

      <Input
        placeholder="Search guidelines..."
        mb={5}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" />
        </Flex>
      ) : (
        <>
          {/* ✅ TABLE (Desktop) */}
          {!isMobile ? (
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
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
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
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
            /* ✅ CARD VIEW (Mobile) */
            <SimpleGrid columns={1} spacing={4}>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <Box
                    key={item.guideline_id}
                    borderWidth="1px"
                    borderRadius="md"
                    p={4}
                    shadow="sm"
                  >
                    <Text fontWeight="bold" color={textColor}>
                      {item.name}
                    </Text>
                    <Text fontSize="sm" color={subText} mt={1}>
                      ID: {item.guideline_id}
                    </Text>
                    <Flex justify="space-between" align="center" mt={3}>
                      {item.is_active ? (
                        <Badge colorScheme="green" variant="solid">
                          Active
                        </Badge>
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

          {/* ✅ Pagination */}
       <Flex
  justify="space-between"
  align="center"
  mt={6}
  direction={{ base: 'column', md: 'row' }}
  gap={{ base: 4, md: 3 }}
  w="100%"
>
  {/* Rows per page */}
  <Flex
    align="center"
    justify={{ base: 'center', md: 'flex-start' }}
    gap={2}
    w={{ base: '100%', md: 'auto' }}
  >
    <Text fontSize="sm" whiteSpace="nowrap">
      Rows per page:
    </Text>
    <Select
      w={{ base: '100px', sm: '80px' }}
      size="sm"
      value={pageSize}
      onChange={(e) => setPageSize(Number(e.target.value))}
    >
      {[5, 10, 20, 50].map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </Select>
  </Flex>

  {/* Page navigation */}
  <Flex
    gap={3}
    align="center"
    justify={{ base: 'center', md: 'flex-end' }}
    flexWrap="wrap"
    w={{ base: '100%', md: 'auto' }}
  >
    <Button
      size="sm"
      variant="outline"
      onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
      isDisabled={pageIndex === 0}
      w={{ base: '100px', sm: 'auto' }}
    >
      Previous
    </Button>
    <Text fontSize="sm" minW="90px" textAlign="center">
      Page {pageIndex + 1} of {totalPages}
    </Text>
    <Button
      size="sm"
      variant="outline"
      onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
      isDisabled={pageIndex + 1 === totalPages}
      w={{ base: '100px', sm: 'auto' }}
    >
      Next
    </Button>
  </Flex>
</Flex>

        </>
      )}
    </Card>
  );
}
