import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import api from '../../../axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    monthlyJobseekers: [],
    monthlyCompanies: [],
    genderData: [],
    jobsData: [],
    applicationsByMonth: [],
    jobsByCategory: [],
    applicationStatusData: [],
    summaryData: {
      totalJobSeekers: 0,
      totalCompanies: 0,
      totalJobs: 0,
      totalApplications: 0,
      averageApplicationsPerJob: 0,
      activeJobs: 0,
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/api/admin-chart");
        console.log("API Response:", response.data);
        
        // Access the data inside the response wrapper
        if (response.data && response.data.success && response.data.data) {
          const apiData = response.data.data;
          
          // Update the dashboard data with API response
          setDashboardData({
            monthlyJobseekers: apiData.monthlyJobseekers || [],
            monthlyCompanies: apiData.monthlyCompanies || [],
            genderData: apiData.genderData || [],
            jobsData: apiData.jobsData || [],
            applicationsByMonth: apiData.applicationsByMonth?.map(item => ({
              month: item.month,
              applications: item.count
            })) || [],
            jobsByCategory: apiData.jobsByCategory || [],
            // Use the application status data from the API
            applicationStatusData: apiData.applicationStatusData || [],
            summaryData: apiData.summaryData || {
              totalJobSeekers: 0,
              totalCompanies: 0,
              totalJobs: 0,
              totalApplications: 0,
              averageApplicationsPerJob: 0,
              activeJobs: 0,
            }
          });
        } else {
          console.error("Invalid API response format:", response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#82ca9d', '#ffc658'];
  const GENDER_COLORS = ['#0088FE', '#FF8042', '#00C49F'];
  const JOBS_COLORS = ['#82ca9d', '#0088FE', '#FF8042'];
  const APPLICATION_STATUS_COLORS = [
    '#0088FE',
    '#FFBB28',
    '#00C49F',
    '#829d', 
    '#FF0000',
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Job Seekers</h3>
          <p className="text-3xl font-bold">{dashboardData.summaryData.totalJobSeekers}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Registered Companies</h3>
          <p className="text-3xl font-bold">{dashboardData.summaryData.totalCompanies}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Jobs Posted</h3>
          <p className="text-3xl font-bold">{dashboardData.summaryData.totalJobs}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Applications</h3>
          <p className="text-3xl font-bold">{dashboardData.summaryData.totalApplications}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Avg. Applications per Job</h3>
          <p className="text-3xl font-bold">{dashboardData.summaryData.averageApplicationsPerJob}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Jobs</h3>
          <p className="text-3xl font-bold">{dashboardData.summaryData.activeJobs}</p>
        </div>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Job Seekers Over Time */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Job Seekers Growth</h2>
          <div className="h-64">
            {dashboardData.monthlyJobseekers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.monthlyJobseekers}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Companies Registered Over Time */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Companies Registration Growth</h2>
          <div className="h-64">
            {dashboardData.monthlyCompanies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.monthlyCompanies}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Gender Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Job Seekers by Gender</h2>
          <div className="h-64">
            {dashboardData.genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Jobs Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Jobs by Status</h2>
          <div className="h-64">
            {dashboardData.jobsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.jobsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.jobsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={JOBS_COLORS[index % JOBS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Applications Over Time */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Job Applications by Month</h2>
          <div className="h-64">
            {dashboardData.applicationsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.applicationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Jobs by Category */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Jobs by Category</h2>
          <div className="h-64">
            {dashboardData.jobsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.jobsByCategory}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Row 4 - Application Status */}
      <div className="grid grid-cols-1 gap-6">
        {/* Application Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Application Status Distribution</h2>
          <div className="h-64">
            {dashboardData.applicationStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.applicationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dashboardData.applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={APPLICATION_STATUS_COLORS[index % APPLICATION_STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No application status data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Row 5 - Detailed Application Status */}
      <div className="grid grid-cols-1 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Application Status Breakdown</h2>
          <div className="h-64">
            {dashboardData.applicationStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.applicationStatusData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {dashboardData.applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={APPLICATION_STATUS_COLORS[index % APPLICATION_STATUS_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No application status data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;