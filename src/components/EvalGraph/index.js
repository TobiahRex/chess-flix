import { useEffect, useRef } from "react";
import { parseCentipawn } from "../../utils";
import Chart from 'chart.js/auto';

export default function EvalGraph({ gameData, gameRef }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const labels = gameRef.current?.history({ verbose: true }).map((move, index) => `${index + 1}.${move.san}`);
    const data = gameData.evaluations.map((evaluation) => parseCentipawn(evaluation));

    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              borderColor: 'rgba(0, 0, 250, 0.4)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 1,
              backgroundColor: (ctx) => {
                const values = ctx.chart.data.datasets[0].data;
                const colors = values.map(value => value >= 0 ? 'rgba(10, 255, 10, 1)' : 'rgba(255, 0, 0, 0.7)');
                return colors;
              },
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [gameData, gameRef]);

  return (
    <div>
      <canvas ref={chartRef} minWidth={350} height={150} />
    </div>
  );
}
