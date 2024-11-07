import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SalesAnalysis from "./SalesAnalysis/SalesAnalysis";
import ClientProfile from "./SalesAnalysis/ClientProfile";
import SalesIntervals from "./SalesAnalysis/SalesIntervals";
import FutureSales from "./SalesAnalysis/FutureSales";
import PriceImpact from "./SalesAnalysis/PriceImpact";
import Navbar from "./Layout/Navbar";

const App = () => {
  return (
    <Router>
      <Navbar /> 
            <div className="content">
        <Routes>
          <Route path="/" element={<SalesAnalysis />} />
          <Route path="/client-profile" element={<ClientProfile />} />
          <Route path="/sales-intervals" element={<SalesIntervals />} />
          <Route path="/future-sales" element={<FutureSales />} />
          <Route path="/price-impact" element={<PriceImpact />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
