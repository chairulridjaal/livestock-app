import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

export default function ManageBreeds() {
  const [breeds, setBreeds] = useState<{ id: string; name: string }[]>([]);
  const [newBreed, setNewBreed] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const breedsRef = collection(db, "farm", "information", "breeds");

  const fetchBreeds = async () => {
    try {
      const snapshot = await getDocs(breedsRef);
      const breedList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        name: docSnap.data().name,
      }));
      setBreeds(breedList);
    } catch (error) {
      console.error("Error fetching breeds:", error);
      setStatus("❌ Failed to load breeds.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBreed = async () => {
    if (!newBreed.trim()) return;
    try {
      await addDoc(breedsRef, { name: newBreed.trim() });
      setStatus("✅ Breed added!");
      setNewBreed("");
      fetchBreeds();
    } catch (error) {
      console.error("Error adding breed:", error);
      setStatus("❌ Failed to add breed.");
    }
  };

  const handleDeleteBreed = async (id: string) => {
    try {
      await deleteDoc(doc(breedsRef, id));
      setStatus("🗑️ Breed deleted.");
      fetchBreeds();
    } catch (error) {
      console.error("Error deleting breed:", error);
      setStatus("❌ Failed to delete breed.");
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h2 className="text-lg font-semibold">Manage Breeds</h2>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : breeds.length === 0 ? (
        <p className="text-sm text-muted-foreground">No breeds added yet.</p>
      ) : (
        <ul className="space-y-2">
          {breeds.map((breed) => (
            <li
              key={breed.id}
              className="flex justify-between items-center border rounded px-3 py-2"
            >
              <span>{breed.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteBreed(breed.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <Label htmlFor="newBreed">Add New Breed</Label>
        <div className="flex gap-2">
          <Input
            id="newBreed"
            placeholder="e.g. Holstein"
            value={newBreed}
            onChange={(e) => setNewBreed(e.target.value)}
          />
          <Button onClick={handleAddBreed} disabled={!newBreed.trim()}>
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
