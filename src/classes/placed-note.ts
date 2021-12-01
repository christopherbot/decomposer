import { Sheet } from '../scenes'
import { Note } from './note'

export class PlacedNote extends Note {
  scene!: Sheet
  pitch!: string
  modifiedPitch!: string | null
  sharp!: Phaser.GameObjects.Text
  ledgerGraphics!: Phaser.GameObjects.Graphics
  bugColor = 0x800b03
  bugColorHex = '#800b03'

  constructor(scene: Sheet, x: number, y: number) {
    super(scene, x, y, 'note50')

    this.scene = scene

    this._body.checkCollision.down = false
    this._body.checkCollision.left = false
    this._body.checkCollision.right = false

    // so the placed note is on top of ledger lines
    this.setDepth(window.layers.low)
  }

  setPitch(audioNote: string) {
    this.pitch = audioNote
  }

  onTargeted() {
    this.setTintFill(this.bugColor)
  }

  modifyPitch() {
    if (this.modifiedPitch) {
      return
    }

    this.sharp = this.scene.add.text(this.x - 65, this.y - 32, '♯', {
      fontSize: '80px',
      color: this.bugColorHex,
    })
    if (this.pitch === '6C') {
      // 6C shouldn't be modified b/c there are guards, but
      // handle it anyway by half-stepping it down at least
      this.modifiedPitch = '5B'
    } else if (this.pitch.includes('B')) {
      this.modifiedPitch = `${parseInt(this.pitch[0], 10) + 1}C`
    } else if (this.pitch.includes('E')) {
      this.modifiedPitch = `${this.pitch[0]}F`
    } else {
      this.modifiedPitch = `${this.pitch}s` // s == sharp
    }
  }

  resetPitch() {
    if (this.sharp) {
      this.sharp.destroy()
    }
    this.clearTint()
    this.modifiedPitch = null
  }

  playNote() {
    if (this.pitch) {
      this.scene.sound.play(this.modifiedPitch || this.pitch)
    }
  }

  onRemove() {
    this.ledgerGraphics.clear()
    if (this.sharp) {
      this.sharp.destroy()
    }
  }
}
