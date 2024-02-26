import { createRnvApi, createRnvContext, executeTask, getContext } from '@rnv/core';
import taskRnvPlatformConfigure from '../task.rnv.platform.configure';

jest.mock('../../common');
jest.mock('../../buildSchemes');
jest.mock('@rnv/core');

beforeEach(() => {
    createRnvContext();
    createRnvApi();
});

afterEach(() => {
    jest.resetAllMocks();
});

test('Execute task.rnv.platform.configure', async () => {
    //GIVEN
    const ctx = getContext();
    //WHEN
    await expect(taskRnvPlatformConfigure.fn?.(ctx)).resolves.toEqual(true);
    //THEN
    expect(executeTask).toHaveBeenCalledWith(ctx, 'project configure', 'platform configure', undefined);
});
