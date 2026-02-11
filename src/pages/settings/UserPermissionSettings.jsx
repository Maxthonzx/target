import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { departmentList, rolesDemo, permissionTreeData, userAccountsDemo } from '../../mock/data';

const { Text } = Typography;

function uniquePermissions(roles, roleMap) {
  const set = new Set();
  roles.forEach((id) => {
    const role = roleMap.get(id);
    role?.permissions?.forEach((p) => set.add(p));
  });
  return Array.from(set);
}

function flattenPermissions(nodes, map = new Map()) {
  nodes.forEach((node) => {
    if (node.children?.length) {
      flattenPermissions(node.children, map);
    } else {
      map.set(node.value, node.label);
    }
  });
  return map;
}

export default function UserPermissionSettings() {
  const [rows, setRows] = useState(userAccountsDemo);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState(undefined);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const roleMap = useMemo(() => new Map(rolesDemo.map((r) => [r.id, r])), []);
  const roleOptions = useMemo(() => rolesDemo.map((r) => ({ value: r.id, label: r.name })), []);
  const permissionLabelMap = useMemo(() => flattenPermissions(permissionTreeData), []);

  const filtered = useMemo(() => {
    const k = keyword.trim();
    return rows.filter((r) => {
      if (roleFilter && !(r.roles || []).includes(roleFilter)) return false;
      if (!k) return true;
      return (
        r.name?.includes(k) ||
        r.email?.includes(k) ||
        r.department?.includes(k)
      );
    });
  }, [keyword, roleFilter, rows]);

  const kpis = useMemo(() => {
    const enabled = rows.filter((r) => r.enabled).length;
    const admins = rows.filter((r) => (r.roles || []).includes('ROLE_001')).length;
    return { enabled, total: rows.length, admins };
  }, [rows]);

  const openEditor = (record) => {
    setEditingId(record?.id ?? null);
    setOpen(true);
    if (record) {
      form.setFieldsValue({ ...record, roles: record.roles ?? [] });
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      id: `U_${Date.now()}`,
      name: '',
      email: '',
      department: 'PMO',
      roles: ['ROLE_005'],
      enabled: true,
    });
  };

  const close = () => {
    setOpen(false);
    setEditingId(null);
  };

  const save = async () => {
    const values = await form.validateFields();
    const normalized = { ...values, roles: values.roles ?? [] };
    setRows((prev) => {
      const exists = prev.some((p) => p.id === values.id);
      if (!exists) return [{ ...normalized }, ...prev];
      return prev.map((p) => (p.id === values.id ? { ...normalized } : p));
    });
    message.success('用户信息已保存（Mock）');
    close();
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, r) => (
        <div className="user-stack">
          <Text strong>{name}</Text>
          <Text type="secondary">{r.email}</Text>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 220,
      render: (roles = []) => (
        <div className="user-roles">
          {roles.length ? roles.map((id) => (
            <Tag key={id}>{roleMap.get(id)?.name ?? id}</Tag>
          )) : <Tag>未分配</Tag>}
        </div>
      ),
    },
    {
      title: '权限数',
      key: 'permCount',
      width: 100,
      render: (_, r) => {
        const perms = uniquePermissions(r.roles || [], roleMap);
        return <Tag color="geekblue">{perms.length} 项</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 110,
      render: (enabled) => (enabled ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />),
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_, r) => (
        <Space size={10}>
          <Button type="link" onClick={() => openEditor(r)}>
            编辑
          </Button>
          <Popconfirm title="确认重置密码？（Mock）" onConfirm={() => message.success('已触发重置密码（Mock）')}>
            <Button type="link" icon={<ReloadOutlined />}>
              重置密码
            </Button>
          </Popconfirm>
          <Button
            type="link"
            danger
            onClick={() => {
              setRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, enabled: !p.enabled } : p)));
              message.success(r.enabled ? '已停用（Mock）' : '已启用（Mock）');
            }}
          >
            {r.enabled ? '停用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  const selectedRoles = Form.useWatch('roles', form) || [];
  const derivedPermissions = uniquePermissions(selectedRoles, roleMap);

  return (
    <div>
      <div className="ims-settings-kpis">
        <div className="ims-kpi">
          <div className="ims-kpi__label">启用账号</div>
          <div className="ims-kpi__value">
            {kpis.enabled} / {kpis.total}
          </div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">管理员</div>
          <div className="ims-kpi__value">{kpis.admins}</div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">策略</div>
          <div className="ims-kpi__value" style={{ fontSize: 14, fontWeight: 800 }}>
            角色驱动权限 · 可分配多个角色
          </div>
        </div>
      </div>

      <div className="user-toolbar">
        <Space size={10} wrap>
          <Input
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索姓名/邮箱/部门"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            style={{ width: 280, borderRadius: 12 }}
          />
          <Select
            allowClear
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="筛选角色"
            options={roleOptions}
            style={{ width: 180 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor(null)}>
          新增用户
        </Button>
      </div>

      <Table
        className="user-table"
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 8 }}
        tableLayout="fixed"
        scroll={{ x: 980 }}
      />

      <Drawer
        title={editingId ? '编辑用户' : '新增用户'}
        open={open}
        onClose={close}
        width={600}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={close}>取消</Button>
            <Button type="primary" onClick={save}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <div className="user-grid">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="如：王总" />
            </Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
              <Input placeholder="name@company.com" />
            </Form.Item>
          </div>

          <div className="user-grid">
            <Form.Item name="department" label="部门" rules={[{ required: true }]}>
              <Select options={departmentList} />
            </Form.Item>
            <Form.Item name="roles" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
              <Select mode="multiple" options={roleOptions} placeholder="可多选" />
            </Form.Item>
          </div>

          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div className="user-perm-preview">
            <Text type="secondary">由角色自动生成的权限（只读）：</Text>
            <div className="user-perm-tags">
              {derivedPermissions.length
                ? derivedPermissions.map((p) => <Tag key={p}>{permissionLabelMap.get(p) ?? p}</Tag>)
                : <Tag>未分配</Tag>}
            </div>
          </div>

          <Text type="secondary">说明：权限由角色决定，用户不可直接配置权限。</Text>
        </Form>
      </Drawer>
    </div>
  );
}
