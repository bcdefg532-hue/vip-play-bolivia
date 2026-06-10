// ==========================================
// VIP PLAY BOLIVIA - LÓGICA PRINCIPAL
// ==========================================

// Variables Globales
let currentUser = null;
let users = [];
let payments = [];
let missions = [];
let claims = [];
let raffles = [];
let achievements = [];
let referrals = [];

const VIP_PRICES = {
    1: 10,
    2: 20,
    3: 50,
    elite: 100
};

const VIP_DIAMONDS = {
    1: 110,
    2: 220,
    3: 570,
    elite: 1166
};

const VIP_TICKETS = {
    1: 1,
    2: 3,
    3: 7,
    elite: 15
};

const MISSIONS_DATA = [
    { id: 1, name: 'Juega 5 partidas', icon: '🎮', reward: 50, type: 'games', target: 5 },
    { id: 2, name: 'Gana 3 partidas', icon: '🏆', reward: 100, type: 'wins', target: 3 },
    { id: 3, name: 'Inicia sesión diariamente', icon: '📅', reward: 25, type: 'daily', target: 7 },
    { id: 4, name: 'Completa un nivel en cualquier juego', icon: '⭐', reward: 75, type: 'level', target: 1 },
    { id: 5, name: 'Invita 2 amigos', icon: '👥', reward: 150, type: 'referral', target: 2 },
    { id: 6, name: 'Obtén 1000 puntos totales', icon: '💯', reward: 200, type: 'points', target: 1000 },
    { id: 7, name: 'Completa 10 misiones', icon: '✅', reward: 300, type: 'missions', target: 10 },
    { id: 8, name: 'Desbloquea 5 logros', icon: '🎖️', reward: 250, type: 'achievements', target: 5 }
];

// ==========================================
// INICIALIZACIÓN
// ==========================================

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        loadFromStorage();
        
        if (currentUser) {
            showMainScreen();
        } else {
            showAuthScreen();
        }
    }, 1500);
});

// ==========================================
// ALMACENAMIENTO LOCAL
// ==========================================

function saveToStorage() {
    localStorage.setItem('vipplay_users', JSON.stringify(users));
    localStorage.setItem('vipplay_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('vipplay_payments', JSON.stringify(payments));
    localStorage.setItem('vipplay_missions', JSON.stringify(missions));
    localStorage.setItem('vipplay_claims', JSON.stringify(claims));
    localStorage.setItem('vipplay_raffles', JSON.stringify(raffles));
    localStorage.setItem('vipplay_achievements', JSON.stringify(achievements));
    localStorage.setItem('vipplay_referrals', JSON.stringify(referrals));
}

function loadFromStorage() {
    users = JSON.parse(localStorage.getItem('vipplay_users')) || [];
    currentUser = JSON.parse(localStorage.getItem('vipplay_currentUser')) || null;
    payments = JSON.parse(localStorage.getItem('vipplay_payments')) || [];
    missions = JSON.parse(localStorage.getItem('vipplay_missions')) || [];
    claims = JSON.parse(localStorage.getItem('vipplay_claims')) || [];
    raffles = JSON.parse(localStorage.getItem('vipplay_raffles')) || [];
    achievements = JSON.parse(localStorage.getItem('vipplay_achievements')) || [];
    referrals = JSON.parse(localStorage.getItem('vipplay_referrals')) || [];

    // Inicializar admin si no existe
    if (users.length === 0) {
        users.push({
            id: 'admin001',
            username: 'admin',
            email: 'admin@vipplay.com',
            password: 'admin123',
            isAdmin: true,
            createdAt: new Date().toISOString()
        });
    }
}

// ==========================================
// AUTENTICACIÓN
// ==========================================

function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!username || !email || !password || !confirmPassword) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (users.some(u => u.email === email)) {
        showNotification('Este email ya está registrado', 'error');
        return;
    }

    const newUser = {
        id: 'user_' + Date.now(),
        username: username,
        email: email,
        password: password,
        vipLevel: 'basico',
        diamonds: 0,
        points: 0,
        tickets: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        totalScore: 0,
        referralCode: generateReferralCode(),
        createdAt: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
        isAdmin: false
    };

    users.push(newUser);
    saveToStorage();
    showNotification('¡Cuenta creada exitosamente!', 'success');
    
    setTimeout(() => {
        toggleAuthForm();
        document.getElementById('regUsername').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirmPassword').value = '';
    }, 1000);
}

