import './styles/upzone.scss';
import { DropzoneOptions, FileItem } from '../types';

export default class Dropzone {
    element: HTMLElement;
    options: DropzoneOptions;
    eventListeners: Record<string, Function[]>;
    uploadedFiles: FileItem[];
    queue: File[];
    uploadingFiles: Map<File, XMLHttpRequest>;
    dropzone: HTMLElement | null = null;
    fileInput: HTMLInputElement | null = null;
    fileList: HTMLElement | null = null;

    constructor(element: HTMLElement, options: DropzoneOptions) {
        if (!(element instanceof HTMLElement)) {
            throw new Error('O primeiro parâmetro deve ser um elemento HTML válido.');
        }

        this.element = element;

        this.options = {
            ...{
                autoRender: true,
                autoQueue: true,
                multipleUploads: true,
                url: '/upload',
                method: 'POST',
                headers: {},
                params: {},
                acceptedTypes: ['*'],
                maxFileSize: Infinity,
                minFileSize: 0,
                messages: {
                    default: 'Drag and drop your files here or <strong>Browse</strong>',
                    invalidType: 'Invalid file type: {file}',
                    invalidSize: 'Invalid file size: {file} ({size} KB)',
                    uploadError: 'Error uploading file: {file}',
                    uploadSuccess: 'File uploaded successfully: {file}',
                    fileRemoved: 'File removed: {file}',
                }
            },
            ...options,
        };

        this.eventListeners = {};
        this.uploadedFiles = [];
        this.queue = [];
        this.uploadingFiles = new Map();

        if (this.options.autoRender) {
            this.createDropzone();
            this.initialize();
        }
    }

    createDropzone() {
        const dropzone = document.createElement('div');
        dropzone.id = 'dropzone';
        dropzone.className = 'dropzone';
        dropzone.innerHTML = `
        ${this.options?.messages?.default}
        <input type='file' id='fileInput' ${this.options.multipleUploads ? 'multiple' : ''} accept="${this.options.acceptedTypes.join(',')}" style='display: none;' />`;

        const fileList = document.createElement('ul');
        fileList.id = 'fileList';
        fileList.className = 'file-list';

        this.element.appendChild(dropzone);
        this.element.appendChild(fileList);
    }

    initialize() {
        this.dropzone = this.element.querySelector('#dropzone');
        this.fileInput = this.element.querySelector('#fileInput');
        this.fileList = this.element.querySelector('#fileList');

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.dropzone || !this.fileInput) return;

