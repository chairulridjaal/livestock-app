import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";  // Import Firestore db instance
import { collection, setDoc, getDocs, doc } from "firebase/firestore";  // For adding new document and getting existing docs
import { Timestamp } from "firebase/firestore"; // To handle date format

function AddAnimal() {
  const [name, setName] = useState("");  // Animal Name
  const [breed, setBreed] = useState("");  // Animal Breed
  const [dob, setDOB] = useState("");  // Animal Date of Birth
  const [id, setId] = useState("");  // Animal ID (auto-generated)
  const [type, setType] = useState("");  // Animal Type (e.g., cow, goat, etc.)
  const [error, setError] = useState("");  // To store error messages

  // Fetch the current animals to generate the next ID
  useEffect(() => {
    const fetchAnimalIds = async () => {
      try {
        const animalCollection = collection(db, "animals");
        const snapshot = await getDocs(animalCollection);
        const animals = snapshot.docs.map(doc => doc.data());

        // If no animals exist, start with cow-001
        if (animals.length === 0) {
          setId("cow-001");
          return;
        }

        // If animals exist, get the last animal's ID
        const lastId = animals[animals.length - 1].id;

        if (lastId) {
          // Get the numeric part of the last ID (e.g., "cow-001" => 1)
          const lastNumber = parseInt(lastId.split('-')[1]);
          const nextId = `cow-${String(lastNumber + 1).padStart(3, '0')}`; // Generate the next ID
          setId(nextId);
        } else {
          // Fallback if the lastId is missing or malformed
          setId("cow-001");
        }
      } catch (error) {
        console.error("Error fetching animal IDs:", error);
      }
    };

    fetchAnimalIds();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if fields are filled
    if (!name || !breed || !dob || !id || !type) {
      return alert("Please fill all fields.");
    }

    // Convert dob to a Date object and check if it's a future date
    const formattedDOB = new Date(dob); // Use the date string in yyyy-mm-dd format

    // Check if the DOB is in the future
    const today = new Date();
    if (formattedDOB > today) {
      setError("Date of birth cannot be in the future.");
      return; // Prevent form submission if DOB is in the future
    } else {
      setError(""); // Clear error if DOB is valid
    }

    try {
      const birthDate = formattedDOB; // Store it directly as Date object for Firestore

      // Add the new animal document with the fields (id, name, breed, dob)
      await setDoc(doc(db, "animals", id), {
        id, 
        name,
        breed,
        type,
        dob: Timestamp.fromDate(birthDate),  // Save dob as a Firestore Timestamp
      });

      alert("New animal added!");

      // Reset form
      setName("");
      setBreed("");
      setDOB("");
    } catch (error) {
      console.error("Error adding animal:", error);
      alert("Failed to add animal.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Add New Animal</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>

        {/* Name */}
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

          {/* Type */}
          <div>
            <label className="block font-medium">Type</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="" className="text-gray-600"> Select Type </option>
              <option value="Beef Cattle">Beef Cattle (Sapi Potong)</option>
              <option value="Dairy Cattle">Dairy Cattle (Sapi Perah)</option>
            </select>
          </div>

        {/* Breed */}
        <div>
          <label className="block font-medium">Breed</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            required
          />
        </div>

        {/* Date of Birth (DOB) */}
        <div>
          <label className="block font-medium">Date of Birth</label>
          <input
            type="date"
            className="w-full mt-1 p-2 border rounded"
            value={dob}
            onChange={(e) => setDOB(e.target.value)}  // Update dob field
            required
          />
        </div>

        {/* Error message */}
        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Animal
        </button>
      </form>
    </div>
  );
}

export default AddAnimal;
