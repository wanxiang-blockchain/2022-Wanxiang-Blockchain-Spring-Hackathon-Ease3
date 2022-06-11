
import * as path from 'path';
import { VMScript } from 'vm2';
import { Sandbox, } from './sandbox.options';
import { SandboxResult } from './sandbox.result';

export class SandboxService {
    static VMSCRIPT_MAP: Map<string, VMScript> = new Map();
    static run(arg: any, script_hash: string, execute_script: string, parameters: any): SandboxResult {
        let script: VMScript = null;
        if (SandboxService.VMSCRIPT_MAP.has(script_hash)) {
            script = SandboxService.VMSCRIPT_MAP.get(script_hash);
        } else {
            try {
                script = new VMScript(execute_script).compile();
                SandboxService.VMSCRIPT_MAP.set(script_hash, script);
            } catch (err) {
                console.error('[Sandbox] Failed to compile script.', err);
            }
        }
        let root = path.resolve(__dirname, '');
        // console.log('root:', root);
        let vm = new Sandbox({
            root: root
        });
        let functionInSandbox: any = null;
        try {
            functionInSandbox = vm.run(script);
            let result = functionInSandbox(arg, parameters);
            return result;
        } catch (err) {
            console.error('[Sandbox] Failed to execute script.', err);
        }
        finally {
            vm = null;
        }
    }

}

