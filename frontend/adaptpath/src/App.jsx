import React from "react";
import { Routes, Route } from "react-router-dom";

// Existing pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PracticeTest from "./pages/PracticeTest";
import DiagnosticTest from "./pages/DiagnosticTest";
import TestComplete from "./pages/TestComplete";
import EnhancedDashboard from "./pages/EnhancedDashboard"; // ✅ Make sure this is imported

// AI Tutor component
import AITutor from "./components/AITutor";

export default function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Dashboard - EnhancedDashboard with AI insights */}
      <Route path="/dashboard" element={<EnhancedDashboard />} />

      {/* AI Tutor Routes */}
      <Route path="/ai-tutor" element={<AITutor />} />
      <Route path="/learn" element={<AITutor />} />

      {/* Diagnostic Test Flow */}
      <Route path="/diagnostic" element={<DiagnosticTest />} />
      <Route path="/test-complete" element={<TestComplete />} />

      {/* Practice */}
      <Route path="/practice" element={<PracticeTest />} />
    </Routes>
  );
}