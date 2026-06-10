// ==========================================
// VIP PLAY BOLIVIA - MINIJUEGOS
// ==========================================

// ==========================================
// CARRERA DE AUTOS
// ==========================================

function createRaceGame(container) {
    const game = `
        <div class="game-header">
            <h2>🚗 Carrera de Autos</h2>
            <button class="close-btn" onclick="closeGameModal()">✕</button>
        </div>
        <div class="game-content">
            <canvas id="raceCanvas" width="600" height="400"></canvas>
            <div class="game-controls">
                <p>Usa ← → para moverte | Barra espaciadora para acelerar</p>
                <p id="raceScore">Puntuación: 0</p>
                <p id="raceTime">Tiempo: 30s</p>
            </div>
        </div>
    `;
    container.innerHTML = game;
    startRaceGame();
}

function startRaceGame() {
    const canvas = document.getElementById('raceCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let timeLeft = 30;
    let gameRunning = true;

    const player = { x: 280, y: 350, width: 40, height: 30, speed: 5 };
    const enemies = [];
    const keys = {};

    document.addEventListener('keydown', (e) => keys[e.key] = true);
    document.addEventListener('keyup', (e) => keys[e.key] = false);

    function createEnemy() {
        if (gameRunning) {
            enemies.push({
                x: Math.random() * 560,
                y: -30,
                width: 40,
                height: 30,
                speed: Math.random() * 3 + 2
            });
        }
    }

    function update() {
        // Movimiento del jugador
        if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
        if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

        // Acelerar
        if (keys[' ']) score += 1;

        // Actualizar enemigos
        enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed;
            
            // Colisión
            if (checkCollision(player, enemy)) {
                score += 10;
                enemies.splice(index, 1);
            }
            
            // Remover enemigos fuera de pantalla
            if (enemy.y > canvas.height) {
                enemies.splice(index, 1);
            }
        });

        document.getElementById('raceScore').textContent = 'Puntuación: ' + score;
    }

    function draw() {
        // Fondo
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Línea central
        ctx.strokeStyle = '#ff9900';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Jugador
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Enemigos
        ctx.fillStyle = '#ff3333';
        enemies.forEach(enemy => {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }

    function gameLoop() {
        if (!gameRunning) return;
        
        update();
        draw();
        
        if (timeLeft > 0) {
            requestAnimationFrame(gameLoop);
        } else {
            endRaceGame(score);
        }
    }

    function countdown() {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById('raceTime').textContent = 'Tiempo: ' + timeLeft + 's';
            setTimeout(countdown, 1000);
        }
    }

    // Crear enemigos cada cierto tiempo
    setInterval(createEnemy, 1000);
    countdown();
    gameLoop();
}

