// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Record from "./pages/Livestock/Record";
import AddAnimal from "./pages/Livestock/AddAnimal";
import AnimalList from "./pages/Livestock/AnimalList";
import EditAnimal from "./pages/Livestock/EditAnimal";
import FarmStats from "./pages/Farm/FarmStats";
import UploadCsv from "./pages/UploadCsv";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/record" element={<Layout><Record /></Layout>} />
      <Route path="/add-animal" element={<Layout><AddAnimal /></Layout>} />
      <Route path="/animal-list" element={<Layout><AnimalList /></Layout>} />
      <Route path="/edit-animal/:animalId" element={<Layout><EditAnimal /></Layout>} />
      <Route path="/seed" element={<Layout><UploadCsv /></Layout>} />
      <Route path="/farm" element={<Layout><FarmStats /></Layout>} />
      <Route path="*" element={<Layout><div>404 Not Found</div></Layout>} />
    </Routes>
  );
}

export default App;
