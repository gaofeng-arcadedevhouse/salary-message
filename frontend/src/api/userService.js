import { request } from './axios';
export class UserService {     
    /**
     * @description 
     * @param {string} username 
     * @return {HttpResponse} 
     */
    static async login(params) {   
        return request('/auth/authorize',params, 'post')
    }
    
}