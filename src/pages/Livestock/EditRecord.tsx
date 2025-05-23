import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../lib/firebase";
import { addToast } from "@heroui/toast";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { 
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
 } from "@heroui/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function EditRecord() {
  const { animalId, recordId } = useParams();
  const navigate = useNavigate();

  const [weight, setWeight] = useState("");
  const [health, setHealth] = useState("");
  const [feed, setFeed] = useState("");
  const [milk, setMilk] = useState("");
  const [notes, setNotes] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!animalId || !recordId) return;

      try {
        const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = farmData.data()?.currentFarm;
        const recordRef = doc(db, "farms", farmId, "animals", animalId, "records", recordId);
        const recordSnap = await getDoc(recordRef);
        if (recordSnap.exists()) {
          const data = recordSnap.data();
          setWeight(data.weight?.toString() || "");
          setHealth(data.health || "");
          setFeed(data.feed?.toString() || "");
          setMilk(data.milk?.toString() || "");
          setNotes(data.notes || "");
          setDate(data.date?.toDate().toISOString().split("T")[0] || "");
        }

        const animalRef = doc(db, "animals", animalId);
        const animalSnap = await getDoc(animalRef);
        if (animalSnap.exists()) {
          const animalData = animalSnap.data() as { type: string };
          setAnimalType(animalData.type);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching record:", error);
        addToast({
          title: "Error",
          description: "Failed to load record data.",
          color: "danger",
        });
        navigate("/livestock"); // fallback
      }
    };

    fetchRecord();
  }, [animalId, recordId, navigate]);

  const handleDelete = async () => {
    if (!animalId || !recordId) return;
    try {
      const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
      const farmId = farmData.data()?.currentFarm;
      const recordRef = doc(db, "farms", farmId, "animals", animalId, "records", recordId);
      await deleteDoc(recordRef);

      addToast({
        title: "Record Deleted",
        description: `Record for animal ${animalId} has been deleted.`,
        color: "success",
      });

      navigate("/livestock/edit/" + animalId);
    } catch (error) {
      console.error("Error deleting record:", error);
      addToast({
        title: "Error",
        description: "Failed to delete record.",
        color: "danger",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId || !recordId) return;

    try {
      const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
      const farmId = farmData.data()?.currentFarm;
      const recordRef = doc(db, "farms", farmId, "animals", animalId, "records", recordId);
      await updateDoc(recordRef, {
        weight: parseFloat(weight),
        health,
        feed: parseFloat(feed),
        milk: milk ? parseFloat(milk) : null,
        notes,
      });

      addToast({
        title: "Record Updated",
        description: `Record for animal ${animalId} has been updated successfully.`,
        color: "success",
      });

      navigate("/livestock/edit/" + animalId); 
    } catch (error) {
      console.error("Error updating record:", error);
      addToast({
        title: "Error",
        description: "Failed to update record.",
        color: "danger",
      });
    }
  };

  if (loading) return <p className="text-center mt-10">Loading record...</p>;

  return (
    <div className="container mx-auto p-2">
      <Card className="max-w-5xl mx-auto mt-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label>Animal ID</Label>
              <Input type="text" value={animalId} disabled />
            </div>

            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={date} disabled />
            </div>

            <div className="space-y-1">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Health Status</Label>
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

            <div className="space-y-1">
              <Label>Feed Given (kg)</Label>
              <Input
                type="number"
                value={feed}
                onChange={(e) => setFeed(e.target.value)}
              />
            </div>

            {animalType === "Dairy Cattle" && (
              <div className="space-y-1">
                <Label>Milk Production (liters)</Label>
                <Input
                  type="number"
                  value={milk}
                  onChange={(e) => setMilk(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-between">
            <Button type="submit" className="mt-4" >Update Record</Button>
            <Button
              type="button"
              variant="destructive"
              onClick= {() => setIsOpen(true)}
              className="mt-4"> Delete Record </Button>

              <Modal backdrop="opaque" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                      <ModalBody>
                        <p>
                        Are you sure you want to delete <strong> {recordId} </strong>?
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This action cannot be undone.
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button variant="secondary" onClick={onClose}>
                          Cancel
                        </Button>
                        <Button className="text-red-600 hover:text-red-600" variant="ghost" onClick={() => { handleDelete(); onClose(); }}>
                          Yes, Delete
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditRecord;
