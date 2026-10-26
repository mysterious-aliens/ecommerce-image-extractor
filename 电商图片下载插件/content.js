// 电商图片提取下载插件 - 内容脚本
// 在电商详情页注入提取按钮，点击后提取所有商品图片

(function () {
  'use strict';

  // 创建提取按钮
  function createButton() {
    const btn = document.createElement('button');
    btn.id = 'extract-images-btn';
    btn.textContent = '获取图片';
    btn.addEventListener('click', extractImages);
    document.body.appendChild(btn);
  }

  // 显示提示消息
  function showToast(message, duration = 2000) {
    let toast = document.getElementById('toast-message');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-message';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // 提取页面所有商品图片
  function extractImages() {
    const btn = document.getElementById('extract-images-btn');
    btn.classList.add('loading');
    btn.textContent = '提取中...';

    const images = new Set();

    // 收集所有 img 标签的 src
    document.querySelectorAll('img').forEach(img => {
      let src = img.src || img.dataset.src || img.dataset.lazySrc;
      if (src && src.startsWith('http') && !src.includes('data:image')) {
        // 过滤掉小图标、logo、占位图
        if (img.width > 100 || img.height > 100) {
          images.add(src);
        }
      }
    });

    // 收集背景图
    document.querySelectorAll('*').forEach(el => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('url(')) {
        const match = bg.match(/url\(["']?(.*?)["']?\)/);
        if (match && match[1] && match[1].startsWith('http')) {
          images.add(match[1]);
        }
      }
    });

    // 去重并转为数组
    const imageList = Array.from(images);

    if (imageList.length === 0) {
      showToast('未找到图片');
      btn.classList.remove('loading');
      btn.textContent = '获取图片';
      return;
    }

    // 保存图片列表到 storage
    chrome.storage.local.set({ productImages: imageList }, () => {
      showToast(`找到 ${imageList.length} 张图片，正在打开预览页...`);

      // 发送消息给 background，打开 gallery 页面
      chrome.runtime.sendMessage({
        action: 'openGallery',
        images: imageList
      });

      btn.classList.remove('loading');
      btn.textContent = '获取图片';
    });
  }

  // 页面加载完成后创建按钮
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
