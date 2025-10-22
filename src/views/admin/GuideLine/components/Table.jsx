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
import { useNavigate } from 'react-router-dom';

export default function GuidelineTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [guidelines, setGuidelines] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();

  // Fetch Guidelines
  const fetchGuidelines = async () => {
    try {
      const response = await axiosInstance.get(`/list_image_guidelines`);
      if (response.data.status === 'success') {
        setGuidelines(response.data.results || []);
        setTotalPages(1); // backend doesn’t support pagination yet
      }
    } catch (error) {
      console.error('Error fetching guidelines:', error);
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
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const api_key = localStorage.getItem('api_key');
          if (!api_key) {
            Swal.fire('Error!', 'API key not found in local storage.', 'error');
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
          Swal.fire('Error!', 'Failed to delete the guideline.', 'error');
        }
      }
    });
  };

  // Activate Guideline
  const handleActivate = async (id) => {
    try {
      const api_key = localStorage.getItem('api_key');
      if (!api_key) {
        Swal.fire('Error!', 'API key not found in local storage.', 'error');
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
      Swal.fire('Error!', 'Failed to activate the guideline.', 'error');
    }
  };

  // Add Guideline
  const handleAddGuideline = () => {
    navigate('/admin/add/guidelines');
  };

  // Define Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('guideline_id', {
        header: 'ID',
        cell: (info) => <Text fontSize="sm" color={textColor}>{info.getValue()}</Text>,
      }),
      columnHelper.accessor('name', {
        header: 'Guideline Name',
        cell: (info) => <Text fontSize="sm" fontWeight="500" color={textColor}>{info.getValue()}</Text>,
      }),
      columnHelper.accessor('is_active', {
        header: 'Status',
        cell: (info) => {
          const isActive = info.getValue();
          return isActive ? (
            <Text color="green.500" fontWeight="bold">Active</Text>
          ) : (
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<CheckIcon />}
              onClick={() => handleActivate(info.row.original.guideline_id)}
            >
              Activate
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
                onClick={() => navigate(`/admin/edit_guideline/${row.guideline_id}`)}
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
    [textColor, navigate]
  );

  const filteredData = useMemo(() => {
    return guidelines.filter((row) =>
      (row.name?.toLowerCase() || '').includes(globalFilter.toLowerCase())
    );
  }, [guidelines, globalFilter]);

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

  return (
    <Card w="100%" p={5}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Guidelines Table
        </Text>
        <Button size="sm" colorScheme="blue" onClick={handleAddGuideline}>
          + Add Guideline
        </Button>
      </Flex>

      <Input
        placeholder="Search guidelines..."
        mb={4}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

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
                      fontWeight: 'bold',
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

      <Flex justify="space-between" align="center" mt={4}>
        <Flex align="center" gap={2}>
          <Text fontSize="sm">Rows per page:</Text>
          <Select
            w="80px"
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
        <Flex gap={2} align="center">
          <Button
            size="sm"
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            isDisabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {pageIndex + 1} of {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
            isDisabled={pageIndex + 1 === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
