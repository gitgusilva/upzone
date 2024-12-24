<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import Upzone from '../Upzone';

const emit = defineEmits([
    'update:modelValue',
    'fileadded',
    'uploadsuccess',
    'uploaderror',
    'fileremoved'
]);

const files = ref([]);
const dropzoneInstance = ref();

const props = defineProps({
    modelValue: Array,
    options: {
        type: Object,
        default: () => ({})
    }
});

watch(files, (newValue) => {
    emit('update:modelValue', newValue);
});

onMounted(async () => {
    let element = document.getElementById('upzone');

    if (!element) {
        console.error('Base element not found!');
        return;
    }

    dropzoneInstance.value = new Upzone(element, props.options.value);

    if (dropzoneInstance.value) {
        dropzoneInstance.value.on('fileadded', (file) => {
            files.value.push(file);
            emit('fileadded', file);
        });

        dropzoneInstance.value.on('uploadsuccess', (file) => {
            emit('uploadsuccess', file);
        });

        dropzoneInstance.value.on('uploaderror', (file) => {
            emit('uploaderror', file);
        });

        dropzoneInstance.value.on('fileremoved', (file) => {
            files.value = files.value.filter((f) => f.name !== file.name);
            emit('fileremoved', file);
        });
    }
});

onUnmounted(() => {
    if (dropzoneInstance.value) {
        dropzoneInstance.value = null;
    }

    files.value = [];
});
</script>

<template>
    <div id="upzone" />
</template>