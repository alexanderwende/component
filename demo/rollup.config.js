import pluginTypescript from 'rollup-plugin-typescript2';
import pluginLocalResolve from 'rollup-plugin-local-resolve';
import pluginNodeResolve from 'rollup-plugin-node-resolve';
import pluginCommonJS from 'rollup-plugin-commonjs';
import pluginServe from 'rollup-plugin-serve';
import typescript from 'typescript';

export default {
    input: 'main.ts',
    output: {
        file: 'main.bundle.js',
        format: 'iife',
        sourcemap: 'inline'
    },
    plugins: [
        pluginTypescript({
            typescript: typescript,
            tsconfig: "./tsconfig.json",
            clean: true
        }),
        // needed for imports from directories via index.ts files
        pluginLocalResolve(),
        // needed for absolute imports from node_modules
        pluginNodeResolve(),
        // needed for commonjs imports from node_modules
        pluginCommonJS(),
        pluginServe({
            open: true,
            historyApiFallback: true
        })
    ]
};
