import 'phaser'
import { Background, Loading, Sheet, Title, UI } from './scenes'
// import { onWindowResize } from './utils'

if (module.hot) {
  module.hot.accept()
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Decomposer',
  type: Phaser.WEBGL,
  parent: 'game',
  backgroundColor: '#000000',
  scale: {
    // mode: Phaser.Scale.ScaleModes.FIT,
    mode: Phaser.Scale.ScaleModes.HEIGHT_CONTROLS_WIDTH,
    width: Math.min(window.innerWidth, 1000),
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 1000,
      },
      // debug: true,
    },
  },
  render: {
    antialiasGL: false,
    pixelArt: true,
  },
  // callbacks: {
  //   postBoot: () => {
  //     onWindowResize()
  //   },
  // },
  canvasStyle: `display: block; width: 100%; height: 100%;`,
  autoFocus: true,
  audio: {
    disableWebAudio: false,
  },
  scene: [Loading, Title, Background, UI, Sheet],
}

// window.onresize = () => onWindowResize()

window.layers = {
  default: 0,
  low: 1,
  medium: 2,
  high: 3,
}

window.game = new Phaser.Game(gameConfig)
