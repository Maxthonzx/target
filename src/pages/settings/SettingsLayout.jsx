import React, { useMemo } from 'react';
import { Card, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Settings.css';

const { Text } = Typography;

const TABS = [
  { key: '/settings/approval', label: '审批流配置' },
  { key: '/settings/threshold', label: '阈值配置' },
  { key: '/settings/roles', label: '角色配置' },
  { key: '/settings/users', label: '用户权限' },
];

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = useMemo(() => {
    const path = location.pathname;
    const match = TABS.find((t) => path.startsWith(t.key));
    return match?.key ?? '/settings/approval';
  }, [location.pathname]);

  return (
    <div className="ims-settings">
      <div className="ims-settings-header">
        <div>
          <div className="ims-settings-title">系统设置</div>
          <div className="ims-settings-sub">公司级配置与权限控制（前端 Demo）</div>
        </div>
        <Space size={12}>
          <Text type="secondary">配置修改将立即生效（Mock）</Text>
        </Space>
      </div>

      <Card bordered={false} className="ims-settings-shell" bodyStyle={{ padding: 16 }}>
        <div className="ims-settings-nav">
          <div className="ims-seg" role="tablist" aria-label="设置导航">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`ims-seg-btn ${activeKey === t.key ? 'is-active' : ''}`}
                role="tab"
                aria-selected={activeKey === t.key}
                onClick={() => navigate(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Text className="ims-muted">建议：先配置审批流，再配置阈值与权限</Text>
        </div>

        <Outlet />
      </Card>
    </div>
  );
}
