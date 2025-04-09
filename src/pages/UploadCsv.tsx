// src/utils/UploadCsv.tsx
import { useState } from "react";
import Papa from "papaparse";
import { db } from "../firebase";
import {
  collection,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

interface CowRecord {
  id: string;
  name: string;
  breed: string;
  type: string;
  dob: string;
  record_date: string;
  weight: string;
  feed: string;
  health: string;
  milk: string;
  notes: string;
}

export default function UploadCsv() {
  const [status, setStatus] = useState("");

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as CowRecord[];
        const groupedByCow: { [key: string]: CowRecord[] } = {};

        // Group records by cow ID
        data.forEach((row) => {
          if (!row.id) return; // Skip rows with missing ID
          if (!groupedByCow[row.id]) groupedByCow[row.id] = [];
          groupedByCow[row.id].push(row);
        });

        try {
          for (const id in groupedByCow) {
            const cow = groupedByCow[id][0];

            if (!id || !cow.name || !cow.dob || !cow.breed || !cow.type) {
              console.warn("⚠️ Skipping cow due to missing fields:", cow);
              continue;
            }

            // Create the cow document
            await setDoc(doc(db, "animals", id), {
              id: cow.id,
              name: cow.name,
              breed: cow.breed,
              type: cow.type,
              dob: cow.dob,
            });

            // Create the subcollection of records
            for (const record of groupedByCow[id]) {
              if (!record.record_date) continue;

              const recordRef = doc(db, "animals", id, "records", record.record_date);
              await setDoc(recordRef, {
                date: Timestamp.fromDate(new Date(record.record_date)),
                weight: Number(record.weight),
                feed: Number(record.feed),
                health: record.health || "Unknown",
                milk: record.milk ? Number(record.milk) : null,
                notes: record.notes ?? "",
              });              
            }
          }

          setStatus("✅ Upload successful!");
        } catch (error) {
          console.error("Upload failed:", error);
          setStatus("❌ Upload failed. Check console.");
        }
      },
      error: (err) => {
        console.error("Parsing failed:", err);
        setStatus("❌ Parsing CSV failed.");
      },
    });
  };

  return (
    <div className="p-6 text-center space-y-4">
      <h2 className="text-xl font-bold">Upload Cow Data (CSV)</h2>
      <input type="file" accept=".csv" onChange={handleCsvUpload} />
      <p>{status}</p>
    </div>
  );
}
