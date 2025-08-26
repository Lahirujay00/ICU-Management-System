'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Bed,
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DischargeHistoryPage() {
  const router = useRouter()
  const [dischargeRecords, setDischargeRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterReason, setFilterReason] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadDischargeRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [searchTerm, filterReason, dischargeRecords])

  const loadDischargeRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem('dischargeRecords') || '[]')
      const sortedRecords = records.sort((a, b) => new Date(b.dischargeDate) - new Date(a.dischargeDate))
      setDischargeRecords(sortedRecords)
    } catch (error) {
      console.error('Error loading discharge records:', error)
      toast.error('Failed to load discharge records')
      setDischargeRecords([])
    }
  }

  const filterRecords = () => {
    let filtered = dischargeRecords

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterReason !== 'all') {
      filtered = filtered.filter(record => record.dischargeReason === filterReason)
    }

    setFilteredRecords(filtered)
  }

  const getReasonBadgeStyle = (reason) => {
    switch (reason) {
      case 'discharged':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'transfer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'death':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getReasonIcon = (reason) => {
    switch (reason) {
      case 'discharged':
        return <Activity className="w-4 h-4" />
      case 'transfer':
        return <ArrowLeft className="w-4 h-4" />
      case 'death':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleViewDetails = (record) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
  }

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export')
      return
    }

    const headers = ['Patient Name', 'Patient ID', 'Bed Number', 'Discharge Date', 'Discharge Reason', 'Diagnosis', 'Length of Stay', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        `"${record.patientName}"`,
        `"${record.patientId || 'N/A'}"`,
        `"${record.bedNumber || 'N/A'}"`,
        `"${new Date(record.dischargeDate).toLocaleDateString()}"`,
        `"${record.dischargeReason}"`,
        `"${record.diagnosis}"`,
        `"${record.lengthOfStay} days"`,
        `"${record.dischargeNotes || 'No notes'}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `discharge-records-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Discharge records exported successfully!')
  }

  const DetailModal = ({ record, onClose }) => {
    if (!record) return null

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Discharge Record Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Patient Name</label>
                    <p className="text-gray-900 font-medium">{record.patientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Patient ID</label>
                    <p className="text-gray-900">{record.patientId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Bed Number</label>
                    <p className="text-gray-900">{record.bedNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Diagnosis</label>
                    <p className="text-gray-900">{record.diagnosis}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Discharge Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700">Discharge Date</label>
                    <p className="text-gray-900">{new Date(record.dischargeDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700">Discharge Time</label>
                    <p className="text-gray-900">{new Date(record.dischargeDate).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700">Discharge Reason</label>
                    <div className="flex items-center space-x-2">
                      {getReasonIcon(record.dischargeReason)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getReasonBadgeStyle(record.dischargeReason)}`}>
                        {record.dischargeReason}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700">Length of Stay</label>
                    <p className="text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {record.lengthOfStay} days
                    </p>
                  </div>
                </div>
              </div>

              {record.dischargeNotes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Discharge Notes
                  </h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{record.dischargeNotes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/?tab=patients')}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Patients
              </button>
              <div className="border-l border-gray-300 h-6"></div>
              <h1 className="text-xl font-semibold text-gray-900">Discharge History</h1>
            </div>
            
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Simple Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, ID, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Reasons</option>
              <option value="discharged">Discharged</option>
              <option value="transfer">Transfer</option>
              <option value="death">Death</option>
            </select>
          </div>
          
          {/* Simple Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredRecords.length} of {dischargeRecords.length} records
            </p>
          </div>
        </div>

        {/* Simple Records Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Discharge Records ({filteredRecords.length})
            </h3>
          </div>
          
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No discharge records</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterReason !== 'all' 
                  ? 'No records match your search criteria.' 
                  : 'No patients have been discharged yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bed & Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discharge Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Length of Stay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record, index) => (
                    <tr
                      key={record.patientId || index}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                            <div className="text-sm text-gray-500">ID: {record.patientId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Bed className="h-4 w-4 mr-2 text-gray-400" />
                          Bed {record.bedNumber || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{record.diagnosis}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 mb-1">
                          {getReasonIcon(record.dischargeReason)}
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getReasonBadgeStyle(record.dischargeReason)}`}>
                            {record.dischargeReason}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(record.dischargeDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {record.lengthOfStay} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showDetailModal && (
        <DetailModal
          record={selectedRecord}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedRecord(null)
          }}
        />
      )}
    </div>
  )
}
