// config.js

// Primero verificamos que Phaser esté cargado
if (typeof Phaser === 'undefined') {
    throw new Error("Phaser no está cargado. Asegúrate de cargar phaser.js antes que config.js");
}

// Definimos una clase Scene para encapsular todas las funciones
class GameScene {
    preload() {
        // Esta función será reemplazada por la de game.js
    }
    
    create() {
        // Esta función será reemplazada por la de game.js
    }
    
    update() {
        // Esta función será reemplazada por la de game.js
    }
}

// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000033',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: GameScene // Usamos la clase directamente
};

// Creamos el juego solo si todo está listo
const initGame = () => {
    try {
        const game = new Phaser.Game(config);
        return game;
    } catch (error) {
        console.error("Error al iniciar el juego:", error);
        // Puedes agregar aquí un mensaje de error visual para el usuario
        document.body.innerHTML = '<div style="color:white;font-size:24px;text-align:center;margin-top:50px;">Error al cargar el juego. Recarga la página.</div>';
    }
};

// Verificamos si las funciones globales existen (para compatibilidad con tu game.js actual)
if (typeof preload === 'function' && typeof create === 'function' && typeof update === 'function') {
    // Si existen las funciones globales, sobreescribimos las de la clase
    GameScene.prototype.preload = preload;
    GameScene.prototype.create = create;
    GameScene.prototype.update = update;
    
    // Limpiamas las funciones globales para evitar confusiones
    window.preload = undefined;
    window.create = undefined;
    window.update = undefined;
}

// Iniciamos el juego cuando el DOM esté listo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initGame();
} else {
    document.addEventListener('DOMContentLoaded', initGame);
}