import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

const FeedCount = () => {
  const [totalFeed, setTotalFeed] = useState(0);
  const [trendPercent, setTrendPercent] = useState(0);
  const [isUp, setIsUp] = useState(true);

  useEffect(() => {
    const fetchFeedStats = async () => {
      try {
        const recordsRef = collection(db, "farm", "stats", "records");

        // Query to fetch the two most recent records (current and previous)
        const q = query(recordsRef, orderBy("timestamp", "desc"), limit(2));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => doc.data());

        if (data.length >= 1) {
          const current = data[0]?.totalFeed || 0;
          setTotalFeed(current);

          if (data.length === 2) {
            const previous = data[1]?.totalFeed || 0;

            const diff = current - previous;
            const percentChange = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : 0;
            setTrendPercent(Math.abs(+percentChange));
            setIsUp(diff >= 0);
          }
        }
      } catch (error) {
        console.error("Error fetching feed stats:", error);
      }
    };

    fetchFeedStats();
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Total Feed</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {totalFeed} Kg
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
          Feed count (current vs. previous)
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeedCount;