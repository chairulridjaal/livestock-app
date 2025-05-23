import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import {
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  arrayRemove,
  serverTimestamp,
  writeBatch,
  Query,
  DocumentData,
  count,
} from "firebase/firestore";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react"
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
import { addToast } from "@heroui/toast";
import { Copy } from "lucide-react";
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

const deleteCollection = async (collectionRef: Query<DocumentData>) => {
  const snapshot = await getDocs(collectionRef);

  if (snapshot.empty) return;

  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  // Recursively call until all docs are deleted
  await deleteCollection(collectionRef);
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
  const { isOpen: isModalOpen, onOpen, onOpenChange } = useDisclosure()
  const [confirmationText, setConfirmationText] = useState("");
  const isMatch = confirmationText.trim() === farmProfile.farmName;

  const onCloseModal = () => {
    setConfirmationText(""); // Clear input on close
    onOpenChange();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = farmData.data()?.currentFarm;
        const farmDoc = await getDoc(doc(db, "farms", farmId));
        setJoinCode(farmDoc.data()?.joinCode || "");
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

const handleLeaveFarm = async (farmId: string, userId: string) => {
  try {
    const farmRef = doc(db, "farms", farmId);
    const farmSnap = await getDoc(farmRef);

    if (!farmSnap.exists()) {
      addToast({
        title: "Error",
        description: "Farm not found.",
        color: "danger",
      });
      return;
    }

    const farmData = farmSnap.data();
    
    if (farmData.owner === userId) {
      addToast({
        title: "Action denied",
        description: "You are the owner and cannot leave the farm.",
        color: "danger",
      });
      return;
    }

    if (!farmData.members?.includes(userId)) {
      addToast({
        title: "Error",
        description: "You are not a member of this farm.",
        color: "danger",
      });
      return;
    }

    await updateDoc(doc(db, "users", userId as string), {
      currentFarm: null,
      farms: arrayRemove(farmId),
    });

    await updateDoc(farmRef, {
      members: arrayRemove(userId),
    });

    addToast({
      title: "Left farm",
      description: "You have successfully left the farm.",
      color: "success",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error("Leave farm error:", error);
    addToast({
      title: "Unexpected error",
      description: "Something went wrong. Please try again.",
      color: "danger",
    });
  }
};


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

  const handleSaveProfile = async () => {
    try {
      // Get current farmId from user doc
      const currentUserId = auth.currentUser?.uid as string;
      const userDocRef = doc(db, "users", currentUserId);
      const userDoc = await getDoc(userDocRef);
      const farmId = userDoc.data()?.currentFarm;
      if (!farmId) throw new Error("No current farm found for user.");
      const farmRef = doc(db, "farms", farmId, "meta", "information");

      await setDoc(farmRef, {
        ...farmProfile,
        lastUpdated: serverTimestamp(),
      });
      setStatus("✅ Farm profile saved.");
      const coords = await geocodeLocation(farmProfile.location);
      setLocationCoords(coords);
      setStatus("✅ Profile updated and map reloaded.");
      window.location.reload();
    } catch (err) {
      console.error("Save error:", err);
      setStatus("❌ Failed to save profile.");
    }
  };

const handleDeleteFarm = async () => {
  const currentUserId = auth.currentUser?.uid as string;
  const userDocRef = doc(db, "users", currentUserId);
  const userDoc = await getDoc(userDocRef);
  const farmId = userDoc.data()?.currentFarm;

  if (!farmId) return;

  const farmRef = doc(db, "farms", farmId);

  try {
    // 1. Delete animals and their records
    const animalsRef = collection(db, "farms", farmId, "animals");
    const animalDocs = await getDocs(animalsRef);

    for (const animal of animalDocs.docs) {
      const recordsRef = collection(db, "farms", farmId, "animals", animal.id, "records");
      await deleteCollection(recordsRef);
      await deleteDoc(animal.ref);
    }

    await deleteCollection(collection(db, "farms", farmId, "meta"));

    await deleteDoc(farmRef);

    const usersSnapshot = await getDocs(collection(db, "users"));
    const batch = writeBatch(db);

    usersSnapshot.forEach((userDocSnap) => {
      const userData = userDocSnap.data();
      const userFarms = userData.farms || [];
      const userId = userDocSnap.id;

      if (userFarms.includes(farmId)) {
        const updatedFarms = userFarms.filter((id: string) => id !== farmId);
        const newCurrentFarm = updatedFarms.length > 0 ? updatedFarms[0] : null;

        batch.update(doc(db, "users", userId), {
          farms: arrayRemove(farmId),
          currentFarm: newCurrentFarm,
        });
      }
    });

    await batch.commit();

    addToast({
      title: "Success",
      description: `Farm "${farmId}" deleted successfully and user references updated.`,
      color: "success",
    });

    window.location.reload();
  } catch (err) {
    console.error("Delete error:", err);
    addToast({
      title: "Error",
      description: "Failed to delete the farm. See console.",
      color: "danger",
    });
  }
};

  const handleNewBreed = async () => {
    if (!newBreed.name) return;
    try {
      // Get current farmId from user doc
      const currentUserId = auth.currentUser?.uid as string;
      const userDocRef = doc(db, "users", currentUserId);
      const userDoc = await getDoc(userDocRef);
      const farmId = userDoc.data()?.currentFarm;
      if (!farmId) throw new Error("No current farm found for user.");
      const breedsRef = collection(db, "farms", farmId, "meta", "information", "breeds");

      await addDoc(breedsRef, {
        ...newBreed,
        createdAt: serverTimestamp(),
      });
      setNewBreed({ name: "", description: "" });
      setStatus("✅ New breed added.");
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
            {/* <Button onClick={handleUseCurrentLocation} variant="outline">
              Change to Current Location
            </Button> */}
            <Button variant="destructive" onClick={onOpen}>
              Delete Farm
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
          <div className="space-y-2">
            <Label className="text-sm font-medium">Join Code</Label>

            <div
              onClick={() => {
                if (!joinCode) return;
                navigator.clipboard.writeText(joinCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 w-fit px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition cursor-pointer select-all"
              title="Click to copy"
            >
              <span className="font-mono text-sm">
                {copied ? "Copied!" : joinCode || "N/A"}
              </span>
              <Copy className="h-4 w-4 text-gray-600" />
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

        {/* Leave Farm */}
        <Card className="w-full sm:w-[320px] flex-1 min-w-[260px]">
          <CardHeader><CardTitle>Leave Farm</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Leaving the farm will remove you from all farm activities.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={async () => {
                // Get current farmId and userId
                const currentUserId = auth.currentUser?.uid as string;
                const userDocRef = doc(db, "users", currentUserId);
                const userDocSnap = await getDoc(userDocRef);
                const farmId = userDocSnap.data()?.currentFarm;
                if (farmId && currentUserId) {
                  await handleLeaveFarm(farmId, currentUserId);
                }
              }}
            >
              Leave Farm
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Status Message */}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      {/* Delete Farm Modal */}
          <Modal isOpen={isModalOpen} placement="top-center" onClose={onCloseModal}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-center">
            </ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <p className="text-flex font-bold">
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-500">
                  {farmProfile.farmName}
                </span>
                ?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. Please type the farm name exactly to confirm deletion of farm :
              </p>
              <Input
                id="confirmation"
                placeholder={farmProfile.farmName}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
              />
              <Button
                className="w-full"
                variant={"destructive"}
                disabled={!isMatch}
                onClick={() => {
                  handleDeleteFarm();
                }}
              >
                Delete Farm
              </Button>
            </ModalBody>
            <ModalFooter />
          </>
        )}
      </ModalContent>
    </Modal>
    </div>
  );
}