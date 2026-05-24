# argus-agent-tester: Tasks

## Design Decisions (from brainstorm)

- **Part of the Argus suite**: This tool is one of several AI dev tools under the Argus brand. Naming follows the `argus-*` pattern.
- **Reusable across any web app**: All app-specific configuration lives in `app-config.json` per target app. The tool itself has no knowledge of any specific application.
- **Spec-driven (not goal-directed)**: Claude generates `.spec.ts` Playwright files from plain-English feature descriptions. Generated specs are committed to disk and rerunnable without Claude. Claude is only invoked again to regenerate specs, not to drive the browser at runtime.
- **Two agents with distinct responsibilities**:
  - **Install agent**: Given an app directory and config, runs install commands, starts the server, and polls the health check URL until the app is ready.
  - **Spec generator**: Calls Claude with each feature description and writes a self-contained Playwright `.spec.ts` file per feature.
  - **Spec runner**: Executes generated specs via Playwright and reports results.
- **Three CLI commands**: `generate` (specs only), `run` (execute specs, optionally start app), `test` (generate + run full pipeline).

---

## Tasks

### Phase 1: Foundation (scaffolded)
- [x] Initialize repo with TypeScript, Playwright, Anthropic SDK, Commander, Zod
- [x] `src/config/types.ts` — Zod schema for `app-config.json`
- [x] `src/config/loader.ts` — load and validate config file
- [x] `src/utils/logger.ts` — colored terminal logger
- [x] `src/utils/health-check.ts` — poll URL until healthy or timeout
- [x] `src/agents/install-agent.ts` — run install commands, start app process, wait for health check
- [x] `src/agents/spec-generator.ts` — call Claude, write `.spec.ts` files per feature
- [x] `src/agents/spec-runner.ts` — run generated specs via Playwright
- [x] `src/index.ts` — CLI entry point with `generate`, `run`, `test` commands
- [x] `app-config.example.json` — reference config for any target app

### Phase 2: Quality and correctness
- [ ] Add `npm install` and verify TypeScript compiles cleanly (`npm run build`)
- [ ] Add Playwright config file (`playwright.config.ts`) with sensible defaults (baseURL from config, screenshot on failure, HTML reporter)
- [ ] Wire `baseUrl` from config into the Playwright config so generated specs can use `page.goto('/')` instead of hardcoded URLs
- [ ] Add prompt caching to the Claude API call in `spec-generator.ts` (cache the system prompt to reduce cost on multi-feature configs)
- [ ] Add `--dry-run` flag to `generate` command that prints prompts without calling Claude
- [ ] Validate that the `specsDir` output path is inside the config directory, not an arbitrary system path

### Phase 3: Developer experience
- [ ] Add `eslint.config.js` and `.prettierrc` matching the Argus coding standards
- [ ] Add a `README.md` with quickstart, config reference, and CLI usage
- [ ] Add a working example config targeting a publicly available demo app (e.g. the Playwright demo todo app)
- [ ] Add `--watch` mode to `run` command that re-runs specs on file change

### Phase 4: Robustness
- [ ] Handle app startup failure gracefully in install agent (non-zero exit from start command before health check passes)
- [ ] Add timeout configuration to `app-config.json` for health check (`healthCheckTimeoutMs`)
- [ ] Stream Claude response tokens to terminal during spec generation so progress is visible on large features
- [ ] Add a `regenerate` command that re-runs generation for a single named feature without touching other specs
