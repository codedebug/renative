import { RnvTaskOptionPresets, RnvTask, RnvTaskName } from '@rnv/core';
import { runWebNext } from '../sdk/runner';
import { SdkPlatforms } from '../sdk/constants';

const Task: RnvTask = {
    description: 'Run your app in browser',
    dependsOn: [RnvTaskName.configure],
    fn: async ({ ctx }) => {
        ctx.runtime.shouldOpenBrowser = true;
        return runWebNext();
    },
    task: RnvTaskName.run,
    isPriorityOrder: true,
    options: RnvTaskOptionPresets.withConfigure(RnvTaskOptionPresets.withRun()),
    platforms: SdkPlatforms,
};

export default Task;
