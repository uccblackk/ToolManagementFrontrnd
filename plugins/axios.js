// import axios from "axios"
// const service = axios.create({
//   baseURL: process.env.VUE_APP_API, // api 的 base_url
//   timeout: 10000 // 请求超时时间
// });

// // request拦截器
// service.interceptors.request.use(
//   (config) => {
//     return config;
//   },
//   (error) => {
//     // Do something with request error
//     
//     console.log(error); // for debug
//     Promise.reject(error);
//   }
// );

// // response 拦截器
// service.interceptors.response.use(
//   (response) => {
//     if (response.status !== 200) {
//       return Promise.reject('error');
//     } else {
//       return response.data;
//     }
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
// export default service;


export default function({ $axios, redirect }) {
  // request interceptor
  $axios.interceptors.request.use(
    config => {
      // do something before request is sent
      //config.headers['-Token'] = getToken()
      return config
    },
    error => {
      // do something with request error
      return Promise.reject(error)
    }
  )
  $axios.onRequest(config => {
    //console.log('Making request to ' + config.url)
  })

  // response interceptor
  // $axios.interceptors.response.use(
  //   /**
  //    * Determine the request status by custom code
  //    * Here is just an example
  //    * You can also judge the status by HTTP Status Code
  //    */
  //   response => {
  //     const res = response.data
  //     console.log(res)
  //     if (res.code === 200) {
  //       return res
  //     } else {
  //       redirect('/404')
  //       // if the custom code is not 200, it is judged as an error.
  //     }
  //     return Promise.reject(new Error(res.msg || 'Error'))
  //   },
  //   error => {
  //     console.log('err' + error) // for debug

  //     return Promise.reject(error)
  //   }
  // )

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)
    if (code === 400) {
      redirect('/404')
    } else if (code === 500) {
      redirect('/500')
    }
  })
}