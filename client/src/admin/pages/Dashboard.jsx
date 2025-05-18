import React, { useState } from 'react';
import Card from './ui/Cards';
import Button from './ui/Buttons';
import Alert from './ui/Alerts';
import StatsCard from '../widgets/StatsCard';
import ChartCard from '../widgets/ChartCard';
import DataTable from '../tables/DataTable';

const Dashboard = () => {
  const [showAlert, setShowAlert] = useState(true);
  
  // Sample data for stats cards
  const statsCardsData = [
    { 
      title: 'Total Revenue', 
      value: '$25,400', 
      icon: 'fas fa-dollar-sign', 
      iconColor: 'bg-green-500',
      change: '12%',
      changeType: 'increase',
      footerText: 'View details',
      footerIcon: 'fas fa-arrow-right'
    },
    { 
      title: 'New Users', 
      value: '450', 
      icon: 'fas fa-users', 
      iconColor: 'bg-blue-500',
      change: '5%',
      changeType: 'increase',
      footerText: 'View all users',
      footerIcon: 'fas fa-arrow-right'
    },
    { 
      title: 'Sales', 
      value: '624', 
      icon: 'fas fa-shopping-cart', 
      iconColor: 'bg-purple-500',
      change: '8%',
      changeType: 'increase',
      footerText: 'More info',
      footerIcon: 'fas fa-arrow-right'
    },
    { 
      title: 'Pending Orders', 
      value: '42', 
      icon: 'fas fa-clock', 
      iconColor: 'bg-yellow-500',
      change: '2%',
      changeType: 'decrease',
      footerText: 'View orders',
      footerIcon: 'fas fa-arrow-right'
    },
  ];
  
  // Sample data for table
  const tableColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false,
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="info" icon="fas fa-eye">View</Button>
          <Button size="sm" variant="warning" icon="fas fa-edit">Edit</Button>
          <Button size="sm" variant="danger" icon="fas fa-trash">Delete</Button>
        </div>
      )
    },
  ];
  
  const tableData = Array.from({ length: 20 }).map((_, index) => ({
    id: index + 1,
    name: `Product ${index + 1}`,
    category: ['Electronics', 'Clothing', 'Food', 'Books', 'Sports'][Math.floor(Math.random() * 5)],
    price: `$${(Math.random() * 1000).toFixed(2)}`,
    stock: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div>
          <Button variant="primary" icon="fas fa-plus">
            New Report
          </Button>
        </div>
      </div>
      
      {/* Alerts */}
      {showAlert && (
        <Alert
          variant="info"
          title="Welcome to Admin LTE Dashboard!"
          message="This is a recreation of AdminLTE using Tailwind CSS and React components."
          dismissible
          onDismiss={() => setShowAlert(false)}
        />
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCardsData.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sales" subtitle="Last 12 Months">
          <div className="text-center p-16 bg-gray-100 rounded-lg w-full h-64 flex items-center justify-center">
            <span className="text-gray-500">Bar Chart Placeholder</span>
          </div>
        </ChartCard>
        
        <ChartCard title="Revenue" subtitle="This Year" variant="success">
          <div className="text-center p-16 bg-gray-100 rounded-lg w-full h-64 flex items-center justify-center">
            <span className="text-gray-500">Line Chart Placeholder</span>
          </div>
        </ChartCard>
      </div>
      
      {/* Tables Section */}
      <div className="space-y-6">
        <Card title="Product Inventory" collapsible closable>
          <DataTable 
            columns={tableColumns}
            data={tableData}
            pagination
            searchable
            striped
            hover
          />
        </Card>
      </div>
      
      {/* Info Boxes / Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Recent Activity" variant="primary" collapsible>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <i className="fas fa-user text-blue-500"></i>
                  </div>
                </div>
                <div>
                  <p className="font-medium">John Smith updated his profile</p>
                  <p className="text-sm text-gray-500">5 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="To-Do List" variant="warning" collapsible>
          <div className="space-y-2">
            {['Create new invoice', 'Check emails', 'Meeting with clients', 'Finish dashboard layout'].map((item, index) => (
              <div key={index} className="flex items-center">
                <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="primary" size="sm" block>Add Item</Button>
          </div>
        </Card>
        
        <Card title="Quick Info" variant="info" collapsible>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Server Load:</span>
              <span className="font-semibold">45%</span>
            </li>
            <li className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="font-semibold">2.3 GB</span>
            </li>
            <li className="flex justify-between">
              <span>CPU Usage:</span>
              <span className="font-semibold">28%</span>
            </li>
            <li className="flex justify-between">
              <span>Disk Space:</span>
              <span className="font-semibold">82.7%</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
