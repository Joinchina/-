const {
  action
} = require('../../../utils/util');
const {
  getPatientInfo
} = require('../../../utils/api.js')
const dayjs = require('dayjs')
Page({
  data: {
    id: null,
    name: null,
    assessmentResult: null,
    currentRisk: {
      image: 'lower-risk',
      color: '#F48E18',
      text: '低危风险',
      remark: '应该接受生活方式指导，以保持自身的低风险状况，加强自我监测。',
    },
    riskList: {
      lowerRisk: {
        image: 'lower-risk',
        color: '#F48E18',
        text: '低危风险',
        remark: '应该接受生活方式指导，以保持自身的低风险状况，加强自我监测。',
      },
      middleRisk: {
        image: 'middle-risk',
        color: '#E95513',
        text: '中危风险',
        remark: '应积极改变不良生活方式，如戒烟、控制体重、增加体力活动等，如有必要可以在临床医生指导下进行相关治疗。',
      },
      highRisk: {
        image: 'high-risk',
        color: '#C8161D',
        text: '高危风险',
        remark: '应积极改变不良生活方式，如戒烟、控制体重、增加体力活动等，同时应该针对自身危险因素，在临床医生指导下进行降压、调脂、降糖等药物治疗。至少每年进行一次体检，必要时可以进行心脏超声、颈动脉超声等详细的影像学检查，以进一步评估心脑血管病风险。',
      }
    }
  },


  onLoad: function (options) {
    const appInstance = getApp()
    const statusBarHeight = appInstance.statusBarHeight;
    const { riskList } = this.data;

    const {
      id, name, assessmentResult, advice
    } = options;
    let currentRisk = riskList.lowerRisk;
    if (assessmentResult * 100 >= 10.0) {
      currentRisk = riskList.highRisk
    } else if (assessmentResult * 100 > 5.0 && assessmentResult * 100 < 10.0) {
      currentRisk = riskList.middleRisk
    } else {
      currentRisk = riskList.lowerRisk
    }
    this.setData({
      id, name, assessmentResult, statusBarHeight,
      currentRisk,
      date: dayjs().format('YYYY-MM-DD'),
      advice
    });
  },

  ctx: wx.createCanvasContext('Canvas'),
  onShow: action(async function () {
    const { currentRisk } = this.data
    const { screenWidth, screenHeight } = wx.getSystemInfoSync();
    const persent = screenWidth / 375;
    var ctx = wx.createCanvasContext('Canvas');
    this.ctx.rect(0, 0, screenWidth, screenWidth);
    // this.ctx.setFillStyle('#F9F9F9');
    // this.ctx.fillRect(0, 0, screenWidth, screenHeight);
    this.ctx.drawImage(`../../../images/${currentRisk.image}.png`, 98 * persent, 24 * persent, 180, 81);


    //border
    this.ctx.setFillStyle('#E8E8E8');
    this.ctx.fillRect(0, 140 * persent, screenWidth, 6);

    this.ctx.font = 'normal 18px Hiragino Sans GB'
    this.ctx.setFillStyle('#333333');
    this.ctx.fillText(`被评估人：${this.data.name || ''}`, 28 * persent, 183 * persent);
    this.ctx.restore();

    this.ctx.font = 'normal 18px Hiragino Sans GB'
    this.ctx.setFillStyle('#333333');
    this.ctx.fillText(`评估时间：${this.data.date || ''}`, 28 * persent, 210 * persent);
    this.ctx.restore();

    const result = currentRisk.remark;
    let detail = {
      x: 28 * persent,
      y: 300 * persent,
      width: screenWidth - 56,
      height: 20,
      line: 100,
      color: '#666666',
      size: 18,
      align: 'left',
      baseline: 'top',
      text: result,
      bold: false
    }
    const line = this.getTextLine(detail);
    const backGroundHeight = line.length * 20 + 80
    this.roundRect(this.ctx, 16, 240 * persent, screenWidth - 32, backGroundHeight , 6, '#ffffff')

    let title = {
      x: 28 * persent,
      y: 265 * persent,
      width: screenWidth - 56,
      height: 20,
      line: 100,
      color: '#666666',
      size: 18,
      align: 'left',
      baseline: 'top',
      text: '干预建议：',
      bold: true
    }
    this.textWrap(title);

    this.textWrap(detail);


    this.ctx.drawImage(`../../../images/notice.png`, 22 * persent, 300 * persent + backGroundHeight, 24, 24);
    let tip = {
      x: 51 * persent,
      y: 300 * persent + backGroundHeight,
      width: screenWidth - 75,
      height: 20,
      line: 100,
      color: '#666666',
      size: 18,
      align: 'left',
      baseline: 'top',
      text: '温馨提示：本工具仅用于心脑血管病风险的初步评估，不能代替临床诊断，具体治疗措施需咨询专业医师。',
      bold: false
    }
    this.textWrap(tip);

    this.ctx.draw();
  }),

  saveResultImg: function () {
    wx.canvasToTempFilePath({
      canvasId: 'Canvas',
      fileType: 'jpg',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            console.log(res)
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
            });
          },
          fail() {
            wx.hideLoading()
          }
        })
      }
    })
  },
  /**
     * 渲染文字
     *
     * @param {Object} obj
     */
  drawText: function (obj) {
    console.log('渲染文字')
    this.ctx.save();
    this.ctx.setFillStyle(obj.color);
    this.ctx.setFontSize(obj.size);
    this.ctx.setTextAlign(obj.align);
    this.ctx.setTextBaseline(obj.baseline);
    if (obj.bold) {
      console.log('字体加粗')
      this.ctx.fillText(obj.text, obj.x, obj.y - 0.5);
      this.ctx.fillText(obj.text, obj.x - 0.5, obj.y);
    }
    this.ctx.fillText(obj.text, obj.x, obj.y);
    if (obj.bold) {
      this.ctx.fillText(obj.text, obj.x, obj.y + 0.5);
      this.ctx.fillText(obj.text, obj.x + 0.5, obj.y);
    }
    this.ctx.restore();
  },
  /**
 * 文本换行
 *
 * @param {Object} obj
 */
  textWrap: function (obj) {
    console.log('文本换行')
    let tr = this.getTextLine(obj);
    for (let i = 0; i < tr.length; i++) {
      if (i < obj.line) {
        let txt = {
          x: obj.x,
          y: obj.y + (i * obj.height),
          color: obj.color,
          size: obj.size,
          align: obj.align,
          baseline: obj.baseline,
          text: tr[i],
          bold: obj.bold
        };
        if (i == obj.line - 1) {
          txt.text = txt.text.substring(0, txt.text.length - 3) + '......';
        }
        this.drawText(txt);
      }
    }
  },
  /**
 * 获取文本折行
 * @param {Object} obj
 * @return {Array} arrTr
 */
  getTextLine: function (obj) {
    this.ctx.setFontSize(obj.size);
    let arrText = obj.text.split('');
    let line = '';
    let arrTr = [];
    for (let i = 0; i < arrText.length; i++) {
      var testLine = line + arrText[i];
      var metrics = this.ctx.measureText(testLine);
      var width = metrics.width;
      if (width > obj.width && i > 0) {
        arrTr.push(line);
        line = arrText[i];
      } else {
        line = testLine;
      }
      if (i == arrText.length - 1) {
        arrTr.push(line);
      }
    }
    return arrTr;
  },

  /**
 * 绘制圆角矩形
 * @param {Object} ctx - canvas组件的绘图上下文
 * @param {Number} x - 矩形的x坐标
 * @param {Number} y - 矩形的y坐标
 * @param {Number} w - 矩形的宽度
 * @param {Number} h - 矩形的高度
 * @param {Number} r - 矩形的圆角半径
 * @param {String} [c = 'transparent'] - 矩形的填充色
 */
  roundRect(ctx, x, y, w, h, r, c = '#fff') {
    if (w < 2 * r) { r = w / 2; }
    if (h < 2 * r) { r = h / 2; }

    ctx.beginPath();
    ctx.fillStyle = c;

    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.lineTo(x + w, y + r);

    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + w, y + h - r);
    ctx.lineTo(x + w - r, y + h);

    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
    ctx.lineTo(x + r, y + h);
    ctx.lineTo(x, y + h - r);

    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x + r, y);

    ctx.fill();
    ctx.closePath();
  },
})
