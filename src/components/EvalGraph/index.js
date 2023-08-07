import { useEffect, useRef } from "react";
import { parseCentipawn } from "../../utils";
import Chart from 'chart.js/auto';

export default function EvalGraph({ key, evals, history }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const labels = history.map((move, index) => `${index + 1}.${move.san}`) || [];
    const data = evals?.map((evaluation) => parseCentipawn(evaluation));

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
              borderColor: 'gray',
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
  }, [key]);

  return (
    <div key={history.join(',')}>
      <canvas ref={chartRef} width={350} height={150} />
    </div>
  );
}
