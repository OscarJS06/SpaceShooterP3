import { GameScene } from './scenes/Game.js';
import { MenuScene } from './scenes/Menu.js';
import { CreditosScene } from './scenes/Credits.js';
import { TutorialScene } from './scenes/TutorialScene.js';
import { VictoryScene } from './scenes/Victoria.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  roundPixels: true,
  pixelArt: true,
  scale: {
    parent: 'game-container',
    width: 450,
    height: 640,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
});

game.scene.add('MenuScene', MenuScene);
game.scene.add('TutorialScene', TutorialScene);
game.scene.add('CreditosScene', CreditosScene);
game.scene.add('GameScene', GameScene);
game.scene.add('VictoryScene',VictoryScene);

game.scene.start('MenuScene');