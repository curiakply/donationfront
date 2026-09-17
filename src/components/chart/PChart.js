import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axiosInstance from "../../axiosConfig";
import { Typography, Card, Col, Row, Select, DatePicker, message } from "antd";
import { TeamOutlined, ManOutlined, WomanOutlined } from "@ant-design/icons";

function PChart() {
  const { Title } = Typography;
  const [foranes, setForanes1] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [populationData, setPopulationData] = useState({
    totalPopulation: 0,
    totalMales: 0,
    totalFemales: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch foranes once on component mount
  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get("/forane");
      setForanes1(response.data);
    } catch (error) {
      console.error("Error fetching foranes:", error);
      message.error("Failed to fetch foranes");
    }
  };

  // Handle forane change
  const handleForaneChange = (value) => {
    setSelectedForane(value);
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Fetch population data based on forane and date range
  const fetchPopulationData = async () => {
    setLoading(true);

    try {
      // Prepare query parameters
      const config = {
        params: {}
      };
      
      // Add foraneId if selected
      if (selectedForane) {
        config.params.foraneId = selectedForane;
      }
      
      // Add date range if selected
      if (dateRange && dateRange[0] && dateRange[1]) {
        config.params.startDate = dateRange[0].format("YYYY-MM-DD");
        config.params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      // Use the population summary endpoint
      const response = await axiosInstance.get("/person/population", config);

      setPopulationData(response.data);
    } catch (error) {
      console.error("Error fetching population data:", error);
      message.error("Failed to fetch population data. Please try again later.");
      setPopulationData({ totalPopulation: 0, totalMales: 0, totalFemales: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch foranes on mount
  useEffect(() => {
    fetchForanes();
  }, []);

  // Trigger population data fetch when forane or date range changes
  useEffect(() => {
    fetchPopulationData();
  }, [selectedForane, dateRange]);
  
  // Pie chart configuration
  const pieChartConfig = {
    series: [populationData.totalMales, populationData.totalFemales],
    options: {
      chart: {
        type: "pie",
        height: 450,
      },
      labels: ["Males", "Females"],    
      legend: {
        position: "bottom",
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return `${val} individuals`;
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", padding: "20px" }}>
     

      {/* Population Data Section */}
      <div style={{ flex: 1 }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
            Population Summary
          </Title>
          
          {/* Forane Selection */}
          <div style={{ marginBottom: "16px", textAlign: "center" }}>
            <Select
              value={selectedForane}
              onChange={handleForaneChange}
              style={{ width: "100%" }}
              placeholder="Select a Forane"
              allowClear
            >
              {foranes.map((forane) => (
                <Select.Option key={forane._id} value={forane._id}>
                  {forane.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Date Range Picker */}
          <div style={{ marginBottom: "16px", textAlign: "center" }}>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
              placeholder={["Start Date", "End Date"]}
            />
          </div>

          {/* Population Statistics */}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card
                bordered={false}
                style={{
                  backgroundColor: "#f0f2f5",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <TeamOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
                <p style={{ fontSize: "18px", margin: "10px 0 0", fontWeight: "bold" }}>
                  Total Population
                </p>
                <p style={{ fontSize: "16px", margin: "0" }}>
                  {loading ? "Loading..." : populationData.totalPopulation}
                </p>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  backgroundColor: "#e6f7ff",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <ManOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
                <p style={{ fontSize: "18px", margin: "10px 0 0", fontWeight: "bold" }}>Males</p>
                <p style={{ fontSize: "16px", margin: "0" }}>
                  {loading ? "Loading..." : populationData.totalMales}
                </p>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  backgroundColor: "#fff1f0",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <WomanOutlined style={{ fontSize: "24px", color: "#eb2f96" }} />
                <p style={{ fontSize: "18px", margin: "10px 0 0", fontWeight: "bold" }}>Females</p>
                <p style={{ fontSize: "16px", margin: "0" }}>
                  {loading ? "Loading..." : populationData.totalFemales}
                </p>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
       {/* Pie Chart */}
       <div style={{ flex: 1 }}>
        <ReactApexChart
          className="pie-chart"
          options={pieChartConfig.options}
          series={pieChartConfig.series}
          type="pie"
          height={450}
        />
      </div>
    </div>
  );
}

export default PChart;