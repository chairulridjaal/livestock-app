import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function manageStock() {
  const [feed, setFeed] = useState(0);
  const [milk, setMilk] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updateValue, setUpdateValue] = useState({ totalFeed: "", totalMilk: "" });

  const fetchStock = async () => {
    const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
    const farmId = farmData.data()?.currentFarm;
    const stockRef = doc(db, "farms", farmId, "meta", "stats");
    const snapshot = await getDoc(stockRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setFeed(data.totalFeed || 0);
      setMilk(data.totalMilk || 0);
    } else {
      // Initialize stock document
      await setDoc(stockRef, {
        totalFeed: 0,
        totalMilk: 0,
        lastUpdated: serverTimestamp(),
      });
      setFeed(0);
      setMilk(0);
    }
  };

  const handleUpdate = async (type: "totalFeed" | "totalMilk", amount: number) => {
    if (isNaN(amount)) return;
    setLoading(true);
    try {
      const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
      const farmId = farmData.data()?.currentFarm;
      const stockRef = doc(db, "farms", farmId, "meta", "stats");
      await updateDoc(stockRef, {
        [type]: increment(amount),
        lastUpdated: serverTimestamp(),
      });
      fetchStock(); // Refresh values
      setUpdateValue((prev) => ({ ...prev, [type]: "" }));
    } catch (err) {
      console.error("Error updating stock:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <p>Feed Stock: {feed} kg</p>
          <p>Milk Stock: {milk} L</p>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["totalFeed", "totalMilk"].map((type) => (
            <div key={type}>
                <h4 className="font-medium capitalize">
                {type === "totalFeed" ? "Feed" : "Milk"} adjustment
                </h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Amount to add/remove`}
                  value={updateValue[type as "totalFeed" | "totalMilk"]}
                  onChange={(e) =>
                    setUpdateValue((prev) => ({
                      ...prev,
                      [type]: e.target.value,
                    }))
                  }
                />
                <Button
                  onClick={() =>
                    handleUpdate(
                      type as "totalFeed" | "totalMilk",
                      Number(updateValue[type as "totalFeed" | "totalMilk"])
                    )
                  }
                  disabled={loading}
                >
                  Update
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
