import { Actor } from './actor'

export class NPC extends Actor {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture)

    this._body.allowGravity = false
    this._body.immovable = true
  }
}
