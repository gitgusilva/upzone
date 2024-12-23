import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

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
    // {
    //     input: 'src/components/VueComponent.vue',
    //     output: {
    //         file: 'dist/upzone.vue.js',
    //         format: 'esm',
    //         sourcemap: true
    //     },
    //     plugins: [
    //         resolve(),
    //         commonjs(),
    //         vue(),
    //         typescript({
    //             tsconfig: './tsconfig.json'
    //         }),
    //         terser(),
    //         postcss({
    //             extensions: ['.scss', '.css'],
    //             extract: false,
    //             minimize: true
    //         })
    //     ]
    // },
    {
        input: 'types/index.d.ts',
        output: {
            file: 'dist/upzone.d.ts',
            format: 'es'
        },
        plugins: [dts()]
    }
];