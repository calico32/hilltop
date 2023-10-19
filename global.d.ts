declare module 'md5.js' {
  export class MD5 {
    constructor()
    update(data: string): MD5
    digest(encoding: string): string
  }

  export = MD5
}