        this.dropzone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropzone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropzone.addEventListener('drop', this.handleDrop.bind(this));
        this.dropzone.addEventListener('click', () => this.fileInput?.click());
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    }

    handleDragOver(event: DragEvent) {
        event.preventDefault();
        if (this.dropzone) {
            this.dropzone.classList.add('drag-over');
        }
    }

    handleDragLeave(event: DragEvent) {
        event.preventDefault();
        if (this.dropzone) {
            this.dropzone.classList.remove('drag-over');
        }
    }

    handleDrop(event: DragEvent) {
        event.preventDefault();
        if (this.dropzone) {
            this.dropzone.classList.remove('drag-over');
        }

        const files = event.dataTransfer?.files;
        if (files) {
            this.validateAndHandleFiles(files);
        }
    }

    handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (files) {
            this.validateAndHandleFiles(files);
        }
    }

    validateAndHandleFiles(files: FileList) {
        Array.from(files).forEach((file) => {
            if (!this.isValidFileType(file)) {
                const message = this.formatMessage(this.options.messages.invalidType, {
                    file: file.name,
                });
                this.emit('uploaderror', { file: { name: file.name, size: file.size }, message });
                return;
            }

            if (!this.isValidFileSize(file)) {
                const sizeInKB = (file.size / 1024).toFixed(1);
                const message = this.formatMessage(this.options.messages.invalidSize, {
                    file: file.name,
                    size: sizeInKB,
                });
                this.emit('uploaderror', { file: { name: file.name, size: file.size }, message });
                return;
            }

            this.emit('fileadded', { name: file.name, size: file.size });
            this.addFileToList(file);
            if (this.options.autoQueue) {
                this.uploadFile(file);
            } else {
                this.queue.push(file);
            }
        });
    }

    isValidFileType(file: File): boolean {
        const acceptedTypes = this.options.acceptedTypes;
        return (
            acceptedTypes.includes('*') ||
            acceptedTypes.some((type) => file.type.includes(type))
        );
    }

    isValidFileSize(file: File): boolean {
        return (
            file.size >= this.options.minFileSize &&
            file.size <= this.options.maxFileSize
        );
    }

    addFileToList(file: File) {
        const listItem = document.createElement('li');
        listItem.classList.add('file-list-item');

        const previewContainer = document.createElement('div');
        previewContainer.className = 'file-preview';

        const preview = document.createElement('div');
        preview.className = 'preview';

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.style.backgroundImage = `url(${e.target?.result})`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('file-icon'); // Adiciona classe para SVG
        }

        previewContainer.appendChild(preview);

        const info = document.createElement('div');
        info.className = 'file-info';
        info.innerHTML = `<span class="file-name">${file.name}</span><span class="file-info">${(file.size / 1024).toFixed(1)} KB</span>`;

        previewContainer.appendChild(info);
        listItem.appendChild(previewContainer);

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-btn';
        removeButton.innerHTML = '&times;';
        removeButton.addEventListener('click', () => {
            this.fileList?.removeChild(listItem);
            this.uploadedFiles = this.uploadedFiles.filter((f) => f.name !== file.name);
            const message = this.formatMessage(this.options.messages.fileRemoved, {
                file: file.name,
            });
            this.emit('fileremoved', { file: { name: file.name, size: file.size }, message });
        });

        listItem.appendChild(removeButton);
        this.fileList?.appendChild(listItem);

        (file as FileItem).listItem = listItem; // Reference for progress update
    }

    uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        for (const [key, value] of Object.entries(this.options.params)) {
            formData.append(key, value);
        }

        const xhr = new XMLHttpRequest();
        xhr.open(this.options.method ?? 'POST', this.options.url ?? '/upload');

        for (const [header, value] of Object.entries(this.options.headers)) {
            xhr.setRequestHeader(header, value);
        }

        this.uploadingFiles.set(file, xhr);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;

                if (file.listItem) {
                    file.listItem.classList.add('uploading');
                    file.listItem.style.backgroundSize = `${percentComplete}% 100%`;
                    const fileInfo = file.listItem.querySelector('span.file-info');
                    if (fileInfo) {
                        fileInfo.textContent = `Uploading... (${percentComplete.toFixed(1)}%)`;
                    }
                }
            }
        });

        xhr.onload = () => {
            if (file.listItem) {
                file.listItem.classList.remove('uploading');
            }

            if (xhr.status === 200 || xhr.status === 201) {
                const message = this.formatMessage(this.options.messages.uploadSuccess, {
                    file: file.name,
                });

                if (file.listItem) {
                    file.listItem.classList.add('uploaded');
                    const fileInfo = file.listItem.querySelector('span.file-info');
                    if (fileInfo) {
                        fileInfo.textContent = `${file.name} uploaded successfully.`;
                    }
                }

                this.emit('uploadsuccess', { file: { name: file.name, size: file.size }, message });
            } else {
                const message = this.formatMessage(this.options.messages.uploadError, {
                    file: file.name,
                });
                this.emit('uploaderror', { file: { name: file.name, size: file.size }, message });
            }

            this.uploadingFiles.delete(file);
        };

        xhr.onerror = () => {
            const message = this.formatMessage(this.options.messages.uploadError, {
                file: file.name,
            });
            this.emit('uploaderror', { file: { name: file.name, size: file.size }, message });
            this.uploadingFiles.delete(file);
        };

        xhr.send(formData);
    }

    formatMessage(message: string, replacements: Record<string, string>): string {
        return message.replace(/{(.*?)}/g, (_, key) => replacements[key] || '');
    }

    emit(event: string, data: any) {
        const listeners = this.eventListeners[event];
        if (listeners) {
            listeners.forEach((callback) => callback(data));
        }
    }

    on(event: string, callback: Function) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
}  