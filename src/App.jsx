import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import { ROLES } from "./auth/AuthContext";

import PublicLayout from "./layouts/PublicLayout";
import CitizenLayout from "./layouts/CitizenLayout";
import PoliceLayout from "./layouts/PoliceLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Emergency from "./pages/Emergency";
import SafetyResources from "./pages/SafetyResources";
import Contact from "./pages/Contact";

import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";

import CitizenDashboard from "./citizen/Dashboard";
import ReportCrime from "./citizen/ReportCrime";
import MyReports from "./citizen/MyReports";
import TrackCase from "./citizen/TrackCase";
import CitizenNotifications from "./citizen/Notifications";
import CitizenProfile from "./citizen/Profile";

import PoliceDashboard from "./police/Dashboard";
import NewReports from "./police/NewReports";
import AssignedCases from "./police/AssignedCases";
import CaseDetails from "./police/CaseDetails";
import Investigation from "./police/Investigation";
import Evidence from "./police/Evidence";
import PoliceReports from "./police/Reports";
import PoliceProfile from "./police/Profile";

import AdminDashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import PoliceOfficers from "./admin/PoliceOfficers";
import AdminReports from "./admin/Reports";
import CaseAssignment from "./admin/CaseAssignment";
import Analytics from "./admin/Analytics";
import AuditLogs from "./admin/AuditLogs";
import AdminProfile from "./admin/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/safety-resources" element={<SafetyResources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.CITIZEN]} />}>
          <Route element={<CitizenLayout />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/report-crime" element={<ReportCrime />} />
          <Route path="/citizen/my-reports" element={<MyReports />} />
          <Route path="/citizen/my-reports/:id" element={<TrackCase />} />
          <Route path="/citizen/notifications" element={<CitizenNotifications />} />
            <Route path="/citizen/profile" element={<CitizenProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.POLICE]} />}>
          <Route element={<PoliceLayout />}>
          <Route path="/police/dashboard" element={<PoliceDashboard />} />
          <Route path="/police/new-reports" element={<NewReports />} />
          <Route path="/police/assigned-cases" element={<AssignedCases />} />
          <Route path="/police/cases/:id" element={<CaseDetails />} />
          <Route path="/police/cases/:id/investigation" element={<Investigation />} />
          <Route path="/police/cases/:id/evidence" element={<Evidence />} />
          <Route path="/police/reports" element={<PoliceReports />} />
            <Route path="/police/profile" element={<PoliceProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/police-officers" element={<PoliceOfficers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/case-assignment" element={<CaseAssignment />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-teal-700">404</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">Page not found</h1>
        <a className="mt-6 inline-block text-teal-700 underline" href="/">Return home</a>
      </div>
    </div>
  );
}
