/* 记忆随笔 · 示例内容
 * ---------------------------------------------------------------------------
 * 整个站点只读这一个文件：站点文案、照片清单、故事页面都在这里。
 * 换成自己的内容时：
 *   1) 把照片放进 assets/photos/，2) 改下面的 photos，3) 改 pages。
 * layout 取值 1–8：1 左图右文 / 2 左文右图 / 3 上图下文 / 4 整页大图 /
 *                 5 双图 + 下方文字 / 6 大图 + 小图 + 文字 / 7 纯文字页 / 8 全屏照片
 * photos 数组里填 photos 清单的下标。
 *
 * 示例照片为作者本人拍摄（天津），随模板授权用于版式演示。
 */
window.MEMORY_JOURNAL = {
  site: {
    brand: '记忆随笔',
    subtitle: '影像随笔相册',
    city: '天津',
    season: '2026 年冬',
    citySummary: '海河穿过夜色，桥与钟把行走的路线留在水面。这里收录在天津拍下的一个完整故事。',
    storyTitle: '海河入夜',
    storySubtitle: '一些关于桥、灯光和夜晚的记录',
    storySummary: '从黄昏走到午夜。没有赶路，只沿着海河看桥灯亮起，看城市在水里出现另一遍。',
    libraryNote: '海河、桥、钟表与夜色',
    chapters: [
      { label: '01', page: 0, title: '海河入夜', note: '封面与抵达' },
      { label: '02', page: 4, title: '桥下的灯', note: '入夜与桥上的风' },
      { label: '03', page: 7, title: '桥与钟之间', note: '回程' }
    ]
  },
  heroPhoto: 16,
  photos: [
    ['assets/photos/memory-01.jpg', 1600, 1065, '天津之眼与红桥的黄昏'],
    ['assets/photos/memory-02.jpg', 1066, 1600, '砖砌教堂塔楼'],
    ['assets/photos/memory-03.jpg', 1600, 1066, '玻璃幕墙中的城市反光'],
    ['assets/photos/memory-04.jpg', 1600, 1066, '海河水面里的红色灯影'],
    ['assets/photos/memory-05.jpg', 1600, 1066, '红桥与海河夜色'],
    ['assets/photos/memory-06.jpg', 1600, 1066, '天津之眼与水面倒影'],
    ['assets/photos/memory-07.jpg', 1600, 1066, '紫色灯光下的天津之眼'],
    ['assets/photos/memory-08.jpg', 1600, 1066, '红桥与两岸灯火'],
    ['assets/photos/memory-09.jpg', 1600, 1066, '夜色中的天津之眼'],
    ['assets/photos/memory-10.jpg', 1600, 1066, '蓝色天津之眼与倒影'],
    ['assets/photos/memory-11.jpg', 1066, 1600, '天津之眼的竖幅倒影'],
    ['assets/photos/memory-12.jpg', 1600, 1066, '红桥前的天津之眼'],
    ['assets/photos/memory-13.jpg', 1066, 1600, '海河灯光的竖幅倒影'],
    ['assets/photos/memory-14.jpg', 1600, 1066, '天津站钟楼俯瞰'],
    ['assets/photos/memory-15.jpg', 1600, 1066, '城市高架上的夜间车流'],
    ['assets/photos/memory-16.jpg', 1600, 1066, '高处俯瞰海河与桥梁'],
    ['assets/photos/memory-17.jpg', 1600, 1066, '天津之眼与海河夜景全景'],
    ['assets/photos/memory-18.jpg', 1600, 1066, '世纪钟与解放桥细部'],
    ['assets/photos/memory-19.jpg', 1600, 1066, '世纪钟、解放桥与城市夜色'],
    ['assets/photos/memory-20.jpg', 1600, 1066, '解放桥与世纪钟全景'],
    ['assets/photos/memory-21.jpg', 1600, 1066, '解放桥近景']
  ],
  pages: [
    { title: '天津 · 冬', essay: '天还没有完全暗下来，海河两岸已经亮起了灯。\n\n这一次不赶路，只沿着水边慢慢看一座城市进入夜晚。', date: '2026.02.21', time: '17:18', place: '海河 · 天津', layout: 4, photos: [16, 0], note: '从高处看，河流把灯光分成了两条安静的岸。' },
    { title: '抵达海河', essay: '走出地铁时，太阳还停在楼群背后。\n\n天津之眼和红桥隔着一段水面，像一张已经展开的地图。', date: '2026.02.21', time: '17:42', place: '海河 · 天津', layout: 1, photos: [0, 4], note: '冬日下午的光很薄，桥上的红色刚好醒目。' },
    { title: '第一次看见天津之眼', essay: '它比想象中更安静。远处看只是一个完整的圆，走近以后才看见钢索、桥面和缓慢移动的轿厢。\n\n城市的尺度，在这一刻突然变得具体。', date: '2026.02.21', time: '18:10', place: '永乐桥 · 天津', layout: 2, photos: [2, 5], note: '玻璃幕墙先映出了尚未完全亮起的霓虹。' },
    { title: '光落在水面上', essay: '傍晚沿着海河慢慢走，天色比想象中暗得更快。\n\n桥上的灯亮起来以后，水面把整座城市重新画了一遍。\n\n我们没有急着去下一处，只在风里站了一会儿。', date: '2026.02.21', time: '21:56', place: '海河 · 天津', layout: 1, photos: [3, 7], note: '灯光在水里断开，又被下一阵波纹接起来。' },
    { title: '入夜', essay: '夜色把白天显得拥挤的建筑收进背景，只留下桥、灯和水。\n\n河岸上的人仍然很多，但每个人都像在自己的小段路上。', date: '2026.02.21', time: '22:08', place: '北安桥 · 天津', layout: 3, photos: [7, 8], note: '红桥与金色灯带在水中重叠，颜色比肉眼看到的更深。' },
    { title: '桥上的风', essay: '走到桥中央时风忽然大了一点。栏杆是凉的，远处的摩天轮转得很慢。\n\n我们停下来，看倒影被船尾轻轻推散。', date: '2026.02.21', time: '22:34', place: '永乐桥 · 天津', layout: 6, photos: [9, 11], note: '蓝色灯光沿着圆环亮起，倒影在水里延伸得更长。' },
    { title: '一些没有拍下来的东西', essay: '有几段路没有照片。我们只是沿着河岸往前走，看游船从桥洞下面过去，在路口等了很久的红灯。\n\n后来翻相册时，那些空白反而最清楚。相机停下之后，城市才慢慢显出它原来的速度。', date: '2026.02.21', time: '23:02', place: '海河东路 · 天津', layout: 7, photos: [18, 13], note: '这一页留给没有被相机记录下来的片段。' },
    { title: '回程', essay: '最后一张拍在解放桥边。世纪钟还亮着，河岸上的人已经少了许多。\n\n把相机收进包里时，已经过了午夜。', date: '2026.02.22', time: '01:10', place: '解放桥 · 天津', layout: 8, photos: [20, 19], note: '桥梁的钢架占满画面，像故事合上之前的一道书脊。' }
  ]
};
