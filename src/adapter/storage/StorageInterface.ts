export class StorageInterface {
  constructor() {
    if (this.constructor === StorageInterface) {
      throw new Error("Cannot instantiate abstract class StorageAdapter");
    }
  }

  /**
   * Generates authentication parameters for the client-side upload.
   * @param {string} fileName - Original file name
   * @param {string} context - The feature context (status, profile)
   * @param {string} mimeType - File mime type
   * @returns {Promise<object>}
   */
  async generatePreSignedUrl(fileName: string, context: string, mimeType: string): Promise<object> {
    throw new Error("Method not implemented");
  }
}

