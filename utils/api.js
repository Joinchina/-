const cookie = require('weapp-cookie');
const {
  promisify,
  timeout
} = require('./util.js');


// const API_BASE = 'https://demo-pay.wanhuhealth.com/api';
// const API_BASE = 'https://t-applet.wanhuhealth.com/api';
const API_BASE = 'http://127.0.0.1:7001/api';
// const API_BASE = 'https://applet.wanhuhealth.com/api';

const HOSTNAME = /^https?\:\/\/([^\/]+)\//.exec(API_BASE)[1];
let reqId = 1;


async function request(url, method = 'GET', body = null) {
  const thisReqId = reqId;
  reqId++;
  console.log('Request', thisReqId, '->', method, url);
  let r;
  try {
    r = await promisify(wx.requestWithCookie, {
      url: `${API_BASE}${url}`,
      method: method,
      header: method === 'GET' ? null : {
        'x-csrf-token': cookie.get('csrfToken', HOSTNAME),
      },
      data: body
    });
  } catch (e) {
    console.warn(e);
    throw new Error('网络错误');
  }
  if (r.statusCode !== 200) {
    console.warn('Request', thisReqId, '<-', `Bad status ${r.statusCode}`);
    throw new Error('网络错误');
  }
  if (r.data.code !== 0) {
    console.warn('Request', thisReqId, '<-', `Bad code ${r.data.code} ${r.data.message}`);
    throw new Error(r.data.message);
  }
  console.log('Request', thisReqId, '<-', r.data.data);
  return r.data.data;
}

function querystring(obj) {
  return Object.entries(obj).filter(
    ([k, v]) => v !== undefined && v !== null && v !== ''
  ).map(
    ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
  ).join('&');
}


function getUserInfo() {
  return request('/userInfo');
}

function login(code) {
  return request('/wx/login', 'POST', { code });
}

function postCCVDAssessment(patientId, data) {
  return request(`/patients/${patientId}/ccvdAssessment`, 'POST', data );
}

function getPatientInfo(){
  return request('/patientInfo');
}

function getPhone(param){
  const p = querystring(param);
  return request(`/wx/phone?${p}`);
}

function smsSend(data){
  return request(`/smsSend`, 'POST', data);
}

function verifyPatient(data){
  return request(`/verify-patient`, 'POST', data);
}

function register(data){
  return request(`/register`, 'POST', data);
}

function patientCertification(patientId, data){
  return request(`/patients/${patientId}/patientCertification`, 'POST', data);

}
function getServiceList(patientId){
  return request(`/patient/${patientId}/insurance_order/inservice`);
}
module.exports = {
  getUserInfo,
  login,
  getPatientInfo,
  postCCVDAssessment,
  getPhone,
  smsSend,
  verifyPatient,
  register,
  patientCertification,
  getServiceList,
};
