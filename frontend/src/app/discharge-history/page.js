'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

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

  const loadDischargeHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('dischargeHistory') || '[]');
      setDischargeHistory(history);
    } catch (error) {
      console.error('Error loading discharge history:', error);
      setDischargeHistory([]);
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

  const handleDeleteRecord = (recordId) => {
    if (window.confirm('Are you sure you want to delete this discharge record? This action cannot be undone.')) {
      const updatedHistory = dischargeHistory.filter(record => record.id !== recordId);
      setDischargeHistory(updatedHistory);
      localStorage.setItem('dischargeHistory', JSON.stringify(updatedHistory));
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/?tab=patients')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Patients
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Discharge History</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {filteredHistory.length} records
              </span>
              <button
                onClick={exportToCSV}
                disabled={filteredHistory.length === 0}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, ID, discharge type, or staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="sm:w-64">
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCriteria}
                  onChange={(e) => setFilterCriteria(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Records</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="normal">Normal Discharge</option>
                  <option value="critical">Critical Transfer</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No discharge records found</div>
              <p className="text-gray-500 text-sm">
                {searchTerm || filterCriteria !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Discharge records will appear here when patients are discharged'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discharge Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discharged By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                          <div className="text-sm text-gray-500">ID: {record.patientId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDischargeTypeColor(record.dischargeType)}`}>
                            {record.dischargeType}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(record.dischargeDate).toLocaleDateString()} at{' '}
                            {new Date(record.dischargeDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.duration || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.dischargedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Delete Record"
                          >
                            <TrashIcon className="h-4 w-4" />
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

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Discharge Details</h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.patientName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.patientId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.gender || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Discharge Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Discharge Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discharge Date & Time</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedRecord.dischargeDate).toLocaleDateString()} at{' '}
                        {new Date(selectedRecord.dischargeDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discharge Type</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDischargeTypeColor(selectedRecord.dischargeType)}`}>
                        {selectedRecord.dischargeType}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discharged By</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.dischargedBy}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Destination</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.destination || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration in ICU</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.duration || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                {(selectedRecord.diagnosis || selectedRecord.procedures) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedRecord.diagnosis && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRecord.diagnosis}</p>
                        </div>
                      )}
                      {selectedRecord.procedures && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Procedures</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRecord.procedures}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedRecord.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRecord.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
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
