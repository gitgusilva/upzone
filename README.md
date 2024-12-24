
# Upzone Documentation

## Overview
The `Upzone` provides an easy-to-use implementation for drag-and-drop file uploads with support for custom options, file validation, and upload management. It supports direct integration with plain JavaScript and Vue.

---

## Installation

### Using NPM
```bash
npm install upzone
```

### Using Vue
```bash
npm install upzone/vue
```

---

## Basic Usage

### Using JavaScript
```html
<div id="myDropzone"></div>
<script type="module">
    import Upzone from 'upzone';
    import 'upzone/css';

    const element = document.getElementById('myDropzone');
    const options = {
        url: '/upload',
        multipleUploads: true,
        acceptedTypes: ['image/*'],
        maxFileSize: 5000000, // 5MB
    };

    const dropzone = new Upzone(element, options);

    dropzone.on('fileadded', (file) => {
        console.log('File added:', file);
    });

    dropzone.on('uploadsuccess', (data) => {
        console.log('Upload successful:', data);
    });
</script>
```

### Using Vue
```html
<template>
  <Upzone
    v-model="files"
    :options="options"
    @fileadded="handleFileAdded"
    @uploadsuccess="handleUploadSuccess"
  />
</template>

<script>
import Upzone from 'upzone/vue';
import 'upzone/css';

export default {
  name: 'MyComponent',
  components: [ Upzone ],
  data () {
    return {
      files: [],
      options: {
        url: '/upload',
        multipleUploads: true,
        acceptedTypes: ['image/*']
      }
    }
  },
  methods: {
    handleFileAdded ({ file, message }) {
      console.log('File added:', file);
    },
    handleUploadSuccess ({ file, message }) {
      console.log('Upload successful:', file);
    }
  }
};
</script>

```

---

## Options

| Option          | Type      | Default                 | Description                                                                 |
|------------------|-----------|-------------------------|-----------------------------------------------------------------------------|
| `url`           | `string`  | `/upload`               | The endpoint URL for file uploads.                                         |
| `autoQueue`     | `boolean` | `true`                  | Automatically queue files for upload upon addition.                        |
| `multipleUploads` | `boolean` | `true`                | Enable or disable multiple file uploads.                                   |
| `acceptedTypes` | `Array`   | `['*']`                 | List of accepted MIME types (e.g., `['image/*']`).                         |
| `maxFileSize`   | `number`  | `Infinity`              | Maximum file size in bytes.                                                |
| `minFileSize`   | `number`  | `0`                     | Minimum file size in bytes.                                                |
| `headers`       | `Object`  | `{}`                    | Custom headers to send with the file upload request.                       |
| `params`        | `Object`  | `{}`                    | Custom parameters to include with the upload request.                      |

---

## Events

| Event           | Description                                                             |
|------------------|-------------------------------------------------------------------------|
| `fileadded`     | Triggered when a file is added to the dropzone.                         |
| `uploadsuccess` | Triggered when a file is uploaded successfully.                         |
| `uploaderror`   | Triggered when there is an error during file upload.                   |
| `fileremoved`   | Triggered when a file is removed from the dropzone.                    |

---

## Styles
You can customize the appearance of your dropzone by targeting the following classes:

| Class            | Description                                           |
|-------------------|-------------------------------------------------------|
| `.dropzone`      | The container for the dropzone area.                   |
| `.file-list`     | The list displaying uploaded files.                    |
| `.file-list-item`| An individual file item in the list.                   |
| `.file-preview`  | A container for file preview and details.              |

---

## Example Use Cases

1. **Basic Image Upload**
   - Uploading profile pictures with validation for image file type and size.

2. **Bulk File Uploads**
   - Uploading multiple files to a server endpoint.

3. **Custom Styling**
   - Creating visually distinct upload areas by customizing the `.dropzone` styles.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.