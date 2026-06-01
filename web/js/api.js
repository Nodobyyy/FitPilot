/**
 * FitPilot API客户端
 * 负责所有与后端的通信
 */

class APIClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'http://localhost:3000/api';
        this.timeout = config.timeout || 10000;
        this.enableLogging = config.enableLogging !== false;
    }

    /**
     * 发送HTTP请求的核心方法
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('authToken');
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fetchOptions = {
            method,
            headers,
            timeout: this.timeout,
            ...options
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            fetchOptions.body = JSON.stringify(data);
        }

        if (this.enableLogging) {
            console.log(`[API] ${method} ${endpoint}`, data);
        }

        try {
            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                // 处理401未授权
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    window.location.href = '/login.html';
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            
            if (this.enableLogging) {
                console.log(`[API] Response:`, result);
            }

            return result;
        } catch (error) {
            console.error(`[API Error] ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    // GET请求
    get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    // POST请求
    post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    // PUT请求
    put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    // DELETE请求
    delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    // ============================================
    // 【用户认证】
    // ============================================
    
    login(email, password) {
        return this.post('/auth/login', { email, password });
    }

    register(email, password, name) {
        return this.post('/auth/register', { email, password, name });
    }

    logout() {
        return this.post('/auth/logout', {}).then(() => {
            localStorage.removeItem('authToken');
        });
    }

    // ============================================
    // 【用户信息】
    // ============================================
    
    getUserProfile() {
        return this.get('/user/profile');
    }

    updateUserProfile(profileData) {
        return this.put('/user/profile', profileData);
    }

    // ============================================
    // 【体征数据】
    // ============================================
    
    getVitalsList(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/vitals/list${query ? '?' + query : ''}`);
    }

    createVitals(vitalsData) {
        return this.post('/vitals/create', vitalsData);
    }

    updateVitals(id, vitalsData) {
        return this.put(`/vitals/${id}`, vitalsData);
    }

    deleteVitals(id) {
        return this.delete(`/vitals/${id}`);
    }

    getVitalsStats(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/vitals/stats${query ? '?' + query : ''}`);
    }

    // ============================================
    // 【饮食记录】
    // ============================================
    
    getDietList(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/diet/list${query ? '?' + query : ''}`);
    }

    createDiet(dietData) {
        return this.post('/diet/create', dietData);
    }

    updateDiet(id, dietData) {
        return this.put(`/diet/${id}`, dietData);
    }

    deleteDiet(id) {
        return this.delete(`/diet/${id}`);
    }

    // AI拍照识餐
    recognizeFood(imageBase64) {
        return this.post('/diet/recognize-food', { image: imageBase64 });
    }

    getDietSummary(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/diet/summary${query ? '?' + query : ''}`);
    }

    // ============================================
    // 【运动记录】
    // ============================================
    
    getExerciseList(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/exercise/list${query ? '?' + query : ''}`);
    }

    createExercise(exerciseData) {
        return this.post('/exercise/create', exerciseData);
    }

    updateExercise(id, exerciseData) {
        return this.put(`/exercise/${id}`, exerciseData);
    }

    deleteExercise(id) {
        return this.delete(`/exercise/${id}`);
    }

    getExerciseProgress(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/exercise/progress${query ? '?' + query : ''}`);
    }

    // ============================================
    // 【AI分析】
    // ============================================
    
    getDailyAnalysis(date) {
        return this.get(`/ai/daily-analysis?date=${date}`);
    }

    getNutritionRecommend() {
        return this.get('/ai/nutrition-recommend');
    }

    getExerciseStrategy() {
        return this.get('/ai/exercise-strategy');
    }

    getGoalPrediction(goalId) {
        return this.get(`/ai/goal-prediction?goalId=${goalId}`);
    }

    // ============================================
    // 【目标管理】
    // ============================================
    
    getGoalsList() {
        return this.get('/goals/list');
    }

    createGoal(goalData) {
        return this.post('/goals/create', goalData);
    }

    updateGoal(id, goalData) {
        return this.put(`/goals/${id}`, goalData);
    }

    deleteGoal(id) {
        return this.delete(`/goals/${id}`);
    }

    getGoalProgress(goalId) {
        return this.get(`/goals/progress?goalId=${goalId}`);
    }

    // ============================================
    // 【仪表板】
    // ============================================
    
    getDashboardOverview() {
        return this.get('/dashboard/overview');
    }

    getDashboardCharts() {
        return this.get('/dashboard/charts');
    }
}

// 创建全局API客户端实例
const api = new APIClient(API_CONFIG);
