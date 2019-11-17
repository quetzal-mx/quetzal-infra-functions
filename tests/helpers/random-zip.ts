import * as JSZip from 'jszip';
import { promisify } from 'util';
import { randomBytes } from 'crypto';

export const promisedRandomBytes = promisify(randomBytes);

export const generateRandomZip = async(buffer: Buffer, fileName: string): Promise<Buffer> => {
  const zip = new JSZip();

  zip.file(fileName, buffer);

  return await zip.generateAsync({type: 'nodebuffer'});
};

