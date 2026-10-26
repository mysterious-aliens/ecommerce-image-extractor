// 图片画廊页面 - 交互逻辑

let images = [];
let selectedImages = new Set();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

function init() {
  // 从 storage 读取图片列表
  chrome.storage.local.get(['productImages'], (result) => {
    images = result.productImages || [];
    renderGallery();
    updateCount();
  });

  // 绑定事件
  document.getElementById('select-all').addEventListener('change', toggleSelectAll);
  document.getElementById('download-selected').addEventListener('click', downloadSelected);
}

// 渲染图片画廊
function renderGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  images.forEach((url, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;

    item.innerHTML = `
      <img src="${url}" alt="商品图片 ${index + 1}" loading="lazy">
      <div class="checkmark">✓</div>
    `;

    // 点击切换选中状态
    item.addEventListener('click', () => toggleSelect(index));

    gallery.appendChild(item);
  });
}

// 切换选中状态
function toggleSelect(index) {
  if (selectedImages.has(index)) {
    selectedImages.delete(index);
  } else {
    selectedImages.add(index);
  }

  // 更新 UI
  const item = document.querySelector(`[data-index="${index}"]`);
  item.classList.toggle('selected', selectedImages.has(index));

  updateCount();
}

// 全选/取消全选
function toggleSelectAll(e) {
  const isChecked = e.target.checked;

  if (isChecked) {
    images.forEach((_, index) => selectedImages.add(index));
  } else {
    selectedImages.clear();
  }

  // 更新 UI
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.classList.toggle('selected', isChecked);
  });

  updateCount();
}

// 更新计数
function updateCount() {
  document.getElementById('image-count').textContent = `共 ${images.length} 张图片`;
  document.getElementById('selected-count').textContent = `已选 ${selectedImages.size} 张`;
}

// 下载选中的图片
function downloadSelected() {
  if (selectedImages.size === 0) {
    alert('请先选择要下载的图片');
    return;
  }

  const selectedUrls = Array.from(selectedImages).map(index => images[index]);

  // 发送消息给 background，开始批量下载
  chrome.runtime.sendMessage({
    action: 'downloadImages',
    images: selectedUrls
  });

  alert(`开始下载 ${selectedUrls.length} 张图片...`);
}
