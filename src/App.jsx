import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Rooms from "@/components/pages/Rooms";
import Bookings from "@/components/pages/Bookings";
import Payments from "@/components/pages/Payments";
import Housekeeping from "@/components/pages/Housekeeping";
import Maintenance from "@/components/pages/Maintenance";
import Staff from "@/components/pages/Staff";
import Reports from "@/components/pages/Reports";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </Router>
  );
}

export default App;