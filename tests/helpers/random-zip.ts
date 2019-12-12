import * as JSZip from 'jszip';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
import { IZipFile, JSZipFile } from '../../src/zip';
import * as jszip from 'jszip'

export const promisedRandomBytes = promisify(randomBytes);

export const generateZip = async (files: Array<{buffer: Buffer, fileName: string}>): Promise<Buffer> => {
  const zip = new JSZip();

  files.forEach(file => zip.file(file.fileName, file.buffer));

  return await zip.generateAsync({type: 'nodebuffer'});
};

export const generateJSZip = async (files: Array<{buffer: Buffer, fileName: string}>): Promise<IZipFile> => {
  const contents = await generateZip(files);
  const zip = await jszip.loadAsync(contents);

  return new JSZipFile(zip);
}
