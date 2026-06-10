// ==========================================
// VIP PLAY BOLIVIA - PANEL DE ADMINISTRACIÓN
// ==========================================

function showAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    event.target.classList.add('active');

    switch(tabName) {
        case 'users':
            loadAdminUsers();
            break;
        case 'payments':
            loadAdminPayments();
            break;
        case 'claims':
            loadAdminClaims();
            break;
        case 'raffles':
            loadAdminRaffles();
            break;
        case 'stats':
            loadAdminStats();
            break;
    }
}

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

function loadAdminUsers() {
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';

    const usersList = users.filter(u => !u.isAdmin);

    if (usersList.length === 0) {
        usersTable.innerHTML = '<p>No hay usuarios registrados</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Nivel VIP</th>
                <th>Diamantes</th>
                <th>Puntos</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    usersList.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.vipLevel === 'elite' ? 'VIP ELITE' : 'VIP ' + user.vipLevel}</td>
            <td>${user.diamonds}</td>
            <td>${user.points}</td>
            <td>
                <button class="btn-secondary" onclick="editUser('${user.id}')">Editar</button>
                <button class="btn-secondary" onclick="deleteUser('${user.id}')" style="background: rgba(255, 51, 51, 0.2);">Eliminar</button>
            </td>
        `;
        table.querySelector('tbody').appendChild(row);
    });

    usersTable.appendChild(table);
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        showNotification(`Editar usuario: ${user.username}`, 'info');
    }
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        users = users.filter(u => u.id !== userId);
        saveToStorage();
        loadAdminUsers();
        showNotification('Usuario eliminado', 'success');
    }
}

// ==========================================
// GESTIÓN DE PAGOS
// ==========================================

function loadAdminPayments() {
    const paymentsTable = document.getElementById('paymentsTable');
    paymentsTable.innerHTML = '';

    if (payments.length === 0) {
        paymentsTable.innerHTML = '<p>No hay pagos registrados</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Usuario</th>
                <th>Nivel VIP</th>
                <th>Monto (Bs)</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    payments.forEach(payment => {
        const user = users.find(u => u.id === payment.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user ? user.username : 'Usuario eliminado'}</td>
            <td>${payment.vipLevel === 'elite' ? 'VIP ELITE' : 'VIP ' + payment.vipLevel}</td>
            <td>${payment.amount}</td>
            <td><span class="badge badge-${payment.status}">${payment.status}</span></td>
            <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
            <td>
                ${payment.status === 'pendiente' ? `
                    <button class="btn-secondary" onclick="approvePayment('${payment.id}')">Aprobar</button>
                    <button class="btn-secondary" onclick="rejectPayment('${payment.id}')" style="background: rgba(255, 51, 51, 0.2);">Rechazar</button>
                ` : `<span style="color: #00ff00;">✓ ${payment.status}</span>`}
            </td>
        `;
        table.querySelector('tbody').appendChild(row);
    });

    paymentsTable.appendChild(table);
}

function approvePayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    const user = users.find(u => u.id === payment.userId);

    if (user) {
        payment.status = 'verificado';
        user.vipLevel = payment.vipLevel;
        user.diamonds += VIP_DIAMONDS[payment.vipLevel];
        user.tickets += VIP_TICKETS[payment.vipLevel];

        saveToStorage();
        loadAdminPayments();
        showNotification(`Pago aprobado. Usuario ${user.username} ahora es VIP ${payment.vipLevel}`, 'success');
    }
}

function rejectPayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    payment.status = 'rechazado';
    saveToStorage();
    loadAdminPayments();
    showNotification('Pago rechazado', 'error');
}

// ==========================================
// GESTIÓN DE RECLAMOS
// ==========================================

