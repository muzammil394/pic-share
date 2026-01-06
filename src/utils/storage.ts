import { BlobServiceClient } from '@azure/storage-blob';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { AZURE_STORAGE_CONNECTION_STRING, AZURE_CONTAINER_NAME } from '../config/azure';

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

export const uploadImage = async (file: Express.Multer.File, caption: string, userId: string) => {
    const blobName = `${uuidv4()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const stream = Readable.from(file.buffer);
    const uploadOptions = {
        blobHTTPHeaders: { blobContentType: file.mimetype },
    };

    await blockBlobClient.uploadStream(stream, file.size, undefined, uploadOptions);
    
    return {
        url: blockBlobClient.url,
        caption,
        userId,
        uploadDate: new Date().toISOString(),
    };
};

export const deleteImage = async (blobName: string) => {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
};