import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { Printer, ChevronDown } from 'lucide-react';

const REPORT_TYPES = {
  OVERVIEW: 'overview',
  DETAILED: 'detailed',
  CONSOLIDATED: 'consolidated'
};

const REPORT_NAMES = {
  [REPORT_TYPES.OVERVIEW]: 'Koottayma Overview',
  [REPORT_TYPES.DETAILED]: 'Detailed Tithe Information',
  [REPORT_TYPES.CONSOLIDATED]: 'Consolidated Totals'
};

const ChurchReports = ({ parishId }) => {
  const [parishData, setParishData] = useState(null);
  const [koottaymaData, setKoottaymaData] = useState([]);
  const [titheData, setTitheData] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES.OVERVIEW);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch parish details
        const parishResponse = await axiosInstance.get(`/parish/${parishId}`);
        setParishData(parishResponse.data);

        // Fetch koottaymas with family count
        const koottaymaResponse = await axiosInstance.get(`/koottayma/parish/${parishId}`);
        setKoottaymaData(koottaymaResponse.data);

        // Fetch tithe information per koottayma
        const titheResponse = await axiosInstance.get(`/transaction/tithe-info/${parishId}`);
        setTitheData(titheResponse.data);

        // Fetch consolidated tithe totals
        const consolidatedResponse = await axiosInstance.get(`/transaction/consolidated-tithe/${parishId}`);
        setConsolidatedData(consolidatedResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    };

    if (parishId) {
      fetchData();
    }
  }, [parishId]);

  const handlePrint = () => {
    window.print();
  };

  const renderOverviewReport = () => (
    <div className="bg-white rounded-lg shadow-md print:shadow-none">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">CHURCH: {parishData?.name.toUpperCase()}</h2>
        </div>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2 text-left">KOOTTAYMA NAME</th>
              <th className="border p-2">AMOUNT</th>
              <th className="border p-2">NUMBER OF FAMILIES</th>
            </tr>
          </thead>
          <tbody>
            {koottaymaData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">{item.name}</td>
                <td className="border p-2 text-center">
                  {consolidatedData.find(c => c._id === item._id)?.amount || '-'}
                </td>
                <td className="border p-2 text-center">{item.familyCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetailedReport = () => (
    <div className="bg-white rounded-lg shadow-md print:shadow-none">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">KOOTAYMA WISE TITHE INFORMATION</h2>
          <h3 className="text-lg">{parishData?.name.toUpperCase()}</h3>
        </div>
        {titheData.map((koottayma, index) => (
          <div key={index} className="mb-8">
            <h4 className="font-bold mb-2 border-b pb-2">
              KOOTAYMA - {koottayma.name}
            </h4>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">HOUSE NAME</th>
                  <th className="text-left p-2">HEAD NAME</th>
                  <th className="text-left p-2">TEL NO</th>
                  
                  <th className="text-right p-2">TITHE AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {koottayma.families.map((family, fIndex) => (
                  <tr key={fIndex} className="hover:bg-gray-50">
                    <td className="p-2">{family.houseName}</td>
                    <td className="p-2">{family.headName}</td>
                    <td className="p-2">{family.phone}</td>
                    
                    <td className="p-2 text-right">{family.totalAmount}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td colSpan="4" className="p-2 text-right">Total:</td>
                  <td className="p-2 text-right">
                    {koottayma.totalAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConsolidatedReport = () => (
    <div className="bg-white rounded-lg shadow-md print:shadow-none">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">KOOTAYMAWISE TITHE TOTAL FOR</h2>
          <h3 className="text-lg">{parishData?.name.toUpperCase()}</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">KOOTAYMA NAME</th>
              <th className="text-right p-2">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {consolidatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">{item.amount}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="p-2">Total</td>
              <td className="p-2 text-right">
                {consolidatedData.reduce((sum, item) => sum + item.amount, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="print:hidden flex justify-between items-center mb-4">
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(REPORT_NAMES).map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Printer className="h-5 w-5" />
          Print Report
        </button>
      </div>

      {selectedReport === REPORT_TYPES.OVERVIEW && renderOverviewReport()}
      {selectedReport === REPORT_TYPES.DETAILED && renderDetailedReport()}
      {selectedReport === REPORT_TYPES.CONSOLIDATED && renderConsolidatedReport()}
    </div>
  );
};

export default ChurchReports;