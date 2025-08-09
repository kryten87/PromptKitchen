# PRD — Enhanced Test Matching for Variable LLM Outputs

Owner: PromptKitchen
Status: Draft
Date: 2025-08-08
Related: `project/PRD.md` (baseline test PRD)

## Summary
Enable flexible, matcher-based evaluation of LLM outputs. Users can define one or more assertions per test case, targeting deep JSON paths and applying familiar Jest-style matchers. This supports variable, structured outputs (strings or JSON) and allows negation via a `not` modifier. Design emphasizes extensibility to add matchers without breaking changes.

## Goals
- Allow referencing values deep in JSON (objects, arrays) using a robust path syntax.
- Provide these matchers (MVP):
  - Jest: `toEqual`, `toBeNull`, `toContain`, `toMatch`
  - jest-extended: `toBeOneOf`
  - With `not` modifier.
- Support multiple assertions per test case; test case passes if all assertions pass.
- Be easily extensible with new matchers in the future.
- Backward-compatible with existing "expected_output" exact-match/deep-equal behavior.

## Non-Goals (MVP)
- Complex logical grouping (e.g., nested anyOf/allOf groups). We default to all assertions must pass.
- Schema-validation matchers (e.g., AJV schemas), fuzzy matching, or semantic similarity.
- Tolerance-based numeric comparisons (e.g., `toBeGreaterThan`). These can be added later.

## Key Concepts
- Assertion: a single check against a value addressed by a JSON path in the actual output.
- Matcher: a function that evaluates the addressed value against expected input.
- Test Case: contains zero or more assertions; passes when all assertions pass.
- Path Match Mode ("pathMatch"): when a JSONPath resolves multiple values (e.g., wildcards), choose how to aggregate results:
  - ANY: pass if any resolved value satisfies the matcher (default).
  - ALL: pass only if all resolved values satisfy the matcher.
  This is configured per assertion.

## Path Syntax
- Use JSONPath (via `jsonpath-plus`) with `$` as root. Examples:
  - `$.user.name`
  - `$.items[0].price`
  - `$.items[*].id`
- Sugar: allow simple dot/bracket paths without `$` (we normalize internally to JSONPath).
- Resolution with multiple results: User-selectable per assertion — ANY or ALL. Default: ANY.

## Matchers (MVP)
- `toEqual(expected: any)`
  - Deep equality (object key order ignored, array order respected).
- `toBeNull()`
  - Strict check for `value === null`.
- `toContain(expected: any)`
  - If value is an array: pass if any element deep-equals expected.
  - If value is a string: pass if substring (case-sensitive) contains expected (string only; regex not supported — use `toMatch`).
- `toMatch(pattern: string | { source: string; flags?: string })`
  - For strings only. Compile `RegExp` from pattern; pass if it matches. Regex flags are allowed (e.g., `i`, `m`, `s`, `u`).
- `toBeOneOf(options: any[])`
  - Pass if value deep-equals any element in options. Works for primitives and structured values.
- `not` modifier
  - Invert the final result of the matcher.

Error messaging: include path, matcher, expected, actual, and flags. Example: `$.user.name toMatch /[A-Z][a-z]+/ expected match, got "bob"`.

## Data Model Changes (Backward Compatible)
- Table: `test_cases`
  - New column: `assertions` TEXT (JSON-encoded array), nullable.
  - Keep existing `expected_output` and `output_type` for legacy/simple tests.
- Table: `test_results`
  - New column: `details` TEXT (JSON-encoded array of per-assertion results), nullable.
- DTO (`packages/shared`):
  - Add interfaces:

    ```ts
    export type JsonPath = string; // JSONPath string

    export type MatcherName = 'toEqual' | 'toBeNull' | 'toContain' | 'toMatch' | 'toBeOneOf';

    export type PathMatchMode = 'ANY' | 'ALL';

    export interface Assertion {
      id: string;                 // uuid
      path: JsonPath;             // e.g. $.items[0].id
      pathMatch?: PathMatchMode;  // default 'ANY'
      matcher: MatcherName;
      expected?: unknown;         // omitted for no-arg matchers like toBeNull
      not?: boolean;              // default false
      description?: string;       // optional human label
    }

    export interface TestCase { /* ...existing fields... */ assertions?: Assertion[] }
    ```

