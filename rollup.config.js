import pluginLocalResolve from 'rollup-plugin-local-resolve';
import pluginNodeResolve from 'rollup-plugin-node-resolve';
import pluginCommonJS from 'rollup-plugin-commonjs';
import { terser as pluginTerser } from 'rollup-plugin-terser';
import pluginFileSize from 'rollup-plugin-filesize';
import pkg from './package.json';

export default [
    {
        input: 'dist/index.js',
        plugins: [
            pluginLocalResolve(),
            pluginNodeResolve(),
            pluginCommonJS(),
            pluginTerser(),
            pluginFileSize({
                showMinifiedSize: true,
                showGzippedSize: true,
                showBrotliSize: true
            })
        ],
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {})
        ],
        output: [{
            file: 'dist/index.bundle.js',
            format: 'esm'
        }]
    }
];
