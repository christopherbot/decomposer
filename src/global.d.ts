type Layer = 'default' | 'low' | 'medium' | 'high'

interface Window {
  game: Phaser.Game
  layers: Record<Layer, number>
}
