export declare class UniversalValidator {
    constructor(schema: Record<string, Array<string | Function>>);
    validate(data: Record<string, any>): {
        isValid: boolean;
        errors: Record<string, string>;
    };
}

export declare const rules: {
    register(ruleName: string, validatorFn: (value: any, allData?: Record<string, any>, element?: HTMLElement) => string | null): void;
    [key: string]: any;
};

export declare function initAutoBind(): void;