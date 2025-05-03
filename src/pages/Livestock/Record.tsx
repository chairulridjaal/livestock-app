import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { QRScanner } from "@/components/QRScanner";
import { useCallback } from "react";
import {addToast} from "@heroui/toast";
import {
  collection,
  setDoc,
  Timestamp,
  getDoc,
  doc,
  getDocs,
  increment,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const today = new Date().toISOString().split("T")[0];
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});

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
          const animalData = animalSnap.data() as { type: string };
          setAnimalType(animalData.type);
        } else {
          setAnimalType("");
        }
      } catch (error) {
        console.error("Failed to fetch animal type:", error);
        setAnimalType("");
      }
    };

    fetchAnimalType();
  }, [animalId]);

  const handleScanSuccess = useCallback((id: string) => {
    console.log("Scanned ID:", id);
    setAnimalId(id);
    addToast({
      title: "Animal ID Scanned",
      description: `Identified animal as ${id} has been scanned successfully.`,
      color: "success",
    });
  }, [setAnimalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!animalId.trim()) return;
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) return;
    if (!feed || isNaN(Number(feed)) || Number(feed) < 0) return;
    if (!health.trim()) return;
    if (milk && (isNaN(Number(milk)) || Number(milk) < 0)) return;

    try {
      const recordId = today;
      const recordRef = doc(db, "animals", animalId, "records", recordId);

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
      addToast({
        title: "Record Saved",
        description: `Record for animal ${animalId} has been saved successfully.`,
        color: "success",
      }); 
      
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
    <div className="container mx-auto p-2">
    <Card className="max-w-5xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Animal Recording</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
        <QRScanner onScanSuccess={handleScanSuccess} stopOnSuccess={true} />
          <div className="text-sm text-muted-foreground text-center">
            Scan the QR code on the animal's collar to auto-fill the Animal ID.
          </div>

          {/* Animal ID */}
          <div className="space-y-1">
          <Label className="text-sm">
            Animal ID <span className="text-red-500">*</span>
          </Label>
            <Select value={animalId} onValueChange={setAnimalId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} ({animal.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && !animalId && (
              <p className="text-sm text-red-500">Animal ID is required</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>Date</Label>
            <Input type="date" value={today} readOnly />
          </div>

          {/* Weight */}
          <div className="space-y-1">
            <Label>
              Weight (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={weight}
              onBlur={() => setTouchedFields(prev => ({ ...prev, weight: true }))}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter today's weight"
            />
            {touchedFields.weight && (!weight || Number(weight) <= 0) && (
              <p className="text-sm text-red-500">Weight must be greater than 0</p>
            )}
          </div>

          {/* Health */}
          <div className="space-y-1">
            <Label>
              Health Status <span className="text-red-500">*</span>
            </Label>
            <Select value={health} onValueChange={setHealth}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="injured">Injured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feed */}
          <div className="space-y-1">
            <Label>
              Feed Given (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={feed}
              onChange={(e) => setFeed(e.target.value)}
              placeholder="Enter feed amount"
            />
          </div>

          {/* Milk */}
          {animalType === "Dairy Cattle" && (
            <div className="space-y-1">
              <Label>Milk Production (liters)</Label>
              <Input
                type="number"
                value={milk}
                onChange={(e) => setMilk(e.target.value)}
                placeholder="Only if applicable"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={
              !animalId || !weight || !feed || !health || Number(weight) <= 0 || Number(feed) < 0
            }
          >
            Save Record
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}

export default Record;