function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showNotification('Por favor ingresa tu email y contraseña', 'error');
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showNotification('Email o contraseña incorrectos', 'error');
        return;
    }

    currentUser = user;
    currentUser.lastLoginDate = new Date().toISOString();
    saveToStorage();
    showNotification('¡Bienvenido de vuelta, ' + user.username + '!', 'success');
    
    setTimeout(() => {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        showMainScreen();
    }, 1000);
}

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        currentUser = null;
        saveToStorage();
        showAuthScreen();
        showNotification('Sesión cerrada', 'success');
    }
}

function recoverPassword() {
    const email = document.getElementById('recoverEmail').value.trim();
    
    if (!email) {
        showNotification('Por favor ingresa tu email', 'error');
        return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
        showNotification('Email no encontrado', 'error');
        return;
    }

    showNotification('Se ha enviado un email de recuperación a: ' + email, 'success');
    setTimeout(() => {
        showLoginForm();
    }, 2000);
}

function toggleAuthForm() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm.classList.contains('hidden')) {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
}

function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('recoverPasswordForm').classList.add('hidden');
}

function showRecoverPassword() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('recoverPasswordForm').classList.remove('hidden');
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

function showMainScreen() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    updateDashboard();
    showSection('home');
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    // Remover clase active de todos los nav-links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const section = document.getElementById(sectionName + 'Section');
    if (section) {
        section.classList.remove('hidden');
        section.classList.add('active');
    }

    // Marcar nav-link como active
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Ejecutar funciones específicas
    switch(sectionName) {
        case 'home':
            updateDashboard();
            break;
        case 'ranking':
            updateRanking();
            break;
        case 'missions':
            loadMissions();
            break;
        case 'profile':
            updateProfile();
            break;
        case 'raffles':
            updateRaffles();
            break;
    }
}

// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {
    document.getElementById('welcomeUsername').textContent = currentUser.username;
    document.getElementById('userDiamonds').textContent = '💎 ' + currentUser.diamonds;
    document.getElementById('userLevel').textContent = '👑 ' + (currentUser.vipLevel === 'elite' ? 'VIP ELITE' : 'VIP ' + currentUser.vipLevel);
    
    document.getElementById('statDiamonds').textContent = currentUser.diamonds;
    document.getElementById('statPoints').textContent = currentUser.points;
    document.getElementById('statTickets').textContent = currentUser.tickets;
    document.getElementById('statAchievements').textContent = achievements.filter(a => a.userId === currentUser.id && a.unlocked).length;

    updateChestStatus();
}

function updateChestStatus() {
    const lastChestDate = localStorage.getItem('lastChestDate_' + currentUser.id);
    const today = new Date().toDateString();
    const btn = document.getElementById('dailyChestBtn');
    const status = document.getElementById('chestStatus');

    if (lastChestDate === today) {
        btn.disabled = true;
        btn.textContent = 'Cofre ya abierto hoy';
        status.textContent = 'Vuelve mañana para otro cofre';
    } else {
        btn.disabled = false;
        btn.textContent = 'Abre tu Cofre';
        status.textContent = 'Tienes un cofre disponible';
    }
}

function openDailyChest() {
    const reward = Math.floor(Math.random() * 50) + 25;
    currentUser.diamonds += reward;
    currentUser.points += reward / 2;
    
    const today = new Date().toDateString();
    localStorage.setItem('lastChestDate_' + currentUser.id, today);
    
    saveToStorage();
    updateDashboard();
    
    showNotification(`¡Has ganado ${reward} Diamantes del cofre diario!`, 'success');
}

// ==========================================
// SISTEMA VIP
// ==========================================

function selectVIP(level) {
    const levelStr = level.toString();
    const vipNames = { '1': 'VIP 1', '2': 'VIP 2', '3': 'VIP 3', 'elite': 'VIP ELITE' };
    
    // Guardar nivel seleccionado
    sessionStorage.setItem('selectedVIP', level);
    
    // Actualizar información del pago
    document.getElementById('paymentVIPName').textContent = vipNames[levelStr] + ' - ' + VIP_PRICES[level] + ' Bs';
    
    // Ocultar sección VIP y mostrar sección de pago
    document.getElementById('vipSection').classList.add('hidden');
    document.getElementById('paymentSection').classList.remove('hidden');
    
    // Generar QR después de que la sección sea visible
    setTimeout(() => {
        generateQRCode(level);
    }, 200);
    
    showNotification('Seleccionaste ' + vipNames[levelStr] + '. Escanea el código QR para pagar.', 'info');
}

