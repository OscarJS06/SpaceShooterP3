export class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(centerX, centerY - 100, '¡VICTORIA!', { 
            fontSize: '56px', 
            fill: '#9171f2ff', 
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY, '¡Has salvado la galaxia!', { 
            fontSize: '24px', fill: '#fff' 
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 50, 'Puntuación Máxima Alcanzada', { 
            fontSize: '20px', fill: '#00ff00' 
        }).setOrigin(0.5);

        const botonMenu = this.add.text(centerX, centerY + 150, 'VOLVER AL MENÚ', { 
            fontSize: '28px', 
            fill: '#fff', 
            backgroundColor: '#333' 
        })
        .setOrigin(0.5)
        .setPadding(10)
        .setInteractive({ useHandCursor: true });

        botonMenu.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        botonMenu.on('pointerover', () => botonMenu.setStyle({ fill: '#5121e0ff' }));
        botonMenu.on('pointerout', () => botonMenu.setStyle({ fill: '#9171f2ff' }));
    }
}