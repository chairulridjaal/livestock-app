import { db, auth } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy, limit } from "firebase/firestore";

// Animal types
interface Animal {
  id: string;
  name: string;
  breed: string;
  dob: any;
  status: string[];
  lastRecordedDate?: string; // optional
}

interface Record {
  date: any;
  weight: number;
  health: string;
  feed: number;
  milk: number | null;
  notes: string;
}

// Fetch function (pure, no React hooks)
async function getData(): Promise<Animal[]> {
  const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid!));
  const farmId = userDoc.data()?.currentFarm;
  if (!farmId) return [];

  const animalsSnapshot = await getDocs(collection(db, "farms", farmId, "animals"));
  const animals: Animal[] = [];

  for (const docSnap of animalsSnapshot.docs) {
    const animalData = docSnap.data() as Animal;
    const animalId = docSnap.id;

    // Fetch latest record
    const recordSnapshot = await getDocs(
      query(
        collection(db, "farms", farmId, "animals", animalId, "records"),
        orderBy("date", "desc"),
        limit(1)
      )
    );

    let lastRecordedDate = null;
    if (!recordSnapshot.empty) {
      const lastRecord = recordSnapshot.docs[0].data() as Record;
      lastRecordedDate = lastRecord.date.toDate().toLocaleDateString();
    }

    animals.push({
      ...animalData,
      id: animalId,
      lastRecordedDate,
    });
  }

  return animals;
}

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";

export function AnimalList() {
  const [data, setData] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData().then((animals) => {
      setData(animals);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Animal List</h1>
        <p className="py-2 text-sm text-gray-500">
          Here you can view and manage all your animals.
        </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => console.log("Add Animal")}>
          Add Animal
        </Button>
      </div>
      <div className="">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}

export default AnimalList;


