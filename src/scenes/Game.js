const NIVELES = [
  {nivel: 1, puntosNecesarios: 300, velocidadEnemigo: 150, spawnTime: 1000},
  {nivel: 2, puntosNecesarios: 2000, velocidadEnemigo: 250, spawnTime: 700},
   {nivel: 2, puntosNecesarios: 3000, velocidadEnemigo: 450, spawnTime: 300}
]
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload(){
    this.load.image('nave','assets/nave.png');
    this.load.image('bala','assets/bala.png');
    this.load.image('enemigo','assets/enemigo.png');

  }

  create() {
    //personaje
    this.player = this.physics.add.sprite(225, 550, 'nave');
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.playerSpeed = 300;

    //balas
    this.balas = this.physics.add.group({
      defaultKey: 'bala',
      maxSize: 10 //max 10 balas en pantalla
    })

    //enemigos
    this.enemigos = this.physics.add.group({
      defaultKey: 'enemigo',
      maxSize: 30
    })
    
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '32px', fill: '#fff' });

    this.levelText = this.add.text(this.scale.width - 100, 16, 'Nivel: 1', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    this.nivelActual = 0;
    this.iniciarNivel();

    //colisiones
    this.physics.add.overlap(this.balas, this.enemigos, this.destruirEnemigo, null, this);
    this.physics.add.overlap(this.player, this.enemigos, this.gameOver, null, this);

  }

  update(){
    //movimiento personaje
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
    } else {
        // Si no toco nada, la nave se frena
        this.player.setVelocityX(0);
    }

    //disparos
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)){
      this.disparar();
    }
    this.balas.children.iterate((bala)=>{
      if(bala && bala.active && bala.y <-10){
        this.balas.killAndHide(bala);
        bala.body.enable = false;
      }
    })
    this.enemigos.children.iterate((enemigo)=>{
      if(enemigo.active && enemigo.y > 650){ //altura pantalla
        this.enemigos.killAndHide(enemigo);
        enemigo.body.enable = false;
      }
    })
  }

  disparar(){
    const bala = this.balas.get(this.player.x, this.player.y -20);

    if(bala){
      bala.setActive(true);
      bala.setVisible(true);
      bala.body.enable = true; 
      bala.setVelocityY( -500);
    }
  }

  generarEnemigo(){
    const xRandom = Phaser.Math.Between(50, 400);
    const enemigo = this.enemigos.get(xRandom, -50);

    if(enemigo){
      enemigo.setActive(true);
      enemigo.setVisible(true);
      enemigo.body.enable = true;

      const velocidad = NIVELES[this.nivelActual].velocidadEnemigo;
      enemigo.setVelocityY(velocidad);
    }
  }

  destruirEnemigo(bala, enemigo){
    this.balas.killAndHide(bala);
    bala.body.enable = false;

    this.enemigos.killAndHide(enemigo);
    enemigo.body.enable = false;

    this.score += 100;
    this.scoreText.setText('Puntos: ' + this.score);

    this.verificarSubidaNivel();
  }

  gameOver(player, enemigo){
    this.physics.pause();
    player.setTint(0xff0000);

    this.add.text(this.scale.width/2, this.scale.height/2, 'GAME OVER',{
      fontSize: '48px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, (this.scale.height / 2) + 50, 'Puntos Totales: ' + this.score, {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const restartButton = this.add.text(this.scale.width / 2, (this.scale.height / 2) + 120, 'CLIC PARA REINICIAR', {
      fontSize: '28px',
      fill: '#0f0', 
      backgroundColor: '#000000' 
    }).setOrigin(0.5);

    restartButton.setInteractive();
    restartButton.on('pointerdown', ()=>{
      this.scene.restart();
    })
  }

  iniciarNivel(){
    const config = NIVELES[this.nivelActual];
    if(this.spawnEvent){
      this.spawnEvent.remove();
    }
    this.spawnEvent = this.time.addEvent({
      delay: config.spawnTime,
      callback: this.generarEnemigo,
      callbackScope: this,
      loop: true
    });
  }
  
  verificarSubidaNivel() {
        const config = NIVELES[this.nivelActual];
        
        if (this.score >= config.puntosNecesarios && this.nivelActual < NIVELES.length - 1) {
            this.nivelActual++;
            this.iniciarNivel(); 
            
            this.levelText.setText('Nivel: ' + NIVELES[this.nivelActual].nivel);
            
        }
    }
}