const NIVELES = [
  { nivel: 1, puntosNecesarios: 1000, velocidadEnemigo: 150, spawnTime: 1000, probTanque: 0, timePW: 0 },
  { nivel: 2, puntosNecesarios: 2000, velocidadEnemigo: 150, spawnTime: 2000, probTanque: 1, timePW: 0 },
  { nivel: 3, puntosNecesarios: 4000, velocidadEnemigo: 200, spawnTime: 700, probTanque: 0.1, timePW: 10000 },
  { nivel: 4, puntosNecesarios: 6000, velocidadEnemigo: 300, spawnTime: 300, probTanque: 0.2, timePW: 7000 },
  { nivel: 5, puntosNecesarios: 8000, velocidadEnemigo: 450, spawnTime: 250, probTanque: 0.3, timePW: 5000 },
  { nivel: 6, puntosNecesarios: 12000, velocidadEnemigo: 600, spawnTime: 200, probTanque: 0.5, timePW: 5000 },
  { nivel: 7, puntosNecesarios: 200000, velocidadEnemigo: 9000, spawnTime: 100, probTanque: 0.6, timePW: 5000 }
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload(){
    this.load.image('nave','assets/nave.png');
    this.load.image('bala','assets/bala.png'); 
    this.load.image('enemigo','assets/enemigo.png');
    this.load.image('tanque','assets/tanque.png');
    this.load.image('pw_1','assets/powerup1.png');  //vida
    this.load.image('pw_2','assets/powerup2.png');  //arma
    
    this.load.audio('sfx_disparo','assets/audio/laserShoot.wav');
    this.load.audio('sfx_explosion','assets/audio/explosion.wav');
    this.load.audio('sfx_PW','assets/audio/powerUp.wav');
    this.load.audio('sfx_gameOver','assets/audio/gameOver.mp3');
    this.load.audio('musica_fondo','assets/audio/musica.ogg');
    this.load.audio('sfx_daño','assets/audio/hitHurt.wav');
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
      maxSize: -1 
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
    this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '32px', fill: '#869cf1', fontFamily: 'VT323' });
    this.scoreText.setDepth(10);

    this.levelText = this.add.text(this.scale.width - 120, 16, 'Nivel: 1', {
      fontSize: '32px',
      fill: '#b882f6',
      fontFamily: 'VT323'
    });
    this.levelText.setDepth(10);

    this.nivelActual = 0;
    this.iniciarNivel();

    //vidas
    this.vidas= 3;
    this.esInvencible= false;
    this.vidasText = this.add.text(16, 50, 'Vidas: 3',{
      fontSize: '32px',
      fill: '#36f59cff',
      fontFamily: 'VT323'
    });
  
    this.vidasText.setDepth(10);

    //colisiones
    this.physics.add.overlap(this.balas, this.enemigos, this.destruirEnemigo, null, this);
    this.physics.add.overlap(this.player, this.enemigos, this.dañarJugador, null, this);
    this.physics.add.overlap(this.player, this.powerups, this.recogerPW, null, this);
        
    this.nivelArma = 1;

    //musica
    this.musica = this.sound.add('musica_fondo');
    const musicConfig = {
      volume: 0.3,
      loop: true
    };

    if(!this.sound.locked){
      this.musica.play(musicConfig);
    }
    else{
      this.input.once('pointerdown',()=>{
        this.musica.play(musicConfig.play(musicConfig));
      });
    }
    //pausa
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.isPaused = false;
    this.pauseText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'JUEGO PAUSADO', {
        fontSize: '58px',
        fill: '#51ed40ff',
        backgroundColor: '#000000aa' // 
    }).setOrigin(0.5).setDepth(20).setVisible(false);
  }

  update(){
    //si esta pausado
    if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
        this.togglePause();
    }
    if (this.isPaused) {
        return; 
    }
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
    
    this.balas.children.iterate((bala)=>{
      if(bala && bala.active && bala.y < -10){
        this.balas.killAndHide(bala);
        bala.body.enable = false;
      }
    });
    this.enemigos.children.iterate((enemigo)=>{
      if(enemigo.active && enemigo.y > 650){
        this.enemigos.killAndHide(enemigo);
        enemigo.body.enable = false;
      }
    });
    this.powerups.children.iterate((pw) => {
      if(pw){
        if (pw.active && pw.y > 650) {
            pw.destroy();
        }
      }
    });
  }

  //funcion para disparar proyectiles
  disparar() {
    //disparo doble
    if (this.nivelArma === 2) {
        const bala1 = this.balas.create(this.player.x - 45, this.player.y - 20, 'bala');
        const bala2 = this.balas.create(this.player.x + 45, this.player.y - 20, 'bala');
        
        if (bala1) {
            this.sound.play('sfx_disparo', { 
                volume: 0.3, 
                detune: Phaser.Math.Between(-200, 200)
            });
            bala1.setVelocityY(-500);
            bala1.body.enable = true;
            bala1.clearTint();      
            bala1.setTint(0xffff00); 
        }

        if (bala2) {
          this.sound.play('sfx_disparo', { 
                volume: 0.3, 
                detune: Phaser.Math.Between(-200, 200) 
            });
            bala2.setVelocityY(-500);
            bala2.body.enable = true;
            bala2.clearTint();
            bala2.setTint(0xffff00);
        }
    //disparo normal
    } else {
        const bala = this.balas.create(this.player.x, this.player.y - 20, 'bala');

        if (bala) {
            this.sound.play('sfx_disparo', { 
                volume: 0.3, 
                detune: Phaser.Math.Between(-200, 200) 
            });
            bala.setVelocityY(-500);
            bala.body.enable = true;
            bala.clearTint();
        }
    }
  }
  //creamos los enemigos
  generarEnemigo(){
    const xRandom = Phaser.Math.Between(50, 400);
    const enemigo = this.enemigos.get(xRandom, -50);

    if(enemigo){
      enemigo.setActive(true);
      enemigo.setVisible(true);
      enemigo.body.enable = true;

      enemigo.clearTint();
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

  //enemigos se quedan sin vida
  destruirEnemigo(bala, enemigo) {
    this.balas.killAndHide(bala);
    bala.body.enable = false;
    if (!enemigo.vida) enemigo.vida = 1;
    enemigo.vida--;
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
      
      this.sound.play('sfx_explosion');
  
    if (this.score >= 20000) {
        this.physics.pause(); 
        this.musica.stop();   
        this.scene.start('VictoryScene'); 
        return;
    }
      this.verificarSubidaNivel();
    }
  }

  //el jugador se queda sin vidas 
  gameOver(player, enemigo){
    this.physics.pause();
    player.setTint(0xff0000);

    this.musica.stop();
    this.sound.play('sfx_gameOver');

    this.add.text(this.scale.width/2, this.scale.height/2, 'GAME OVER',{
      fontSize: '48px',
      fill: '#e12020ff',
      fontFamily: 'VT323'
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, (this.scale.height / 2) + 50, 'Puntos Totales: ' + this.score, {
      fontSize: '32px',
      fill: '#9171f2ff',
      fontFamily: 'VT323'
    }).setOrigin(0.5);

    const restartButton = this.add.text(this.scale.width / 2, (this.scale.height / 2) + 120, 'CLIC PARA REINICIAR', {
      fontSize: '28px',
      fill: 'rgba(0, 213, 255, 1)', 
      backgroundColor: '#000000' 
    }).setOrigin(0.5);

    restartButton.setInteractive();
    restartButton.on('pointerdown', ()=>{
      this.scene.restart();
    })
  }

  //iniciamos niveles
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
 
  // si la puntuación es la adecuada, subimos de nivel 
  verificarSubidaNivel() {
    const config = NIVELES[this.nivelActual];
    
    if (this.score >= config.puntosNecesarios && this.nivelActual < NIVELES.length - 1) {
        this.nivelActual++;
        this.iniciarNivel(); 
        this.levelText.setText('Nivel:' + NIVELES[this.nivelActual].nivel);
    }
  }

  //dañamos el jugador, perdiendo vidas
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
      this.sound.play('sfx_daño');
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
  
  //cremaos los power ups
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

  // qué ocurre cuando se recoge un power up
  recogerPW(player, item) {
      item.destroy(); 
      this.sound.play('sfx_PW');
      // +1 vida
      if (item.tipo === 'vida') {
          this.vidas++;
          this.vidasText.setText('Vidas: ' + this.vidas);
          player.setTint(0x00ff00);
          this.time.delayedCall(200, () => player.clearTint());
      }
      // disparo doble
      else if (item.tipo === 'arma') {
          this.nivelArma = 2;
          player.setTint(0x00ffff);
          
          this.time.delayedCall(5000, () => {
              this.nivelArma = 1;
              player.clearTint();
          });
      }
  }
  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
        this.physics.pause();  
        this.pauseText.setVisible(true);
        this.musica.pause();   
    } else {
        this.physics.resume();    
        this.pauseText.setVisible(false); 
        this.musica.resume(); 
    }
  }
}