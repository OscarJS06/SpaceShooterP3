const NIVELES = [
  { nivel: 1, puntosNecesarios: 300, velocidadEnemigo: 150, spawnTime: 1000, probTanque: 0, timePW: 1000 },
  { nivel: 2, puntosNecesarios: 2000, velocidadEnemigo: 250, spawnTime: 700, probTanque: 0.1, timePW: 10000 },
  { nivel: 3, puntosNecesarios: 3000, velocidadEnemigo: 450, spawnTime: 300, probTanque: 0.5, timePW: 5000 }
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload(){
    this.load.image('nave','assets/nave.png');
    this.load.image('bala','assets/bala.png'); // IMPORTANTE: Que esta imagen sea blanca para que los colores funcionen bien
    this.load.image('enemigo','assets/enemigo.png');
    this.load.image('tanque','assets/tanque.png');
    this.load.image('pw_1','assets/powerup1.png');  //vida
    this.load.image('pw_2','assets/powerup2.png');  //arma
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
      maxSize: -1 // CAMBIO 1: Aumentado a 50 para que no falten balas en disparo doble
    });

    //enemigos
    this.enemigos = this.physics.add.group({
      defaultKey: 'enemigo',
      maxSize: 10
    });

    //power ups
    this.powerups = this.physics.add.group();
    
    //puntuacion y niveles
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '32px', fill: '#869cf1', fontFamily: 'Arial' });
    this.scoreText.setDepth(10);

    this.levelText = this.add.text(this.scale.width - 120, 16, 'Nivel: 1', {
      fontSize: '32px',
      fill: '#b882f6',
      fontFamily: 'Arial'
    });
    this.levelText.setDepth(10);

    this.nivelActual = 0;
    this.iniciarNivel();

    //vidas
    this.vidas= 3;
    this.esInvencible= false;
    this.vidasText = this.add.text(16, 50, 'Vidas: 3',{
      fontSize: '32px',
      fill: '#f44c4c',
      fontFamily: 'Arial'
    });
    // CAMBIO 2: Corregido el error de escritura "this-this"
    this.vidasText.setDepth(10);

    //colisiones
    this.physics.add.overlap(this.balas, this.enemigos, this.destruirEnemigo, null, this);
    this.physics.add.overlap(this.player, this.enemigos, this.dañarJugador, null, this);
    this.physics.add.overlap(this.player, this.powerups, this.recogerPW, null, this);
        
    this.nivelArma = 1;
  }

  update(){
    //movimiento personaje
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
    } else {
        this.player.setVelocityX(0);
    }

    //disparos
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)){
      this.disparar();
    }
    
    // Limpieza Balas
    this.balas.children.iterate((bala)=>{
      if(bala && bala.active && bala.y < -10){
        this.balas.killAndHide(bala);
        bala.body.enable = false;
      }
    });

    // Limpieza Enemigos
    this.enemigos.children.iterate((enemigo)=>{
      if(enemigo.active && enemigo.y > 650){
        this.enemigos.killAndHide(enemigo);
        enemigo.body.enable = false;
      }
    });
    
    // Limpieza PowerUps (agregado por seguridad)
    this.powerups.children.iterate((pw) => {
      if(pw){
        if (pw.active && pw.y > 650) {
            pw.destroy();
        }
      }
    });
  }

  disparar() {
    if (this.nivelArma === 2) {
        // --- DISPARO DOBLE ---
        // Usamos 'create' para asegurar que SIEMPRE salgan, aunque gasten más memoria
        const bala1 = this.balas.create(this.player.x - 45, this.player.y - 20, 'bala');
        const bala2 = this.balas.create(this.player.x + 45, this.player.y - 20, 'bala');
        
        if (bala1) {
            bala1.setVelocityY(-500);
            bala1.body.enable = true;
            bala1.clearTint();      // Limpiamos color viejo
            bala1.setTint(0xffff00); // Ponemos amarillo
        }

        if (bala2) {
            bala2.setVelocityY(-500);
            bala2.body.enable = true;
            bala2.clearTint();
            bala2.setTint(0xffff00);
        }

    } else {
        // --- DISPARO NORMAL ---
        const bala = this.balas.create(this.player.x, this.player.y - 20, 'bala');

        if (bala) {
            bala.setVelocityY(-500);
            bala.body.enable = true;
            bala.clearTint(); // Sin color para el disparo normal
        }
    }
  }

  generarEnemigo(){
    const xRandom = Phaser.Math.Between(50, 400);
    const enemigo = this.enemigos.get(xRandom, -50);

    if(enemigo){
      enemigo.setActive(true);
      enemigo.setVisible(true);
      enemigo.body.enable = true;

      enemigo.clearTint(); // Esto está bien, arregla el color rojo
      enemigo.alpha = 1;

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

    // Gestión de vida
    if (!enemigo.vida) enemigo.vida = 1;
    enemigo.vida--;

    // Visual tanque
    enemigo.setTint(0xff0000); 

    this.time.delayedCall(100, () => {
        if (enemigo.active) {
            enemigo.clearTint(); 
        }
    });

    if (enemigo.vida <= 0) {
      this.enemigos.killAndHide(enemigo);
      enemigo.body.enable = false;

      const puntosGanados = (enemigo.texture.key === 'tanque') ? 300 : 100;
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

  iniciarNivel() {
    const config = NIVELES[this.nivelActual];

    if (this.spawnEvent) this.spawnEvent.remove();
    if (this.pwEvent) this.pwEvent.remove();

    this.spawnEvent = this.time.addEvent({
      delay: config.spawnTime,
      callback: this.generarEnemigo,
      callbackScope: this,
      loop: true
    });

    if (config.timePW > 0) {
      this.pwEvent = this.time.addEvent({
        delay: config.timePW,
        callback: this.generarPowerUp, 
        callbackScope: this,
        loop: true
      });
    }
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

  generarPowerUp() {
    const xRandom = Phaser.Math.Between(50, this.scale.width - 50);
    const esVida = Math.random() < 0.5;
    const textura = esVida ? 'pw_1' : 'pw_2';

    const item = this.powerups.create(xRandom, -50, textura);
    
    if(item) {
      item.setVelocityY(200); 
      item.setActive(true);
      item.setVisible(true);
      item.body.enable = true;
      item.tipo = esVida ? 'vida' : 'arma';
    }
  }

  recogerPW(player, item) {
      item.destroy(); 

      if (item.tipo === 'vida') {
          this.vidas++;
          this.vidasText.setText('Vidas: ' + this.vidas);
          player.setTint(0x00ff00);
          this.time.delayedCall(200, () => player.clearTint());
      } 
      else if (item.tipo === 'arma') {
          this.nivelArma = 2;
          player.setTint(0x00ffff);
          
          this.time.delayedCall(5000, () => {
              this.nivelArma = 1;
              player.clearTint();
          });
      }
  }
}