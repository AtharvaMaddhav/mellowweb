import React, { useState } from "react";
import { X, Calendar, Check, Filter } from "lucide-react";

const FilterGoals = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    status: [],
    dateRange: {
      startDate: "",
      endDate: ""
    },
    categories: [],
    sortBy: "newest" // default sort
  });

  if (!isOpen) return null;

  const handleStatusChange = (status) => {
    if (filters.status.includes(status)) {
      setFilters({
        ...filters,
        status: filters.status.filter(item => item !== status)
      });
    } else {
      setFilters({
        ...filters,
        status: [...filters.status, status]
      });
    }
  };

  const handleCategoryChange = (category) => {
    if (filters.categories.includes(category)) {
      setFilters({
        ...filters,
        categories: filters.categories.filter(item => item !== category)
      });
    } else {
      setFilters({
        ...filters,
        categories: [...filters.categories, category]
      });
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [name]: value
      }
    });
  };

  const handleSortChange = (sortOption) => {
    setFilters({
      ...filters,
      sortBy: sortOption
    });
  };

  const handleReset = () => {
    setFilters({
      status: [],
      dateRange: {
        startDate: "",
        endDate: ""
      },
      categories: [],
      sortBy: "newest"
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  // Sample status options
  const statusOptions = ["Not Started", "In Progress", "Completed", "Overdue"];
  
  // Sample category options
  const categoryOptions = ["Fitness", "Career", "Education", "Personal", "Financial"];
  
  // Sample sort options
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "end-date", label: "End Date (Closest)" },
    { value: "alphabetical", label: "Alphabetical (A-Z)" }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Filter size={18} />
            Filter Goals
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status.includes(status) 
                      ? "bg-purple-600 text-white" 
                      : "bg-[#333] text-gray-300 hover:bg-[#444]"
                  }`}
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>From</span>
                  </div>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.dateRange.startDate}
                  onChange={handleDateChange}
                  className="w-full p-2 bg-[#333] text-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>To</span>
                  </div>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.dateRange.endDate}
                  onChange={handleDateChange}
                  className="w-full p-2 bg-[#333] text-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.categories.includes(category) 
                      ? "bg-purple-600 text-white" 
                      : "bg-[#333] text-gray-300 hover:bg-[#444]"
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3">Sort By</h3>
            <div className="space-y-2">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === option.value 
                      ? "bg-purple-600 text-white" 
                      : "bg-[#333] text-gray-300 hover:bg-[#444]"
                  }`}
                  onClick={() => handleSortChange(option.value)}
                >
                  <span>{option.label}</span>
                  {filters.sortBy === option.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-[#333] hover:bg-[#444] text-white font-medium rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterGoals;