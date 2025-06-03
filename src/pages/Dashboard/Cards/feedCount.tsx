import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, getDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

const FeedCount = () => {
  const [totalFeed, setTotalFeed] = useState(0);
  const [totalCurrentFeed, setTotalCurrentFeed] = useState(0);
  const [trendPercent, setTrendPercent] = useState(0);
  const [isUp, setIsUp] = useState(true);

  useEffect(() => {
    const fetchFeedStats = async () => {
      try {
        // Get current farm ID
        const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = userDoc.data()?.currentFarm;

        // Get stock
        const stockDoc = await getDoc(doc(db, "farms", farmId, "meta", "stats"));
        if (stockDoc.exists()) {
          setTotalCurrentFeed(stockDoc.data()?.totalFeed || 0);
        }

        const animalsRef = collection(db, "farms", farmId, "animals");
        const animalsSnapshot = await getDocs(animalsRef);
        const animalIds = animalsSnapshot.docs.map(doc => doc.id);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const prevStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
        const prevEnd = thirtyDaysAgo;

        let currentFeedSum = 0;
        let previousFeedSum = 0;

        for (const animalId of animalIds) {
          const snapshot = await getDocs(collection(db, "farms", farmId, "animals", animalId, "records"));

          snapshot.forEach((doc) => {
            const data = doc.data();
            const recordDate = new Date(doc.id);
            const feedAmount = typeof data.feed === "number" ? data.feed : 0;

            if (recordDate >= thirtyDaysAgo) {
              currentFeedSum += feedAmount;
            } else if (recordDate >= prevStart && recordDate < prevEnd) {
              previousFeedSum += feedAmount;
            }
          });
        }

        setTotalFeed(currentFeedSum);

        if (previousFeedSum > 0) {
          const diff = currentFeedSum - previousFeedSum;
          const percentChange = ((diff / previousFeedSum) * 100).toFixed(1);
          setTrendPercent(Math.abs(+percentChange));
          setIsUp(diff >= 0);
        } else {
          setTrendPercent(0);
          setIsUp(true);
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
        <CardDescription>Total Feed Given</CardDescription>
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
          Feed count (current vs. previous): Stock is at <strong>{totalCurrentFeed}</strong> Kg
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeedCount;
