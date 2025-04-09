import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, setDoc, Timestamp, getDoc, doc, getDocs, increment, updateDoc, serverTimestamp } from "firebase/firestore";

function Record() {
  const [animalId, setAnimalId] = useState("");
  const [weight, setWeight] = useState("");
  const [health, setHealth] = useState("");
  const [feed, setFeed] = useState("");
  const [milk, setMilk] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);  
  const [animalType, setAnimalType] = useState(""); 
  const [animals, setAnimals] = useState<{ id: string; [key: string]: any }[]>([]);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const snapshot = await getDocs(collection(db, "animals"));
        const animalList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnimals(animalList);
      } catch (error) {
        console.error("Error fetching animals:", error);
      }
    };
  
    fetchAnimals();
  }, []);  

  useEffect(() => {
    const fetchAnimalType = async () => {
      if (!animalId) return;

      try {
        const animalRef = doc(db, "animals", animalId);
        const animalSnap = await getDoc(animalRef);

        if (animalSnap.exists()) {
          const animalData = animalSnap.data() as { type: string }; // explicitly type the data
          setAnimalType(animalData.type); // assuming you saved "type" as "sapi perah" or "sapi potong"
        } else {
          setAnimalType(""); // fallback if not found
        }
      } catch (error) {
        console.error("Failed to fetch animal type:", error);
        setAnimalType("");
      }
    };

    fetchAnimalType();
  }, [animalId]);

  const today = new Date().toISOString().split("T")[0];
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Input validation
    if (!animalId.trim()) return;
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) return;
    if (!feed || isNaN(Number(feed)) || Number(feed) < 0) return;
    if (!health.trim()) return;
    if (milk && (isNaN(Number(milk)) || Number(milk) < 0)) return;

    try {
      // Format date for document ID (e.g., 2025-04-09)
      const recordId = today;

      // Create the record reference
      const recordRef = doc(db, "animals", animalId, "records", recordId);

      // Set the record (will overwrite if it already exists)
      await setDoc(recordRef, {
        date: Timestamp.fromDate(new Date(today)),
        weight: parseFloat(weight),
        health,
        feed: parseFloat(feed),
        milk: milk ? parseFloat(milk) : null,
        notes,
      });

      const farmRef = doc(db, "farm", "stats");

      await updateDoc(farmRef, {
        totalMilk: milk ? increment(Number(milk)) : increment(0),
        totalFeed: increment(-Number(feed)),
        lastUpdated: serverTimestamp(),
      });

      alert("Record saved to Firebase!");

      // Reset form
      setAnimalId("");
      setWeight("");
      setHealth("");
      setFeed("");
      setMilk("");
      setNotes("");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("Failed to save record.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Animal Recording</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Animal ID */}
        <div>
          <label className="block font-medium">
            <span>
              Animal ID
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          <select
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
            className={`w-full mt-1 p-2 border rounded ${
              submitted && !animalId ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select Animal</option>
            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} ({animal.id})
              </option>
            ))}
          </select>
        </div>
        {submitted && !animalId && (
          <p className="text-red-500 text-sm mt-1">Animal ID is required</p>
        )}

        {/* Date */}
        <div>
          <label className="block font-medium">Date</label>
          <input
            type="date"
            className="w-full mt-1 p-2 border rounded"
            value={today}
            readOnly
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block font-medium">
            <span>
              Weight (kg)
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          <input
            type="number"
            className={`w-full mt-1 p-2 border rounded ${
              submitted && (!weight || Number(weight) <= 0)
                ? "border-red-500"
                : "border-gray-300"
            }`}
            value={weight}
            onBlur={() => setTouchedFields((prev) => ({ ...prev, weight: true }))}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter today's weight"
            required
          />
          {touchedFields.weight && (!weight || Number(weight) <= 0) && (
            <p className="text-red-500 text-sm mt-1">
              Weight must be a number greater than 0
            </p>
          )}
        </div>

        {/* Health */}
        <div>
          <label className="block font-medium">
            <span>
              Health Status
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          <select
            value={health}
            onChange={(e) => setHealth(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          >
            <option value="">Select status</option>
            <option value="healthy">Healthy</option>
            <option value="sick">Sick</option>
            <option value="injured">Injured</option>
          </select>
        </div>

        {/* Feed */}
        <div>
          <label className="block font-medium">
            <span>
              Feed Given (kg)
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          <input
            type="number"
            value={feed}
            onChange={(e) => setFeed(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter feed amount"
            required
          />
        </div>

        {/* Milk */}
        {animalType === "Dairy Cattle" && (
          <div>
            <label className="block font-medium">Milk Production (liters)</label>
            <input
              type="number"
              value={milk}
              onChange={(e) => setMilk(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Only if applicable"
            />
          </div>
        )}


        {/* Notes */}
        <div>
          <label className="block font-medium">Notes</label>
          <textarea
            className="w-full mt-1 p-2 border rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={
            !animalId ||
            !weight ||
            !feed ||
            !health ||
            Number(weight) <= 0 ||
            Number(feed) < 0
          }
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Save Record
        </button>
      </form>
    </div>
  );
}

export default Record;
