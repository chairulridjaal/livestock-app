import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
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
import { Check, Clipboard } from "lucide-react";
import { addToast } from "@heroui/toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 🔧 Moved geocodeLocation up to avoid hoisting issues
const geocodeLocation = async (location: string): Promise<[number, number]> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return [0, 0];
};

const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    return data.display_name || "";
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "";
  }
};

export default function FarmSettings() {
  const [farmProfile, setFarmProfile] = useState({
    farmName: "",
    location: "",
  });
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [breeds, setBreeds] = useState<{ id: string; name: string; description: string }[]>([]);
  const [newBreed, setNewBreed] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = farmData.data()?.currentFarm;
        const farmDoc = await getDoc(doc(db, "farms", farmId));
        setJoinCode(farmDoc.data()?.joinCode || "");
        console.log("Join Code: ", joinCode);
        const farmRef = doc(db, "farms", farmId, "meta", "information");
        const breedsRef = collection(db, "farms", farmId, "meta", "information", "breeds");

        const snap = await getDoc(farmRef);
        if (snap.exists()) {
          const data = snap.data();
          setFarmProfile({
            farmName: data.farmName ?? "",
            location: data.location ?? "",
          });
          if (data.location) {
            const coords = await geocodeLocation(data.location);
            setLocationCoords(coords);
          }
        }

        const breedsSnap = await getDocs(breedsRef);
        setBreeds(
          breedsSnap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name ?? "",
            description: doc.data().description ?? "",
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setStatus("❌ Failed to load farm data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUseCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setLocationCoords([latitude, longitude]);
      const address = await reverseGeocode(latitude, longitude);
      setFarmProfile((prev) => ({ ...prev, location: address }));
      setStatus("📍 Location set from device");
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get current location. Please allow location access.");
      }
    );
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFarmProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    addToast({
      title: "",
      description: `Join code copied to clipboard!`,
      color: "success",
    });
    setTimeout(() => setCopied(false), 2000); // Reset copied after 2 seconds
  };

  const handleSaveProfile = async () => {
    try {
      const farmId = (await getDoc(doc(db, "users", auth.currentUser?.uid as string))).data()?.currentFarm;
      const farmRef = doc(db, "farms", farmId, "meta", "information");
      await setDoc(farmRef, {
        ...farmProfile,
        lastUpdated: serverTimestamp(),
      });
      const coords = await geocodeLocation(farmProfile.location);
      setLocationCoords(coords);
      window.location.reload();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleNewBreed = async () => {
    if (!newBreed.name) return;
    try {
      const farmId = (await getDoc(doc(db, "users", auth.currentUser?.uid as string))).data()?.currentFarm;
      const breedsRef = collection(db, "farms", farmId, "meta", "information", "breeds");
      await addDoc(breedsRef, {
        ...newBreed,
        createdAt: serverTimestamp(),
      });
      setNewBreed({ name: "", description: "" });
      const breedsSnap = await getDocs(breedsRef);
      setBreeds(
        breedsSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name ?? "",
          description: doc.data().description ?? "",
        }))
      );
    } catch (err) {
      console.error("Add breed error:", err);
    }
  };

  const handleGenerateInvite = () => {
    if (!inviteEmail) return;
    const link = `https://yourapp.com/invite?email=${encodeURIComponent(inviteEmail)}`;
    setInviteLink(link);
    setStatus(`✅ Invite link generated for ${inviteEmail}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl w-full mx-auto">
      <div className="flex flex-wrap gap-4">
        {/* Farm Profile */}
        <Card className="w-full">
          <CardHeader><CardTitle>Farm Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="relative z-0 rounded overflow-hidden">
              <MapContainer
                center={locationCoords}
                zoom={16}
                style={{ height: "200px", width: "100%", zIndex: 0 }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={locationCoords}>
                  <Popup>{farmProfile.farmName || "Farm Location"}</Popup>
                </Marker>
              </MapContainer>
            </div>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSaveProfile}>Save Profile</Button>
            <Button onClick={handleUseCurrentLocation} variant="outline">
              Change to Current Location
            </Button>
          </CardFooter>
        </Card>

        {/* Breed Management (Simplified) */}
        <Card className="w-full md:w-[50%] flex-1 min-w-[300px]">
          <CardHeader>
            <CardTitle>Breeds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Breed List */}
            <div className="space-y-2">
              {breeds.map((breed) => (
                <div key={breed.id} className="border px-3 py-2 rounded">
                  <p className="font-medium">{breed.name}</p>
                </div>
              ))}
            </div>

            {/* Toggle Add Form */}
            {showAddForm ? (
              <div className="space-y-2 border-t pt-4">
                <div>
                  <Label htmlFor="breedName">Breed Name</Label>
                  <Input
                    id="breedName"
                    value={newBreed.name}
                    onChange={(e) =>
                      setNewBreed((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Holstein"
                  />
                </div>
                <div>
                  <Label htmlFor="breedDesc">Description</Label>
                  <Textarea
                    id="breedDesc"
                    value={newBreed.description}
                    onChange={(e) =>
                      setNewBreed((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleNewBreed}>Add</Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewBreed({ name: "", description: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowAddForm(true)}>
                + Add Breed
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Invite Admin */}
        <Card className="w-full sm:w-[320px] flex-1 min-w-[260px]">
          <CardHeader><CardTitle>Invite Admin</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-2">
              <Label>Join Code</Label>
              <div
                className="font-mono bg-muted rounded px-2 py-1 text-sm select-all cursor-pointer flex items-center gap-2 hover:bg-muted/80 transition"
                onClick={handleCopy}
              >
                {joinCode}
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Clipboard className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Click to copy and share this code with admins to join your farm.
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            {inviteLink && (
              <div className="text-sm text-muted-foreground break-all">
                Invite Link: <a href={inviteLink}>{inviteLink}</a>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateInvite}>Generate Invite Link</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Status Message */}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
