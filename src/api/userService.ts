import { api } from './client';
import { handleApiCall } from './utils';
import { User } from '@/lib/model/user';

export const userService = {
  getAllUsers: () => handleApiCall(api.get('api/users').json<User[]>()),
};