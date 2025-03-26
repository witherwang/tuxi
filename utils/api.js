/**
 * 登录接口
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.email - 用户邮箱
 * @param {string} credentials.password - 用户密码
 * @returns {Promise} 返回Promise对象
 */
export const login = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://114.55.75.224:8888/auth/login',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        email,
        password
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const userData = res.data.data;
          // 分类保存数据到本地存储
          uni.setStorageSync('userNo', userData.userNo);
          uni.setStorageSync('email', userData.email);
          uni.setStorageSync('nickname', userData.nickname);
          uni.setStorageSync('account', userData.account);
          uni.setStorageSync('avatar', userData.avatar);
          uni.setStorageSync('rank', userData.rank);
          uni.setStorageSync('level', userData.level);
          uni.setStorageSync('token', userData.token);
          uni.setStorageSync('isBan', userData.isBan);
          uni.setStorageSync('stats', userData.stats);
          uni.setStorageSync('phone', userData.phone);
          uni.setStorageSync('age', userData.age);
          resolve(res.data);
        } else {
          reject(new Error(res.data?.message || '登录失败'));
        }
      },
      fail: (err) => {
        const errorMessage = err.errMsg || '网络错误，请稍后重试';
        reject(new Error(errorMessage));
      }
    });
  });
}

/**
 * 注册接口
 * @param {Object} credentials - 注册凭证
 * @param {string} credentials.email - 用户邮箱
 * @param {string} credentials.password - 用户密码
 * @param {string} credentials.confirmPassword - 确认密码
 * @returns {Promise} 返回Promise对象
 */
export const register = ({ email, password, confirmPassword }) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://114.55.75.224:8888/auth/register',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        email,
        password,
        confirmPassword
      },
      success: (res) => {
        if (res.data && res.data.code === 0) {
          resolve(res.data)
        } else {
          reject(new Error(res.data?.message || '注册失败'))
        }
      },
      fail: (err) => {
        const errorMessage = err.errMsg || '网络错误，请稍后重试'
        reject(new Error(errorMessage))
      }
    })
  })
}

/**
 * 获取排行榜数据
 * @returns {Promise} 返回Promise对象，包含排行榜数据
 */
export const fetchRankingData = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://114.55.75.224:8888/outer/ranking-info',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          resolve(res.data.data);
        } else {
          reject(new Error('Failed to fetch ranking data'));
        }
      },
      fail: (err) => {
        reject(new Error('Network error, please try again later'));
      }
    });
  });
}; 