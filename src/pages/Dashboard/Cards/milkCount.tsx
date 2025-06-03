import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
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
        const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = userDoc.data()?.currentFarm;

        const animalsSnapshot = await getDocs(collection(db, "farms", farmId, "animals"));
        const animalIds = animalsSnapshot.docs.map((doc) => doc.id);

        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const prevThirtyDaysAgo = new Date(thirtyDaysAgo);
        prevThirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let totalMilkSum = 0;
        let prevMilkSum = 0;

        for (const animalId of animalIds) {
          const recordsSnapshot = await getDocs(
            collection(db, "farms", farmId, "animals", animalId, "records")
          );

          recordsSnapshot.forEach((recordDoc) => {
            const data = recordDoc.data();
            const recordDate = new Date(recordDoc.id); // Assuming ID is a date string like "2025-05-30"
            const milk = typeof data.milk === "number" ? data.milk : 0;

            if (recordDate >= thirtyDaysAgo) {
              totalMilkSum += milk;
            } else if (recordDate >= prevThirtyDaysAgo && recordDate < thirtyDaysAgo) {
              prevMilkSum += milk;
            }
          });
        }

        setTotalMilk(totalMilkSum);

        if (prevMilkSum > 0) {
          const diff = totalMilkSum - prevMilkSum;
          const percentChange = ((diff / prevMilkSum) * 100);
          setTrendPercent(Math.abs(+percentChange.toFixed(1)));
          setIsUp(diff >= 0);
        } else {
          setTrendPercent(0);
          setIsUp(true);
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
