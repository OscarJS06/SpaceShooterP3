// --- ESCENA DE TUTORIAL ---
export class TutorialScene extends Phaser.Scene {
    constructor() { super({ key: 'TutorialScene' }); }

    create() {
        const centerX = this.scale.width / 2;
        this.add.text(centerX, 100, 'CÓMO JUGAR', { fontSize: '40px', fill: '#9171f2ff' }).setOrigin(0.5);
        
        const instrucciones = 
            "Moverse: Flechas Izquierda / Derecha\n" +
            "Disparar: Barra Espaciadora\n\n" +
            "Objetivo: Destruye las naves enemigas\n" +
            "Items: Verde (+Vida) | Azul (Doble Disparo)";

        this.add.text(centerX, 300, instrucciones, { 
            fontSize: '17px', 
            fill: '#dbd1f8ff', 
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // Botón Volver
        const volver = this.add.text(centerX, 500, 'VOLVER AL MENÚ', { fontSize: '28px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        
        volver.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}

