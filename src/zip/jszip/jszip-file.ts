import { IZipFile } from "../interface";
import * as JSZip from 'jszip'; 
import { Advised } from 'aspect.js';

@Advised()
export class JSZipFile implements IZipFile{
  constructor(private jszip: JSZip) {
  }

  public async file(name: string): Promise<Buffer> {
    return await this.jszip.file(name).async('nodebuffer');
  }
}