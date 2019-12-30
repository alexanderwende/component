
export function applyDefaults<T> (config: Partial<T>, defaults: T): T {

    for (const key in defaults) {

        if (config[key] === undefined) config[key] = defaults[key];
    }

    return config as T;
}
