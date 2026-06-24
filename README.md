# VocabMaster - 智能背单词

一个多词库背单词网页应用，支持托福 / GRE / SAT / SSAT 四大考试词库。提供英英释义、中文释义、同义词、反义词、词根词缀等完整维度。

## 特性

- 📖 **多词库支持**：TOEFL / GRE / SAT / SSAT 一键切换
- 🔄 **间隔重复**：基于 SM-2 算法，自动安排复习周期
- 📝 **多维释义**：英文释义 + 中文释义 + 同义词 + 反义词 + 词根词缀
- 🔊 **发音功能**：浏览器原生语音合成
- 📊 **学习统计**：每日趋势图、正确率跟踪
- 📕 **错词本**：自动收集错词，按错误频率排序
- 📱 **响应式设计**：手机/平板/电脑均可使用
- 🔒 **本地存储**：数据存储在浏览器 IndexedDB，无需注册登录

## 技术栈

- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- React Router v6
- Dexie.js (IndexedDB)
- Recharts (图表)
- Vite (构建)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── components/     # 通用组件 (FlashCard, Layout, WordListSelector)
├── pages/          # 页面 (Home, Learn, Stats, WrongWords)
├── types/          # TypeScript 类型定义
├── data/           # 词库数据
├── utils/          # 工具函数 (DB, 间隔重复算法)
├── App.tsx         # 路由配置
├── main.tsx        # 入口
└── index.css       # 全局样式
```

## 词库数据

当前内置 10 个示例单词用于演示。接入完整词库：

1. 下载 [ECDICT](https://github.com/skywind3000/ECDICT) SQLite 数据库
2. 导出为 JSON 并替换 `src/data/wordlists.ts` 中的 `wordBank`
3. 使用 [mcmay/english-wordlists](https://github.com/mcmay/english-wordlists) 做考试分类筛选

## GitHub Pages 部署

1. 在 GitHub 创建仓库 `vocab-master`
2. 推送代码
3. Settings → Pages → Source 选 `GitHub Actions`
4. 或在项目根目录创建 `.github/workflows/deploy.yml`

## License

MIT
