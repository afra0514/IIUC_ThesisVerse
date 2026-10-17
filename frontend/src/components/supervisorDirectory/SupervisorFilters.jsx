
import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import '../../styles/supervisorDirectory/SupervisorFilters.css';

export default function SupervisorFilters({
  searchQuery,
  onSearchChange,
  selectedDept,
  onDeptChange,
  selectedDomain,
  onDomainChange
}) {
  const domains = [
    'All domains',
    'Machine Learning',
    'NLP',
    'Computer Vision',
    'IoT',
    'Cyber Security',
    'Blockchain'
  ];

  return (
    <div className="filters-wrapper">
      
      {/* Search Input and Department Dropdown Row */}
      <div className="search-dept-row">
        
        <div className="filter-search-box">
          <Search className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search by name or research keyword"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-dept-box">
          <select
            className="filter-dept-select"
            value={selectedDept}
            onChange={(e) => onDeptChange(e.target.value)}
          >
            <option value="All Departments">All Departments</option>
            <option value="CSE">Dept. of CSE</option>
            <option value="EEE">Dept. of EEE</option>
          </select>
          <ChevronDown className="dept-dropdown-icon" />
        </div>

      </div>

      {/* Domain Filter Pills Row */}
      <div className="filter-domains-row">
        {domains.map((domain, index) => {
          const isActive = selectedDomain === domain;
          return (
            <button
              key={index}
              type="button"
              className={`domain-filter-btn ${isActive ? 'active' : ''}`}
              onClick={() => onDomainChange(domain)}
            >
              {domain}
            </button>
          );
        })}
      </div>

    </div>
  );

}