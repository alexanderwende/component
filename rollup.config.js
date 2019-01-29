import pluginTypescript from 'rollup-plugin-typescript2';
import pluginLocalResolve from 'rollup-plugin-local-resolve';
import pluginNodeResolve from 'rollup-plugin-node-resolve';
import pluginCommonJS from 'rollup-plugin-commonjs';
import { terser as pluginTerser } from 'rollup-plugin-terser';
import pluginFileSize from 'rollup-plugin-filesize';
import typescript from 'typescript';
import pkg from './package.json';

export default [
    {
        input: 'src/index.ts',
        plugins: [
            pluginTypescript({
                typescript: typescript,
                include: [
                    'src/**/*.ts'
                ],
                exclude: [
                    'node_modules',
                    'src/**/*.spec.ts'
                ],
                clean: true
            }),
            // needed for imports from directories via index.ts files
            pluginLocalResolve(),
            // needed for absolute imports from node_modules
            pluginNodeResolve(),
            // needed for commonjs imports from node_modules
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
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true
            },
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true
            }
        ]
    }
];
