# 记忆随笔 · Memory Journal

[English](./README.md) | 简体中文

以城市为线索的本地影像随笔：照片按城市收纳，每个故事由多个页面组成，可阅读、可编辑、可放映。纯静态，无构建、无后端、不上传。

## 特点

- **城市优先**：城市记忆库 → 城市页 → 故事 → 页面。
- **八种版式**：整页大图、左图右文、左文右图、上图下文、双图、纯文字、全屏照片等。
- **纯静态**：三个文件加一个照片目录，任意静态服务器即可打开。
- **本地优先**：编辑只在内存中预览，刷新重置；照片不会上传。

## 快速开始

```bash
cd memory-journal
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080
```

## 换成你自己的内容

1. 把照片放进 `assets/photos/`（JPG，建议最长边 1600px）。
2. 只改 `content.js`：站点文案、照片清单、页面数据都在这个文件里。
3. 页面 `layout` 取 1–8（对应 `app.js` 的 `layoutNames`），`photos` 是照片数组下标。

## 目录

```text
index.html      所有界面的结构
app.js          状态、阅读/编辑/放映、搜索
styles.css      设计变量与响应式规则
content.js      内容（只改这一个文件）
assets/photos/  示例照片
```

## 部署到 GitHub Pages

推到 `main` 分支即可，`.github/workflows/deploy.yml` 直接把仓库根目录发布出去（无构建）。首次需要在 **Settings → Pages → Source** 选 **GitHub Actions**。

## 隐私与示例内容

示例照片为作者本人拍摄，随模板一同授权用于版式演示；文案为演示用的示例文字。站点不上传任何文件，编辑只在浏览器内存中进行。正式使用前请把照片与文案都换成自己的。

## 许可证

MIT，见 [LICENSE](./LICENSE)。