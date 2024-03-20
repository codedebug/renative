import {
    RnvTaskFn,
    RnvTaskOptionPresets,
    getConfigProp,
    logTask,
    logSummary,
    logRaw,
    logErrorPlatform,
    executeOrSkipTask,
    shouldSkipTask,
    RnvTask,
    RnvTaskName,
} from '@rnv/core';
import { packageAndroid, runAndroid, getAndroidDeviceToRunOn } from '@rnv/sdk-android';
import { runXcodeProject, getIosDeviceToRunOn } from '@rnv/sdk-apple';
import { startBundlerIfRequired, waitForBundlerIfRequired } from '@rnv/sdk-react-native';

const taskRun: RnvTaskFn = async (c, parentTask, originTask) => {
    const { platform } = c;
    const { port } = c.runtime;
    const { target } = c.runtime;
    const { hosted } = c.program;
    logTask('taskRun', `parent:${parentTask} port:${port} target:${target} hosted:${hosted}`);

    await executeOrSkipTask(RnvTaskName.configure, RnvTaskName.run, originTask);

    if (shouldSkipTask(RnvTaskName.run, originTask)) return true;

    const bundleAssets = getConfigProp('bundleAssets', false);

    switch (platform) {
        case 'androidtv':
        case 'firetv':
            // eslint-disable-next-line no-case-declarations
            const runDevice = await getAndroidDeviceToRunOn();
            if (!c.program.only) {
                await startBundlerIfRequired(RnvTaskName.run, originTask);
                if (bundleAssets) {
                    await packageAndroid();
                }
                await runAndroid(runDevice!);
                if (!bundleAssets) {
                    logSummary('BUNDLER STARTED');
                }
                return waitForBundlerIfRequired();
            }
            return runAndroid(runDevice!);
        case 'tvos':
            // eslint-disable-next-line no-case-declarations
            const runDeviceArgs = await getIosDeviceToRunOn(c);
            if (!c.program.only) {
                await startBundlerIfRequired(RnvTaskName.run, originTask);
                await runXcodeProject(runDeviceArgs);
                if (!bundleAssets) {
                    logSummary('BUNDLER STARTED');
                }
                return waitForBundlerIfRequired();
            }
            return runXcodeProject(runDeviceArgs);
        default:
            return logErrorPlatform();
    }
};

const taskRunHelp = async () => {
    logRaw(`
More info at: https://renative.org/docs/api-cli
`);
};

const Task: RnvTask = {
    description: 'Run your tv app on target device or emulator',
    fn: taskRun,
    fnHelp: taskRunHelp,
    task: RnvTaskName.run,
    isPriorityOrder: true,
    // dependencies: {
    //     before: RnvTaskName.configure,
    // },
    options: RnvTaskOptionPresets.withBase(RnvTaskOptionPresets.withConfigure(RnvTaskOptionPresets.withRun())),
    platforms: ['tvos', 'androidtv', 'firetv'],
};

export default Task;
