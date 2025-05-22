import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analytics from "./pages/Dashboard/Analytics";
import Record from "./pages/Livestock/Record";
import AddAnimal from "./pages/Livestock/AddAnimal";
import AnimalList from "./pages/Livestock/AnimalList";
import Livestock from "./pages/Livestock/Livestock";
import EditAnimal from "./pages/Livestock/EditAnimal";
import FarmStats from "./pages/Farm/FarmStats";
import ManageStock from "./pages/Farm/manageStock";
import UploadCsv from "./pages/UploadCsv";
import Login from "./components/Login";
import Logout from "./components/Logout";
import SignUp from "./components/SignUp";
import Layout from "./components/layouts/Layout";
import NotFound from "./components/404";
import ScanPage from "./pages/scanpage"; 
import EditRecord from "./pages/Livestock/EditRecord";
import ChooseFarm from "./pages/guard/choosefarm";


function App() {
  const { user, isAuthChecked } = useAuth();
  const [checkingFarm, setCheckingFarm] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFarm = async () => {
      if (!user) return;

      setCheckingFarm(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid as string));
        const data = userDoc.data();
        if (!data?.farms || data.farms.length === 0) {
          navigate("/choose-farm");
        }
      } catch (err) {
        console.error("Error checking farm:", err);
      } finally {
        setCheckingFarm(false);
      }
    };

    checkFarm();
  }, [user, navigate]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {!isAuthChecked || checkingFarm ? (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
          <img src="/happy-cow.webp" alt="Loading..." className="w-32 h-32 animate-spin-fast" />
          <p className="mt-4 text-lg text-muted-foreground">Moo-ving things into place...</p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={user ? <Layout><Dashboard /></Layout> : <Login />} />
          <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Login />} />
          <Route path="/choose-farm" element={user ? <ChooseFarm /> : <Login />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/logout" element={<Logout />} />

          <Route path="/scan" element={user ? <Layout><ScanPage /></Layout> : <Login />} />
          <Route path="/livestock" element={user ? <Layout><Livestock /></Layout> : <Login />} />
          <Route path="/analytics" element={user ? <Layout><Analytics /></Layout> : <Login />} />
          <Route path="/livestock/record" element={user ? <Layout><Record /></Layout> : <Login />} />
          <Route path="/livestock/add" element={user ? <Layout><AddAnimal /></Layout> : <Login />} />
          <Route path="/livestock/list" element={user ? <Layout><AnimalList /></Layout> : <Login />} />
          <Route path="/livestock/edit" element={user ? <Layout><AnimalList /></Layout> : <Login />} />
          <Route path="/livestock/edit/:animalId" element={user ? <Layout><EditAnimal /></Layout> : <Login />} />
          <Route path="/livestock/edit/:animalId/:recordId" element={user ? <Layout><EditRecord /></Layout> : <Login />} />
          <Route path="/seed" element={user ? <Layout><UploadCsv /></Layout> : <Login />} />
          <Route path="/farm/settings" element={user ? <Layout><FarmStats /></Layout> : <Login />} />
          <Route path="/farm/manage" element={user ? <Layout><ManageStock /></Layout> : <Login />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </ThemeProvider>
  );
}

export default App;
