const dayjs = require('dayjs');
const {
  action
} = require('../../../../utils/util');
const {
  getPatientInfo, postCCVDAssessment, getServiceList
} = require('../../../../utils/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    patientInfo: null,
    waistline: null,
    tc: null,
    hdlc: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {
      currentSBP, diabetes, isHypotensor,
      smoke, region, urbanRural, ASCVDFamilyHistory
    } = options;
    this.setData({
      currentSBP, diabetes, isHypotensor,
      smoke, region, urbanRural, ASCVDFamilyHistory
    });
  },

  onShow: action(async function () {
    const userInfo = await getApp().getUserInfo();
    const patientInfo = await getPatientInfo();
    const serviceList = await getServiceList(patientInfo.id);
    const isService = serviceList.find(item => {
      const pro = item.products.filter(pro => pro.insuranceProductType === 3);
      return pro && pro.length > 0;
    });
    this.setData({
      userInfo,
      patientInfo,
      isService
    });

  }),
  onWaistline: function (e) {
    var index = e.detail.value
    this.setData({
      waistline: index
    });
  },
  onBlurWaistline: function (e) {
    const { waistline } = this.data
    if (waistline && (waistline < 50 || waistline > 130)){
      this.setData({ waistlineError: true });
      return true;
    }
    this.setData({ waistlineError: false });
    return false
  },
  onTc: function (e) {
    var index = e.detail.value
    this.setData({
      tc: index
    });
  },
  onBlurTc: function(){
    const { tc } = this.data
    console.log();
    if (tc && (tc < 80 || tc > 400)) {
      this.setData({ tcError: true });
      return true;
    }
    this.setData({ tcError: false });
    console.log('tcError', this.data.tcError);
    return false
  },
  onHdlc: function (e) {
    var index = e.detail.value
    this.setData({
      hdlc: index
    });
  },
  onBlurHdlc: function () {
    const { hdlc } = this.data
    if (hdlc && (hdlc < 20 || hdlc > 130)) {
      this.setData({ hdlcError: true });
      return true;
    }
    this.setData({ hdlcError: false });
    return false
  },
  secendCheck: action(async function (e) {
    if(this.onBlurWaistline() || this.onBlurTc() || this.onBlurHdlc()){
      return;
    }
    const {
      currentSBP, diabetes, isHypotensor,
      smoke, region, urbanRural, ASCVDFamilyHistory,
      waistline, tc, hdlc, isService
    } = this.data;
    const { products } = isService;
    const pro = products.find(item => item.insuranceProductType === 3);
    const { patientInfo } = this.data
    const { id, sex, birthday} = patientInfo;
    const age = dayjs().year() - dayjs(birthday).year();
    const formData = {
      insuranceOrderProductId: pro.id,
      gender: sex ,
      age,
      currentSBP,
      diabetes: diabetes == '-1' ? null : diabetes,
      isHypotensor,
      smoke,
      region,
      urbanRural,
      ASCVDFamilyHistory,
      waistline,
      tc,
      hdlc
    }

    const result = await postCCVDAssessment(id, formData);
    wx.navigateTo({
      url: `/pages/CCVDCheck/Result/index?id=${result.id}&assessmentResult=${result.assessmentResult}&name=${patientInfo.name}`
    })

    console.log('checksuccess', result);


  })

})
