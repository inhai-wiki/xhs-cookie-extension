// 监听来自content.js的请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies') {
    // 获取所有小红书域名下的cookie
    chrome.cookies.getAll({ domain: 'xiaohongshu.com' }, cookies => {
      if (cookies.length === 0) {
        sendResponse({ success: false });
        return;
      }

      // 格式化cookie字符串
      const cookieString = cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

      sendResponse({ 
        success: true, 
        cookies: cookieString, 
        count: cookies.length 
      });
    });
    
    // 保持消息通道开放，以便异步响应
    return true;
  }
}); 