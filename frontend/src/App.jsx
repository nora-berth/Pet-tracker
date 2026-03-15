import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
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
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navbar />
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
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;