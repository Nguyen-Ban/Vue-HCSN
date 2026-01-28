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
  (error) => {
    if (error.response && error.response.data) {
      const serverData = error.response.data;

      // 1. Map 'ErrorMessage' (Backend) -> 'message' (Frontend)
      // Backend của bạn trả về: { ErrorMessage: "..." }
      // Frontend (handleSave) đang gọi: error.response.data.message
      if (serverData.ErrorMessage) {
        serverData.message = serverData.ErrorMessage;
      }

      // 2. Map 'MoreInfo' (Backend) -> 'errors' (Frontend - nếu cần dùng sau này)
      // Dùng cho lỗi ValidateException trả về danh sách lỗi chi tiết
      if (serverData.MoreInfo) {
        serverData.errors = serverData.MoreInfo;
      }
    }

    // Trả về lỗi để hàm catch() ở component bắt được
    return Promise.reject(error)
  }
)

export default axiosClient
