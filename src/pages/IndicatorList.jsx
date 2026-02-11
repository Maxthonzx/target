import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  campaignList,
  dataSourceOptions,
  departmentList,
  directionOptions,
  indicatorList,
  levelOptions,
} from '../mock/data';
import './IndicatorList.css';

const IndicatorList = () => {
  const [data, setData] = useState(indicatorList);
  const [searchText, setSearchText] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(undefined);
  const [selectedLevel, setSelectedLevel] = useState(undefined);
  const [selectedDept, setSelectedDept] = useState(undefined);
  const [selectedDataSource, setSelectedDataSource] = useState(undefined);
  const [selectedDirection, setSelectedDirection] = useState(undefined);
  const [selectedStatus, setSelectedStatus] = useState(undefined);
  const [selectedOwner, setSelectedOwner] = useState(undefined);

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const indicatorById = useMemo(() => {
    const map = new Map();
    for (const item of data) map.set(item.id, item);
    return map;
  }, [data]);

  const levelCountsForCampaign = useMemo(() => {
    const counts = new Map();
    for (const item of data) {
      if (selectedCampaign && item.campaign !== selectedCampaign) continue;
      counts.set(item.level, (counts.get(item.level) || 0) + 1);
    }
    return counts;
  }, [data, selectedCampaign]);

  const linkedLevelOptions = useMemo(() => {
    if (!selectedCampaign) return levelOptions;
    return levelOptions.map((opt) => {
      const count = levelCountsForCampaign.get(opt.value) || 0;
      return {
        ...opt,
        label: `${opt.label} (${count})`,
        disabled: count === 0,
      };
    });
  }, [levelCountsForCampaign, selectedCampaign]);

  const ownerOptions = useMemo(() => {
    const owners = [...new Set(data.map(i => i.owner).filter(Boolean))];
    return owners.map(o => ({ value: o, label: o }));
  }, [data]);

  const statusFilterOptions = [
    { value: '已生效', label: '已生效' },
    { value: '待审批', label: '待审批' },
    { value: '已驳回', label: '已驳回' },
  ];

  const filteredData = useMemo(() => {
    const keyword = searchText.trim();
    return data.filter((item) => {
      if (selectedCampaign && item.campaign !== selectedCampaign) return false;
      if (selectedLevel && item.level !== selectedLevel) return false;
      if (selectedDept && item.department !== selectedDept) return false;
      if (selectedDataSource && item.dataSource !== selectedDataSource) return false;
      if (selectedDirection && item.direction !== selectedDirection) return false;
      if (selectedStatus && item.status !== selectedStatus) return false;
      if (selectedOwner && item.owner !== selectedOwner) return false;
      if (!keyword) return true;

      return (
        item.name?.includes(keyword) ||
        item.id?.includes(keyword) ||
        item.department?.includes(keyword) ||
        item.owner?.includes(keyword) ||
        item.campaign?.includes(keyword)
      );
    });
  }, [data, searchText, selectedCampaign, selectedLevel, selectedDept, selectedDataSource, selectedDirection, selectedStatus, selectedOwner]);

  const getLevelBadge = (level) => {
    const levelConfig = levelOptions.find((l) => l.value === level);
    return <Badge color={levelConfig?.color} text={level || '—'} />;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      已生效: 'success',
      待审批: 'processing',
      已驳回: 'error',
    };
    return <Badge status={statusMap[status] || 'default'} text={status || '—'} />;
  };

  const openDetailDrawer = (id) => {
    setDetailId(id);
    setDetailDrawerOpen(true);
  };

  const closeDetailDrawer = () => {
    setDetailDrawerOpen(false);
    setDetailId(null);
  };

  const openEditDrawer = (record = null) => {
    const isEditing = Boolean(record);
    setEditingId(isEditing ? record.id : null);

    if (isEditing) {
      form.setFieldsValue({
        ...record,
        parentId: record.parentId ?? null,
        tags: record.tags ?? [],
      });
    } else {
      const seed = Date.now().toString().slice(-6);
      form.resetFields();
      form.setFieldsValue({
        id: `IMS_2026${seed}`,
        status: '待审批',
        direction: 'positive',
        tags: [],
        parentId: null,
      });
    }

    setEditDrawerOpen(true);
  };

  const closeEditDrawer = () => {
    setEditDrawerOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const normalized = {
        ...values,
        parentId: values.parentId ?? null,
        tags: values.tags ?? [],
      };

      if (editingId) {
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...normalized } : item)),
        );
        message.success('指标更新成功');
      } else {
        setData((prev) => [...prev, { ...normalized, status: '待审批' }]);
        message.success('指标创建成功，已提交审批');
      }

      closeEditDrawer();
    } catch {
      // validation failed
    }
  };

  const handleDelete = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    if (detailId === id) closeDetailDrawer();
    message.success('指标已删除');
  };

  const parentIndicatorOptions = useMemo(() => {
    return data
      .filter((i) => i.id !== editingId)
      .map((i) => ({
        value: i.id,
        label: `${i.name}（${i.id}）`,
      }));
  }, [data, editingId]);

  const detailIndicator = detailId ? indicatorById.get(detailId) : null;
  const detailParentIndicator = useMemo(() => {
    if (!detailIndicator?.parentId) return null;
    return indicatorById.get(detailIndicator.parentId) || null;
  }, [detailIndicator, indicatorById]);
  const detailChildrenIndicators = useMemo(() => {
    if (!detailIndicator?.id) return [];
    return data.filter((i) => i.parentId === detailIndicator.id);
  }, [data, detailIndicator]);

  const columns = [
    {
      title: '指标ID',
      dataIndex: 'id',
      width: 170,
      render: (text) => <span className="ims-mono-id">{text}</span>,
    },
    {
      title: '指标名称',
      dataIndex: 'name',
      width: 220,
      render: (text, record) => (
        <Space size={8} wrap>
          <Button
            type="link"
            onClick={() => openDetailDrawer(record.id)}
            className="ims-name-link"
          >
            {text}
          </Button>
          {record.direction === 'negative' ? <Tag color="warning">反向</Tag> : record.direction === 'none' ? <Tag>不标</Tag> : <Tag color="blue">正向</Tag>}
        </Space>
      ),
    },
    {
      title: '所属战役',
      dataIndex: 'campaign',
      width: 140,
      render: (text) => (text ? <Tag color="geekblue">{text}</Tag> : '—'),
    },
    {
      title: '上级指标',
      dataIndex: 'parentId',
      width: 200,
      render: (parentId) => {
        if (!parentId) return '—';
        const parent = indicatorById.get(parentId);
        return parent ? parent.name : <span className="ims-muted">未知（{parentId}）</span>;
      },
    },
    {
      title: '层级',
      dataIndex: 'level',
      width: 120,
      render: (level) => getLevelBadge(level),
    },
    {
      title: '部门/责任人',
      width: 170,
      render: (_, record) => (
        <span>
          {record.department} <span className="ims-divider">·</span> {record.owner}
        </span>
      ),
    },
    {
      title: '数据来源',
      dataIndex: 'dataSource',
      width: 120,
      render: (dataSource) => <Tag>{dataSource || '—'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (status) => getStatusBadge(status),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags) => (
        <Space size={[0, 4]} wrap>
          {tags?.length ? tags.map((tag) => <Tag key={tag} className="ims-tag-sm">#{tag}</Tag>) : '—'}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => openEditDrawer(record)} className="ims-action-link">
            编辑
          </Button>
          <Popconfirm title="确定删除该指标吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger className="ims-action-link">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="ims-indicator-page">
      <div className="ims-indicator-header">
        <div>
          <div className="ims-indicator-header__title">指标字典</div>
          <div className="ims-indicator-header__sub">管理全量指标定义、层级关系与数据源</div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openEditDrawer()}
        >
          新增指标
        </Button>
      </div>

      <Card
        bordered={false}
        className="ims-indicator-toolbar"
        bodyStyle={{ padding: '14px 20px' }}
      >
        <Space wrap size={12}>
          <Input
            placeholder="搜索指标名称 / ID / 部门 / 责任人"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 280 }}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="所属战役"
            style={{ width: 140 }}
            allowClear
            value={selectedCampaign}
            onChange={(v) => {
              setSelectedCampaign(v);
              setSelectedLevel(undefined);
            }}
            options={campaignList}
          />
          <Select
            placeholder="指标层级"
            style={{ width: 120 }}
            allowClear
            value={selectedLevel}
            onChange={(v) => setSelectedLevel(v)}
            options={linkedLevelOptions}
          />
          <Select
            placeholder="所属部门"
            style={{ width: 120 }}
            allowClear
            value={selectedDept}
            onChange={(v) => setSelectedDept(v)}
            options={departmentList}
          />
          <Select
            placeholder="数据来源"
            style={{ width: 140 }}
            allowClear
            value={selectedDataSource}
            onChange={(v) => setSelectedDataSource(v)}
            options={dataSourceOptions}
          />
          <Select
            placeholder="指标方向"
            style={{ width: 130 }}
            allowClear
            value={selectedDirection}
            onChange={(v) => setSelectedDirection(v)}
            options={directionOptions}
          />
          <Select
            placeholder="状态"
            style={{ width: 110 }}
            allowClear
            value={selectedStatus}
            onChange={(v) => setSelectedStatus(v)}
            options={statusFilterOptions}
          />
          <Select
            placeholder="责任人"
            style={{ width: 120 }}
            allowClear
            value={selectedOwner}
            onChange={(v) => setSelectedOwner(v)}
            options={ownerOptions}
          />
        </Space>
      </Card>

      <Card bordered={false} className="ims-indicator-table">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Drawer
        title="指标详情"
        width={720}
        onClose={closeDetailDrawer}
        open={detailDrawerOpen}
        extra={
          <Space>
            {detailIndicator ? (
              <Button
                type="primary"
                onClick={() => {
                  const record = indicatorById.get(detailIndicator.id);
                  closeDetailDrawer();
                  if (record) openEditDrawer(record);
                }}
              >
                编辑
              </Button>
            ) : null}
          </Space>
        }
      >
        {!detailIndicator ? (
          <div style={{ color: '#999' }}>未找到该指标（可能已被删除）。</div>
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" title="基本信息" bordered={false} className="ims-detail-section">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="指标ID">
                  <span className="ims-mono-id">{detailIndicator.id}</span>
                </Descriptions.Item>
                <Descriptions.Item label="名称">{detailIndicator.name}</Descriptions.Item>
                <Descriptions.Item label="部门">{detailIndicator.department}</Descriptions.Item>
                <Descriptions.Item label="责任人">{detailIndicator.owner}</Descriptions.Item>
                <Descriptions.Item label="层级">{getLevelBadge(detailIndicator.level)}</Descriptions.Item>
                <Descriptions.Item label="所属战役">
                  {detailIndicator.campaign ? (
                    <Tag color="geekblue">{detailIndicator.campaign}</Tag>
                  ) : (
                    '—'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="状态">{getStatusBadge(detailIndicator.status)}</Descriptions.Item>
                <Descriptions.Item label="指标方向">
                  {detailIndicator.direction === 'negative' ? <Tag color="warning">反向</Tag> : detailIndicator.direction === 'none' ? <Tag>不标</Tag> : <Tag color="blue">正向</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card size="small" title="定义信息" bordered={false} className="ims-detail-section">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="计算公式">{detailIndicator.formula || '—'}</Descriptions.Item>
                <Descriptions.Item label="统计口径">{detailIndicator.caliber || '—'}</Descriptions.Item>
                <Descriptions.Item label="数据来源">
                  <Tag>{detailIndicator.dataSource || '—'}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card size="small" title="关联信息" bordered={false} className="ims-detail-section">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="上级指标">
                  {detailIndicator.parentId ? (
                    detailParentIndicator ? (
                      <Button
                        type="link"
                        onClick={() => openDetailDrawer(detailParentIndicator.id)}
                        className="ims-action-link"
                      >
                        {detailParentIndicator.name}
                      </Button>
                    ) : (
                      <span className="ims-muted">未知（{detailIndicator.parentId}）</span>
                    )
                  ) : (
                    '—'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="下级指标">
                  {detailChildrenIndicators.length ? (
                    <Space size={[8, 8]} wrap>
                      {detailChildrenIndicators.map((child) => (
                        <Tag key={child.id}>
                          <Button
                            type="link"
                            onClick={() => openDetailDrawer(child.id)}
                            className="ims-action-link"
                          >
                            {child.name}
                          </Button>
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    '—'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        )}
      </Drawer>

      <Drawer
        title={editingId ? '编辑指标' : '新增指标'}
        width={600}
        onClose={closeEditDrawer}
        open={editDrawerOpen}
        extra={
          <Space>
            <Button onClick={closeEditDrawer}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="id" label="指标ID" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" hidden>
            <Input />
          </Form.Item>

          <div className="ims-form-grid">
            <Form.Item
              name="name"
              label="指标名称"
              rules={[{ required: true, message: '请输入指标名称' }]}
            >
              <Input placeholder="如：月度营收" />
            </Form.Item>
            <Form.Item name="department" label="所属部门" rules={[{ required: true, message: '请选择部门' }]}>
              <Select options={departmentList} placeholder="选择部门" />
            </Form.Item>
          </div>

          <div className="ims-form-grid">
            <Form.Item name="owner" label="责任人" rules={[{ required: true, message: '请输入责任人' }]}>
              <Input placeholder="输入姓名" />
            </Form.Item>
            <Form.Item name="level" label="指标层级" rules={[{ required: true, message: '请选择指标层级' }]}>
              <Select options={levelOptions} placeholder="选择层级" />
            </Form.Item>
          </div>

          <div className="ims-form-grid">
            <Form.Item name="campaign" label="所属战役" rules={[{ required: true, message: '请选择所属战役' }]}>
              <Select options={campaignList} placeholder="选择战役" />
            </Form.Item>
            <Form.Item name="parentId" label="上级指标">
              <Select allowClear options={parentIndicatorOptions} placeholder="可选：选择上级指标" />
            </Form.Item>
          </div>

          <Form.Item
            name="formula"
            label="计算公式"
            rules={[{ required: true, message: '请输入计算公式' }]}
            tooltip="用于自动计算达成率"
          >
            <Input.TextArea rows={2} placeholder="例如：当月实际收入总额" />
          </Form.Item>

          <Form.Item
            name="caliber"
            label="统计口径"
            rules={[{ required: true, message: '请输入统计口径' }]}
          >
            <Input.TextArea rows={2} placeholder="例如：含税收入，不含退款" />
          </Form.Item>

          <div className="ims-form-grid">
            <Form.Item
              name="dataSource"
              label="数据来源"
              rules={[{ required: true, message: '请选择数据来源' }]}
            >
              <Select options={dataSourceOptions} placeholder="选择数据来源" />
            </Form.Item>
            <Form.Item
              name="direction"
              label="指标方向"
              rules={[{ required: true, message: '请选择指标方向' }]}
            >
              <Select options={directionOptions} />
            </Form.Item>
          </div>

          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入标签后回车"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default IndicatorList;
