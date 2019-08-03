import pluginTypescript from 'rollup-plugin-typescript2';
import pluginLocalResolve from 'rollup-plugin-local-resolve';
import pluginNodeResolve from 'rollup-plugin-node-resolve';
import pluginCommonJS from 'rollup-plugin-commonjs';
import pluginServe from 'rollup-plugin-serve';
import typescript from 'typescript';
import fs from 'fs';

export default {
    input: 'demo/main.ts',
    output: {
        file: 'demo/main.bundle.js',
        format: 'iife',
        sourcemap: 'inline'
    },
    plugins: [
        pluginTypescript({
            typescript: typescript,
            tsconfig: "tsconfig.demo.json",
            clean: true
        }),
        // needed for imports from directories via index.ts files
        pluginLocalResolve(),
        // needed for absolute imports from node_modules
        pluginNodeResolve(),
        // needed for commonjs imports from node_modules
        pluginCommonJS(),
        pluginServe({
            host: 'localhost',
            open: true,
            contentBase: 'demo',
            https: {
                key: fs.readFileSync('/Users/alex/.https/server.key'),
                cert: fs.readFileSync('/Users/alex/.https/server.crt')
            },
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
    ]
};
