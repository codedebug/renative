import {
    RnvTaskFn,
    logTask,
    RnvTaskOptionPresets,
    executeOrSkipTask,
    initializeTask,
    findSuitableTask,
    RnvTask,
    RnvTaskName,
} from '@rnv/core';
import Docker from '../docker';

const taskDockerExport: RnvTaskFn = async (c, parentTask, originTask) => {
    logTask('taskDockerExport', `parent:${parentTask}`);

    if (c.program.only) {
        // If run as standalone command skip all the export
        await executeOrSkipTask(c, RnvTaskName.export, 'docker export', originTask);
    } else {
        const taskInstance = await findSuitableTask(c, RnvTaskName.export);
        if (taskInstance) await initializeTask(c, taskInstance.task);
    }

    const docker = new Docker(c);
    await docker.doExport();
    return true;
};

const Task: RnvTask = {
    description: 'Exports your project to docker image',
    fn: taskDockerExport,
    task: 'docker export',
    options: RnvTaskOptionPresets.withBase(),
    platforms: ['web'],
};

export default Task;
