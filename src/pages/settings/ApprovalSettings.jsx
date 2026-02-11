import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { approvalFlowTemplates, roleOptions } from '../../mock/data';

const { Text } = Typography;

const SCOPE_OPTIONS = [
  { value: '公司级', label: '公司级' },
  { value: '战役级', label: '战役级' },
  { value: '部门级', label: '部门级' },
];

const defaultStep = () => ({
  role: '部门负责人',
  approver: '部门负责人',
  slaHours: 24,
});

export default function ApprovalSettings() {
  const [rows, setRows] = useState(approvalFlowTemplates);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const kpis = useMemo(() => {
    const enabled = rows.filter((r) => r.enabled).length;
    const totalSteps = rows.reduce((sum, r) => sum + (r.steps?.length ?? 0), 0);
    const avgSteps = rows.length ? (totalSteps / rows.length).toFixed(1) : '0.0';
    return { enabled, total: rows.length, avgSteps };
  }, [rows]);

  const openEditor = (record) => {
    setEditingId(record?.id ?? null);
    setOpen(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        steps: (record.steps ?? []).map((s) => ({ ...defaultStep(), ...s })),
      });
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      id: `FLOW_${Date.now()}`,
      name: '新审批流',
      scope: '部门级',
      enabled: true,
      steps: [defaultStep()],
    });
  };

  const close = () => {
    setOpen(false);
    setEditingId(null);
  };

  const save = async () => {
    const values = await form.validateFields();
    const normalized = {
      ...values,
      steps: (values.steps ?? []).map((s, idx) => ({ ...s, order: idx + 1 })),
    };
    setRows((prev) => {
      const exists = prev.some((p) => p.id === normalized.id);
      if (!exists) return [normalized, ...prev];
      return prev.map((p) => (p.id === normalized.id ? normalized : p));
    });
    message.success('审批流已保存（Mock）');
    close();
  };

  const columns = [
    {
      title: '审批流名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <Space size={8}>
          <Text strong>{name}</Text>
          <Tag>{r.scope}</Tag>
          {r.enabled ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>}
        </Space>
      ),
    },
    {
      title: '步骤',
      dataIndex: 'steps',
      key: 'steps',
      width: 280,
      render: (steps) => (
        <Space size={[6, 6]} wrap>
          {(steps ?? []).slice(0, 3).map((s, idx) => (
            <Tag key={`${s.role}-${idx}`} color="blue">
              {idx + 1}. {s.role}
            </Tag>
          ))}
          {(steps?.length ?? 0) > 3 ? <Text type="secondary">+{steps.length - 3}</Text> : null}
        </Space>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 120,
      render: (enabled, r) => (
        <Switch
          checked={enabled}
          onChange={(checked) => {
            setRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, enabled: checked } : p)));
            message.success(checked ? '已启用（Mock）' : '已停用（Mock）');
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Space>
          <Button type="link" onClick={() => openEditor(r)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="ims-settings-kpis">
        <div className="ims-kpi">
          <div className="ims-kpi__label">已启用审批流</div>
          <div className="ims-kpi__value">
            {kpis.enabled} / {kpis.total}
          </div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">平均审批步骤</div>
          <div className="ims-kpi__value">{kpis.avgSteps}</div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">建议</div>
          <div className="ims-kpi__value" style={{ fontSize: 14, fontWeight: 750 }}>
            优先保障红灯归因与目标变更的审批时效
          </div>
        </div>
      </div>

      <div className="ims-inline-actions" style={{ marginBottom: 12 }}>
        <Badge count={rows.filter((r) => !r.enabled).length} size="small" overflowCount={99}>
          <Button onClick={() => message.info('查看停用审批流（Mock）')}>停用项</Button>
        </Badge>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor(null)}>
          新建审批流
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={rows} pagination={{ pageSize: 8 }} />

      <Drawer
        title={editingId ? '编辑审批流' : '新建审批流'}
        open={open}
        onClose={close}
        width={720}
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
          <Form.Item name="id" label="ID" hidden>
            <Input />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <Form.Item name="name" label="审批流名称" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="如：红灯归因审批" />
            </Form.Item>
            <Form.Item name="scope" label="适用范围" rules={[{ required: true }]}>
              <Select options={SCOPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="enabled" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.List name="steps">
            {(fields, { add, remove }) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <Text strong>审批步骤</Text>
                  <Button
                    onClick={() => add(defaultStep())}
                    type="dashed"
                    icon={<PlusOutlined />}
                  >
                    添加步骤
                  </Button>
                </div>

                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  {fields.map((field, idx) => (
                    <Card key={field.key} size="small" bordered={false} style={{ background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text type="secondary">步骤 {idx + 1}</Text>
                        <Button type="link" danger onClick={() => remove(field.name)}>
                          删除
                        </Button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 12 }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'role']}
                          label="审批角色"
                          rules={[{ required: true, message: '请选择角色' }]}
                        >
                          <Select options={roleOptions} />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'approver']}
                          label="审批人（展示用）"
                          rules={[{ required: true, message: '请输入审批人' }]}
                        >
                          <Input placeholder="如：财务总监" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'slaHours']}
                          label="SLA（小时）"
                          rules={[{ required: true, message: '请输入 SLA' }]}
                        >
                          <InputNumber min={1} max={168} style={{ width: '100%' }} />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                </Space>
              </div>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </div>
  );
}
