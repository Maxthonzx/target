import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Drawer,
  Form,
  InputNumber,
  message,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { indicatorList, thresholdConfigDemo } from '../../mock/data';

const { Text } = Typography;

const toneTag = (tone) => {
  if (tone === 'green') return <Tag color="green">绿灯</Tag>;
  if (tone === 'yellow') return <Tag color="gold">黄灯</Tag>;
  return <Tag color="red">红灯</Tag>;
};

const calcTone = (rate, cfg) => {
  if (rate === null || rate === undefined) return 'yellow';
  if (rate >= cfg.greenMin) return 'green';
  if (rate >= cfg.yellowMin) return 'yellow';
  return 'red';
};

export default function ThresholdSettings() {
  const [globalCfg, setGlobalCfg] = useState(thresholdConfigDemo.global);
  const [overrides, setOverrides] = useState(thresholdConfigDemo.overrides);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form] = Form.useForm();

  const indicatorById = useMemo(() => {
    const map = new Map();
    for (const i of indicatorList) map.set(i.id, i);
    return map;
  }, []);

  const rows = useMemo(() => {
    return indicatorList.map((i) => {
      const ov = overrides[i.id];
      const cfg = ov?.enabled ? ov : globalCfg;
      const mockRate = thresholdConfigDemo.mockLatestRate[i.id] ?? null;
      return {
        ...i,
        mockRate,
        cfg,
        overrideEnabled: Boolean(ov?.enabled),
        tone: calcTone(mockRate, cfg),
      };
    });
  }, [globalCfg, overrides]);

  const kpis = useMemo(() => {
    const overrideCount = Object.values(overrides).filter((v) => v?.enabled).length;
    const redCount = rows.filter((r) => r.tone === 'red').length;
    return { overrideCount, redCount };
  }, [overrides, rows]);

  const openEditor = (indicatorId) => {
    setCurrentId(indicatorId);
    const ov = overrides[indicatorId];
    form.setFieldsValue({
      enabled: Boolean(ov?.enabled),
      greenMin: ov?.greenMin ?? globalCfg.greenMin,
      yellowMin: ov?.yellowMin ?? globalCfg.yellowMin,
    });
    setDrawerOpen(true);
  };

  const saveOverride = async () => {
    const values = await form.validateFields();
    if (!currentId) return;

    if (values.yellowMin >= values.greenMin) {
      message.error('黄灯阈值必须小于绿灯阈值');
      return;
    }

    setOverrides((prev) => ({
      ...prev,
      [currentId]: {
        enabled: Boolean(values.enabled),
        greenMin: values.greenMin,
        yellowMin: values.yellowMin,
      },
    }));
    message.success('阈值已保存（Mock）');
    setDrawerOpen(false);
  };

  const columns = [
    {
      title: '指标',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <Space direction="vertical" size={2}>
          <Text strong>{name}</Text>
          <Text type="secondary">{r.department} · {r.owner}</Text>
        </Space>
      ),
    },
    {
      title: '当前达成率（Mock）',
      dataIndex: 'mockRate',
      key: 'mockRate',
      width: 180,
      align: 'right',
      render: (rate, r) => (
        <Space size={8} style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Text strong>{rate === null ? '—' : `${rate}%`}</Text>
          {toneTag(r.tone)}
        </Space>
      ),
    },
    {
      title: '阈值',
      key: 'cfg',
      width: 260,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text type="secondary">绿灯 ≥ {r.cfg.greenMin}%</Text>
          <Text type="secondary">黄灯 ≥ {r.cfg.yellowMin}%</Text>
          <Text type="secondary">红灯 ＜ {r.cfg.yellowMin}%</Text>
        </Space>
      ),
    },
    {
      title: '例外',
      dataIndex: 'overrideEnabled',
      key: 'overrideEnabled',
      width: 120,
      render: (enabled) => (enabled ? <Badge status="processing" text="已覆盖" /> : <Text type="secondary">—</Text>),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Button type="link" onClick={() => openEditor(r.id)}>
          配置
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="ims-settings-kpis">
        <div className="ims-kpi">
          <div className="ims-kpi__label">阈值例外（按指标）</div>
          <div className="ims-kpi__value">{kpis.overrideCount}</div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">按当前阈值判定红灯（Mock）</div>
          <div className="ims-kpi__value">{kpis.redCount}</div>
        </div>
        <div className="ims-kpi">
          <div className="ims-kpi__label">全局阈值</div>
          <div className="ims-kpi__value" style={{ fontSize: 14, fontWeight: 800 }}>
            绿灯 ≥ {globalCfg.greenMin}% · 黄灯 ≥ {globalCfg.yellowMin}%
          </div>
        </div>
      </div>

      <Card bordered={false} style={{ background: '#fafafa', marginBottom: 12 }}>
        <Space size={12} wrap>
          <Text strong>全局阈值</Text>
          <Space size={8}>
            <Text type="secondary">绿灯 ≥</Text>
            <InputNumber
              min={0}
              max={200}
              value={globalCfg.greenMin}
              onChange={(v) => setGlobalCfg((p) => ({ ...p, greenMin: Number(v ?? p.greenMin) }))}
            />
            <Text type="secondary">%</Text>
          </Space>
          <Space size={8}>
            <Text type="secondary">黄灯 ≥</Text>
            <InputNumber
              min={0}
              max={200}
              value={globalCfg.yellowMin}
              onChange={(v) => setGlobalCfg((p) => ({ ...p, yellowMin: Number(v ?? p.yellowMin) }))}
            />
            <Text type="secondary">%</Text>
          </Space>
          <Button
            type="primary"
            onClick={() => {
              if (globalCfg.yellowMin >= globalCfg.greenMin) {
                message.error('黄灯阈值必须小于绿灯阈值');
                return;
              }
              message.success('全局阈值已保存（Mock）');
            }}
          >
            保存
          </Button>
        </Space>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 8 }}
      />

      <Drawer
        title="配置指标阈值例外"
        open={drawerOpen}
        width={520}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={saveOverride}>
              保存
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <Text type="secondary">当前指标</Text>
            <div style={{ marginTop: 4 }}>
              <Text strong>{indicatorById.get(currentId)?.name ?? '—'}</Text>
            </div>
          </div>

          <Form form={form} layout="vertical" requiredMark="optional">
            <Form.Item name="enabled" label="启用例外" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="greenMin" label="绿灯阈值（≥）" rules={[{ required: true }]}>
              <InputNumber min={0} max={200} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="yellowMin" label="黄灯阈值（≥）" rules={[{ required: true }]}>
              <InputNumber min={0} max={200} style={{ width: '100%' }} />
            </Form.Item>
            <Text type="secondary">红灯阈值：&lt; 黄灯阈值</Text>
          </Form>
        </Space>
      </Drawer>
    </div>
  );
}
