import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tree,
  Typography,
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { rolesDemo, permissionTreeData } from '../../mock/data';

const { Text } = Typography;
const { TextArea } = Input;

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

export default function RoleSettings() {
  const [rows, setRows] = useState(rolesDemo);
  const [keyword, setKeyword] = useState('');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const permissionLabelMap = useMemo(() => flattenPermissions(permissionTreeData), []);
  const selectedPermissions = Form.useWatch('permissions', form) || [];

  const filtered = useMemo(() => {
    const k = keyword.trim();
    if (!k) return rows;
    return rows.filter((r) => r.name?.includes(k) || r.description?.includes(k) || r.code?.includes(k));
  }, [keyword, rows]);

  const kpis = useMemo(() => {
    const enabled = rows.filter((r) => r.enabled).length;
    const system = rows.filter((r) => r.type === 'system').length;
    const custom = rows.filter((r) => r.type === 'custom').length;
    return { enabled, total: rows.length, system, custom };
  }, [rows]);

  const onAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      code: `ROLE_${Date.now().toString().slice(-6)}`,
      enabled: true,
      type: 'custom',
      permissions: [],
    });
    setEditingId(null);
    setOpen(true);
  };

  const onEdit = (rec) => {
    form.setFieldsValue({ ...rec, permissions: rec.permissions ?? [] });
    setEditingId(rec.id);
    setOpen(true);
  };

  const onDelete = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    message.success('角色已删除');
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const normalized = { ...values, permissions: values.permissions ?? [] };
      if (editingId) {
        setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...normalized } : r)));
        message.success('角色已更新');
      } else {
        const newRole = { id: `role_${Date.now()}`, ...normalized };
        setRows((prev) => [...prev, newRole]);
        message.success('角色已创建');
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 140,
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 170,
      render: (t) => <Tag className="role-code">{t}</Tag>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 110,
      render: (t) => (
        <Badge
          className="role-type"
          color={t === 'system' ? 'blue' : 'cyan'}
          text={t === 'system' ? '系统角色' : '自定义'}
        />
      ),
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      width: 200,
      render: (perms = []) => (
        <div className="role-perms">
          <Tag color="geekblue">{perms.length} 项</Tag>
          {perms.slice(0, 2).map((p) => (
            <Tag key={p}>{permissionLabelMap.get(p) ?? p}</Tag>
          ))}
          {perms.length > 2 ? <Tag>+{perms.length - 2}</Tag> : null}
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 260,
      render: (t) => <Text type="secondary">{t || '—'}</Text>,
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      width: 90,
      align: 'right',
      render: (t) => <Text>{t || 0}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      width: 90,
      render: (enabled) => (
        <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '停用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, rec) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => onEdit(rec)}>
            编辑
          </Button>
          {rec.type !== 'system' && (
            <Popconfirm
              title="确定删除该角色？"
              onConfirm={() => onDelete(rec.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="ims-settings-kpis">
        <div className="ims-kpi">
          <div className="ims-kpi__label">角色总数</div>
          <div className="ims-kpi__value">
            <span style={{ color: '#1677ff' }}>{kpis.total}</span>
          </div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">启用</div>
          <div className="ims-kpi__value">{kpis.enabled}</div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">系统角色</div>
          <div className="ims-kpi__value">{kpis.system}</div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">自定义角色</div>
          <div className="ims-kpi__value" style={{ fontSize: 14, fontWeight: 800 }}>
            {kpis.custom}
          </div>
        </div>
      </div>

      <Card variant="borderless">
        <Space style={{ marginBottom: 16 }} size={8} wrap>
          <Input.Search
            prefix={<SearchOutlined />}
            placeholder="搜索角色名称/编码/描述"
            style={{ width: 280 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={() => setKeyword('')}>
            重置
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            新增角色
          </Button>
        </Space>

        <Table
          className="role-table"
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          tableLayout="fixed"
          scroll={{ x: 980 }}
        />
      </Card>

      <Drawer
        title={editingId ? '编辑角色' : '新增角色'}
        open={open}
        onClose={() => setOpen(false)}
        width={680}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" onClick={onSubmit}>
              提交
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}> 
            <Input placeholder="例如：指标专员" maxLength={30} />
          </Form.Item>

          <Form.Item name="code" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}> 
            <Input placeholder="例如：ROLE_INDICATOR_ADMIN" maxLength={50} />
          </Form.Item>

          <Form.Item name="type" label="角色类型" rules={[{ required: true }]}> 
            <Select
              options={[
                { value: 'system', label: '系统角色' },
                { value: 'custom', label: '自定义角色' },
              ]}
            />
          </Form.Item>

          <Form.Item name="description" label="角色描述"> 
            <TextArea placeholder="描述该角色的职责范围" rows={3} maxLength={200} />
          </Form.Item>

          <Form.Item name="enabled" label="启用状态" valuePropName="checked"> 
            <Checkbox>启用该角色</Checkbox>
          </Form.Item>

          <Form.Item
            name="permissions"
            label="权限配置"
            valuePropName="checkedKeys"
            getValueFromEvent={(checkedKeys) => checkedKeys}
          >
            <Tree
              checkable
              defaultExpandAll
              treeData={permissionTreeData}
              fieldNames={{ title: 'label', key: 'value', children: 'children' }}
            />
          </Form.Item>

          <div className="role-perm-preview">
            <Text type="secondary">已选权限：</Text>
            <div className="role-perms">
              {selectedPermissions.length
                ? selectedPermissions.map((p) => (
                    <Tag key={p}>{permissionLabelMap.get(p) ?? p}</Tag>
                  ))
                : <Tag>未选择</Tag>}
            </div>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
