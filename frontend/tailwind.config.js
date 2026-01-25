/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 飞书风格主题色 + 土木工程元素
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',  // 工业蓝
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        engineering: {
          steel: '#71717A',      // 钢筋灰
          concrete: '#A1A1AA',   // 混凝土色
          safety: '#F59E0B',     // 安全橙
          helmet: '#FBBF24',     // 安全帽黄
          blueprint: '#06B6D4',  // 图纸蓝
        },
        status: {
          cash: '#10B981',     // 绿色 - 现金
          health: '#EF4444',   // 红色 - 健康
          reputation: '#F59E0B', // 橙色 - 声誉
          progress: '#3B82F6', // 蓝色 - 进度
          quality: '#8B5CF6',  // 紫色 - 质量
        }
      },
      boxShadow: {
        'feishu': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        'feishu-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'feishu-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'feishu': '8px',
        'feishu-lg': '12px',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