function loadAdminClaims() {
    const claimsTable = document.getElementById('claimsTable');
    claimsTable.innerHTML = '';

    if (claims.length === 0) {
        claimsTable.innerHTML = '<p>No hay reclamos registrados</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Jugador</th>
                <th>Juego</th>
                <th>Nivel VIP</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    claims.forEach(claim => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${claim.playerName}</td>
            <td>${claim.game}</td>
            <td>${claim.vipLevel === 'elite' ? 'VIP ELITE' : 'VIP ' + claim.vipLevel}</td>
            <td><span class="badge badge-${claim.status}">${claim.status}</span></td>
            <td>${new Date(claim.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-secondary" onclick="approveClaim('${claim.id}')">Aprobar</button>
                <button class="btn-secondary" onclick="rejectClaim('${claim.id}')" style="background: rgba(255, 51, 51, 0.2);">Rechazar</button>
            </td>
        `;
        table.querySelector('tbody').appendChild(row);
    });

    claimsTable.appendChild(table);
}

function approveClaim(claimId) {
    const claim = claims.find(c => c.id === claimId);
    claim.status = 'aprobado';
    saveToStorage();
    loadAdminClaims();
    showNotification('Reclamo aprobado', 'success');
}

function rejectClaim(claimId) {
    const claim = claims.find(c => c.id === claimId);
    claim.status = 'rechazado';
    saveToStorage();
    loadAdminClaims();
    showNotification('Reclamo rechazado', 'warning');
}

// ==========================================
// GESTIÓN DE SORTEOS
// ==========================================

function loadAdminRaffles() {
    const rafflesManagement = document.getElementById('rafflesManagement');
    rafflesManagement.innerHTML = '';

    const raffleForm = `
        <div class="raffle-management-form">
            <h3>Crear Nuevo Sorteo</h3>
            <input type="text" id="raffleName" placeholder="Nombre del sorteo">
            <input type="number" id="rafflePrize" placeholder="Premio (diamantes)">
            <input type="number" id="raffleParticipants" placeholder="Participantes estimados">
            <button class="btn-primary" onclick="createRaffle()">Crear Sorteo</button>
        </div>
    `;

    rafflesManagement.innerHTML = raffleForm;

    const table = document.createElement('table');
    table.className = 'admin-data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Premio</th>
                <th>Participantes</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const mockRaffles = [
        { id: 1, name: 'Sorteo Semanal', prize: 500, participants: 250, status: 'activo' },
        { id: 2, name: 'Sorteo Mensual', prize: 2000, participants: 1500, status: 'activo' }
    ];

    mockRaffles.forEach(raffle => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${raffle.name}</td>
            <td>${raffle.prize} 💎</td>
            <td>${raffle.participants}</td>
            <td><span class="badge badge-${raffle.status}">${raffle.status}</span></td>
            <td>
                <button class="btn-secondary" onclick="selectWinner(${raffle.id})">Elegir Ganador</button>
            </td>
        `;
        table.querySelector('tbody').appendChild(row);
    });

    rafflesManagement.appendChild(table);
}

function createRaffle() {
    const name = document.getElementById('raffleName').value;
    const prize = document.getElementById('rafflePrize').value;
    
    if (name && prize) {
        showNotification('Sorteo creado: ' + name, 'success');
        document.getElementById('raffleName').value = '';
        document.getElementById('rafflePrize').value = '';
    }
}

function selectWinner(raffleId) {
    const userList = users.filter(u => !u.isAdmin && u.tickets > 0);
    if (userList.length === 0) {
        showNotification('No hay participantes válidos', 'warning');
        return;
    }

    const winner = userList[Math.floor(Math.random() * userList.length)];
    winner.diamonds += 500;
    saveToStorage();
    showNotification('¡Ganador seleccionado: ' + winner.username + '!', 'success');
}

// ==========================================
// ESTADÍSTICAS GENERALES
// ==========================================

function loadAdminStats() {
    const statsOverview = document.getElementById('statsOverview');
    statsOverview.innerHTML = '';

    const totalUsers = users.filter(u => !u.isAdmin).length;
    const totalPayments = payments.length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalClaims = claims.length;
    const approvedPayments = payments.filter(p => p.status === 'verificado').length;

    const stats = `
        <div class="stats-grid">
            <div class="stat-box">
                <h4>Total de Usuarios</h4>
                <p class="stat-value">${totalUsers}</p>
            </div>
            <div class="stat-box">
                <h4>Pagos Registrados</h4>
                <p class="stat-value">${totalPayments}</p>
            </div>
            <div class="stat-box">
                <h4>Ingresos Totales</h4>
                <p class="stat-value">${totalRevenue} Bs</p>
            </div>
            <div class="stat-box">
                <h4>Pagos Verificados</h4>
                <p class="stat-value">${approvedPayments}</p>
            </div>
            <div class="stat-box">
                <h4>Reclamos Pendientes</h4>
                <p class="stat-value">${claims.filter(c => c.status === 'pendiente').length}</p>
            </div>
            <div class="stat-box">
                <h4>Diamantes en Circulación</h4>
                <p class="stat-value">${users.reduce((sum, u) => sum + (u.diamonds || 0), 0)}</p>
            </div>
        </div>

        <div class="stats-details">
            <h3>Distribución de Niveles VIP</h3>
            <p>VIP 1: ${users.filter(u => u.vipLevel === '1').length} usuarios</p>
            <p>VIP 2: ${users.filter(u => u.vipLevel === '2').length} usuarios</p>
            <p>VIP 3: ${users.filter(u => u.vipLevel === '3').length} usuarios</p>
            <p>VIP ELITE: ${users.filter(u => u.vipLevel === 'elite').length} usuarios</p>
        </div>
    `;

    statsOverview.innerHTML = stats;
}

// ==========================================
// ESTILOS ADICIONALES PARA ADMIN
// ==========================================

const adminStyles = `
    <style>
        .admin-data-table {
            width: 100%;
            border-collapse: collapse;
            background: var(--darker);
            border: 2px solid var(--primary);
            border-radius: 12px;
            overflow: hidden;
            margin-top: 20px;
        }

        .admin-data-table thead {
            background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
        }

        .admin-data-table th {
            padding: 15px;
            text-align: left;
            color: white;
            font-weight: bold;
        }

        .admin-data-table td {
            padding: 12px 15px;
            border-bottom: 1px solid var(--border);
            color: rgba(255, 255, 255, 0.9);
        }

        .admin-data-table tbody tr:hover {
            background: rgba(255, 153, 0, 0.1);
        }

        .badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }

        .badge-pendiente {
            background: rgba(255, 165, 0, 0.2);
            color: #ffa500;
        }

        .badge-verificado {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
        }

        .badge-rechazado {
            background: rgba(255, 51, 51, 0.2);
            color: #ff3333;
        }

        .badge-aprobado {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
        }

        .badge-activo {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
        }

        .raffle-management-form {
            background: rgba(255, 153, 0, 0.1);
            padding: 20px;
            border: 2px solid var(--primary);
            border-radius: 12px;
            margin-bottom: 20px;
        }

        .raffle-management-form h3 {
            color: var(--gold);
            margin-bottom: 15px;
        }

        .raffle-management-form input {
            margin-bottom: 10px;
        }

        .stat-box {
            background: linear-gradient(135deg, var(--darker) 0%, #2a2a2a 100%);
            border: 2px solid var(--primary);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 0 15px rgba(255, 153, 0, 0.2);
        }

        .stat-box h4 {
            color: var(--gold);
            margin-bottom: 10px;
        }

        .stat-value {
            font-size: 28px;
            color: var(--primary);
            font-weight: bold;
        }

        .stats-details {
            background: linear-gradient(135deg, rgba(255, 153, 0, 0.1) 0%, rgba(255, 85, 0, 0.1) 100%);
            border: 2px solid var(--primary);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
        }

        .stats-details h3 {
            color: var(--gold);
            margin-bottom: 15px;
        }

        .stats-details p {
            color: rgba(255, 255, 255, 0.8);
            padding: 8px 0;
            border-bottom: 1px solid var(--border);
        }

        .stats-details p:last-child {
            border-bottom: none;
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', adminStyles);