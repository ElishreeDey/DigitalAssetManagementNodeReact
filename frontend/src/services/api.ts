/*
 ****************************************************************************************************************************
 * Filename    : api
 * Description : Shared Axios instance — sets the base URL from env and enables withCredentials so the browser
 *               automatically sends/receives the httpOnly JWT cookie on every request.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  withCredentials: true, // required for httpOnly cookie to be sent with cross-origin requests
})

export default api
