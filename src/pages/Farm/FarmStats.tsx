// src/pages/FarmStats.tsx
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function FarmStats() {
  const [stats, setStats] = useState({
    totalMilk: 0,
    totalFeed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const farmRef = doc(db, "farm", "stats");

  useEffect(() => {
    const fetchStats = async () => {
      const snap = await getDoc(farmRef);
      if (snap.exists()) {
        const data = snap.data();
        setStats({
          totalMilk: data.totalMilk || 0,
          totalFeed: data.totalFeed || 0,
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStats((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSave = async () => {
    try {
      await setDoc(farmRef, {
        ...stats,
        lastUpdated: serverTimestamp(),
      });
      setStatus("✅ Stats updated!");
    } catch (error) {
      console.error("Update failed:", error);
      setStatus("❌ Update failed.");
    }
  };

  if (loading) return <p className="p-4">Loading stats...</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-6 space-y-4">
      <h2 className="text-2xl font-bold">Edit Farm Stats</h2>

      <label className="block">
        <span>Total Milk (L)</span>
        <input
          type="number"
          name="totalMilk"
          value={stats.totalMilk}
          onChange={handleChange}
          className="w-full border mt-1 p-2 rounded"
        />
      </label>

      <label className="block">
        <span>Total Feed (Kg)</span>
        <input
          type="number"
          name="totalFeed"
          value={stats.totalFeed}
          onChange={handleChange}
          className="w-full border mt-1 p-2 rounded"
        />
      </label>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Save
      </button>

      <p className="text-sm text-gray-600">{status}</p>
    </div>
  );
}
