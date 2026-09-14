import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ProfileUpdate from './pages/ProfileUpdate';

// Employee views
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AttendanceLog from './pages/employee/AttendanceLog';
import LeaveApplications from './pages/employee/LeaveApplications';
import ApplyLeave from './pages/employee/ApplyLeave';

// Manager views
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamApprovals from './pages/manager/TeamApprovals';
import EmployeeAdmin from './pages/manager/EmployeeAdmin';
import OnboardMember from './pages/manager/OnboardMember';

function MainLayout() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const isManager = currentUser.role === 'Manager';
  const effectiveTab = (currentTab === 'dashboard' && isManager) ? 'manager-dashboard' : currentTab;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Top Header: Clicking DP navigates to Profile */}
      <Header onNavigate={(tab) => setCurrentTab(tab)} activeTab={effectiveTab} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar currentTab={effectiveTab} setCurrentTab={setCurrentTab} />

        {/* Dynamic Route views */}
        <main className="flex-1 overflow-y-auto">
          {/* Universal Profile Route */}
          {effectiveTab === 'profile' && <ProfileUpdate />}

          {/* Employee Routes */}
          {!isManager && (
            <>
              {effectiveTab === 'dashboard' && (
                <EmployeeDashboard onApplyLeave={() => setCurrentTab('apply-leave')} />
              )}
              {effectiveTab === 'attendance' && <AttendanceLog />}
              {effectiveTab === 'leaves' && (
                <LeaveApplications onApplyClick={() => setCurrentTab('apply-leave')} />
              )}
              {effectiveTab === 'apply-leave' && (
                <ApplyLeave onDone={() => setCurrentTab('leaves')} />
              )}
            </>
          )}

          {/* Manager Routes */}
          {isManager && (
            <>
              {effectiveTab === 'manager-dashboard' && (
                <ManagerDashboard onReviewRequests={() => setCurrentTab('team-approvals')} />
              )}
              {effectiveTab === 'team-approvals' && <TeamApprovals />}
              {effectiveTab === 'employee-admin' && (
                <EmployeeAdmin onAddEmployee={() => setCurrentTab('onboard-member')} />
              )}
              {effectiveTab === 'onboard-member' && (
                <OnboardMember onDone={() => setCurrentTab('employee-admin')} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}