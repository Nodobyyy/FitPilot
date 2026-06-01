/**
 * FitPilot 主应用逻辑
 */

class FitPilotApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = null;
        this.vitals = [];
        this.diet = [];
        this.exercises = [];
        this.goals = [];
        this.aiConfig = {
            apiUrl: '',
            apiKey: '',
            modelName: ''
        };
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        this.setupEventListeners();
        this.setTodayDate();
        await this.loadMockData();
        this.showPage('dashboard');
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 导航链接
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.switchPage(page);
            });
        });

        // 退出按钮
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // ============================================
        // 体征管理
        // ============================================
        document.getElementById('addVitalBtn').addEventListener('click', () => {
            this.openModal('vitalModal');
        });

        document.getElementById('vitalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveVital();
        });

        document.getElementById('cameraBtnVitals').addEventListener('click', () => {
            this.toggleCameraSectionVitals();
        });

        document.getElementById('vitalsImageInput').addEventListener('change', (e) => {
            this.handleVitalsImageUpload(e);
        });

        document.getElementById('recognizeVitalsBtn').addEventListener('click', () => {
            this.recognizeVitals();
        });

        // ============================================
        // 饮食管理
        // ============================================
        document.getElementById('addDietBtn').addEventListener('click', () => {
            this.openModal('dietModal');
        });

        document.getElementById('cameraBtn').addEventListener('click', () => {
            this.toggleCameraSection();
        });

        document.getElementById('dietImageInput').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        document.getElementById('recognizeFoodBtn').addEventListener('click', () => {
            this.recognizeFood();
        });

        document.getElementById('dietForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDiet();
        });

        // ============================================
        // 运动管理
        // ============================================
        document.getElementById('addExerciseBtn').addEventListener('click', () => {
            this.openModal('exerciseModal');
        });

        document.getElementById('cameraBtnExercise').addEventListener('click', () => {
            this.toggleCameraSectionExercise();
        });

        document.getElementById('exerciseImageInput').addEventListener('change', (e) => {
            this.handleExerciseImageUpload(e);
        });

        document.getElementById('recognizeExerciseBtn').addEventListener('click', () => {
            this.recognizeExercise();
        });

        document.getElementById('exerciseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExercise();
        });

        // ============================================
        // 目标管理
        // ============================================
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            if (this.goals.length > 0) {
                this.editGoal(0);
            } else {
                this.openModal('goalModal');
            }
        });

        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGoal();
        });

        // 设置今天的日期
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }

    /**
     * 切换页面
     */
    switchPage(pageName) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示新页面
        const newPage = document.getElementById(pageName + 'Page');
        if (newPage) {
            newPage.classList.add('active');
        }

        // 更新导航菜单
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });

        // 加载页面数据
        this.loadPageData(pageName);
    }

    /**
     * 页面切换时的别名处理
     */
    showPage(pageName) {
        const pageId = pageName + 'Page';
        this.switchPage(pageName);
    }

    /**
     * 根据页面加载相应数据
     */
    loadPageData(pageName) {
        this.currentPage = pageName;
        
        switch (pageName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'vitals':
                this.loadVitalsPage();
                break;
            case 'diet':
                this.loadDietPage();
                break;
            case 'exercise':
                this.loadExercisePage();
                break;
            case 'goals':
                this.loadGoalsPage();
                break;
            case 'analysis':
                this.loadAnalysisPage();
                break;
        }
    }

    /**
     * 【仪表板】加载数据
     */
    loadDashboard() {
        // 刷新健康推荐
        this.refreshHealthTip();

        // 使用mock数据演示，实际应从API获取
        // 调用 api.getDashboardOverview() 获取数据

        // 显示用户信息
        document.getElementById('userName').textContent = 'Demo用户';

        // 显示统计数据
        if (this.vitals.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const todayVital = this.vitals.find(v => v.recordDate === today);
            const latestVital = this.vitals[0];

            if (todayVital) {
                document.getElementById('currentWeight').innerHTML = `${todayVital.weight} kg <small style="font-size: 0.8rem; color: var(--text-muted);">今日</small>`;
                document.getElementById('muscleMass').textContent = todayVital.muscleMass ? todayVital.muscleMass + ' kg' : '---';
            } else {
                document.getElementById('currentWeight').innerHTML = `<span style="font-size: 1.2rem;">今日未测</span> <br><small style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">上次记录: ${latestVital.weight}kg</small>`;
                document.getElementById('muscleMass').textContent = '---';
            }

            if (this.vitals.length > 1) {
                const prevVital = this.vitals[1];
                const weightDiff = latestVital.weight - prevVital.weight;
                const muscleDiff = latestVital.muscleMass - prevVital.muscleMass;
                
                document.getElementById('weightTrend').textContent = 
                    weightDiff > 0 ? `↑ ${weightDiff.toFixed(1)} kg` : (weightDiff < 0 ? `↓ ${Math.abs(weightDiff).toFixed(1)} kg` : '持平');
                document.getElementById('muscleTrend').textContent = 
                    muscleDiff > 0 ? `↑ ${muscleDiff.toFixed(1)} kg` : (muscleDiff < 0 ? `↓ ${Math.abs(muscleDiff).toFixed(1)} kg` : '持平');
            }
        }

        // 计算今日消耗和摄入
        const today = new Date().toISOString().split('T')[0];
        const todayExercises = this.exercises.filter(e => e.exerciseDate === today);
        const todayDiet = this.diet.filter(d => d.mealTime.startsWith(today));

        const totalBurned = todayExercises.reduce((sum, e) => sum + (parseFloat(e.caloriesBurned) || 0), 0);
        const totalIntake = todayDiet.reduce((sum, d) => sum + (parseFloat(d.calories) || 0), 0);

        document.getElementById('todayCaloriesBurned').textContent = Math.round(totalBurned) + ' kcal';
        document.getElementById('todayCaloriesIntake').textContent = Math.round(totalIntake) + ' kcal';

        // 动态计算目标
        let targetIntake = 2000;
        let targetBurn = 500;
        const currentGoal = this.goals.length > 0 ? this.goals[0] : null;
        const currentVital = this.vitals.length > 0 ? this.vitals[0] : null;
        
        if (currentVital && currentVital.bmr) {
            const bmr = parseFloat(currentVital.bmr);
            if (currentGoal && currentGoal.goalType) {
                if (currentGoal.goalType === 'fat-loss') {
                    targetIntake = Math.round(bmr - 300);
                    targetBurn = 500;
                } else if (currentGoal.goalType === 'muscle-gain') {
                    targetIntake = Math.round(bmr + 300);
                    targetBurn = 300;
                } else {
                    targetIntake = Math.round(bmr);
                    targetBurn = 400;
                }
            } else {
                targetIntake = Math.round(bmr);
            }
        }
        
        const intakeDisplay = document.getElementById('intakeTargetDisplay');
        const burnDisplay = document.getElementById('burnTargetDisplay');
        if (intakeDisplay) intakeDisplay.textContent = `目标: ${targetIntake} kcal`;
        if (burnDisplay) burnDisplay.textContent = `目标: ${targetBurn} kcal`;

        // 绘制图表
        this.drawWeightChart();
        this.drawCaloriesChart();
    }

    /**
     * 刷新每日健康推荐
     */
    refreshHealthTip() {
        try {
            const tipContent = document.getElementById('healthTipContent');
            if (typeof healthTips !== 'undefined' && healthTips.length > 0) {
                let randomIndex = Math.floor(Math.random() * healthTips.length);
                if (tipContent) {
                    // 确保不会连续随机到同一条数据
                    if (healthTips.length > 1) {
                        while (healthTips[randomIndex] === tipContent.textContent) {
                            randomIndex = Math.floor(Math.random() * healthTips.length);
                        }
                    }
                    
                    // 淡出淡入动画效果
                    tipContent.style.opacity = 0;
                    setTimeout(() => {
                        tipContent.textContent = healthTips[randomIndex];
                        tipContent.style.opacity = 1;
                    }, 200);
                }
            } else {
                console.warn('healthTips array is not defined or empty.');
                if (tipContent) {
                    tipContent.textContent = '暂无健康推荐数据，请刷新重试';
                }
            }
        } catch (error) {
            console.error('Error refreshing health tip:', error);
        }
    }

    /**
     * 【体征管理】加载页面
     */
    loadVitalsPage() {
        this.refreshVitalsTable();
    }

    /**
     * 刷新体征表格
     */
    refreshVitalsTable() {
        const tbody = document.querySelector('#vitalsList tbody');
        tbody.innerHTML = '';

        if (this.vitals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">暂无数据</td></tr>';
            this.drawVitalsCharts();
            return;
        }

        this.vitals.forEach((vital, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vital.recordDate}</td>
                <td>${vital.weight}</td>
                <td>${vital.bodyFatRate || '---'}</td>
                <td>${vital.muscleMass || '---'}</td>
                <td>${vital.bmr || '---'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="app.editVital(${index})">✏️ 编辑</button>
                        <button class="btn-danger" onclick="app.deleteVital(${index})">🗑️ 删除</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.drawVitalsCharts();
    }

    /**
     * 绘制体征趋势图表
     */
    drawVitalsCharts() {
        if (!document.getElementById('vitalsWeightChart')) return;
        
        // 1. Destroy existing charts if they exist
        if (this.vitalsWeightChart) this.vitalsWeightChart.destroy();
        if (this.vitalsFatChart) this.vitalsFatChart.destroy();
        if (this.vitalsMuscleChart) this.vitalsMuscleChart.destroy();
        if (this.vitalsBmrChart) this.vitalsBmrChart.destroy();

        // 2. Prepare data (Sort by date ascending)
        let sortedVitals = [...this.vitals].sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate));
        
        // 只保留最近 10 次记录
        if (sortedVitals.length > 10) {
            sortedVitals = sortedVitals.slice(sortedVitals.length - 10);
        }
        
        const labels = [];
        const weightData = [];
        const fatData = [];
        const muscleData = [];
        const skeletalData = [];
        const bmrData = [];

        sortedVitals.forEach(v => {
            labels.push(v.recordDate.substring(5)); // Show MM-DD
            weightData.push(v.weight || null);
            fatData.push(v.bodyFatRate || null);
            muscleData.push(v.muscleMass || null);
            skeletalData.push(v.skeletalMuscle || null);
            bmrData.push(v.bmr || null);
        });

        // Helper to create chart
        const createLineChart = (ctxId, label, data, borderColor, bgColor, extraDataset = null, yStepSize = null) => {
            const ctx = document.getElementById(ctxId);
            if (!ctx) return null;
            
            const datasets = [{
                label: label,
                data: data,
                borderColor: borderColor,
                backgroundColor: bgColor,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: borderColor,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }];

            if (extraDataset) {
                datasets.push(extraDataset);
            }

            return new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: extraDataset !== null, position: 'top' },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#1e293b',
                            bodyColor: '#475569',
                            borderColor: '#e2e8f0',
                            borderWidth: 1,
                            padding: 10,
                            boxPadding: 4,
                            usePointStyle: true,
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: { 
                            grid: { color: 'rgba(0,0,0,0.03)' }, 
                            beginAtZero: false,
                            ...(yStepSize ? { ticks: { stepSize: yStepSize } } : {})
                        }
                    },
                    interaction: { mode: 'index', intersect: false }
                }
            });
        };

        // 3. Draw charts using the theme colors
        // Weight - Sky Blue
        this.vitalsWeightChart = createLineChart('vitalsWeightChart', '体重 (kg)', weightData, '#0ea5e9', 'rgba(14, 165, 233, 0.1)');
        
        // Body Fat - Amber
        this.vitalsFatChart = createLineChart('vitalsFatChart', '体脂率 (%)', fatData, '#f59e0b', 'rgba(245, 158, 11, 0.1)');
        
        // Muscle - Violet Purple
        const skeletalDataset = {
            label: '骨骼肌 (kg)',
            data: skeletalData,
            borderColor: '#c4b5fd',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#c4b5fd',
            pointRadius: 3
        };
        this.vitalsMuscleChart = createLineChart('vitalsMuscleChart', '肌肉量 (kg)', muscleData, '#8b5cf6', 'rgba(139, 92, 246, 0.1)', skeletalDataset, 0.5);
        
        // BMR - Rose Red
        this.vitalsBmrChart = createLineChart('vitalsBmrChart', '基础代谢 (kcal)', bmrData, '#e11d48', 'rgba(225, 29, 72, 0.1)');
    }

    /**
     * 【饮食管理】加载页面
     */
    loadDietPage() {
        this.refreshDietTable();
        this.updateNutritionSummary();
    }

    /**
     * 获取中文三餐类别
     */
    getMealTypeLabel(type) {
        if (!type) return '---';
        const typeStr = type.toString().toLowerCase();
        if (typeStr.includes('breakfast')) return '早餐';
        if (typeStr.includes('lunch')) return '午餐';
        if (typeStr.includes('dinner')) return '晚餐';
        if (typeStr.includes('snack')) return '零食/加餐';
        return type;
    }

    /**
     * 刷新饮食表格
     */
    refreshDietTable() {
        const container = document.getElementById('dietContainer');
        if (!container) return;
        container.innerHTML = '';

        if (this.diet.length === 0) {
            container.innerHTML = '<div class="data-table"><p class="text-center text-muted" style="padding: 2rem; text-align: center;">暂无数据</p></div>';
            return;
        }

        // 按照日期分组
        const groups = {};
        this.diet.forEach((item, index) => {
            const dtParts = item.mealTime.split(/[T ]/);
            const dateStr = dtParts[0];
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push({ ...item, originalIndex: index });
        });

        // 排序日期（降序）
        const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

        sortedDates.forEach(date => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'diet-day-group';
            groupDiv.style.marginBottom = '2rem';
            
            const dayTotal = groups[date].reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0);
            
            let html = `
                <div class="diet-day-header" style="display: flex; justify-content: space-between; background: var(--glass-bg); padding: 1rem 1.5rem; border-radius: 16px 16px 0 0; border: 1px solid var(--glass-border); border-bottom: none;">
                    <h4 style="margin: 0; color: var(--dark-color);">📅 ${date}</h4>
                    <span class="diet-day-total" style="color: var(--primary-color); font-weight: 700;">总计: ${Math.round(dayTotal)} kcal</span>
                </div>
                <div class="data-table" style="margin-top: 0; border-radius: 0 0 16px 16px; border-top: none;">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 12%;">时间</th>
                                <th style="width: 25%;">食物</th>
                                <th style="width: 15%;">分量</th>
                                <th style="width: 15%;">热量(kcal)</th>
                                <th style="width: 13%;">类型</th>
                                <th style="width: 20%;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            groups[date].forEach(item => {
                const dtParts = item.mealTime.split(/[T ]/);
                let timeStr = dtParts[1] || '';
                if (timeStr.includes('.')) timeStr = timeStr.split('.')[0]; // 移除毫秒
                if (timeStr.split(':').length >= 2) {
                    const timeParts = timeStr.split(':');
                    timeStr = `${timeParts[0]}:${timeParts[1]}`; // 提取 HH:mm
                }
                if (!timeStr) timeStr = item.mealTime; // fallback
                
                const mealTypeChinese = this.getMealTypeLabel(item.mealType || '---');
                
                html += `
                    <tr>
                        <td>${timeStr}</td>
                        <td>${item.foodName}</td>
                        <td>${item.amount}</td>
                        <td><strong style="color: var(--primary-color)">${item.calories}</strong></td>
                        <td><span class="meal-type-badge">${mealTypeChinese}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-edit" onclick="app.editDiet(${item.originalIndex})">✏️ 编辑</button>
                                <button class="btn-danger" onclick="app.deleteDiet(${item.originalIndex})">🗑️ 删除</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
            groupDiv.innerHTML = html;
            container.appendChild(groupDiv);
        });
    }

    /**
     * 更新营养摘要
     */
    updateNutritionSummary() {
        const today = new Date().toISOString().split('T')[0];
        const todayDiet = this.diet.filter(d => d.mealTime.startsWith(today));

        const totalCalories = todayDiet.reduce((sum, d) => sum + (parseFloat(d.calories) || 0), 0);
        const totalProtein = todayDiet.reduce((sum, d) => sum + (parseFloat(d.protein) || 0), 0);
        const totalCarbs = todayDiet.reduce((sum, d) => sum + (parseFloat(d.carbs) || 0), 0);
        const totalFat = todayDiet.reduce((sum, d) => sum + (parseFloat(d.fat) || 0), 0);

        document.getElementById('totalCalories').textContent = Math.round(totalCalories) + ' kcal';
        document.getElementById('totalProtein').textContent = Math.round(totalProtein) + ' g';
        document.getElementById('totalCarbs').textContent = Math.round(totalCarbs) + ' g';
        document.getElementById('totalFat').textContent = Math.round(totalFat) + ' g';

        // 绘制营养环形图
        if (this.nutritionChart) {
            this.nutritionChart.destroy();
        }
        
        const ctx = document.getElementById('nutritionChart');
        if (ctx) {
            this.nutritionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['蛋白质 (g)', '碳水 (g)', '脂肪 (g)'],
                    datasets: [{
                        data: [Math.round(totalProtein), Math.round(totalCarbs), Math.round(totalFat)],
                        backgroundColor: ['#0EA5E9', '#10B981', '#F59E0B'],
                        borderWidth: 2,
                        borderColor: 'white'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        }
    }

    /**
     * 【运动管理】加载页面
     */
    loadExercisePage() {
        this.refreshExerciseTable();
        this.updateExerciseStats();
    }

    /**
     * 获取中文运动项目
     */
    getExerciseTypeLabel(type) {
        if (!type) return '---';
        const map = {
            'running': '跑步',
            'walking': '散步',
            'cycling': '骑行',
            'gym': '健身房/力量训练',
            'yoga': '瑜伽',
            'swimming': '游泳',
            'hiit': 'HIIT',
            'jump-rope': '跳绳',
            'pilates': '普拉提',
            'hiking': '爬山/徒步',
            'basketball': '篮球',
            'badminton': '羽毛球',
            'other': '其他'
        };
        return map[type] || type;
    }

    /**
     * 获取中文运动强度
     */
    getIntensityLabel(intensity) {
        if (!intensity) return '---';
        const map = {
            'low': '低强度',
            'medium': '中等强度',
            'high': '高强度'
        };
        return map[intensity] || intensity;
    }

    /**
     * 刷新运动表格
     */
    refreshExerciseTable() {
        const tbody = document.querySelector('#exerciseList tbody');
        tbody.innerHTML = '';

        if (this.exercises.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">暂无数据</td></tr>';
            return;
        }

        this.exercises.forEach((exercise, index) => {
            const row = document.createElement('tr');
            const typeLabel = this.getExerciseTypeLabel(exercise.exerciseType);
            const intensityLabel = this.getIntensityLabel(exercise.intensity);

            row.innerHTML = `
                <td>${exercise.exerciseDate}</td>
                <td><span class="meal-type-badge" style="background: rgba(81, 207, 102, 0.1); color: var(--success-color);">${typeLabel}</span></td>
                <td>${intensityLabel}</td>
                <td>${exercise.duration} 分钟</td>
                <td><strong style="color: var(--primary-color)">${exercise.caloriesBurned}</strong></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="app.editExercise(${index})">✏️ 编辑</button>
                        <button class="btn-danger" onclick="app.deleteExercise(${index})">🗑️ 删除</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * 更新运动统计
     */
    updateExerciseStats() {
        const today = new Date();
        // 计算本周一的日期 (0是周日)
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diffToMonday);

        const labels = [];
        const durationData = [];
        const caloriesData = [];
        let totalExercises = 0;
        let totalDuration = 0;
        let totalBurned = 0;

        // 构建本周一到周日的图表数据
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            
            // 获取本地时区的 YYYY-MM-DD
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            labels.push(`${month}-${day}`); // MM-DD
            
            const dayExercises = this.exercises.filter(e => e.exerciseDate === dateStr);
            const dayDuration = dayExercises.reduce((sum, e) => sum + (parseFloat(e.duration) || 0), 0);
            const dayBurned = dayExercises.reduce((sum, e) => sum + (parseFloat(e.caloriesBurned) || 0), 0);
            
            durationData.push(dayDuration);
            caloriesData.push(dayBurned);
            
            totalExercises += dayExercises.length;
            totalDuration += dayDuration;
            totalBurned += dayBurned;
        }

        document.getElementById('totalExercises').innerHTML = `${totalExercises} <span style="font-size: 1rem; color: #818cf8;">次</span>`;
        document.getElementById('totalDuration').innerHTML = `${totalDuration} <span style="font-size: 1rem; color: #4ade80;">分钟</span>`;
        document.getElementById('totalBurned').innerHTML = `${totalBurned} <span style="font-size: 1rem; color: #fb923c;">kcal</span>`;

        if (this.weeklyExerciseChart) {
            this.weeklyExerciseChart.destroy();
        }

        const ctx = document.getElementById('weeklyExerciseChart');
        if (ctx) {
            this.weeklyExerciseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: '运动时长 (分钟)',
                            data: durationData,
                            backgroundColor: '#10B981',
                            borderRadius: 4
                        },
                        {
                            label: '消耗热量 (kcal)',
                            data: caloriesData,
                            backgroundColor: '#F43F5E',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }

    /**
     * 【目标追踪】加载页面
     */
    loadGoalsPage() {
        this.refreshGoalsDisplay();
    }

    /**
     * 刷新目标显示
     */
    refreshGoalsDisplay() {
        const container = document.getElementById('goalsList');
        container.innerHTML = '';

        if (this.goals.length === 0) {
            container.innerHTML = `
                <div class="empty-goal-state">
                    <div class="empty-icon">🎯</div>
                    <h3>您还没有设定健康目标</h3>
                    <p>设定一个明确的目标，FitPilot将帮助您规划达成路径。</p>
                </div>
            `;
            document.getElementById('addGoalBtn').textContent = '🎯 设定新目标';
            return;
        }

        document.getElementById('addGoalBtn').textContent = '✏️ 修改当前目标';

        const goal = this.goals[0]; // 仅使用第一个目标
        const index = 0;

        // 1. Dynamic sync from Vitals (Weight)
        let initialVal = goal.currentValue; // When created, this was the initial value
        let currentVal = initialVal;
        
        if ((goal.goalType === 'weight-loss' || goal.goalType === 'weight-gain') && this.vitals.length > 0) {
            // Get the most recent weight
            const sortedVitals = [...this.vitals].sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
            if (sortedVitals[0].weight) {
                currentVal = parseFloat(sortedVitals[0].weight);
            }
        }

        const targetVal = goal.targetValue;
        
        // 2. Calculate Progress Percentage
        let progressPercentage = 0;
        if (goal.goalType === 'weight-loss') {
            if (currentVal <= targetVal) progressPercentage = 100;
            else if (currentVal >= initialVal) progressPercentage = 0;
            else progressPercentage = ((initialVal - currentVal) / (initialVal - targetVal)) * 100;
        } else {
            if (currentVal >= targetVal) progressPercentage = 100;
            else if (currentVal <= initialVal) progressPercentage = 0;
            else progressPercentage = ((currentVal - initialVal) / (targetVal - initialVal)) * 100;
        }
        progressPercentage = Math.min(100, Math.max(0, progressPercentage));

        // 3. Rich Metrics
        const diff = Math.abs(currentVal - targetVal).toFixed(1);
        let paceText = '---';
        let daysLeftText = '---';
        
        if (goal.targetDate) {
            const today = new Date();
            const targetDateObj = new Date(goal.targetDate);
            const timeDiff = targetDateObj - today;
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysLeft < 0) {
                daysLeftText = `已过期 ${Math.abs(daysLeft)} 天`;
            } else if (daysLeft === 0) {
                daysLeftText = '今天到期';
            } else {
                daysLeftText = `剩余 ${daysLeft} 天`;
                const weeksLeft = daysLeft / 7;
                if (progressPercentage < 100 && weeksLeft > 0) {
                    const pace = (diff / weeksLeft).toFixed(2);
                    paceText = `需改变 ${pace} ${goal.unit}/周`;
                }
            }
        }
        
        if (progressPercentage >= 100) {
            paceText = '已达成目标！';
        }

        // 4. Render Layout
        const card = document.createElement('div');
        card.className = 'goal-card premium-card';
        card.innerHTML = `
            <div class="goal-header-premium">
                <div class="goal-title-wrap">
                    <span class="goal-emoji">${goal.goalType === 'weight-loss' ? '📉' : '📈'}</span>
                    <div>
                        <span class="goal-type-badge">${this.getGoalTypeLabel(goal.goalType)}</span>
                        <h4>${goal.description || '我的健身目标'}</h4>
                    </div>
                </div>
                <div class="goal-deadline">
                    <span>期限</span>
                    <strong>${goal.targetDate || '无'}</strong>
                </div>
            </div>
            
            <div class="goal-dashboard-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; align-items: center;">
                
                <div class="goal-chart-container" style="position: relative; height: 180px; display: flex; justify-content: center; align-items: center;">
                    <canvas id="goalGaugeChart"></canvas>
                    <div style="position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: 800; color: #1e293b; line-height: 1;">${Math.round(progressPercentage)}<span style="font-size: 1.2rem; color: #64748b;">%</span></div>
                        <div style="font-size: 1rem; color: #64748b; margin-top: 5px;">达成率</div>
                    </div>
                </div>

                <div class="goal-stats-grid" style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                        <span style="color: #64748b; font-size: 1.1rem;">当前进度</span>
                        <strong style="color: #0f172a; font-size: 1.2rem;">${currentVal} <span style="font-size: 1rem; color: #94a3b8;">/ ${targetVal} ${goal.unit}</span></strong>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                        <span style="color: #64748b; font-size: 1.1rem;">距离目标</span>
                        <strong style="color: #3b82f6; font-size: 1.2rem;">${progressPercentage >= 100 ? '已达成' : '还差 ' + diff + ' ' + goal.unit}</strong>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                        <span style="color: #64748b; font-size: 1.1rem;">倒计时</span>
                        <strong style="color: #f59e0b; font-size: 1.2rem;">${daysLeftText}</strong>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                        <span style="color: #64748b; font-size: 1.1rem;">建议配速</span>
                        <strong style="color: #10b981; font-size: 1.2rem;">${paceText}</strong>
                    </div>

                </div>
            </div>

            <div class="goal-actions" style="margin-top: 2rem;">
                <button class="btn-danger" style="width: 100%;" onclick="app.deleteGoal(${index})">🗑️ 删除并重置目标</button>
            </div>
        `;
        container.appendChild(card);

        // Draw Gauge Chart
        setTimeout(() => {
            const ctx = document.getElementById('goalGaugeChart');
            if (ctx) {
                if (this.goalChartInstance) this.goalChartInstance.destroy();
                
                const data = [progressPercentage, 100 - progressPercentage];
                
                let chartColor = '#3b82f6'; // Blue default
                if (progressPercentage >= 100) chartColor = '#10b981'; // Green for success
                else if (progressPercentage > 50) chartColor = '#6366f1'; // Indigo

                this.goalChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: data,
                            backgroundColor: [chartColor, '#e2e8f0'],
                            borderWidth: 0,
                            cutout: '80%',
                            circumference: 180,
                            rotation: 270
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { tooltip: { enabled: false }, legend: { display: false } },
                        animation: { animateRotate: true, animateScale: false }
                    }
                });
            }
        }, 10);
    }

    /**
     * 【AI分析】加载页面
     */
    loadAnalysisPage() {
        // AI 分析现在由用户手动触发，不自动加载
    }

    /**
     * 加载AI分析结果
     */
    async loadAIAnalysis() {
        if (!this.aiConfig || !this.aiConfig.apiKey) {
            const warningHtml = '<p style="color: #FF6B6B; padding: 1rem;">请先在右上角 ⚙️ AI 配置 中设置 API Key 和模型名称。</p>';
            document.getElementById('dailyAnalysisContent').innerHTML = warningHtml;
            document.getElementById('nutritionAdviceContent').innerHTML = warningHtml;
            document.getElementById('exerciseAdviceContent').innerHTML = warningHtml;
            document.getElementById('goalPredictionContent').innerHTML = warningHtml;
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const todayExercises = this.exercises.filter(e => e.exerciseDate === today);
        const todayDiet = this.diet.filter(d => d.mealTime.startsWith(today));

        // Gather comprehensive data
        const totalBurned = todayExercises.reduce((sum, e) => sum + (parseFloat(e.caloriesBurned) || 0), 0);
        const totalIntake = todayDiet.reduce((sum, d) => sum + (parseFloat(d.calories) || 0), 0);
        const totalProtein = todayDiet.reduce((sum, d) => sum + (parseFloat(d.protein) || 0), 0);
        const totalCarbs = todayDiet.reduce((sum, d) => sum + (parseFloat(d.carbs) || 0), 0);
        const totalFat = todayDiet.reduce((sum, d) => sum + (parseFloat(d.fat) || 0), 0);
        const balance = totalIntake - totalBurned;

        const currentWeight = this.vitals.length > 0 ? this.vitals[0].weight : '未记录';
        
        let goalInfo = '用户尚未设置目标';
        if (this.goals.length > 0) {
            const g = this.goals[0];
            const goalTypeStr = this.getGoalTypeLabel(g.goalType);
            
            let daysLeftStr = '未知';
            if (g.targetDate) {
                const targetDateObj = new Date(g.targetDate);
                const timeDiff = targetDateObj - new Date();
                const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                daysLeftStr = daysLeft >= 0 ? `剩余 ${daysLeft} 天` : `已过期 ${Math.abs(daysLeft)} 天`;
            }
            goalInfo = `目标类型：${goalTypeStr}，初始值：${g.currentValue}${g.unit}，目标值：${g.targetValue}${g.unit}，时间期限：${daysLeftStr}`;
        }

        const skeletonHtml = `
            <div class="loading-skeleton">
                <div class="skeleton-title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line shorter"></div>
            </div>
        `;
        document.getElementById('dailyAnalysisContent').innerHTML = skeletonHtml;
        document.getElementById('nutritionAdviceContent').innerHTML = skeletonHtml;
        document.getElementById('exerciseAdviceContent').innerHTML = skeletonHtml;
        document.getElementById('goalPredictionContent').innerHTML = skeletonHtml;

        const prompt = `你是一位顶级的AI健身和营养专家。请根据用户今天的数据生成一份深度的、个性化的健康分析报告。
【用户状态与目标】
- 当前体重：${currentWeight} kg
- 核心目标：${goalInfo}

【今日数据】
- 饮食摄入总热量：${totalIntake} kcal
  - 蛋白质：${totalProtein} g
  - 碳水化合物：${totalCarbs} g
  - 脂肪：${totalFat} g
- 运动消耗热量：${totalBurned} kcal
- 净热量差：${balance > 0 ? '+' : ''}${balance} kcal

【分析策略】
1. 深入分析三大宏量营养素的比例是否合理，是否契合用户的核心目标（如减脂需高蛋白适量碳水）。
2. 根据目标期限和进度，给出切实可行的预估和配速建议。
3. 若某项数据为0，默认用户有正常基线行为，重点针对已有数据进行拔高指导，不要一味指责数据不全。
4. 语言风格：专业、鼓励、富有洞察力。

请严格返回一个JSON格式的数据，必须包含以下4个字段（请直接返回纯JSON字符串，不要包含多余的话或 \`\`\`json 标记）：
{
    "dailyAnalysis": "一段包含深刻洞见、鼓舞人心的今日健康总结，无需列表。",
    "nutritionAdvice": "几条营养建议，直接写<li>标签，且重点加粗。例如 <li><strong>增加优质蛋白：</strong> 有助于肌肉恢复...</li>",
    "exerciseAdvice": "几条运动建议，直接写<li>标签，重点加粗。例如 <li><strong>加入HIIT训练：</strong> 突破燃脂瓶颈...</li>",
    "goalPrediction": "几条关于达成目标的预测与节奏建议，直接写<li>标签。例如 <li><strong>当前配速极佳：</strong> 预计可提前一周达成目标...</li>"
}`;

        try {
            let apiUrl = this.aiConfig.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
            apiUrl = apiUrl.endsWith('/chat/completions') ? apiUrl : apiUrl.replace(/\/$/, '') + '/chat/completions';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.aiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: this.aiConfig.modelName || 'qwen-plus',
                    messages: [
                        { role: 'system', content: '你是一位顶级的AI健康分析专家。' },
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                let errMsg = `HTTP ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData && errData.error && errData.error.message) {
                        errMsg = errData.error.message;
                    }
                } catch (e) {}
                throw new Error(`API 请求失败 (${response.status}): ${errMsg}`);
            }

            const data = await response.json();
            let content = data.choices[0].message.content.trim();
            if (content.startsWith('\`\`\`json')) {
                content = content.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
            } else if (content.startsWith('\`\`\`')) {
                content = content.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
            }
            
            const result = JSON.parse(content);

            document.getElementById('dailyAnalysisContent').innerHTML = `<p>${result.dailyAnalysis}</p>`;
            document.getElementById('nutritionAdviceContent').innerHTML = `<ul>${result.nutritionAdvice}</ul>`;
            document.getElementById('exerciseAdviceContent').innerHTML = `<ul>${result.exerciseAdvice}</ul>`;
            document.getElementById('goalPredictionContent').innerHTML = `<ul>${result.goalPrediction}</ul>`;

        } catch (error) {
            console.error('AI分析请求失败', error);
            const errorHtml = `<p style="color: #FF6B6B;">AI分析生成失败，请检查网络或 API 配置（${error.message}）。</p>`;
            document.getElementById('dailyAnalysisContent').innerHTML = errorHtml;
            document.getElementById('nutritionAdviceContent').innerHTML = errorHtml;
            document.getElementById('exerciseAdviceContent').innerHTML = errorHtml;
            document.getElementById('goalPredictionContent').innerHTML = errorHtml;
        }
    }

    /**
     * 绘制体重趋势图
     */
    drawWeightChart() {
        const ctx = document.getElementById('weightChart');
        if (!ctx) return;

        // 按照日期从小到大排序 (从左到右时间增加)
        const sortedVitals = [...this.vitals].sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate));
        const recentVitals = sortedVitals.slice(-7);
        const labels = recentVitals.map(v => v.recordDate);
        const data = recentVitals.map(v => parseFloat(v.weight));

        if (this.weightChart) {
            this.weightChart.destroy();
        }

        this.weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '体重 (kg)',
                    data: data,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#FF6B6B'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    /**
     * 根据体征和目标动态计算每日推荐热量
     */
    calculateDailyCalorieTarget() {
        let baseBMR = 1500;
        
        if (this.vitals.length > 0) {
            const latestVital = this.vitals[0];
            if (latestVital.bmr) {
                baseBMR = parseFloat(latestVital.bmr);
            } else {
                baseBMR = (parseFloat(latestVital.weight) || 65) * 22;
            }
        }

        // 活动系数（1.2 轻度活动）
        let tdee = baseBMR * 1.2;

        if (this.goals.length > 0) {
            const goal = this.goals[0];
            if (goal.goalType === 'weight-loss') {
                return Math.round(tdee - 300);
            } else if (goal.goalType === 'muscle-gain') {
                return Math.round(tdee + 300);
            }
        }

        return Math.round(tdee);
    }

    /**
     * 绘制热量图表
     */
    drawCaloriesChart() {
        const ctx = document.getElementById('caloriesChart');
        if (!ctx) return;

        const today = new Date().toISOString().split('T')[0];
        const todayDiet = this.diet.filter(d => d.mealTime.startsWith(today));
        const todayExercises = this.exercises.filter(e => e.exerciseDate === today);

        const totalIntake = todayDiet.reduce((sum, d) => sum + (parseFloat(d.calories) || 0), 0);
        const totalBurned = todayExercises.reduce((sum, e) => sum + (parseFloat(e.caloriesBurned) || 0), 0);
        const bmr = this.vitals.length > 0 ? (parseFloat(this.vitals[0].bmr) || 0) : 0;
        const target = this.calculateDailyCalorieTarget();

        if (this.caloriesChart) {
            this.caloriesChart.destroy();
        }

        const targetLinePlugin = {
            id: 'targetLine',
            beforeDraw: chart => {
                const ctx = chart.ctx;
                const yAxis = chart.scales.y;
                const xAxis = chart.scales.x;
                const yPos = yAxis.getPixelForValue(target);
                
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(xAxis.left, yPos);
                ctx.lineTo(xAxis.right, yPos);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#FFC107';
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.restore();
            }
        };

        this.caloriesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['今日热量分析'],
                datasets: [
                    {
                        label: '摄入热量',
                        data: [totalIntake],
                        backgroundColor: '#FF3366',
                        borderRadius: 8,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8,
                        stack: 'intake'
                    },
                    {
                        label: '基础代谢',
                        data: [bmr],
                        backgroundColor: '#8b5cf6',
                        barPercentage: 0.6,
                        categoryPercentage: 0.8,
                        stack: 'burn'
                    },
                    {
                        label: '运动消耗',
                        data: [totalBurned],
                        backgroundColor: '#00C9B1',
                        borderRadius: { topLeft: 8, topRight: 8 },
                        barPercentage: 0.6,
                        categoryPercentage: 0.8,
                        stack: 'burn'
                    },
                    {
                        label: '推荐摄入上限',
                        data: [target],
                        type: 'line',
                        borderColor: '#FFC107',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + ' kcal';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: Math.max(totalIntake, bmr + totalBurned, target) * 1.2
                    }
                }
            },
            plugins: [targetLinePlugin]
        });
    }

    /**
     * 打开通用模态框
     */
    openModal(modalId) {
        const formId = modalId.replace('Modal', 'Form');
        const indexInputId = modalId.replace('Modal', 'Index');
        const indexInput = document.getElementById(indexInputId);
        
        // 只有当 index为空（新增）时，才重置表单
        if (indexInput && indexInput.value === '') {
            const form = document.getElementById(formId);
            if (form) {
                form.reset();
                const titleEl = document.getElementById(modalId + 'Title');
                if (titleEl) {
                    if(modalId === 'vitalModal') titleEl.textContent = '新增体征数据';
                    if(modalId === 'dietModal') titleEl.textContent = '新增饮食记录';
                    if(modalId === 'exerciseModal') titleEl.textContent = '新增运动记录';
                    if(modalId === 'goalModal') titleEl.textContent = '设定健身目标';
                }
                
                // 设置默认日期
                if (modalId === 'vitalModal' || modalId === 'exerciseModal') {
                    const dateInput = form.querySelector('input[type="date"]');
                    if(dateInput) dateInput.value = new Date().toISOString().split('T')[0];
                }
            }
        }
        document.getElementById(modalId).style.display = 'flex';
    }

    /**
     * 关闭通用模态框
     */
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        const indexInputId = modalId.replace('Modal', 'Index');
        const indexInput = document.getElementById(indexInputId);
        if (indexInput) indexInput.value = ''; // 清除索引以便下次新增
    }

    /**
     * 编辑体征数据
     */
    editVital(index) {
        const vital = this.vitals[index];
        const form = document.getElementById('vitalForm');
        document.getElementById('vitalIndex').value = index;
        document.getElementById('vitalModalTitle').textContent = '编辑体征数据';
        
        form.querySelector('[name="weight"]').value = vital.weight;
        form.querySelector('[name="bodyFatRate"]').value = vital.bodyFatRate || '';
        form.querySelector('[name="muscleMass"]').value = vital.muscleMass || '';
        form.querySelector('[name="waterRate"]').value = vital.waterRate || '';
        form.querySelector('[name="skeletalMuscle"]').value = vital.skeletalMuscle || '';
        form.querySelector('[name="bmr"]').value = vital.bmr || '';
        form.querySelector('[name="recordDate"]').value = vital.recordDate || '';
        form.querySelector('[name="notes"]').value = vital.notes || '';
        
        this.openModal('vitalModal');
    }

    /**
     * 保存体征数据
     */
    saveVital() {
        const form = document.getElementById('vitalForm');
        const data = new FormData(form);

        const vital = {
            weight: parseFloat(data.get('weight')),
            bodyFatRate: parseFloat(data.get('bodyFatRate')) || 0,
            muscleMass: parseFloat(data.get('muscleMass')) || 0,
            waterRate: parseFloat(data.get('waterRate')) || 0,
            skeletalMuscle: parseFloat(data.get('skeletalMuscle')) || 0,
            bmr: parseFloat(data.get('bmr')) || 0,
            recordDate: data.get('recordDate'),
            notes: data.get('notes')
        };

        const index = data.get('vitalIndex');
        
        if (index !== '') {
            this.vitals[parseInt(index)] = vital;
        } else {
            this.vitals.unshift(vital);
        }
        this.saveDataToServer();

        this.closeModal('vitalModal');
        this.loadVitalsPage();
        this.showSuccessMessage('体征数据保存成功！');
    }

    /**
     * 删除体征数据
     */
    deleteVital(index) {
        if (confirm('确定删除这条记录吗？')) {
            this.vitals.splice(index, 1);
            this.saveDataToServer();
            this.loadVitalsPage();
            this.showSuccessMessage('删除成功！');
        }
    }

    /**
     * 编辑饮食记录
     */
    editDiet(index) {
        const diet = this.diet[index];
        const form = document.getElementById('dietForm');
        document.getElementById('dietIndex').value = index;
        document.getElementById('dietModalTitle').textContent = '编辑饮食记录';
        
        form.querySelector('[name="foodName"]').value = diet.foodName;
        form.querySelector('[name="amount"]').value = diet.amount;
        form.querySelector('[name="calories"]').value = diet.calories;
        form.querySelector('[name="protein"]').value = diet.protein || '';
        form.querySelector('[name="carbs"]').value = diet.carbs || '';
        form.querySelector('[name="fat"]').value = diet.fat || '';
        form.querySelector('[name="mealTime"]').value = diet.mealTime || '';
        form.querySelector('[name="mealType"]').value = diet.mealType || '';
        
        this.openModal('dietModal');
    }

    /**
     * 切换相机区域
     */
    toggleCameraSection() {
        const section = document.getElementById('cameraSectionDiet');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    /**
     * 处理图片上传
     */
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('previewImage');
            preview.innerHTML = `<img src="${event.target.result}" alt="预览">`;
            document.getElementById('recognizeFoodBtn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    /**
     * AI识别食物（模拟）
     */
    async recognizeFood() {
        const resultDiv = document.getElementById('recognitionResult');
        resultDiv.className = 'recognition-result show';
        resultDiv.innerHTML = '<p>🤖 AI正在识别食物，请稍候...</p>';

        const previewImg = document.querySelector('#previewImage img');
        if (!previewImg || !previewImg.src) {
            resultDiv.innerHTML = '<p style="color: #FF6B6B;">未找到图片，请先上传照片。</p>';
            return;
        }

        const imageBase64 = previewImg.src;

        if (!this.aiConfig || !this.aiConfig.apiKey) {
            resultDiv.innerHTML = '<p style="color: #FF6B6B;">请先在右上角 ⚙️ AI 配置 中设置 API Key 和模型名称。</p>';
            return;
        }

        try {
            let apiUrl = this.aiConfig.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
            apiUrl = apiUrl.endsWith('/chat/completions') ? apiUrl : apiUrl.replace(/\/$/, '') + '/chat/completions';

            const prompt = `你是一位专业的营养师。请分析图片中的食物。
请严格返回一个JSON格式的数据，格式如下（不要包含多余的话或markdown代码块修饰）：
{
    "foodName": "食物名称，如白米饭",
    "amount": "估算摄入量(g)，如 100",
    "calories": "热量(kcal)，如 130",
    "protein": "蛋白质(g)，如 2.7",
    "carbs": "碳水(g)，如 28",
    "fat": "脂肪(g)，如 0.1"
}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.aiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: this.aiConfig.modelName || 'qwen-vl-max', // 默认使用视觉大模型
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: { url: imageBase64 }
                                },
                                {
                                    type: 'text',
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                let errMsg = `HTTP ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData && errData.error && errData.error.message) {
                        errMsg = errData.error.message;
                    }
                } catch (e) {}
                throw new Error(`API 请求失败 (${response.status}): ${errMsg}`);
            }

            const data = await response.json();
            let content = data.choices[0].message.content.trim();
            if (content.startsWith('```json')) {
                content = content.replace(/^```json/, '').replace(/```$/, '').trim();
            } else if (content.startsWith('```')) {
                content = content.replace(/^```/, '').replace(/```$/, '').trim();
            }

            const result = JSON.parse(content);
            this.currentRecognitionResult = result;

            resultDiv.innerHTML = `
                <div>
                    <p><strong>识别结果：</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>食物：${result.foodName || '未知'}</li>
                        <li>估算摄入量：${result.amount || 0}g</li>
                        <li>热量：${result.calories || 0} kcal</li>
                        <li>蛋白质：${result.protein || 0}g</li>
                        <li>碳水：${result.carbs || 0}g</li>
                        <li>脂肪：${result.fat || 0}g</li>
                    </ul>
                    <div style="display: flex; gap: 10px; margin-top: 1rem;">
                        <button class="btn-primary" style="flex: 1;" onclick="app.directSaveRecognizedFood()">
                            直接保存
                        </button>
                        <button class="btn-secondary" style="flex: 1;" onclick="app.confirmRecognizedFood()">
                            核对并修改
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('AI识餐失败', error);
            resultDiv.innerHTML = `<p style="color: #FF6B6B;">AI识餐失败：${error.message}。<br>注：请确保您填写的模型支持图像识别（多模态），如 qwen-vl-plus 或 qwen-vl-max。</p>`;
        }
    }

    /**
     * 确认识别结果
     */
    confirmRecognizedFood() {
        if (!this.currentRecognitionResult) return;
        const result = this.currentRecognitionResult;

        // 打开表单模态框
        this.openModal('dietModal');

        // 填充表单数据
        const form = document.getElementById('dietForm');
        form.querySelector('input[name="foodName"]').value = result.foodName || '';
        form.querySelector('input[name="amount"]').value = result.amount || '';
        form.querySelector('input[name="calories"]').value = result.calories || '';
        form.querySelector('input[name="protein"]').value = result.protein || '';
        form.querySelector('input[name="carbs"]').value = result.carbs || '';
        form.querySelector('input[name="fat"]').value = result.fat || '';
        
        // 隐藏拍照区域
        document.getElementById('cameraSectionDiet').style.display = 'none';
        
        // 清理当前缓存
        this.currentRecognitionResult = null;
    }

    /**
     * 直接保存识别的食物
     */
    directSaveRecognizedFood() {
        if (!this.currentRecognitionResult) return;
        const result = this.currentRecognitionResult;

        const today = new Date();
        const mealTime = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

        const diet = {
            foodName: result.foodName || '未知食物',
            amount: parseFloat(result.amount) || 0,
            calories: parseFloat(result.calories) || 0,
            protein: parseFloat(result.protein) || 0,
            carbs: parseFloat(result.carbs) || 0,
            fat: parseFloat(result.fat) || 0,
            mealTime: mealTime,
            mealType: 'snack' // 默认设为零食，用户后续可自行编辑
        };

        this.diet.unshift(diet);
        this.saveDataToServer();

        // 隐藏拍照区域
        document.getElementById('cameraSectionDiet').style.display = 'none';
        
        // 清理当前缓存
        this.currentRecognitionResult = null;

        this.loadDietPage();
        this.showSuccessMessage('已直接保存饮食记录！');
    }

    /**
     * 切换体征相机区域
     */
    toggleCameraSectionVitals() {
        const section = document.getElementById('cameraSectionVitals');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    /**
     * 处理体征图片上传
     */
    handleVitalsImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('previewImageVitals');
            preview.innerHTML = `<img src="${event.target.result}" alt="预览">`;
            document.getElementById('recognizeVitalsBtn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    /**
     * AI识别体征
     */
    async recognizeVitals() {
        const resultDiv = document.getElementById('recognitionResultVitals');
        resultDiv.className = 'recognition-result show';
        resultDiv.innerHTML = '<p>🤖 AI正在识别体征数据，请稍候...</p>';

        const previewImg = document.querySelector('#previewImageVitals img');
        if (!previewImg || !previewImg.src) {
            resultDiv.innerHTML = '<p style="color: #FF6B6B;">未找到图片，请先上传照片。</p>';
            return;
        }

        const imageBase64 = previewImg.src;

        if (!this.aiConfig || !this.aiConfig.apiKey) {
            resultDiv.innerHTML = '<p style="color: #FF6B6B;">请先在右上角 ⚙️ AI 配置 中设置 API Key 和模型名称。</p>';
            return;
        }

        try {
            let apiUrl = this.aiConfig.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
            apiUrl = apiUrl.endsWith('/chat/completions') ? apiUrl : apiUrl.replace(/\/$/, '') + '/chat/completions';

            const prompt = `你是一位专业的数据分析助手。请从用户上传的图片（可能是体脂秤截图、健康报告等）中提取体征数据。
请严格返回一个JSON格式的数据，没有找到的项设为0，格式如下（不要包含多余的话或markdown代码块修饰）：
{
    "weight": "体重(kg)，数值类型，如 70.5",
    "bodyFatRate": "体脂率(%)，数值类型，如 20.1",
    "muscleMass": "肌肉量(kg)，数值类型，如 50.2",
    "waterRate": "水分含量(%)，数值类型，如 60",
    "skeletalMuscle": "骨骼肌量(kg)，数值类型，如 40",
    "bmr": "基础代谢(kcal)，数值类型，如 1500"
}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.aiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: this.aiConfig.modelName || 'qwen-vl-max',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: { url: imageBase64 }
                                },
                                {
                                    type: 'text',
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                let errMsg = `HTTP ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData && errData.error && errData.error.message) {
                        errMsg = errData.error.message;
                    }
                } catch (e) {}
                throw new Error(`API 请求失败 (${response.status}): ${errMsg}`);
            }

            const data = await response.json();
            let content = data.choices[0].message.content.trim();
            if (content.startsWith('```json')) {
                content = content.replace(/^```json/, '').replace(/```$/, '').trim();
            } else if (content.startsWith('```')) {
                content = content.replace(/^```/, '').replace(/```$/, '').trim();
            }

            const result = JSON.parse(content);
            this.currentVitalsResult = result;

            resultDiv.innerHTML = `
                <div>
                    <p><strong>识别结果：</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>体重：${result.weight || 0} kg</li>
                        <li>体脂率：${result.bodyFatRate || 0} %</li>
                        <li>肌肉量：${result.muscleMass || 0} kg</li>
                        <li>水分：${result.waterRate || 0} %</li>
                        <li>骨骼肌：${result.skeletalMuscle || 0} kg</li>
                        <li>基础代谢：${result.bmr || 0} kcal</li>
                    </ul>
                    <div style="display: flex; gap: 10px; margin-top: 1rem;">
                        <button class="btn-primary" style="flex: 1;" onclick="app.directSaveRecognizedVitals()">
                            直接保存
                        </button>
                        <button class="btn-secondary" style="flex: 1;" onclick="app.confirmRecognizedVitals()">
                            核对并修改
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('AI体征识别失败', error);
            resultDiv.innerHTML = `<p style="color: #FF6B6B;">AI识别失败：${error.message}。</p>`;
        }
    }

    /**
     * 直接保存识别的体征数据
     */
    directSaveRecognizedVitals() {
        if (!this.currentVitalsResult) return;
        const result = this.currentVitalsResult;

        const recordDate = new Date().toISOString().split('T')[0];

        const vital = {
            weight: parseFloat(result.weight) || 0,
            bodyFatRate: parseFloat(result.bodyFatRate) || 0,
            muscleMass: parseFloat(result.muscleMass) || 0,
            waterRate: parseFloat(result.waterRate) || 0,
            skeletalMuscle: parseFloat(result.skeletalMuscle) || 0,
            bmr: parseFloat(result.bmr) || 0,
            recordDate: recordDate,
            notes: 'AI识图自动录入'
        };

        this.vitals.unshift(vital);
        this.saveDataToServer();

        // 隐藏拍照区域
        document.getElementById('cameraSectionVitals').style.display = 'none';
        
        // 清理当前缓存
        this.currentVitalsResult = null;

        this.loadVitalsPage();
        this.showSuccessMessage('已直接保存体征数据！');
    }

    /**
     * 确认并修改识别的体征数据
     */
    confirmRecognizedVitals() {
        if (!this.currentVitalsResult) return;
        const result = this.currentVitalsResult;

        // 打开表单模态框
        this.openModal('vitalModal');

        // 填充表单数据
        const form = document.getElementById('vitalForm');
        
        const safeParse = (val) => {
            if (val === undefined || val === null) return '';
            const num = parseFloat(val);
            return isNaN(num) ? '' : num;
        };

        form.querySelector('input[name="weight"]').value = safeParse(result.weight);
        form.querySelector('input[name="bodyFatRate"]').value = safeParse(result.bodyFatRate);
        form.querySelector('input[name="muscleMass"]').value = safeParse(result.muscleMass);
        form.querySelector('input[name="waterRate"]').value = safeParse(result.waterRate);
        form.querySelector('input[name="skeletalMuscle"]').value = safeParse(result.skeletalMuscle);
        form.querySelector('input[name="bmr"]').value = safeParse(result.bmr);
        form.querySelector('textarea[name="notes"]').value = 'AI识图自动提取，请核对';
        
        // 隐藏拍照区域
        document.getElementById('cameraSectionVitals').style.display = 'none';
        
        // 清理当前缓存
        this.currentVitalsResult = null;
    }

    /**
     * 保存饮食记录
     */
    saveDiet() {
        const form = document.getElementById('dietForm');
        const data = new FormData(form);

        const diet = {
            foodName: data.get('foodName'),
            amount: parseFloat(data.get('amount')),
            calories: parseFloat(data.get('calories')),
            protein: parseFloat(data.get('protein')) || 0,
            carbs: parseFloat(data.get('carbs')) || 0,
            fat: parseFloat(data.get('fat')) || 0,
            mealTime: data.get('mealTime'),
            mealType: data.get('mealType')
        };

        const index = data.get('dietIndex');

        if (index !== '') {
            this.diet[parseInt(index)] = diet;
        } else {
            this.diet.unshift(diet);
        }
        this.saveDataToServer();

        this.closeModal('dietModal');
        this.loadDietPage();
        this.showSuccessMessage('饮食记录保存成功！');
    }

    /**
     * 删除饮食记录
     */
    deleteDiet(index) {
        if (confirm('确定删除这条记录吗？')) {
            this.diet.splice(index, 1);
            this.saveDataToServer();
            this.loadDietPage();
            this.showSuccessMessage('删除成功！');
        }
    }

    /**
     * 编辑运动记录
     */
    editExercise(index) {
        const exercise = this.exercises[index];
        const form = document.getElementById('exerciseForm');
        document.getElementById('exerciseIndex').value = index;
        document.getElementById('exerciseModalTitle').textContent = '编辑运动记录';
        
        form.querySelector('[name="exerciseType"]').value = exercise.exerciseType || '';
        form.querySelector('[name="intensity"]').value = exercise.intensity || '';
        form.querySelector('[name="duration"]').value = exercise.duration || '';
        form.querySelector('[name="caloriesBurned"]').value = exercise.caloriesBurned || '';
        form.querySelector('[name="exerciseDate"]').value = exercise.exerciseDate || '';
        form.querySelector('[name="notes"]').value = exercise.notes || '';
        
        this.openModal('exerciseModal');
    }

    /**
     * 保存运动记录
     */
    saveExercise() {
        const form = document.getElementById('exerciseForm');
        const data = new FormData(form);

        const exercise = {
            exerciseType: data.get('exerciseType'),
            intensity: data.get('intensity'),
            duration: parseFloat(data.get('duration')),
            caloriesBurned: parseFloat(data.get('caloriesBurned')),
            exerciseDate: data.get('exerciseDate'),
            notes: data.get('notes')
        };

        const index = data.get('exerciseIndex');

        if (index !== '') {
            this.exercises[parseInt(index)] = exercise;
        } else {
            this.exercises.unshift(exercise);
        }
        this.saveDataToServer();

        this.closeModal('exerciseModal');
        this.loadExercisePage();
        this.showSuccessMessage('运动记录保存成功！');
    }

    /**
     * 删除运动记录
     */
    deleteExercise(index) {
        if (confirm('确定删除这条记录吗？')) {
            this.exercises.splice(index, 1);
            this.saveDataToServer();
            this.loadExercisePage();
            this.showSuccessMessage('删除成功！');
        }
    }

    /**
     * 切换运动截图区域
     */
    toggleCameraSectionExercise() {
        const section = document.getElementById('cameraSectionExercise');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    /**
     * 处理运动截图上传
     */
    handleExerciseImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('previewImageExercise');
            preview.innerHTML = `<img src="${event.target.result}" alt="预览">`;
            document.getElementById('recognizeExerciseBtn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    /**
     * AI识别运动截图
     */
    async recognizeExercise() {
        const resultDiv = document.getElementById('recognitionResultExercise');
        resultDiv.className = 'recognition-result show';
        resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>AI 正在全力解析运动数据，请稍候...</p></div>';

        if (!this.aiConfig || !this.aiConfig.apiKey) {
            resultDiv.innerHTML = '<p style="color: #FF6B6B;">请先在右上角 ⚙️ AI 配置 中设置 API Key 和模型名称。</p>';
            return;
        }

        const imgElement = document.querySelector('#previewImageExercise img');
        if (!imgElement) {
            resultDiv.innerHTML = '<p style="color: #FF6B6B;">请先上传运动截图。</p>';
            return;
        }

        const base64Image = imgElement.src;
        
        try {
            let apiUrl = this.aiConfig.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
            apiUrl = apiUrl.endsWith('/chat/completions') ? apiUrl : apiUrl.replace(/\/$/, '') + '/chat/completions';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.aiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: this.aiConfig.modelName,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "请分析这张运动截图（如Apple Watch、Keep、咕咚等），提取出运动数据。\n\n请返回一个JSON对象，严格包含以下字段：\n- \"exerciseType\": 运动类型，必须是以下枚举之一：running, cycling, swimming, strength, hiit, jump-rope, pilates, hiking, basketball, badminton, other。请根据截图自动映射最接近的一项。\n- \"intensity\": 运动强度，必须是以下之一：low, medium, high。请根据心率或配速推断。\n- \"duration\": 运动时长，数字类型（分钟）。\n- \"caloriesBurned\": 消耗热量，数字类型（kcal大卡）。\n\n请只返回纯JSON字符串，不要返回任何markdown标记代码块或多余的解释。"
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: base64Image
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                let errMsg = `HTTP ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData && errData.error && errData.error.message) {
                        errMsg = errData.error.message;
                    }
                } catch (e) {}
                throw new Error(`API 请求失败 (${response.status}): ${errMsg}`);
            }

            const data = await response.json();
            let content = data.choices[0].message.content.trim();
            if (content.startsWith('\`\`\`json')) {
                content = content.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
            } else if (content.startsWith('\`\`\`')) {
                content = content.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
            }

            const result = JSON.parse(content);
            this.currentExerciseResult = result;

            resultDiv.innerHTML = `
                <div>
                    <p><strong>识别结果：</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>运动类型：${this.getExerciseTypeLabel(result.exerciseType)}</li>
                        <li>运动强度：${this.getIntensityLabel(result.intensity)}</li>
                        <li>运动时长：${result.duration || 0} 分钟</li>
                        <li>消耗热量：${result.caloriesBurned || 0} kcal</li>
                    </ul>
                    <div style="display: flex; gap: 10px; margin-top: 1rem;">
                        <button class="btn-primary" style="flex: 1;" onclick="app.directSaveRecognizedExercise()">
                            直接保存
                        </button>
                        <button class="btn-secondary" style="flex: 1;" onclick="app.confirmRecognizedExercise()">
                            核对并修改
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('AI运动识别失败', error);
            resultDiv.innerHTML = `<p style="color: #FF6B6B;">AI识别失败：${error.message}。<br>注：请确保您填写的模型支持图像识别（多模态）。</p>`;
        }
    }

    /**
     * 直接保存识别的运动数据
     */
    directSaveRecognizedExercise() {
        if (!this.currentExerciseResult) return;
        const result = this.currentExerciseResult;

        const recordDate = new Date().toISOString().split('T')[0];

        const exercise = {
            exerciseType: result.exerciseType || 'other',
            intensity: result.intensity || 'medium',
            duration: parseFloat(result.duration) || 0,
            caloriesBurned: parseFloat(result.caloriesBurned) || 0,
            exerciseDate: recordDate,
            notes: 'AI识图自动录入'
        };

        this.exercises.unshift(exercise);
        this.saveDataToServer();

        // 隐藏拍照区域
        document.getElementById('cameraSectionExercise').style.display = 'none';
        
        // 清理当前缓存
        this.currentExerciseResult = null;

        this.loadExercisePage();
        this.showSuccessMessage('已直接保存运动数据！');
    }

    /**
     * 确认并修改识别的运动数据
     */
    confirmRecognizedExercise() {
        if (!this.currentExerciseResult) return;
        const result = this.currentExerciseResult;

        // 打开表单模态框
        this.openModal('exerciseModal');

        // 填充表单数据
        const form = document.getElementById('exerciseForm');
        form.querySelector('[name="exerciseType"]').value = result.exerciseType || 'other';
        form.querySelector('[name="intensity"]').value = result.intensity || 'medium';
        form.querySelector('[name="duration"]').value = result.duration || '';
        form.querySelector('[name="caloriesBurned"]').value = result.caloriesBurned || '';
        form.querySelector('[name="exerciseDate"]').value = new Date().toISOString().split('T')[0];
        form.querySelector('textarea[name="notes"]').value = 'AI识图自动提取，请核对';
        
        // 隐藏拍照区域
        document.getElementById('cameraSectionExercise').style.display = 'none';
        
        // 清理当前缓存
        this.currentExerciseResult = null;
    }

    /**
     * 编辑目标
     */
    editGoal(index) {
        const goal = this.goals[index];
        const form = document.getElementById('goalForm');
        document.getElementById('goalIndex').value = index;
        document.getElementById('goalModalTitle').textContent = '编辑健身目标';
        
        form.querySelector('[name="goalType"]').value = goal.goalType || '';
        form.querySelector('[name="currentValue"]').value = goal.currentValue || '';
        form.querySelector('[name="targetValue"]').value = goal.targetValue || '';
        form.querySelector('[name="unit"]').value = goal.unit || '';
        form.querySelector('[name="targetDate"]').value = goal.targetDate || '';
        form.querySelector('[name="description"]').value = goal.description || '';
        
        this.openModal('goalModal');
    }

    /**
     * 保存目标
     */
    saveGoal() {
        const form = document.getElementById('goalForm');
        const data = new FormData(form);

        const goal = {
            goalType: data.get('goalType'),
            currentValue: parseFloat(data.get('currentValue')),
            targetValue: parseFloat(data.get('targetValue')),
            unit: data.get('unit'),
            targetDate: data.get('targetDate'),
            description: data.get('description')
        };

        const index = data.get('goalIndex');

        if (index !== '') {
            this.goals[parseInt(index)] = goal;
        } else {
            this.goals.unshift(goal);
        }
        this.saveDataToServer();

        this.closeModal('goalModal');
        this.loadGoalsPage();
        this.showSuccessMessage('目标保存成功！');
    }

    /**
     * 删除目标
     */
    deleteGoal(index) {
        if (confirm('确定删除这个目标吗？')) {
            this.goals.splice(index, 1);
            this.saveDataToServer();
            this.loadGoalsPage();
            this.showSuccessMessage('删除成功！');
        }
    }

    /**
     * 获取目标类型标签
     */
    getGoalTypeLabel(type) {
        const labels = {
            'weight-loss': '减重目标',
            'muscle-gain': '增肌目标',
            'body-shaping': '塑形目标'
        };
        return labels[type] || type;
    }

    // === Encryption Helpers ===
    async getCryptoKey() {
        if (this.cryptoKey) return this.cryptoKey;
        const password = "fitpilot_secret_key_2026";
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
        this.cryptoKey = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("fitpilot-salt"),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
        return this.cryptoKey;
    }

    async encryptData(dataStr) {
        const key = await this.getCryptoKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            enc.encode(dataStr)
        );
        const ivBase64 = btoa(String.fromCharCode(...iv));
        const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        return ivBase64 + ":" + encryptedBase64;
    }

    async decryptData(encryptedStr) {
        const parts = encryptedStr.split(":");
        if (parts.length !== 2) throw new Error("Invalid encrypted format");
        const key = await this.getCryptoKey();
        const iv = new Uint8Array(atob(parts[0]).split("").map(c => c.charCodeAt(0)));
        const encryptedData = new Uint8Array(atob(parts[1]).split("").map(c => c.charCodeAt(0)));
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encryptedData
        );
        const dec = new TextDecoder();
        return dec.decode(decrypted);
    }

    saveDataToServer() {
        const data = {
            vitals: this.vitals,
            diet: this.diet,
            exercises: this.exercises,
            goals: this.goals,
            aiConfig: this.aiConfig
        };
        const jsonStr = JSON.stringify(data);
        this.encryptData(jsonStr).then(encryptedStr => {
            fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: encryptedStr })
            }).catch(e => console.error(e));
        }).catch(e => console.error(e));
    }

    async loadMockData() {
        try {
            const res = await fetch('/api/load');
            const result = await res.json();
            if (result.status === 'success' && result.data) {
                const decryptedStr = await this.decryptData(result.data);
                const data = JSON.parse(decryptedStr);
                this.vitals = data.vitals || [];
                this.diet = data.diet || [];
                this.exercises = data.exercises || [];
                this.goals = data.goals || [];
                this.aiConfig = data.aiConfig || { apiUrl: '', apiKey: '', modelName: '' };
                return;
            }
        } catch (e) {
            console.error("Failed to load or decrypt data", e);
        }

        this.vitals = [
            { weight: 72, bodyFatRate: 22, muscleMass: 52, waterRate: 62, skeletalMuscle: 40, bmr: 1600, recordDate: '2024-04-18', notes: '' },
            { weight: 72.5, bodyFatRate: 22.5, muscleMass: 51.5, waterRate: 61, skeletalMuscle: 39.5, bmr: 1590, recordDate: '2024-04-17', notes: '' }
        ];
        this.diet = [];
        this.exercises = [];
        this.goals = [];
        this.aiConfig = {
            apiUrl: '',
            apiKey: '',
            modelName: ''
        };
    }

    /**
     * 设置今天日期
     */
    setTodayDate() {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const today = new Date().toLocaleDateString('zh-CN', options);
        document.getElementById('todayDate').textContent = today;
    }

    /**
     * 显示成功消息
     */
    showSuccessMessage(message) {
        console.log('✅', message);
        // 可以添加Toast通知
    }

    /**
     * 登出
     */
    logout() {
        if (confirm('确定要登出吗？')) {
            /* removed */
            window.location.href = 'login.html';
        }
    }

    /**
     * 打开AI配置模态框
     */
    openAiConfigModal() {
        document.getElementById('aiApiUrl').value = this.aiConfig.apiUrl || '';
        document.getElementById('aiApiKey').value = this.aiConfig.apiKey || '';
        document.getElementById('aiModelName').value = this.aiConfig.modelName || '';
        document.getElementById('aiConfigModal').style.display = 'flex';
    }

    /**
     * 关闭AI配置模态框
     */
    closeAiConfigModal() {
        document.getElementById('aiConfigModal').style.display = 'none';
    }

    /**
     * 保存AI配置
     */
    saveAiConfig() {
        this.aiConfig = {
            apiUrl: document.getElementById('aiApiUrl').value.trim(),
            apiKey: document.getElementById('aiApiKey').value.trim(),
            modelName: document.getElementById('aiModelName').value.trim()
        };
        this.saveDataToServer();
        this.closeAiConfigModal();
        this.showSuccessMessage('大模型配置保存成功！');
    }
}

// 初始化应用
let app = new FitPilotApp();
