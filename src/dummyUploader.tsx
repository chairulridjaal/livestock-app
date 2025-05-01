import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust this to match your Firebase config import
import { Timestamp } from "firebase/firestore";

const dummyStats = {
  "cow-001": {
    name: "Bessie",
    breed: "Holstein",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2019-03-15T00:00:00")),
    notes: "Healthy and active",
  },
  "cow-002": {
    name: "Daisy",
    breed: "Jersey",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2018-07-22T00:00:00")),
    notes: "Calm and friendly",
  },
  "cow-003": {
    name: "Buttercup",
    breed: "Charolais",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2017-11-05T00:00:00")),
    notes: "Strong and energetic",
  },
  "cow-004": {
    name: "Molly",
    breed: "Limousin",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2016-06-18T00:00:00")),
    notes: "Gentle and hardy",
  },
  "cow-005": {
    name: "Rosie",
    breed: "Friesian",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2019-01-10T00:00:00")),
    notes: "Produces high-quality milk",
  },
  "cow-006": {
    name: "Luna",
    breed: "Persia",
    type: "Dual-purpose",
    dob: Timestamp.fromDate(new Date("2018-09-30T00:00:00")),
    notes: "Adaptable and versatile",
  },
};

export async function uploadDummyStats() {
  try {
    for (const [animalId, data] of Object.entries(dummyStats)) {
      const recordsRef = doc(db, "animals", animalId);
      await setDoc(recordsRef, data);
      console.log(`Uploaded stats for ${animalId}`);
    }
    console.log("All dummy records uploaded!");
  } catch (error) {
    console.error("Error uploading dummy stats:", error);
  }
}
