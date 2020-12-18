import request from '@/utils/request'
const api_name = '/admin/product/baseTrademark'

export default {
  //获取分页的品牌
  reqGetTrademark(page,limit){
    return request({
      url:`${api_name}/${page}/${limit}`,
      method:'GET'
    })
  },
  //添加品牌
  addTrademark(data) {
    return request({
      url: `${api_name}/save`,
      method: "POST",
      data
    });
  },
  //修改品牌
  updateTrademark(data){
    return request({
      url:`${api_name}/update`,
      method:'PUT',
      data
    })
  },
  //删除品牌
  deleteTradeark(id){
    return request({
      url:`${api_name}/remove/${id}`,
      method:'DELETE'
    })
  }
}
