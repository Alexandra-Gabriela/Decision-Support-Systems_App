import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SalesAnalysis from "./SalesAnalysis/SalesAnalysis";
import ClientProfile from "./SalesAnalysis/ClientProfile";
import SalesProportions from "./SalesAnalysis/SalesProportions";
import SalesIntervals from "./SalesAnalysis/SalesIntervals";
import FutureSales from "./SalesAnalysis/FutureSales";
import PriceImpact from "./SalesAnalysis/PriceImpact";
import Navbar from "./Layout/Navbar";

const App = () => {
  return (
    <Router>
      <Navbar /> {/* Navbar va fi afișat mereu */}
      <div className="content">
        <Routes>
          <Route path="/" element={<SalesAnalysis />} />
          <Route path="/sales-proportions" element={<SalesProportions />} />
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
