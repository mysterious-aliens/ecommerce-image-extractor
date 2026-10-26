// 电商图片提取下载插件 - Service Worker
// 处理消息转发和图片下载

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openGallery') {
    // 保存图片列表到 storage
    chrome.storage.local.set({ productImages: request.images }, () => {
      // 在新标签页打开 gallery 页面
      chrome.tabs.create({ url: chrome.runtime.getURL('gallery.html') });
    });
  }

  if (request.action === 'downloadImage') {
    // 下载单张图片
    downloadImage(request.url, request.filename);
  }

  if (request.action === 'downloadImages') {
    // 批量下载图片
    downloadMultipleImages(request.images);
  }

  return true;
});

// 下载单张图片
async function downloadImage(url, filename) {
  try {
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
  } catch (error) {
    console.error('下载失败:', error);
  }
}

// 批量下载图片
async function downloadMultipleImages(images) {
  for (let i = 0; i < images.length; i++) {
    const filename = `商品图_${String(i + 1).padStart(3, '0')}.png`;
    await downloadImage(images[i], filename);
    // 间隔一下，避免下载太快
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