function endRaceGame(score) {
    endGame('race', score);
    closeGameModal();
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ==========================================
// PENALES DE FÚTBOL
// ==========================================

function createPenaltiesGame(container) {
    const game = `
        <div class="game-header">
            <h2>⚽ Penales de Fútbol</h2>
            <button class="close-btn" onclick="closeGameModal()">✕</button>
        </div>
        <div class="game-content">
            <div id="penaltiesField" class="penalties-field">
                <div class="goal">
                    <div class="goal-zone" data-zone="1"></div>
                    <div class="goal-zone" data-zone="2"></div>
                    <div class="goal-zone" data-zone="3"></div>
                    <div class="goal-zone" data-zone="4"></div>
                    <div class="goal-zone" data-zone="5"></div>
                </div>
            </div>
            <div class="game-controls">
                <p>Haz clic en las zonas para disparar</p>
                <p id="penaltiesScore">Goles: 0/5</p>
            </div>
        </div>
    `;
    container.innerHTML = game;
    startPenaltiesGame();
}

function startPenaltiesGame() {
    let goals = 0;
    let shots = 0;
    const maxShots = 5;

    document.querySelectorAll('.goal-zone').forEach(zone => {
        zone.addEventListener('click', function() {
            if (shots < maxShots) {
                if (Math.random() > 0.3) {
                    goals++;
                    this.style.background = '#00ff00';
                    this.textContent = '⚽';
                    showNotification('¡GOL! 🎉', 'success');
                } else {
                    this.style.background = '#ff3333';
                    this.textContent = '✕';
                    showNotification('¡Atajado! 🧤', 'warning');
                }
                this.style.pointerEvents = 'none';
                shots++;
                document.getElementById('penaltiesScore').textContent = 'Goles: ' + goals + '/' + maxShots;

                if (shots === maxShots) {
                    setTimeout(() => {
                        endPenaltiesGame(goals * 8);
                    }, 1500);
                }
            }
        });
    });
}

function endPenaltiesGame(score) {
    endGame('penalties', score);
    closeGameModal();
}

// ==========================================
// JUEGO DE MEMORIA
// ==========================================

function createMemoryGame(container) {
    const game = `
        <div class="game-header">
            <h2>🧠 Juego de Memoria</h2>
            <button class="close-btn" onclick="closeGameModal()">✕</button>
        </div>
        <div class="game-content">
            <div id="memoryGrid" class="memory-grid"></div>
            <div class="game-controls">
                <p>Encuentra todos los pares</p>
                <p id="memoryPairs">Pares encontrados: 0/6</p>
            </div>
        </div>
    `;
    container.innerHTML = game;
    startMemoryGame();
}

function startMemoryGame() {
    const icons = ['🍎', '🍌', '🍒', '🍊', '🍇', '🍓'];
    const cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
    const grid = document.getElementById('memoryGrid');
    let flipped = [];
    let matched = 0;
    let moves = 0;

    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    grid.style.gap = '10px';
    grid.style.padding = '20px';

    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = '?';
        card.style.cursor = 'pointer';
        card.style.background = '#ff9900';
        card.style.color = 'white';
        card.style.width = '60px';
        card.style.height = '60px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'center';
        card.style.fontSize = '30px';
        card.style.borderRadius = '8px';
        card.style.border = '2px solid #ffd700';

        card.addEventListener('click', function() {
            if (this.classList.contains('flipped') || flipped.length === 2) return;

            this.classList.add('flipped');
            this.innerHTML = icon;
            flipped.push({ element: this, icon: icon, index: index });

            if (flipped.length === 2) {
                moves++;
                if (flipped[0].icon === flipped[1].icon) {
                    matched++;
                    document.getElementById('memoryPairs').textContent = 'Pares encontrados: ' + matched + '/6';
                    flipped = [];

                    if (matched === 6) {
                        setTimeout(() => {
                            endMemoryGame(100 - moves * 5);
                        }, 500);
                    }
                } else {
                    setTimeout(() => {
                        flipped.forEach(f => {
                            f.element.classList.remove('flipped');
                            f.element.innerHTML = '?';
                        });
                        flipped = [];
                    }, 1000);
                }
            }
        });

        grid.appendChild(card);
    });
}

function endMemoryGame(score) {
    endGame('memory', Math.max(score, 30));
    closeGameModal();
}

// ==========================================
// RUNNER INFINITO
// ==========================================

function createRunnerGame(container) {
    const game = `
        <div class="game-header">
            <h2>🏃 Runner Infinito</h2>
            <button class="close-btn" onclick="closeGameModal()">✕</button>
        </div>
        <div class="game-content">
            <canvas id="runnerCanvas" width="600" height="400"></canvas>
            <div class="game-controls">
                <p>Presiona ESPACIO para saltar</p>
                <p id="runnerScore">Distancia: 0m</p>
            </div>
        </div>
    `;
    container.innerHTML = game;
    startRunnerGame();
}

