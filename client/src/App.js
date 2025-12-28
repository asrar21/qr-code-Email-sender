import React from 'react';
import QrCodeGenerator from './Component/qrCodeGeneratorComponent'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Component/Signup";
import Login from "./Component/Login";
import Dashboard from "./Component/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;