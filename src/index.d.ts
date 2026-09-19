/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: TypeScript 5 declaration definitions file. Exports public type signatures,
 *              class contracts, template literal rule autocompletion, and module interfaces.
 */

/**
 * Standard non-parameterized built-in rule identifiers.
 */
export type StaticRule =
  | 'required'
  | 'email'
  | 'strictNumeric'
  | 'passwordStrict'
  | 'alphaNumeric'
  | 'safeText'
  | 'urlValid'
  | 'date'
  | 'checked'
  | 'phone'
  | 'alphaLetters'
  | 'creditCard'
  | 'dateTime'
  | 'dateTimeAfter'
  | 'minDate'
  | 'maxDate'
  | 'minDateTime'
  | 'maxDateTime'
  | 'numeric'
  | 'regex'
  | 'json'
  | 'uuid'
  | 'ip'
  | 'ipv4'
  | 'ipv6'
  | 'remote';

/**
 * Parameterized built-in rule template literal types providing strict IDE autocomplete.
 */
export type ParameterizedRule =
  | `minLength:${number}`
  | `maxLength:${number}`
  | `min:${number}`
  | `max:${number}`
  | `between:${number},${number}`
  | `sameAs:${string}`
  | `match:${string}`
  | `dateBefore:${string}`
  | `dateAfter:${string}`
  | `fileType:${string}`
  | `fileSize:${number}`
  | `oneOf:${string}`
  | `requiredIf:${string},${string}`
  | `requiredIf:${string}`
  | `requiredWith:${string}`
  | `requiredWithout:${string}`
  | `dependsOn:${string}`
  | `remote:${string}`
  | `regex:${string}`
  | `regex:${string},${string}`
  | `ip:${'v4' | 'v6' | 'all'}`;

/**
 * Union of all built-in rules (static and parameterized).
 */
export type BuiltInRule = StaticRule | ParameterizedRule;

/**
 * Custom rule validator function signature (supporting synchronous and asynchronous execution).
 */
export type CustomRuleFn = (
  value: any,
  allData?: Record<string, any>,
  element?: HTMLElement | null,
  context?: any
) => string | null | undefined | Promise<string | null | undefined>;

/**
 * Autocomplete-preserving validation rule definition.
 * Allows strongly typed built-in rules, custom functions, or custom registered rule strings.
 */
export type ValidationRule = BuiltInRule | CustomRuleFn | (string & {});

/**
 * Validation schema mapping field keys to collections of validation rules.
 */
export type ValidationSchema = Record<string, ValidationRule[]>;

/**
 * Outcome payload returned by validation runs.
 */
export interface ValidationResult {
  /** True if all fields passed validation rules without errors; false otherwise. */
  isValid: boolean;
  /** Key-value collection of validation error messages mapped by field name. */
  errors: Record<string, string>;
}

/**
 * Localization dictionary mapping rule keys to error message templates.
 */
export type LocaleDictionary = Record<string, string>;

/**
 * Configuration options for initializing a UniversalValidator instance.
 */
export interface ValidationOptions {
  /** Specific locale override identifier (e.g., 'es', 'fr', 'de'). */
  locale?: string;
  /** Human-friendly label overrides mapped by field name. */
  labels?: Record<string, string>;
}

/**
 * Configuration options for Zero-JS auto-binding.
 */
export interface AutoBindOptions {
  /** Enables MutationObserver to watch DOM for dynamically injected forms and inputs. */
  observe?: boolean;
}

/**
 * Core UniversalValidator engine class.
 */
export declare class UniversalValidator {
  /**
   * Sets the global default locale across all validator instances.
   */
  static setLocale(localeCode: string): void;

  /**
   * Gets the active global default locale.
   */
  static getLocale(): string;

  /**
   * Registers a custom dictionary or extends an existing locale.
   */
  static registerLocale(localeCode: string, messages: LocaleDictionary): void;

  /**
   * Initializes the validator instance with a validation schema and optional options.
   */
  constructor(schema: ValidationSchema, options?: ValidationOptions);

  /**
   * Sets the instance-specific locale override.
   */
  setLocale(localeCode: string): this;

  /**
   * Gets the active locale for this validator instance.
   */
  getLocale(): string;

  /**
   * Sets a human-friendly label for a specific field.
   */
  setLabel(field: string, label: string): this;

  /**
   * Sets multiple human-friendly field labels at once.
   */
  setLabels(labels: Record<string, string>): this;

  /**
   * Gets the human-friendly label for a field.
   */
  getLabel(field: string): string;

  /**
   * Validates a complete data object payload against the defined schema rules.
   */
  validate(data: Record<string, any>): ValidationResult;

  /**
   * Asynchronously validates a complete data object payload against schema rules, awaiting any Promise.
   */
  validateAsync(data: Record<string, any>): Promise<ValidationResult>;
}

/**
 * Built-in rules dictionary and runtime registry.
 */
export declare const rules: {
  /**
   * Safely registers custom runtime validation rules.
   */
  register(ruleName: string, validatorFn: CustomRuleFn): void;
  [key: string]: any;
};

/**
 * Scans the DOM and auto-binds real-time event listeners to forms marked with `data-validator`.
 * Optionally observes DOM mutations for dynamically injected forms/inputs.
 */
export declare function initAutoBind(options?: AutoBindOptions): MutationObserver | void;

/**
 * Resets all validation UI artifacts (error/success classes, error text spans, and ARIA attributes).
 */
export declare function resetFormState(form?: HTMLFormElement | null): void;

/**
 * Sets the default global locale code.
 */
export declare function setLocale(localeCode: string): void;

/**
 * Gets the current default global locale code.
 */
export declare function getLocale(): string;

/**
 * Registers or extends dictionary messages for a specific locale code.
 */
export declare function registerLocale(localeCode: string, messages: LocaleDictionary): void;

/**
 * Resolves a localized message template with positional and token interpolation.
 */
export declare function getMessage(
  ruleKey: string,
  params?: Array<string | number>,
  localeCode?: string | { locale?: string; field?: string; label?: string },
  tokens?: Record<string, string> | string
): string;

/**
 * Dynamically interpolates template placeholders ({0}, {1}, {field}, etc.).
 */
export declare function interpolate(
  template: string,
  params?: Array<string | number> | Record<string, any>,
  tokens?: Record<string, string>
): string;

/**
 * Derives a human-friendly field name/label from a DOM element or validation context.
 */
export declare function deriveFieldLabel(
  element?: HTMLElement | string | Record<string, any> | null,
  context?: Record<string, any> | string | null
): string;