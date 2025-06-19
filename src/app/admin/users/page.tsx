'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../../../contexts/AdminContext';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

interface User {
  id: string;
  userName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'vendor' | 'event_planner';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  profileImage?: string;
}

export default function UserManagement() {
  const { getUsers, updateUserStatus, deleteUser, loading } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch users from admin API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        if (response?.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data if API fails
        const mockUsers: User[] = [
          {
            id: '1',
            userName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            role: 'user',
            status: 'active',
            createdAt: '2024-01-15',
            lastLogin: '2024-01-20',
          },
          {
            id: '2',
            userName: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1234567891',
            role: 'vendor',
            status: 'active',
            createdAt: '2024-01-10',
            lastLogin: '2024-01-19',
          },
          {
            id: '3',
            userName: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            phone: '+1234567892',
            role: 'event_planner',
            status: 'inactive',
            createdAt: '2024-01-05',
            lastLogin: '2024-01-15',
          },
          {
            id: '4',
            userName: 'Alice Brown',
            email: 'alice.brown@example.com',
            phone: '+1234567893',
            role: 'user',
            status: 'suspended',
            createdAt: '2024-01-01',
            lastLogin: '2024-01-10',
          },
        ];
        setUsers(mockUsers);
      }
    };

    fetchUsers();
  }, [getUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'vendor': return 'bg-blue-100 text-blue-800';
      case 'event_planner': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'delete') {
        await deleteUser(userId);
        // Refresh users list
        const response = await getUsers();
        if (response?.data) {
          setUsers(response.data);
        }
      } else if (action === 'edit') {
        // Handle edit action
        console.log(`Edit user ${userId}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts, permissions, and status
            </p>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Add New User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="vendor">Vendor</option>
            <option value="event_planner">Event Planner</option>
            <option value="admin">Admin</option>
          </select>
          
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'edit')}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {selectedUser.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedUser.userName}
                    </h4>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 