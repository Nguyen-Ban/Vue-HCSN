import axiosClient from './axiosClient'

export const fixedAssetCategoryApi = {
  // Lấy danh sách loại tài sản
  getCategories() {
    const url = '/FixedAssetCategories'
    return axiosClient.get(url)
  },
}

export default fixedAssetCategoryApi
