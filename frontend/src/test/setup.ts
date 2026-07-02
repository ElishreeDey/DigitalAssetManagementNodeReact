/*
 ****************************************************************************************************************************
 * Filename    : setup
 * Description : Global vitest setup for the frontend — runs before every test file.
 *               Imports jest-dom so custom DOM matchers like toBeInTheDocument() are
 *               available in every test without a per-file import.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import '@testing-library/jest-dom'
