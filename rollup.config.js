import vue from 'rollup-plugin-vue';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/upzone.js',
                format: 'cjs',
                sourcemap: true
            },
            {
                file: 'dist/upzone.esm.js',
                format: 'esm',
                sourcemap: true
            }
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json'
            }),
            terser()
        ]
    },
    {
        input: 'src/styles/upzone.scss',
        output: {
            file: 'dist/upzone.css'
        },
        plugins: [
            postcss({
                extensions: ['.scss', '.css'],
                extract: true,
                minimize: true
            })
        ]
    },
    {
        input: 'src/vue/UpzoneComponent.vue',
        output: {
            file: 'dist/upzone.vue.js',
            format: 'esm',
            sourcemap: true
        },
        plugins: [
            resolve({
                extensions: ['.js', '.ts', '.vue'],
                dedupe: ['vue']
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
            }),
            vue({
                css: true,
                compileTemplate: true,
                processStyles: true
            }),
            terser(),
            postcss({
                extensions: ['.scss', '.css'],
                extract: false,
                minimize: true
            })
        ]
    }
];