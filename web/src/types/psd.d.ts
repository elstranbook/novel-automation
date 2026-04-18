declare module 'psd.js' {
  interface PSDLayerImage {
    pixelData?: Uint8Array
    width: number
    height: number
  }

  interface PSDLayer {
    name: string
    type: string
    visible: boolean
    opacity: number
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
    image?: PSDLayerImage
    children: PSDLayer[]
    descendants(): PSDLayer[]
  }

  class PSD {
    constructor(buffer: ArrayBuffer)
    parse(): Promise<void>
    tree(): PSDLayer
    image?: {
      width(): number
      height(): number
      pixelData?: Uint8Array
      toBase64(): string
    }
  }

  export default PSD
}