- Migrations (SQLite via Knex):
  - `010_add_assertions_to_test_cases`
    - `ALTER TABLE test_cases ADD COLUMN assertions TEXT`.
  - `011_add_details_to_test_results`
    - `ALTER TABLE test_results ADD COLUMN details TEXT`.
  - No destructive changes; evaluator will prefer `assertions` if present, else fall back to legacy logic.

## Evaluation Semantics
- If `testCase.assertions?.length > 0`:
  - For each assertion:
    - Resolve `values = jsonpathPlus(path)`.
    - If 0 results, treat as `[undefined]` (so null/undefined can be tested explicitly).
    - For each resolved value, run the matcher to get boolean(s).
    - Aggregate by `pathMatch`:
      - ANY: assertion passes if any value passes (short-circuit on first pass).
      - ALL: assertion passes only if all values pass (short-circuit on first fail).
    - Apply `not` after aggregation.
  - Test case passes if all assertions pass.
- Else (legacy):
  - Strings => exact equality.
  - JSON => deep equality.

Return rich `AssertionResult` entries for display:

```ts
export interface AssertionResult {
  assertionId: string;
  path: string;
  matcher: MatcherName;
  not: boolean;
  pathMatch: PathMatchMode;
  passed: boolean;
  actualSamples: unknown[];  // values resolved at path (sampled if large)
  message?: string;          // friendly explanation on failure
}
```

## Extensibility Design
- Central matcher registry in `packages/shared`:

```ts
export interface MatcherContext {
  deepEqual(a: unknown, b: unknown): boolean;
}

export interface Matcher {
  name: MatcherName | string; // allow future names
  arity: 'none' | 'one';      // number of expected args (MVP: 0 or 1)
  evaluate(value: unknown, expected: unknown, ctx: MatcherContext): boolean;
  describe(value: unknown, expected: unknown, not: boolean): string; // builds message
}

export const registry: Record<string, Matcher> = { /* toEqual, ... */ };
```

- New matchers are added by registering a `Matcher`. UI reads registry metadata to populate selector and expected-input editor.

## API/Service Changes
- Shared evaluator (`packages/shared/src/evaluation`):
  - `evaluateAssertions(actual: unknown, assertions: Assertion[]): { passed: boolean; results: AssertionResult[] }`
  - Expose utility: `resolveJsonPath(actual, path): unknown[]`
  - Export `registry` and matcher types.
- Backend (`packages/backend`):
  - Add `EvaluationService` that wraps shared evaluator for server-side runs.
  - Update run pipeline to generate `AssertionResult`s and overall pass/fail.
  - Persist per-test-case results as today, plus store serialized `AssertionResult[]` in `test_results.details` for richer UI.
- Frontend (`packages/frontend`):
  - Import shared evaluator for local preview in editor.

## UI/UX
- Location: enhance `TestCaseEditor` within the Test Suite UI.
- Sections:
  1) Expected Output (legacy/simple) — unchanged.
  2) Assertions (Advanced) — new, optional.
- Assertions Editor (per row):
  - Path input with JSONPath hint and quick-pick of last run’s keys.
  - Path multi-match mode: toggle between ANY / ALL (default ANY).
  - Matcher select: `toEqual`, `toBeNull`, `toContain`, `toMatch`, `toBeOneOf`.
  - Expected value editor:
    - Auto-adapts: hidden for `toBeNull`; string input for `toMatch` (with optional flags); string/JSON toggle for others; for `toBeOneOf`, list editor.
  - Not toggle.
  - Description (optional).
  - Remove row.
- Toolbar actions:
  - Add assertion.
  - Import from last actual output: scaffold rows from detected paths/values.
  - Preview run (client-side) against sample actual output.
- Results UI
  - In test run results, show per-assertion chips: Pass/Fail, path, matcher, path mode (ANY/ALL), and message.
  - Offer expand to show actual samples when path returns multiple values.

## Validation
- Path must be non-empty, valid JSONPath (basic parse check).
- `pathMatch` must be either `ANY` or `ALL`; default to `ANY`.
- `toMatch` pattern must compile; allowed flags limited to `i`, `m`, `s`, `u`. Pattern length capped (see Safety).
- `toBeOneOf` requires non-empty array.
- `toContain` on strings only accepts substring (no regex) and on arrays requires deep-equality.
- Size limits: cap stored assertion JSON to 64KB per test case (configurable).

