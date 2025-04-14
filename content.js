// 验证当前页面是否为小红书网站
if (window.location.hostname.includes('xiaohongshu.com')) {
  console.log('小红书Cookie获取器已启动');
  
  // 创建侧边栏和切换按钮
  function createSidebar() {
    // 获取当前是否为暗黑模式
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 创建侧边栏容器
    const sidebar = document.createElement('div');
    sidebar.id = 'xhs-cookie-sidebar';
    sidebar.style.display = 'block'; // 默认显示
    sidebar.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    sidebar.innerHTML = `
      <div class="xhs-cookie-container">
        <div class="close-button" title="关闭">×</div>
        <div class="header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-right: 15px;">
          <h2 style="margin: 0; color: #ff2442; font-size: 18px; font-weight: 600; letter-spacing: -0.5px;">小红书Cookie获取器</h2>
          <span class="version-badge" style="background: rgba(255, 36, 66, 0.1); color: #ff2442; font-size: 11px; font-weight: 500; padding: 4px 8px; border-radius: 10px;">1.0</span>
        </div>
        <textarea id="xhs-cookie-data" readonly placeholder="等待获取cookie..." style="width: 100%; height: 100px; padding: 10px; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 8px; resize: vertical; font-family: monospace; font-size: 12px; background: rgba(255, 255, 255, 0.5); box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(255, 255, 255, 0.8);"></textarea>
        <button id="xhs-copy-button" style="margin-top: 10px; padding: 10px 0; width: 100%; background-color: #ff2442; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">复制Cookie</button>
        <div id="xhs-status"></div>
        <div class="footer" style="position: relative; text-align: center; font-size: 11px; color: #888; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0, 0, 0, 0.05);">
          <span>Powered by <a href="http://inhai.wiki" target="_blank" class="footer-link">@AI产品银海</a></span>
          <div class="theme-toggle" style="position: absolute; right: 0; top: 10px; cursor: pointer; font-size: 14px;" title="切换主题">🌓</div>
        </div>
      </div>
    `;
    document.body.appendChild(sidebar);
    
    // 设置可拖拽功能
    makeDraggable(sidebar);
    
    // 主题切换功能
    sidebar.querySelector('.theme-toggle').addEventListener('click', () => {
      const currentTheme = sidebar.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      sidebar.setAttribute('data-theme', newTheme);
    });
    
    // 关闭按钮功能
    sidebar.querySelector('.close-button').addEventListener('click', () => {
      // 添加淡出动画
      sidebar.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      sidebar.style.opacity = '0';
      sidebar.style.transform = 'translateX(20px)';
      
      // 动画完成后隐藏
      setTimeout(() => {
        sidebar.style.display = 'none';
      }, 300);
    });
    
    // 获取cookie
    function getCookies() {
      const cookieData = document.getElementById('xhs-cookie-data');
      const status = document.getElementById('xhs-status');
      
      updateStatus('正在获取Cookie...', true);
      
      chrome.runtime.sendMessage({action: 'getCookies'}, response => {
        if (chrome.runtime.lastError) {
          cookieData.value = "获取cookie失败：" + chrome.runtime.lastError.message;
          updateStatus("获取失败", false);
          return;
        }
        
        if (response && response.cookies) {
          cookieData.value = response.cookies;
          updateStatus(`成功获取 Cookie`, true);
        } else {
          cookieData.value = "未找到小红书相关cookie，请先登录小红书网站";
          updateStatus('未找到Cookie，请先登录小红书', false);
        }
      });
    }
    
    // 复制功能
    document.getElementById('xhs-copy-button').addEventListener('click', async () => {
      const cookieData = document.getElementById('xhs-cookie-data');
      
      if (!cookieData.value || cookieData.value.includes('未找到')) {
        updateStatus("没有可复制的Cookie", false);
        await clearStatus();
        return;
      }
      
      try {
        await navigator.clipboard.writeText(cookieData.value);
        const button = document.getElementById('xhs-copy-button');
        
        // 只应用文字变化，不改变底色
        button.classList.add('copy-success');
        button.innerHTML = "✓ 复制成功";
        
        setTimeout(() => {
          button.classList.remove('copy-success');
          button.innerHTML = "复制Cookie";
        }, 1500);
        
        updateStatus("Cookie已复制到剪贴板！", true);
        await clearStatus(2000);
      } catch (error) {
        updateStatus("复制失败：" + error.message, false);
        await clearStatus(3000);
      }
    });
    
    // 更新状态文本和样式
    function updateStatus(message, isSuccess = true) {
      const status = document.getElementById('xhs-status');
      
      // 清除旧的状态类
      status.classList.remove('success', 'error');
      
      // 设置文本和添加新的状态类
      status.textContent = message;
      status.classList.add(isSuccess ? 'success' : 'error');
      
      // 淡入动画
      status.style.opacity = '0';
      setTimeout(() => {
        status.style.transition = 'opacity 0.3s ease';
        status.style.opacity = '1';
      }, 10);
    }
    
    // 清除状态信息
    function clearStatus(delay = 2000) {
      return new Promise(resolve => {
        const status = document.getElementById('xhs-status');
        setTimeout(() => {
          status.style.opacity = '0';
          setTimeout(() => {
            status.textContent = '';
            status.style.opacity = '1';
            status.classList.remove('success', 'error');
            resolve();
          }, 300);
        }, delay);
      });
    }

    // 自动获取cookie
    getCookies();
  }

  // 使元素可拖拽并带有磁吸效果
  function makeDraggable(element) {
    const container = element.querySelector('.xhs-cookie-container');
    const excludedElements = ['TEXTAREA', 'BUTTON', 'INPUT', '.theme-toggle', '.close-button', '.version-badge', '.footer-link'];
    let isDragging = false;
    let initialX, initialY, startX, startY;
    let snapThreshold = 40; // 磁吸效果的阈值
    
    // 记住位置的功能
    let storedPosition = { x: 20, y: 20 }; // 默认位置
    
    // 设置初始位置
    element.style.top = storedPosition.y + 'px';
    element.style.right = storedPosition.x + 'px';
    
    // 为整个容器添加鼠标按下事件
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: false });
    
    function startDrag(e) {
      // 检查是否点击了不应该触发拖动的元素
      const target = e.target;
      
      // 如果点击的是排除的元素或其子元素，则不触发拖动
      if (
        excludedElements.some(selector => 
          target.tagName === selector || 
          (selector.startsWith('.') && target.classList.contains(selector.substring(1))) ||
          target.closest(selector)
        )
      ) {
        return;
      }
      
      e.preventDefault();
      
      isDragging = true;
      container.classList.add('dragging');
      
      // 获取初始位置
      if (e.type === 'mousedown') {
        initialX = e.clientX;
        initialY = e.clientY;
      } else {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
      }
      
      // 获取当前元素位置
      const rect = element.getBoundingClientRect();
      startX = window.innerWidth - rect.right;
      startY = rect.top;
      
      // 添加移动和释放事件监听
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('touchmove', dragMove, { passive: false });
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchend', dragEnd);
    }
    
    function dragMove(e) {
      if (!isDragging) return;
      
      let clientX, clientY;
      
      // 获取当前鼠标/触摸位置
      if (e.type === 'mousemove') {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        e.preventDefault(); // 防止页面滚动
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      // 计算新位置
      const dx = clientX - initialX;
      const dy = clientY - initialY;
      
      const newRight = startX - dx;
      const newTop = startY + dy;
      
      // 限制在可视区域内
      const maxRight = window.innerWidth - 50; // 确保不会完全移出右侧
      const minRight = 0; // 左侧边界
      const maxTop = window.innerHeight - 50; // 确保不会完全移出底部
      const minTop = 0; // 顶部边界
      
      const constrainedRight = Math.min(Math.max(newRight, minRight), maxRight);
      const constrainedTop = Math.min(Math.max(newTop, minTop), maxTop);
      
      // 设置新位置
      element.style.right = constrainedRight + 'px';
      element.style.top = constrainedTop + 'px';
    }
    
    function dragEnd() {
      if (!isDragging) return;
      
      isDragging = false;
      
      // 移除事件监听
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('touchmove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('touchend', dragEnd);
      
      // 获取当前位置进行磁吸判断
      const rect = element.getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      const top = rect.top;
      
      // 判断是否需要磁吸到右侧
      let targetRight = right;
      let targetTop = top;
      
      // 右侧边缘磁吸
      if (right < snapThreshold) {
        targetRight = 20; // 磁吸到右侧
      }
      
      // 左侧边缘磁吸
      if (window.innerWidth - rect.left < snapThreshold) {
        targetRight = window.innerWidth - rect.width - 20; // 磁吸到左侧
      }
      
      // 顶部边缘磁吸
      if (top < snapThreshold) {
        targetTop = 20; // 磁吸到顶部
      }
      
      // 底部边缘磁吸
      if (window.innerHeight - rect.bottom < snapThreshold) {
        targetTop = window.innerHeight - rect.height - 20; // 磁吸到底部
      }
      
      // 使用动画过渡到磁吸位置
      container.classList.remove('dragging');
      container.classList.add('snapping');
      
      element.style.right = targetRight + 'px';
      element.style.top = targetTop + 'px';
      
      // 保存位置
      storedPosition = { x: targetRight, y: targetTop };
      
      // 动画结束后移除类
      setTimeout(() => {
        container.classList.remove('snapping');
      }, 400);
    }
  }
  
  // 监听系统暗色模式变化
  if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', e => {
      const sidebar = document.getElementById('xhs-cookie-sidebar');
      if (sidebar) {
        sidebar.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }
  
  // 等待页面加载完成后创建侧边栏
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSidebar);
  } else {
    createSidebar();
  }
  
  // 监听来自popup的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkStatus') {
      sendResponse({
        status: 'active',
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  });
}
