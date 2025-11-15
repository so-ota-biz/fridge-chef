import { MantineColorsTuple, createTheme } from '@mantine/core'

/**
 * カスタムカラーパレット
 * デザインファイルに基づいて後ほど調整
 */
const primaryColor: MantineColorsTuple = [
  '#fff4e6',
  '#ffe8cc',
  '#ffd8a8',
  '#ffc078',
  '#ffa94d',
  '#ff922b', // メインカラー
  '#fd7e14',
  '#f76707',
  '#e8590c',
  '#d9480f',
]

/**
 * Mantineテーマ設定
 */
export const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    orange: primaryColor,
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },
})
