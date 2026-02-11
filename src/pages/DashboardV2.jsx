import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { summaryStats, targetActualData } from '../mock/data';
import './DashboardV2.css';

// Chart Theme for V2
const chartTheme = {
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Space Grotesk, monospace' },
  color: ['#ffffff', '#52525b', '#3b82f6', '#facc15'],
  grid: { top: 10, bottom: 0, left: 0, right: 0 }
};

const MiniChart = ({ data, color = '#ffffff' }) => {
  const option = {
    ...chartTheme,
    xAxis: { show: false, data: ['M1','M2','M3','M4','M5','M6'] },
    yAxis: { show: false },
    series: [{
      type: 'line',
      data: data,
      showSymbol: false,
      smooth: true,
      lineStyle: { width: 2, color: color },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: color }, { offset: 1, color: 'transparent' }],
        },
        opacity: 0.2
      }
    }]
  };
  return <ReactECharts option={option} style={{ height: '40px', width: '100px' }} />;
};

const DashboardV2 = () => {
  const topStats = useMemo(() => [
    { label: '指标总数', value: '142', trend: '+12%', isUp: true },
    { label: '达标率', value: '98.4%', trend: '-0.2%', isUp: false },
    { label: '待审批', value: '08', trend: '待处理', isUp: null },
    { label: '系统状态', value: '正常', trend: '运行中', isUp: true },
  ], []);

  const priorityIndicators = targetActualData.slice(0, 6);

  return (
    <div className="dash-v2">
      <h1 className="dash-v2__title">数据总览</h1>
      <p className="dash-v2__subtitle">
        实时监控关键指标运行情况，数据更新时间：{new Date().toLocaleTimeString('zh-CN')}
      </p>

      <div className="dash-v2__grid">
        {topStats.map((stat, idx) => (
          <div key={idx} className="dash-v2__card">
            <div className="dash-v2__stat-label">{stat.label}</div>
            <div className="dash-v2__stat-value">{stat.value}</div>
            <div className={`dash-v2__stat-trend ${stat.isUp === true ? 'trend--up' : stat.isUp === false ? 'trend--down' : 'trend--neutral'}`}>
              {stat.isUp === true ? <ArrowUpOutlined /> : stat.isUp === false ? <ArrowDownOutlined /> : null}
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-v2__section">
        <div className="dash-v2__section-header">
          <h2 className="dash-v2__section-title">核心指标监控</h2>
          <span className="dash-v2__section-action">查看完整报表 →</span>
        </div>
        
        <div className="dash-v2__table-wrapper">
          <div className="dash-v2__row" style={{ fontWeight: 600, color: 'var(--v2-text-3)', fontSize: '12px' }}>
            <div className="dash-v2__cell">指标名称</div>
            <div className="dash-v2__cell">部门</div>
            <div className="dash-v2__cell number">目标值</div>
            <div className="dash-v2__cell number">实际值</div>
            <div className="dash-v2__cell">近6月趋势</div>
          </div>
          
          {priorityIndicators.map((item) => {
             // Get latest actual value
             const actuals = item.monthlyActual?.filter(v => v !== null && v !== undefined) || [];
             const latestVal = actuals.length > 0 ? actuals[actuals.length - 1] : '-';
             
             // Mock trend data for visualization if not enough points
             const trendData = actuals.length >= 6 ? actuals.slice(-6) : [82, 90, 85, 95, 92, 98];

             return (
              <div key={item.id} className="dash-v2__row">
                <div className="dash-v2__cell main-col">
                  <span>{item.name}</span>
                  <span className="dash-v2__cell-sub">{item.id}</span>
                </div>
                <div className="dash-v2__cell">
                  <span style={{background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>
                    {item.department}
                  </span>
                </div>
                <div className="dash-v2__cell number">{item.totalTarget || item.monthlyTarget?.[0]}</div>
                <div className="dash-v2__cell number" style={{ color: '#fff' }}>
                  <span className={`dash-v2__status-dot status--green`}></span>
                  {latestVal}
                </div>
                <div className="dash-v2__cell">
                   <MiniChart data={trendData} color="#4ade80" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardV2;