## Performance
- JSONPath is O(n) per path on JSON size; typical payloads are small (<100KB). For large payloads, cap samples and short-circuit on first pass/fail per mode.
- Evaluator is pure and portable; reused on both client and server.

## Security & Safety
- Regular expressions:
  - Backend: use RE2-based engine via `node-re2` to prevent catastrophic backtracking. If RE2 is unavailable, reject patterns flagged unsafe by `safe-regex2` and enforce limits below (no fallback to native for unsafe patterns).
  - Limits: max regex source length 1024 chars; max tested string length 100,000 chars (truncate with indicator in UI); evaluation time budget ~50ms per assertion (best-effort); allowed flags whitelist (`i`, `m`, `s`, `u`).
- Do not execute arbitrary code. Only compile RegExp from provided strings with safe limits.
- Escape messages and UI outputs. Protect against ReDoS by limiting regex and input sizes as above.

## Configuration
- Backend env vars (with defaults):
  - `PK_MAX_ASSERTION_JSON_BYTES` (default: 65536) — max size of `test_cases.assertions` JSON payload.
  - `PK_MAX_TEST_RESULT_DETAILS_BYTES` (default: 524288) — max size of `test_results.details` payload per row. Truncate `actualSamples` with `...truncated` marker and include a SHA-256 hash of the full value when exceeded.
  - `PK_REGEX_MAX_SOURCE_LEN` (default: 1024)
  - `PK_REGEX_MAX_TEST_STR_LEN` (default: 100000)
  - `PK_REGEX_ALLOWED_FLAGS` (default: `imsu`)

## Telemetry (Optional)
- Count matcher usage to guide future matcher additions.

## Migration & Backward Compatibility
- Existing tests continue to work. If `assertions` present and non-empty, use assertion engine; otherwise use legacy expected_output logic.
- Optional one-click migration: generate a single `toEqual` assertion at path `$` from existing expected_output.

## Acceptance Criteria
- Users can add, edit, and remove assertions for a test case.
- Supported matchers behave as specified with and without `not`.
- Per-assertion ANY/ALL mode is supported and respected by the evaluator.
- Paths resolve into arrays or single values; aggregation semantics produce expected results.
- Test results display per-assertion outcomes with helpful messages, including path mode.
- Detailed per-assertion results are persisted in `test_results.details` and returned by the API. Large payloads are truncated according to configuration, with hashes recorded.
- Adding a new matcher requires only registering it in the shared registry and minor UI metadata.
- No regressions in legacy tests.

## Milestones
1) Shared: matcher registry + evaluator + unit tests.
2) Backend: integrate evaluator in run pipeline; add migrations for `assertions` and `test_results.details`.
3) Frontend: Assertions Editor UI + local preview; results rendering.
4) Docs: examples and tips for JSONPath; migration guide.

## Examples
- Any-of values (user example):
  - Path: `$` matcher: `toBeOneOf` expected: `["A", "B", "C"]`.
- Deep property regex with flags:
  - Path: `$.user.name` matcher: `toMatch` expected: `{ source: "^[A-Z][a-z]+$", flags: "u" }`.
- Array contains object:
  - Path: `$.items` matcher: `toContain` expected: `{ id: 123, qty: 1 }`.
- Not null nested:
  - Path: `$.profile.avatarUrl` matcher: `toBeNull` with `not: true`.
- ALL mode across wildcard:
  - Path: `$.items[*].status` pathMatch: `ALL` matcher: `toBeOneOf` expected: `["READY", "PENDING"]`.

## Future Enhancements (Post-MVP)
- Additional matchers: `toBeUndefined`, `toBeTruthy`, `toBeGreaterThan`, schema validators, etc.
- Redaction controls for sensitive values in persisted details.
- JSON import/export of assertions for sharing across projects.
- Optional normalization options (e.g., trim/whitespace-insensitive comparisons) if demanded later.

## Open Questions / Clarifications
1) Global default for `pathMatch`: keep per-assertion only, or allow suite/project-level default?
2) If `node-re2` is not available at runtime (unexpected), should regex assertions fail closed, or fall back to native RegExp with strict `safe-regex2` checks?
3) Is the default `PK_MAX_TEST_RESULT_DETAILS_BYTES=524288` (512KB) acceptable, or do you prefer a different default (e.g., 256KB or 1MB)?
4) Should the UI surface a visible “truncated” warning on assertion results when details exceed the cap?

