import { config } from 'dotenv';

import { InvalidEnvironmentError } from './errors';
import { parseWithDictionary } from './standard';
import type { CreateEnvOptions, EnvResult, TExtendsFormat, TSchemaFormat } from './typings';

/**
 * Creates a new universal environment configuration instance.
 *
 * @template TSchema The type of the schema dictionary used for validation.
 * @template TExtends The type of the array of extended `SanitizedEnv` instances.
 *
 * @param {CreateEnvOptions<TSchema, TExtends>} options Configuration for loading and validating environment variables.
 * @returns {EnvResult<TSchema, TExtends>} A readonly object containing the validated and sanitized environment variables.
 * @throws {InvalidEnvironmentError} If validation of environment variables fails.
 */
export function createEnv<
  TSchema extends TSchemaFormat = NonNullable<unknown>,
  const TExtends extends TExtendsFormat = [],
>(options: CreateEnvOptions<TSchema, TExtends>): EnvResult<TSchema, TExtends> {
  if (options.skipValidation) {
    return options.runtimeEnv as any;
  }

  let envSource = { ...options.runtimeEnv };

  const isNode = typeof process !== 'undefined' && process.versions?.node;

  if (options.dotenv && isNode) {
    const dotenvOptions = typeof options.dotenv === 'object' ? options.dotenv : {};
    const dot = config({
      ...dotenvOptions,
      processEnv: {}, // Don't pollute global process.env
    });

    if (dot.parsed) {
      envSource = { ...dot.parsed, ...envSource };
    }
  }

  if (options.emptyStringAsUndefined !== false) {
    for (const key in envSource) {
      if (envSource[key] === '') {
        delete envSource[key];
      }
    }
  }

  const schema = {
    ...(options.shared ?? {}),
    ...(options.schema ?? {}),
  } as TSchema;

  const result = parseWithDictionary(schema, envSource);

  if (result.issues) {
    if (options.onValidationError) {
      return options.onValidationError(result.issues);
    }
    throw new InvalidEnvironmentError('Invalid environment variables detected.', {
      cause: result.issues,
    });
  }

  const env = Object.assign(
    (options.extends ?? []).reduce((acc, curr) => Object.assign(acc, curr), {}),
    result.value
  );

  return Object.freeze(env) as EnvResult<TSchema, TExtends>;
}

export { InvalidEnvironmentError };
export type { CreateEnvOptions, EnvResult };
