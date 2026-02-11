# Test Cases: IMS Core Features

## Overview
- **Feature**: 核心指标管理与目标录入
- **Requirements Source**: 指标管理系统（IMS）产品需求文档（PRD）.md
- **Test Coverage**: 覆盖 P0 级核心业务流程
- **Last Updated**: 2026-02-06

## Test Case Categories

### 1. 指标字典管理 (Indicator Management)

#### TC-F-001: 新增指标-正常流程
- **Requirement**: 支持 7 大类属性配置，提交后进入待审批状态
- **Priority**: High
- **Preconditions**:
  - 用户已登录
  - 进入“指标字典”页面
- **Test Steps**:
  1. 点击“新增指标”按钮，打开抽屉
  2. 填写必填项：指标名称="测试指标_001"、部门="销售部"、责任人="测试员"
  3. 填写业务属性：层级="部门级"、公式="A+B"、口径="测试口径"
  4. 填写数据属性：来源="手工"、类型="正向"
  5. 点击“提交”按钮
- **Expected Results**:
  - 抽屉关闭，提示“创建成功”
  - 列表第一项出现“测试指标_001”
  - 状态显示为“待审批”

#### TC-E-001: 新增指标-表单校验
- **Priority**: Medium
- **Test Steps**:
  1. 点击“新增指标”
  2. 直接点击“提交”
- **Expected Results**:
  - 必填项（名称、部门、责任人等）下方出现红色错误提示
  - 表单不提交

### 2. 目标管理 (Target Management)

#### TC-F-002: 目标录入-月度拆解
- **Requirement**: 支持按月拆解目标值
- **Priority**: High
- **Preconditions**:
  - 指标处于“填报中”状态
- **Test Steps**:
  1. 在目标管理列表找到未锁定的指标
  2. 点击“录入”按钮，打开弹窗
  3. 输入年度目标 "1200"
  4. 选择“月度拆解”
  5. 输入 1月="100", 2月="100"
  6. 点击“提交审批”
- **Expected Results**:
  - 弹窗关闭，提示“录入成功”
  - 列表该指标状态变为“已锁定”
  - 操作按钮变为“查看”

### 3. Dashboard 交互

#### TC-F-003: 视图切换
- **Priority**: Low
- **Test Steps**:
  1. 点击驾驶舱顶部的“公司级”胶囊按钮
  2. 点击“部门级”胶囊按钮
- **Expected Results**:
  - 列表数据动态刷新
  - 指标层级列仅显示当前选中的层级
