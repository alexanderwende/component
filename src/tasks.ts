/**
 * A task object interface as returned by the scheduler methods
 *
 * @remarks
 * A task is an object consisting of a {@link Promise} which will be resolved
 * when the task callback was executed and a cancel method, which will prevent
 * the task callback from being executed and reject the task's Promise. A task
 * which is already resolved cannot be canceled anymore.
 */
export interface Task<T = any> {
    promise: Promise<T>;
    cancel: () => void;
};

/**
 * A special error class which is thrown when a task is canceled
 *
 * @remarks
 * This error class is used to reject a task's Promise, when the task
 * is canceled. You can check for this specific error, to handle canceled
 * tasks different from otherwise rejected tasks.
 *
 * ```typescript
 * const task = microTask(() => {
 *      // do sth...
 * });
 *
 * task.cancel();
 *
 * task.promise.catch(reason => {
 *      if (reason instanceof TaskCanceledError) {
 *          // ...this task was canceled
 *      }
 * });
 * ```
 */
export class TaskCanceledError extends Error {

    constructor (message?: string) {

        super(message);

        this.name = 'TaskCanceledError';
    }
}

const TASK_CANCELED_ERROR = () => new TaskCanceledError('Task canceled.');

/**
 * Executes a task callback in the next micro-task and returns a Promise which will
 * resolve when the task was executed.
 *
 * @remarks
 * Uses {@link Promise.then} to schedule the task callback in the next micro-task.
 * If the task is canceled before the next micro-task, the Promise executor won't
 * run the task callback but reject the Promise.
 *
 * @param task  The callback function to execute
 * @returns     A Promise which will resolve after the callback was executed
 */
export function microTask<T = any> (task: () => T): Task<T> {

    let canceled = false;

    const promise = Promise.resolve().then(() => {

        /**
         * The actual Promise is created in `Promise.then`'s executor, in order
         * for it to execute the task in the next micro-task. This means we can't
         * get a reference of the Promise's reject method in the scope of this
         * function. But we can use a local variable in this function's scope to
         * prevent {@link runTask} to be executed.
         */
        return new Promise<T>((resolve, reject) => {

            if (canceled) {

                reject(TASK_CANCELED_ERROR());

            } else {

                runTask(task, resolve, reject);
            }
        });
    });

    const cancel = () => canceled = true;

    return { promise, cancel };
}

/**
 * Executes a task callback in the next macro-task and returns a Promise which will
 * resolve when the task was executed
 *
 * @remarks
 * Uses {@link setTimeout} to schedule the task callback in the next macro-task.
 * If the task is canceled before the next macro-task, the timeout is cleared and
 * the Promsie is rejected.
 *
 * @param task  The callback function to execute
 * @returns     A Promise which will resolve after the callback was executed
 */
export function macroTask<T = any> (task: () => T): Task<T> {

    let cancel!: () => void;

    const promise = new Promise<T>((resolve, reject) => {

        let timeout: number | undefined = setTimeout(() => runTask(task, resolve, reject), 0);

        cancel = () => {

            if (timeout) {
                clearTimeout(timeout);
                timeout = undefined;
                reject(TASK_CANCELED_ERROR());
            }
        };
    });

    return { promise, cancel };
}

/**
 * Executes a task callback in the next animation frame and returns a Promise which will
 * resolve when the task was executed
 *
 * @remarks
 * Uses {@link requestAnimationFrame} to schedule the task callback in the next animation frame.
 * If the task is canceled before the next animation frame, the animation frame is canceled and
 * the Promsie is rejected.
 *
 * @param task  The callback function to execute
 * @returns     A Promise which will resolve after the callback was executed
 */
export function animationFrameTask<T = any> (task: () => T): Task<T> {

    let cancel!: () => void;

    const promise = new Promise<T>((resolve, reject) => {

        let animationFrame: number | undefined = requestAnimationFrame(() => runTask(task, resolve, reject));

        cancel = () => {

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = undefined;
                reject(TASK_CANCELED_ERROR());
            }
        };
    });

    return { promise, cancel };
}

/**
 * Runs a task callback safely against a Promise's reject and resolve callbacks.
 *
 * @internal
 * @private
 */
function runTask<T = any> (task: () => T, resolve: (value: T) => void, reject: (reason: any) => void) {

    try {

        resolve(task());

    } catch (error) {

        reject(error);
    }
}
