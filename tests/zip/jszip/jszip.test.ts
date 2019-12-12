import { JSZip } from '../../../src/zip';
import { generateZip, promisedRandomBytes } from '../../helpers';

describe('JSZip', () => {
  describe('#unzip', () => {
    it('unzips the data', async () => {
      const buffer = await promisedRandomBytes(256);
      const zipped = await generateZip([{buffer, fileName: 'test'}]);

      const zip = new JSZip();
      const unzipped = await zip.unzip(zipped);
      const file = await unzipped.file('test');

      expect(file).toStrictEqual(buffer);
    });
  });
});