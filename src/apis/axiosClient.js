import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'https://localhost:7181/api', // Thay bằng cổng (port) Backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
})

// Xử lý dữ liệu trả về
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu response.data có structure { totalRecords, data, ... } thì trả về toàn bộ response.data
    // Nếu response.data là array hoặc object đơn giản thì trả về response.data
    return response.data
  },
  (error) => Promise.reject(error),
)

export default axiosClient