function generateQRCode(level) {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    
    try {
        // Generar el código QR base
        const qrCode = new QRCode(qrContainer, {
            text: 'VIP_PLAY_BOLIVIA_' + level + '_' + currentUser.id + '_' + Date.now(),
            width: 250,
            height: 250,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Esperar a que se genere y agregar el símbolo de dinero
        setTimeout(() => {
            const qrCanvas = qrContainer.querySelector('canvas');
            
            if (qrCanvas) {
                // Crear un nuevo canvas para dibujar encima del QR
                const finalCanvas = document.createElement('canvas');
                const ctx = finalCanvas.getContext('2d');
                
                finalCanvas.width = qrCanvas.width;
                finalCanvas.height = qrCanvas.height;
                
                // Dibujar el QR original
                ctx.drawImage(qrCanvas, 0, 0);
                
                // Dibujar círculo blanco en el centro
                const centerX = finalCanvas.width / 2;
                const centerY = finalCanvas.height / 2;
                const radius = 40;
                
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
                
                // Dibujar borde del círculo
                ctx.strokeStyle = '#cccccc';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Dibujar símbolo de dinero ($) en el centro
                ctx.fillStyle = '#ff9900';
                ctx.font = 'bold 60px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', centerX, centerY);
                
                // Reemplazar el canvas original con el nuevo
                qrContainer.innerHTML = '';
                qrContainer.appendChild(finalCanvas);
                
                console.log('QR generado correctamente con símbolo $ para nivel VIP:', level);
            }
        }, 300);
    } catch (e) {
        console.error('Error generando QR:', e);
        qrContainer.innerHTML = '<p style="color: red; text-align: center;">Error generando QR. Intenta de nuevo.</p>';
    }
}

function previewReceipt() {
    const file = document.getElementById('receiptUpload').files[0];
    const preview = document.getElementById('receiptPreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Comprobante">`;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function submitPayment() {
    const receiptFile = document.getElementById('receiptUpload').files[0];
    const vipLevel = sessionStorage.getItem('selectedVIP');

    if (!receiptFile) {
        showNotification('Por favor sube una foto del comprobante', 'error');
        return;
    }

    if (!vipLevel) {
        showNotification('Error: No se seleccionó nivel VIP', 'error');
        return;
    }

    const payment = {
        id: 'pay_' + Date.now(),
        userId: currentUser.id,
        vipLevel: vipLevel,
        amount: VIP_PRICES[vipLevel],
        status: 'pendiente',
        receiptFileName: receiptFile.name,
        createdAt: new Date().toISOString()
    };

    payments.push(payment);
    saveToStorage();

    document.getElementById('paymentStatus').classList.remove('hidden');
    document.getElementById('paymentStatusText').textContent = '✓ Comprobante enviado. Tu pago está en revisión. Te notificaremos cuando sea aprobado.';
    document.getElementById('paymentStatus').style.background = 'rgba(0, 255, 0, 0.2)';

    setTimeout(() => {
        resetPaymentForm();
        backToVIP();
    }, 3000);

    showNotification('Comprobante de pago enviado para revisión', 'success');
}

function backToVIP() {
    resetPaymentForm();
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('vipSection').classList.remove('hidden');
}

function resetPaymentForm() {
    document.getElementById('receiptUpload').value = '';
    document.getElementById('receiptPreview').classList.add('hidden');
    document.getElementById('paymentStatus').classList.add('hidden');
    sessionStorage.removeItem('selectedVIP');
}

// ==========================================
// MINIJUEGOS
// ==========================================

function startGame(gameType) {
    document.getElementById('gameModal').classList.remove('hidden');
    const gameContainer = document.getElementById('gameContainer');
    
    switch(gameType) {
        case 'race':
            createRaceGame(gameContainer);
            break;
        case 'penalties':
            createPenaltiesGame(gameContainer);
            break;
        case 'memory':
            createMemoryGame(gameContainer);
            break;
        case 'runner':
            createRunnerGame(gameContainer);
            break;
        case 'shooting':
            createShootingGame(gameContainer);
            break;
    }
}

function closeGameModal() {
    document.getElementById('gameModal').classList.add('hidden');
    document.getElementById('gameContainer').innerHTML = '';
}

function endGame(gameType, points) {
    currentUser.gamesPlayed++;
    currentUser.points += points;
    currentUser.totalScore += points;
    
    saveToStorage();
    updateDashboard();
    
    showNotification(`¡Ganaste ${points} puntos en el juego!`, 'success');
}

// ==========================================
// MISIONES
// ==========================================

function loadMissions() {
    const missionsList = document.getElementById('missionsList');
    missionsList.innerHTML = '';

    MISSIONS_DATA.forEach(mission => {
        let progress = currentUser[mission.type] || 0;
        let percentage = Math.min((progress / mission.target) * 100, 100);

        const missionEl = document.createElement('div');
        missionEl.className = 'mission-card';
        missionEl.innerHTML = `
            <div class="mission-info">
                <h4>${mission.icon} ${mission.name}</h4>
                <p>Progreso: ${progress}/${mission.target}</p>
                <div class="progress-bar-large">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p>Recompensa: ${mission.reward} puntos</p>
            </div>
            ${percentage === 100 ? '<button class="btn-primary" onclick="claimMissionReward(' + mission.id + ')">Reclamar</button>' : ''}
        `;
        missionsList.appendChild(missionEl);
    });

    // Actualizar progreso general
    const totalMissions = MISSIONS_DATA.length;
    const completedMissions = MISSIONS_DATA.filter(m => {
        const progress = currentUser[m.type] || 0;
        return progress >= m.target;
    }).length;

    const progressPercent = (completedMissions / totalMissions) * 100;
    document.getElementById('vipProgressBar').style.width = progressPercent + '%';
    document.getElementById('vipProgressText').textContent = Math.round(progressPercent);
}

function claimMissionReward(missionId) {
    const mission = MISSIONS_DATA.find(m => m.id === missionId);
    if (mission) {
        currentUser.points += mission.reward;
        currentUser.diamonds += Math.floor(mission.reward / 10);
        saveToStorage();
        loadMissions();
        showNotification(`¡Recompensa de misión reclamada! +${mission.reward} puntos`, 'success');
    }
}

// ==========================================
// RANKING
// ==========================================

function updateRanking() {
    const sortedUsers = [...users].filter(u => !u.isAdmin).sort((a, b) => (b.points || 0) - (a.points || 0));
    const rankingBody = document.getElementById('rankingBody');
    rankingBody.innerHTML = '';

    sortedUsers.slice(0, 20).forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${medal}</td>
            <td>${user.username}</td>
            <td>${user.points || 0}</td>
            <td>${user.vipLevel === 'elite' ? 'VIP ELITE' : 'VIP ' + user.vipLevel}</td>
        `;
        rankingBody.appendChild(row);
    });

    // Mis estadísticas
    document.getElementById('myTotalPoints').textContent = currentUser.points || 0;
    document.getElementById('myGamesPlayed').textContent = currentUser.gamesPlayed || 0;
    const winRate = currentUser.gamesPlayed > 0 ? Math.round((currentUser.gamesWon || 0) / currentUser.gamesPlayed * 100) : 0;
    document.getElementById('myWinRate').textContent = winRate + '%';
    document.getElementById('myAchievements').textContent = achievements.filter(a => a.userId === currentUser.id && a.unlocked).length;
}

// ==========================================
// PERFIL
// ==========================================

function updateProfile() {
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileLevel').textContent = currentUser.vipLevel === 'elite' ? 'VIP ELITE' : 'VIP ' + currentUser.vipLevel;
    document.getElementById('profileDiamonds').textContent = currentUser.diamonds;
    document.getElementById('profilePoints').textContent = currentUser.points;

    loadAchievements();
    loadReferrals();
    loadClaims();
}

function showProfileTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function loadAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';

    const defaultAchievements = [
        { id: 1, name: 'Primer Juego', icon: '🎮', description: 'Juega tu primer juego' },
        { id: 2, name: 'Coleccionista', icon: '💎', description: 'Gana 500 diamantes' },
        { id: 3, name: 'Campeón', icon: '🏆', description: 'Gana 10 partidas' },
        { id: 4, name: 'Socializador', icon: '👥', description: 'Invita 5 amigos' },
        { id: 5, name: 'Multimillonario', icon: '💰', description: 'Gana 10000 puntos' },
        { id: 6, name: 'VIP Elite', icon: '👑', description: 'Obtén nivel VIP Elite' }
    ];

    defaultAchievements.forEach(ach => {
        const unlocked = currentUser.points > 500 || currentUser.diamonds > 500;
        const achEl = document.createElement('div');
        achEl.className = 'achievement-item ' + (unlocked ? 'unlocked' : 'locked');
        achEl.innerHTML = `
            <div class="ach-icon">${ach.icon}</div>
            <h4>${ach.name}</h4>
            <p>${ach.description}</p>
        `;
        achievementsList.appendChild(achEl);
    });
}

function loadReferrals() {
    document.getElementById('referralCode').value = currentUser.referralCode;
    const referralsList = document.getElementById('referralsList');
    referralsList.innerHTML = '<p>Invita amigos usando tu código y gana recompensas</p>';
}

function copyReferralCode() {
    const code = document.getElementById('referralCode').value;
    navigator.clipboard.writeText(code);
    showNotification('Código de referido copiado: ' + code, 'success');
}

function loadClaims() {
    const claimsList = document.getElementById('claimsList');
    claimsList.innerHTML = '';

    if (claims.length === 0) {
        claimsList.innerHTML = '<p>No hay solicitudes de reclamo aún</p>';
        return;
    }

    claims.forEach(claim => {
        const claimEl = document.createElement('div');
        claimEl.className = 'claim-item';
        claimEl.innerHTML = `
            <p><strong>Juego:</strong> ${claim.game}</p>
            <p><strong>Nivel:</strong> ${claim.vipLevel}</p>
            <p><strong>Estado:</strong> ${claim.status}</p>
            <p><strong>Fecha:</strong> ${new Date(claim.createdAt).toLocaleDateString()}</p>
        `;
        claimsList.appendChild(claimEl);
    });
}

function submitRewardClaim(event) {
    event.preventDefault();

    const claim = {
        id: 'claim_' + Date.time(),
        userId: currentUser.id,
        playerName: document.getElementById('claimPlayerName').value,
        playerId: document.getElementById('claimPlayerID').value,
        game: document.getElementById('claimGame').value,
        vipLevel: document.getElementById('claimVIPLevel').value,
        notes: document.getElementById('claimNotes').value,
        status: 'pendiente',
        createdAt: new Date().toISOString()
    };

    claims.push(claim);
    saveToStorage();

    showNotification('Solicitud de reclamo enviada para revisión', 'success');

    event.target.reset();
    loadClaims();
}

// ==========================================
// SORTEOS
// ==========================================

function updateRaffles() {
    document.getElementById('weeklyParticipants').textContent = Math.floor(Math.random() * 500) + 100;
    document.getElementById('monthlyParticipants').textContent = Math.floor(Math.random() * 2000) + 500;
    document.getElementById('weeklyTickets').textContent = currentUser.tickets;
    document.getElementById('monthlyTickets').textContent = currentUser.tickets;

    loadWinners();
}

function viewRaffleDetails(type) {
    const details = type === 'weekly' 
        ? '🎊 Sorteo Semanal\nPremio: 500 Diamantes\nParticipantes: ' + document.getElementById('weeklyParticipants').textContent
        : '🎁 Sorteo Mensual\nPremio: 2000 Diamantes + VIP Elite\nParticipantes: ' + document.getElementById('monthlyParticipants').textContent;
    
    showNotification(details, 'success');
}

function loadWinners() {
    const winnersList = document.getElementById('winnersList');
    winnersList.innerHTML = '';

    const mockWinners = [
        { username: 'JuanGamer', prize: '💎 500 Diamantes', date: 'Hace 3 días' },
        { username: 'MariAventura', prize: '💎 2000 Diamantes', date: 'Hace 1 semana' },
        { username: 'CarlosMaster', prize: 'VIP Elite Gratis', date: 'Hace 2 semanas' }
    ];

    mockWinners.forEach(winner => {
        const winnerEl = document.createElement('div');
        winnerEl.className = 'winner-item';
        winnerEl.innerHTML = `
            <p><strong>🏆 ${winner.username}</strong> ganó ${winner.prize}</p>
            <p style="font-size: 12px; color: #999;">${winner.date}</p>
        `;
        winnersList.appendChild(winnerEl);
    });
}

// ==========================================
// UTILIDADES
// ==========================================

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function generateReferralCode() {
    return 'VIP' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Permitir navegación con Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (document.getElementById('loginForm') && !document.getElementById('loginForm').classList.contains('hidden')) {
            login();
        } else if (document.getElementById('registerForm') && !document.getElementById('registerForm').classList.contains('hidden')) {
            register();
        }
    }
});
