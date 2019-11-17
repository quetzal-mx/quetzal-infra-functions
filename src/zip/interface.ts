export interface IZipFile {
  file(name: string): Promise<Buffer>;
}

export interface IZip {
  unzip(buffer: Buffer): Promise<IZipFile>;
}
