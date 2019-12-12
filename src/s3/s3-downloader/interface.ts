export interface IDownloadFileParams {
  key: string;
  bucket: string;
}

export interface IS3Downloader {
  downloadFile(params: IDownloadFileParams): Promise<Buffer|string>
}