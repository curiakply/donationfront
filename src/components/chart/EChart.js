import ReactApexChart from "react-apexcharts";
import axiosInstance from "../../axiosConfig";
import { Row, Col, Typography, Select } from "antd";
import eChart from "./configs/eChart";
import { useState, useEffect } from "react";

function EChart({ selectedYear }) {
  const { Title, Paragraph } = Typography;
  const [foranes, setForanes1] = useState([]);
  const [parishesData, setParishesData] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Remove local year state, use prop instead
  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handleForaneChange = (value) => {
    setSelectedForane(value);
  };

  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get("/forane/");
      setForanes1(response.data);
    } catch (error) {
      console.error("Error fetching foranes:", error);
    }
  };
  const fetchForaneData = async (year, forane) => {
    try {
      // Validate input parameters with more detailed logging
      if (!year || !forane) {
        console.warn("Missing required parameters", { year, forane });
        setParishesData([]);
        return null;
      }
  
      // Fetch the forane data with comprehensive error handling
      const response = await axiosInstance.get(
        `/transaction/yearly/${year}/forane/${forane}`, 
        {
          validateStatus: status => status === 200,
          timeout: 10000 
        }
      );
  
      const data = response.data;
  
      // Extract and filter unique parish IDs
      const parishIds = [...new Set(
        data
          .map(item => item.parish)
          .filter(id => id && typeof id === 'string')
      )];
  
      if (parishIds.length === 0) {
        console.warn("No valid parish IDs found in the forane data", { 
          year, 
          forane, 
          dataLength: data.length 
        });
        setParishesData([]);
        return null;
      }
  
      // Prepare IDs for API call
      const idsString = Array.isArray(parishIds) 
        ? parishIds.join(',') 
        : String(parishIds);
      
      console.log('Sending parish IDs:', idsString);
  
      // Fetch parish names based on the IDs with error tracking
      let parishes = [];
      try {
        const parishResponse = await axiosInstance.get(
          `/parish/m/${encodeURIComponent(idsString)}`,
          {
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            },
            timeout: 10000
          }
        );
        
        // Robust data normalization
        parishes = Array.isArray(parishResponse.data?.foundParishes) 
          ? parishResponse.data.foundParishes 
          : parishResponse.data 
            ? [parishResponse.data] 
            : [];
  
      } catch (parishFetchError) {
        console.error("Detailed parish fetch error:", {
          message: parishFetchError.message,
          code: parishFetchError.code,
          status: parishFetchError.response?.status,
          data: parishFetchError.response?.data
        });
      }
  
      // Comprehensive data mapping with fallback mechanisms
      const dataWithParishNamesAndAmount = data.map((item, index) => {
        const parish = parishes.find(p => p._id === item.parish);
      
        return {
          parishId: item.parish,
          parishName: parish?.name || `Parish ${index + 1}`,
          totalAmount: Number(item.totalAmount) || 0,
          originalData: item,
          ...(parish && { parishDetails: parish })
        };
      });
  
      // Advanced sorting with multiple criteria
      const sortedData = dataWithParishNamesAndAmount.sort((a, b) => {
        // Primary sort by total amount
        if (b.totalAmount !== a.totalAmount) {
          return b.totalAmount - a.totalAmount;
        }
        
        // Secondary sort by parish name if amounts are equal
        return a.parishName.localeCompare(b.parishName);
      });
  
      // Logging for transparency
      console.log("Forane Data Processing Complete", {
        totalTransactions: data.length,
        uniqueParishes: parishIds.length,
        processedData: sortedData.length
      });
  
      // Set processed data
      setParishesData(sortedData);
  
      return sortedData;
  
    } catch (error) {
      // Comprehensive error logging
      console.error("Comprehensive fetchForaneData Error:", {
        message: error.message,
        name: error.name,
        code: error.code,
        status: error.response?.status,
        responseData: error.response?.data,
        stack: error.stack
      });
  
      // Reset data and optionally show user-friendly notification
      setParishesData([]);
  
      return null;
    }
  };
  

  // Fetch foranes on initial load
  useEffect(() => {
    fetchForanes();
  }, []);

  // Fetch forane data when year or forane changes
  useEffect(() => {
    if (selectedForane) {
      setIsLoading(true);
      fetchForaneData(selectedYear, selectedForane).finally(() => setIsLoading(false));
    }
  }, [selectedYear, selectedForane]);

  const items = [
    {
      Title: "3,6K",
      user: "Parish",
    },
    {
      Title: "2m",
      user: "Populations",
    },
    {
      Title: "772",
      user: "Families",
    },
    {
      Title: "82",
      user: "Contibuted",
    },
  ];
  const chartConfig = {
    series: [
      {
        name: "Total Amount",
        data: parishesData.map(item => item.totalAmount || 0),  // Total amounts
        color: "#fff",
      },
    ],
    options: {
      chart: {
        type: "bar",
        width: "100%",
        height: "auto",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
          borderRadius: 5,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"],
      },
      grid: {
        show: true,
        borderColor: "#ccc",
        strokeDashArray: 2,
      },
      xaxis: {
        categories: parishesData.map(item => item.parishName || "Unknown"), // Parish names
        labels: {
          show: true,
          align: "right",
          minWidth: 0,
          maxWidth: 160,
          style: {
            colors: Array(parishesData.length).fill("#fff"), // Label color
          },
        },
      },
      yaxis: {
        labels: {
          show: true,
          align: "right",
          minWidth: 0,
          maxWidth: 160,
          style: {
            colors: Array(parishesData.length).fill("#fff"), // Label color
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + "";
          },
        },
      },
    },
  };

  return (
    <>
      <div id="chart">
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
          <label htmlFor="year-select" style={{ marginRight: "10px" }}>Select Forane:</label>
          <Select
            value={selectedForane}
            onChange={handleForaneChange}
            style={{ width: 200 }}
            placeholder="Select a Forane"
          > 
            {foranes.map((forane) => (
              <Select.Option key={forane._id} value={forane._id}>
                {forane.name}
              </Select.Option>
            ))}
          </Select>
        </div>   <Title level={5}>Active  Year: {selectedYear}</Title>
        <ReactApexChart
         key={`${selectedForane}-${selectedYear}`} 
          className="bar-chart"
          options={chartConfig.options}
          series={chartConfig.series}
          type="bar"
          height={300}
        />
      </div>
      <div className="chart-vistior">
      
        
        
        <Row gutter>
          {items.map((v, index) => (
            <Col xs={6} xl={6} sm={6} md={6} key={index}>
              <div className="chart-visitor-count">
                <Title level={4}>{v.Title}</Title>
                <span>{v.user}</span>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default EChart;