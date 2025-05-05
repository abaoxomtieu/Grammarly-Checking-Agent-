import { ThemeConfig } from 'antd';

// Ant Design theme customization
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#0da2e7', // Primary color (primary-500)
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#0da2e7',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      paddingContentHorizontal: 24,
      borderRadius: 8,
      borderRadiusLG: 10,
      primaryShadow: '0 6px 16px -2px rgba(13, 162, 231, 0.25)', // primary-500 with transparency
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      borderRadius: 8,
      borderRadiusLG: 10,
      paddingContentHorizontal: 16,
    },
    Tabs: {
      cardGutter: 6,
      horizontalItemGutter: 12,
      horizontalMargin: '12px 0',
      titleFontSize: 16,
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
  },
};

export default theme; 