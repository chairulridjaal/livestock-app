import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, getDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

const AnimalCount = () => {
  const [animalCount, setAnimalCount] = useState(0);
  const [trendPercent, setTrendPercent] = useState(0);
  const [isUp, setIsUp] = useState(true);

  useEffect(() => {
    const fetchAnimalCount = async () => {
      try {
        // Fetch current animal count from the "animals" collection
          const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
          const farmId = farmData.data()?.currentFarm;
        const animalsSnapshot = await getDocs(collection(db, "farms", farmId, "animals"));
        setAnimalCount(animalsSnapshot.docs.length);

        // Fetch the previous month's animal count from the "farm/stats/records" collection
        const recordsRef = collection(db, "farms", farmId, "meta", "stats", "records");
        const q = query(recordsRef, orderBy("timestamp", "desc"), limit(2)); // Use the timestamp to get the most recent records
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => doc.data());
        
        if (data.length >= 2) {
          const previous = data[1]?.livestockCount || 0;
          const diff = animalCount - previous;
          const percentChange = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : 0;
          setTrendPercent(Math.abs(+percentChange));
          setIsUp(diff >= 0);
        }
      } catch (error) {
        console.error("Error fetching animal count:", error);
      }
    };

    fetchAnimalCount();
  }, [animalCount]); // Re-run when animalCount changes

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Total Animals</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {animalCount}
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
          Livestock count (current vs. previous)
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnimalCount;
