// pages/components/navigation-bar/navigation-bar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: { 
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: 32,
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      var sysinfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sysinfo.statusBarHeight +10 
      }) 
    },

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
