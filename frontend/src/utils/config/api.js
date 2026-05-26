import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../store/helpers/authTokens.js';
import { API_TAGS } from '../../store/helpers/tags.js';
import { BASE_API_URL } from './keys.js';

const baseAPI = createApi({
  reducerPath: 'baseAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const { appReducer } = getState();
      const token = getAuthToken(appReducer?.token, endpoint);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (endpoint !== 'uploadNgoChurchMemberPhoto') {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: API_TAGS,
  endpoints: () => ({}),
});

export default baseAPI;
