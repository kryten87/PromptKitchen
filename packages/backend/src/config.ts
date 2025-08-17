// Static config loader for enhanced test matching
// All imports must be top-level


export interface PKConfig {
  PK_MAX_ASSERTION_JSON_BYTES: number;
  PK_MAX_TEST_RESULT_DETAILS_BYTES: number;
  PK_REGEX_MAX_SOURCE_LEN: number;
  PK_REGEX_MAX_TEST_STR_LEN: number;
  PK_REGEX_ALLOWED_FLAGS: string;
}

export function loadPKConfig(): PKConfig {
  return {
    PK_MAX_ASSERTION_JSON_BYTES: process.env.PK_MAX_ASSERTION_JSON_BYTES ? parseInt(process.env.PK_MAX_ASSERTION_JSON_BYTES, 10) : 65536,
    PK_MAX_TEST_RESULT_DETAILS_BYTES: process.env.PK_MAX_TEST_RESULT_DETAILS_BYTES ? parseInt(process.env.PK_MAX_TEST_RESULT_DETAILS_BYTES, 10) : 524288,
    PK_REGEX_MAX_SOURCE_LEN: process.env.PK_REGEX_MAX_SOURCE_LEN ? parseInt(process.env.PK_REGEX_MAX_SOURCE_LEN, 10) : 1024,
    PK_REGEX_MAX_TEST_STR_LEN: process.env.PK_REGEX_MAX_TEST_STR_LEN ? parseInt(process.env.PK_REGEX_MAX_TEST_STR_LEN, 10) : 100000,
    PK_REGEX_ALLOWED_FLAGS: process.env.PK_REGEX_ALLOWED_FLAGS || 'imsu',
  };
}
