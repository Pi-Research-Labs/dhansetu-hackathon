import Constants from 'expo-constants';
import axios from 'axios';

const apiUrl = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: apiUrl,
});
