import { strict as assert } from 'assert';
import ZipStream from 'zip-stream';
import path from 'path';

/**
 * Provides support for downloading a Zip archive of files. Requires
 * the page is running inside `kiosk-browser` and that it is configured such
 * that the executing host is allowed to use the `saveAs` API.
 */
export class DownloadableArchive {
  private zip?: ZipStream;
  private endPromise?: Promise<void>;

  constructor(private readonly kiosk = window.kiosk) {}

  private getKiosk(): KioskBrowser.Kiosk {
    assert(this.kiosk);
    return this.kiosk;
  }

  /**
   * Begins downloading an archive by prompting the user where to put it and
   * making this instance ready to receive files. Resolves when ready to receive
   * files.
   */
  async beginWithDialog(options?: KioskBrowser.SaveAsOptions): Promise<void> {
    const fileWriter = await this.getKiosk().saveAs(options);

    if (!fileWriter) {
      throw new Error('could not begin download; no file was chosen');
    }

    let endResolve: () => void;
    this.endPromise = new Promise((resolve) => {
      endResolve = resolve;
    });
    this.zip = new ZipStream()
      .on('data', (chunk) => fileWriter.write(chunk))
      .on('end', () => fileWriter.end().then(endResolve));
  }

  /**
   * Begins downloading an archive to the filePath specified. Resolves when
   * ready to receive files.
   */
  async beginWithDirectSave(
    pathToFolder: string,
    filename: string
  ): Promise<void> {
    await this.getKiosk().makeDirectory(pathToFolder, {
      recursive: true,
    });
    const filePath = path.join(pathToFolder, filename);
    const fileWriter = await this.getKiosk().writeFile(filePath);

    if (!fileWriter) {
      throw new Error('could not begin download; an error occurred');
    }

    let endResolve: () => void;
    this.endPromise = new Promise((resolve) => {
      endResolve = resolve;
    });
    this.zip = new ZipStream()
      .on('data', (chunk) => fileWriter.write(chunk))
      .on('end', () => fileWriter.end().then(endResolve));
  }

  /**
   * Writes a file to the archive, resolves when complete.
   */
  async file(
    name: string,
    data: Parameters<ZipStream['entry']>[0]
  ): Promise<void> {
    const { zip } = this;

    if (!zip) {
      throw new Error('cannot call file() before begin()');
    }

    return new Promise((resolve, reject) => {
      zip.entry(data, { name }, (err) => (err ? reject(err) : resolve()));
    });
  }

  /**
   * Finishes the zip archive and ends the download.
   */
  async end(): Promise<void> {
    if (!this.zip) {
      throw new Error('cannot call end() before begin()');
    }

    this.zip.finalize();
    await this.endPromise;
    this.zip = undefined;
    this.endPromise = undefined;
  }
}