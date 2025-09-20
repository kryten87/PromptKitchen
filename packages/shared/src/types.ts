export type TestCaseRunMode = 'DEFAULT' | 'SKIP' | 'ONLY';

// --- Enhanced Test Matching Types (PRD-TEST-MATCH) ---

/**
 * JsonPath: string representing a JSONPath expression (e.g., $.user.name)
 */
export type JsonPath = string;

/**
 * MatcherName: supported matcher names for assertions
 */
export type MatcherName =
	| 'toEqual'
	| 'toBeNull'
	| 'toContain'
	| 'toMatch'
	| 'toBeOneOf';

/**
 * PathMatchMode: how to aggregate results when JSONPath resolves multiple values
 */
export type PathMatchMode = 'ANY' | 'ALL';

/**
 * Assertion: a single check against a value addressed by a JSON path
 */
export interface Assertion {
	assertionId: string;
	path: JsonPath;
	matcher: MatcherName;
	expected?: unknown;
	not?: boolean;
	pathMatch?: PathMatchMode;
	description?: string; // optional, not surfaced in MVP UI
}

/**
 * AssertionResult: result of evaluating a single assertion
 */
export interface AssertionResult {
	assertionId: string;
	path: JsonPath;
	matcher: MatcherName;
	not: boolean;
	pathMatch: PathMatchMode;
	passed: boolean;
	actualSamples: unknown[];
	message?: string;
}
