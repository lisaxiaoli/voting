import React from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Progress } from 'antd'
import {
  UserOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined
} from '@ant-design/icons'

const Dashboard: React.FC = () => {
  // 统计数据
  const statistics = [
    {
      title: '总用户数',
      value: 1256,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      trend: '+12.5%'
    },
    {
      title: 'DID身份数',
      value: 892,
      icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />,
      trend: '+8.2%'
    },
    {
      title: '已审核',
      value: 654,
      icon: <CheckCircleOutlined style={{ color: '#722ed1' }} />,
      trend: '+15.3%'
    },
    {
      title: '待审核',
      value: 238,
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      trend: '+5.1%'
    }
  ]

  // 待处理事项
  const pendingItems = [
    {
      key: '1',
      type: 'DID申请',
      user: '张三',
      did: 'did:hebeu:7aa029b5-4eb2-4231-9651-1c8ebe39edc0',
      time: '2024-01-15 14:30',
      status: 'pending'
    },
    {
      key: '2',
      type: 'SBT申请',
      user: '李四',
      did: 'did:hebeu:2c199009-0f4e-4fa3-9188-11e4a9617cd4',
      time: '2024-01-15 13:45',
      status: 'pending'
    },
    {
      key: '3',
      type: '身份更新',
      user: '王五',
      did: 'did:hebeu:3d310010-1g5f-5gb4-0299-22f5b9728ed5',
      time: '2024-01-15 12:20',
      status: 'pending'
    }
  ]

  const pendingColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'DID申请' ? 'blue' : type === 'SBT申请' ? 'green' : 'orange'}>
          {type}
        </Tag>
      )
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'DID',
      dataIndex: 'did',
      key: 'did',
      ellipsis: true
    },
    {
      title: '申请时间',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <div className="table-actions">
          <a>审核</a>
          <a>查看详情</a>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">仪表盘</h1>
        <p className="page-description">系统概览和关键指标</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={
                  <span style={{ fontSize: 14, color: '#52c41a' }}>
                    <RiseOutlined /> {stat.trend}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 审核进度 */}
        <Col xs={24} lg={12}>
          <Card title="审核进度" style={{ height: 400 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>DID身份审核</div>
              <Progress
                percent={75}
                status="active"
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>SBT申请审核</div>
              <Progress
                percent={60}
                status="active"
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>用户信息验证</div>
              <Progress
                percent={85}
                status="active"
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>系统维护</div>
              <Progress
                percent={45}
                status="active"
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              />
            </div>
          </Card>
        </Col>

        {/* 待处理事项 */}
        <Col xs={24} lg={12}>
          <Card title="待处理事项" style={{ height: 400 }}>
            <Table
              dataSource={pendingItems}
              columns={pendingColumns}
              pagination={false}
              size="small"
              scroll={{ y: 280 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
