import {User} from './user';

export class UserLogInResponse{
    access_token: string;
    token_type: string;
    displayusername: string;
    expires_in: number;
    userId: number;
  
}