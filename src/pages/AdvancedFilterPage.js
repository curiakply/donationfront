import React, { useState } from 'react';
import { Search, Filter, X, Download, Users, Home, MapPin, Church, User, ChevronDown, ChevronUp } from 'lucide-react';

const AdvancedFilterPage = () => {
  const [activeTab, setActiveTab] = useState('person');
  const [filters, setFilters] = useState({
    person: {
      name: '',
      gender: '',
      relation: '',
      status: '',
      ageFrom: '',
      ageTo: '',
      education: '',
      occupation: '',
      phone: '',
      email: '',
      forane: '',
      parish: '',
      koottayma: '',
      family: '',
      hasPhone: '',
      hasEmail: ''
    },
    family: {
      id: '',
      name: '',
      familyNumber: '',
      status: '',
      forane: '',
      parish: '',
      koottayma: '',
      city: '',
      district: '',
      pincode: '',
      hasHead: '',
      verify: '',
      headName: ''
    },
    parish: {
      name: '',
      shortCode: '',
      forane: '',
      city: '',
      district: '',
      state: ''
    },
    koottayma: {
      name: '',
      forane: '',
      parish: ''
    }
  });

  const [results, setResults] = useState([]);
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'person', label: 'Members', icon: User },
    { id: 'family', label: 'Families', icon: Home },
    { id: 'koottayma', label: 'Koottayma', icon: Users },
    { id: 'parish', label: 'Parishes', icon: Church }
  ];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
  };

  const clearFilters = () => {
    const emptyFilters = Object.keys(filters[activeTab]).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    
    setFilters(prev => ({
      ...prev,
      [activeTab]: emptyFilters
    }));
  };

  const toggleFamilyExpand = (familyId) => {
    setExpandedFamilies(prev => ({
      ...prev,
      [familyId]: !prev[familyId]
    }));
  };

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockResults = generateMockResults(activeTab, filters[activeTab]);
      setResults(mockResults);
      setIsLoading(false);
    }, 1000);
  };

  const generateMockResults = (type, filterData) => {
    const hasActiveFilters = Object.values(filterData).some(v => v !== '');
    if (!hasActiveFilters) return [];

    if (type === 'person') {
      return [
        { _id: '1', name: 'John Doe', gender: 'male', relation: 'head', status: 'active', phone: '9876543210', dob: '15/05/1975', family: 'Family 1', parish: 'St. Mary' },
        { _id: '2', name: 'Jane Doe', gender: 'female', relation: 'wife', status: 'active', phone: '9876543211', dob: '20/08/1978', family: 'Family 1', parish: 'St. Mary' }
      ];
    } else if (type === 'family') {
      return [
        { 
          _id: '1', 
          id: 101, 
          name: 'Doe Family', 
          familyNumber: 1, 
          status: 'active', 
          parish: 'St. Mary', 
          koottayma: 'Unit 1', 
          city: 'Kumily',
          building: 'Rose Villa',
          street: 'Church Road',
          district: 'Idukki',
          pincode: '685509',
          phone: '9876543210',
          verify: 'YES',
          head: {
            _id: 'h1',
            name: 'John Doe',
            phone: '9876543210',
            age: 49
          },
          members: [
            { _id: 'm1', name: 'John Doe', gender: 'male', relation: 'head', status: 'active', phone: '9876543210', dob: '15/05/1975', age: 49, occupation: 'Engineer' },
            { _id: 'm2', name: 'Jane Doe', gender: 'female', relation: 'wife', status: 'active', phone: '9876543211', dob: '20/08/1978', age: 46, occupation: 'Teacher' },
            { _id: 'm3', name: 'Jack Doe', gender: 'male', relation: 'son', status: 'active', phone: '9876543212', dob: '10/03/2005', age: 19, education: 'BSc Computer Science' },
            { _id: 'm4', name: 'Jill Doe', gender: 'female', relation: 'daughter', status: 'active', phone: '9876543213', dob: '25/07/2008', age: 16, education: 'High School' }
          ]
        },
        { 
          _id: '2', 
          id: 102, 
          name: 'Smith Family', 
          familyNumber: 2, 
          status: 'active', 
          parish: 'St. Mary', 
          koottayma: 'Unit 2', 
          city: 'Kumily',
          building: 'Lotus House',
          street: 'Market Street',
          district: 'Idukki',
          pincode: '685509',
          phone: '9876543220',
          verify: 'YES',
          head: {
            _id: 'h2',
            name: 'Robert Smith',
            phone: '9876543220',
            age: 52
          },
          members: [
            { _id: 'm5', name: 'Robert Smith', gender: 'male', relation: 'head', status: 'active', phone: '9876543220', dob: '12/01/1972', age: 52, occupation: 'Business Owner' },
            { _id: 'm6', name: 'Mary Smith', gender: 'female', relation: 'wife', status: 'active', phone: '9876543221', dob: '18/09/1975', age: 49, occupation: 'Nurse' },
            { _id: 'm7', name: 'Tom Smith', gender: 'male', relation: 'son', status: 'active', phone: '9876543222', dob: '05/11/2002', age: 22, education: 'MBA', occupation: 'Marketing Executive' }
          ]
        }
      ];
    }
    return [];
  };

  const exportResults = () => {
    alert(`Exporting ${results.length} results as CSV...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Filter className="text-indigo-600" size={32} />
              Advanced Data Filter
            </h1>
            <button
              onClick={exportResults}
              disabled={results.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              <Download size={18} />
              Export Results
            </button>
          </div>
          <p className="text-gray-600">Filter and search across all church data with multiple criteria</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Filter Criteria</h2>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <X size={18} />
              Clear All
            </button>
          </div>

          {/* Person Filters */}
          {activeTab === 'person' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.person.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={filters.person.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select
                  value={filters.person.relation}
                  onChange={(e) => handleFilterChange('relation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="head">Head</option>
                  <option value="wife">Wife</option>
                  <option value="husband">Husband</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="brother">Brother</option>
                  <option value="sister">Sister</option>
                  <option value="son in law">Son in Law</option>
                  <option value="daughter in law">Daughter in Law</option>
                  <option value="grandson">Grandson</option>
                  <option value="granddaughter">Granddaughter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.person.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="moved_out">Moved Out</option>
                  <option value="deceased">Deceased</option>
                  <option value="rollback">Rollback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age From</label>
                <input
                  type="number"
                  value={filters.person.ageFrom}
                  onChange={(e) => handleFilterChange('ageFrom', e.target.value)}
                  placeholder="Min age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age To</label>
                <input
                  type="number"
                  value={filters.person.ageTo}
                  onChange={(e) => handleFilterChange('ageTo', e.target.value)}
                  placeholder="Max age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  value={filters.person.education}
                  onChange={(e) => handleFilterChange('education', e.target.value)}
                  placeholder="Search education..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={filters.person.occupation}
                  onChange={(e) => handleFilterChange('occupation', e.target.value)}
                  placeholder="Search occupation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={filters.person.phone}
                  onChange={(e) => handleFilterChange('phone', e.target.value)}
                  placeholder="Search phone..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Has Phone</label>
                <select
                  value={filters.person.hasPhone}
                  onChange={(e) => handleFilterChange('hasPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Has Email</label>
                <select
                  value={filters.person.hasEmail}
                  onChange={(e) => handleFilterChange('hasEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          )}

          {/* Family Filters */}
          {activeTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family ID</label>
                <input
                  type="number"
                  value={filters.family.id}
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                  placeholder="Search by ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                <input
                  type="text"
                  value={filters.family.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head Name</label>
                <input
                  type="text"
                  value={filters.family.headName}
                  onChange={(e) => handleFilterChange('headName', e.target.value)}
                  placeholder="Search by head name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Number</label>
                <input
                  type="number"
                  value={filters.family.familyNumber}
                  onChange={(e) => handleFilterChange('familyNumber', e.target.value)}
                  placeholder="Search by number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.family.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={filters.family.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Search by city..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={filters.family.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  placeholder="Search by district..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={filters.family.pincode}
                  onChange={(e) => handleFilterChange('pincode', e.target.value)}
                  placeholder="Search by pincode..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Has Head</label>
                <select
                  value={filters.family.hasHead}
                  onChange={(e) => handleFilterChange('hasHead', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
                <select
                  value={filters.family.verify}
                  onChange={(e) => handleFilterChange('verify', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>
            </div>
          )}

          {/* Parish Filters */}
          {activeTab === 'parish' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parish Name</label>
                <input
                  type="text"
                  value={filters.parish.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
                <input
                  type="text"
                  value={filters.parish.shortCode}
                  onChange={(e) => handleFilterChange('shortCode', e.target.value)}
                  placeholder="Search by code..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={filters.parish.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Search by city..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={filters.parish.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  placeholder="Search by district..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={filters.parish.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  placeholder="Search by state..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Koottayma Filters */}
          {activeTab === 'koottayma' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Koottayma Name</label>
                <input
                  type="text"
                  value={filters.koottayma.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition font-medium"
            >
              <Search size={20} />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Results {results.length > 0 && `(${results.length})`}
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Filter size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No results to display</p>
              <p className="text-sm mt-2">Apply filters and click search to see results</p>
            </div>
          ) : (
            <div>
              {/* Person Results - Table View */}
              {activeTab === 'person' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Gender</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Relation</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Family</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={result._id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-3 px-4">{result.name}</td>
                          <td className="py-3 px-4 capitalize">{result.gender}</td>
                          <td className="py-3 px-4 capitalize">{result.relation}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{result.phone}</td>
                          <td className="py-3 px-4">{result.family}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Family Results - Card View with Members */}
              {activeTab === 'family' && (
                <div className="space-y-4">
                  {results.map((family) => (
                    <div key={family._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Family Header */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">{family.name}</h3>
                              <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                                #{family.familyNumber}
                              </span>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                family.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {family.status}
                              </span>
                              {family.verify === 'YES' && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-indigo-600" />
                                <span className="font-semibold">Head:</span>
                                <span className="text-gray-700">{family.head?.name || 'Not assigned'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-indigo-600" />
                                <span className="text-gray-700">{family.city}, {family.district}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Home size={16} className="text-indigo-600" />
                                <span className="text-gray-700">{family.building}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Church size={16} className="text-indigo-600" />
                                <span className="text-gray-700">{family.parish}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-indigo-600" />
                                <span className="text-gray-700">{family.koottayma}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">Phone:</span>
                                <span className="text-gray-700">{family.phone}</span>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-semibold">Address:</span> {family.street}, {family.city}, {family.district} - {family.pincode}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => toggleFamilyExpand(family._id)}
                            className="ml-4 p-2 hover:bg-white rounded-lg transition"
                          >
                            {expandedFamilies[family._id] ? (
                              <ChevronUp className="text-indigo-600" size={24} />
                            ) : (
                              <ChevronDown className="text-indigo-600" size={24} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Family Members - Expandable */}
                      {expandedFamilies[family._id] && (
                        <div className="p-4 bg-white">
                          <div className="flex items-center gap-2 mb-3">
                            <Users size={20} className="text-indigo-600" />
                            <h4 className="font-semibold text-gray-800">Family Members ({family.members.length})</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {family.members.map((member, idx) => (
                              <div 
                                key={member._id} 
                                className={`p-4 rounded-lg border-2 ${
                                  member.relation === 'head' 
                                    ? 'border-indigo-300 bg-indigo-50' 
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-bold text-gray-800">{member.name}</h5>
                                      {member.relation === 'head' && (
                                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">HEAD</span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 capitalize">{member.relation} • {member.gender}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    member.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : member.status === 'deceased'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {member.status}
                                  </span>
                                </div>
                                
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-600">Age:</span>
                                    <span className="text-gray-700">{member.age} years</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-600">DOB:</span>
                                    <span className="text-gray-700">{member.dob}</span>
                                  </div>
                                  {member.phone && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-600">Phone:</span>
                                      <span className="text-gray-700">{member.phone}</span>
                                    </div>
                                  )}
                                  {member.education && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-600">Education:</span>
                                      <span className="text-gray-700">{member.education}</span>
                                    </div>
                                  )}
                                  {member.occupation && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-600">Occupation:</span>
                                      <span className="text-gray-700">{member.occupation}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterPage;