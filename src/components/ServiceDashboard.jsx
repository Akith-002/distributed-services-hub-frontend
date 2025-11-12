import MultiTabDashboard from "./MultiTabDashboard";

/**
 * ServiceDashboard - Main Dashboard Wrapper
 *
 * Phase 2 (Member 2): This component has been refactored to be a simple wrapper
 * around the new MultiTabDashboard component. All the functionality has been moved
 * to MultiTabDashboard.jsx which provides:
 *
 * - Tab 1: Service Registry (Member 1 - Multithreading & Concurrency)
 * - Tab 2: API Gateway (Member 2 - HttpURLConnection)
 * - Tab 3: Security Test (Member 3 - JSSE & SSLServerSocket)
 * - Tab 4: NIO Log Stream (Member 4 - Java NIO & Selector)
 * - Tab 5: RMI Task Runner (Member 5 - Java RMI)
 */
export default function ServiceDashboard() {
  return <MultiTabDashboard />;
}
