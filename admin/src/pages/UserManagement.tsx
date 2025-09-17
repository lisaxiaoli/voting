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
  Avatar,
  Tooltip
} from 'antd'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined
} from '@ant-design/icons'

const { Search } = Input
const { Option } = Select

interface UserRecord {
  key: string
  userId: string
  name: string
  email: string
  userType: 'student' | 'teacher' | 'admin' | 'verifier'
  department: string
  studentId?: string
  status: 'active' | 'inactive' | 'banned'
  lastLogin: string
  createTime: string
}

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view')
  const [selectedRecord, setSelectedRecord] = useState<UserRecord | null>(null)
  const [form] = Form.useForm()

  // 模拟数据
  const mockData: UserRecord[] = [
    {
      key: '1',
      userId: 'U001',
      name: '张三',
      email: 'zhangsan@hebeu.edu.cn',
      userType: 'student',
      department: '计算机学院',
      studentId: '2021001001',
      status: 'active',
      lastLogin: '2024-01-15 14:30:00',
      createTime: '2024-01-01 09:00:00'
    },
    {
      key: '2',
      userId: 'U002',
      name: '李四',
      email: 'lisi@hebeu.edu.cn',
      userType: 'teacher',
      department: '数学学院',
      status: 'active',
      lastLogin: '2024-01-15 10:20:00',
      createTime: '2024-01-02 09:00:00'
    },
    {
      key: '3',
      userId: 'U003',
      name: '王五',
      email: 'wangwu@hebeu.edu.cn',
      userType: 'verifier',
      department: '物理学院',
      status: 'inactive',
      lastLogin: '2024-01-10 16:45:00',
      createTime: '2024-01-03 09:00:00'
    }
  ]

  const columns = [
    {
      title: '头像',
      dataIndex: 'name',
      key: 'avatar',
      width: 80,
      render: (name: string) => (
        <Avatar size="large" icon={<UserOutlined />}>
          {name.charAt(0)}
        </Avatar>
      )
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true
    },
    {
      title: '用户类型',
      dataIndex: 'userType',
      key: 'userType',
      width: 100,
      render: (type: string) => {
        const typeConfig = {
          student: { color: 'blue', text: '学生' },
          teacher: { color: 'green', text: '教师' },
          admin: { color: 'red', text: '管理员' },
          verifier: { color: 'purple', text: '验证者' }
        }
        const config = typeConfig[type as keyof typeof typeConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '学院/部门',
      dataIndex: 'department',
      key: 'department',
      width: 150
    },
    {
      title: '学号/工号',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
      render: (text: string) => text || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'success', text: '正常' },
          inactive: { color: 'warning', text: '未激活' },
          banned: { color: 'error', text: '已封禁' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: UserRecord) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑用户">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用用户' : '启用用户'}>
            <Button 
              type="link" 
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="删除用户">
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleView = (record: UserRecord) => {
    setSelectedRecord(record)
    setModalType('view')
    setIsModalVisible(true)
  }

  const handleEdit = (record: UserRecord) => {
    setSelectedRecord(record)
    setModalType('edit')
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleCreate = () => {
    setSelectedRecord(null)
    setModalType('create')
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleToggleStatus = (record: UserRecord) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active'
    message.success(`用户${newStatus === 'active' ? '启用' : '禁用'}成功`)
  }

  const handleDelete = (record: UserRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.name} 吗？`,
      onOk: () => {
        message.success('用户删除成功')
      }
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(() => {
      if (modalType === 'create') {
        message.success('用户创建成功')
      } else if (modalType === 'edit') {
        message.success('用户信息更新成功')
      }
      setIsModalVisible(false)
      setSelectedRecord(null)
    })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setSelectedRecord(null)
    form.resetFields()
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }

  // 统计数据
  const stats = {
    total: mockData.length,
    active: mockData.filter(item => item.status === 'active').length,
    inactive: mockData.filter(item => item.status === 'inactive').length,
    banned: mockData.filter(item => item.status === 'banned').length
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">用户管理</h1>
        <p className="page-description">管理系统用户和权限</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.total}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.active}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="未激活"
              value={stats.inactive}
              prefix={<LockOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="已封禁"
              value={stats.banned}
              prefix={<UnlockOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="搜索用户名或邮箱"
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select placeholder="选择用户类型" style={{ width: '100%' }} allowClear>
              <Option value="student">学生</Option>
              <Option value="teacher">教师</Option>
              <Option value="admin">管理员</Option>
              <Option value="verifier">验证者</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select placeholder="选择状态" style={{ width: '100%' }} allowClear>
              <Option value="active">正常</Option>
              <Option value="inactive">未激活</Option>
              <Option value="banned">已封禁</Option>
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新增用户
            </Button>
            <Button 
              danger 
              icon={<LockOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              批量禁用
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 用户详情/编辑模态框 */}
      <Modal
        title={modalType === 'view' ? '用户详情' : modalType === 'edit' ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input disabled={modalType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="用户ID" name="userId" rules={[{ required: true, message: '请输入用户ID' }]}>
                <Input disabled={modalType === 'view' || modalType === 'edit'} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input disabled={modalType === 'view'} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="用户类型" name="userType" rules={[{ required: true, message: '请选择用户类型' }]}>
                <Select disabled={modalType === 'view'}>
                  <Option value="student">学生</Option>
                  <Option value="teacher">教师</Option>
                  <Option value="admin">管理员</Option>
                  <Option value="verifier">验证者</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="学号/工号" name="studentId">
                <Input disabled={modalType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="学院/部门" name="department" rules={[{ required: true, message: '请输入学院/部门' }]}>
            <Input disabled={modalType === 'view'} />
          </Form.Item>
          
          {modalType === 'view' && (
            <>
              <Form.Item label="状态">
                <Tag color={selectedRecord?.status === 'active' ? 'success' : 
                           selectedRecord?.status === 'inactive' ? 'warning' : 'error'}>
                  {selectedRecord?.status === 'active' ? '正常' :
                   selectedRecord?.status === 'inactive' ? '未激活' : '已封禁'}
                </Tag>
              </Form.Item>
              <Form.Item label="最后登录">
                <Input value={selectedRecord?.lastLogin} readOnly />
              </Form.Item>
              <Form.Item label="创建时间">
                <Input value={selectedRecord?.createTime} readOnly />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
