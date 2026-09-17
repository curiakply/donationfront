const lineChart = {
  series: [
    {
      name: "Total Amount",
      data: [50000, 75000, 100000], // Replace with actual total amount data for each year
      offsetY: 0,
    },
    {
      name: "Total Participants",
      data: [200, 300, 400], // Replace with actual total participants data for each year
      offsetY: 0,
    },
  ],

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
        opposite: false,
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
      categories: ["2020", "2021", "2022"], // Replace with actual years from your backend data
    },

    tooltip: {
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
  },
};

export default lineChart;
