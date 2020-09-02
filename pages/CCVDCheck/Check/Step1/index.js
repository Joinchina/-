const {
  action
} = require('../../../../utils/util');
const {
  getPatientInfo
} = require('../../../../utils/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    patientInfo: null,
    isHypotensor: null,
    diabetes: null,
    currentSBP: null,
    step: 1,
  },

  onShow: action(async function() {
    const userInfo = await getApp().getUserInfo();
    const patientInfo = await getPatientInfo();
    const { birthday } = patientInfo;
    this.setData({
      userInfo,
      patientInfo,
    });
  }),

  onIsHypotensor: function(e) {
    var index = e.currentTarget.id;
    this.setData({
      isHypotensor: index
    });
  },
  onCurrentSBP: function (e) {
    this.setData({
      currentSBP: e.detail.value
    })
  },

  onBlurCurrentSBP: function(e){
    const { currentSBP } = this.data
    if (currentSBP && (currentSBP < 70 || currentSBP > 200)) {
      this.setData({ currentSBPError: true });
      return true;
    }
    this.setData({ currentSBPError: false });
    return false
  },

  onDiabetes: function(e) {
    var index = e.currentTarget.id;
    this.setData({
      diabetes: index
    });
  },

  secendCheck: function(e){
    const { currentSBP, diabetes, isHypotensor} = this.data;
    wx.navigateTo({
      url: `/pages/CCVDCheck/Check/Step2/index?currentSBP=${currentSBP}&diabetes=${diabetes}&isHypotensor=${isHypotensor}`
    })
  }

})
