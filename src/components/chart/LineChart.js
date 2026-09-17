/*!
  =========================================================
  * Muse Ant Design Dashboard - v1.0.0
  =========================================================
  * Product Page: https://www.creative-tim.com/product/muse-ant-design-dashboard
  * Copyright 2021 Creative Tim (https://www.creative-tim.com)
  * Licensed under MIT (https://github.com/creativetimofficial/muse-ant-design-dashboard/blob/main/LICENSE.md)
  * Coded by Creative Tim
  =========================================================
  * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";
import { MinusOutlined } from "@ant-design/icons";
import lineChart from "./configs/lineChart";
import axiosInstance from "../../axiosConfig";
function LineChart({ selectedYear }) {
  const { Title, Paragraph } = Typography;
  const [lineChartData, setLineChartData] = useState({
    options: {
      chart: {
        width: "100%",
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: true,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      yaxis: [
        {
          labels: {
            style: {
              fontSize: "14px",
              fontWeight: 600,
              colors: ["#8c8c8c"],
            },
          },
          title: {
            text: "Total Amount",
          },
        },
        {
          opposite: true,
          labels: {
            style: {
              fontSize: "14px",
              fontWeight: 600,
              colors: ["#8c8c8c"],
            },
          },
          title: {
            text: "Total Participants",
          },
        },
      ],
      xaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: ["#8c8c8c"],
          },
        },
        categories: [], // Empty initially, will be populated dynamically
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
    },
    series: [
      {
        name: "Total Amount",
        data: [], // Empty initially, will be populated dynamically
        offsetY: 0,
      },
      {
        name: "Total Participants",
        data: [], // Empty initially, will be populated dynamically
        offsetY: 0,
      },
    ],
  });

  useEffect(() => {
    const fetchYearlyData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axiosInstance.get(`/transaction/yearlytotal/`);
        const data = response.data;

        // Extract data for chart
        const years = data.map(item => item.year); // Extract years
        const participantsData = data.map(item => item.totalParticipants); // Extract totalParticipants data
        const amountData = data.map(item => item.totalAmount); // Extract totalAmount data

        setLineChartData({
          options: {
            ...lineChartData.options,
            xaxis: {
              categories: years, // Set years dynamically as x-axis categories
            },
          },
          series: [
            { name: "Total Amount", data: amountData }, // Set totalAmount data for the series
            { name: "Total Participants", data: participantsData }, // Set totalParticipants data for the series
          ],
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchYearlyData();
  }, []);
  return (
    <>
      <div className="linechart">
        <div>
          <Title level={5}>Total Amount Year Wise</Title>
          <Paragraph className="lastweek">
            than last year <span className="bnb2">+30%</span>
          </Paragraph>
        </div>
        <div className="sales">
          <ul>
            <li>{<MinusOutlined />} Total Amount</li>
            <li>{<MinusOutlined />} No of Contrubution</li>
          </ul>
        </div>
      </div>

      <ReactApexChart
        className="full-width"
        options={lineChartData.options}
        series={lineChartData.series}
        type="area"
        height={350}
        width={"100%"}
      />
    </>
  );
}

export default LineChart;
