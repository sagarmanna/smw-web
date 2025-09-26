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
        width: null,
        height: 350,
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
            maxWidth: 768
          },
          chartOptions: {
            chart: {
              width: null,
              height: 400
            },
            legend: {
              align: 'center',
              verticalAlign: 'bottom',
              layout: 'horizontal',
              itemStyle: {
                fontSize: '13px'
              }
            }
          }
        }, {
          condition: {
            maxWidth: 480
          },
          chartOptions: {
            chart: {
              width: null,
              height: 380
            },
            legend: {
              align: 'center',
              verticalAlign: 'bottom',
              layout: 'horizontal',
              itemStyle: {
                fontSize: '12px'
              }
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          {/* Modern empty state with gradient background */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            {/* Animated dots */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-100"></div>
          </div>
          
          {/* Modern text styling */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              No Data Available
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
              {`No ${hyphenToTitleCase(type)} found for the selected period`}
            </p>
          </div>
          
          {/* Subtle decorative elements */}
          <div className="mt-6 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <HighchartsReact
        key={chartKey}
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  );
}
