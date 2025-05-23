import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  setDoc,
  updateDoc,
  arrayUnion,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function generateJoinCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function ChooseFarm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newFarmName, setNewFarmName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleCreateFarm = async () => {
    setLoading(true);
    setError(null);

    try {
      let finalJoinCode = '';
      let isUnique = false;

      while (!isUnique) {
        const potentialCode = generateJoinCode();
        const existing = await getDocs(
          query(collection(db, 'farms'), where('joinCode', '==', potentialCode))
        );
        if (existing.empty) {
          finalJoinCode = potentialCode;
          isUnique = true;
        }
      }

      const farmSnapshot = await getDocs(collection(db, 'farms'));
      let maxNumber = 0;

      farmSnapshot.forEach((doc) => {
        const match = doc.id.match(/^farm-(\d{3})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      const nextFarmId = `farm-${(maxNumber + 1).toString().padStart(3, '0')}`;

      const farmRef = doc(db, 'farms', nextFarmId);
      await setDoc(farmRef, {
        owner: user.uid,
        farmName: newFarmName,
        farmId: nextFarmId,
        joinCode: finalJoinCode,
        members: [user.uid],
        createdAt: new Date(),
      });

      const farmInfo = doc(db, 'farms', nextFarmId, "meta", "Information");
      await setDoc(farmInfo, {
        farmName: newFarmName,
        joinCode: finalJoinCode,
        createdAt: new Date(),
      });

      await updateDoc(doc(db, 'users', user.uid as string), {
        farms: arrayUnion(farmRef.id),
        currentFarm: farmRef.id,
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create farm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFarm = async () => {
    setLoading(true);
    setError(null);

    try {
      const farmQuery = query(collection(db, 'farms'), where('joinCode', '==', joinCode));
      const querySnapshot = await getDocs(farmQuery);

      if (querySnapshot.empty) {
        setError('Farm not found. Please check the code and try again.');
        return;
      }

      const farmDoc = querySnapshot.docs[0];
      const farmData = farmDoc.data();
      const farmId = farmDoc.id;

      if (farmData.members?.includes(user.uid)) {
        setError('You are already a member of this farm.');
        return;
      }

      await updateDoc(doc(db, 'farms', farmId), {
        members: arrayUnion(user.uid),
      });

      await updateDoc(doc(db, 'users', user.uid as string), {
        farms: arrayUnion(farmId),
        currentFarm: farmId,
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to join farm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6"
         style={{ backgroundImage: 'url("/cow-login.jpg")', backgroundSize: 'cover' }}>
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0" />
    <div className="absolute top-4 left-4">
        <img src="/logo-white.png" alt="Logo" className="h-16 w-auto" />
    </div>
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to HerdSphere</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Join an existing farm or create a new one to get started.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* Create Farm Section */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Create a New Farm</h2>
            <Input
              placeholder="Farm Name"
              value={newFarmName}
              onChange={(e) => setNewFarmName(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleCreateFarm}
              disabled={loading || !newFarmName}
            >
              {loading ? 'Creating...' : 'Create Farm'}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-sm">or</span>
            <Separator className="flex-1" />
            </div>

          {/* Join Farm Section */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Join with Farm Code</h2>
            <Input
              placeholder="Farm Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleJoinFarm}
              disabled={loading || !joinCode}
            >
              {loading ? 'Joining...' : 'Join Farm'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}