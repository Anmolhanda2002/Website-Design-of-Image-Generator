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
  Circle,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table';
import Swal from 'sweetalert2';
import Card from 'components/card/Card';
import axiosInstance from 'utils/AxiosInstance';
import { useNavigate } from 'react-router-dom';
import { MdPersonAddAlt1 } from "react-icons/md"
export default function AdminTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const navigate = useNavigate();

  // Fetch admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axiosInstance.get(
          `/view_all_accounts/?admin_page=${pageIndex + 1}&per_page=${pageSize}`
        );

        if (response.data.status === 'success') {
          setAdmins(response.data.admins.results || []);
          setTotalPages(response.data.admins.total_pages || 1);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };
    fetchAdmins();
  }, [pageIndex, pageSize]);

  const columnHelper = createColumnHelper();

 const handleDelete = async (id) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        console.log("Deleting user:", id);

        // ✅ Use DELETE method and send body via 'data'
        await axiosInstance.delete("/factory_development/delete/", {
          data: { user_id: id },
        });

        Swal.fire("Deleted!", "The account has been deleted.", "success");

        // ✅ Optionally update your UI list (if needed)
        // setUsers((prev) => prev.filter((user) => user.user_id !== id));

      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error!", "Failed to delete the account.", "error");
      }
    }
  });
};



  const handleAddAdmin = () => {
    Swal.fire({
      title: 'Add New Admin',
      html: `
        <input type="text" id="username" class="swal2-input" placeholder="Username">
        <input type="email" id="email" class="swal2-input" placeholder="Email">
        <input type="password" id="password" class="swal2-input" placeholder="Password">
      `,
      confirmButtonText: 'Add',
      showCancelButton: true,
      preConfirm: () => {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!username || !email || !password) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return { username, email, password };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.post('/add_admin/', result.value);
          Swal.fire('Success!', 'Admin added successfully.', 'success');
          setPageIndex(0); // refresh from first page
        } catch (err) {
          Swal.fire('Error!', 'Failed to add admin.', 'error');
        }
      }
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Username / Email',
        cell: (info) => {
          const row = info.row.original;
          return (
            <Flex align="center" gap={3}>
              <Circle size="10px" bg={row.is_approved ? 'green.400' : 'gray.300'} />
              <Flex direction="column">
                <Text fontSize="sm" fontWeight="500" color={textColor}>
                  {row.username}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {row.email}
                </Text>
              </Flex>
            </Flex>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: (info) => (
          <Text fontSize="xs" color="gray.500">
            {new Date(info.getValue()).toLocaleString() || '-'}
          </Text>
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
                aria-label="Assign User"
                icon={<MdPersonAddAlt1 />}
                size="xs"
                variant="outline"
                onClick={() => navigate(`/admin/assign_user/${row.user_id}`)}
              />
              <IconButton
                aria-label="Edit"
                icon={<EditIcon />}
                size="xs"
                variant="outline"
                onClick={() => navigate(`/admin/edit_user/${row.user_id}`)}
              />
              <IconButton
                aria-label="Delete"
                icon={<DeleteIcon />}
                size="xs"
                colorScheme="red"
                onClick={() => handleDelete(row.user_id)}
              />
            </Flex>
          );
        },
      }),
    ],
    [textColor, navigate]
  );

  const filteredData = useMemo(() => {
    return admins.filter((row) => {
      return (
        (row.username?.toLowerCase() || '').includes(globalFilter.toLowerCase()) ||
        (row.email?.toLowerCase() || '').includes(globalFilter.toLowerCase())
      );
    });
  }, [admins, globalFilter]);

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
          Admins Table
        </Text>
        <Button size="sm" colorScheme="blue" onClick={handleAddAdmin}>
          + Add Admin
        </Button>
      </Flex>

      <Input
        placeholder="Search admins by username or email..."
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
