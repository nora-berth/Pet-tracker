import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PetList from './components/pets/PetList';
import PetDetail from './components/pets/PetDetail';
import AddPet from './components/pets/AddPet';
import EditPet from './components/pets/EditPet';
import AddWeightRecord from './components/pets/AddWeightRecord';
import AddVaccination from './components/pets/AddVaccination';
import AddVetVisit from './components/pets/AddVetVisit';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🐾 Pet Tracker</h1>
          <div className="demo-notice">
            ⚠️ Demo Version
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<PetList />} />
            <Route path="/pets/:id" element={<PetDetail />} />
            <Route path="/add-pet" element={<AddPet />} />
            <Route path="/pets/:petId/add-weight" element={<AddWeightRecord />} />
            <Route path="/pets/:id/edit" element={<EditPet />} />
            <Route path="/pets/:petId/add-vaccination" element={<AddVaccination />} />
            <Route path="/pets/:petId/add-vet-visit" element={<AddVetVisit />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;