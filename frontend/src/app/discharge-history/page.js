'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

const DischargeHistoryPage = () => {
  const router = useRouter();
  const [dischargeHistory, setDischargeHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDischargeHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [dischargeHistory, searchTerm, filterCriteria]);

  const loadDischargeHistory = async () => {
    try {
      console.log('Loading discharge history from API...');
      const history = await apiClient.getDischargeHistory();
      console.log(`✅ Loaded ${history.length} discharge records from database`);
      setDischargeHistory(history);
    } catch (error) {
      console.error('❌ Error loading discharge history from API:', error);
      // Fallback to localStorage for backward compatibility
      try {
        const localHistory = JSON.parse(localStorage.getItem('dischargeHistory') || '[]');
        console.log(`📝 Using ${localHistory.length} records from localStorage as fallback`);
        setDischargeHistory(localHistory);
        if (localHistory.length === 0) {
          toast.error('Failed to load discharge history from database. Please check your connection.');
        }
      } catch (localError) {
        console.error('❌ Error loading from localStorage:', localError);
        setDischargeHistory([]);
        toast.error('Failed to load discharge history');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = dischargeHistory;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.dischargeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.dischargedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply criteria filter
    if (filterCriteria !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filterCriteria) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(record => new Date(record.dischargeDate) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(record => new Date(record.dischargeDate) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(record => new Date(record.dischargeDate) >= filterDate);
          break;
        case 'normal':
          filtered = filtered.filter(record => record.dischargeType === 'Normal Discharge');
          break;
        case 'critical':
          filtered = filtered.filter(record => record.dischargeType === 'Critical Transfer');
          break;
        case 'deceased':
          filtered = filtered.filter(record => record.dischargeType === 'Deceased');
          break;
      }
    }

    setFilteredHistory(filtered);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this discharge record? This action cannot be undone.')) {
      try {
        await apiClient.deleteDischargeRecord(recordId);
        
        // Update local state
        const updatedHistory = dischargeHistory.filter(record => record.id !== recordId);
        setDischargeHistory(updatedHistory);
        
        toast.success('Discharge record deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting discharge record:', error);
        
        // Fallback to localStorage for backward compatibility
        try {
          const updatedHistory = dischargeHistory.filter(record => record.id !== recordId);
          setDischargeHistory(updatedHistory);
          localStorage.setItem('dischargeHistory', JSON.stringify(updatedHistory));
          toast.success('Discharge record deleted from local storage');
        } catch (localError) {
          toast.error('Failed to delete discharge record');
        }
      }
    }
  };

  const exportToCSV = () => {
    if (filteredHistory.length === 0) {
      alert('No records to export');
      return;
    }

    const headers = ['Patient ID', 'Patient Name', 'Discharge Date', 'Discharge Type', 'Discharged By', 'Destination', 'Duration', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(record => [
        record.patientId,
        record.patientName,
        new Date(record.dischargeDate).toLocaleDateString(),
        record.dischargeType,
        record.dischargedBy,
        record.destination || 'N/A',
        record.duration || 'N/A',
        `"${record.notes || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discharge_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getDischargeTypeColor = (type) => {
    switch (type) {
      case 'Normal Discharge':
        return 'bg-green-100 text-green-800';
      case 'Critical Transfer':
        return 'bg-yellow-100 text-yellow-800';
      case 'Deceased':
        return 'bg-red-100 text-red-800';
      case 'Against Medical Advice':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              {/* --- Back to Patients button improvement --- */}
              <button
                onClick={() => router.push('/?tab=patients')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Patients</span>
              </button>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Discharge History</h1>
                <p className="text-sm text-gray-500 mt-1">Comprehensive patient discharge records</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{filteredHistory.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Records Found</p>
              </div>
              <button
                onClick={exportToCSV}
                disabled={filteredHistory.length === 0}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filter Controls */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Enhanced Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Search Records</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, ID, discharge type, or staff member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Enhanced Filter */}
            <div className="sm:w-80">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Category</label>
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCriteria}
                  onChange={(e) => setFilterCriteria(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all duration-200 cursor-pointer"
                >
                  <option value="all">All Records</option>
                  <option value="today">Today's Discharges</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="normal">Normal Discharge</option>
                  <option value="critical">Critical Transfer</option>
                  <option value="deceased">Deceased</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Records Display */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No discharge records found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterCriteria !== 'all' 
                    ? 'Try adjusting your search or filter criteria to find matching records'
                    : 'Discharge records will appear here when patients are discharged from the ICU'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Patient Information
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Discharge Details
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Duration & Staff
                    </th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredHistory.map((record, index) => (
                    <tr
                      key={record.id}
                      className="group border-b border-gray-200 hover:shadow-lg hover:z-10 transition-shadow duration-150 relative"
                      style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)' }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {record.patientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {record.patientName}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">ID: {record.patientId}</div>
                            {/* --- Age calculation fix --- */}
                            {record.dateOfBirth ? (
                              <div className="text-sm text-gray-500">Age: {Math.floor((new Date() - new Date(record.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25))} • {record.gender}</div>
                            ) : record.age ? (
                              <div className="text-sm text-gray-500">Age: {record.age} • {record.gender}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${getDischargeTypeColor(record.dischargeType)}`}>
                              {record.dischargeType}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {new Date(record.dischargeDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.dischargeDate).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                          {/* --- Remove 'To' part if destination is N/A or missing --- */}
                          {record.destination && record.destination !== 'N/A' && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Destination:</span> {record.destination}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {record.duration || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Discharged by:</span>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">
                            {record.dischargedBy}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 rounded-xl transition-all duration-200 group"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="flex items-center justify-center w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-xl transition-all duration-200 group"
                            title="Delete Record"
                          >
                            <TrashIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Detail Modal */}
      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Discharge Record Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Complete discharge information for {selectedRecord.patientName}</p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Patient Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Patient Name</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecord.patientName}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Patient ID</label>
                    <p className="text-lg font-mono font-semibold text-gray-900">{selectedRecord.patientId}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Age</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecord.age || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Gender</label>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedRecord.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Discharge Information Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Discharge Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Discharge Date & Time</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(selectedRecord.dischargeDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {new Date(selectedRecord.dischargeDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Discharge Type</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getDischargeTypeColor(selectedRecord.dischargeType)}`}>
                      {selectedRecord.dischargeType}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Discharged By</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecord.dischargedBy}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Destination</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecord.destination || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Duration in ICU</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedRecord.duration || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information Card */}
              {(selectedRecord.diagnosis || selectedRecord.procedures) && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedRecord.diagnosis && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Diagnosis</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedRecord.diagnosis}</p>
                      </div>
                    )}
                    {selectedRecord.procedures && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Procedures</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedRecord.procedures}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Card */}
              {selectedRecord.notes && (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                  <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    Additional Notes
                  </h3>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedRecord.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargeHistoryPage;
