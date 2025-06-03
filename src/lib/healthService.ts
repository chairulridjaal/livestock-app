import { db, auth } from "./firebase"; // Assuming firebase.ts is in the same lib folder
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  DocumentData,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// --- Interfaces for Data Types ---
// Based on Zod schemas in the form components, adding ID and timestamps

export interface HealthEventData {
  animalId: string;
  farmId: string;
  eventType: string;
  eventDate: Date | Timestamp;
  symptoms?: string;
  diagnosis?: string;
  treatmentAdministered?: string;
  medication?: string;
  dosage?: string;
  vetConsulted?: string;
  notes?: string;
}

export interface HealthEvent extends HealthEventData {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VaccinationRecordData {
  animalId: string;
  farmId: string;
  vaccineName: string;
  vaccinationDate: Date | Timestamp;
  administeredBy?: string;
  batchNumber?: string;
  dosage?: string;
  nextDueDate?: Date | Timestamp | null;
  isBooster?: boolean;
  notes?: string;
}

export interface VaccinationRecord extends VaccinationRecordData {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


// --- Save Functions ---

/**
 * Saves a new health event to Firestore.
 * @param eventData - The data for the health event.
 * @returns The ID of the newly created document.
 */
export async function saveHealthEvent(eventData: HealthEventData): Promise<string> {
  try {
    const farmId = eventData.farmId || (await getDoc(doc(db, "users", auth.currentUser?.uid as string))).data()?.currentFarm;
    const animalId = eventData.animalId;
    const docRef = await addDoc(collection(db, "farms", farmId, "animals", animalId, "health_events"), {
      ...eventData,
      eventDate: Timestamp.fromDate(new Date(eventData.eventDate as Date)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const animalDocRef = doc(db, "farms", farmId, "animals", animalId);
    const animalDocSnap = await getDoc(animalDocRef);
    const prevStatus = (animalDocSnap.data()?.status ?? []) as string[];

    if (eventData.eventType === "Injury" && !prevStatus.includes("Injured")) {
      await updateDoc(animalDocRef, {
        status: [...prevStatus, "Injured"],
        notes: eventData.notes ? eventData.notes : `Injury noted on ${eventData.eventDate}`,
      });
    }

    if (eventData.eventType === "Illness" && !prevStatus.includes("Sick")) {
      await updateDoc(animalDocRef, {
        status: [...prevStatus, "Sick"],
        notes: eventData.notes ? eventData.notes : `Illness noted on ${eventData.eventDate}`,
      });
    }
    return docRef.id;
  } catch (error) {
    console.error("Error saving health event: ", error);
    throw new Error("Failed to save health event.");
  }
}

/**
 * Saves a new vaccination record to Firestore.
 * @param recordData - The data for the vaccination record.
 * @returns The ID of the newly created document.
 */
export async function saveVaccinationRecord(recordData: VaccinationRecordData): Promise<string> {
  try {
    const farmId = recordData.farmId || (await getDoc(doc(db, "users", auth.currentUser?.uid as string))).data()?.currentFarm;
    const animalId = recordData.animalId;
    const docRef = await addDoc(collection(db, "farms", farmId, "animals", animalId, "vaccination_records"), {
      ...recordData,
      vaccinationDate: Timestamp.fromDate(new Date(recordData.vaccinationDate as Date)),
      nextDueDate: recordData.nextDueDate ? Timestamp.fromDate(new Date(recordData.nextDueDate as Date)) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const animalDocRef = doc(db, "farms", farmId, "animals", animalId);
    // Fetch existing vaccinationRecords array or initialize as empty
    const animalDocSnap = await getDoc(animalDocRef);
    const prevRecords = (animalDocSnap.data()?.vaccinationRecords ?? []) as { name: string; date: Timestamp }[];

    await updateDoc(animalDocRef, {
      vaccinationRecords: [
      ...prevRecords,
      {
        name: recordData.vaccineName,
        date: Timestamp.fromDate(new Date(recordData.vaccinationDate as Date)),
      },
      ],
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving vaccination record: ", error);
    throw new Error("Failed to save vaccination record.");
  }
}

// --- Fetch Functions ---

/**
 * Fetches health events for a specific animal on a farm.
 * @param animalId - The ID of the animal.
 * @param farmId - The ID of the farm.
 * @returns An array of health event documents (including their IDs).
 */
export async function getHealthEvents(animalId: string, farmId: string): Promise<HealthEvent[]> {
  try {
    const q = query(
      collection(db, "farms", farmId, "animals", animalId, "health_events"),
      orderBy("eventDate", "desc")
    );
    console.log("Fetching health events for animal:", animalId, "on farm:", farmId);
    const querySnapshot = await getDocs(q);
    const events: HealthEvent[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as HealthEvent);
    });
    console.log("Fetched health events: ", events);
    return events;
  } catch (error) {
    console.error("Error fetching health events: ", error);
    throw new Error("Failed to fetch health events.");
  }
}

/**
 * Fetches vaccination records for a specific animal on a farm.
 * @param animalId - The ID of the animal.
 * @param farmId - The ID of the farm.
 * @returns An array of vaccination record documents (including their IDs).
 */
export async function getVaccinationRecords(animalId: string, farmId: string): Promise<VaccinationRecord[]> {
  try {
    const q = query(
      collection(db, "farms", farmId, "animals", animalId, "vaccination_records"),
      orderBy("vaccinationDate", "desc")
    );
    console.log("Fetching vaccination records for animal:", animalId, "on farm:", farmId);
    const querySnapshot = await getDocs(q);
    const records: VaccinationRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as VaccinationRecord);
    });
    return records;
  } catch (error) {
    console.error("Error fetching vaccination records: ", error);
    throw new Error("Failed to fetch vaccination records.");
  }
}
