"use client";

import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: Array<{ x: string; y: number }>;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function PaymentsOverviewChart({ data }: PropsType) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Calculate min/max and step size for y-axis with padding
  const values = data.map((d) => d.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  
  // Calculate appropriate padding based on the data range
  const range = maxY - minY;
  const padding = Math.max(range * 0.1, 1000); // 10% padding or minimum 1000
  
  // Calculate y-axis min and max with proper padding
  const yAxisMin = Math.max(0, Math.floor(minY - padding));
  const yAxisMax = Math.ceil(maxY + padding);
  
  // Calculate appropriate tick interval based on the range
  // const tickInterval = Math.ceil(range / 5); // Aim for ~5 ticks

  // Create a formatter function that always shows shortened format for better readability
  const formatYAxisValue = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    } else {
      return value.toLocaleString();
    }
  };

  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend for cleaner look
    },
    colors: ["#f5503b"], // Use your primary color
    chart: {
      height: 350,
      type: "area", // Changed to area for modern look
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, system-ui, sans-serif",
      background: "transparent",
      zoom: {
        enabled: false,
      },
      selection: {
        enabled: false,
      },
      dropShadow: {
        enabled: true,
        color: isDark ? "#f5503b" : "#f5503b",
        top: 0,
        left: 0,
        blur: 8,
        opacity: isDark ? 0.25 : 0.15,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: isDark ? ["#f5503b", "#ff6b5b"] : ["#ff6b5b", "#f5503b"], // Primary color gradient
        inverseColors: false,
        opacityFrom: isDark ? 0.9 : 0.8,
        opacityTo: isDark ? 0.2 : 0.1,
        stops: [0, 100],
      },
    },
    markers: {
      size: 6,
      colors: [isDark ? "#1f2937" : "#ffffff"],
      strokeColors: isDark ? "#f5503b" : "#f5503b",
      strokeWidth: 3,
      strokeOpacity: 1,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      shape: "circle",
      hover: {
        size: 8,
        sizeOffset: 2,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 320,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
      width: 3,
      lineCap: "round",
    },
    grid: {
      borderColor: isDark ? "#374151" : "#e5e7eb",
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      theme: isDark ? "dark" : "light",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      marker: {
        show: true,
      },
      y: {
        formatter: function (value: number) {
          return `$${value.toLocaleString()}`;
        },
        title: {
          formatter: () => "Revenue: ",
        },
      },
      x: {
        show: true,
        formatter: (value: number) => {
          // The value is the index, so we can get the month name directly
          if (value >= 0 && value < data.length + 1) {
            return data[value - 1]?.x || '';
          }
          return value.toString();
        },
      },
    },
    xaxis: {
      type: "category",
      categories: data.map((d) => d.x),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: isDark ? "#9ca3af" : "#6b7280",
          fontSize: "12px",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
        },
      },
      title: {
        text: "Month",
        style: {
          color: isDark ? "#f3f4f6" : "#374151",
          fontSize: "14px",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 600,
        },
        offsetY: 10,
      },
    },
    yaxis: {
      min: yAxisMin,
      max: yAxisMax,
      labels: {
        formatter: formatYAxisValue,
        style: {
          colors: isDark ? "#9ca3af" : "#6b7280",
          fontSize: "12px",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
        },
      },
      title: {
        text: "Revenue",
        style: {
          color: isDark ? "#f3f4f6" : "#374151",
          fontSize: "14px",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 600,
        },
        offsetX: 0,
      },
    },
  };

  return (
    <div className="h-[350px]">
      <Chart
        options={options}
        series={[
          {
            name: "Revenue",
            data: data,
          },
        ]}
        type="area"
        height={350}
      />
    </div>
  );
}
