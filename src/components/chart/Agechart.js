import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axiosInstance from "../../axiosConfig";
import { Typography, Card, Col, Row, Select, message } from "antd";
import { TeamOutlined } from "@ant-design/icons";

function AgeChart() {
  const { Title } = Typography;
  const [foranes, setForanes] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [ageData, setAgeData] = useState([]);
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

  const fetchAgeData = async () => {
    setLoading(true);
    try {
      const config = {
        params: {}
      };
      
      if (selectedForane) {
        config.params.foraneId = selectedForane;
      }

      const response = await axiosInstance.get("/person/age-groups/distribution", config);
      setAgeData(response.data);
    } catch (error) {
      console.error("Error fetching age data:", error);
      message.error("Failed to fetch age data");
      setAgeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForanes();
  }, []);

  useEffect(() => {
    fetchAgeData();
  }, [selectedForane]);

  const barChartConfig = {
    series: [{
      name: 'Population',
      data: ageData.map(item => item.count)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 450
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          dataLabels: {
            position: 'top',
          },
        }
      },
      colors: [
        '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', 
        '#13c2c2', '#eb2f96', '#fa541c'
      ],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetX: 20,
        style: {
          fontSize: '12px',
          colors: ['#000']
        }
      },
      xaxis: {
        categories: ageData.map(item => item._id),
        title: {
          text: 'Number of Persons'
        }
      },
      yaxis: {
        title: {
          text: 'Age Groups'
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return `${val} persons`;
          }
        }
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
              Age Distribution
            </Title>
            
            <div style={{ marginBottom: "16px", textAlign: "center" }}>
              <Select
                value={selectedForane}
                onChange={handleForaneChange}
                style={{ width: "50%" }}
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

            

            <div style={{ marginTop: "20px" }}>
              <ReactApexChart
                options={barChartConfig.options}
                series={barChartConfig.series}
                type="bar"
                height={450}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AgeChart;