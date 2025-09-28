'use client';
import React, { useState, useMemo } from 'react';
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
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import Card from 'components/card/Card';

export default function ComplexTable({ tableData }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('product', {
        header: 'Product Name',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('project', {
        header: 'Project',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: () => (
          <Flex gap={2}>
            <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" />
            <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" colorScheme="red" />
          </Flex>
        ),
      }),
    ],
    []
  );

  // Filter data safely
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      return (
        (row.product?.toLowerCase() || '').includes(globalFilter.toLowerCase()) ||
        (row.role?.toLowerCase() || '').includes(globalFilter.toLowerCase()) ||
        (row.project?.toLowerCase() || '').includes(globalFilter.toLowerCase())
      );
    });
  }, [tableData, globalFilter]);

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
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Products Table
        </Text>
        <Button colorScheme="blue">Add Product</Button>
      </Flex>

      {/* Search */}
      <Input
        placeholder="Search..."
        mb={4}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      {/* Table */}
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
                      padding: '12px',
                      borderBottom: `2px solid ${borderColor}`,
                      fontWeight: 'bold',
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
                  <td key={cell.id} style={{ padding: '12px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* Pagination */}
      <Flex justify="space-between" align="center" mt={4}>
        <Flex align="center" gap={2}>
          <Text>Rows per page:</Text>
          <Select
            w="80px"
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
          <Text>
            Page {pageIndex + 1} of {table.getPageCount()}
          </Text>
          <Button
            size="sm"
            onClick={() => setPageIndex(Math.min(table.getPageCount() - 1, pageIndex + 1))}
            isDisabled={pageIndex + 1 === table.getPageCount()}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
