<h1 align="center">
  <sup>@se-oss/env</sup>
  <br>
  <a href="https://github.com/shahradelahi/ts-env/actions/workflows/ci.yml"><img src="https://github.com/shahradelahi/ts-env/actions/workflows/ci.yml/badge.svg?branch=main&event=push" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@se-oss/env"><img src="https://img.shields.io/npm/v/@se-oss/env.svg" alt="NPM Version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="MIT License"></a>
  <a href="https://bundlephobia.com/package/@se-oss/env"><img src="https://img.shields.io/bundlephobia/minzip/@se-oss/env" alt="npm bundle size"></a>
  <a href="https://packagephobia.com/result?p=@se-oss/env"><img src="https://packagephobia.com/badge?p=@se-oss/env" alt="Install Size"></a>
</h1>

_@se-oss/env_ is a universal, type-safe environment variable loader for Node.js, Edge, and Browser environments, powered by [Standard Schema](https://standardschema.dev).

## Benefits

- **Universal Support:** Run across all environments, such as Node.js, Vercel Edge, Cloudflare Workers, or the Browser, using a single API.
- **Schema Validation:** Catch configuration errors at startup using Zod, Valibot, ArkType, or any Standard Schema validator.
- **Strict Type Safety:** Enjoy full TypeScript autocompletion and inferred types for your environment variables.
- **Immutable Config:** Returns a frozen object to prevent accidental runtime modifications.
- **Smart Defaults:** Automatically treats empty strings as `undefined` to ensure your defaults are correctly applied.
- **Flexible Composition:** Merge and extend multiple environment configurations effortlessly.

---

- [Benefits](#benefits)
- [Installation](#-installation)
- [Usage](#-usage)
- [Universal Compatibility](#-universal-compatibility)
- [Relevant](#-relevant)
- [Contributing](#-contributing)
- [License](#license)

## 📦 Installation

```bash
npm install @se-oss/env
```

<details>
<summary>Install using your favorite package manager</summary>

**pnpm**

```bash
pnpm install @se-oss/env
```

**yarn**

```bash
yarn add @se-oss/env
```

</details>

## 📖 Usage

### Node.js + Zod

Load environment variables with automatic `.env` support and validation.

```typescript
import { createEnv } from '@se-oss/env';
import { z } from 'zod';

export const env = createEnv({
  schema: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  dotenv: true,
  emptyStringAsUndefined: true,
});
```

### Vite / Browser

Use in frontend projects by passing the specific runtime environment object.

```typescript
import { createEnv } from '@se-oss/env';
import { z } from 'zod';

export const env = createEnv({
  schema: {
    VITE_API_URL: z.string().url(),
    VITE_APP_TITLE: z.string().default('My App'),
  },
  runtimeEnv: import.meta.env,
});
```

### Composition

Merge multiple environment configurations to maintain modularity.

```typescript
const baseEnv = createEnv({
  schema: { SHARED_KEY: z.string() },
  runtimeEnv: process.env,
});

const appEnv = createEnv({
  schema: { APP_KEY: z.string() },
  runtimeEnv: process.env,
  extends: [baseEnv],
});
```

## 🌍 Universal Compatibility

Unlike traditional env loaders, `@se-oss/env` does not implicitly rely on `process.env`. By requiring a `runtimeEnv` object, it can run anywhere:

- **Node.js**: Pass `process.env`.
- **Vite**: Pass `import.meta.env`.
- **Cloudflare Workers**: Pass the `env` object from the handler.
- **Next.js**: Pass `process.env`.

## 🔗 Relevant

- [**process-venv**](https://github.com/shahradelahi/process-venv): If you need strict environment isolation and security for Node.js. It prevents unintended access by third-party dependencies by isolating your secrets from the global `process.env`.

## 🤝 Contributing

Want to contribute? Awesome! To show your support is to star the project, or to raise issues on [GitHub](https://github.com/shahradelahi/ts-env).

Thanks again for your support, it is much appreciated! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/ts-env/graphs/contributors).
