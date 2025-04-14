document.addEventListener('DOMContentLoaded', async () => {
  const cookieData = document.getElementById('cookieData');
  const copyButton = document.getElementById('copyButton');
  const status = document.getElementById('status');

  // 添加平滑过渡效果
  const addTransition = (element, className, duration = 300) => {
    element.classList.add(className);
    return new Promise(resolve => setTimeout(() => {
      element.classList.remove(className);
      resolve();
    }, duration));
  };

  // 更新状态文本和样式
  const updateStatus = (message, isSuccess = true) => {
    status.textContent = message;
    status.style.color = isSuccess ? '#34c759' : '#ff3b30';
    status.style.opacity = '0';
    setTimeout(() => {
      status.style.transition = 'opacity 0.3s ease';
      status.style.opacity = '1';
    }, 10);
  };

  // 清除状态信息
  const clearStatus = (delay = 2000) => {
    return new Promise(resolve => {
      setTimeout(() => {
        status.style.opacity = '0';
        setTimeout(() => {
          status.textContent = '';
          status.style.opacity = '1';
          status.style.color = '#666';
          resolve();
        }, 300);
      }, delay);
    });
  };

  // 获取小红书域名下的所有cookie
  async function getCookies() {
    try {
      updateStatus('正在获取Cookie...', true);
      
      const cookies = await chrome.cookies.getAll({
        domain: "xiaohongshu.com"
      });

      if (cookies.length === 0) {
        cookieData.value = "未找到小红书相关cookie，请先登录小红书网站";
        updateStatus('未找到Cookie，请先登录小红书', false);
        return;
      }

      // 格式化cookie字符串
      const cookieString = cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

      cookieData.value = cookieString;
      updateStatus(`成功获取 ${cookies.length} 个cookie`, true);
    } catch (error) {
      cookieData.value = "获取cookie失败：" + error.message;
      updateStatus("获取失败：" + error.message, false);
    }
  }

  // 复制功能
  copyButton.addEventListener('click', async () => {
    try {
      if (!cookieData.value || cookieData.value.includes('未找到')) {
        updateStatus("没有可复制的Cookie", false);
        await clearStatus();
        return;
      }
      
      await navigator.clipboard.writeText(cookieData.value);
      await addTransition(copyButton, 'button-active');
      updateStatus("✓ Cookie已复制到剪贴板！", true);
      await clearStatus();
    } catch (error) {
      updateStatus("复制失败：" + error.message, false);
      await clearStatus(3000);
    }
  });

  // 添加CSS类
  const style = document.createElement('style');
  style.textContent = `
    .button-active {
      transform: scale(0.95);
      background-color: #d91833 !important;
    }
  `;
  document.head.appendChild(style);

  // 初始化时获取cookie
  getCookies();
});
