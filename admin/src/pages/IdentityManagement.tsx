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
    Statistic
} from 'antd'
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    UserOutlined,
    ClockCircleOutlined
} from '@ant-design/icons'

const { Search } = Input
const { Option } = Select

interface IdentityRecord {
    key: string
    did: string
    userType: string
    name: string
    studentId?: string
    department: string
    status: 'pending' | 'approved' | 'rejected'
    createTime: string
    verifyTime?: string
}

const IdentityManagement: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalType, setModalType] = useState<'view' | 'edit' | 'verify'>('view')
    const [selectedRecord, setSelectedRecord] = useState<IdentityRecord | null>(null)
    const [form] = Form.useForm()

    // 模拟数据
    const mockData: IdentityRecord[] = [
        {
            key: '1',
            did: 'did:hebeu:7aa029b5-4eb2-4231-9651-1c8ebe39edc0',
            userType: '学生',
            name: '张三',
            studentId: '2021001001',
            department: '计算机学院',
            status: 'pending',
            createTime: '2024-01-15 14:30:00'
        },
        {
            key: '2',
            did: 'did:hebeu:2c199009-0f4e-4fa3-9188-11e4a9617cd4',
            userType: '教师',
            name: '李四',
            department: '数学学院',
            status: 'approved',
            createTime: '2024-01-14 09:20:00',
            verifyTime: '2024-01-14 16:45:00'
        },
        {
            key: '3',
            did: 'did:hebeu:3d310010-1g5f-5gb4-0299-22f5b9728ed5',
            userType: '学生',
            name: '王五',
            studentId: '2021001003',
            department: '物理学院',
            status: 'rejected',
            createTime: '2024-01-13 11:15:00',
            verifyTime: '2024-01-13 15:30:00'
        }
    ]

    const columns = [
        {
            title: 'DID',
            dataIndex: 'did',
            key: 'did',
            width: 300,
            ellipsis: true,
            render: (text: string) => (
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{text}</span>
            )
        },
        {
            title: '用户类型',
            dataIndex: 'userType',
            key: 'userType',
            width: 100,
            render: (type: string) => (
                <Tag color={type === '学生' ? 'blue' : 'green'}>{type}</Tag>
            )
        },
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
            width: 100
        },
        {
            title: '学号/工号',
            dataIndex: 'studentId',
            key: 'studentId',
            width: 120,
            render: (text: string) => text || '-'
        },
        {
            title: '学院/部门',
            dataIndex: 'department',
            key: 'department',
            width: 150
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => {
                const statusConfig = {
                    pending: { color: 'warning', text: '待审核' },
                    approved: { color: 'success', text: '已通过' },
                    rejected: { color: 'error', text: '已拒绝' }
                }
                const config = statusConfig[status as keyof typeof statusConfig]
                return <Tag color={config.color}>{config.text}</Tag>
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 150
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (record: IdentityRecord) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        查看
                    </Button>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="link"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleVerify(record, 'approved')}
                            >
                                通过
                            </Button>
                            <Button
                                type="link"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleVerify(record, 'rejected')}
                            >
                                拒绝
                            </Button>
                        </>
                    )}
                </Space>
            )
        }
    ]

    const handleView = (record: IdentityRecord) => {
        setSelectedRecord(record)
        setModalType('view')
        setIsModalVisible(true)
    }

    const handleVerify = (record: IdentityRecord, status: 'approved' | 'rejected') => {
        setSelectedRecord(record)
        setModalType('verify')
        setIsModalVisible(true)
    }

    const handleModalOk = () => {
        if (modalType === 'verify') {
            // 处理审核逻辑
            message.success(`身份${selectedRecord?.status === 'approved' ? '通过' : '拒绝'}成功`)
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
        approved: mockData.filter(item => item.status === 'approved').length,
        rejected: mockData.filter(item => item.status === 'rejected').length
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">身份管理</h1>
                <p className="page-description">管理用户DID身份和审核流程</p>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="总身份数"
                            value={stats.total}
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="待审核"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="已通过"
                            value={stats.approved}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="已拒绝"
                            value={stats.rejected}
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
                            placeholder="搜索DID或姓名"
                            allowClear
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Select placeholder="选择状态" style={{ width: '100%' }} allowClear>
                            <Option value="pending">待审核</Option>
                            <Option value="approved">已通过</Option>
                            <Option value="rejected">已拒绝</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Select placeholder="选择用户类型" style={{ width: '100%' }} allowClear>
                            <Option value="学生">学生</Option>
                            <Option value="教师">教师</Option>
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
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            disabled={selectedRowKeys.length === 0}
                        >
                            批量通过
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            disabled={selectedRowKeys.length === 0}
                        >
                            批量拒绝
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

            {/* 详情/审核模态框 */}
            <Modal
                title={modalType === 'view' ? '身份详情' : '身份审核'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={600}
            >
                {selectedRecord && (
                    <div>
                        <Form layout="vertical">
                            <Form.Item label="DID">
                                <Input value={selectedRecord.did} readOnly />
                            </Form.Item>
                            <Form.Item label="用户类型">
                                <Input value={selectedRecord.userType} readOnly />
                            </Form.Item>
                            <Form.Item label="姓名">
                                <Input value={selectedRecord.name} readOnly />
                            </Form.Item>
                            <Form.Item label="学号/工号">
                                <Input value={selectedRecord.studentId || '-'} readOnly />
                            </Form.Item>
                            <Form.Item label="学院/部门">
                                <Input value={selectedRecord.department} readOnly />
                            </Form.Item>
                            <Form.Item label="状态">
                                <Tag color={selectedRecord.status === 'pending' ? 'warning' :
                                    selectedRecord.status === 'approved' ? 'success' : 'error'}>
                                    {selectedRecord.status === 'pending' ? '待审核' :
                                        selectedRecord.status === 'approved' ? '已通过' : '已拒绝'}
                                </Tag>
                            </Form.Item>
                            {modalType === 'verify' && (
                                <Form.Item label="审核意见">
                                    <Input.TextArea rows={3} placeholder="请输入审核意见" />
                                </Form.Item>
                            )}
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default IdentityManagement
