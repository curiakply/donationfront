import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axiosInstance from "../../axiosConfig";
import { Typography, Card, Col, Row, Select, DatePicker, message } from "antd";
import { BookOutlined } from "@ant-design/icons";

function EduChart() {
  const { Title } = Typography;
  const [foranes, setForanes] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [educationData, setEducationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get("/forane");
      setForanes(response.data);
    } catch (error) {
      console.error("Error fetching foranes:", error);
      message.error("Failed to fetch foranes");
    }
  };

  const handleForaneChange = (value) => {
    setSelectedForane(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const fetchEducationData = async () => {
    setLoading(true);

    try {
      const config = {
        params: {}
      };
      
      if (selectedForane) {
        config.params.foraneId = selectedForane;
      }
      
    

      const response = await axiosInstance.get("/person/education/distribution", config);
      setEducationData(response.data);
    } catch (error) {
      console.error("Error fetching education data:", error);
      message.error("Failed to fetch education data. Please try again later.");
      setEducationData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForanes();
  }, []);

  useEffect(() => {
    fetchEducationData();
  }, [selectedForane]);
  
  const pieChartConfig = {
    series: educationData.map(item => item.count),
    options: {
      chart: {
        type: "pie",
        height: 450,
      },
      labels: educationData.map(item => item.educationLevel),
      legend: {
        position: "bottom",
      },
      colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
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
      <div style={{ flex: 1 }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
            Education 
          </Title>
          
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

          

          <Row gutter={[16, 16]}>
          <div style={{ flex: 1 }}>
        <ReactApexChart
          className="pie-chart"
          options={pieChartConfig.options}
          series={pieChartConfig.series}
          type="pie"
          height={450}
        />
      </div>
          </Row>
        </Card>
      </div>

     
    </div>
  );
}

export default EduChart;