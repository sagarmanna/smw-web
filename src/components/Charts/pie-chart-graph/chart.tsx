import { useMemo } from "react";
import * as Highcharts from "highcharts";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

type PropsType = {
  data: Array<{ name: string; amount: number }>;
  type: string;
};

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

function hyphenToTitleCase(str: string): string {
  return str
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function PieChart({ data, type }: PropsType) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Use useMemo to create a stable chart configuration
  const { chartOptions, chartKey } = useMemo(() => {
    const hasData = data && data.length > 0;
    
    const options: Highcharts.Options = {
      chart: {
        type: 'pie',
        width: 300,
        height: 300,
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit'
        }
      },
      title: {
        text: ''
      },
     
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          },
          showInLegend: true,
          borderWidth: 0,
          innerSize: 0
        }
      },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemMarginTop: 5,
        itemMarginBottom: 5,
        itemStyle: {
          fontSize: '12px',
          color: isDark ? '#e5e7eb' : '#374151'
        }
      },
      series: [{
        name: 'Data',
        type: 'pie',
        data: hasData 
          ? data.map((item) => ({
              name: item.name,
              y: Number(item.amount) || 0
            }))
          : []
      }],
      credits: {
        enabled: false
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        style: {
          color: isDark ? '#e5e7eb' : '#374151'
        },
        formatter: function() {
          const point = this as { name: string; y: number };
          let label = '';
          
          switch (type) {
            case 'enrolment-gains':
              label = 'Gain count';
              break;
            case 'enrolment-losses':
              label = 'Loss count';
              break;
            case 'instruction-hours':
              label = 'Hours';
              break;
            default:
              label = 'Count';
          }
          
          return `<b>${point.name}</b><br/>${label}: ${point.y}`;
        }
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 640
          },
          chartOptions: {
            chart: {
              width: null,
              height: 300
            },
            legend: {
              align: 'center',
              verticalAlign: 'bottom',
              layout: 'horizontal'
            }
          }
        }, {
          condition: {
            maxWidth: 370
          },
          chartOptions: {
            chart: {
              width: 360,
              height: 360
            }
          }
        }]
      },
      lang: {
        noData: `No ${hyphenToTitleCase(type)} this period`
      },
      noData: {
        style: {
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: '14px'
        }
      }
    };

    const key = `${hyphenToTitleCase(type)}-${hasData ? JSON.stringify(data) : 'empty'}`;

    return {
      chartOptions: options,
      chartKey: key
    };
  }, [data, type, isDark]);

  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="dark:text-white">{`No ${hyphenToTitleCase(type)} this period`}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <HighchartsReact
        key={chartKey}
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  );
}
