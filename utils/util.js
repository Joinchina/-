function promisify(func, opts) {
  return new Promise((fulfill, reject) => {
    func({
      ...opts,
      success: function(res) {
        if (opts && opts.success) {
          try {
            opts.success(res);
          } catch (e) {
            reject(e);
            return;
          }
        }
        fulfill(res);
      },
      fail: function(err) {
        if (opts && opts.fail) {
          try {
            opts.fail(err);
          } catch (e) {
            reject(e);
            return;
          }
        }
        reject(new Error(err.errMsg));
      }
    });
  });
}

function action(message, asyncFunction) {
  if (typeof message === 'function') {
    asyncFunction = message;
    message = null;
  }
  return function(...args) {
    try {
      const r = asyncFunction.apply(this, args);
      if (typeof r.then === 'function') {
        if (message) {
          console.time(message);
          wx.showLoading({
            title: message,
            mask: true,
          });
        }
        return r.then(
          r => {
            if (message) {
              console.timeEnd(message);
              wx.hideLoading();
            }
            return r;
          },
          e => {
            console.warn(e);
            if (message) {
              console.timeEnd(message);
              wx.hideLoading();
            }
            wx.showToast({
              title: friendlyMessage(e),
              icon: 'none',
            });
          }
        );
      }
      return r;
    } catch (e) {
      console.warn(e);
      wx.showToast({
        title: friendlyMessage(e),
        icon: 'none',
      });
    }
  }
}

function friendlyMessage(err) {
  if (err instanceof SyntaxError || err instanceof ReferenceError || err instanceof RangeError ||
    err instanceof TypeError || err instanceof URIError || err instanceof EvalError) {
    return '系统内部错误';
  }
  return err.message;
}

function timeout(time) {
  return new Promise(fulfill => setTimeout(fulfill, time));
}

module.exports = {
  promisify,
  action,
  timeout,
}
