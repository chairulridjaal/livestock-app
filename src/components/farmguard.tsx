import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function FarmGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFarm = async () => {
      if (!user || !user.uid) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid as string));
      const data = userDoc.data();
      const hasFarms = Array.isArray(data?.farms) && data.farms.length > 0;

      if (!hasFarms) {
        navigate('/choose-farm');
      } else {
        setLoading(false);
      }
    };

    checkFarm();
  }, [user, navigate]);

  if (loading) return <div className="p-4">Checking farm membership...</div>;

  return <>{children}</>;
}
