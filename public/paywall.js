/* 命理博客 · 打赏 / 付费墙（vendored 经典脚本，全局挂 window.MingLiPay）
 * - 打赏金额：最低 ¥1，无上限
 * - 解锁：localStorage 记录；作者本人用 ?author=1 或 localStorage ml_author=1 免付费
 * - 复用 public/reward/wechat.png + alipay.png 收款码
 */
window.MingLiPay = (function () {
  var KEY = 'ml_paid_v1';
  var AUTHOR_KEY = 'ml_author';

  function isAuthor() {
    try {
      if (localStorage.getItem(AUTHOR_KEY) === '1') return true;
    } catch (e) {}
    try {
      if (new URLSearchParams(location.search).get('author') === '1') return true;
    } catch (e) {}
    return false;
  }
  function isUnlocked() {
    try { if (localStorage.getItem(KEY) === '1') return true; } catch (e) {}
    return isAuthor();
  }
  function unlock() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  }

  function ensureStyle() {
    if (document.getElementById('ml-pay-style')) return;
    var s = document.createElement('style');
    s.id = 'ml-pay-style';
    s.textContent = [
      '.ml-pay-overlay{position:fixed;inset:0;background:rgba(15,18,28,.55);display:none;align-items:center;justify-content:center;z-index:9999;padding:16px;}',
      '.ml-pay-modal{position:relative;width:100%;max-width:420px;background:var(--bg,#fff);color:var(--fg,#1f2933);border:1px solid var(--border,#e3e8ef);border-radius:16px;padding:24px 22px;box-shadow:0 18px 50px rgba(0,0,0,.25);}',
      '.ml-pay-close{position:absolute;top:10px;right:14px;border:none;background:transparent;font-size:24px;line-height:1;color:var(--muted,#7b8794);cursor:pointer;}',
      '.ml-pay-modal h3{margin:0 0 6px;font-size:19px;}',
      '.ml-pay-desc{font-size:14px;color:var(--muted,#7b8794);margin:0 0 14px;line-height:1.6;}',
      '.ml-pay-desc b{color:var(--accent,#7c5cff);}',
      '.ml-pay-amount-label{display:flex;flex-direction:column;gap:6px;font-size:14px;margin-bottom:14px;}',
      '.ml-pay-amount-label input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border,#e3e8ef);border-radius:10px;font-size:18px;background:var(--bg,#fff);color:var(--fg,#1f2933);}',
      '.ml-pay-qrs{display:flex;gap:14px;justify-content:center;margin:6px 0 10px;}',
      '.ml-pay-qr{flex:1;text-align:center;}',
      '.ml-pay-qr-img{width:100%;max-width:150px;margin:0 auto;aspect-ratio:1/1;border:1px solid var(--border,#e3e8ef);border-radius:10px;overflow:hidden;background:#fff;}',
      '.ml-pay-qr-img img{width:100%;height:100%;object-fit:contain;display:block;}',
      '.ml-pay-qr p{margin:8px 0 0;font-size:13px;color:var(--fg,#1f2933);}',
      '.ml-pay-qr-tip{font-size:12px;color:var(--muted,#7b8794);text-align:center;margin:4px 0 14px;}',
      '.ml-pay-confirm{width:100%;padding:12px 16px;border:1px solid var(--accent,#7c5cff);background:var(--accent,#7c5cff);color:#fff;border-radius:10px;font-size:15px;cursor:pointer;transition:opacity .15s;}',
      '.ml-pay-confirm:hover{opacity:.92;}'
    ].join('');
    document.head.appendChild(s);
  }

  function showPayModal(cfg, onUnlock) {
    cfg = cfg || {};
    var minTip = cfg.minTip || 1;
    ensureStyle();
    var overlay = document.getElementById('ml-pay-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ml-pay-overlay';
      overlay.className = 'ml-pay-overlay';
      overlay.innerHTML =
        '<div class="ml-pay-modal" role="dialog" aria-modal="true">' +
          '<button class="ml-pay-close" id="ml-pay-close" type="button" aria-label="关闭">×</button>' +
          '<h3>🔓 解锁命理解读</h3>' +
          '<p class="ml-pay-desc">本解读为付费内容。打赏 <b>¥' + minTip + ' 起（金额不限）</b> 即可解锁查看，也算是对作者的小小支持 ☕</p>' +
          '<label class="ml-pay-amount-label">打赏金额（元）' +
            '<input id="ml-pay-amount" type="number" min="' + minTip + '" step="1" value="' + minTip + '" />' +
          '</label>' +
          '<div class="ml-pay-qrs">' +
            '<div class="ml-pay-qr"><div class="ml-pay-qr-img"><img id="ml-pay-wx" alt="微信收款码" /></div><p>微信</p></div>' +
            '<div class="ml-pay-qr"><div class="ml-pay-qr-img"><img id="ml-pay-ali" alt="支付宝收款码" /></div><p>支付宝</p></div>' +
          '</div>' +
          '<p class="ml-pay-qr-tip">扫码支付后点击下方按钮即可查看解读（作者本人免付费）。</p>' +
          '<button class="ml-pay-confirm" id="ml-pay-confirm" type="button">我已完成支付，查看解读</button>' +
        '</div>';
      document.body.appendChild(overlay);
    }
    var wx = overlay.querySelector('#ml-pay-wx');
    var ali = overlay.querySelector('#ml-pay-ali');
    if (wx && cfg.qrWechat) wx.src = cfg.qrWechat;
    if (ali && cfg.qrAlipay) ali.src = cfg.qrAlipay;
    var amount = overlay.querySelector('#ml-pay-amount');
    amount.value = minTip;

    overlay.querySelector('#ml-pay-confirm').onclick = function () {
      var v = parseFloat(amount.value);
      if (!(v >= minTip)) { alert('打赏金额至少为 ¥' + minTip); return; }
      unlock();
      overlay.style.display = 'none';
      if (typeof onUnlock === 'function') onUnlock();
    };
    overlay.querySelector('#ml-pay-close').onclick = function () { overlay.style.display = 'none'; };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.style.display = 'none'; };

    overlay.style.display = 'flex';
  }

  return { isUnlocked: isUnlocked, unlock: unlock, showPayModal: showPayModal, isAuthor: isAuthor };
})();
