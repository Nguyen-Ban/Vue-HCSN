import axiosClient from './axiosClient'

const fixedAssetApi = {
  // Gọi đến [HttpGet] GetAllFixedAssets
  getAll() {
    const url = '/FixedAssets'
    return axiosClient.get(url)
  },

  // Gọi đến [HttpPost] CreateFixedAsset
  create(data) {
    const url = '/FixedAssets'
    return axiosClient.post(url, data)
  },

  // Gọi đến [HttpPut] UpdateFixedAsset
  update(id, data) {
    const url = `/FixedAssets/${id}`
    return axiosClient.put(url, data)
  },

  // Lấy chi tiết tài sản theo ID
  getById(id) {
    const url = `/FixedAssets/${id}`
    return axiosClient.get(url)
  },

  // Lấy danh sách loại tài sản
  getCategories() {
    const url = '/FixedAssetCategories'
    return axiosClient.get(url)
  },

  // Lấy danh sách bộ phận
  getDepartments() {
    const url = '/Departments'
    return axiosClient.get(url)
  },
}

export default fixedAssetApi
