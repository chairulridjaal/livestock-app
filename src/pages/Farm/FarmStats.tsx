  // src/pages/FarmSettings.tsx
  import { useState, useEffect } from "react";
  import { db } from "../../lib/firebase";
  import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
  } from "firebase/firestore";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";

  export default function FarmSettings() {
    const [farmProfile, setFarmProfile] = useState({
      farmName: "",
      location: "",
      owner: "",
    });

    const [breeds, setBreeds] = useState<{ id: string; name: string; description: string }[]>([]);
    const [newBreed, setNewBreed] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    const farmRef = doc(db, "farm", "information");
    const breedsRef = collection(db, "farm", "information", "breeds");

    useEffect(() => {
      const fetchData = async () => {
        try {
          const snap = await getDoc(farmRef);
          if (snap.exists()) {
            setFarmProfile(snap.data());
          }
          const breedsSnap = await getDocs(breedsRef);
          setBreeds(breedsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching data:", error);
          setStatus("❌ Failed to load farm data.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    const handleProfileChange = (e) => {
      const { name, value } = e.target;
      setFarmProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
      try {
        await setDoc(farmRef, {
          ...farmProfile,
          lastUpdated: serverTimestamp(),
        });
        setStatus("✅ Farm profile saved.");
      } catch (err) {
        console.error("Save error:", err);
        setStatus("❌ Failed to save profile.");
      }
    };

    const handleNewBreed = async () => {
      if (!newBreed.name) return;
      try {
        await addDoc(breedsRef, {
          ...newBreed,
          createdAt: serverTimestamp(),
        });
        setNewBreed({ name: "", description: "" });
        setStatus("✅ New breed added.");
        const breedsSnap = await getDocs(breedsRef);
        setBreeds(breedsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Add breed error:", err);
        setStatus("❌ Failed to add breed.");
      }
    };

    if (loading) {
      return (
        <div className="max-w-2xl mx-auto p-6 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Farm Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="farmName">Farm Name</Label>
              <Input
                id="farmName"
                name="farmName"
                value={farmProfile.farmName}
                onChange={handleProfileChange}
                placeholder="Enter farm name"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={farmProfile.location}
                onChange={handleProfileChange}
                placeholder="Enter farm location"
              />
            </div>
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                name="owner"
                value={farmProfile.owner}
                onChange={handleProfileChange}
                placeholder="Enter owner name"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Breed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="breedName">Breed Name</Label>
              <Input
                id="breedName"
                value={newBreed.name}
                onChange={(e) =>
                  setNewBreed((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Holstein, Angus"
              />
            </div>
            <div>
              <Label htmlFor="breedDesc">Description</Label>
              <Textarea
                id="breedDesc"
                value={newBreed.description}
                onChange={(e) =>
                  setNewBreed((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Short description of the breed"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleNewBreed}>Add Breed</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breed List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {breeds.map((breed) => (
              <div key={breed.id} className="border p-2 rounded">
                <p className="font-medium">{breed.name}</p>
                <p className="text-sm text-muted-foreground">
                  {breed.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </div>
    );
  }