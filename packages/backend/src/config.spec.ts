import { loadPKConfig, PKConfig } from './config';

describe('loadPKConfig', () => {
  it('should use default values when env is not set', () => {
    const config: PKConfig = loadPKConfig();
    expect(config.PK_MAX_ASSERTION_JSON_BYTES).toBe(65536);
    expect(config.PK_MAX_TEST_RESULT_DETAILS_BYTES).toBe(524288);
    expect(config.PK_REGEX_MAX_SOURCE_LEN).toBe(1024);
    expect(config.PK_REGEX_MAX_TEST_STR_LEN).toBe(100000);
    expect(config.PK_REGEX_ALLOWED_FLAGS).toBe('imsu');
    expect(config.KEEP_ALIVE_ENABLED).toBe(false);
  });

  it('should return an object with all keys', () => {
    const config: PKConfig = loadPKConfig();
    expect(config).toEqual({
      PK_MAX_ASSERTION_JSON_BYTES: 65536,
      PK_MAX_TEST_RESULT_DETAILS_BYTES: 524288,
      PK_REGEX_MAX_SOURCE_LEN: 1024,
      PK_REGEX_MAX_TEST_STR_LEN: 100000,
      PK_REGEX_ALLOWED_FLAGS: 'imsu',
      KEEP_ALIVE_ENABLED: false,
    });
  });

  it('should load KEEP_ALIVE_ENABLED as true when set to "true"', () => {
    const originalEnv = process.env.KEEP_ALIVE_ENABLED;
    process.env.KEEP_ALIVE_ENABLED = 'true';
    
    const config = loadPKConfig();
    expect(config.KEEP_ALIVE_ENABLED).toBe(true);
    
    if (originalEnv !== undefined) {
      process.env.KEEP_ALIVE_ENABLED = originalEnv;
    } else {
      delete process.env.KEEP_ALIVE_ENABLED;
    }
  });

  it('should load KEEP_ALIVE_ENABLED as false when set to "false"', () => {
    const originalEnv = process.env.KEEP_ALIVE_ENABLED;
    process.env.KEEP_ALIVE_ENABLED = 'false';
    
    const config = loadPKConfig();
    expect(config.KEEP_ALIVE_ENABLED).toBe(false);
    
    if (originalEnv !== undefined) {
      process.env.KEEP_ALIVE_ENABLED = originalEnv;
    } else {
      delete process.env.KEEP_ALIVE_ENABLED;
    }
  });
});
