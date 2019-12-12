import { v4 } from 'uuid';

export const generateServerlessState = (): Buffer => {
  const json = JSON.stringify({
    package: {
      artifactDirectoryName: `${v4()}/${v4()}/${v4()}`
    }
  });

  return Buffer.alloc(json.length, json);
}
