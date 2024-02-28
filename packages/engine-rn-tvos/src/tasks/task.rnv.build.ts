import {
    RnvTaskFn,
    logErrorPlatform,
    logTask,
    TASK_BUILD,
    TASK_PACKAGE,
    TASK_EXPORT,
    PARAMS,
    executeOrSkipTask,
    shouldSkipTask,
    RnvTask,
} from '@rnv/core';
import { buildReactNativeAndroid } from '@rnv/sdk-react-native';
import { buildXcodeProject } from '@rnv/sdk-apple';

export const taskRnvBuild: RnvTaskFn = async (c, parentTask, originTask) => {
    logTask('taskRnvBuild');
    const { platform } = c;

    await executeOrSkipTask(c, TASK_PACKAGE, TASK_BUILD, originTask);

    if (shouldSkipTask(c, TASK_BUILD, originTask)) return true;

    switch (platform) {
        case 'androidtv':
        case 'firetv':
            return buildReactNativeAndroid(c);
        case 'tvos':
            if (parentTask === TASK_EXPORT) {
                // build task is not necessary when exporting ios
                return true;
            }
            return buildXcodeProject(c);
        default:
            return logErrorPlatform(c);
    }
};

const Task: RnvTask = {
    description: 'Build project binary',
    fn: taskRnvBuild,
    task: TASK_BUILD,
    params: PARAMS.withBase(PARAMS.withConfigure()),
    platforms: ['tvos', 'androidtv', 'firetv'],
};

export default Task;
