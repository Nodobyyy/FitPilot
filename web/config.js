/**
 * FitPilot API配置文件
 * ============================================
 * 在部署到服务器前，请根据实际后端地址修改以下配置
 */

const API_CONFIG = {
    // ============================================
    // 【必须修改】后端API根地址
    // ============================================
    // 开发环境示例: 'http://localhost:3000/api'
    // 生产环境示例: 'https://api.fitpilot.com/api' 或 'https://your-domain.com/api'
    baseURL: 'http://localhost:3000/api',
    
    // ============================================
    // 【可选】API超时设置（单位：毫秒）
    // ============================================
    timeout: 10000,
    
    // ============================================
    // 【可选】是否启用请求日志
    // ============================================
    enableLogging: true
};

/**
 * API端点常量定义
 * 注：这些是预期的端点，请确保后端API提供这些接口
 */
const API_ENDPOINTS = {
    // 用户认证相关
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        refresh: '/auth/refresh'
    },
    
    // 用户信息相关
    user: {
        profile: '/user/profile',
        updateProfile: '/user/profile',
        settings: '/user/settings'
    },
    
    // 体征数据相关
    vitals: {
        list: '/vitals/list',
        create: '/vitals/create',
        update: '/vitals/:id',
        delete: '/vitals/:id',
        getStats: '/vitals/stats'
    },
    
    // 饮食记录相关
    diet: {
        list: '/diet/list',
        create: '/diet/create',
        update: '/diet/:id',
        delete: '/diet/:id',
        recognize: '/diet/recognize-food',  // 拍照识餐
        getSummary: '/diet/summary'
    },
    
    // 运动记录相关
    exercise: {
        list: '/exercise/list',
        create: '/exercise/create',
        update: '/exercise/:id',
        delete: '/exercise/:id',
        getProgress: '/exercise/progress'
    },
    
    // AI分析相关
    ai: {
        dailyAnalysis: '/ai/daily-analysis',
        nutritionRecommend: '/ai/nutrition-recommend',
        exerciseStrategy: '/ai/exercise-strategy',
        goalPrediction: '/ai/goal-prediction'
    },
    
    // 目标管理相关
    goals: {
        list: '/goals/list',
        create: '/goals/create',
        update: '/goals/:id',
        delete: '/goals/:id',
        getProgress: '/goals/progress'
    },
    
    // 仪表板数据
    dashboard: {
        overview: '/dashboard/overview',
        charts: '/dashboard/charts'
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, API_ENDPOINTS };
}
