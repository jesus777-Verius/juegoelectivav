let submarine, torpedos, bullets, enemies, powerups;
let cursors, fireTorpedoKey, fireBulletKey, restartButton;
let lives = 5;
let score = 0;
let level = 1;
let highScore = 0;
let previousHighScore = 0;
let scoreText, livesText, controlsText, highScoreText, levelText;
let lastTorpedoFired = 0;
let lastBulletFired = 0;
let shootSound, bgMusic;
let lifeIcons = [];
let hasPowerUp = false;
let shieldActive = false;
let multiShotActive = false;
let freezeActive = false;

function preload() {
    this.load.image('background', 'images/background.png');
    this.load.image('submarine', 'images/submarine.png');
    this.load.image('enemySub', 'images/enemy_sub.png');
    this.load.image('fish', 'images/fish.png');
    this.load.image('shark', 'images/shark.png');
    this.load.image('torpedo', 'images/torpedo.png');
    this.load.image('bullet', 'images/bullet.png');
    this.load.image('lifeIcon', 'images/heart.png');
    this.load.image('powerup', 'images/powerup.png');
    this.load.audio('shoot', 'sounds/shoot.mp3');
    this.load.audio('bgMusic', 'sounds/background.flac');
}

function create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.physics.world.setBounds(0, 0, width, height);

    const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.displayWidth = width;
    bg.displayHeight = height;

    submarine = this.physics.add.sprite(width / 2, height - 100, 'submarine');
    submarine.setCollideWorldBounds(true).setScale(0.3).setFlipX(true);

    torpedos = this.physics.add.group();
    bullets = this.physics.add.group();
    enemies = this.physics.add.group();
    powerups = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();
    fireTorpedoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    fireBulletKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    shootSound = this.sound.add('shoot');
    bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 });
    bgMusic.play();

    scoreText = this.add.text(16, 16, 'Puntos: 0', {
        fontFamily: 'Arial', fontSize: '24px', fill: '#ffffff'
    });
    livesText = this.add.text(16, 50, 'Vidas:', {
        fontFamily: 'Arial', fontSize: '24px', fill: '#ffffff'
    });

    lifeIcons = [];
    for (let i = 0; i < lives; i++) {
        const icon = this.add.image(100 + i * 35, 62, 'lifeIcon')
            .setScale(0.6)
            .setScrollFactor(0)
            .setDepth(1);
        lifeIcons.push(icon);
    }

    levelText = this.add.text(width / 2, 16, 'Nivel: 1', {
        fontFamily: 'Arial', fontSize: '24px', fill: '#ffffff'
    }).setOrigin(0.5, 0);

    controlsText = this.add.text(width - 260, 16, 'Controles:\n← ↑ ↓ → Mover\nEspacio: Torpedo\nShift: Bala', {
        fontFamily: 'Arial',
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#00000099',
        padding: { x: 10, y: 8 }
    });

    this.physics.add.collider(torpedos, enemies, hitEnemy, null, this);
    this.physics.add.collider(bullets, enemies, hitEnemy, null, this);
    this.physics.add.collider(submarine, enemies, hitSubmarine, null, this);
    this.physics.add.overlap(submarine, powerups, collectPowerUp, null, this);

    this.spawnEnemies = spawnEnemies;
    this.spawnEnemies.call(this);

    this.time.addEvent({
        delay: 3000,
        callback: this.spawnEnemies,
        callbackScope: this,
        loop: true
    });

    this.spawnPowerups = spawnPowerups;
    this.spawnPowerups.call(this);
}

function update() {
    submarine.setVelocity(0);
    if (cursors.left.isDown) submarine.setVelocityX(-200), submarine.setFlipX(false);
    if (cursors.right.isDown) submarine.setVelocityX(200), submarine.setFlipX(true);
    if (cursors.up.isDown) submarine.setVelocityY(-200);
    if (cursors.down.isDown) submarine.setVelocityY(200);

    if (fireTorpedoKey.isDown && this.time.now > lastTorpedoFired) {
        shootTorpedo(this);
        lastTorpedoFired = this.time.now + 500;
    }
    if (fireBulletKey.isDown && this.time.now > lastBulletFired) {
        shootBullet(this);
        lastBulletFired = this.time.now + 250;
    }

    torpedos.children.iterate(t => { if (t && (t.x < 0 || t.x > this.scale.width)) t.destroy(); });
    bullets.children.iterate(b => { if (b && (b.y < 0 || b.y > this.scale.height)) b.destroy(); });
    powerups.children.iterate(p => { if (p && p.y > this.scale.height) p.destroy(); });

    if (score >= level * 1000) {
        level++;
        levelText.setText(`Nivel: ${level}`);
        showTempMessage(this, `¡Nivel ${level}!`);
    }

    if (freezeActive) {
        enemies.setVelocity(0, 0);
    }
}

function shootTorpedo(scene) {
    if (!hasPowerUp) return;
    ['left', 'right'].forEach(dir => {
        const t = torpedos.create(submarine.x, submarine.y, 'torpedo');
        t.setScale(0.7).setFlipX(dir === 'left');
        t.setVelocityX(dir === 'left' ? -400 : 400);
    });
    shootSound.play();
}

