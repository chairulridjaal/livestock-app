import { useEffect, useState } from "react";
import { db } from "../../lib/firebase"; // Adjusted the import path to match the correct file structure
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Link } from "react-router-dom";

interface Animal {
  id: string;
  name: string;
  breed: string;
  dob: any; // The Firestore Timestamp for the date of birth
}

interface Record {
  date: any;  // The Firestore Timestamp
  weight: number;
  health: string;
  feed: number;
  milk: number | null;
  notes: string;
}

const AnimalList = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [lastRecordDates, setLastRecordDates] = useState<{ [key: string]: string }>({}); // To store the last record date for each animal

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const animalsCollection = collection(db, "animals");
        const snapshot = await getDocs(animalsCollection);
        const animalList = snapshot.docs.map((doc) => ({
          id: doc.id, // Assuming Firestore document ID is the animal's unique ID
          ...doc.data(),
        })) as Animal[];
        setAnimals(animalList);

        // Fetch the most recent record for each animal
        for (let animal of animalList) {
          const recordsCollection = collection(db, "animals", animal.id, "records");
          const recordsQuery = query(recordsCollection, orderBy("date", "desc"), limit(1));
          const recordSnapshot = await getDocs(recordsQuery);
          if (!recordSnapshot.empty) {
            const lastRecord = recordSnapshot.docs[0].data() as Record;
            const lastRecordedDate = lastRecord.date.toDate().toLocaleDateString(); // Convert Firestore Timestamp to Date string
            setLastRecordDates((prev) => ({
              ...prev,
              [animal.id]: lastRecordedDate,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching animals: ", error);
      }
    };

    fetchAnimals();
  }, []);

  // Function to calculate the age from dob
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob); // Convert the dob string into a JavaScript Date object
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };  

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Animal List</h1>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border-b text-left">ID</th>
            <th className="p-2 border-b text-left">Name</th>
            <th className="p-2 border-b text-left">Breed</th>
            <th className="p-2 border-b text-left">Age</th>
            <th className="p-2 border-b text-left">Last Recorded</th>
            <th className="p-2 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {animals.length > 0 ? (
            animals.map((animal) => (
              <tr key={animal.id}>
                <td className="p-2 border-b">{animal.id}</td>
                <td className="p-2 border-b">{animal.name}</td>
                <td className="p-2 border-b">{animal.breed}</td>
                <td className="p-2 border-b">{calculateAge(animal.dob)}</td>
                <td className="p-2 border-b">
                  {lastRecordDates[animal.id] ? (
                    lastRecordDates[animal.id]
                  ) : (
                    <span>No records yet</span>
                  )}
                </td>
                <td className="p-2 border-b">
                  <Link to={`/livestock/edit/${animal.id}`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-2 text-center text-gray-500">
                No animals found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AnimalList;
