import React from 'react';

const ResponsiveTable = ({ headers, data, actions }) => {
  return (
    <div className="responsive-table-container">
      <table className="responsive-table w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="py-3 px-4 text-left font-medium text-gray-600 uppercase tracking-wider"
              >
                {header.label}
              </th>
            ))}
            {actions && <th className="py-3 px-4 text-left font-medium text-gray-600 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex} className="py-3 px-4 text-gray-700">
                    {row[header.key]}
                  </td>
                ))}
                {actions && (
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {actions(row, rowIndex)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={headers.length + (actions ? 1 : 0)} 
                className="py-4 px-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;
