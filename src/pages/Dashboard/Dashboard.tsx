import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import MilkProductionChart from "./Cards/MilkProduction";

function Dashboard() {
  const [animalCount, setAnimalCount] = useState(0);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchSummary = async () => {
      const animalsSnapshot = await getDocs(collection(db, "animals"));
      const animalDocs = animalsSnapshot.docs;
      setAnimalCount(animalDocs.length);

      let allRecentRecords: any[] = [];

      for (const animal of animalDocs) {
        const recordsSnapshot = await getDocs(collection(db, "animals", animal.id, "records"));
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
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="space-y-6">
        {/* Stats Grid - full width */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow p-4 rounded">
            <p className="text-sm text-gray-600">Total Animals</p>
            <p className="text-2xl font-bold">{animalCount}</p>
          </div>
          {/* You can add more stat cards here if needed */}
        </div>

        {/* Smaller Milk Chart box below */}
        <div className="max-w-lg"> {/* max-w-sm = 24rem (1/3 width) */}
          <div className="bg-white shadow p-4 rounded">
            <MilkProductionChart />
          </div>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded mt-4">
        <h2 className="text-xl font-semibold mb-2">Recent Records</h2>
        <ul className="divide-y">
          {recentRecords.map((record, index) => (
            <li key={index} className="py-2">
              🐄 <strong>{record.animalId}</strong> | Weight: {record.weight}kg | Date:{" "}
              {record.date?.toDate().toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
