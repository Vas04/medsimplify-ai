import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Report from "./pages/Report";
import History from "./pages/History";
import Settings from "./pages/Settings";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />

        {/* Upload */}
        <Route
          path="/upload"
          element={
            <AppLayout>
              <Upload />
            </AppLayout>
          }
        />

        {/* Reports */}
        <Route
          path="/report"
          element={
            <AppLayout>
              <Report />
            </AppLayout>
          }
        />

        {/* Individual Report */}
        <Route
          path="/report/:id"
          element={
            <AppLayout>
              <Report />
            </AppLayout>
          }
        />

        {/* History */}
        <Route
          path="/history"
          element={
            <AppLayout>
              <History />
            </AppLayout>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />

        {/* Unknown routes → Dashboard */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;