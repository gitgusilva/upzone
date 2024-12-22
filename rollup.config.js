import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/upzone.js',
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: 'dist/upzone.esm.js',
            format: 'esm',
            sourcemap: true,
        },
    ],
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json'
        }),
        terser(),
        postcss({
            extensions: ['.scss'],
            use: [
                ['sass', { includePaths: ['./src/styles'] }]
            ],
            extract: 'styles.css',
            minimize: true
        }),
        url({
            include: ['**/*.svg'],
            limit: 0,
            publicPath: '../assets/',
            destDir: 'dist/assets/',
            fileName: '[name][hash][extname]'
        })
    ]
};