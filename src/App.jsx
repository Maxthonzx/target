import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LayoutV2 from './layouts/LayoutV2';
import Dashboard from './pages/Dashboard';
import DashboardV2 from './pages/DashboardV2';
import IndicatorList from './pages/IndicatorList';
import TargetManagement from './pages/TargetManagement';
import ChangeManagement from './pages/ChangeManagement';
import Workbench from './pages/Workbench';
import SettingsLayout from './pages/settings/SettingsLayout';
import ApprovalSettings from './pages/settings/ApprovalSettings';
import ThresholdSettings from './pages/settings/ThresholdSettings';
import RoleSettings from './pages/settings/RoleSettings';
import UserPermissionSettings from './pages/settings/UserPermissionSettings';
import { ConfigProvider } from 'antd';
import themeConfig from './theme/themeConfig';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

// 占位功能
const Placeholder = ({ title }) => (
  <div style={{ padding: 24, textAlign: 'center', background: '#fff', borderRadius: 8, minHeight: 400 }}>
    <h2>{title}</h2>
    <p>该功能正在开发中...</p>
  </div>
);

function App() {
  return (
    <ConfigProvider theme={themeConfig} locale={zhCN}>
      <HashRouter>
        <Routes>
          {/* Legacy Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="workbench" element={<Workbench />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="indicators" element={<IndicatorList />} />
            <Route path="targets" element={<TargetManagement />} />
            <Route path="changes" element={<ChangeManagement />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/approval" replace />} />
              <Route path="approval" element={<ApprovalSettings />} />
              <Route path="threshold" element={<ThresholdSettings />} />
              <Route path="roles" element={<RoleSettings />} />
              <Route path="users" element={<UserPermissionSettings />} />
            </Route>
          </Route>

          {/* New V2 Routes (Applied frontend-design skill) */}
          <Route path="/v2" element={<LayoutV2 />}>
             <Route index element={<Navigate to="/v2/dashboard" replace />} />
             <Route path="dashboard" element={<DashboardV2 />} />
             <Route path="indicators" element={<Placeholder title="Indicator Matrix V2" />} />
             <Route path="targets" element={<Placeholder title="Target Control Center" />} />
             <Route path="changes" element={<Placeholder title="Change Logs" />} />
             <Route path="settings" element={<Placeholder title="System Config" />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;
