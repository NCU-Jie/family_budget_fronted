import axios from 'axios';

const request= axios.create({
    baseURL: '/api/budget',
})
export default request;