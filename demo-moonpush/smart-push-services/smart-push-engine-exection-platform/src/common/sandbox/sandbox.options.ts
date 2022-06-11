
import { NodeVM, NodeVMOptions } from 'vm2';
import { merge } from 'lodash';
const DEFAULT_OPTION: NodeVMOptions = {
    console: 'inherit',
    sandbox: {},
    require: {
        builtin: ['assert', 'buffer', 'crypto', 'util', 'path', 'bignumber.js'],
        external: true,
        context: 'sandbox',
    },
    wrapper: 'commonjs',
    sourceExtensions: ['js', 'cjs'],
    timeout: 3000
};

export interface SandboxOption {
    root: string;
}

export class Sandbox extends NodeVM {
    constructor(option: SandboxOption) {
        // super(merge(DEFAULT_OPTION, {
        //     require: {
        //         root: option.root,
        //         resolve: (moduleName: string) => {
        //             return require.resolve(moduleName, { paths: [option.root] });
        //         },
        //     },
        // }));
        super(DEFAULT_OPTION);
    }

}

