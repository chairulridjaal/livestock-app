// src/pages/FarmStats.tsx
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

export default function FarmStats() {
  const [stats, setStats] = useState({
    totalMilk: 0,
    totalFeed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const farmRef = doc(db, "farm", "stats");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snap = await getDoc(farmRef);
        if (snap.exists()) {
          const data = snap.data();
          setStats({
            totalMilk: data.totalMilk || 0,
            totalFeed: data.totalFeed || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStatus("❌ Failed to fetch stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStats((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSave = async () => {
    try {
      await setDoc(farmRef, {
        ...stats,
        lastUpdated: serverTimestamp(),
      });
      setStatus("✅ Stats updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      setStatus("❌ Update failed. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Farm Stats</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="totalMilk">Total Milk (L)</Label>
            <Input
              id="totalMilk"
              type="number"
              name="totalMilk"
              value={stats.totalMilk}
              onChange={handleChange}
              placeholder="Enter total milk produced"
            />
          </div>

          <div>
            <Label htmlFor="totalFeed">Total Feed (Kg)</Label>
            <Input
              id="totalFeed"
              type="number"
              name="totalFeed"
              value={stats.totalFeed}
              onChange={handleChange}
              placeholder="Enter total feed available"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start space-y-4">
          <Button onClick={handleSave} className="w-full">
            Save Stats
          </Button>
          {status && (
            <p className="text-sm text-muted-foreground">{status}</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
