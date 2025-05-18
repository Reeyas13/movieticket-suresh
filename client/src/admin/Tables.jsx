import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import DataTable from './tables/DataTable';

const Tables = () => {
  // Sample data for users table
  const usersColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { 
      key: 'avatar', 
      label: 'User', 
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center">
          <img 
            src={row.avatar} 
            alt={row.name} 
            className="h-10 w-10 rounded-full mr-3"
          />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-gray-500 text-sm">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (role) => (
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium 
          ${role === 'Admin' 
            ? 'bg-red-100 text-red-800' 
            : role === 'Manager' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }
        `}>
          {role}
        </span>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (status) => (
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
          ${status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : status === 'Inactive' 
              ? 'bg-gray-100 text-gray-800' 
              : 'bg-yellow-100 text-yellow-800'
          }
        `}>
          <span className={`
            h-1.5 w-1.5 mr-1.5 rounded-full 
            ${status === 'Active' 
              ? 'bg-green-600' 
              : status === 'Inactive' 
                ? 'bg-gray-600' 
                : 'bg-yellow-600'
            }
          `}></span>
          {status}
        </span>
      )
    },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false,
      render: () => (
        <div className="flex space-x-2">
          <Button size="sm" variant="info" icon="fas fa-eye">View</Button>
          <Button size="sm" variant="warning" icon="fas fa-edit">Edit</Button>
          <Button size="sm" variant="danger" icon="fas fa-trash">Delete</Button>
        </div>
      )
    },
  ];

  const usersData = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      role: 'Admin', 
      department: 'IT', 
      status: 'Active', 
      lastLogin: '2 mins ago',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg' 
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      role: 'Manager', 
      department: 'Marketing', 
      status: 'Active', 
      lastLogin: '1 hour ago',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg' 
    },
    { 
      id: 3, 
      name: 'Robert Johnson', 
      email: 'robert@example.com', 
      role: 'User', 
      department: 'Finance', 
      status: 'Inactive', 
      lastLogin: '5 days ago',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg' 
    },
    { 
      id: 4, 
      name: 'Emily Davis', 
      email: 'emily@example.com', 
      role: 'User', 
      department: 'HR', 
      status: 'Active', 
      lastLogin: '3 hours ago',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg' 
    },
    { 
      id: 5, 
      name: 'Michael Brown', 
      email: 'michael@example.com', 
      role: 'Manager', 
      department: 'Operations', 
      status: 'Pending', 
      lastLogin: '2 days ago',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg' 
    },
    { 
      id: 6, 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      role: 'User', 
      department: 'Sales', 
      status: 'Active', 
      lastLogin: '4 hours ago',
      avatar: 'https://randomuser.me/api/portraits/women/6.jpg' 
    },
    { 
      id: 7, 
      name: 'James Taylor', 
      email: 'james@example.com', 
      role: 'Admin', 
      department: 'IT', 
      status: 'Active', 
      lastLogin: '1 hour ago',
      avatar: 'https://randomuser.me/api/portraits/men/7.jpg' 
    },
    { 
      id: 8, 
      name: 'Patricia Martinez', 
      email: 'patricia@example.com', 
      role: 'User', 
      department: 'Customer Support', 
      status: 'Inactive', 
      lastLogin: '1 week ago',
      avatar: 'https://randomuser.me/api/portraits/women/8.jpg' 
    },
  ];
  
  // Sample data for products table
  const productsColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { 
      key: 'product', 
      label: 'Product', 
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-md bg-gray-200 mr-3 flex items-center justify-center">
            <i className={`${row.icon} text-gray-600`}></i>
          </div>
          <div className="font-medium">{row.name}</div>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { 
      key: 'stock', 
      label: 'Stock', 
      sortable: true,
      render: (stock) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div 
              className={`h-2.5 rounded-full ${
                stock > 50 ? 'bg-green-600' : stock > 20 ? 'bg-yellow-400' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(stock, 100)}%` }}
            ></div>
          </div>
          <span>{stock}</span>
        </div>
      )
    },
    { key: 'created', label: 'Created', sortable: true },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false,
      render: () => (
        <div className="flex space-x-2">
          <Button size="sm" variant="info" icon="fas fa-eye">View</Button>
          <Button size="sm" variant="warning" icon="fas fa-edit">Edit</Button>
          <Button size="sm" variant="danger" icon="fas fa-trash">Delete</Button>
        </div>
      )
    },
  ];
  
  const productsData = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: '$1,299.99', stock: 45, created: '10/12/2023', icon: 'fas fa-laptop' },
    { id: 2, name: 'Wireless Headphones', category: 'Electronics', price: '$149.99', stock: 78, created: '15/11/2023', icon: 'fas fa-headphones' },
    { id: 3, name: 'Office Chair', category: 'Furniture', price: '$249.99', stock: 12, created: '05/01/2024', icon: 'fas fa-chair' },
    { id: 4, name: 'Coffee Maker', category: 'Appliances', price: '$89.99', stock: 30, created: '20/02/2024', icon: 'fas fa-mug-hot' },
    { id: 5, name: 'Running Shoes', category: 'Clothing', price: '$129.99', stock: 52, created: '12/03/2024', icon: 'fas fa-shoe-prints' },
    { id: 6, name: 'Smartphone', category: 'Electronics', price: '$899.99', stock: 23, created: '18/01/2024', icon: 'fas fa-mobile-alt' },
    { id: 7, name: 'Desk Lamp', category: 'Home Decor', price: '$49.99', stock: 67, created: '25/02/2024', icon: 'fas fa-lightbulb' },
    { id: 8, name: 'Backpack', category: 'Accessories', price: '$79.99', stock: 41, created: '03/03/2024', icon: 'fas fa-backpack' },
    { id: 9, name: 'Water Bottle', category: 'Accessories', price: '$24.99', stock: 95, created: '28/02/2024', icon: 'fas fa-bottle-water' },
    { id: 10, name: 'Wireless Mouse', category: 'Electronics', price: '$59.99', stock: 18, created: '10/01/2024', icon: 'fas fa-mouse' },
  ];
  
  // Simple table data
  const simpleColumns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
  ];
  
  const simpleData = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    { id: 3, firstName: 'Robert', lastName: 'Johnson', email: 'robert@example.com' },
    { id: 4, firstName: 'Emily', lastName: 'Davis', email: 'emily@example.com' },
    { id: 5, firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tables</h1>
        <div>
          <Button variant="primary" icon="fas fa-plus">
            Add New
          </Button>
        </div>
      </div>
      
      {/* Users Table */}
      <Card title="Users Table" collapsible>
        <div className="mb-4">
          <p className="text-gray-600">
            A comprehensive table displaying user information with sortable columns, search functionality, and pagination.
          </p>
        </div>
        <DataTable 
          columns={usersColumns}
          data={usersData}
          pagination
          searchable
          striped
          hover
        />
      </Card>
      
      {/* Products Table */}
      <Card title="Products Table" collapsible>
        <div className="mb-4">
          <p className="text-gray-600">
            An interactive table for managing product inventory with visual indicators for stock levels.
          </p>
        </div>
        <DataTable 
          columns={productsColumns}
          data={productsData}
          pagination
          searchable
          striped
          hover
        />
      </Card>
      
      {/* Simple Table */}
      <Card title="Simple Table" collapsible>
        <div className="mb-4">
          <p className="text-gray-600">
            A basic table implementation with minimal features.
          </p>
        </div>
        <DataTable 
          columns={simpleColumns}
          data={simpleData}
          pagination={false}
          searchable={false}
          striped
          hover
          compact
        />
      </Card>
      
      {/* Table Styles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Bordered Table" collapsible>
          <div className="responsive-table-container">
            <table className="responsive-table border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">Tiger Nixon</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">System Architect</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">Edinburgh</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">$320,800</div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">Garrett Winters</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">Accountant</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">Tokyo</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">$170,750</div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">Ashton Cox</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">Junior Technical Author</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">San Francisco</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="text-sm text-gray-500">$86,000</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        
        <Card title="Striped Table" collapsible>
          <div className="responsive-table-container">
            <table className="responsive-table">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-white">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Tiger Nixon</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">System Architect</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Edinburgh</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">$320,800</div>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Garrett Winters</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Accountant</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Tokyo</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">$170,750</div>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Ashton Cox</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Junior Technical Author</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">San Francisco</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">$86,000</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tables;
