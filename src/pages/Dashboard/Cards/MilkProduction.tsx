import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const MilkProductionChart = () => {
  const [seriesData, setSeriesData] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week'); // default to week

  useEffect(() => {
    const fetchMilkData = async () => {
      const animalsSnapshot = await getDocs(collection(db, "animals"));
      const milkByDate: { [date: string]: number } = {};
      
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          startDate = new Date(0); // fallback to "all time"
          }

      for (const animalDoc of animalsSnapshot.docs) {
        const animalId = animalDoc.id;
        const recordsSnapshot = await getDocs(
          collection(db, "animals", animalId, "records")
        );

        recordsSnapshot.forEach((recordDoc) => {
          const record = recordDoc.data();
          const dateStr = recordDoc.id; // e.g. "2025-04-01"
          const recordDate = new Date(dateStr);
        
          if (recordDate >= startDate && record.milk) {
            if (!milkByDate[dateStr]) {
              milkByDate[dateStr] = 0;
            }
            milkByDate[dateStr] += record.milk;
          }
        });
      }

      // Sort by date
      const sortedDates = Object.keys(milkByDate).sort();
      const sortedMilk = sortedDates.map((date) =>
        parseFloat(milkByDate[date].toFixed(1))
      );
      
      setCategories(sortedDates);
      setSeriesData(sortedMilk);
    };

    fetchMilkData();
  }, [timeRange]);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth', // smooth line
      width: 3,
    },
    markers: {
      size: 4,
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        formatter: (value: string) => {
          const parsedDate = new Date(value);
          return !isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : value;
        },        
      },
    },    
    colors: ["#4F46E5"],
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(1)} L`,
      },
    },
    dataLabels: {
      enabled: true,
    },
  };

  const chartSeries = [
    {
      name: "Total Milk",
      data: seriesData,
    },
  ];

  return (
      <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-left flex-1 text-gray-800">
        Milk Production (Litre)
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
          className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="3months">This Quarter</option>
        </select>
      </div>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={250}
      />
    </div>
  );
};

export default MilkProductionChart;
