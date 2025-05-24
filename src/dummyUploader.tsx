import { doc, setDoc, getDoc, Timestamp} from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // Adjust this to match your Firebase config import

const dummyStats =
{
  "cow-001": {
    name: "Bessie",
    breed: "Holstein",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2019-03-15")),
    notes: "Healthy and active",
    status: ["Healthy"],
    vaccinationRecords: [
      { name: "FMD", date: Timestamp.fromDate(new Date("2023-03-10")) },
      { name: "Brucellosis", date: Timestamp.fromDate(new Date("2022-09-01")) }
    ]
  },
  "cow-002": {
    name: "Daisy",
    breed: "Jersey",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2018-07-22")),
    notes: "Calm and friendly",
    status: ["Pregnant", "Healthy"],
    vaccinationRecords: [
      { name: "Blackleg", date: Timestamp.fromDate(new Date("2023-01-15")) }
    ]
  },
  "cow-003": {
    name: "Buttercup",
    breed: "Charolais",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2017-11-05")),
    notes: "Strong and energetic",
    status: ["Injured"],
    vaccinationRecords: []
  },
  "cow-004": {
    name: "Molly",
    breed: "Limousin",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2016-06-18")),
    notes: "Gentle and hardy",
    status: ["Recovering"],
    vaccinationRecords: [
      { name: "Brucellosis", date: Timestamp.fromDate(new Date("2022-11-30")) }
    ]
  },
  "cow-005": {
    name: "Rosie",
    breed: "Friesian",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2019-01-10")),
    notes: "Produces high-quality milk",
    status: ["Healthy"],
    vaccinationRecords: [
      { name: "FMD", date: Timestamp.fromDate(new Date("2024-03-05")) }
    ]
  },
  "cow-006": {
    name: "Luna",
    breed: "Persia",
    type: "Dual-purpose",
    dob: Timestamp.fromDate(new Date("2018-09-30")),
    notes: "Adaptable and versatile",
    status: ["Healthy"],
    vaccinationRecords: []
  },
  "cow-007": {
    name: "Clover",
    breed: "Angus",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2020-04-19")),
    notes: "High feed efficiency",
    status: ["Sick"],
    vaccinationRecords: [
      { name: "Lumpy Skin Disease", date: Timestamp.fromDate(new Date("2024-01-20")) }
    ]
  },
  "cow-008": {
    name: "Marigold",
    breed: "Guernsey",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2021-02-05")),
    notes: "Recently weaned calf",
    status: ["Healthy"],
    vaccinationRecords: []
  },
  "cow-009": {
    name: "Nellie",
    breed: "Shorthorn",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2017-12-12")),
    notes: "Excellent maternal instincts",
    status: ["Pregnant", "Healthy"],
    vaccinationRecords: [
      { name: "Brucellosis", date: Timestamp.fromDate(new Date("2023-10-10")) }
    ]
  },
  "cow-010": {
    name: "Maisie",
    breed: "Simmental",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2020-06-24")),
    notes: "Recovering from foot rot",
    status: ["Recovering"],
    vaccinationRecords: []
  },
  "cow-011": {
    name: "Ginger",
    breed: "Brown Swiss",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2018-03-03")),
    notes: "Steady milk producer",
    status: ["Healthy"],
    vaccinationRecords: [
      { name: "FMD", date: Timestamp.fromDate(new Date("2024-02-12")) }
    ]
  },
  "cow-012": {
    name: "Hazel",
    breed: "Hereford",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2016-10-17")),
    notes: "High meat yield",
    status: ["Sick"],
    vaccinationRecords: [
      { name: "Blackleg", date: Timestamp.fromDate(new Date("2022-05-30")) }
    ]
  },
  "cow-013": {
    name: "Olive",
    breed: "Dexter",
    type: "Dual-purpose",
    dob: Timestamp.fromDate(new Date("2020-12-25")),
    notes: "Compact and hardy",
    status: ["Healthy"],
    vaccinationRecords: []
  },
  "cow-014": {
    name: "Willow",
    breed: "Brahman",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2019-09-14")),
    notes: "Heat tolerant",
    status: ["Pregnant", "Healthy"],
    vaccinationRecords: [
      { name: "Lumpy Skin Disease", date: Timestamp.fromDate(new Date("2023-08-15")) }
    ]
  },
  "cow-015": {
    name: "Tilly",
    breed: "Montbéliarde",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2017-05-19")),
    notes: "Good udder conformation",
    status: ["Healthy"],
    vaccinationRecords: [
      { name: "FMD", date: Timestamp.fromDate(new Date("2023-04-10")) },
      { name: "Brucellosis", date: Timestamp.fromDate(new Date("2022-12-01")) }
    ]
  },
  "cow-016": {
    name: "Ruby",
    breed: "Galloway",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2015-07-23")),
    notes: "Resilient and foraging",
    status: ["Injured"],
    vaccinationRecords: []
  },
  "cow-017": {
    name: "Annie",
    breed: "Nguni",
    type: "Dual-purpose",
    dob: Timestamp.fromDate(new Date("2021-01-11")),
    notes: "Indigenous breed",
    status: ["Healthy"],
    vaccinationRecords: []
  },
  "cow-018": {
    name: "June",
    breed: "Murray Grey",
    type: "Beef Cattle",
    dob: Timestamp.fromDate(new Date("2022-03-29")),
    notes: "Still maturing",
    status: ["Healthy"],
    vaccinationRecords: []
  },
  "cow-019": {
    name: "Flora",
    breed: "Ayrshire",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2020-08-07")),
    notes: "Consistent milk output",
    status: ["Pregnant"],
    vaccinationRecords: [
      { name: "Brucellosis", date: Timestamp.fromDate(new Date("2023-07-02")) }
    ]
  },
  "cow-020": {
    name: "Ellie",
    breed: "Jersey",
    type: "Dairy Cattle",
    dob: Timestamp.fromDate(new Date("2018-11-09")),
    notes: "Produces high-quality milk",
    status: ["Healthy"],
    vaccinationRecords: [
      { name: "FMD", date: Timestamp.fromDate(new Date("2023-12-27")) }
    ]
  }
}


export async function uploadDummyStats() {
  try {
    // Ensure the user is authenticated
    const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
    const farmId = farmData.data()?.currentFarm;
    for (const [animalId, data] of Object.entries(dummyStats)) {
      const recordsRef = doc(db, "farms", farmId, "animals", animalId);
      await setDoc(recordsRef, data);
      console.log(`Uploaded stats for ${animalId}`);
    }
    console.log("All dummy records uploaded!");
  } catch (error) {
    console.error("Error uploading dummy stats:", error);
  }
}
