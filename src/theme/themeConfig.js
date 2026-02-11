/**
 * Ant Design 主题配置
 * IMS Executive Grade 3.0 — Modern Emerald Theme
 */

const themeConfig = {
    token: {
        // 品牌色 — Emerald 600
        colorPrimary: '#059669',
        colorSuccess: '#10b981',
        colorWarning: '#f59e0b',
        colorError: '#ef4444',
        colorInfo: '#3b82f6',

        // 布局
        borderRadius: 8,
        wireframe: false,

        // 字体
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontSizeHeading1: 28,
        fontSizeHeading2: 22,
        fontSizeHeading3: 16,

        // 背景
        colorBgLayout: '#f1f5f9',
        colorBgContainer: '#ffffff',

        // 文字
        colorText: '#0f172a',
        colorTextSecondary: '#475569',
        colorTextTertiary: '#94a3b8',
        colorTextQuaternary: '#cbd5e1',

        // 边框
        colorBorderSecondary: '#f1f5f9',
        colorBorder: '#e2e8f0',

        // 圆角
        borderRadiusLG: 12,
        borderRadiusSM: 6,
    },
    components: {
        Button: {
            borderRadius: 8,
            controlHeight: 36,
            fontWeight: 600,
        },
        Card: {
            borderRadiusLG: 12,
        },
        Table: {
            borderRadiusLG: 12,
            headerBg: '#f8fafc',
            headerColor: '#94a3b8',
            headerSplitColor: 'transparent',
            rowHoverBg: '#f8fafc',
        },
        Layout: {
            siderBg: '#0f172a',
            headerBg: 'rgba(255,255,255,0.85)',
        },
        Statistic: {
            titleFontSize: 13,
            contentFontSize: 24,
        },
        Select: {
            borderRadius: 8,
        },
        Input: {
            borderRadius: 8,
        },
        Modal: {
            borderRadiusLG: 16,
        },
    },
};

export default themeConfig;
