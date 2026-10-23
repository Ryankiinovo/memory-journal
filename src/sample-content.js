// 示例文案 · 临时虚构
// -----------------------------------------------------------------------------
// 这里的内容只用于演示版式：所有文字均为虚构，不对应真实人物、地点或事件。
// 换成真实文案时，只改这个文件，页面与组件不用动；可以增减条目，页面会自动适配。
//
// 字段说明：
//   id       唯一数字
//   src      照片地址，默认取 BASE_URL + photos/memory-01.jpg
//   title    照片标题
//   date     日期字符串，建议 YYYY.MM.DD
//   place    地点，如「高尾山 · 东京」
//   album    相册名，页面会自动按相册分组
//   note     随笔正文，可为空
//   tags     标签数组
//   favorite 是否收藏
//   aspect   版式：wide / tall / standard
//   pins     图片标注 [{ id, x, y, text }]，x/y 为百分比坐标
//   strokes  自由画笔轨迹，默认 []
// -----------------------------------------------------------------------------

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/'
const P = BASE + 'photos/'

export const seedPhotos = [
  {
    id: 1, src: P + 'memory-01.jpg', title: '蓝调时刻', date: '2025.03.16', place: '高尾山 · 东京', album: '东京散步',
    note: '下山前的十分钟，天色突然变成很深的蓝。我们谁也没有催促谁，只是一起站在风里。后来想起东京，最先出现的不是霓虹，而是这一刻。',
    tags: ['朋友', '山野', '黄昏'], favorite: true, aspect: 'wide',
    pins: [{ id: 11, x: 54, y: 34, text: '风从山谷里吹上来，很凉。' }, { id: 12, x: 76, y: 59, text: '所有人都笑得很松弛。' }], strokes: []
  },
  {
    id: 2, src: P + 'memory-02.jpg', title: '章鱼烧摊', date: '2025.03.15', place: '道顿堀 · 大阪', album: '东京散步',
    note: '拐进小巷以后，先闻到了酱汁的甜味。老板手里的签子转得飞快，等到入口却还是被烫得说不出话。',
    tags: ['街巷', '食物'], favorite: false, aspect: 'tall', pins: [], strokes: []
  },
  {
    id: 3, src: P + 'memory-03.jpg', title: '分着吃的一餐', date: '2025.03.15', place: '黑门市场 · 大阪', album: '东京散步',
    note: '旅行里最好吃的东西，常常不是预约过的那一家，而是大家站着分完的一小盒。',
    tags: ['食物', '朋友'], favorite: true, aspect: 'standard', pins: [], strokes: []
  },
  {
    id: 4, src: P + 'memory-04.jpg', title: '市场里的笑声', date: '2025.03.14', place: '上野 · 东京', album: '东京散步',
    note: '摊主听不懂我们的日语，我们也没完全听懂他的玩笑，但大家还是一起笑了很久。',
    tags: ['市集', '朋友'], favorite: false, aspect: 'wide', pins: [], strokes: []
  },
  {
    id: 5, src: P + 'memory-05.jpg', title: '夜晚开始发亮', date: '2024.11.08', place: '考山路 · 曼谷', album: '南方来信',
    note: '六点以后，街道像忽然换了一种语言。招牌亮起来，音乐从每一扇门里漫出来。',
    tags: ['夜色', '街巷'], favorite: true, aspect: 'standard', pins: [], strokes: []
  },
  {
    id: 6, src: P + 'memory-06.jpg', title: '路边的晚餐', date: '2024.11.07', place: '唐人街 · 曼谷', album: '南方来信',
    note: '塑料凳、柠檬汽水和一场没有计划的晚餐。回酒店的路上，每个人身上都还带着炭火味。',
    tags: ['食物', '夜晚'], favorite: false, aspect: 'tall', pins: [], strokes: []
  },
  {
    id: 7, src: P + 'memory-07.jpg', title: '很远的山', date: '2024.08.23', place: '黑山 · 南达科他', album: '公路以西',
    note: '公路几乎没有尽头。云的影子越过山体时，我们把车停在了路边。',
    tags: ['公路', '山野'], favorite: false, aspect: 'wide', pins: [], strokes: []
  },
  {
    id: 8, src: P + 'memory-08.jpg', title: '摊火', date: '2025.03.14', place: '新世界 · 大阪', album: '东京散步',
    note: '火光映在铁板上，整条街都有一种热腾腾的生命力。',
    tags: ['街巷', '食物'], favorite: false, aspect: 'standard', pins: [], strokes: []
  },
]
