/*
 ****************************************************************************************************************************
 * Filename    : setup
 * Description : Global vitest setup — runs before every test file via vitest.config.ts `setupFiles`.
 *               Sets all environment variables that keys.ts validates at import time.
 *               Without these, any test that triggers a keys.ts import will throw and abort.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

// keys.ts reads process.env at module load time, so these must be set before any
// source module is imported by any test file in the suite.
process.env.JWT_SECRET = 'test-jwt-secret-key-for-vitest-32chars!!'
process.env.CLIENT_URL = 'http://localhost:5173'
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.DB_USER = 'postgres'
process.env.DB_PASSWORD = 'testpassword'
process.env.DB_NAME = 'test_db'
