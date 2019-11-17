import { IZip, IZipFile } from '../interface';
import { JSZipFile } from './jszip-file';
import * as jszip from 'jszip'
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Advised } from 'aspect.js';

@Advised()
@injectable()
export class JSZip implements IZip {
  public async unzip(buffer: Buffer): Promise<IZipFile> {
    const zip = await jszip.loadAsync(buffer);

    return new JSZipFile(zip);
  }
}