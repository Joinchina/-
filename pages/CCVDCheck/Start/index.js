const {
  action
} = require('../../../utils/util');
const {
  getPatientInfo,
  getPhone,
  smsSend,
  verifyPatient,
  register,
  patientCertification,
  getServiceList,
} = require('../../../utils/api.js');
import IDValidator from '../../../utils/checkIdCard/index.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: null,
    userInfo: {},
    patientInfo: null,
    showLoginModal: false,
    showModal: false,
    loginDisabled: true,
    phone: null,
    phoneError: null,
    verifyCode: null,
    idCard: null,
    idCardError: null,
    name: null,
    nameError: null,
    loading: false,
  },

  onShow: action(async function() {
    wx.showLoading({
      title: '加载中',
    })
    const appInstance = getApp();
    const statusBarHeight = appInstance.statusBarHeight;
    const userInfo = await getApp().getUserInfo();
    const patientInfo = await getPatientInfo();
    const serviceList = await getServiceList(patientInfo.id);
    const isService = serviceList.find(item => {
      const pro = item.products.filter(pro => pro.insuranceProductType === 3);
      return pro && pro.length > 0;
    });
    if (!isService) {
      wx.showModal({
        title: '',
        content: '您没有购买该服务',
        showCancel: false,
        success(res) {}
      })
    }
    this.setData({
      userInfo,
      isService,
      patientInfo,
      statusBarHeight,
      loading: false,
    });
    wx.hideLoading();
  }),

  /**页面跳转 */
  startCheck: function(e) {
    this.setData({
      loading: true
    })
    const {
      patientInfo,
      isService
    } = this.data;
    if (!patientInfo.realNameAuthenticationPassed) {
      this.setData({
        showModal: true,
        idCard: patientInfo.idCard,
        name: patientInfo.name,
        loading: false
      });
      return;
    }
    if (!isService) {
      wx.showModal({
        title: '',
        content: '您没有购买该服务',
        showCancel: false,
        success(res) {}
      })
      this.setData({
        loading: false
      })
      return;
    }
    this.toCheck();

  },
  /** 获取微信绑定的手机号 */
  getPhoneNumber: action(async function(e) {
    if (e.detail && e.detail.encryptedData && e.detail.iv) {
      const data = await getPhone(e.detail);
      this.setData({
        phone: data.phoneNumber || data.purePhoneNumber,
        phoneError: false
      });
    }
    this.setData({
      showLoginModal: true
    });
  }),
  /** 页面跳转 */
  toCheck: function() {
    wx.navigateTo({
      url: '/pages/CCVDCheck/Check/Step1/index',
    })
    this.setData({
      loading: false
    })

  },
  /**修改手机号 */
  onPhoneChange: function(e) {
    this.setData({
      phoneError: false
    });
    var value = e.detail.value
    this.setData({
      phone: value
    });
  },
  /** 手机号校验 */
  onBlurPhone: function(e) {
    const {
      phone
    } = this.data;
    if (!phone || !(/^1[3456789]\d{9}$/.test(phone.replace(/\s+/g, "")))) {
      this.setData({
        phoneError: true
      });
      return true;
    }
    this.setData({
      phoneError: false
    });
    return false
  },
  /** 获取验证码 */
  getVerifyCode: action(async function(e) {
    const {
      phone
    } = this.data;
    if (!phone || !(/^1[3456789]\d{9}$/.test(phone.replace(/\s+/g, "")))) {
      this.setData({
        phoneError: true
      });
    } else {
      await smsSend({
        mobilePhone: phone
      });
      this.setData({
        disabledGetCapchar: true
      })
      this.setTimeCount();
    }
  }),
  /**获取验证码倒计时 */
  setTimeCount: action(async function() {
    for (var i = 60; i >= 0; i--) {
      if (!i) {
        this.setData({
          disabledGetCapchar: false
        });
      }
      this.setData({
        timeCount: i
      });
      await this.timeout(1000);
    }
  }),

  timeout(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  },
  /** 修改验证码 */
  onCodeChange: function(e) {
    var value = e.detail.value;
    this.setData({
      verifyCodeError: ''
    });
    this.setData({
      verifyCode: value
    });
  },
  /** 校验验证码 */
  onBlurCode: function(e) {
    const {
      verifyCode
    } = this.data;
    if (!verifyCode) {
      this.setData({
        verifyCodeError: '请输入验证码'
      });
      verifyCodeError = "请输入验证码";
    } else {
      this.setData({
        verifyCodeError: ''
      });
    }
  },

  /** 登录并注册 */
  onLogin: action(async function() {
    console.log(0)
    this.setData({
      loading: true
    })
    const {
      verifyCode,
      phone
    } = this.data;
    if (phone && (/^1[3456789]\d{9}$/.test(phone.replace(/\s+/g, ""))) && verifyCode && verifyCode.length === 4) {
      try {
        this.setData({
          verifyCodeError: ''
        })
        const data = await verifyPatient({
          mobilePhone: phone,
          code: verifyCode
        });
        //验证成功。 登录或注册后并绑定
        const patientInfo = await register({
          phone,
          patientId: data
        })
        this.setData({
          patientInfo,
          showLoginModal: false,
        })
        this.startCheck();
      } catch (error) {
        this.setData({
          verifyCodeError: error.message
        })
      }
    }
    this.setData({
      loading: false
    })

  }),
  /**修改姓名 */
  onNameChange: function(e) {
    var value = e.detail.value;
    this.setData({
      nameError: ''
    });
    this.setData({
      name: value
    });
  },
  /**修改身份证 */
  onIdCardChange: function(e) {
    var value = e.detail.value;
    this.setData({
      nameError: ''
    });
    this.setData({
      idCard: value
    });
  },
  onCancle: function() {
    this.setData({
      showModal: false,
      showLoginModal: false
    })
  },
  /**校验身份证 */
  onBlurIdCard: function() {
    const {
      idCard
    } = this.data;
    const validator = IDValidator;
    const valueStr = String(idCard);
    if (!idCard || !validator.isValid(valueStr)) {
      this.setData({
        idCardError: '请输入正确的身份证号'
      });
      return false;
    } else {
      this.setData({
        idCardError: ''
      });
      return true;
    }
  },
  /**校验并修改身份证 */
  updatePatientInfo: action(async function() {
    this.setData({
      loading: true
    })
    const {
      idCard,
      name,
      patientInfo
    } = this.data;
    if (!this.onBlurIdCard()) {
      this.setData({
        loading: false
      })
      return;
    }

    try {
      const data = await patientCertification(patientInfo.id, {
        idCard,
        name,
      });
      this.setData({
        patientInfo: data,
        showModal: false,
        loading: false
      });
      this.startCheck();
    } catch (e) {
      this.setData({
        idCardError: e.message
      })
    }
  }),
})
