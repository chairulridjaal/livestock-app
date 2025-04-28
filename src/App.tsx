import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard/Dashboard";
import Record from "./pages/Livestock/Record";
import AddAnimal from "./pages/Livestock/AddAnimal";
import AnimalList from "./pages/Livestock/AnimalList";
import EditAnimal from "./pages/Livestock/EditAnimal";
import FarmStats from "./pages/Farm/FarmStats";
import UploadCsv from "./pages/UploadCsv";
import Login from "./components/Login";
import Logout from "./components/Logout";
import SignUp from "./components/SignUp";
import Layout from "./components/Layout";

function App() {
  const { user } = useAuth(); // Get the user state from AuthContext

  return (
    <Routes>
      {/* For the home/dashboard route, only render Layout if the user is logged in */}
      <Route path="/" element={user ? <Layout><Dashboard /></Layout> : <Login />} />
      
      {/* Login and Signup pages should not have the Layout component */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/logout" element={<Logout />} />
      
      {/* All other routes require authentication */}
      <Route path="/record" element={user ? <Layout><Record /></Layout> : <Login />} />
      <Route path="/add-animal" element={user ? <Layout><AddAnimal /></Layout> : <Login />} />
      <Route path="/animal-list" element={user ? <Layout><AnimalList /></Layout> : <Login />} />
      <Route path="/edit-animal/:animalId" element={user ? <Layout><EditAnimal /></Layout> : <Login />} />
      <Route path="/seed" element={user ? <Layout><UploadCsv /></Layout> : <Login />} />
      <Route path="/farm" element={user ? <Layout><FarmStats /></Layout> : <Login />} />
      
      {/* Catch-all route for 404 page */}
      <Route path="*" element={<Layout><div>404 Not Found</div></Layout>} />
    </Routes>
  );
}

export default App;