function shootBullet(scene) {
    if (multiShotActive) {
        const directions = [
            { x: 0, y: -400 }, { x: 400, y: 0 }, { x: -400, y: 0 }, { x: 0, y: 400 }
        ];
        directions.forEach(d => {
            const b = bullets.create(submarine.x, submarine.y, 'bullet');
            b.setScale(0.4).setVelocity(d.x, d.y);
        });
    } else {
        const b = bullets.create(submarine.x, submarine.y - 20, 'bullet');
        b.setScale(0.4).setVelocityY(-400);
    }
    shootSound.play();
}

function spawnEnemies() {
    const enemyTypes = ['enemySub', 'fish', 'shark'];
    const cantidad = 5 + level * 2;
    for (let i = 0; i < cantidad; i++) {
        const side = Phaser.Math.Between(0, 2);
        let x, y, vx = 0, vy = 0;
        const velocidadBase = 100 + level * 10;

        switch (side) {
            case 0:
                x = Phaser.Math.Between(50, this.scale.width - 50);
                y = -50;
                vy = Phaser.Math.Between(velocidadBase, velocidadBase + 100);
                break;
            case 1:
                x = -50;
                y = Phaser.Math.Between(50, this.scale.height / 2);
                vx = Phaser.Math.Between(velocidadBase, velocidadBase + 100);
                break;
            case 2:
                x = this.scale.width + 50;
                y = Phaser.Math.Between(50, this.scale.height / 2);
                vx = -Phaser.Math.Between(velocidadBase, velocidadBase + 100);
                break;
        }

        const enemy = enemies.create(x, y, Phaser.Math.RND.pick(enemyTypes));
        enemy.setScale(0.4).setVelocity(vx, vy);
    }
}

function spawnPowerups() {
    const types = ['powerup', 'shield', 'multishot', 'freeze'];
    const type = Phaser.Utils.Array.GetRandom(types);
    const p = powerups.create(Phaser.Math.Between(50, this.scale.width - 50), -50, 'powerup');
    p.setVelocityY(100).setScale(0.5);
    p.type = type;

    let label = '';
    let color = '#ffffff';
    if (type === 'shield') {
        label = '🛡️'; color = '#00ffff';
    } else if (type === 'multishot') {
        label = '×4'; color = '#ffcc00';
    } else if (type === 'freeze') {
        label = '❄️'; color = '#66ccff';
    } else {
        label = '×3'; color = '#ff66ff';
    }

    p.label = this.add.text(p.x, p.y, label, {
        fontSize: '20px', fontFamily: 'Arial', fill: color, fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);
    p.update = function () { p.label.setPosition(p.x, p.y); };

    this.time.addEvent({ delay: 10000, callback: this.spawnPowerups, callbackScope: this });
}

function collectPowerUp(sub, powerup) {
    if (powerup.label) powerup.label.destroy();
    powerup.destroy();
    switch (powerup.type) {
        case 'shield':
            shieldActive = true;
            showTempMessage(this, '¡Escudo activado!');
            submarine.setTint(0x00ffff);
            this.time.delayedCall(5000, () => {
                shieldActive = false;
                submarine.clearTint();
            });
            break;
        case 'multishot':
            multiShotActive = true;
            showTempMessage(this, '¡Disparo en 4 direcciones!');
            this.time.delayedCall(5000, () => multiShotActive = false);
            break;
        case 'freeze':
            freezeActive = true;
            showTempMessage(this, '¡Enemigos congelados!');
            this.time.delayedCall(5000, () => freezeActive = false);
            break;
        default:
            hasPowerUp = true;
            showTempMessage(this, '¡Poder activado!');
            this.time.delayedCall(5000, () => hasPowerUp = false);
    }
}

function hitEnemy(projectile, enemy) {
    const scene = projectile.scene;
    projectile.destroy(); enemy.destroy();
    const isFish = enemy.texture.key === 'fish';
    const points = projectile.texture.key === 'bullet' ? (isFish ? 30 : 20) : 10;
    score += points;
    scoreText.setText(`Puntos: ${score}`);
    const plusText = scene.add.text(enemy.x, enemy.y, `+${points}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    scene.time.delayedCall(450, () => plusText.destroy());
}

function hitSubmarine(submarine, enemy) {
    enemy.destroy();
    if (!shieldActive) loseLife.call(this);
}

function loseLife() {
    lives--;
    if (lifeIcons[lives]) lifeIcons[lives].setVisible(false);
    submarine.setTint(0xff0000);
    this.time.delayedCall(500, () => submarine.clearTint());
    if (lives <= 0) gameOver(this);
}

function showTempMessage(scene, msg) {
    const txt = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, msg, {
        fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', backgroundColor: '#00000099', padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    scene.time.delayedCall(1000, () => txt.destroy());
}

function gameOver(scene) {
    if (!scene.physics.world.isPaused) {
        scene.physics.pause();
        submarine.setTint(0xff0000);
        scene.add.text(scene.scale.width / 2, scene.scale.height / 2, '🛑 GAME OVER 🛑', {
            fontSize: '48px', fill: '#ff0000', fontFamily: 'Arial', backgroundColor: '#00000099', padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        createRestartButton(scene);
    }
}

function createRestartButton(scene) {
    restartButton = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 100, '🔁 REINICIAR', {
        fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial', backgroundColor: '#00000080', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
        previousHighScore = highScore;
        scene.scene.restart();
        lives = 5;
        score = 0;
        level = 1;
        hasPowerUp = false;
        shieldActive = false;
        multiShotActive = false;
        freezeActive = false;
    });
}
