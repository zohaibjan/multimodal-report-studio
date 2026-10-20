import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import InspectionForm from './components/InspectionForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inspection/new" element={
              <div className="max-w-6xl mx-auto px-4 py-8">
                <InspectionForm />
              </div>
            } />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="border-t border-border/50 py-4">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Multimodal Report Studio
            &nbsp;&mdash;&nbsp;AI-assisted analysis, verify findings with a qualified professional.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
