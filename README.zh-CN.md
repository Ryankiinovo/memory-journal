# 照片随笔 · Photo Journal Starter

一个用 React + Vite 写的本地优先照片随笔模板：浏览相册、打开照片、在旁边写一段话、加标注、在图片上画线。仓库里的示例文案与图片全部是合成的，替换成你自己的即可。

![预览](assets/preview.png)

## 包含什么

- 照片网格：相册、收藏、搜索、按时间的回顾视图
- 照片编辑器：三种布局、图片标注、自由画笔、随笔与标签
- 随笔视图：集中展示所有写过文字的照片
- 使用 `localStorage` 的本地优先存储
- 6 张合成 SVG 示例照片，不依赖第三方图库
- 响应式布局，无后端、无 API Key

## 快速开始

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
npm run preview
```

需要 Node.js 20 或更新版本。

## 目录

```text
.
├── index.html
├── package.json
├── vite.config.js
├── public/photos/       # 示例 SVG 图片
└── src/
    ├── main.jsx         # 应用、组件、示例数据
    └── styles.css
```

## 改成你的相册

1. 把 `public/photos/` 里的文件换成你的照片；保留文件名，或同步修改 `src/main.jsx` 里的 `seedPhotos`。
2. 修改 `seedPhotos` 的标题、日期、地点、相册、随笔、标签与标注。
3. 修改 `Logo` 组件和 `index.html` 里的品牌名。
4. 在 `src/styles.css` 的 `:root` 里调整配色。

上传文件只通过 `URL.createObjectURL` 在本地预览，不会上传到任何服务器；刷新页面后 blob URL 会失效。如果需要持久化，请把 `seedPhotos` 换成自己的存储层。

## 部署

`npm run build` 生成静态 `dist/`。`vite.config.js` 设置了 `base: './'`，因此可以部署在 GitHub Pages 这类子路径下，也可以放到任意静态托管。

## 隐私与素材

模板不包含个人照片、统计脚本、Cookie，也不会向应用后端发请求。示例图片是为本仓库创作的原创 SVG 插画。加入自己的照片前，请确认你有权公开它们。

## 许可证

MIT，见 `LICENSE`。
