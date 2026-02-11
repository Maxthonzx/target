import React, { useState } from 'react';
import {
    Table, Card, Button, Tag, Space, Modal, Timeline, Descriptions,
    Steps, Input, Select, Upload, message
} from 'antd';
import {
    PlusOutlined, FileTextOutlined, CheckCircleOutlined,
    ClockCircleOutlined, UploadOutlined
} from '@ant-design/icons';
import { changeRequestList, indicatorList } from '../mock/data';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const ChangeManagement = () => {
    const [data, setData] = useState(changeRequestList);
    const [modalVisible, setModalVisible] = useState(false); // 详情/审批弹窗
    const [createVisible, setCreateVisible] = useState(false); // 发起申请弹窗
    const [currentStep, setCurrentStep] = useState(0);
    const [currentRecord, setCurrentRecord] = useState(null);

    // 查看详情
    const handleView = (record) => {
        setCurrentRecord(record);
        setModalVisible(true);
    };

    // 提交新申请（Mock）
    const handleCreate = () => {
        message.success('申请提交成功，请等待财务总监审批');
        setCreateVisible(false);
        setCurrentStep(0);
    };

    const columns = [
        {
            title: '申请单号',
            dataIndex: 'id',
            width: 160,
        },
        {
            title: '变更指标',
            dataIndex: 'indicatorName',
            render: (text, r) => <a>{text}</a>
        },
        {
            title: '变更内容',
            render: (_, r) => (
                <span>目标值: {r.oldValue} <span style={{ color: '#999' }}>-&gt;</span> <b style={{ color: '#1890ff' }}>{r.newValue}</b></span>
            )
        },
        {
            title: '申请人',
            dataIndex: 'requester',
            width: 100,
        },
        {
            title: '申请时间',
            dataIndex: 'requestTime',
            width: 160,
        },
        {
            title: '当前状态',
            dataIndex: 'approvalStatus',
            width: 120,
            render: status => {
                const color = status === '已通过' ? 'success' : (status === '已驳回' ? 'error' : 'processing');
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: '操作',
            render: (_, r) => <Button type="link" size="small" onClick={() => handleView(r)}>详情</Button>
        }
    ];

    return (
        <div>
            <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: 16, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>发起变更申请</Button>
                </div>
            </Card>

            <Card bordered={false} style={{ borderRadius: 8 }}>
                <Table rowKey="id" dataSource={data} columns={columns} />
            </Card>

            {/* 详情弹窗 */}
            <Modal
                title="变更申请详情"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>关闭</Button>,
                    currentRecord?.approvalStatus === '审批中' && <Button key="pass" type="primary">通过审批</Button>
                ]}
                width={700}
            >
                {currentRecord && (
                    <>
                        <Descriptions title="基本信息" bordered column={2} size="small">
                            <Descriptions.Item label="申请单号">{currentRecord.id}</Descriptions.Item>
                            <Descriptions.Item label="申请时间">{currentRecord.requestTime}</Descriptions.Item>
                            <Descriptions.Item label="申请人">{currentRecord.requester}</Descriptions.Item>
                            <Descriptions.Item label="变更指标">{currentRecord.indicatorName}</Descriptions.Item>
                            <Descriptions.Item label="变更前">{currentRecord.oldValue}</Descriptions.Item>
                            <Descriptions.Item label="变更后" labelStyle={{ color: '#1890ff' }}>{currentRecord.newValue}</Descriptions.Item>
                            <Descriptions.Item label="佐证材料" span={2}>
                                <a href="#"><FileTextOutlined /> 市场调研报告_v3.pdf</a>
                            </Descriptions.Item>
                            <Descriptions.Item label="变更原因" span={2}>{currentRecord.reason}</Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h4 style={{ marginBottom: 16 }}>审批流程</h4>
                            <Timeline>
                                <Timeline.Item color="green">发起申请 ({currentRecord.requester}) <span style={{ color: '#999', fontSize: 12 }}>{currentRecord.requestTime}</span></Timeline.Item>
                                <Timeline.Item color="blue" dot={<ClockCircleOutlined />}>
                                    {currentRecord.approver1} 审批中
                                </Timeline.Item>
                                <Timeline.Item color="gray">总裁办 待审批</Timeline.Item>
                                <Timeline.Item color="gray">系统生效</Timeline.Item>
                            </Timeline>
                        </div>
                    </>
                )}
            </Modal>

            {/* 发起申请弹窗 */}
            <Modal
                title="发起指标变更申请"
                open={createVisible}
                onCancel={() => setCreateVisible(false)}
                width={600}
                footer={null}
            >
                <Steps current={currentStep} style={{ marginBottom: 24 }}>
                    <Step title="选择指标" />
                    <Step title="填写内容" />
                    <Step title="上传附件" />
                </Steps>

                {currentStep === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Select
                            showSearch
                            placeholder="请选择需要变更的指标"
                            style={{ width: '80%' }}
                            options={indicatorList.map(i => ({ label: i.name, value: i.id }))}
                        />
                        <div style={{ marginTop: 32 }}>
                            <Button type="primary" onClick={() => setCurrentStep(1)}>下一步</Button>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div style={{ padding: '0 20px' }}>
                        <div style={{ marginBottom: 16 }}>
                            <label>变更类型：</label>
                            <Select defaultValue="target" style={{ width: 200 }}>
                                <Option value="target">目标值变更</Option>
                                <Option value="formula">口径/公式变更</Option>
                            </Select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>新目标值：</label>
                            <Input style={{ width: 200 }} suffix="万元" />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>变更原因：</label>
                            <TextArea rows={4} placeholder="请详细说明变更原因..." />
                        </div>
                        <div style={{ marginTop: 32, textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setCurrentStep(0)}>上一步</Button>
                                <Button type="primary" onClick={() => setCurrentStep(2)}>下一步</Button>
                            </Space>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div style={{ padding: '0 20px', textAlign: 'center' }}>
                        <Upload.Dragger style={{ padding: 32 }}>
                            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                            <p className="ant-upload-hint">支持 PDF, Word, Excel 格式，用于佐证变更合理性</p>
                        </Upload.Dragger>
                        <div style={{ marginTop: 32, textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setCurrentStep(1)}>上一步</Button>
                                <Button type="primary" onClick={handleCreate}>提交申请</Button>
                            </Space>
                        </div>
                    </div>
                )}

            </Modal>
        </div>
    );
};

export default ChangeManagement;
