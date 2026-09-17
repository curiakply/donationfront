import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const FamilyChart = ({ selectedFamily, axiosInstance }) => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    if (!selectedFamily?.value) return;
    
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/transaction/year/${selectedFamily.value}`);
        const transformedData = response.data.map(item => ({
          year: item.year.toString(),
          amount: Number(item.totalAmountPaid || 0)
        }));
        setData(transformedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setData([]);
      }
    };

    fetchData();
  }, [selectedFamily, axiosInstance]);

  return (
    <div style={{ width: '100%', height: 400, minWidth: 300 }}>
      <ResponsiveContainer debounce={1}>
        <BarChart 
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year"
            height={60}
            tick={{ dy: 10 }}
          />
          <YAxis tickFormatter={value => `₹${value}`} />
          <Tooltip 
            formatter={value => `₹${value}`}
            contentStyle={{ background: 'white', border: '1px solid #ccc' }}
          />
          <Bar 
            dataKey="amount" 
            fill="#4f46e5"
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FamilyChart;