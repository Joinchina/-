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
    smoke: null,
    region: null,
    urbanRural: null, 
    ASCVDFamilyHistory: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     
    const {
      currentSBP, diabetes, isHypotensor
    } = options; 
    this.setData({
      currentSBP, diabetes, isHypotensor
    });
  },

  onShow: action(async function () { 
    const userInfo = await getApp().getUserInfo();
    const patientInfo = await getPatientInfo();
    this.setData({
      userInfo,
      patientInfo
    });
  }),

  onSmoke: function (e) {
    var index = e.currentTarget.id;
    this.setData({
      smoke: index
    });
  }, 
  onRegion: function (e) {
    var index = e.currentTarget.id;
    this.setData({
      region: index
    });
  },  

  onUrbanRural: function (e) {
    var index = e.currentTarget.id;
    this.setData({
      urbanRural: index
    });
  },  

  onASCVDFamilyHistory: function (e) {
    var index = e.currentTarget.id;
    this.setData({
      ASCVDFamilyHistory: index
    });
  },  
  secendCheck: function (e) { 
    const { 
      currentSBP, diabetes, isHypotensor,
      smoke, region, urbanRural, ASCVDFamilyHistory
     } = this.data;
    wx.navigateTo({
      url: `/pages/CCVDCheck/Check/Step3/index?currentSBP=${currentSBP}&diabetes=${diabetes}&isHypotensor=${isHypotensor}&smoke=${smoke}&region=${region}&urbanRural=${urbanRural}&ASCVDFamilyHistory=${ASCVDFamilyHistory}`
    })
  }

})