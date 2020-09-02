

const { getUserInfo, login } = require('./utils/api');
const { promisify } = require('./utils/util');

App({
  onShow() {
      this.getUserInfo().catch(err => {/* ignore error */ });
      var sysinfo = wx.getSystemInfoSync();
      this.statusBarHeight = sysinfo.statusBarHeight;
  },
  _getUserInfoPromise: null,
  getUserInfo() {
    console.log(111)
    if (!this._getUserInfoPromise) {
      this._getUserInfoPromise = getUserInfoImpl().catch(err => {
        console.warn("getUserInfo error", err);
        this._getUserInfoPromise = null;
        throw err;
      });
    }
    return this._getUserInfoPromise;
    async function getUserInfoImpl() {
      let user = await getUserInfo();

      if (!user) {
        const { code } = await promisify(wx.login);
        user = await login(code);
        console.log('我是用户',code)
        console.log('我是用户',user)
      }
      return user;
    }
  },
  reloadUserInfo() {
    this._getUserInfoPromise = null;
    return this.getUserInfo();
  },
  statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
})
