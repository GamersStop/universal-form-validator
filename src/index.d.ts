/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: TypeScript type declaration definitions file. Exports public type signatures,
 *              class contracts, and module interfaces for strict type safety across consumers.
 */

export declare class UniversalValidator {
    /**
     * Initializes the validator instance with a validation schema.
     */
    constructor(schema: Record<string, Array<string | Function>>);

    /**
     * Validates a complete data object payload against the defined schema rules.
     */
    validate(data: Record<string, any>): {
        isValid: boolean;
        errors: Record<string, string>;
    };
}

export declare const rules: {
    /**
     * Safely registers custom runtime validation rules.
     */
    register(ruleName: string, validatorFn: (value: any, allData?: Record<string, any>, element?: HTMLElement) => string | null): void;
    [key: string]: any;
};

/**
 * Scans the DOM and auto-binds real-time event listeners to forms marked with `data-validator`.
 */
export declare function initAutoBind(): void;