import { Behavior } from './behavior';
import { applyDefaults } from './utils/config';

export const UNDEFINED_TYPE = (type: string, map: string = 'behavior') => new Error(
    `Undefined type key: No ${ map } found for key '${ type }'.
Add a 'default' key to your ${ map } map to provide a fallback ${ map } for undefined types.`);

/**
 * A behavior constructor
 *
 * @description
 * This type enforces {@link Behavior} constructors which receive a configuration object as first parameter.
 */
export type BehaviorConstructor<B extends Behavior, C = any> = new (configuration: C, ...args: any[]) => B;

export type BehaviorMap<B extends Behavior, K extends string = string> = {
    [key in (K | 'default')]: BehaviorConstructor<B>;
}

export type ConfigurationMap<C, K extends string = string> = {
    [key in (K | 'default')]: C;
}

export abstract class BehaviorFactory<B extends Behavior, C, K extends string = string> {

    constructor (
        protected behaviors: BehaviorMap<B, K>,
        protected configurations: ConfigurationMap<C, K>,
    ) { }

    /**
     * Create a behavior of the specified type and configuration
     *
     * @description
     * Checks if the specified type key exists in behavior and configuration map,
     * merges the default configuration for the specified type into the provided
     * configuration and creates an instance of the correct behavior with the merged
     * configuration.
     */
    create (type: K, config: Partial<C>, ...args: any[]): B {

        this.checkType(type);

        const behavior = this.getBehavior(type);
        const configuration = applyDefaults(config, this.getConfiguration(type));

        return this.getInstance(type, behavior, configuration, ...args);
    }

    /**
     * Create a behavior instance
     *
     * @description
     * This method can be overridden by any BehaviorFactory to adjust the creation of Behavior instances.
     */
    protected getInstance (type: K, behavior: BehaviorConstructor<B, C>, configuration: C, ...args: any[]): B {

        return new behavior(configuration, ...args);
    }

    /**
     * Check if the specified type exists in behavior and configuration map
     *
     * @throws
     * {@link UNDEFINED_TYPE} error if neither the specified type nor a 'default' key
     * exists in the behavior or configuration map.
     */
    protected checkType (type: K) {

        if (!(type in this.behaviors || 'default' in this.behaviors)) throw UNDEFINED_TYPE(type, 'behavior');

        if (!(type in this.configurations || 'default' in this.configurations)) throw UNDEFINED_TYPE(type, 'configuration');
    }

    /**
     * Get the behavior class for the specified type key
     */
    protected getBehavior (type: K): BehaviorConstructor<B> {

        return this.behaviors[type] || this.behaviors['default' as K];
    }

    /**
     * Get the configuration for the specified type key
     */
    protected getConfiguration (type: K): C {

        return this.configurations[type] || this.configurations['default' as K];
    }
}
