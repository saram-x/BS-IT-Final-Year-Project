import React from "react";

// Reusable section header component for admin pages
const SectionHeader = ({ activeTab, filteredData }) => {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'users':
        return {
          title: 'User Management',
          description: 'Manage all users on the platform',
          countLabel: 'Total Users: ',
          count: filteredData.length,
          textColor: 'text-white'
        };
      case 'jobs':
        return {
          title: 'Jobs Management',
          description: 'Manage all job postings on the platform',
          countLabel: 'Total Jobs: ',
          count: filteredData.length,
          textColor: 'text-white'
        };
      case 'suspicious':
        return {
          title: 'Suspicious Jobs',
          description: 'Review and manage flagged job postings',
          countLabel: 'Flagged Jobs: ',
          count: filteredData.length,
          textColor: 'text-orange-300'
        };
      default:
        return {
          title: 'Admin Panel',
          description: 'Manage platform',
          countLabel: 'Items: ',
          count: 0,
          textColor: 'text-white'
        };
    }
  };

  const { title, description, countLabel, count, textColor } = getHeaderInfo();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-300">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-transparent px-4 py-2 rounded-lg border border-gray-600/30 shadow-sm">
            <span className="text-sm text-gray-300">{countLabel}</span>
            <span className={`font-semibold ${textColor}`}>{count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