function startRunnerGame() {
    const canvas = document.getElementById('runnerCanvas');
    const ctx = canvas.getContext('2d');
    let distance = 0;
    let gameRunning = true;
    let timeLeft = 30;

    const player = { x: 100, y: 300, width: 20, height: 30, isJumping: false, jumpPower: 15, velocity: 0 };
    const obstacles = [];
    let gravity = 0.6;

    document.addEventListener('keypress', (e) => {
        if (e.code === 'Space' && !player.isJumping && gameRunning) {
            player.velocity = -player.jumpPower;
            player.isJumping = true;
        }
    });

    function createObstacle() {
        if (gameRunning) {
            obstacles.push({
                x: canvas.width,
                y: 350,
                width: 20,
                height: 40,
                speed: 7
            });
        }
    }

    function update() {
        // Física del jugador
        player.velocity += gravity;
        player.y += player.velocity;

        if (player.y >= 300) {
            player.y = 300;
            player.isJumping = false;
            player.velocity = 0;
        }

        // Actualizar obstáculos
        obstacles.forEach((obs, index) => {
            obs.x -= obs.speed;

            if (checkCollision(player, obs)) {
                gameRunning = false;
            }

            if (obs.x < -obs.width) {
                obstacles.splice(index, 1);
                distance += 10;
            }
        });

        distance += 0.5;
        document.getElementById('runnerScore').textContent = 'Distancia: ' + Math.floor(distance) + 'm';
    }

    function draw() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Línea del piso
        ctx.strokeStyle = '#ff9900';
        ctx.beginPath();
        ctx.moveTo(0, 330);
        ctx.lineTo(canvas.width, 330);
        ctx.stroke();

        // Jugador
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Obstáculos
        ctx.fillStyle = '#ff3333';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }

    function gameLoop() {
        update();
        draw();

        if (gameRunning && timeLeft > 0) {
            requestAnimationFrame(gameLoop);
        } else if (!gameRunning || timeLeft === 0) {
            endRunnerGame(Math.floor(distance));
        }
    }

    function countdown() {
        if (timeLeft > 0) {
            timeLeft--;
            setTimeout(countdown, 1000);
        }
    }

    setInterval(createObstacle, 1500);
    countdown();
    gameLoop();
}

function endRunnerGame(score) {
    endGame('runner', score);
    closeGameModal();
}

// ==========================================
// TIRO AL BLANCO
// ==========================================

function createShootingGame(container) {
    const game = `
        <div class="game-header">
            <h2>🎯 Tiro al Blanco</h2>
            <button class="close-btn" onclick="closeGameModal()">✕</button>
        </div>
        <div class="game-content">
            <div id="shootingField" class="shooting-field" style="position: relative; width: 100%; height: 400px; background: #1a1a1a; border: 2px solid #ff9900; border-radius: 10px; cursor: crosshair;">
                <div id="target" class="target" style="position: absolute; width: 60px; height: 60px; background: radial-gradient(circle, #ff9900 0%, #ff5500 50%, transparent 100%); border-radius: 50%; cursor: pointer; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
            </div>
            <div class="game-controls">
                <p>Haz clic en el blanco</p>
                <p id="shootingScore">Aciertos: 0/15</p>
                <p id="shootingTime">Tiempo: 30s</p>
            </div>
        </div>
    `;
    container.innerHTML = game;
    startShootingGame();
}

function startShootingGame() {
    const field = document.getElementById('shootingField');
    const target = document.getElementById('target');
    let hits = 0;
    let timeLeft = 30;
    const maxHits = 15;

    function moveTarget() {
        const x = Math.random() * (field.clientWidth - 60);
        const y = Math.random() * (field.clientHeight - 60);
        target.style.left = x + 'px';
        target.style.top = y + 'px';
    }

    target.addEventListener('click', function(e) {
        e.stopPropagation();
        if (hits < maxHits) {
            hits++;
            document.getElementById('shootingScore').textContent = 'Aciertos: ' + hits + '/' + maxHits;
            moveTarget();
            
            if (hits === maxHits) {
                endShootingGame(hits * 3);
            }
        }
    });

    function countdown() {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById('shootingTime').textContent = 'Tiempo: ' + timeLeft + 's';
            setTimeout(countdown, 1000);
        } else {
            endShootingGame(hits * 3);
        }
    }

    moveTarget();
    countdown();
}

function endShootingGame(score) {
    endGame('shooting', score);
    closeGameModal();
}