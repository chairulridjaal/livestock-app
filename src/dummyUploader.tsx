import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust this to match your Firebase config import

const dummyStats = {
  "2024-11": {
    totalFeed: 1000,
    totalMilk: 800,
    livestockCount: 20,
    averageWeight: 310,
    healthIssues: 1,
    mortality: 0,
    timestamp: new Date("2024-11-01T00:00:00Z").getTime(), // Adding timestamp
  },
  "2024-12": {
    totalFeed: 1150,
    totalMilk: 900,
    livestockCount: 20,
    averageWeight: 315,
    healthIssues: 2,
    mortality: 0,
    timestamp: new Date("2024-12-01T00:00:00Z").getTime(), // Adding timestamp
  },
  "2025-01": {
    totalFeed: 1100,
    totalMilk: 950,
    livestockCount: 22,
    averageWeight: 320,
    healthIssues: 1,
    mortality: 0,
    timestamp: new Date("2025-01-01T00:00:00Z").getTime(), // Adding timestamp
  },
  "2025-02": {
    totalFeed: 1200,
    totalMilk: 970,
    livestockCount: 23,
    averageWeight: 322,
    healthIssues: 1,
    mortality: 0,
    timestamp: new Date("2025-02-01T00:00:00Z").getTime(), // Adding timestamp
  },
  "2025-03": {
    totalFeed: 1300,
    totalMilk: 990,
    livestockCount: 23,
    averageWeight: 325,
    healthIssues: 0,
    mortality: 0,
    timestamp: new Date("2025-03-01T00:00:00Z").getTime(), // Adding timestamp
  },
  "2025-04": {
    totalFeed: 1250,
    totalMilk: 1020,
    livestockCount: 24,
    averageWeight: 330,
    healthIssues: 1,
    mortality: 1,
    timestamp: new Date("2025-04-01T00:00:00Z").getTime(), // Adding timestamp
  },
};

export async function uploadDummyStats() {
  const recordsRef = collection(db, "farm", "stats", "records");

  try {
    for (const [month, data] of Object.entries(dummyStats)) {
      const docRef = doc(recordsRef, month);
      await setDoc(docRef, data);
      console.log(`Uploaded stats for ${month}`);
    }
    console.log("All dummy records uploaded!");
  } catch (error) {
    console.error("Error uploading dummy stats:", error);
  }
}
