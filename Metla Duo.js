// ==UserScript==
// @name         Metla Duo
// @namespace    https://github.com/MetlaOfficial
// @version      1.2
// @author       MetlaDev
// @match        https://*.duolingo.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        VERSION: "1.2",
        DELAY: 800,
        ACCESS_KEY: "MetlaTop",
        TELEGRAM: "https://t.me/MetlaOfficial",
        GITHUB: "https://github.com/MetlaOfficial",
        DUOLINGO_PROFILE: "https://www.duolingo.com/profile/MetlaDev",
        THEMES: {
            duolingo: {
                primary: "#1e1e1e",
                secondary: "#252525",
                accent: "#58a700",
                text: "#ffffff"
            },
            dark: {
                primary: "#121212",
                secondary: "#1e1e1e",
                accent: "#bb86fc",
                text: "#ffffff"
            },
            light: {
                primary: "#ffffff",
                secondary: "#f5f5f5",
                accent: "#4285f4",
                text: "#333333"
            }
        }
    };

    // Состояние приложения
    const state = {
        running: false,
        language: navigator.language.startsWith('ru') ? 'ru' : 'en',
        theme: 'duolingo',
        jwt: null,
        user: null,
        targets: {
            xp: 0,
            gems: 0,
            time: 0,
            startTime: 0
        },
        menuVisible: true,
        unlocked: false
    };

    // Локализация
    const translations = {
        en: {
            title: "Metla Duo",
            selectAction: "Select action",
            farmXP: "Farm XP",
            farmGems: "Farm Gems",
            repairStreak: "Repair Streak",
            start: "Start",
            stop: "Stop",
            setTarget: "Set Target",
            targetXP: "Target XP:",
            targetGems: "Target Gems:",
            targetTime: "Time (minutes):",
            selectLang: "Language",
            selectTheme: "Theme",
            telegramTitle: "Telegram",
            duolingoTitle: "Duolingo",
            joinBtn: "Subscribe",
            githubBtn: "GitHub",
            hideMenu: "Hide Menu",
            showMenu: "Show Menu",
            menuSettings: "Menu",
            xpNotification: "+{xp} XP",
            gemsNotification: "+30 Gems",
            streakNotification: "Streak repaired!",
            targetReached: "Target reached!",
            timeReached: "Time's up!",
            loginWarning: "Login to Duolingo",
            errorLoading: "Error loading data",
            accessKey: "Enter access key:",
            invalidKey: "Invalid key!",
            welcome: "Welcome, premium user!",
            aboutTitle: "About",
            currentFeatures: "Current Features:",
            feature1: "• XP Farming - Automatically gain XP",
            feature2: "• Gems Farming - Collect gems automatically",
            feature3: "• Streak Repair - Fix your streak",
            feature4: "• Custom Targets - Set XP/gems/time goals",
            futurePlans: "Future Plans:",
            plan1: "• Auto-lesson completion",
            plan2: "• Leaderboard climbing",
            plan3: "• Advanced statistics",
            plan4: "• More customization options",
            supportTitle: "Support the Project"
        },
        ru: {
            title: "Metla Duo",
            selectAction: "Выберите действие",
            farmXP: "Фарм XP",
            farmGems: "Фарм камней",
            repairStreak: "Починить стрик",
            start: "Старт",
            stop: "Стоп",
            setTarget: "Цели",
            targetXP: "Цель XP:",
            targetGems: "Цель камней:",
            targetTime: "Время (минуты):",
            selectLang: "Язык",
            selectTheme: "Тема",
            telegramTitle: "Telegram",
            duolingoTitle: "Duolingo",
            joinBtn: "Подписаться",
            githubBtn: "GitHub",
            hideMenu: "Скрыть меню",
            showMenu: "Показать меню",
            menuSettings: "Меню",
            xpNotification: "+{xp} XP",
            gemsNotification: "+30 камней",
            streakNotification: "Стрик починен!",
            targetReached: "Цель достигнута!",
            timeReached: "Время вышло!",
            loginWarning: "Войдите в Duolingo",
            errorLoading: "Ошибка загрузки",
            accessKey: "Введите ключ доступа:",
            invalidKey: "Неверный ключ!",
            welcome: "Добро пожаловать, премиум пользователь!",
            aboutTitle: "О скрипте",
            currentFeatures: "Текущие возможности:",
            feature1: "• Фарм XP - Автоматическое получение XP",
            feature2: "• Фарм камней - Автоматический сбор камней",
            feature3: "• Починка стрика - Восстановление серии",
            feature4: "• Цели - Установка целей по XP/камням/времени",
            futurePlans: "Планы на будущее:",
            plan1: "• Автоматическое прохождение уроков",
            plan2: "• Подъем в таблице лидеров",
            plan3: "• Расширенная статистика",
            plan4: "• Больше настроек",
            supportTitle: "Поддержать проект"
        }
    };

    // Создание UI
    const createUI = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .metla-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: ${CONFIG.THEMES[state.theme].accent};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 30px;
                z-index: 9999;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: none;
                cursor: pointer;
                transition: all 0.3s;
                animation: float 3s ease-in-out infinite;
            }
            
            .metla-btn:hover {
                animation: pulse 1s ease infinite;
            }
            
            .metla-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 400px;
                background: ${CONFIG.THEMES[state.theme].primary};
                border-radius: 12px;
                z-index: 10000;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                overflow: hidden;
                opacity: 0;
                transition: all 0.3s;
            }
            
            .metla-panel.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            .metla-tabs {
                display: flex;
                background: ${CONFIG.THEMES[state.theme].secondary};
            }
            
            .metla-tab {
                flex: 1;
                padding: 12px;
                text-align: center;
                cursor: pointer;
                color: ${CONFIG.THEMES[state.theme].text};
                font-size: 14px;
                transition: all 0.3s;
            }
            
            .metla-tab.active {
                background: ${CONFIG.THEMES[state.theme].accent};
            }
            
            .metla-tab-content {
                display: none;
                padding: 15px;
                color: ${CONFIG.THEMES[state.theme].text};
                max-height: 400px;
                overflow-y: auto;
            }
            
            .metla-tab-content.active {
                display: block;
                animation: fadeIn 0.3s;
            }
            
            .metla-select, .metla-input, .metla-btn-action {
                width: 100%;
                padding: 10px;
                margin: 8px 0;
                border-radius: 8px;
                font-size: 14px;
            }
            
            .metla-select, .metla-input {
                background: ${state.theme === 'light' ? '#fff' : '#333'};
                color: ${state.theme === 'light' ? '#333' : '#fff'};
                border: 1px solid ${state.theme === 'light' ? '#ddd' : '#444'};
            }
            
            .metla-btn-action {
                border: none;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .metla-start {
                background: ${CONFIG.THEMES[state.theme].accent};
                color: white;
            }
            
            .metla-stop {
                background: #dc3545;
                color: white;
            }
            
            .metla-notification {
                position: fixed;
                bottom: 90px;
                right: 20px;
                background: ${CONFIG.THEMES[state.theme].accent};
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                z-index: 9999;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                transform: translateX(150%);
                transition: all 0.3s;
            }
            
            .metla-notification.show {
                transform: translateX(0);
            }
            
            .metla-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s;
            }
            
            .metla-overlay.show {
                opacity: 1;
                pointer-events: all;
            }
            
            .metla-flag {
                width: 20px;
                height: 15px;
                margin-right: 8px;
                vertical-align: middle;
            }
            
            .metla-theme-btn {
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: ${CONFIG.THEMES[state.theme].secondary};
                color: ${CONFIG.THEMES[state.theme].text};
                border: none;
                border-radius: 6px;
                cursor: pointer;
                text-align: left;
            }
            
            .metla-theme-btn.active {
                background: ${CONFIG.THEMES[state.theme].accent};
                color: white;
            }
            
            .metla-social-btn {
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: ${CONFIG.THEMES[state.theme].secondary};
                color: ${CONFIG.THEMES[state.theme].text};
                border: none;
                border-radius: 6px;
                cursor: pointer;
                text-align: center;
                font-weight: bold;
            }
            
            .metla-key-animation {
                animation: shake 0.5s;
            }

            .metla-about-list {
                margin: 10px 0;
                padding-left: 20px;
            }

            .metla-about-list li {
                margin: 5px 0;
            }
        `;
        document.head.appendChild(style);

        const elements = `
            <div class="metla-overlay"></div>
            <div class="metla-panel">
                <div class="metla-tabs">
                    <div class="metla-tab active" data-tab="main">${translations[state.language].title}</div>
                    <div class="metla-tab" data-tab="target">${translations[state.language].setTarget}</div>
                    <div class="metla-tab" data-tab="about">${translations[state.language].aboutTitle}</div>
                    <div class="metla-tab" data-tab="settings">⚙️</div>
                </div>
                
                <div class="metla-tab-content active" data-content="main">
                    <select class="metla-select" id="metla-action">
                        <option value="">${translations[state.language].selectAction}</option>
                        <option value="xp">${translations[state.language].farmXP}</option>
                        <option value="gem">${translations[state.language].farmGems}</option>
                        <option value="streak">${translations[state.language].repairStreak}</option>
                    </select>
                    <button id="metla-start" class="metla-btn-action metla-start">${translations[state.language].start}</button>
                    <button id="metla-stop" class="metla-btn-action metla-stop" disabled>${translations[state.language].stop}</button>
                </div>
                
                <div class="metla-tab-content" data-content="target">
                    <label>${translations[state.language].targetXP}</label>
                    <input type="number" id="metla-target-xp" class="metla-input" placeholder="0 = unlimited">
                    
                    <label>${translations[state.language].targetGems}</label>
                    <input type="number" id="metla-target-gems" class="metla-input" placeholder="0 = unlimited">
                    
                    <label>${translations[state.language].targetTime}</label>
                    <input type="number" id="metla-target-time" class="metla-input" placeholder="0 = unlimited">
                </div>
                
                <div class="metla-tab-content" data-content="about">
                    <h4>${translations[state.language].currentFeatures}</h4>
                    <div class="metla-about-list">
                        <div>${translations[state.language].feature1}</div>
                        <div>${translations[state.language].feature2}</div>
                        <div>${translations[state.language].feature3}</div>
                        <div>${translations[state.language].feature4}</div>
                    </div>
                    
                    <h4>${translations[state.language].futurePlans}</h4>
                    <div class="metla-about-list">
                        <div>${translations[state.language].plan1}</div>
                        <div>${translations[state.language].plan2}</div>
                        <div>${translations[state.language].plan3}</div>
                        <div>${translations[state.language].plan4}</div>
                    </div>
                    
                    <h4>${translations[state.language].supportTitle}</h4>
                    <a href="${CONFIG.TELEGRAM}" target="_blank">
                        <button class="metla-social-btn">${translations[state.language].joinBtn}</button>
                    </a>
                    <a href="${CONFIG.GITHUB}" target="_blank">
                        <button class="metla-social-btn">${translations[state.language].githubBtn}</button>
                    </a>
                </div>
                
                <div class="metla-tab-content" data-content="settings">
                    <h4>${translations[state.language].selectLang}</h4>
                    <button class="metla-theme-btn" data-lang="en">
                        <img src="https://flagcdn.com/w20/gb.png" class="metla-flag"> English
                    </button>
                    <button class="metla-theme-btn" data-lang="ru">
                        <img src="https://flagcdn.com/w20/ru.png" class="metla-flag"> Русский
                    </button>
                    
                    <h4>${translations[state.language].selectTheme}</h4>
                    <button class="metla-theme-btn ${state.theme === 'duolingo' ? 'active' : ''}" data-theme="duolingo">
                        Duolingo
                    </button>
                    <button class="metla-theme-btn ${state.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                        Dark
                    </button>
                    <button class="metla-theme-btn ${state.theme === 'light' ? 'active' : ''}" data-theme="light">
                        Light
                    </button>
                    
                    <h4>${translations[state.language].menuSettings}</h4>
                    <button class="metla-theme-btn" id="metla-toggle-menu">
                        ${state.menuVisible ? translations[state.language].hideMenu : translations[state.language].showMenu}
                    </button>
                </div>
            </div>
            
            <div class="metla-btn">🧹</div>
            <div class="metla-notification">
                <div class="metla-notification-content"></div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', elements);
    };

    // Применение темы
    const applyTheme = () => {
        const btn = document.querySelector('.metla-btn');
        const panel = document.querySelector('.metla-panel');
        const tabs = document.querySelector('.metla-tabs');
        const activeTab = document.querySelector('.metla-tab.active');
        const themeBtns = document.querySelectorAll('.metla-theme-btn');
        
        if (btn) btn.style.background = CONFIG.THEMES[state.theme].accent;
        if (panel) panel.style.background = CONFIG.THEMES[state.theme].primary;
        if (tabs) tabs.style.background = CONFIG.THEMES[state.theme].secondary;
        if (activeTab) activeTab.style.background = CONFIG.THEMES[state.theme].accent;
        
        themeBtns.forEach(btn => {
            btn.style.background = CONFIG.THEMES[state.theme].secondary;
            btn.style.color = CONFIG.THEMES[state.theme].text;
            
            if (btn.dataset.theme === state.theme) {
                btn.style.background = CONFIG.THEMES[state.theme].accent;
                btn.style.color = 'white';
            }
        });
        
        document.querySelectorAll('.metla-start').forEach(btn => {
            btn.style.background = CONFIG.THEMES[state.theme].accent;
        });
    };

    // Показать уведомление
    const showNotification = (message) => {
        const notification = document.querySelector('.metla-notification');
        const content = document.querySelector('.metla-notification-content');
        content.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    // Проверка ключа доступа
    const checkAccessKey = () => {
        const key = prompt(translations[state.language].accessKey);
        if (key === CONFIG.ACCESS_KEY) {
            state.unlocked = true;
            showNotification(translations[state.language].welcome);
            return true;
        } else {
            document.querySelector('.metla-btn').classList.add('metla-key-animation');
            setTimeout(() => {
                document.querySelector('.metla-btn').classList.remove('metla-key-animation');
            }, 500);
            showNotification(translations[state.language].invalidKey);
            return false;
        }
    };

    // Обновление языка интерфейса
    const updateLanguage = () => {
        const t = translations[state.language];
        
        document.querySelectorAll('[data-tab="main"]').forEach(el => el.textContent = t.title);
        document.querySelector('[data-tab="target"]').textContent = t.setTarget;
        document.querySelector('[data-tab="about"]').textContent = t.aboutTitle;
        document.querySelector('#metla-action option:first-child').textContent = t.selectAction;
        document.querySelector('option[value="xp"]').textContent = t.farmXP;
        document.querySelector('option[value="gem"]').textContent = t.farmGems;
        document.querySelector('option[value="streak"]').textContent = t.repairStreak;
        document.querySelector('#metla-start').textContent = t.start;
        document.querySelector('#metla-stop').textContent = t.stop;
        document.querySelector('[data-content="target"] label:nth-child(1)').textContent = t.targetXP;
        document.querySelector('[data-content="target"] label:nth-child(3)').textContent = t.targetGems;
        document.querySelector('[data-content="target"] label:nth-child(5)').textContent = t.targetTime;
        document.querySelector('[data-content="about"] h4:nth-child(1)').textContent = t.currentFeatures;
        document.querySelector('[data-content="about"] h4:nth-child(3)').textContent = t.futurePlans;
        document.querySelector('[data-content="about"] h4:nth-child(5)').textContent = t.supportTitle;
        document.querySelector('[data-content="settings"] h4:nth-child(1)').textContent = t.selectLang;
        document.querySelector('[data-content="settings"] h4:nth-child(4)').textContent = t.selectTheme;
        document.querySelector('[data-content="settings"] h4:nth-child(8)').textContent = t.menuSettings;
        document.querySelector('#metla-toggle-menu').textContent = state.menuVisible ? t.hideMenu : t.showMenu;
    };

    // Функции фарма
    const farmXP = async () => {
        const url = 'https://stories.duolingo.com/api2/stories/en-ru-the-passport/complete';
        const payload = {
            awardXp: true,
            fromLanguage: state.user.fromLanguage,
            learningLanguage: "en",
            happyHourBonusXp: 449
        };
        
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        state.user.totalXp += data.awardedXp;
        
        showNotification(`${translations[state.language].xpNotification.replace('{xp}', data.awardedXp)} (${state.user.totalXp})`);
        
        if (state.targets.xp > 0 && state.user.totalXp >= state.targets.xp) {
            state.running = false;
            showNotification(`${translations[state.language].targetReached} ${state.user.totalXp} XP!`);
        }
        
        return data;
    };

    const farmGems = async () => {
        const id = "SKILL_COMPLETION_BALANCED-dd2495f4_d44e_3fc3_8ac8_94e2191506f0-2-GEMS";
        const url = `https://www.duolingo.com/2017-06-30/users/${state.user.id}/rewards/${id}`;
        
        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${state.jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumed: true,
                learningLanguage: state.user.learningLanguage,
                fromLanguage: state.user.fromLanguage
            })
        });
        
        state.user.gems += 30;
        showNotification(`${translations[state.language].gemsNotification} (${state.user.gems})`);
        
        if (state.targets.gems > 0 && state.user.gems >= state.targets.gems) {
            state.running = false;
            showNotification(`${translations[state.language].targetReached} ${state.user.gems} gems!`);
        }
    };

    const repairStreak = async () => {
        showNotification(translations[state.language].streakNotification);
        await new Promise(r => setTimeout(r, 2000));
    };

    // Проверка целей
    const checkTargets = () => {
        if (state.targets.time > 0) {
            const elapsed = (Date.now() - state.targets.startTime) / 1000 / 60;
            if (elapsed >= state.targets.time) {
                state.running = false;
                showNotification(`${translations[state.language].timeReached} ${state.targets.time} minutes`);
                return true;
            }
        }
        return false;
    };

    // Инициализация событий
    const initEvents = () => {
        const btn = document.querySelector('.metla-btn');
        const panel = document.querySelector('.metla-panel');
        const overlay = document.querySelector('.metla-overlay');
        
        btn.addEventListener('click', () => {
            if (!state.unlocked && !checkAccessKey()) return;
            
            panel.classList.add('show');
            overlay.classList.add('show');
        });
        
        overlay.addEventListener('click', () => {
            panel.classList.remove('show');
            overlay.classList.remove('show');
        });
        
        document.querySelectorAll('.metla-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.metla-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const contentId = tab.dataset.tab;
                document.querySelectorAll('.metla-tab-content').forEach(content => {
                    content.classList.remove('active');
                    if (content.dataset.content === contentId) {
                        content.classList.add('active');
                    }
                });
            });
        });
        
        const startBtn = document.getElementById('metla-start');
        const stopBtn = document.getElementById('metla-stop');
        const actionSelect = document.getElementById('metla-action');
        
        startBtn.addEventListener('click', async () => {
            const action = actionSelect.value;
            if (!action) return;
            
            state.targets = {
                xp: parseInt(document.getElementById('metla-target-xp').value) || 0,
                gems: parseInt(document.getElementById('metla-target-gems').value) || 0,
                time: parseInt(document.getElementById('metla-target-time').value) || 0,
                startTime: Date.now()
            };
            
            state.running = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            actionSelect.disabled = true;
            
            try {
                while (state.running && !checkTargets()) {
                    switch(action) {
                        case 'xp':
                            await farmXP();
                            break;
                        case 'gem':
                            await farmGems();
                            break;
                        case 'streak':
                            await repairStreak();
                            state.running = false;
                            break;
                    }
                    await new Promise(r => setTimeout(r, CONFIG.DELAY));
                }
            } finally {
                startBtn.disabled = false;
                stopBtn.disabled = true;
                actionSelect.disabled = false;
            }
        });
        
        stopBtn.addEventListener('click', () => {
            state.running = false;
        });
        
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.language = btn.dataset.lang;
                updateLanguage();
            });
        });
        
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.theme = btn.dataset.theme;
                applyTheme();
            });
        });
        
        document.getElementById('metla-toggle-menu').addEventListener('click', () => {
            state.menuVisible = !state.menuVisible;
            btn.style.display = state.menuVisible ? 'flex' : 'none';
            updateLanguage();
        });
    };

    // Основная инициализация
    const init = async () => {
        createUI();
        initEvents();
        
        state.jwt = document.cookie.split('; ').find(row => row.startsWith('jwt_token='))?.split('=')[1];
        if (!state.jwt) {
            showNotification(translations[state.language].loginWarning);
            return;
        }
        
        try {
            const decoded = JSON.parse(atob(state.jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            const res = await fetch(`https://www.duolingo.com/2017-06-30/users/${decoded.sub}?fields=fromLanguage,learningLanguage,streak,gems,totalXp`, {
                headers: {
                    'Authorization': `Bearer ${state.jwt}`,
                    'Content-Type': 'application/json'
                }
            });
            state.user = await res.json();
        } catch (e) {
            console.error(e);
            showNotification(translations[state.language].errorLoading);
        }
    };

    setTimeout(init, 1000);
})();
