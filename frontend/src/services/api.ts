/*
 ****************************************************************************************************************************
 * Filename    : api
 * Description : Shared Axios instance configuration.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  withCredentials: true, // Required for cookie-based authentication
})

export default api
