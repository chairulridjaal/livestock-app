import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, doc} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import MilkProductionChart from "./Cards/MilkProduction";
import AnimalCount from "./Cards/animalCount"; 
import FeedCount from "./Cards/feedCount";
import MilkCount from "./Cards/milkCount"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // using shadcn Card
import { Separator } from "@/components/ui/separator"; // optional for clean divider
import { Badge } from "@/components/ui/badge"; // optional to show weight nicely
import { CalendarDays } from "lucide-react"; // simple Heroicon (calendar)

function Dashboard() {
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
      const farmId = farmData.data()?.currentFarm;

      const animalsSnapshot = await getDocs(collection(db, "farms", farmId, "animals"));
      const animalDocs = animalsSnapshot.docs;

      let allRecentRecords: any[] = [];

      for (const animal of animalDocs) {
        const recordsSnapshot = await getDocs(collection(db, "farms", farmId, "animals", animal.id, "records"));
        const records = recordsSnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: animal.id, date: data.date, weight: data.weight };
        });

        if (records.length > 0) {
          const latest = records.sort((a, b) => b.date?.seconds - a.date?.seconds)[0];
          allRecentRecords.push({ ...latest, animalId: animal.id });
        }
      }

      allRecentRecords.sort((a, b) => b.date?.seconds - a.date?.seconds);
      setRecentRecords(allRecentRecords.slice(0, 5));
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimalCount />
        <FeedCount />
        <MilkCount />
      </div>

      {/* Milk Production Chart */}
      <div className="grid grid-cols-1 gap-2">
        <Card>
          <CardContent className="mt-4">
            <MilkProductionChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> Recent Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {recentRecords.length > 0 ? (
              recentRecords.map((record, index) => (
                <li key={index} className="flex flex-col">
                  <span className="font-medium">🐄 {record.animalId}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">Weight: {record.weight}kg</Badge>
                    <span>•</span>
                    <span>{record.date?.toDate().toLocaleDateString()}</span>
                  </div>
                  {index < recentRecords.length - 1 && <Separator className="my-2" />}
                </li>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No recent records found.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
