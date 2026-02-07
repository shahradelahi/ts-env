import { StandardSchemaDictionary, StandardSchemaV1 } from './standard';

/**
 * Simplify a type
 * @internal
 */
type Simplify<T> = {
  [P in keyof T]: T[P];
} & {};

/**
 * Get the keys of the possibly undefined values
 * @internal
 */
type PossiblyUndefinedKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

/**
 * Make the keys of the type possibly undefined
 * @internal
 */
type UndefinedOptional<T> = Partial<Pick<T, PossiblyUndefinedKeys<T>>> &
  Omit<T, PossiblyUndefinedKeys<T>>;

/**
 * Reduce an array of records to a single object where later keys override earlier ones
 * @internal
 */
type Reduce<TArr extends any[], TAcc = object> = TArr extends []
  ? TAcc
  : TArr extends [infer Head, ...infer Tail]
    ? Head & Omit<Reduce<Tail, TAcc>, keyof Head>
    : never;

/**
 * Defines the expected format for a schema, which is a dictionary of StandardSchemaV1 instances.
 */
export type TSchemaFormat = StandardSchemaDictionary;

/**
 * Defines the expected format for an array of extended environment instances.
 */
export type TExtendsFormat = Array<Record<string, unknown>>;

export interface CreateEnvOptions<
  TSchema extends TSchemaFormat,
  TExtends extends TExtendsFormat = [],
> {
  /**
   * The Standard Schema compliant schema for validating environment variables.
   */
  schema: TSchema;

  /**
   * The explicit runtime environment object.
   * In Node: process.env
   * In Vite: import.meta.env
   */
  runtimeEnv: Record<string, string | boolean | number | undefined>;

  /**
   * An array of objects to extend from. This allows for composing
   * environment configurations from multiple sources or modules.
   */
  extends?: TExtends;

  /**
   * Optional: Shared variables that are available to both client and server,
   * but isn't prefixed and doesn't require to be manually supplied.
   */
  shared?: TSchema;

  /**
   * Treat empty strings ("") as undefined.
   * Useful for .env files where keys are defined but empty.
   * @default true
   */
  emptyStringAsUndefined?: boolean;

  /**
   * Skip validation entirely.
   * @default false
   */
  skipValidation?: boolean;

  /**
   * Called when validation fails. By default, an error is thrown.
   */
  onValidationError?: (issues: readonly StandardSchemaV1.Issue[]) => never;

  /**
   * Optional: Dotenv configuration for Node.js environments.
   * If true, it uses default dotenv loading.
   */
  dotenv?: boolean | { path?: string | string[]; encoding?: string };

  /**
   * How to determine whether the app is running on the server or the client.
   */
  isServer?: boolean;

  /**
   * Prefix for client-side environment variables.
   */
  clientPrefix?: string;
}

/**
 * Represents the fully validated and parsed environment variables.
 */
export type EnvResult<TSchema extends TSchemaFormat, TExtends extends TExtendsFormat> = Simplify<
  Reduce<[UndefinedOptional<StandardSchemaDictionary.InferOutput<TSchema>>, ...TExtends]>
>;
