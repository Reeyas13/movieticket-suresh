import React, { useState } from 'react';

const DataTable = ({
  columns = [],
  data = [],
  pagination = true,
  searchable = true,
  striped = true,
  bordered = true,
  hover = true,
  compact = false,
  rowsPerPageOptions = [10, 25, 50, 100],
  initialRowsPerPage = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Search and filter functionality
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    
    return Object.values(row).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sorting functionality
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction icon
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return <i className="fas fa-sort text-gray-300 ml-1"></i>;
    return sortConfig.direction === 'asc' 
      ? <i className="fas fa-sort-up text-blue-500 ml-1"></i> 
      : <i className="fas fa-sort-down text-blue-500 ml-1"></i>;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header with Search and Per Page Controls */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
        <div className="mb-2 sm:mb-0">
          <h2 className="text-lg font-semibold text-gray-800">Data Table</h2>
        </div>
        
        <div className="flex flex-wrap items-center">
          {searchable && (
            <div className="relative mr-4 mb-2 sm:mb-0">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          )}
          
          {pagination && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Show:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page on rows per page change
                }}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {rowsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Table with responsive container */}
      <div className="responsive-table-container">
        <table className={`min-w-full table-auto responsive-table ${compact ? 'text-sm' : 'text-base'}`}>
          <thead>
            <tr className="bg-gray-100">
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
                    ${bordered ? 'border-b border-gray-200' : ''}
                    ${column.sortable !== false ? 'cursor-pointer select-none' : ''}
                  `}
                  onClick={column.sortable !== false ? () => requestSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`
                    ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''} 
                    ${hover ? 'hover:bg-blue-50' : ''}
                    transition-colors duration-150
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-6 py-4 whitespace-nowrap ${bordered ? 'border-b border-gray-200' : ''}`}
                    >
                      {column.render 
                        ? column.render(row[column.key], row) 
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-4 text-center text-gray-500 whitespace-nowrap"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {pagination && totalPages > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between">
          <div className="text-sm text-gray-700 mb-2 sm:mb-0">
            Showing 
            <span className="font-medium mx-1">
              {Math.min((currentPage - 1) * rowsPerPage + 1, sortedData.length)}
            </span> 
            to 
            <span className="font-medium mx-1">
              {Math.min(currentPage * rowsPerPage, sortedData.length)}
            </span> 
            of 
            <span className="font-medium mx-1">{sortedData.length}</span> 
            results
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`
                relative inline-flex items-center px-2 py-1 rounded-md border 
                ${currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}
                text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              `}
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                relative inline-flex items-center px-2 py-1 rounded-md border 
                ${currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}
                text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              `}
            >
              <i className="fas fa-angle-left"></i>
            </button>
            
            {/* Page Numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              let pageNumber;
              
              // Calculate the correct page number to display based on current page
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }
              
              // Only render if pageNumber is valid
              if (pageNumber > 0 && pageNumber <= totalPages) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`
                      relative inline-flex items-center px-4 py-1 rounded-md border 
                      ${currentPage === pageNumber 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'}
                      text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
                    `}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                relative inline-flex items-center px-2 py-1 rounded-md border 
                ${currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}
                text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              `}
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`
                relative inline-flex items-center px-2 py-1 rounded-md border 
                ${currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}
                text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              `}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
