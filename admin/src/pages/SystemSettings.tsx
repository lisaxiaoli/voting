import React, { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  InputNumber,
  message,
  Tabs,
  Row,
  Col,
  Divider,
  Space,
  Modal,
  Table,
  Tag
} from 'antd'
import { 
  SettingOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined
} from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

interface Department {
  key: string
  name: string
  code: string
  verifier: string
  status: 'active' | 'inactive'
}

interface Verifier {
  key: string
  name: string
  email: string
  department: string
  level: 'department' | 'school' | 'system'
  status: 'active' | 'inactive'
}

const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [isDepartmentModalVisible, setIsDepartmentModalVisible] = useState(false)
  const [isVerifierModalVisible, setIsVerifierModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  // 模拟数据
  const departments: Department[] = [
    {
      key: '1',
      name: '计算机学院',
      code: 'CS',
      verifier: '张三',
      status: 'active'
    },
    {
      key: '2',
      name: '数学学院',
      code: 'MATH',
      verifier: '李四',
      status: 'active'
    }
  ]

  const verifiers: Verifier[] = [
    {
      key: '1',
      name: '张三',
      email: 'zhangsan@hebeu.edu.cn',
      department: '计算机学院',
      level: 'department',
      status: 'active'
    },
    {
      key: '2',
      name: '李四',
      email: 'lisi@hebeu.edu.cn',
      department: '数学学院',
      level: 'school',
      status: 'active'
    }
  ]

  const handleSaveSettings = (values: any) => {
    setLoading(true)
    setTimeout(() => {
      message.success('系统设置保存成功')
      setLoading(false)
    }, 1000)
  }

  const handleDepartmentModal = (type: 'create' | 'edit', record?: Department) => {
    setModalType(type)
    setSelectedRecord(record)
    setIsDepartmentModalVisible(true)
  }

  const handleVerifierModal = (type: 'create' | 'edit', record?: Verifier) => {
    setModalType(type)
    setSelectedRecord(record)
    setIsVerifierModalVisible(true)
  }

  const departmentColumns = [
    {
      title: '学院名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '学院代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '验证者',
      dataIndex: 'verifier',
      key: 'verifier'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Department) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleDepartmentModal('edit', record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const verifierColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '权限级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const levelConfig = {
          department: { color: 'blue', text: '部门级' },
          school: { color: 'green', text: '校级' },
          system: { color: 'red', text: '系统级' }
        }
        const config = levelConfig[level as keyof typeof levelConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Verifier) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleVerifierModal('edit', record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">系统设置</h1>
        <p className="page-description">配置系统参数和权限管理</p>
      </div>

      <Tabs defaultActiveKey="general">
        <TabPane tab="基本设置" key="general">
          <Card title="基本配置">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveSettings}
              initialValues={{
                systemName: 'LC Voting System',
                maxFileSize: 10,
                sessionTimeout: 30,
                enableEmail: true,
                enableSMS: false
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="系统名称" name="systemName">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="系统版本" name="systemVersion">
                    <Input value="v1.0.0" readOnly />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="最大文件上传大小(MB)" name="maxFileSize">
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="会话超时时间(分钟)" name="sessionTimeout">
                    <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item label="功能开关">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="enableEmail" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                      <span style={{ marginLeft: 8 }}>邮件通知</span>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="enableSMS" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                      <span style={{ marginLeft: 8 }}>短信通知</span>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="enableAutoBackup" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                      <span style={{ marginLeft: 8 }}>自动备份</span>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="部门管理" key="departments">
          <Card 
            title="学院部门管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleDepartmentModal('create')}>
                新增部门
              </Button>
            }
          >
            <Table
              columns={departmentColumns}
              dataSource={departments}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="验证者管理" key="verifiers">
          <Card 
            title="验证者管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleVerifierModal('create')}>
                新增验证者
              </Button>
            }
          >
            <Table
              columns={verifierColumns}
              dataSource={verifiers}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="数据库设置" key="database">
          <Card title="数据库配置">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="数据库类型">
                    <Select defaultValue="mysql">
                      <Option value="mysql">MySQL</Option>
                      <Option value="mongodb">MongoDB</Option>
                      <Option value="postgresql">PostgreSQL</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="数据库地址">
                    <Input placeholder="localhost:3306" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="数据库名称">
                    <Input placeholder="lc_voting" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="用户名">
                    <Input placeholder="root" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="密码">
                <Input.Password placeholder="请输入数据库密码" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" icon={<DatabaseOutlined />}>
                    测试连接
                  </Button>
                  <Button icon={<SaveOutlined />}>
                    保存配置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      {/* 部门管理模态框 */}
      <Modal
        title={modalType === 'create' ? '新增部门' : '编辑部门'}
        open={isDepartmentModalVisible}
        onOk={() => {
          message.success(`${modalType === 'create' ? '新增' : '编辑'}部门成功`)
          setIsDepartmentModalVisible(false)
        }}
        onCancel={() => setIsDepartmentModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="学院名称" required>
            <Input placeholder="请输入学院名称" />
          </Form.Item>
          <Form.Item label="学院代码" required>
            <Input placeholder="请输入学院代码" />
          </Form.Item>
          <Form.Item label="验证者">
            <Input placeholder="请输入验证者姓名" />
          </Form.Item>
          <Form.Item label="状态">
            <Select defaultValue="active">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 验证者管理模态框 */}
      <Modal
        title={modalType === 'create' ? '新增验证者' : '编辑验证者'}
        open={isVerifierModalVisible}
        onOk={() => {
          message.success(`${modalType === 'create' ? '新增' : '编辑'}验证者成功`)
          setIsVerifierModalVisible(false)
        }}
        onCancel={() => setIsVerifierModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="姓名" required>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="邮箱" required>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="部门" required>
            <Select placeholder="请选择部门">
              <Option value="计算机学院">计算机学院</Option>
              <Option value="数学学院">数学学院</Option>
              <Option value="物理学院">物理学院</Option>
            </Select>
          </Form.Item>
          <Form.Item label="权限级别" required>
            <Select placeholder="请选择权限级别">
              <Option value="department">部门级</Option>
              <Option value="school">校级</Option>
              <Option value="system">系统级</Option>
            </Select>
          </Form.Item>
          <Form.Item label="状态">
            <Select defaultValue="active">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SystemSettings
