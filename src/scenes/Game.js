const NIVELES = [
  {nivel: 1, puntosNecesarios: 300, velocidadEnemigo: 150, spawnTime: 1000, probTanque: 0},
  {nivel: 2, puntosNecesarios: 2000, velocidadEnemigo: 250, spawnTime: 700, probTanque: 0.1},
  {nivel: 3, puntosNecesarios: 3000, velocidadEnemigo: 450, spawnTime: 300, probTanque: 0.5}
  //{nivel: 4, puntosNecesarios: 3000, velocidadEnemigo: 450, spawnTime: 300, probTanque: 0.5},
  //{nivel: 5, puntosNecesarios: 3000, velocidadEnemigo: 450, spawnTime: 300, probTanque: 0.5}
]
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload(){
    this.load.image('nave','assets/nave.png');
    this.load.image('bala','assets/bala.png');
    this.load.image('enemigo','assets/enemigo.png');
    this.load.image('tanque','assets/tanque.png');
    this.load.image('pw_1','assets/powerup1.png');
    this.load.image('pw_2','assets/powerup2.png');

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
      maxSize: 10
    })
    
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '32px', fill: '#869cf1ff', fontFamily: 'Arial' });
    this.scoreText.setDepth(10);

    this.levelText = this.add.text(this.scale.width - 120, 16, 'Nivel: 1', {
      fontSize: '32px',
      fill: '#b882f6ff',
      fontFamily: 'Arial'
    });
    this.levelText.setDepth(10);
    this.nivelActual = 0;
    this.iniciarNivel();

    //colisiones
    this.physics.add.overlap(this.balas, this.enemigos, this.destruirEnemigo, null, this);
    this.physics.add.overlap(this.player, this.enemigos, this.dañarJugador, null, this);
    this.physics.add.overlap(this.player, this.pw_1, this.recogerPW, null, this);
    this.physics.add.overlap(this.player, this.pw_2, this.recogerPW, null, this);
    //vidas
    this.vidas= 3;
    this.esInvencible= false;

    this.vidasText = this.add.text(16, 50, 'Vidas: 3',{
      fontSize: '32px',
      fill: '#f44c4cff',
      fontFamily: 'Arial'
    });
    this-this.vidasText.setDepth(10);
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
      if(enemigo.active && enemigo.y > 650){
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

      const nivelData = NIVELES[this.nivelActual];
      const esTanque = Math.random() < nivelData.probTanque;

      if (esTanque) { //tanque
                enemigo.setTexture('tanque'); 
                enemigo.setScale(1.5);         
                enemigo.vida = 3;              
                enemigo.setVelocityY(nivelData.velocidadEnemigo * 0.5);
            } else {
                // basico
                enemigo.setTexture('enemigo');         
                enemigo.setScale(1);           
                enemigo.vida = 1;              
                enemigo.setVelocityY(nivelData.velocidadEnemigo);
            }
        }
    }

  destruirEnemigo(bala, enemigo) {
        this.balas.killAndHide(bala);
        bala.body.enable = false;

        if (!enemigo.vida) enemigo.vida = 1; 
        
        enemigo.vida--;

        
        enemigo.setTint(0xffffff); 
        this.time.delayedCall(100, () => {
             if (enemigo.active) {
                 enemigo.vida > 1 ? enemigo.setTint(0xff0000) : enemigo.clearTint();
             }
        });

        if (enemigo.vida <= 0) {
            this.enemigos.killAndHide(enemigo);
            enemigo.body.enable = false;

            const puntosGanados = (enemigo.scale > 1.2) ? 300 : 100;
            
            this.score += puntosGanados;
            this.scoreText.setText('Puntos: ' + this.score);

            this.verificarSubidaNivel();
        }
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
            
            this.levelText.setText('Nivel:' + NIVELES[this.nivelActual].nivel);
            
        }
    }

    dañarJugador(player, enemigo){
      if(this.esInvencible)return;
      this.enemigos.killAndHide(enemigo);
      enemigo.body.enable = false;

      this.vidas--;
      this.vidasText.setText('Vidas: '+ this.vidas);

      this.cameras.main.shake(200, 0.01);
      player.setTint(0xff0000);

      if(this.vidas <= 0){
        this.gameOver(player);
      }
      else{
        this.esInvencible = true;

        this.tweens.add({
                targets: player,
                alpha: 0.1, 
                duration: 100,
                yoyo: true,
                repeat: 5, 
                onComplete: () => {
                    player.clearTint(); 
                    player.alpha = 1;   
                    this.esInvencible = false; 
                }
            });
      }
    }
}