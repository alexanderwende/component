import { microTask, macroTask, animationFrameTask, Task, TaskCanceledError } from './tasks';

describe('Task', () => {

    describe('microTask', () => {

        it('should shedule a callback for the next micro task', async () => {

            const expectedOrder: string[] = ['before-shedule-task', 'after-shedule-task', 'before-task', 'task', 'after-task'];
            const recordedOrder: string[] = [];

            recordedOrder.push('before-shedule-task');

            // Promise.then() schedules a micro-task, so we should see the executor result before the task's result
            const promiseBefore = Promise.resolve().then(() => recordedOrder.push('before-task'));

            // microTask should schedule a micro-task, so we should see executor result after
            // this function's results, but before the next Promise
            const task = microTask(() => recordedOrder.push('task'));

            // Promise.then() schedules a micro-task, so we should see the executor result last
            const promiseAfter = Promise.resolve().then(() => recordedOrder.push('after-task'));

            recordedOrder.push('after-shedule-task');

            await Promise
                .all([promiseBefore, task.promise, promiseAfter])
                .then(() => expect(recordedOrder).toEqual(expectedOrder));
        });

        it('should reject the promise when canceled and not execute the task callback', async () => {

            await testCancel((recordedOrder: string[]) => microTask(() => recordedOrder.push('task')));
        });

        it('should not cancel if already resolved', async () => {

            await testCancelResolved((recordedOrder: string[]) => microTask(() => recordedOrder.push('task')));
        });

        it('should reject if the task callback throws an error', async () => {

            await testThrow(() => microTask(() => { throw new Error('TestError'); }));
        });
    });

    describe('macroTask', () => {

        it('should shedule a callback for the next macro task', async () => {

            const expectedOrder: string[] = ['before-shedule-task', 'after-shedule-task', 'micro-task', 'before-task', 'task', 'after-task'];
            const recordedOrder: string[] = [];

            recordedOrder.push('before-shedule-task');

            // setTimeout schedules a macro-task, so we should see the executor result before the task's result
            setTimeout(() => recordedOrder.push('before-task'), 0);

            // macroTask should schedule a macro-task, so we should see executor result after
            // this function's results, but before the next setTimeout
            const task = macroTask(() => recordedOrder.push('task'));

            // setTimeout schedules a macro-task, so we should see the executor result last
            setTimeout(() => recordedOrder.push('after-task'), 0);

            // this micro tasks result should resolve before the macro-tasks
            microTask(() => recordedOrder.push('micro-task'));

            recordedOrder.push('after-shedule-task');

            await task.promise
                .then(() => new Promise((resolve, reject) => {
                    setTimeout(() => resolve(), 0);
                }))
                .then(() => expect(recordedOrder).toEqual(expectedOrder));
        });

        it('should reject the promise when canceled and not execute the task callback', async () => {

            await testCancel((recordedOrder: string[]) => macroTask(() => recordedOrder.push('task')));
        });

        it('should not cancel if already resolved', async () => {

            await testCancelResolved((recordedOrder: string[]) => macroTask(() => recordedOrder.push('task')))
        });

        it('should reject if the task callback throws an error', async () => {

            await testThrow(() => macroTask(() => { throw new Error('TestError'); }));
        });
    });

    describe('animationFrameTask', () => {

        it('should shedule a callback for the next animation frame', async () => {

            const expectedOrder: string[] = ['before-shedule-task', 'after-shedule-task', 'micro-task', 'before-task', 'task', 'after-task'];
            const recordedOrder: string[] = [];

            recordedOrder.push('before-shedule-task');

            // requestAnimationFrame schedules an animation frame, so we should see the executor result before the task's result
            requestAnimationFrame(() => recordedOrder.push('before-task'));

            // animationFrame should schedule an animation frame, so we should see executor result after
            // this function's results, but before the next requestAnimationFrame
            const task = animationFrameTask(() => recordedOrder.push('task'));

            // requestAnimationFrame schedules an animation frame, so we should see the executor result last
            requestAnimationFrame(() => recordedOrder.push('after-task'));

            // this micro-task's result should resolve before the macro-tasks
            microTask(() => recordedOrder.push('micro-task'));

            // a macro-task is not necessarily run before an animation frame - it depends on the timing and the browser's scheduling
            // macroTask(() => recordedOrder.push('macro-task'));

            recordedOrder.push('after-shedule-task');

            await task.promise
                .then(() => new Promise((resolve, reject) => {
                    requestAnimationFrame(() => resolve());
                }))
                .then(() => expect(recordedOrder).toEqual(expectedOrder));
        });

        it('should reject the promise when canceled and not execute the task callback', async () => {

            await testCancel((recordedOrder: string[]) => animationFrameTask(() => recordedOrder.push('task')));
        });

        it('should not cancel if already resolved', async () => {

            await testCancelResolved((recordedOrder: string[]) => animationFrameTask(() => recordedOrder.push('task')));
        });

        it('should reject if the task callback throws an error', async () => {

            await testThrow(() => animationFrameTask(() => { throw new Error('TestError'); }));
        });
    });
});

/**
 * Tests the cancel behavior of a task object, regardless of how the task is scheduled
 *
 * @remarks
 * The logic and expected behavior is the same for micro-tasks, macro-tasks and animationFrames.
 */
async function testCancel (taskFactory: (recordedOrder: string[]) => Task) {

    const expectedOrder: string[] = ['before-shedule-task', 'after-shedule-task'];
    const recordedOrder: string[] = [];

    recordedOrder.push('before-shedule-task');

    const task = taskFactory(recordedOrder);

    recordedOrder.push('after-shedule-task');

    // we cancel the task: this should prevent the task from running and reject its promise
    task.cancel();

    await task.promise.then(
        () => { throw ('Canceled task should not resolve.'); },
        () => expect(recordedOrder).toEqual(expectedOrder),
    );

    await task.promise.catch(reason => expect(reason instanceof TaskCanceledError).toBe(true));
}

/**
 * Tests the cancel behavior of a resolved task object, regardless of how the task is scheduled
 *
 * @remarks
 * The logic and expected behavior is the same for micro-tasks, macro-tasks and animationFrames.
 */
async function testCancelResolved (taskFactory: (recordedOrder: string[]) => Task) {

    const expectedOrder: string[] = ['before-shedule-task', 'after-shedule-task', 'task'];
    const recordedOrder: string[] = [];

    recordedOrder.push('before-shedule-task');

    const task = taskFactory(recordedOrder);

    recordedOrder.push('after-shedule-task');

    await task.promise.then(
        () => {
            // after the task resolved, we try canceling it which should NOT work
            task.cancel();
            // we return the task's promise: this will resolve or reject
            // then()'s returned promise just like the task's promise
            // if the cancel() call worked, then()'s returned promise
            // should be rejected
            return task.promise;
        },
        () => { throw ('Resolved task should not be rejected.'); },
    ).then(
        () => expect(recordedOrder).toEqual(expectedOrder),
        () => { throw ('Resolved task should not be rejected.'); },
    );
}

async function testThrow (taskFactory: () => Task) {

    const task = taskFactory();

    await task.promise.then(
        () => { throw ('Task that throws error should not resolve.'); },
        (reason) => expect((reason as Error).message).toBe('TestError'),
    );
}
