import pluginTypescript from 'rollup-plugin-typescript2';
import pluginLocalResolve from 'rollup-plugin-local-resolve';
import pluginNodeResolve from 'rollup-plugin-node-resolve';
import pluginCommonJS from 'rollup-plugin-commonjs';
import pluginServe from 'rollup-plugin-serve';
import typescript from 'typescript';

export default {
    input: 'example/main.ts',
    output: {
        file: 'example/main.bundle.js',
        format: 'iife',
        sourcemap: 'inline'
    },
    plugins: [
        pluginTypescript({
            typescript: typescript,
            tsconfig: "tsconfig.example.json",
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
            contentBase: 'example',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
    ]
};
