import axiosClient from './axiosClient'

export const departmentApi = {
  // Lấy danh sách bộ phận
  getDepartments() {
    const url = '/Departments'
    return axiosClient.get(url)
  },
}

export default departmentApi
