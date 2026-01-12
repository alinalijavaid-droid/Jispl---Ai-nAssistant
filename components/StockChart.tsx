import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface StockChartProps {
  title: string;
  labels: string[];
  data: number[];
  datasetLabel?: string;
}

const StockChart: React.FC<StockChartProps> = ({ title, labels, data, datasetLabel = 'Price' }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: datasetLabel,
                data: data,
                borderColor: '#10B981', // Tailwind green-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#059669',
                pointHoverRadius: 5,
                fill: true,
                tension: 0.3, // Smooth curves
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
              },
              title: {
                display: true,
                text: title,
                font: {
                    family: "'Inter', sans-serif",
                    size: 14,
                    weight: 'bold'
                },
                color: '#374151'
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1F2937',
                bodyColor: '#1F2937',
                borderColor: '#E5E7EB',
                borderWidth: 1,
              }
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
              },
              y: {
                grid: {
                  color: '#F3F4F6',
                },
                beginAtZero: false, 
                ticks: {
                    font: {
                        size: 10
                    }
                }
              },
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, data, title, datasetLabel]);

  return (
    <div className="w-full h-64 sm:h-80 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-2">
      <canvas ref={chartRef} />
    </div>
  );
};

export default StockChart;