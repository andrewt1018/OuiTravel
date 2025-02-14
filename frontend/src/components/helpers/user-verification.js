import axios from "axios"

export async function getUser() {
    const token = localStorage.getItem('token');
    try {
        const res = await axios.get('http://localhost:3001/api/user/get-user', {
            headers: { 'x-access-token': `${token}` } });   
        return res.data.user;
    } catch (error) {
        console.log("User verification failed");
        return null;
    }
}