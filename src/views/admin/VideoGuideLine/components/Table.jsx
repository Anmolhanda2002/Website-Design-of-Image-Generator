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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const navigate = useNavigate();
  const { id: userIdParam } = useParams();

  console.log(userIdParam)
  const fetchGuidelines = async () => {
    try {
      const response = await axiosInstance.get(`/list_video_guidelines/?user_id=${userIdParam}`);
      if (response.data.status === 'success') {
        setGuidelines(response.data.results || []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching guidelines:', error);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const columnHelper = createColumnHelper();

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3182ce',
      cancelButtonColor: '#e53e3e',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.post(`/factory_development_delete_video_guideline/`, { guideline_id: id,user_id:userIdParam });
          Swal.fire('Deleted!', 'The guideline has been deleted.', 'success');
          fetchGuidelines();
        } catch (err) {
          console.error(err);
          Swal.fire('Error!', 'Failed to delete the guideline.', 'error');
        }
      }
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.post(`/factory_development_activate_video_guideline/`, { guideline_id: id,user_id:userIdParam });
      Swal.fire('Success!', 'This guideline is now set as default.', 'success');
      fetchGuidelines();
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Failed to set the guideline as default.', 'error');
    }
  };

  const handleAddGuideline = () => {
    navigate(`/admin/add/videoguidelines/${userIdParam}`);
  };

  const handleEditPage =(guidleline)=>{
navigate(`/admin/edit/videoguidelines/${guidleline}?user_id=${userIdParam}`)
  }

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
                onClick={() => handleEditPage(row.guideline_id)}
              />
              <IconButton
                aria-label="Delete"
                icon={<DeleteIcon />}
                size="xs"
                colorScheme="red"
                onClick={() => handleDelete(row.guideline_id)}
              />
            </Flex>
          );
        },
      }),
    ],
    [navigate]
  );

  const filteredData = useMemo(
    () =>
      guidelines.filter((row) =>
        (row.guideline_name?.toLowerCase() || '').includes(globalFilter.toLowerCase())
      ),
    [guidelines, globalFilter]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Card w="100%" p={5}  mt={"-100px"} boxShadow="md" borderRadius="xl">
      <Flex
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        mb={5}
        gap={3}
      >
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Video Guidelines
        </Text>
        <Button colorScheme="blue" onClick={handleAddGuideline} w={{ base: '100%', md: 'auto' }}>
          + Add Guideline
        </Button>
      </Flex>

      <Input
        placeholder="Search guidelines..."
        mb={4}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        size="md"
      />

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg={useColorModeValue('gray.100', 'gray.700')}>
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
          </Tbody>
        </Table>
      </Box>

      {/* Responsive Pagination */}
      <Flex
        justify="space-between"
        align="center"
        mt={6}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 3 }}
      >
        <Flex align="center" justify={{ base: 'center', md: 'flex-start' }} gap={2}>
          <Text fontSize="sm">Rows per page:</Text>
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

        <Flex gap={3} align="center" justify={{ base: 'center', md: 'flex-end' }} flexWrap="wrap">
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
    </Card>
  );
}
