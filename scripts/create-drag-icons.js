const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建不同格式的拖拽图标
const iconConfigs = [
  { type: 'TEX', color: '#16a085', filename: 'drag-tex.png' },
  { type: 'HTML', color: '#3498db', filename: 'drag-html.png' },
  { type: 'SVG', color: '#e74c3c', filename: 'drag-svg.png' },
  { type: 'PNG', color: '#9b59b6', filename: 'drag-png.png' },
  { type: 'JPG', color: '#f39c12', filename: 'drag-jpg.png' },
  { type: 'PDF', color: '#e67e22', filename: 'drag-pdf.png' }
];

const createIcon = (config) => {
  const size = 64;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 背景
  ctx.fillStyle = config.color;
  ctx.fillRect(0, 0, size, size);
  
  // 边框
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, size - 4, size - 4);
  
  // 文字
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.type, size / 2, size / 2);
  
  // 保存文件
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(__dirname, '../img', config.filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`Created icon: ${config.filename}`);
};

// 创建所有图标
iconConfigs.forEach(createIcon);

console.log('All drag icons created successfully!');
