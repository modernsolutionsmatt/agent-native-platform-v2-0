import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProjectList from "./components/ProjectList";
import ProjectDetail from "./components/ProjectDetail";
import NewSession from "./components/NewSession";
import SessionDetail from "./components/SessionDetail";
import AuditLog from "./components/AuditLog";
import HealthMonitor from "./components/HealthMonitor";

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/session/new" element={<NewSession />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/health" element={<HealthMonitor />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
