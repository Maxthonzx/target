import React, { useState, useMemo } from 'react';
import {
    Table, Card, Button, Input, Tag, Space, Modal, Form, Tabs,
    Select, Radio, message, InputNumber, Row, Col, Alert, DatePicker,
    Descriptions, Divider, Typography, Tooltip
} from 'antd';
import {
    EditOutlined, LockOutlined, UnlockOutlined, EyeOutlined,
    SearchOutlined, FilterOutlined, PlusOutlined, HistoryOutlined
} from '@ant-design/icons';
import {
    targetActualData, indicatorList, months, campaignList,
    levelOptions, departmentList, targetTypeOptions,
    targetUnitOptions, targetOperatorOptions, directionOptions
} from '../mock/data';
import dayjs from 'dayjs';

const { Text } = Typography;

const TargetManagement = () => {
    const [data, setData] = useState(targetActualData);
    const [activeTab, setActiveTab] = useState('target');

    // ── 筛选状态 ──
    const [searchText, setSearchText] = useState('');
    const [filterCampaign, setFilterCampaign] = useState(undefined);
    const [filterLevel, setFilterLevel] = useState(undefined);
    const [filterDept, setFilterDept] = useState(undefined);
    const [filterOwner, setFilterOwner] = useState(undefined);
    const [filterLock, setFilterLock] = useState(undefined);
    const [filterDirection, setFilterDirection] = useState(undefined);

    // ── 弹窗状态 ──
    const [targetModalVisible, setTargetModalVisible] = useState(false);
    const [progressModalVisible, setProgressModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [targetType, setTargetType] = useState('monthly');
    const [form] = Form.useForm();
    const [progressForm] = Form.useForm();

    // ── Owner 下拉 ──
    const ownerOptions = useMemo(() => {
        const owners = [...new Set(data.map(i => i.owner).filter(Boolean))];
        return owners.map(o => ({ value: o, label: o }));
    }, [data]);

    // ── 筛选数据 ──
    const filteredData = useMemo(() => {
        const keyword = searchText.trim();
        return data.filter(item => {
            if (filterCampaign && item.campaign !== filterCampaign) return false;
            if (filterLevel && item.level !== filterLevel) return false;
            if (filterDept && item.department !== filterDept) return false;
            if (filterOwner && item.owner !== filterOwner) return false;
            if (filterDirection && item.direction !== filterDirection) return false;
            if (filterLock !== undefined) {
                if (filterLock === 'locked' && !item.lockStatus) return false;
                if (filterLock === 'open' && item.lockStatus) return false;
            }
            if (!keyword) return true;
            return (
                item.name?.includes(keyword) ||
                item.id?.includes(keyword) ||
                item.department?.includes(keyword) ||
                item.owner?.includes(keyword)
            );
        });
    }, [data, searchText, filterCampaign, filterLevel, filterDept, filterOwner, filterLock, filterDirection]);

    // ── 目标录入弹窗 ──
    const handleEditTarget = (record) => {
        setCurrentRecord(record);
        setTargetType('monthly');
        form.setFieldsValue({
            totalTarget: record.totalTarget,
            monthlyTarget: record.monthlyTarget,
            year: dayjs(),
            unit: record.unit || '万',
            operator: record.operator || '>=',
            targetValueType: record.unit === '%' ? 'percent' : 'number',
            startMonth: 0,
        });
        setTargetModalVisible(true);
    };

    const handleSubmitTarget = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const newData = data.map(item => {
                if (item.id === currentRecord.id) {
                    return {
                        ...item,
                        totalTarget: values.totalTarget,
                        monthlyTarget: values.monthlyTarget,
                        unit: values.unit,
                        operator: values.operator,
                        lockStatus: true,
                    };
                }
                return item;
            });
            setTimeout(() => {
                setData(newData);
                setLoading(false);
                setTargetModalVisible(false);
                message.success('目标录入成功，已提交审批');
            }, 600);
        } catch (error) {
            setLoading(false);
        }
    };

    // ── 进度录入弹窗 ──
    const handleEditProgress = (record) => {
        setCurrentRecord(record);
        const currentMonth = dayjs().month(); // 0-based
        progressForm.setFieldsValue({
            actualMonth: currentMonth,
            actualValue: null,
        });
        setProgressModalVisible(true);
    };

    const handleSubmitProgress = async () => {
        try {
            setLoading(true);
            const values = await progressForm.validateFields();
            const newData = data.map(item => {
                if (item.id === currentRecord.id) {
                    const newActual = [...(item.monthlyActual || [])];
                    newActual[values.actualMonth] = values.actualValue;
                    return { ...item, monthlyActual: newActual };
                }
                return item;
            });
            setTimeout(() => {
                setData(newData);
                setLoading(false);
                setProgressModalVisible(false);
                message.success('进度已更新');
            }, 400);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleUnlock = (record) => {
        if (record.lockStatus) {
            message.info('该指标已锁定，请前往[变更管理]发起申请');
        }
    };

    // ── 筛选区 ──
    const FilterBar = () => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <Input.Search
                placeholder="搜索指标名称/编号"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
            />
            <Select placeholder="所属战役" style={{ width: 130 }} allowClear value={filterCampaign} onChange={v => setFilterCampaign(v)} options={campaignList} />
            <Select placeholder="指标层级" style={{ width: 110 }} allowClear value={filterLevel} onChange={v => setFilterLevel(v)} options={levelOptions} />
            <Select placeholder="所属部门" style={{ width: 110 }} allowClear value={filterDept} onChange={v => setFilterDept(v)} options={departmentList} />
            <Select placeholder="责任人" style={{ width: 100 }} allowClear value={filterOwner} onChange={v => setFilterOwner(v)} options={ownerOptions} />
            <Select placeholder="方向" style={{ width: 110 }} allowClear value={filterDirection} onChange={v => setFilterDirection(v)} options={directionOptions} />
            <Select
                placeholder="锁定状态"
                style={{ width: 120 }}
                allowClear
                value={filterLock}
                onChange={v => setFilterLock(v)}
                options={[
                    { value: 'locked', label: '已锁定' },
                    { value: 'open', label: '填报中' },
                ]}
            />
        </div>
    );

    // ── 目标录入 Tab 列 ──
    const targetColumns = [
        {
            title: '指标名称',
            dataIndex: 'name',
            width: 180,
            render: (text, record) => (
                <span>
                    {text}
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                        {record.operator === '<=' ? '≤' : record.operator === '>=' ? '≥' : '='}{' '}
                        {record.unit}
                    </Text>
                </span>
            ),
        },
        { title: '部门', dataIndex: 'department', width: 90 },
        { title: '责任人', dataIndex: 'owner', width: 80 },
        { title: '层级', dataIndex: 'level', width: 80 },
        {
            title: '年度目标',
            dataIndex: 'totalTarget',
            width: 120,
            render: (val, record) => (
                <b>
                    {val?.toLocaleString()}
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 2 }}>{record.unit}</Text>
                </b>
            ),
        },
        {
            title: '状态',
            key: 'lockStatus',
            width: 90,
            render: (_, record) =>
                record.lockStatus ? (
                    <Tag icon={<LockOutlined />} color="default">已锁定</Tag>
                ) : (
                    <Tag icon={<UnlockOutlined />} color="processing">填报中</Tag>
                ),
        },
        {
            title: '月度拆解',
            key: 'monthly',
            width: 280,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 2, fontSize: 11 }}>
                    {record.monthlyTarget?.map((v, i) => (
                        <Tooltip key={i} title={`${months[i]}: ${v ?? '-'}`}>
                            <span
                                style={{
                                    width: 20,
                                    height: 20,
                                    lineHeight: '20px',
                                    textAlign: 'center',
                                    borderRadius: 3,
                                    background: v != null ? '#e6f7ff' : '#f5f5f5',
                                    color: v != null ? '#1677ff' : '#ccc',
                                }}
                            >
                                {v != null ? '✓' : '-'}
                            </span>
                        </Tooltip>
                    ))}
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space>
                    {record.lockStatus ? (
                        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleUnlock(record)}>
                            查看
                        </Button>
                    ) : (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditTarget(record)}>
                            录入
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    // ── 进度录入 Tab 列 ──
    const progressColumns = [
        { title: '指标名称', dataIndex: 'name', width: 160 },
        { title: '部门', dataIndex: 'department', width: 90 },
        { title: '责任人', dataIndex: 'owner', width: 80 },
        {
            title: '年度目标',
            dataIndex: 'totalTarget',
            width: 100,
            render: (val, record) => (
                <span>{val?.toLocaleString()} <Text type="secondary" style={{ fontSize: 11 }}>{record.unit}</Text></span>
            ),
        },
        {
            title: '当前达成率',
            dataIndex: 'latestRate',
            width: 100,
            render: (val) => (
                <span style={{ color: val >= 100 ? '#52c41a' : val < 80 ? '#ff4d4f' : '#faad14', fontWeight: 600 }}>
                    {val}%
                </span>
            ),
        },
        {
            title: '月度进度（目标 / 实际）',
            key: 'monthlyProgress',
            width: 400,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 3, fontSize: 11 }}>
                    {months.map((m, i) => {
                        const t = record.monthlyTarget?.[i];
                        const a = record.monthlyActual?.[i];
                        const hasTarget = t != null;
                        const hasActual = a != null;
                        let bg = '#f5f5f5';
                        let color = '#ccc';
                        if (hasTarget && hasActual) {
                            const pct = record.direction === 'negative' ? (a === 0 ? 100 : t / a * 100) : (t === 0 ? 100 : a / t * 100);
                            bg = pct >= 100 ? '#f6ffed' : pct >= 80 ? '#fffbe6' : '#fff2f0';
                            color = pct >= 100 ? '#52c41a' : pct >= 80 ? '#faad14' : '#ff4d4f';
                        } else if (hasTarget) {
                            bg = '#e6f7ff';
                            color = '#999';
                        }
                        return (
                            <Tooltip key={i} title={`${m}: 目标 ${t ?? '-'} / 实际 ${a ?? '待填'}`}>
                                <span
                                    style={{
                                        width: 28,
                                        height: 20,
                                        lineHeight: '20px',
                                        textAlign: 'center',
                                        borderRadius: 3,
                                        background: bg,
                                        color,
                                        fontWeight: hasActual ? 600 : 400,
                                    }}
                                >
                                    {hasActual ? a : hasTarget ? '-' : '·'}
                                </span>
                            </Tooltip>
                        );
                    })}
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 90,
            render: (_, record) => (
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditProgress(record)}>
                    填报
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: '16px 24px' } }}>
                <Alert
                    message="目标填报窗口期：2025年12月25日 - 2026年1月15日"
                    type="info"
                    showIcon
                    action={<Button size="small" type="primary">补录申请</Button>}
                />
            </Card>

            <Card bordered={false} style={{ borderRadius: 8 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'target',
                            label: '目标定义与录入',
                            children: (
                                <>
                                    <FilterBar />
                                    <Table
                                        rowKey="id"
                                        dataSource={filteredData}
                                        columns={targetColumns}
                                        size="middle"
                                        scroll={{ x: 1000 }}
                                        pagination={{ pageSize: 15, showTotal: total => `共 ${total} 条` }}
                                    />
                                </>
                            ),
                        },
                        {
                            key: 'progress',
                            label: '进度填报',
                            children: (
                                <>
                                    <FilterBar />
                                    <Table
                                        rowKey="id"
                                        dataSource={filteredData}
                                        columns={progressColumns}
                                        size="middle"
                                        scroll={{ x: 1100 }}
                                        pagination={{ pageSize: 15, showTotal: total => `共 ${total} 条` }}
                                    />
                                </>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* ── 目标录入弹窗 ── */}
            <Modal
                title={`目标录入 - ${currentRecord?.name || ''}`}
                open={targetModalVisible}
                onCancel={() => setTargetModalVisible(false)}
                onOk={handleSubmitTarget}
                confirmLoading={loading}
                width={760}
                okText="提交审批"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item label="目标年份" name="year">
                                <DatePicker picker="year" style={{ width: '100%' }} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="目标类型" name="targetValueType" rules={[{ required: true }]}>
                                <Select options={targetTypeOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="比较方式" name="operator" rules={[{ required: true }]}>
                                <Select options={targetOperatorOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="单位" name="unit" rules={[{ required: true }]}>
                                <Select options={targetUnitOptions} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="年度总目标"
                                name="totalTarget"
                                rules={[{ required: true, message: '请输入年度目标' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={form.getFieldValue('targetValueType') === 'percent' ? 4 : 2}
                                    placeholder={form.getFieldValue('targetValueType') === 'percent' ? '如 95.0000' : '如 1000'}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="起始月份（新增指标回填）" name="startMonth">
                                <Select
                                    options={months.map((m, i) => ({ value: i, label: m }))}
                                    placeholder="默认为1月"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="目标拆解周期">
                        <Radio.Group value={targetType} onChange={e => setTargetType(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="yearly">不拆解</Radio.Button>
                            <Radio.Button value="quarterly">季度拆解</Radio.Button>
                            <Radio.Button value="monthly">月度拆解</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                        {targetType === 'monthly' && (
                            <Row gutter={[16, 0]}>
                                {months.map((m, i) => {
                                    const startMonth = form.getFieldValue('startMonth') ?? 0;
                                    const isBeforeStart = i < startMonth;
                                    return (
                                        <Col span={6} key={m}>
                                            <Form.Item
                                                label={m}
                                                name={['monthlyTarget', i]}
                                                rules={isBeforeStart ? [] : [{ required: true, message: '必填' }]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    placeholder={isBeforeStart ? 'N/A' : '0'}
                                                    disabled={isBeforeStart}
                                                    precision={form.getFieldValue('targetValueType') === 'percent' ? 4 : 2}
                                                />
                                            </Form.Item>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                        {targetType === 'quarterly' && (
                            <Row gutter={16}>
                                {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                                    <Col span={6} key={q}>
                                        <Form.Item label={q} name={['monthlyTarget', q]}>
                                            <InputNumber style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                ))}
                            </Row>
                        )}
                        {targetType === 'yearly' && (
                            <p style={{ color: '#999', textAlign: 'center' }}>
                                总目标将作为全年考核标准，不进行阶段性拆解。
                            </p>
                        )}
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Text type="secondary">定义格式：实际值 {form.getFieldValue('operator') === '<=' ? '≤' : form.getFieldValue('operator') === '>=' ? '≥' : '='} 目标值（{form.getFieldValue('unit') || '万'}）</Text>
                    </div>
                </Form>
            </Modal>

            {/* ── 进度填报弹窗 ── */}
            <Modal
                title={`进度填报 - ${currentRecord?.name || ''}`}
                open={progressModalVisible}
                onCancel={() => setProgressModalVisible(false)}
                onOk={handleSubmitProgress}
                confirmLoading={loading}
                width={640}
                okText="提交"
            >
                {currentRecord && (
                    <>
                        <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="年度目标">
                                {currentRecord.totalTarget?.toLocaleString()} {currentRecord.unit}
                            </Descriptions.Item>
                            <Descriptions.Item label="当前达成率">
                                <span style={{ color: currentRecord.latestRate >= 100 ? '#52c41a' : '#faad14', fontWeight: 600 }}>
                                    {currentRecord.latestRate}%
                                </span>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ background: '#fafafa', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
                            <Text type="secondary">历月目标 / 实际：</Text>
                            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                {months.map((m, i) => (
                                    <div key={i} style={{ textAlign: 'center', minWidth: 54 }}>
                                        <div style={{ color: '#999' }}>{m}</div>
                                        <div>{currentRecord.monthlyTarget?.[i] ?? '-'}</div>
                                        <div style={{ color: currentRecord.monthlyActual?.[i] != null ? '#1677ff' : '#ddd', fontWeight: 500 }}>
                                            {currentRecord.monthlyActual?.[i] ?? '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Form form={progressForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="填报月份"
                                name="actualMonth"
                                rules={[{ required: true, message: '请选择月份' }]}
                            >
                                <Select options={months.map((m, i) => ({ value: i, label: m }))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={`实际值（${currentRecord?.unit || ''}）`}
                                name="actualValue"
                                rules={[{ required: true, message: '请输入实际值' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={currentRecord?.unit === '%' ? 4 : 2}
                                    placeholder="请输入本月实际数据"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default TargetManagement;
