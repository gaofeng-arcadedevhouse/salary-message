import axios from 'axios';
import { ElMessage } from 'element-plus';
import { showMessage } from "./status";

// 设置接口超时时间
axios.defaults.timeout = 60000;
axios.defaults.withCredentials = true
 
// @ts-ignore
 
axios.defaults.baseURL = "api";   

//http request 拦截器
axios.interceptors.request.use(
  config => {
  // 配置请求头
    config.headers = {
      //'Content-Type':'application/x-www-form-urlencoded',   // 传参方式表单
      'Content-Type':'application/json;charset=UTF-8',        // 传参方式json
      Terminal:'Web',
      Authorization:'Bearer ' + localStorage.getItem('_unbound_token') || ''        
        
    };
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

//http response 拦截器
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const {response} = error;
    if (response) {
    
      showMessage(response.status);          
      return Promise.reject(response.data);
    } else {
      ElMessage.warning('The network connection is abnormal, please try again later!');
    }
  }
);

// 封装 GET POST 请求并导出
export function request(url='',params={},type='POST'){
//设置 url params type 的默认值
return new Promise((resolve,reject)=>{
  let promise
  if( type.toUpperCase()==='GET' ){
    promise = axios({
      url,
      params
    })
  }else if( type.toUpperCase()=== 'POST' ){
    promise = axios({
      method:'POST',
      url,
      data:params
    })
  }
  //处理返回
  promise.then(res=>{
    resolve(res)
  }).catch(err=>{
    reject(err)
  })
})
}
