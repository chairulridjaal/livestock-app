import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useTheme } from "next-themes";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MilkProductionChart = () => {
  const [seriesData, setSeriesData] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    const fetchMilkData = async () => {
      const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
      const farmId = farmData.data()?.currentFarm;

      const animalsSnapshot = await getDocs(collection(db, "farms", farmId, "animals"));
      const milkByDate: { [date: string]: number } = {};

      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          startDate = new Date(0);
      }

      for (const animalDoc of animalsSnapshot.docs) {
        const animalId = animalDoc.id;
        const recordsSnapshot = await getDocs(collection(db, "farms", farmId, "animals", animalId, "records"));

        recordsSnapshot.forEach((recordDoc) => {
          const record = recordDoc.data();
          const dateStr = recordDoc.id;
          const recordDate = new Date(dateStr);

          if (recordDate >= startDate && record.milk) {
            milkByDate[dateStr] = (milkByDate[dateStr] || 0) + record.milk;
          }
        });
      }

      const sortedDates = Object.keys(milkByDate).sort();
      const sortedMilk = sortedDates.map((date) =>
        parseFloat(milkByDate[date].toFixed(1))
      );

      setCategories(sortedDates);
      setSeriesData(sortedMilk);
    };

    fetchMilkData();
  }, [timeRange]);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent', 
    },
    theme: {
      mode: theme === "dark" ? "dark" : "light",
    },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4 },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: {
          colors: isDark ? "#cbd5e1" : "#334155", // lighter in dark mode
        },
        formatter: (value: string) => {
          const parsedDate = new Date(value);
          return !isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : value;
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#cbd5e1" : "#334155", // light-gray in dark, dark-gray in light mode
        }
      }
    },
    colors: [isDark ? "#6366f1" : "#4F46E5"], 
    tooltip: {
      theme: isDark ? "light" : "dark",
      y: { formatter: (val: number) => `${val.toFixed(1)} L` },
    },
    dataLabels: { enabled: true },
  };  

  const chartSeries = [{ name: "Total Milk", data: seriesData }];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
      <h2 className="text-md font-semibold text-foreground">Milk Production (L)</h2>
      <Select value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'quarter')}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Chart options={chartOptions} series={chartSeries} type="line" height={250} />
    </div>
  );
};

export default MilkProductionChart;
