import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axiosInstance from "../../axiosConfig";
import { Typography, Card, Col, Row, Select, message } from "antd";
import { UserOutlined } from "@ant-design/icons";

function OccupationChart() {
  const { Title } = Typography;
  const [foranes, setForanes] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [occupationData, setOccupationData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch foranes
  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get("/forane");
      setForanes(response.data);
    } catch (error) {
      console.error("Error fetching foranes:", error);
      message.error("Failed to fetch foranes");
    }
  };

  // Handle forane change
  const handleForaneChange = (value) => {
    setSelectedForane(value);
  };

  // Fetch occupation data
  const fetchOccupationData = async () => {
    setLoading(true);
    try {
      const config = {
        params: {}
      };
      
      if (selectedForane) {
        config.params.foraneId = selectedForane;
      }

      const response = await axiosInstance.get("/person/occupation/distribution", config);
      setOccupationData(response.data);
    } catch (error) {
      console.error("Error fetching occupation data:", error);
      message.error("Failed to fetch occupation data");
      setOccupationData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForanes();
  }, []);

  useEffect(() => {
    fetchOccupationData();
  }, [selectedForane]);

  const pieChartConfig = {
    series: occupationData.map(item => item.count),
    options: {
      chart: {
        type: "pie",
        height: 450,
      },
      labels: occupationData.map(item => item.occupationLevel),
      legend: {
        position: "bottom",
        fontSize: "14px",
      },
      colors: [
        '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', 
        '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb',
        '#fa8c16', '#fadb14', '#a8071a', '#531dab', '#87e8de',
        '#ffd666', '#ff85c0', '#9254de', '#36cfc9', '#597ef7'
      ],
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
            Occupation 
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
            {occupationData.map((occupation, index) => (
              <Col xs={6} sm={6} md={6} lg={6} xl={6} key={index}>
                <Card
                  bordered={false}
                  style={{
                    backgroundColor: "#f0f2f5",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <UserOutlined 
                    style={{ 
                      fontSize: "24px", 
                      color: pieChartConfig.options.colors[index % pieChartConfig.options.colors.length] 
                    }} 
                  />
                  <p style={{ 
                    fontSize: "10px", 
                    margin: "10px 0 0", 
                    fontWeight: "bold",
                    height: "40px", // Fixed height for title
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {occupation.occupationLevel}
                  </p>
                  <p style={{ fontSize: "16px", margin: "0" }}>
                    {loading ? "Loading..." : occupation.count}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      <div style={{ flex: 1 }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ReactApexChart
            options={pieChartConfig.options}
            series={pieChartConfig.series}
            type="pie"
            height={550}
          />
        </Card>
      </div>
    </div>
  );
}

export default OccupationChart;