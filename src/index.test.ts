import { describe, expect, expectTypeOf, test } from 'vitest';
import { z } from 'zod';

import { InvalidEnvironmentError } from './errors';
import { createEnv } from './index';

describe('createEnv', () => {
  const baseSchema = {
    APP_NAME: z.string().default('TestApp'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('test'),
    PORT: z.coerce.number().default(3000),
  };

  const featureSchema = {
    FEATURE_FLAG: z.coerce.boolean().default(false),
    API_KEY: z.string(),
  };

  test('should load and validate environment variables from runtimeEnv', () => {
    const runtimeEnv = {
      NODE_ENV: 'development',
      PORT: '8080',
      API_KEY: 'test-api-key',
    };

    const env = createEnv({
      schema: { ...baseSchema, ...featureSchema },
      runtimeEnv,
    });

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(8080);
    expect(env.APP_NAME).toBe('TestApp'); // Default value
    expect(env.API_KEY).toBe('test-api-key');

    // Type assertions
    expectTypeOf(env.APP_NAME).toEqualTypeOf<string>();
    expectTypeOf(env.NODE_ENV).toEqualTypeOf<'development' | 'production' | 'test'>();
    expectTypeOf(env.PORT).toEqualTypeOf<number>();
    expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
  });

  test('should return undefined for non-existent variables (no proxy)', () => {
    const runtimeEnv = {
      API_KEY: 'test-api-key',
    };

    const env = createEnv({
      schema: { API_KEY: z.string() },
      runtimeEnv,
    });

    // @ts-expect-error - Testing access to a non-existent property
    expect(env.NON_EXISTENT_VAR).toBeUndefined();
  });

  test('should throw InvalidEnvironmentError for missing required variables', () => {
    const runtimeEnv = {
      NODE_ENV: 'development',
      // API_KEY is missing
    };

    expect(() =>
      createEnv({
        schema: { ...baseSchema, ...featureSchema },
        runtimeEnv,
      })
    ).toThrow(InvalidEnvironmentError);
  });

  test('should throw InvalidEnvironmentError for type mismatch', () => {
    const runtimeEnv = {
      PORT: 'not-a-number',
      API_KEY: 'test-api-key',
    };

    expect(() =>
      createEnv({
        schema: { ...baseSchema, ...featureSchema },
        runtimeEnv,
      })
    ).toThrow(InvalidEnvironmentError);
  });

  test('should treat empty strings as undefined by default', () => {
    const runtimeEnv = {
      API_KEY: 'test-api-key',
      PORT: '', // Empty string
    };

    const env = createEnv({
      schema: {
        API_KEY: z.string(),
        PORT: z.coerce.number().default(3000),
      },
      runtimeEnv,
    });

    expect(env.PORT).toBe(3000); // Default value applied because empty string was treated as undefined
  });

  test('should not treat empty strings as undefined when emptyStringAsUndefined is false', () => {
    const runtimeEnv = {
      API_KEY: '',
    };

    expect(() =>
      createEnv({
        schema: { API_KEY: z.string().min(1) },
        runtimeEnv,
        emptyStringAsUndefined: false,
      })
    ).toThrow(InvalidEnvironmentError);
  });

  test('should skip validation when skipValidation is true', () => {
    const runtimeEnv = {
      PORT: 'not-a-number',
    };

    const env = createEnv({
      schema: { PORT: z.number() },
      runtimeEnv,
      skipValidation: true,
    });

    expect(env.PORT).toBe('not-a-number');
  });

  test('should return a readonly (frozen) object', () => {
    const runtimeEnv = {
      API_KEY: 'test-api-key',
    };

    const env = createEnv({
      schema: { API_KEY: z.string() },
      runtimeEnv,
    });

    expect(() => (env.API_KEY = 'new-key')).toThrow(TypeError);
    // @ts-expect-error - Attempting to add a new property
    expect(() => (env.NEW_PROP = 'value')).toThrow(TypeError);

    expect(env.API_KEY).toBe('test-api-key');
  });

  test('should merge with extended environments', () => {
    const baseEnv = { BASE_VAR: 'base' };

    const env = createEnv({
      schema: { APP_NAME: z.string() },
      runtimeEnv: { APP_NAME: 'MyApp' },
      extends: [baseEnv],
    });

    expect(env.APP_NAME).toBe('MyApp');
    expect(env.BASE_VAR).toBe('base');
  });

  test('should call onValidationError when validation fails', () => {
    const runtimeEnv = {};
    let called = false;

    try {
      createEnv({
        schema: { API_KEY: z.string() },
        runtimeEnv,
        onValidationError: (issues) => {
          called = true;
          expect(issues.length).toBeGreaterThan(0);
          throw new Error('Custom Error');
        },
      });
    } catch (e: any) {
      expect(e.message).toBe('Custom Error');
    }

    expect(called).toBe(true);
  });
});
