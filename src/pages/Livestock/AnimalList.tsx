// src/pages/AnimalList.tsx
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Animal {
  id: string;
  name: string;
  breed: string;
  dob: any;
}

interface Record {
  date: any;
  weight: number;
  health: string;
  feed: number;
  milk: number | null;
  notes: string;
}

const AnimalList = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [lastRecordDates, setLastRecordDates] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const animalsCollection = collection(db, "animals");
        const snapshot = await getDocs(animalsCollection);
        const animalList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Animal[];
        setAnimals(animalList);

        for (let animal of animalList) {
          const recordsCollection = collection(db, "animals", animal.id, "records");
          const recordsQuery = query(recordsCollection, orderBy("date", "desc"), limit(1));
          const recordSnapshot = await getDocs(recordsQuery);
          if (!recordSnapshot.empty) {
            const lastRecord = recordSnapshot.docs[0].data() as Record;
            const lastRecordedDate = lastRecord.date.toDate().toLocaleDateString();
            setLastRecordDates((prev) => ({
              ...prev,
              [animal.id]: lastRecordedDate,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching animals: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Animal List</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Last Recorded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.length > 0 ? (
                  animals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell>{animal.id}</TableCell>
                      <TableCell>{animal.name}</TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell>{calculateAge(animal.dob)}</TableCell>
                      <TableCell>
                        {lastRecordDates[animal.id] ? (
                          lastRecordDates[animal.id]
                        ) : (
                          <span className="text-gray-400">No records yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto">
                          <Link to={`/livestock/edit/${animal.id}`}>Edit</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No animals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalList;
