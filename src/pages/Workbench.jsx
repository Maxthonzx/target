import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { targetActualData, months } from '../mock/data';
import './Workbench.css';

const { Text } = Typography;

const CURRENT_USER = { name: '小王' };

function calcRate(record, monthIndex) {
  if (!record || monthIndex === null || monthIndex === undefined) return null;
  if (monthIndex < 0 || monthIndex > 11) return null;
  const target = record.monthlyTarget?.[monthIndex];
  const actual = record.monthlyActual?.[monthIndex];
  if (target === null || target === undefined) return null;
  if (actual === null || actual === undefined) return null;
  if (!Number.isFinite(Number(target)) || !Number.isFinite(Number(actual))) return null;
  if (Number(actual) === 0 && record.direction === 'negative') return null;

  const ratio = record.direction === 'negative' ? Number(target) / Number(actual) : Number(actual) / Number(target);
  return Number((ratio * 100).toFixed(1));
}

function renderStatus(rate) {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return <Tag>未填报</Tag>;
  if (rate >= 100) return <Tag color="green">达标</Tag>;
  if (rate >= 98) return <Tag color="gold">接近</Tag>;
  return <Tag color="red">未达标</Tag>;
}

export default function Workbench() {
  const [data, setData] = useState(targetActualData);
  const [monthIndex, setMonthIndex] = useState(() => new Date().getMonth());

  const rows = useMemo(
    () => data.filter((r) => r.owner === CURRENT_USER.name),
    [data],
  );

  const handleActualChange = (id, value) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = [...(item.monthlyActual || [])];
        next[monthIndex] = value;
        return { ...item, monthlyActual: next };
      }),
    );
  };

  const handleSubmit = (record) => {
    message.success(`已提交 ${record.name} 的${months[monthIndex]}填报（Mock）`);
  };

  const columns = [
    {
      title: '指标名称',
      dataIndex: 'name',
      width: 180,
      render: (text, record) => (
        <div className="wb-name">
          <span>{text}</span>
          <Text type="secondary">{record.unit}</Text>
        </div>
      ),
    },
    { title: '部门', dataIndex: 'department', width: 120 },
    {
      title: `目标值（${months[monthIndex]}）`,
      dataIndex: 'monthlyTarget',
      width: 150,
      align: 'right',
      render: (targets, record) => (
        <Text strong>{targets?.[monthIndex] ?? '—'} {record.unit}</Text>
      ),
    },
    {
      title: `本月实际（${months[monthIndex]}）`,
      dataIndex: 'monthlyActual',
      width: 180,
      render: (actuals, record) => (
        <InputNumber
          value={actuals?.[monthIndex] ?? null}
          onChange={(v) => handleActualChange(record.id, v)}
          style={{ width: '100%' }}
          precision={record.unit === '%' ? 4 : 2}
          placeholder="填写实际"
        />
      ),
    },
    {
      title: '达成率',
      key: 'rate',
      width: 110,
      render: (_, record) => {
        const rate = calcRate(record, monthIndex);
        return rate === null ? '—' : `${rate}%`;
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 110,
      render: (_, record) => renderStatus(calcRate(record, monthIndex)),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          disabled={record.monthlyActual?.[monthIndex] === null || record.monthlyActual?.[monthIndex] === undefined}
          onClick={() => handleSubmit(record)}
        >
          提交
        </Button>
      ),
    },
  ];

  return (
    <div className="ims-workbench">
      <div className="wb-header">
        <div>
          <div className="wb-title">工作台</div>
          <div className="wb-sub">仅展示当前操作者负责的指标，并进行当月达成填报</div>
        </div>
        <Space size={12} wrap>
          <Tag color="blue">当前用户：{CURRENT_USER.name}</Tag>
          <Select
            value={monthIndex}
            onChange={setMonthIndex}
            options={months.map((m, i) => ({ value: i, label: m }))}
            style={{ width: 120 }}
          />
        </Space>
      </div>

      <Card variant="borderless">
        {rows.length ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={false}
            tableLayout="fixed"
            scroll={{ x: 940 }}
          />
        ) : (
          <Empty description="当前用户暂无负责的指标" />
        )}
      </Card>
    </div>
  );
}
