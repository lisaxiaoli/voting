import React, { useState } from 'react'
import {
    Table,
    Button,
    Input,
    Select,
    Space,
    Tag,
    Modal,
    Form,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Upload,
    DatePicker
} from 'antd'
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    SafetyCertificateOutlined,
    UploadOutlined,
    ClockCircleOutlined
} from '@ant-design/icons'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input

interface SBTRecord {
    key: string
    sbtId: string
    sbtType: string
    holder: string
    holderDID: string
    issuer: string
    status: 'pending' | 'issued' | 'revoked'
    createTime: string
    issueTime?: string
    expireTime?: string
}

const SBTManagement: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalType, setModalType] = useState<'view' | 'issue' | 'revoke'>('view')
    const [selectedRecord, setSelectedRecord] = useState<SBTRecord | null>(null)
    const [form] = Form.useForm()

    // 模拟数据
    const mockData: SBTRecord[] = [
        {
            key: '1',
            sbtId: 'sbt:hebeu:001',
            sbtType: '学位证书',
            holder: '张三',
            holderDID: 'did:hebeu:7aa029b5-4eb2-4231-9651-1c8ebe39edc0',
            issuer: '计算机学院',
            status: 'pending',
            createTime: '2024-01-15 14:30:00'
        },
        {
            key: '2',
            sbtId: 'sbt:hebeu:002',
            sbtType: '奖学金证明',
            holder: '李四',
            holderDID: 'did:hebeu:2c199009-0f4e-4fa3-9188-11e4a9617cd4',
            issuer: '数学学院',
            status: 'issued',
            createTime: '2024-01-14 09:20:00',
            issueTime: '2024-01-14 16:45:00',
            expireTime: '2025-01-14 16:45:00'
        },
        {
            key: '3',
            sbtId: 'sbt:hebeu:003',
            sbtType: '实习证明',
            holder: '王五',
            holderDID: 'did:hebeu:3d310010-1g5f-5gb4-0299-22f5b9728ed5',
            issuer: '物理学院',
            status: 'revoked',
            createTime: '2024-01-13 11:15:00',
            issueTime: '2024-01-13 15:30:00'
        }
    ]

    const columns = [
        {
            title: 'SBT ID',
            dataIndex: 'sbtId',
            key: 'sbtId',
            width: 150,
            render: (text: string) => (
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{text}</span>
            )
        },
        {
            title: 'SBT类型',
            dataIndex: 'sbtType',
            key: 'sbtType',
            width: 120,
            render: (type: string) => (
                <Tag color="blue">{type}</Tag>
            )
        },
        {
            title: '持有者',
            dataIndex: 'holder',
            key: 'holder',
            width: 100
        },
        {
            title: '持有者DID',
            dataIndex: 'holderDID',
            key: 'holderDID',
            width: 300,
            ellipsis: true,
            render: (text: string) => (
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{text}</span>
            )
        },
        {
            title: '颁发机构',
            dataIndex: 'issuer',
            key: 'issuer',
            width: 120
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => {
                const statusConfig = {
                    pending: { color: 'warning', text: '待颁发' },
                    issued: { color: 'success', text: '已颁发' },
                    revoked: { color: 'error', text: '已撤销' }
                }
                const config = statusConfig[status as keyof typeof statusConfig]
                return <Tag color={config.color}>{config.text}</Tag>
            }
        },
        {
            title: '申请时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 150
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (record: SBTRecord) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        查看
                    </Button>
                    {record.status === 'pending' && (
                        <Button
                            type="link"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleIssue(record)}
                        >
                            颁发
                        </Button>
                    )}
                    {record.status === 'issued' && (
                        <Button
                            type="link"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleRevoke(record)}
                        >
                            撤销
                        </Button>
                    )}
                </Space>
            )
        }
    ]

    const handleView = (record: SBTRecord) => {
        setSelectedRecord(record)
        setModalType('view')
        setIsModalVisible(true)
    }

    const handleIssue = (record: SBTRecord) => {
        setSelectedRecord(record)
        setModalType('issue')
        setIsModalVisible(true)
    }

    const handleRevoke = (record: SBTRecord) => {
        setSelectedRecord(record)
        setModalType('revoke')
        setIsModalVisible(true)
    }

    const handleModalOk = () => {
        if (modalType === 'issue') {
            message.success('SBT颁发成功')
        } else if (modalType === 'revoke') {
            message.success('SBT撤销成功')
        }
        setIsModalVisible(false)
        setSelectedRecord(null)
    }

    const handleModalCancel = () => {
        setIsModalVisible(false)
        setSelectedRecord(null)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    }

    // 统计数据
    const stats = {
        total: mockData.length,
        pending: mockData.filter(item => item.status === 'pending').length,
        issued: mockData.filter(item => item.status === 'issued').length,
        revoked: mockData.filter(item => item.status === 'revoked').length
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">SBT管理</h1>
                <p className="page-description">管理灵魂绑定代币的颁发和撤销</p>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="总SBT数"
                            value={stats.total}
                            prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="待颁发"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="已颁发"
                            value={stats.issued}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="已撤销"
                            value={stats.revoked}
                            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 操作栏 */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8}>
                        <Search
                            placeholder="搜索SBT ID或持有者"
                            allowClear
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Select placeholder="选择状态" style={{ width: '100%' }} allowClear>
                            <Option value="pending">待颁发</Option>
                            <Option value="issued">已颁发</Option>
                            <Option value="revoked">已撤销</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Select placeholder="选择SBT类型" style={{ width: '100%' }} allowClear>
                            <Option value="学位证书">学位证书</Option>
                            <Option value="奖学金证明">奖学金证明</Option>
                            <Option value="实习证明">实习证明</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={4}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />}>
                                搜索
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* 表格 */}
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />}>
                            批量颁发
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            disabled={selectedRowKeys.length === 0}
                        >
                            批量撤销
                        </Button>
                    </Space>
                </div>

                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={mockData}
                    loading={loading}
                    pagination={{
                        total: mockData.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* 详情/颁发/撤销模态框 */}
            <Modal
                title={modalType === 'view' ? 'SBT详情' : modalType === 'issue' ? '颁发SBT' : '撤销SBT'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={600}
            >
                {selectedRecord && (
                    <div>
                        <Form layout="vertical" form={form}>
                            <Form.Item label="SBT ID">
                                <Input value={selectedRecord.sbtId} readOnly />
                            </Form.Item>
                            <Form.Item label="SBT类型">
                                <Input value={selectedRecord.sbtType} readOnly />
                            </Form.Item>
                            <Form.Item label="持有者">
                                <Input value={selectedRecord.holder} readOnly />
                            </Form.Item>
                            <Form.Item label="持有者DID">
                                <Input value={selectedRecord.holderDID} readOnly />
                            </Form.Item>
                            <Form.Item label="颁发机构">
                                <Input value={selectedRecord.issuer} readOnly />
                            </Form.Item>
                            <Form.Item label="状态">
                                <Tag color={selectedRecord.status === 'pending' ? 'warning' :
                                    selectedRecord.status === 'issued' ? 'success' : 'error'}>
                                    {selectedRecord.status === 'pending' ? '待颁发' :
                                        selectedRecord.status === 'issued' ? '已颁发' : '已撤销'}
                                </Tag>
                            </Form.Item>

                            {modalType === 'issue' && (
                                <>
                                    <Form.Item label="有效期至" name="expireTime">
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item label="附加信息">
                                        <TextArea rows={3} placeholder="请输入SBT的附加信息" />
                                    </Form.Item>
                                    <Form.Item label="附件">
                                        <Upload>
                                            <Button icon={<UploadOutlined />}>上传附件</Button>
                                        </Upload>
                                    </Form.Item>
                                </>
                            )}

                            {modalType === 'revoke' && (
                                <Form.Item label="撤销原因">
                                    <TextArea rows={3} placeholder="请输入撤销原因" />
                                </Form.Item>
                            )}
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default SBTManagement
