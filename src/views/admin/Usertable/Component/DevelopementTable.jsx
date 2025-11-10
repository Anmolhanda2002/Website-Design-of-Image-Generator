'use client';
import React, { useEffect, useState, useCallback } from 'react';
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
import Swal from 'sweetalert2';
import Card from 'components/card/Card';
import axiosInstance from 'utils/AxiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';

export default function UsersTable({ type = 'user' }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial page from URL
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get('page')) || 1;

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // ✅ Fetch users or admins (from backend, with search param)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const pageParam = type === 'user' ? 'user_page' : 'admin_page';

      const response = await axiosInstance.get('/view_all_accounts/', {
        params: {
          [pageParam]: pageIndex,
          per_page: pageSize,
          search: globalFilter.trim(), // ✅ Pass search term to backend
        },
      });

      if (response.data.status === 'success') {
        const results =
          type === 'user'
            ? response.data.users.results
            : response.data.admins.results;
        const total =
          type === 'user'
            ? response.data.users.total_pages
            : response.data.admins.total_pages;

        setUsers(results || []);
        setTotalPages(total || 1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, type, globalFilter]);

  // ✅ Run on mount or when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Debounce search (wait 500ms before triggering)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delay);
  }, [globalFilter]);

  // ✅ Delete user/admin
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
          await axiosInstance.delete('/factory_development/delete/', {
            data: { user_id: id },
          });
          Swal.fire('Deleted!', 'The account has been deleted.', 'success');
          fetchUsers();
        } catch (err) {
          console.error('Delete error:', err);
          Swal.fire('Error!', 'Failed to delete the account.', 'error');
        }
      }
    });
  };

  // ✅ Add user/admin
  const handleAddUser = () => {
    Swal.fire({
      title: `Add New ${type === 'user' ? 'User' : 'Admin'}`,
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
          const url = type === 'user' ? '/add_user/' : '/add_admin/';
          await axiosInstance.post(url, result.value);
          Swal.fire(
            'Success!',
            `${type === 'user' ? 'User' : 'Admin'} added successfully.`,
            'success'
          );
          setPageIndex(1);
          fetchUsers();
        } catch (err) {
          Swal.fire(
            'Error!',
            `Failed to add ${type === 'user' ? 'user' : 'admin'}.`,
            'error'
          );
        }
      }
    });
  };

  // ✅ Edit navigation
  const handleEdit = (id) => {
    navigate(`/admin/edit_user/${id}?page=${pageIndex}`);
  };

  return (
    <Card w="100%" p={5}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          {type === 'user' ? 'Users Table' : 'Admins Table'}
        </Text>
        <Button size="sm" colorScheme="blue" onClick={handleAddUser}>
          + Add {type === 'user' ? 'User' : 'Admin'}
        </Button>
      </Flex>

      {/* Search */}
      <Input
        placeholder={`Search ${type === 'user' ? 'users' : 'admins'} by username or email...`}
        mb={4}
        value={globalFilter}
        onChange={(e) => {
          setGlobalFilter(e.target.value);
          setPageIndex(1); // reset to first page when searching
        }}
      />

      {/* Table */}
      <Box overflowX="auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}` }}>
                Username / Email
              </th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}` }}>
                Created
              </th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: `2px solid ${borderColor}` }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  <Text>Loading...</Text>
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((row) => (
                <tr key={row.user_id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '10px' }}>
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
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(row.created_at).toLocaleString()}
                    </Text>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Flex gap={2}>
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size="xs"
                        variant="outline"
                        onClick={() => handleEdit(row.user_id)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDelete(row.user_id)}
                      />
                    </Flex>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  <Text>No records found.</Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      {/* Pagination */}
      <Flex justify="space-between" align="center" mt={4}>
        <Flex align="center" gap={2}>
          <Text fontSize="sm">Rows per page:</Text>
          <Select
            w="80px"
            size="sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(1);
            }}
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
            onClick={() => setPageIndex(Math.max(1, pageIndex - 1))}
            isDisabled={pageIndex === 1}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {pageIndex} of {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() => setPageIndex(Math.min(totalPages, pageIndex + 1))}
            isDisabled={pageIndex === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
