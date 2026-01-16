import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://localhost:7181/api', // Thay bằng cổng (port) Backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Xử lý dữ liệu trả về để chỉ lấy data, bỏ qua các thông tin HTTP khác
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);

export default axiosClient;
