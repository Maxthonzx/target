import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
    DashboardOutlined,
    DatabaseOutlined,
    AimOutlined,
    WarningOutlined,
    SettingOutlined,
    FormOutlined,
    UserOutlined,
    BellOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const menuItems = [
    {
        key: '/workbench',
        icon: <FormOutlined />,
        label: '工作台',
    },
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: '驾驶舱',
    },
    {
        key: '/indicators',
        icon: <DatabaseOutlined />,
        label: '指标字典',
    },
    {
        key: '/targets',
        icon: <AimOutlined />,
        label: '目标管理',
    },
    {
        key: '/changes',
        icon: <WarningOutlined />,
        label: '变更管理',
    },
    {
        key: '/settings',
        icon: <SettingOutlined />,
        label: '系统设置',
        children: [
            { key: '/settings/approval', label: '审批流配置' },
            { key: '/settings/threshold', label: '阈值配置' },
            { key: '/settings/roles', label: '角色配置' },
            { key: '/settings/users', label: '用户权限' },
        ],
    },
];

const userMenuItems = [
    {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息',
    },
    {
        type: 'divider',
    },
    {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
    },
];

function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    // 获取当前选中的菜单项
    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path.startsWith('/settings')) {
            return [path];
        }
        return [path];
    };

    // 获取展开的菜单项
    const getOpenKeys = () => {
        if (location.pathname.startsWith('/settings')) {
            return ['/settings'];
        }
        return [];
    };

    return (
        <Layout className="main-layout">
            {/* 侧边栏 */}
            <Sider width={220} className="main-sider">
                <div className="logo">
                    <div className="logo-icon">DST</div>
                    <span className="logo-text">目标管理系统</span>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={getOpenKeys()}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="main-menu"
                />
            </Sider>

            <Layout className="main-content-wrapper">
                {/* 顶部栏 */}
                <Header className="main-header">
                    <div className="header-left">
                        <span className="current-date">
                            {new Date().toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'long',
                            })}
                        </span>
                    </div>
                    <div className="header-right">
                        <Badge count={3} size="small" offset={[-2, 2]}>
                            <BellOutlined className="header-icon" />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div className="user-info">
                                <Avatar size="small" icon={<UserOutlined />} />
                                <span className="user-name">管理员</span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* 内容区 */}
                <Content className="main-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default MainLayout;
