import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import RescueAnimals from './pages/RescueAnimals';
import Organizations from './pages/Organizations';
import Community from './pages/Community';
import Donate from './pages/Donate';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WhyAdopt from './pages/WhyAdopt';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/why-adopt" element={<WhyAdopt />} />
          <Route path="/rescue-animals" element={<RescueAnimals />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/community" element={<Community />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
