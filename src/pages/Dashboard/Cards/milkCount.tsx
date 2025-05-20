import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

const MilkCount = () => {
  const [totalMilk, setTotalMilk] = useState(0);
  const [trendPercent, setTrendPercent] = useState(0);
  const [isUp, setIsUp] = useState(true);

  useEffect(() => {
    const fetchMilkStats = async () => {
      try {
        // Fetch milk stats from the records
        const recordsRef = collection(db, "farm", "farm-001", "meta", "stats", "records");
        const q = query(recordsRef, orderBy("timestamp", "desc"), limit(2)); // Order by timestamp for the last 2 records
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => doc.data());
            
        if (data.length >= 1) {
          const current = data[0]?.totalMilk || 0;
          setTotalMilk(current);

          if (data.length === 2) {
            const previous = data[1]?.totalMilk || 1;
            const diff = current - previous;
            const percentChange = ((diff / previous) * 100).toFixed(1);
            setTrendPercent(Math.abs(+percentChange));
            setIsUp(diff >= 0);
          }
        }
      } catch (error) {
        console.error("Error fetching milk stats:", error);
      }
    };

    fetchMilkStats();
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Total Milk Produced</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {totalMilk} Litre
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
            {isUp ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
            {isUp ? "+" : "-"}
            {trendPercent}%
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {isUp ? "Trending up this month" : "Trending down this month"}
          {isUp ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
        </div>
        <div className="text-muted-foreground">
          Milk count (current vs. previous)
        </div>
      </CardFooter>
    </Card>
  );
};

export default MilkCount;
