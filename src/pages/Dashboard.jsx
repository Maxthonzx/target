import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  BellOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import {
  campaignList,
  departmentList,
  indicatorList,
  levelOptions,
  months,
  reasonData,
  reportingStatusData,
  summaryStats,
  targetActualData,
  todoTasks,
} from '../mock/data';
import './Dashboard.css';

const { Text } = Typography;

const STATUS_META = {
  green: { label: '绿灯', pill: 'status-pill--green', dot: 'status-dot--green' },
  yellow: { label: '黄灯', pill: 'status-pill--yellow', dot: 'status-dot--yellow' },
  red: { label: '红灯', pill: 'status-pill--red', dot: 'status-dot--red' },
  na: { label: '未填报', pill: 'status-pill--na', dot: 'status-dot--na' },
};

function formatPct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${Number(value).toFixed(1)}%`;
}

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

function calcStatusByRate(rate) {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return 'na';
  if (rate >= 100) return 'green';
  if (rate >= 98) return 'yellow';
  return 'red';
}

function getLatestMonthIndexFromMock(data) {
  let latest = 0;
  for (const row of data) {
    const idx = row.monthlyActual?.reduce((max, act, i) => (act === null || act === undefined ? max : Math.max(max, i)), -1);
    if (typeof idx === 'number' && idx > latest) latest = idx;
  }
  return latest;
}

function StatTile({ title, value, hint, extra, tone }) {
  return (
    <Card variant="borderless" className={`ims-stat ims-stat--${tone}`}>
      <div className="ims-stat__top">
        <Text className="ims-stat__title">{title}</Text>
        {hint ? (
          <Tooltip title={hint}>
            <InfoCircleOutlined className="ims-stat__hint" />
          </Tooltip>
        ) : null}
      </div>
      <div className="ims-stat__value">{value}</div>
      {extra ? <div className="ims-stat__extra">{extra}</div> : null}
    </Card>
  );
}

export default function Dashboard() {
  const [viewLevel, setViewLevel] = useState('战役级');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  const defaultMonthIndex = useMemo(() => getLatestMonthIndexFromMock(targetActualData), []);
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs(`2026-${defaultMonthIndex + 1}-01`));

  const [trendOpen, setTrendOpen] = useState(false);
  const [trendIndicator, setTrendIndicator] = useState(null);

  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonIndicator, setReasonIndicator] = useState(null);

  const [todoOpen, setTodoOpen] = useState(false);
  const [reportingRows, setReportingRows] = useState(() => reportingStatusData.map((r) => ({ ...r })));

  // 指标明细筛选状态
  const [detailNameFilter, setDetailNameFilter] = useState('');
  const [detailOwnerFilter, setDetailOwnerFilter] = useState(undefined);
  const [detailStatusFilter, setDetailStatusFilter] = useState(undefined);

  const monthIndex = selectedMonth?.month?.() ?? defaultMonthIndex;
  const monthLabel = `${(monthIndex ?? 0) + 1}月`;
  const prevMonthLabel = monthIndex > 0 ? `${monthIndex}月` : null;

  const levelTabs = useMemo(
    () =>
      ['战役级', '公司级', '部门级'].map((level) => ({
        value: level,
        label: levelOptions.find((o) => o.value === level)?.label ?? level,
      })),
    [],
  );

  const tableRows = useMemo(() => {
    let rows = targetActualData.filter((r) => r.level === viewLevel);
    if (selectedDept !== 'all') rows = rows.filter((r) => r.department === selectedDept);

    if (selectedCampaign !== 'all') {
      rows = rows.filter((r) => {
        const info = indicatorList.find((i) => i.id === r.id);
        return info?.campaign === selectedCampaign || r.campaign === selectedCampaign;
      });
    }

    return rows.map((r) => {
      const info = indicatorList.find((i) => i.id === r.id) || {};

      const currentRate = calcRate(r, monthIndex) ?? r.latestRate ?? null;
      const lastMonthRate = calcRate(r, monthIndex - 1) ?? r.lastMonthRate ?? null;
      const delta = currentRate !== null && lastMonthRate !== null ? Number((currentRate - lastMonthRate).toFixed(1)) : null;
      const status = calcStatusByRate(currentRate) === 'na' ? (r.latestStatus ?? 'na') : calcStatusByRate(currentRate);

      const currentTarget = r.monthlyTarget?.[monthIndex] ?? null;
      const currentActual = r.monthlyActual?.[monthIndex] ?? null;

      return {
        ...info,
        ...r,
        key: r.id,
        computed: {
          monthIndex,
          monthLabel,
          prevMonthLabel,
          currentTarget,
          currentActual,
          currentRate,
          lastMonthRate,
          delta,
          status,
        },
      };
    });
  }, [monthIndex, monthLabel, prevMonthLabel, selectedCampaign, selectedDept, viewLevel]);

  const statusSummary = useMemo(() => {
    const base = { green: 0, yellow: 0, red: 0, na: 0, total: 0 };
    for (const row of tableRows) {
      base.total += 1;
      const s = row.computed?.status ?? 'na';
      base[s] = (base[s] ?? 0) + 1;
    }
    return base;
  }, [tableRows]);

  const redFocusRows = useMemo(() => tableRows.filter((r) => r.computed.status === 'red'), [tableRows]);

  // 指标明细筛选后的数据
  const filteredTableRows = useMemo(() => {
    let filtered = tableRows;
    const nameKey = detailNameFilter.trim();
    if (nameKey) {
      filtered = filtered.filter((r) => r.name?.includes(nameKey) || r.id?.includes(nameKey));
    }
    if (detailOwnerFilter) {
      filtered = filtered.filter((r) => r.owner === detailOwnerFilter);
    }
    if (detailStatusFilter) {
      filtered = filtered.filter((r) => r.computed.status === detailStatusFilter);
    }
    return filtered;
  }, [tableRows, detailNameFilter, detailOwnerFilter, detailStatusFilter]);

  // 责任人下拉选项
  const ownerFilterOptions = useMemo(() => {
    const owners = [...new Set(tableRows.map((r) => r.owner).filter(Boolean))];
    return owners.map((o) => ({ value: o, label: o }));
  }, [tableRows]);

  const todoCount = useMemo(() => todoTasks.filter((t) => t.status !== 'completed').length, []);

  const pieOption = useMemo(() => {
    const data = [
      { name: '绿灯', value: statusSummary.green, itemStyle: { color: '#10b981' } },
      { name: '黄灯', value: statusSummary.yellow, itemStyle: { color: '#f59e0b' } },
      { name: '红灯', value: statusSummary.red, itemStyle: { color: '#ef4444' } },
    ];

    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, icon: 'circle' },
      series: [
        {
          type: 'pie',
          radius: ['52%', '78%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 700 } },
          labelLine: { show: false },
          data,
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '44%',
          style: {
            text: `总计 ${statusSummary.total}`,
            fill: '#111827',
            fontSize: 14,
            fontWeight: 700,
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '54%',
          style: {
            text: statusSummary.na ? `未填报 ${statusSummary.na}` : '',
            fill: '#6b7280',
            fontSize: 12,
            fontWeight: 500,
          },
        },
      ],
    };
  }, [statusSummary]);

  const trendOption = useMemo(() => {
    if (!trendIndicator) return {};
    const data = trendIndicator;

    const rateSeries = data.monthlyActual?.map((act, idx) => {
      if (act === null || act === undefined) return null;
      const target = data.monthlyTarget?.[idx];
      if (target === null || target === undefined) return null;
      if (data.direction === 'negative' && Number(act) === 0) return null;
      const rate = data.direction === 'negative' ? Number(target) / Number(act) : Number(act) / Number(target);
      return Number((rate * 100).toFixed(1));
    });

    return {
      color: ['#e5e7eb', '#3b82f6', '#f59e0b'],
      tooltip: { trigger: 'axis' },
      legend: { data: ['目标值', '实际值', '达成率'], bottom: 0, icon: 'circle' },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '12%', containLabel: true },
      xAxis: { type: 'category', data: months, axisTick: { show: false } },
      yAxis: [
        { type: 'value', name: '数值', splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '达成率', min: 0, max: 150, axisLabel: { formatter: '{value}%' }, splitLine: { show: false } },
      ],
      series: [
        { name: '目标值', type: 'bar', itemStyle: { borderRadius: [6, 6, 0, 0] }, data: data.monthlyTarget },
        { name: '实际值', type: 'bar', itemStyle: { color: '#3b82f6', borderRadius: [6, 6, 0, 0] }, data: data.monthlyActual },
        { name: '达成率', type: 'line', yAxisIndex: 1, smooth: true, symbolSize: 8, data: rateSeries },
      ],
    };
  }, [trendIndicator]);

  function openTrend(row) {
    setTrendIndicator(row);
    setTrendOpen(true);
  }

  function openReason(row) {
    setReasonIndicator(row);
    setReasonOpen(true);
  }

  const completionDelta = useMemo(() => {
    const delta = summaryStats.completionRate - summaryStats.lastMonthCompletionRate;
    return Number(delta.toFixed(1));
  }, []);

  const reportingData = useMemo(() => {
    const withInfo = reportingRows
      .map((r) => {
        const info = indicatorList.find((i) => i.id === r.indicatorId) || {};
        return { ...r, ...info, key: r.indicatorId };
      })
      .filter((r) => r.status !== 'completed')
      .filter((r) => r.month === monthLabel);

    const byLevel = withInfo.filter((r) => (r.level ? r.level === viewLevel : true));

    const byDept = selectedDept === 'all' ? byLevel : byLevel.filter((r) => r.department === selectedDept);
    const byCampaign =
      selectedCampaign === 'all'
        ? byDept
        : byDept.filter((r) => (r.campaign ? r.campaign === selectedCampaign : true));

    return byCampaign;
  }, [monthLabel, reportingRows, selectedCampaign, selectedDept, viewLevel]);

  const columns = useMemo(
    () => [
      {
        title: '指标名称',
        dataIndex: 'name',
        key: 'name',
        width: 260,
        render: (name, row) => (
          <div className="indicator-cell" onClick={() => openTrend(row)} role="button" tabIndex={0}>
            <span className="indicator-cell__icon">
              <BarChartOutlined />
            </span>
            <span className="indicator-cell__main">
              <span className="indicator-cell__title">{name}</span>
              <span className="indicator-cell__meta">
                <Tag className="tag-soft">{row.department}</Tag>
                <Tag className="tag-soft tag-soft--campaign">{row.campaign ?? '-'}</Tag>
                {row.tags?.includes('核心指标') ? <span className="tag-core">Core</span> : null}
              </span>
            </span>
          </div>
        ),
      },
      {
        title: '责任人',
        dataIndex: 'owner',
        key: 'owner',
        width: 120,
        render: (owner) => (
          <span className="owner-pill">
            <span className="owner-pill__avatar">{owner?.slice?.(0, 1) ?? '-'}</span>
            <span className="owner-pill__name">{owner}</span>
          </span>
        ),
      },
      {
        title: '状态',
        dataIndex: ['computed', 'status'],
        key: 'status',
        width: 140,
        align: 'center',
        render: (_, row) => {
          const status = row.computed.status ?? 'na';
          const meta = STATUS_META[status] ?? STATUS_META.na;
          return (
            <div className={`status-pill ${meta.pill}`}>
              <span className={`status-dot ${meta.dot}`} />
              <span>{meta.label}</span>
              {status === 'red' ? (
                <Tooltip title="查看归因详情">
                  <Button
                    className="status-pill__action"
                    type="text"
                    size="small"
                    icon={<WarningOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openReason(row);
                    }}
                  />
                </Tooltip>
              ) : null}
            </div>
          );
        },
      },
      {
        title: (
          <span>
            达成率 <Text type="secondary">({monthLabel})</Text>
          </span>
        ),
        dataIndex: ['computed', 'currentRate'],
        key: 'rate',
        width: 220,
        align: 'right',
        sorter: (a, b) => (a.computed.currentRate ?? -Infinity) - (b.computed.currentRate ?? -Infinity),
        render: (_, row) => {
          const rate = row.computed.currentRate;
          const delta = row.computed.delta;
          const deltaUp = typeof delta === 'number' ? delta > 0 : false;
          const deltaDown = typeof delta === 'number' ? delta < 0 : false;
          const showDelta = typeof delta === 'number';

          const progress = typeof rate === 'number' ? Math.max(0, Math.min(rate, 100)) : 0;
          const barTone = rate === null ? 'na' : calcStatusByRate(rate);

          return (
            <div className="rate-cell">
              <div className="rate-cell__top">
                <span className="rate-cell__value">{formatPct(rate)}</span>
                {showDelta ? (
                  <span className={`rate-cell__delta ${deltaUp ? 'is-up' : ''} ${deltaDown ? 'is-down' : ''}`}>
                    {deltaUp ? <ArrowUpOutlined /> : null}
                    {deltaDown ? <ArrowDownOutlined /> : null}
                    {Math.abs(delta).toFixed(1)}%
                  </span>
                ) : (
                  <span className="rate-cell__delta rate-cell__delta--na">—</span>
                )}
              </div>
              <div className="rate-bar">
                <div className={`rate-bar__fill rate-bar__fill--${barTone}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="rate-cell__hint">
                <Text type="secondary">
                  上月：{formatPct(row.computed.lastMonthRate)} {prevMonthLabel ? `(${prevMonthLabel})` : ''}
                </Text>
              </div>
            </div>
          );
        },
      },
      {
        title: (
          <span>
            本月数值 <Text type="secondary">({monthLabel})</Text>
          </span>
        ),
        key: 'value',
        width: 220,
        align: 'right',
        render: (_, row) => {
          const t = row.computed.currentTarget;
          const a = row.computed.currentActual;
          const unit = row.unit ? ` ${row.unit}` : '';
          return (
            <div className="value-cell">
              <div className="value-cell__row">
                <Text type="secondary">目标</Text>
                <span className="value-cell__num">{t === null ? '-' : `${t}${unit}`}</span>
              </div>
              <div className="value-cell__row">
                <Text type="secondary">实际</Text>
                <span className="value-cell__num value-cell__num--strong">{a === null ? '-' : `${a}${unit}`}</span>
              </div>
            </div>
          );
        },
      },
    ],
    [monthLabel, prevMonthLabel],
  );

  const reportingColumns = useMemo(
    () => [
      { title: '指标名', dataIndex: 'indicatorName', key: 'indicatorName', width: 220 },
      {
        title: '责任人',
        dataIndex: 'owner',
        key: 'owner',
        width: 120,
        render: (owner) => (
          <span className="owner-pill owner-pill--sm">
            <span className="owner-pill__avatar">{owner?.slice?.(0, 1) ?? '-'}</span>
            <span className="owner-pill__name">{owner}</span>
          </span>
        ),
      },
      {
        title: '截止日期',
        dataIndex: 'deadline',
        key: 'deadline',
        width: 120,
        render: (deadline) => (
          <span className="deadline">
            <ClockCircleOutlined /> {deadline}
          </span>
        ),
      },
      {
        title: '逾期天数',
        dataIndex: 'overdueDays',
        key: 'overdueDays',
        width: 100,
        align: 'right',
        render: (days, row) => {
          if (row.status === 'pending') return <Text type="secondary">—</Text>;
          return <span className={days > 0 ? 'overdue-num' : ''}>{days}</span>;
        },
      },
      {
        title: '已催办',
        dataIndex: 'reminderSent',
        key: 'reminderSent',
        width: 100,
        align: 'right',
      },
      {
        title: '操作',
        key: 'actions',
        width: 180,
        align: 'right',
        render: (_, row) => (
          <Space size={8}>
            <Button
              onClick={() => {
                setReportingRows((prev) =>
                  prev.map((r) => (r.indicatorId === row.indicatorId ? { ...r, reminderSent: (r.reminderSent ?? 0) + 1 } : r)),
                );
                message.success('已发送催办（Mock）');
              }}
            >
              催办
            </Button>
            <Button
              type="primary"
              onClick={() => {
                message.success('已一键提醒（Mock）');
              }}
            >
              一键提醒
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

  const reasonDetail = useMemo(() => {
    const indicatorId = reasonIndicator?.id;
    if (!indicatorId) return null;
    return reasonData.find((r) => r.indicatorId === indicatorId) ?? null;
  }, [reasonIndicator]);

  const latestReason = useMemo(() => {
    const reasons = reasonDetail?.reasons ?? [];
    if (!reasons.length) return null;
    const byMonth = reasons.find((r) => r.month === monthLabel);
    return byMonth ?? reasons[0];
  }, [monthLabel, reasonDetail]);

  const todoModalRows = useMemo(() => todoTasks.filter((t) => t.status !== 'completed'), []);

  return (
    <div className="ims-dashboard">
      <div className="ims-header">
        <div className="ims-header__left">
          <div className="ims-header__title">指标驾驶舱</div>
          <div className="ims-header__sub">先看全局灯态与异常溯源，再看填报管控与指标明细</div>
        </div>
        <div className="ims-header__right">
          <Badge count={todoCount} size="small" overflowCount={99}>
            <Button type="primary" icon={<BellOutlined />} onClick={() => setTodoOpen(true)}>
              待办入口
            </Button>
          </Badge>
        </div>
      </div>

      <Row gutter={[16, 16]} className="ims-summary">
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="绿灯指标"
            tone="green"
            value={`${statusSummary.green}（${statusSummary.total ? Math.round((statusSummary.green / statusSummary.total) * 100) : 0}%）`}
            hint="达成率 ≥ 100%"
            extra={<Text type="secondary">当前视图：{viewLevel}</Text>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="黄灯指标"
            tone="yellow"
            value={`${statusSummary.yellow}（${statusSummary.total ? Math.round((statusSummary.yellow / statusSummary.total) * 100) : 0}%）`}
            hint="98% ≤ 达成率 ＜ 100%"
            extra={<Text type="secondary">需关注波动</Text>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="红灯指标"
            tone="red"
            value={`${statusSummary.red}（${statusSummary.total ? Math.round((statusSummary.red / statusSummary.total) * 100) : 0}%）`}
            hint="达成率 ＜ 98%"
            extra={<Text type="secondary">点击红灯查看归因</Text>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatTile
            title="综合达成率"
            tone="neutral"
            value={`${summaryStats.completionRate}%`}
            hint="Mock：来自 summaryStats"
            extra={
              <span className={`mom ${completionDelta >= 0 ? 'mom--up' : 'mom--down'}`}>
                {completionDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(completionDelta)}%{' '}
                <Text type="secondary">较上月</Text>
              </span>
            }
          />
        </Col>
      </Row>

      <Card variant="borderless" className="ims-controls" styles={{ body: { padding: 16 } }}>
        <div className="ims-controls__row">
          <div className="ims-tabs">
            <Text className="ims-controls__label">视图维度</Text>
            <div className="ims-tabs__wrap">
              {levelTabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`ims-tab ${viewLevel === t.value ? 'is-active' : ''}`}
                  onClick={() => setViewLevel(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ims-filters">
            <Space size={12} wrap>
              <div className="ims-filter">
                <Text className="ims-controls__label">战役</Text>
                <Select
                  value={selectedCampaign}
                  style={{ width: 180 }}
                  onChange={setSelectedCampaign}
                  options={[{ value: 'all', label: '全部战役' }, ...campaignList]}
                />
              </div>

              <div className="ims-filter">
                <Text className="ims-controls__label">部门</Text>
                <Select
                  value={selectedDept}
                  style={{ width: 160 }}
                  onChange={setSelectedDept}
                  options={[{ value: 'all', label: '全公司' }, ...departmentList]}
                />
              </div>

              <div className="ims-filter">
                <Text className="ims-controls__label">月份</Text>
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={(d) => setSelectedMonth(d ?? selectedMonth)}
                  allowClear={false}
                />
              </div>
            </Space>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]} className="ims-top-panels">
        <Col xs={24} lg={10}>
          <Card variant="borderless" className="panel-card" title="红黄绿灯占比">
            <ReactECharts option={pieOption} style={{ height: 300, width: '100%' }} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            variant="borderless"
            className="panel-card"
            title={
              <span className="panel-title">
                红灯指标聚焦 <Tag color="red">{redFocusRows.length}</Tag>
              </span>
            }
            extra={
              <Text type="secondary">
                点击查看归因 {monthLabel} / {viewLevel}
              </Text>
            }
          >
            {redFocusRows.length ? (
              <div className="red-focus">
                {redFocusRows.map((row) => (
                  <div key={row.id} className="red-focus__item" onClick={() => openReason(row)}>
                    <div className="red-focus__meta-block">
                      <div className="red-focus__title">
                        <span className="red-focus__name">{row.name}</span>
                        <span className="red-focus__meta">
                          <span className="red-focus__kv">
                            <Text type="secondary">状态</Text>
                            <Tag color="red">红灯</Tag>
                          </span>
                          <span className="red-focus__kv">
                            <Text type="secondary">达成率</Text>
                            <Text className="red-focus__rate">{formatPct(row.computed.currentRate)}</Text>
                          </span>
                          <span className="red-focus__kv">
                            <Text type="secondary">责任人</Text>
                            <Text>{row.owner}</Text>
                          </span>
                        </span>
                      </div>
                      <Text type="secondary">部门：{row.department} · 战役：{row.campaign ?? '-'}</Text>
                    </div>
                    <Button
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReason(row);
                      }}
                    >
                      查看归因
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="当前筛选下暂无红灯指标" />
            )}
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="ims-reporting" title="填报管控" extra={<Text type="secondary">仅展示未按时/待填报（{monthLabel}）</Text>}>
        {reportingData.length ? (
          <Table
            columns={reportingColumns}
            dataSource={reportingData}
            pagination={false}
            size="middle"
            className="reporting-table"
          />
        ) : (
          <Empty description="当前筛选下暂无填报异常" />
        )}
      </Card>

      <Card variant="borderless" className="ims-table" title="指标明细" extra={<Text type="secondary">点击指标名称查看趋势</Text>}>
        <Space style={{ marginBottom: 16 }} size={8}>
          <Input.Search
            placeholder="搜索指标名称/编号"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={detailNameFilter}
            onChange={(e) => setDetailNameFilter(e.target.value)}
            allowClear
          />
          <Select
            placeholder="责任人"
            style={{ width: 120 }}
            value={detailOwnerFilter}
            onChange={(v) => setDetailOwnerFilter(v)}
            allowClear
            options={ownerFilterOptions}
          />
          <Select
            placeholder="状态"
            style={{ width: 110 }}
            value={detailStatusFilter}
            onChange={(v) => setDetailStatusFilter(v)}
            allowClear
            options={[
              { value: 'green', label: '绿灯' },
              { value: 'yellow', label: '黄灯' },
              { value: 'red', label: '红灯' },
              { value: 'na', label: '未填报' },
            ]}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={filteredTableRows}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条指标` }}
        />
      </Card>

      <Modal
        title={trendIndicator ? `${trendIndicator.name} - 趋势详情` : '趋势详情'}
        open={trendOpen}
        onCancel={() => setTrendOpen(false)}
        footer={null}
        width={880}
        centered
        destroyOnHidden
      >
        {trendIndicator ? <ReactECharts option={trendOption} style={{ height: 420, width: '100%' }} /> : null}
      </Modal>

      <Modal
        title={
          <span className="reason-title">
            <ExclamationCircleOutlined /> 红灯指标归因溯源
          </span>
        }
        open={reasonOpen}
        onCancel={() => setReasonOpen(false)}
        footer={null}
        width={720}
        centered
        destroyOnHidden
      >
        {reasonIndicator ? (
          <div className="reason-body">
            <div className="reason-head">
              <div className="reason-head__left">
                <div className="reason-indicator">{reasonIndicator.name}</div>
                <div className="reason-sub">
                  <Tag color="red">红灯</Tag>
                  <Text type="secondary">
                    {monthLabel} 达成率：{formatPct(reasonIndicator.computed.currentRate)}
                  </Text>
                </div>
              </div>
              <div className="reason-head__right">
                <div className="reason-owner">
                  <Text type="secondary">责任人</Text> <Text strong>{reasonIndicator.owner}</Text>
                </div>
              </div>
            </div>

            {latestReason ? (
              <div className="reason-grid">
                <div className="reason-block">
                  <div className="reason-block__title">根本原因</div>
                  <div className="reason-block__content">{latestReason.rootCause}</div>
                </div>
                <div className="reason-block">
                  <div className="reason-block__title">影响</div>
                  <div className="reason-block__content">{latestReason.impact}</div>
                </div>
                <div className="reason-block">
                  <div className="reason-block__title">改进措施</div>
                  <div className="reason-block__content reason-block__content--pre">{latestReason.measure}</div>
                </div>
                <div className="reason-block">
                  <div className="reason-block__title">预计恢复时间</div>
                  <div className="reason-block__content">{latestReason.expectedRecovery}</div>
                </div>
              </div>
            ) : (
              <div className="reason-empty">
                <div className="reason-empty__banner">
                  <WarningOutlined /> 归因数据为空，待业务负责人填报
                </div>
                <Button
                  type="primary"
                  onClick={() => {
                    message.info('跳转填报（Mock）');
                  }}
                >
                  前往填报
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        title="待办任务"
        open={todoOpen}
        onCancel={() => setTodoOpen(false)}
        footer={null}
        width={680}
        centered
        destroyOnHidden
      >
        <div className="todo-list">
          {todoModalRows.map((t) => (
            <div key={t.id} className="todo-item">
              <div className="todo-content">
                <div className="todo-title">
                  <span>{t.title}</span>
                  <span className="todo-tags">
                    <Tag color={t.priority === 'high' ? 'red' : 'gold'}>{t.priority === 'high' ? '高' : '中'}优先级</Tag>
                    <Tag color={t.status === 'overdue' ? 'volcano' : 'blue'}>{t.status === 'overdue' ? '逾期' : '待处理'}</Tag>
                  </span>
                </div>
                <Text type="secondary">
                  {t.assignee} · 截止 {t.deadline} · 类型 {t.type}
                </Text>
              </div>
              <Button
                type="link"
                onClick={() => {
                  message.info('打开待办（Mock）');
                }}
              >
                处理
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
