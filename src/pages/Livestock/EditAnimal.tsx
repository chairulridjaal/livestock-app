import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase"; // Adjust the import according to your file structure
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

const EditAnimal = () => {
  const { animalId } = useParams(); // Get the animal ID from URL params
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<number | string>("");

  useEffect(() => {
    const fetchAnimalData = async () => {
      if (!animalId) return;

      try {
        const animalDocRef = doc(db, "animals", animalId);
        const animalDocSnap = await getDoc(animalDocRef);

        if (animalDocSnap.exists()) {
          const animalData = animalDocSnap.data();
          setName(animalData?.name || "");
          setBreed(animalData?.breed || "");
          setAge(animalData?.age || "");
        } else {
          console.error("No such animal!");
        }
      } catch (error) {
        console.error("Error fetching animal data:", error);
      }
    };

    fetchAnimalData();
  }, [animalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !breed || !age) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      // Update the animal document with the new details
      const animalDocRef = doc(db, "animals", animalId as string);
      await updateDoc(animalDocRef, {
        name,
        breed,
        age: Number(age), // Convert age to number before saving
      });

      alert("Animal updated successfully!");
      navigate("/animal-list"); // Redirect to the home page or animal list
    } catch (error) {
      console.error("Error updating animal:", error);
      alert("Failed to update animal.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this animal?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "animals", animalId as string));
      await deleteDoc(doc(db, "animals", animalId as string, "records"));
      alert("Animal deleted successfully!");
      // Optionally redirect back to the list
      navigate("/animal-list");
    } catch (error) {
      console.error("Error deleting animal:", error);
      alert("Failed to delete animal.");
    }
  };
  

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Edit Animal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Animal Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Breed</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Age</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Animal
        </button>
      </form>
    </div>
  );
};

export default EditAnimal;
