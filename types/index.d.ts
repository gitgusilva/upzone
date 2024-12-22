declare global {
    interface File {
        listItem?: HTMLElement;
    }
}

export interface DropzoneOptions {
    autoRender: boolean;
    autoQueue: boolean;
    multipleUploads: boolean;
    url: string;
    method: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    acceptedTypes: string[];
    maxFileSize: number;
    minFileSize: number;
    messages: {
        default: string;
        invalidType: string;
        invalidSize: string;
        uploadError: string;
        uploadSuccess: string;
        fileRemoved: string;
    };
}

export interface FileItem {
    name: string;
    size: number;
    listItem?: HTMLElement;
    infoElement?: HTMLElement;
    retryButton?: HTMLElement;
}