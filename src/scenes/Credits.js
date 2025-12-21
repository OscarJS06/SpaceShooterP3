export class CreditosScene extends Phaser.Scene {
    constructor() { super({ key: 'CreditosScene' }); }

    create() {
        const centerX = this.scale.width / 2;
        this.add.text(centerX, 100, 'CRÉDITOS', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);

        this.add.text(centerX, 250, 'Programación y Diseño\nOSCAR SELWYN', { 
            fontSize: '24px', fill: '#fff', align: 'center' 
        }).setOrigin(0.5);

        this.add.text(centerX, 350, 'Música por\nPatrick de Arteaga\n(patrickdearteaga.com)', { 
            fontSize: '24px', fill: '#8888ff', align: 'center' 
        }).setOrigin(0.5);

        const volver = this.add.text(centerX, 500, 'VOLVER AL MENÚ', { fontSize: '28px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        volver.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}