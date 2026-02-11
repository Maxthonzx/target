import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  AppstoreOutlined,
  BarChartOutlined,
  AimOutlined,
  SwapOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './LayoutV2.css';

const LayoutV2 = () => {
  const navItems = [
    { name: '数据总览', path: '/v2/dashboard', icon: <AppstoreOutlined /> },
    { name: '指标管理', path: '/v2/indicators', icon: <BarChartOutlined /> },
    { name: '目标管理', path: '/v2/targets', icon: <AimOutlined /> },
    { name: '变更记录', path: '/v2/changes', icon: <SwapOutlined /> },
    { name: '系统设置', path: '/v2/settings', icon: <SettingOutlined /> },
  ];

  const currentDate = new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="layout-v2">
      <aside className="layout-v2__sidebar">
        <div className="layout-v2__logo">IMS 指标系统 V2</div>
        <nav className="layout-v2__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `layout-v2__nav-item ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="layout-v2__main">
        <header className="layout-v2__header">
          <div className="layout-v2__date">{currentDate}</div>
          <div className="layout-v2__user-profile">
            <span>管理员</span>
            <div className="layout-v2__avatar">管</div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutV2;
