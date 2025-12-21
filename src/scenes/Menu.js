export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.cameras.main.setBackgroundColor('#000000');
        this.add.text(centerX, 100, 'SPACE SHOOTER', { 
            fontSize: '50px', 
            fill: '#71c6edff', 
            fontFamily: 'VT323',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.crearBoton(centerX, centerY-50, 'JUGAR', () => {
            this.scene.start('GameScene'); 
        });

        this.crearBoton(centerX, centerY+50, 'TUTORIAL', () => {
            this.scene.start('TutorialScene'); 
        });

        this.crearBoton(centerX, centerY + 150, 'CRÉDITOS', () => {
            this.scene.start('CreditosScene'); 
        });
    }


    crearBoton(x, y, texto, callback) {
        const boton = this.add.text(x, y, texto, { 
            fontSize: '32px', 
            fill: '#9171f2ff', 
            fontFamily: 'VT323' 
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true }); 
        boton.on('pointerdown', callback);
        boton.on('pointerover', () => boton.setStyle({ fill: 'rgba(68, 24, 201, 1)' }));
        boton.on('pointerout', () => boton.setStyle({ fill: '#9171f2ff' }));
    }
}