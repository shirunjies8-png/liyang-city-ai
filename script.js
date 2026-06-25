const state = {
  weather: "晴天",
  time: "上午",
  discover: "today",
  activity: "today",
  food: "全部",
  community: "全部",
  map: "全部",
  upgradeRun: 0,
  audioMode: localStorage.getItem("liyangAudioMode") || "auto",
  soundscape: localStorage.getItem("liyangSoundscape") || "auto",
};

let ambientAudio = null;

const aiProfiles = {
  晴天: {
    headline: "今天适合湖边散步",
    summary: "阳光和能见度适合在天目湖周边慢走，傍晚加一段城区夜食更稳。",
    heat: 86,
    recs: [
      ["路线", "天目湖水线", "步道、咖啡、晚风，适合2到4小时轻出行。"],
      ["美食", "湖边简餐", "午后不宜排长队，优先选择能停车的露台小店。"],
      ["活动", "茶田拍照", "下午光线柔和，适合茶田、公路和乡村咖啡。"],
      ["社区", "骑行补给", "环湖路线热度上升，注意补水和防晒。"],
    ],
  },
  雨天: {
    headline: "今天适合雨天小店和室内活动",
    summary: "雨天优先推荐城区咖啡、手作体验、亲子课堂和近距离美食路线。",
    heat: 73,
    recs: [
      ["美食", "砂锅和面馆", "热汤类更适合雨天，路线尽量靠近停车点。"],
      ["活动", "亲子手作", "农场室内课、陶艺和阅读活动适合家庭。"],
      ["路线", "城区慢逛", "把新店、展览和甜品店串成半日路线。"],
      ["提醒", "路况关注", "山路湿滑，竹海和露营路线建议降低优先级。"],
    ],
  },
  高温: {
    headline: "今天适合竹海避暑",
    summary: "高温天气把户外安排在上午或傍晚，午后转入竹林、汤泉、茶室和室内空间。",
    heat: 91,
    recs: [
      ["路线", "竹海清凉线", "上午入山，午后找茶室或民宿公共空间休息。"],
      ["亲子", "自然课堂", "选择有遮阴和补水点的亲子活动。"],
      ["美食", "清爽农家菜", "避开重油夜宵，优先白茶、凉菜和应季蔬果。"],
      ["提醒", "防暑补给", "骑行和露营改到傍晚后，准备电解质水。"],
    ],
  },
  大风: {
    headline: "今天适合城区夜游和室内打卡",
    summary: "大风天减少露营、骑行和水边长停留，推荐城区小店、热食和轻量社交。",
    heat: 68,
    recs: [
      ["路线", "城区夜游线", "晚餐、甜品、老街散步，动线短更舒服。"],
      ["活动", "室内市集", "优先选择商场、书店和社区活动室。"],
      ["美食", "火锅烧烤", "适合朋友聚餐，注意提前排队或预约。"],
      ["社区", "失物招领", "大风天气随身物品和骑行装备更容易遗失。"],
    ],
  },
};

const timeNotes = {
  上午: "上午适合把户外和需要体力的活动放前面。",
  下午: "下午适合茶田、小店、亲子体验和轻量路线。",
  夜间: "夜间适合城区美食、夜游和低强度社交。",
  周末: "周末适合一日或两日路线，提前锁定停车和预约。",
};

const routeTemplates = {
  half: [
    ["13:30", "从{start}出发", "先确认停车点和返程时间，减少临时绕路。"],
    ["14:10", "湖边或城区轻逛", "围绕{interest}安排一个核心点。"],
    ["16:00", "咖啡/茶饮停留", "{people}人同行适合选择座位稳定的小店。"],
    ["17:20", "早晚餐收尾", "{budget}，优先动线短的店。"],
  ],
  day: [
    ["09:00", "上午户外段", "从{start}出发，先去湖山、竹林或骑行点。"],
    ["11:40", "本地午餐", "{budget}，按{people}人选择面馆、砂锅或农家乐。"],
    ["14:20", "下午体验", "围绕{interest}安排茶田、亲子、咖啡或市集。"],
    ["18:00", "城区夜食", "把返程前最后一站放在停车方便的城区。"],
  ],
  two: [
    ["Day 1 14:00", "抵达与入住", "先放行李，再开始轻量活动。"],
    ["Day 1 17:00", "湖边黄昏", "安排低强度散步和晚餐。"],
    ["Day 2 10:00", "{interest}深度体验", "亲子、茶文化、骑行或农场活动放在上午。"],
    ["Day 2 15:30", "农产和返程", "{budget}，适合带白茶、笋干或应季水果。"],
  ],
  family: [
    ["09:30", "自然观察", "选择遮阴好、步行距离短的亲子点。"],
    ["11:30", "家庭友好午餐", "优先有儿童座椅和停车的位置。"],
    ["14:00", "手作课堂", "农场、陶艺、茶文化都适合半天体验。"],
    ["16:30", "甜品和返程", "用甜品店或书店结束，避免孩子过度疲劳。"],
  ],
  couple: [
    ["16:00", "白茶甜品", "从{start}出发，先选安静好聊天的小店。"],
    ["17:20", "湖边黄昏", "把拍照和散步安排在光线柔和的时间。"],
    ["18:40", "城区晚餐", "{budget}，优先环境稳定、无需长时间排队的店。"],
    ["20:00", "夜间慢逛", "甜品、咖啡或音乐活动作为收尾。"],
  ],
  cycling: [
    ["08:00", "环湖热身", "从{start}出发，先走平缓路段。"],
    ["10:00", "补水点", "检查水、头盔和防晒，记录可补给商户。"],
    ["12:00", "轻食午餐", "{budget}，不要安排过重午餐。"],
    ["16:30", "傍晚返程", "高温或大风时缩短水边停留。"],
  ],
  photo: [
    ["15:30", "茶田公路", "优先下午光线，准备长焦或手机人像模式。"],
    ["16:40", "乡路咖啡", "短暂停留补水，顺手拍窗景和路牌。"],
    ["17:40", "湖边剪影", "黄昏时段拍水面、步道和人物背影。"],
    ["19:00", "城区夜景", "用夜食和街巷灯光完成最后一组照片。"],
  ],
  rainy: [
    ["10:00", "城区热汤早餐", "雨天先从面馆、砂锅或热饮开始。"],
    ["11:30", "室内手作", "选择陶艺、茶文化或亲子课堂，减少户外移动。"],
    ["14:30", "咖啡甜品", "{budget}，适合聊天和整理照片。"],
    ["16:00", "短线返程", "关注路况，避免山路和露营安排。"],
  ],
  night: [
    ["18:00", "城区晚餐", "从{start}出发，先锁定主餐。"],
    ["19:40", "夜游散步", "选择灯光、人流和停车都稳定的街区。"],
    ["20:30", "甜品/咖啡", "适合约会、朋友聊天或短暂停留。"],
    ["21:30", "返程提醒", "保留叫车和停车场出口信息。"],
  ],
  camping: [
    ["15:00", "营地确认", "先确认天气、风力、停车和卫生间。"],
    ["16:00", "搭建与补给", "{people}人同行需要明确分工和食材。"],
    ["18:20", "轻食晚餐", "{budget}，不建议复杂明火。"],
    ["20:00", "夜间收纳", "关注降温、大风和垃圾带走。"],
  ],
  weekend: [
    ["09:30", "从{start}出发", "先确认停车、预约和活动名额，周末减少临时排队。"],
    ["11:30", "本地午餐", "{budget}，按{people}人选择翻台稳定、电话可确认的商家。"],
    ["14:00", "{interest}主题活动", "串联亲子、茶文化、咖啡、骑行或市集内容。"],
    ["17:30", "轻量返程", "把最后一站放在城区或停车便利的位置。"],
  ],
  holiday: [
    ["Day 1 10:00", "节假日抵达", "优先避开高峰入口，先选择停车和游客服务中心。"],
    ["Day 1 14:30", "核心体验", "围绕{interest}安排湖山、竹海、白茶或亲子活动。"],
    ["Day 1 19:00", "城区夜游", "节假日夜间优先选择人流稳定、返程方便的区域。"],
    ["Day 2 10:00", "慢游和伴手礼", "{budget}，安排白茶、农产或本地小店作为收尾。"],
  ],
};

const discoverData = {
  today: [
    ["新店", "城区白茶咖啡试营业", "适合下午会友，离停车点近。", "lake"],
    ["活动", "亲子农场自然课", "雨天可切换室内手作。", "green"],
    ["路线", "天目湖黄昏散步线", "轻量、好抵达、适合外地朋友。", "gold"],
    ["市集", "周三社区夜市", "夜宵和本地小吃热度高。", "clay"],
  ],
  week: [
    ["热门路线", "竹海茶田一日线", "本周收藏最高，适合朋友同行。", "green"],
    ["热门活动", "周末茶文化体验", "亲子和年轻游客都适合。", "tea"],
    ["热门餐厅", "城区砂锅小馆", "雨天和夜间搜索量上升。", "clay"],
    ["打卡点", "乡路咖啡窗口", "拍照、骑行补给、短停留。", "blue"],
  ],
  month: [
    ["季节玩法", "夏季竹海避暑计划", "高温日自动提高推荐权重。", "green"],
    ["节庆活动", "白茶主题周末", "可串联农产、课堂和小店。", "tea"],
    ["周末计划", "两日小住路线", "适合家庭和周边城市短假。", "gold"],
    ["社区热点", "骑行补给地图共建", "商家和骑友都可补充点位。", "lake"],
  ],
};

const foods = [
  ["早餐", "城区汤包早面", "清晨人气高，适合居民日常和游客第一站。", 92],
  ["面馆", "老街干拌面", "动线短、翻台快，适合半日路线。", 88],
  ["砂锅", "雨天热砂锅", "雨天和夜间推荐权重高。", 95],
  ["烧烤", "城区夜宵烧烤", "朋友聚会适合，建议错峰。", 84],
  ["火锅", "家庭聚餐火锅", "适合大风或降温天气。", 82],
  ["甜品", "白茶甜品店", "适合约会、亲子和下午停留。", 89],
  ["咖啡", "茶田咖啡窗口", "适合拍照、骑行补给和乡野兜风。", 91],
  ["夜宵", "夜游小吃线", "夜间城区活跃度高。", 90],
  ["农家乐", "山脚农家菜", "适合竹海和两日路线。", 87],
];

const activityData = {
  today: [
    ["亲子活动", "农场自然观察", "适合上午，注意防晒和补水。"],
    ["茶文化活动", "白茶冲泡体验", "适合游客和本地朋友聚会。"],
    ["骑行活动", "环湖轻骑", "晴天推荐，大风降低优先级。"],
  ],
  weekend: [
    ["露营活动", "湖边轻露营", "需要提前确认风力和停车。"],
    ["市集活动", "社区周末市集", "适合亲子、宠物友好和夜游。"],
    ["音乐活动", "小店民谣夜", "适合夜间城区路线。"],
  ],
  holiday: [
    ["两日路线", "湖山小住", "住宿、农产、活动统一规划。"],
    ["农场活动", "采摘和手作", "适合家庭客群。"],
    ["演出活动", "公共空间轻演出", "适合节假日夜间。"],
  ],
  rain: [
    ["室内亲子", "陶艺和手作", "雨天优先级最高。"],
    ["咖啡活动", "白茶甜品试吃", "适合朋友小聚。"],
    ["本地展览", "小型摄影展", "适合城区慢逛。"],
  ],
  night: [
    ["夜游活动", "城区灯光散步", "安全、短动线、好返程。"],
    ["夜宵活动", "砂锅烧烤线", "适合朋友聚会。"],
    ["音乐活动", "咖啡店开放麦", "适合年轻客群。"],
  ],
};

const seedCommunity = [
  ["美食", "新砂锅店排队变短了", "适合雨天晚餐，建议18:00前到。", "已核验"],
  ["摄影", "茶田傍晚光线很好", "下午四点后更适合拍人像和公路。", "热"],
  ["骑行", "环湖补给点新增打气筒", "靠近停车场，骑友可顺路补给。", "更新中"],
  ["露营", "今晚风力偏大", "轻露营注意固定天幕，必要时取消。", "提醒"],
  ["亲子", "周末自然课还有名额", "适合5到10岁孩子，上午场更舒服。", "已核验"],
  ["拼车", "周六南京到溧阳拼车", "两空位，下午返程。", "待确认"],
];

const mapPins = [
  ["美食", "城区夜食", 38, 58, "clay"],
  ["活动", "社区市集", 48, 45, "gold"],
  ["露营地", "湖边轻营地", 67, 62, "green"],
  ["停车场", "游客停车点", 54, 68, "blue"],
  ["骑行点", "环湖补给", 72, 44, "lake"],
  ["亲子点", "农场课堂", 33, 38, "tea"],
  ["宠物友好点", "宠物友好草坪", 58, 28, "violet"],
  ["厕所", "公共卫生间", 42, 72, "green"],
  ["充电桩", "新能源充电点", 62, 76, "blue"],
  ["公交站", "游客公交站", 46, 74, "lake"],
  ["景区", "竹海入口", 78, 34, "tea"],
  ["医院", "城区医院", 31, 68, "blue"],
  ["学校", "研学集合点", 24, 34, "green"],
  ["社区公共点位", "社区服务点", 36, 46, "gold"],
  ["民宿", "湖山民宿", 28, 48, "violet"],
  ["咖啡馆", "白茶咖啡", 52, 32, "gold"],
  ["夜宵点", "城区夜宵街", 36, 66, "clay"],
  ["游客服务中心", "游客服务中心", 57, 52, "lake"],
];

const guideRoles = [
  ["guide", "溧阳AI导游", "今天我可以带你认识天目湖、竹海和白茶文化。", "适合第一次来溧阳的游客，能快速生成一日游和两日游。"],
  ["tea", "溧阳茶文化大使", "白茶文化适合做成采茶、品茶、茶点和乡路路线。", "可以讲解白茶故事、茶田拍照和茶文化活动。"],
  ["food", "溧阳美食推荐官", "从早餐面馆到夜宵砂锅，我会按时间、人数和预算推荐。", "适合本地居民和周边游客快速找店。"],
  ["family", "溧阳亲子路线官", "亲子路线要少走路、好停车、有卫生间和明确时间。", "可以推荐农场、手作、自然观察和甜品收尾。"],
  ["night", "溧阳夜游推荐官", "夜游适合城区美食、甜品、老街散步和小店活动。", "会避开不适合夜间长停留的水边和山路。"],
  ["history", "溧阳历史讲解员", "溧阳历史、名人、老照片和城市发展变化都可以讲成故事。", "适合城市文化馆、研学和短视频内容。"],
];

const cultureThemes = [
  ["lake", "天目湖主题", "天目湖发展故事", "从湖区生态、休闲度假到城市名片，适合做首页壁纸说明和导游讲解。"],
  ["bamboo", "竹海主题", "南山竹海文化", "竹林、山路、避暑和民宿资源适合高温日推荐。"],
  ["tea", "白茶主题", "溧阳白茶文化", "白茶可串联茶田、手作、农产、咖啡和伴手礼。"],
  ["history", "历史人物主题", "溧阳名人与城市故事", "可生成历史人物介绍、研学文案和语音讲解。"],
  ["night", "城市夜景主题", "城区夜游故事", "夜食、小店、灯光和老街适合年轻用户打开。"],
  ["village", "乡村田园主题", "乡村田园生活", "农场、采摘、亲子活动和乡村咖啡适合周末。"],
];

const companionOptions = [
  ["city", "溧阳城市吉祥物“小溧”", "今天比较热，建议选择竹海避暑路线。"],
  ["cat", "小猫AI伙伴", "中午了，要不要看看附近美食？"],
  ["dog", "小狗AI伙伴", "附近有适合散步的湖边路线，我可以帮你规划。"],
  ["panda", "熊猫AI伙伴", "周末有亲子活动，要不要我帮你生成路线？"],
  ["rabbit", "兔子AI伙伴", "下午适合白茶甜品和茶田拍照。"],
  ["fox", "狐狸AI伙伴", "我发现一条夜游路线，适合朋友聚会。"],
  ["deer", "小鹿AI伙伴", "今天户外活动注意防晒和补水。"],
  ["bamboo", "竹海精灵", "高温日建议少走路，优先竹海和室内茶文化。"],
  ["tea", "白茶精灵", "附近有一家评分较高的白茶甜品店。"],
];

const cityTasks = [
  ["每日签到", "打开平台并领取今日城市贡献值", 5],
  ["美食打卡", "上传一次真实用餐反馈或收藏一家店", 10],
  ["路线打卡", "完成一条湖边、竹海或城区路线", 15],
  ["地图纠错", "补充停车、电话、营业时间或厕所信息", 20],
  ["举报风险信息", "举报招聘、拼车、二手交易中的风险内容", 25],
  ["邀请商家入驻", "邀请一家本地商家完善资料", 30],
];

const publicServices = [
  ["办事指南", "预留政策解读与办事流程入口，以官方渠道为准。"],
  ["医院导航", "展示医院位置、电话和急诊提醒。"],
  ["学校信息", "展示学校周边、社区信息和公开资料入口。"],
  ["公交信息", "预留公交、停车和换乘提示。"],
  ["社区通知", "展示社区活动、通知和文明城市宣传。"],
  ["志愿活动", "展示志愿服务报名与活动提醒。"],
];

const soundscapes = [
  ["auto", "今日自动声景", "根据天气、时间和路线自动选择，默认静音。", "lake", 220],
  ["lake", "天目湖湖水声", "湖水、微风、远处人声，适合湖边散步路线。", "lake", 196],
  ["bamboo", "南山竹海风声", "竹林风、鸟鸣和山谷空气感，适合竹海避暑。", "green", 174],
  ["tea", "白茶园鸟鸣", "茶田风声、鸟鸣和轻自然声，适合下午茶田。", "tea", 246],
  ["cicada", "夏季蝉鸣", "高温天的夏季自然声，提醒选择避暑路线。", "gold", 330],
  ["rain", "雨天竹林", "屋檐雨声、竹叶雨声和轻柔湖边雨声。", "blue", 128],
  ["camp", "露营夜晚", "晚风、轻篝火和远处虫鸣，适合露营氛围。", "clay", 110],
  ["market", "城市夜市", "夜市低声、人群和小店氛围，适合夜游夜宵。", "violet", 294],
];

const routeSoundscape = {
  half: "lake",
  day: "bamboo",
  two: "lake",
  family: "tea",
  couple: "lake",
  cycling: "bamboo",
  photo: "tea",
  rainy: "rain",
  night: "market",
  camping: "camp",
  weekend: "tea",
  holiday: "lake",
};

function currentFestivalTheme() {
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  if (month === 1 || month === 2) return ["春节/元宵氛围", "灯笼、花灯、夜游路线和新春活动推荐。"];
  if (month === 6) return ["端午氛围", "龙舟文化、白茶点心、亲水活动和节日市集推荐。"];
  if (month === 9 || (month === 10 && day <= 8)) return ["中秋/国庆氛围", "赏月、城市庆典、热门活动和夜游路线推荐。"];
  return ["日常城市氛围", "保持安静界面，仅根据天气、时间和路线轻量调整色彩与声景。"];
}

const pulseModes = [
  ["morning", "早晨", "早安，溧阳正在醒来", "显示日出动画，播放早安问候，推荐早餐和晨练路线。", ["汤包早面", "湖边晨练", "白茶热饮", "城区短步行"]],
  ["noon", "中午", "阳光正好，先找一顿舒服午餐", "显示阳光动画，推荐午餐、面馆、砂锅和室内活动。", ["砂锅午餐", "停车方便店", "室内茶文化", "亲子手作"]],
  ["afternoon", "下午", "下午适合咖啡、茶田和亲子活动", "推荐咖啡、茶田、亲子、拍照点和短路线。", ["茶田拍照", "白茶咖啡", "农场课堂", "乡路兜风"]],
  ["dusk", "傍晚", "傍晚去湖边散步和拍照", "推荐散步路线、黄昏拍照点和轻晚餐。", ["湖边黄昏", "老街散步", "轻晚餐", "人像拍照"]],
  ["night", "夜晚", "夜景模式开启，城区夜游上线", "自动切换夜景模式，推荐夜游和夜宵。", ["城区夜食", "甜品咖啡", "老街夜游", "小店音乐"]],
  ["late", "深夜", "深夜只推荐稳妥的24小时信息", "推荐24小时营业店铺、出行提醒和安全提示。", ["24小时便利", "夜间打车", "风险提醒", "电话确认"]],
];

const liveItems = [
  ["新店开业", "白茶咖啡窗口今天试营业"],
  ["活动发布", "周末亲子农场课堂开放报名"],
  ["用户打卡", "有人刚打卡了天目湖黄昏步道"],
  ["摄影作品", "茶田公路下午光线被收藏"],
  ["骑行路线", "环湖补给点新增打气筒"],
  ["热门讨论", "城区夜宵哪家砂锅更稳"],
  ["社区动态", "拼车板块新增实名认证提醒"],
];

const barrageMessages = [
  "今天茶田真漂亮",
  "新开的咖啡不错",
  "今天湖边风很舒服",
  "周末亲子活动还有名额",
  "夜宵砂锅热度上升",
  "高温天建议去竹海",
];

const dynamicRanks = [
  ["路线", "天目湖黄昏散步线", "↑12%", "正在上升"],
  ["餐厅", "城区砂锅小馆", "🔥爆火", "夜间热度最高"],
  ["咖啡", "白茶咖啡", "⭐新晋热门", "下午收藏上升"],
  ["活动", "亲子农场课堂", "↑8%", "报名增长"],
  ["打卡", "茶田公路转角", "↑15%", "摄影用户偏好"],
  ["社区", "骑行补给地图", "热门", "贡献内容增加"],
];

const homeEntries = [
  ["今日推荐", "#discover", "看今天适合先去哪里。"],
  ["天气与时间", "#pulse", "先根据天气和时段选玩法。"],
  ["AI本地助手", "#assistant", "直接问吃什么、去哪玩。"],
  ["美食入口", "#food", "早餐、面馆、砂锅、夜宵都在这。"],
  ["路线入口", "#planner", "半日、一日、两日路线直接生成。"],
  ["活动入口", "#activities", "周末、雨天、夜间活动都能看。"],
  ["地图入口", "#map", "只看公共点位和授权点位。"],
  ["社区入口", "#community", "美食、摄影、骑行、拼车一起看。"],
  ["商家入口", "#business", "店铺、活动、菜单和认领都在这里。"],
  ["今日热榜", "#hotrank", "路线、餐厅、活动和打卡点热度。"],
  ["AI城市日报", "#reports", "每天自动更新城市摘要。"],
];

const achievementStats = [
  ["新增商家", 18],
  ["新增活动", 12],
  ["新增路线", 9],
  ["新增用户", 286],
  ["新增打卡", 432],
  ["社区内容", 76],
];

const historicalFigures = [
  ["史崇", "今天由溧阳历史人物讲述地方文化与城市风骨。"],
  ["茶文化讲述者", "一杯白茶串起茶田、农产、乡路和现代生活。"],
  ["竹海讲解员", "南山竹海不只是景点，也是溧阳避暑与山地生活的入口。"],
  ["城市建设者", "从老地图到新城区，溧阳的生活半径一直在变化。"],
];

const timeMachineStories = [
  ["1950", "乡村肌理和传统集镇构成早期城市生活底色。"],
  ["1970", "产业与交通逐步发展，本地生活服务开始聚集。"],
  ["1990", "城市建设加速，湖山资源逐渐成为溧阳名片。"],
  ["2000", "天目湖、竹海和茶文化进入更多游客视野。"],
  ["2010", "周边短途游、民宿、农家乐和自驾路线快速增长。"],
  ["2020", "本地生活线上化，社区、商家和活动开始数字化。"],
  ["2026", "AI城市生活平台把吃、玩、逛、服务和治理连成城市OS。"],
];

const growthLevels = [
  ["Lv1", "城市信息平台"],
  ["Lv2", "城市生活平台"],
  ["Lv3", "智慧城市平台"],
  ["Lv4", "AI城市平台"],
  ["Lv5", "AI城市OS"],
];

const cockpitStats = [
  ["今日游客", 12860],
  ["今日活动", 36],
  ["今日路线", 128],
  ["今日热榜", 24],
  ["今日天气", 32],
  ["消费热度", 89],
  ["社区活跃度", 76],
  ["商家活跃度", 68],
];

const upgradeIssues = [
  {
    id: "quiet-pages",
    area: "页面没人看",
    title: "商家认证说明页访问偏低",
    signal: "过去7天移动端到达率 18%",
    severity: "medium",
    suggestion: "把企业认证、食品安全认证和官方活动认证做成更清晰的入口卡片。",
    mode: "auto",
  },
  {
    id: "route-clicks",
    area: "路线点击少",
    title: "摄影路线点击低于骑行路线",
    signal: "摄影路线点击率 3.8%，低于均值 42%",
    severity: "low",
    suggestion: "在晴天下午自动把茶田公路、湖边黄昏和城区夜景组合成摄影路线推荐。",
    mode: "auto",
  },
  {
    id: "merchant-expired",
    area: "商家资料过期",
    title: "部分商家营业信息超过30天未更新",
    signal: "12家商户资料需要复核",
    severity: "medium",
    suggestion: "提醒商家更新营业时间、电话、菜单和优惠，未确认前降低推荐权重。",
    mode: "review",
  },
  {
    id: "ended-events",
    area: "活动已结束",
    title: "本周活动中心仍展示过期活动",
    signal: "检测到3条活动结束时间早于今天",
    severity: "medium",
    suggestion: "自动下线过期活动，改为展示周末可报名活动和雨天室内活动。",
    mode: "auto",
  },
  {
    id: "community-risk",
    area: "社区内容风险",
    title: "招聘和拼车板块出现高风险关键词",
    signal: "命中保证金、拉人奖励、待认证车主",
    severity: "high",
    suggestion: "冻结高风险内容，要求实名认证和人工复核后再恢复展示。",
    mode: "review",
  },
  {
    id: "weather-mismatch",
    area: "天气不匹配",
    title: "高温日仍推荐长距离骑行",
    signal: "天气为高温时骑行路线收藏下降 31%",
    severity: "high",
    suggestion: "高温日自动把骑行、露营降权，把竹海避暑和室内茶文化活动提权。",
    mode: "auto",
  },
  {
    id: "feedback-cluster",
    area: "用户反馈集中",
    title: "用户集中反馈停车信息不够清楚",
    signal: "近7天 26 条反馈提到停车、导航和电话确认",
    severity: "medium",
    suggestion: "给地图点位增加停车提示、电话确认和出行提醒文案。",
    mode: "auto",
  },
];

const upgradeActions = [
  {
    id: "home-reco",
    title: "自动更新首页推荐内容",
    detail: "根据天气、时间和社区热度，将今日推荐改为湖边散步、白茶甜品、周末活动和风险提醒。",
    mode: "auto",
  },
  {
    id: "today-route",
    title: "自动调整今日路线",
    detail: "高温或大风时降低露营和长距离骑行权重，优先竹海避暑、城区小店和室内活动。",
    mode: "auto",
  },
  {
    id: "merchant-copy",
    title: "自动升级商家页面文案",
    detail: "为资料完整商家生成更清楚的门店介绍、活动说明、SEO标题和短视频脚本。",
    mode: "auto",
  },
  {
    id: "map-points",
    title: "自动补充地图点位信息",
    detail: "给美食、停车场、骑行点和亲子点补充导航、电话、收藏和用户评价入口。",
    mode: "auto",
  },
  {
    id: "hot-rank-rule",
    title: "热榜规则调整",
    detail: "把用户反馈质量和异常刷榜识别加入热榜计算，涉及排序公平，必须管理员确认。",
    mode: "review",
  },
  {
    id: "commercial-sort",
    title: "商业推荐排序变更",
    detail: "商业合作内容只能在明确标注后进入推荐位，不得伪装成普通推荐，需管理员确认。",
    mode: "review",
  },
  {
    id: "merchant-cert",
    title: "商家资质状态变更",
    detail: "企业认证、食品安全认证和官方活动状态变更必须由管理员确认后展示。",
    mode: "review",
  },
  {
    id: "legal-risk",
    title: "法律风险内容处理",
    detail: "涉及招聘诈骗、拼车安全、二手违禁品和用户封禁的内容需人工复核。",
    mode: "review",
  },
];

const productWeeklyItems = [
  ["本周问题总结", "低点击路线、过期活动、商家资料更新和社区风险是主要问题。"],
  ["用户行为分析", "用户更常打开美食、路线、地图和热榜，手机端更依赖快速入口。"],
  ["下周功能优化建议", "增加停车提示、电话确认、路线天气提示和商家资料更新提醒。"],
  ["页面改版建议", "把今日推荐、地图入口和活动中心在移动端前置，减少长滚动。"],
  ["商家运营建议", "提醒商家每周更新菜单、优惠、活动图和短视频脚本。"],
  ["风险治理建议", "招聘、拼车和二手交易继续强化实名、关键词识别和人工复核。"],
];

const colorMap = {
  lake: "#1f7481",
  green: "#426d45",
  tea: "#909d36",
  clay: "#b95d3b",
  gold: "#efbd58",
  blue: "#386f9d",
  violet: "#7562a8",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return chars[char];
  });
}

function formatDate() {
  const date = new Date();
  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekday}`;
}

function seasonLabel() {
  const month = new Date().getMonth() + 1;
  if ([3, 4, 5].includes(month)) return "春季";
  if ([6, 7, 8].includes(month)) return "夏季";
  if ([9, 10, 11].includes(month)) return "秋季";
  return "冬季";
}

function renderAiHome() {
  const profile = aiProfiles[state.weather];
  $("#today-date").textContent = formatDate();
  $("#season-label").textContent = seasonLabel();
  $("#ai-headline").textContent = profile.headline;
  $("#ai-summary").textContent = `${profile.summary}${timeNotes[state.time]}`;
  $("#heat-index").textContent = profile.heat;
  $("#new-count").textContent = 8 + profile.recs.length;
  $("#route-count").textContent = $("#route-type")?.options.length || Object.keys(routeTemplates).length;
  $("#home-entry-grid").innerHTML = homeEntries
    .map(
      ([title, href, detail]) => `
        <a class="home-entry" href="${href}">
          <strong>${title}</strong>
          <span>${detail}</span>
        </a>
      `,
    )
    .join("");
  $("#recommendation-strip").innerHTML = profile.recs
    .map(
      ([tag, title, detail]) => `
        <article class="rec-card">
          <span class="tag">${tag}</span>
          <h3>${title}</h3>
          <p>${detail}</p>
        </article>
      `,
    )
    .join("");
  renderWeatherEffects();
  renderAmbience();
  renderEmotion();
}

function currentPulseId() {
  const hour = new Date().getHours();
  if (hour < 6) return "late";
  if (hour < 11) return "morning";
  if (hour < 14) return "noon";
  if (hour < 18) return "afternoon";
  if (hour < 20) return "dusk";
  if (hour < 24) return "night";
  return "late";
}

function renderPulse(active = currentPulseId()) {
  const mode = pulseModes.find(([id]) => id === active) || pulseModes[0];
  $("#pulse-segments").innerHTML = pulseModes
    .map(([id, label]) => `<button class="segment ${id === active ? "active" : ""}" type="button" data-pulse="${id}">${label}</button>`)
    .join("");
  $("#pulse-stage").className = `pulse-stage ${mode[0]}`;
  $("#pulse-kicker").textContent = mode[1];
  $("#pulse-headline").textContent = mode[2];
  $("#pulse-copy").textContent = mode[3];
  $("#pulse-recos").innerHTML = mode[4]
    .map((item) => `<article class="pulse-reco"><span class="tag">${mode[1]}</span><h3>${item}</h3><p>由AI根据时间、天气和本地热度自动推荐。</p></article>`)
    .join("");
  document.body.classList.toggle("time-night", ["night", "late"].includes(mode[0]));
}

function renderWeatherEffects() {
  const effects = $("#weather-effects");
  const mode = currentPulseId();
  const weatherClass = {
    晴天: "sunny",
    雨天: "rainy",
    高温: "hot",
    大风: "wind",
  }[state.weather] || "sunny";
  effects.className = `weather-effects ${["night", "late"].includes(mode) ? "night" : weatherClass}`;
}

function suggestedSoundscape() {
  const mode = currentPulseId();
  if (["night", "late"].includes(mode)) return "market";
  if (state.weather === "雨天") return "rain";
  if (state.weather === "高温") return "cicada";
  if (state.weather === "大风") return "bamboo";
  return "lake";
}

function activeSoundscapeId() {
  return state.soundscape === "auto" ? suggestedSoundscape() : state.soundscape;
}

function renderAmbience() {
  const mode = state.audioMode;
  const active = activeSoundscapeId();
  const selected = soundscapes.find(([id]) => id === active) || soundscapes[1];
  $("#ambience-kicker").textContent = mode === "on" ? "已开启" : mode === "off" ? "已关闭" : "自动静音";
  $("#ambience-title-current").textContent = selected[1];
  $("#ambience-copy").textContent =
    mode === "on"
      ? `${selected[2]} 当前会播放轻量合成环境音。`
      : `${selected[2]} 当前不自动播放，点击试听或开启后才会发声。`;
  const festival = currentFestivalTheme();
  $("#festival-theme").textContent = `${festival[0]}：${festival[1]}`;
  $$("[data-audio-mode]").forEach((button) => button.classList.toggle("active", button.dataset.audioMode === mode));
  $("#soundscape-map").innerHTML = soundscapes
    .map(([id, title, detail, color]) => `
      <button class="soundscape-card ${id === state.soundscape || (state.soundscape === "auto" && id === "auto") ? "active" : ""}" type="button" data-soundscape="${id}" style="--accent:${colorMap[color] || colorMap.lake}">
        <h3>${title}</h3>
        <p>${detail}</p>
        <div class="sound-bars" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      </button>
    `)
    .join("");
}

function stopAmbience() {
  if (!ambientAudio) return;
  ambientAudio.nodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
    } catch {}
    try {
      if (typeof node.disconnect === "function") node.disconnect();
    } catch {}
  });
  ambientAudio.context.close?.();
  ambientAudio = null;
}

function playAmbience() {
  stopAmbience();
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    showToast("当前浏览器不支持环境音");
    return;
  }
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0.035;
  master.connect(context.destination);
  const [, , , , baseFreq] = soundscapes.find(([id]) => id === activeSoundscapeId()) || soundscapes[1];
  const nodes = [master];
  [baseFreq, baseFreq * 1.5, baseFreq * 2.01].forEach((freq, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = index === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    gain.gain.value = index === 0 ? 0.5 : 0.16;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    nodes.push(osc, gain);
  });
  if (activeSoundscapeId() === "rain") {
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) data[i] = (Math.random() * 2 - 1) * 0.12;
    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    noise.loop = true;
    noiseGain.gain.value = 0.3;
    noise.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    nodes.push(noise, noiseGain);
  }
  ambientAudio = { context, nodes };
}

function renderLiveFeed(pushRandom = false) {
  const list = [...liveItems];
  if (pushRandom) {
    list.unshift(["实时更新", liveItems[Math.floor(Math.random() * liveItems.length)][1]]);
  }
  $("#live-feed").innerHTML = list
    .slice(0, 7)
    .map(
      ([tag, detail], index) => `
        <article class="live-item">
          <span class="tag">${tag}</span>
          <div>
            <h3>${detail}</h3>
            <p>无需刷新，AI会把城市动态推到首页。</p>
          </div>
          <span class="live-time">${index + 1}分钟前</span>
        </article>
      `,
    )
    .join("");
}

function renderAchievements() {
  $("#achievement-grid").innerHTML = achievementStats
    .map(([label, value], index) => {
      const bump = (Date.now() / 1000 + index * 7) % 19;
      return `<article class="achievement-card"><strong>${Math.round(value + bump)}</strong><span>${label}</span></article>`;
    })
    .join("");
}

function renderDynamicRanks() {
  $("#dynamic-rank-list").innerHTML = dynamicRanks
    .map(([tag, title, trend, detail]) => {
      const trendClass = trend.includes("爆火") ? "trend-hot" : trend.includes("新晋") ? "trend-new" : "trend-up";
      return `
        <article class="rank-row">
          <span class="tag">${tag}</span>
          <div>
            <h3>${title}</h3>
            <p>${detail}</p>
          </div>
          <span class="${trendClass}">${trend}</span>
        </article>
      `;
    })
    .join("");
}

function pushBarrage() {
  const container = $("#city-barrage");
  if (!container) return;
  const item = document.createElement("div");
  item.className = "barrage-item";
  item.style.top = `${Math.floor(Math.random() * 84)}px`;
  item.textContent = barrageMessages[Math.floor(Math.random() * barrageMessages.length)];
  container.appendChild(item);
  setTimeout(() => item.remove(), 13000);
}

function fillTemplate(text, data) {
  return text
    .replaceAll("{start}", data.start)
    .replaceAll("{people}", data.people)
    .replaceAll("{budget}", data.budget)
    .replaceAll("{interest}", data.interest);
}

function generateRoute(formData) {
  const type = formData.get("type");
  const data = {
    start: escapeHtml(formData.get("start") || "溧阳城区"),
    people: escapeHtml(formData.get("people") || "2"),
    budget: escapeHtml(formData.get("budget")),
    duration: escapeHtml(formData.get("duration")),
    interest: escapeHtml(formData.get("interest")),
  };
  const label = $("#route-type").selectedOptions[0].textContent;
  const steps = routeTemplates[type].map(([time, title, detail]) => [
    fillTemplate(time, data),
    fillTemplate(title, data),
    fillTemplate(detail, data),
  ]);
  if (routeSoundscape[type]) {
    state.soundscape = routeSoundscape[type];
    localStorage.setItem("liyangSoundscape", state.soundscape);
    renderAmbience();
    if (state.audioMode === "on") playAmbience();
  }
  const thinkingSteps = ["分析天气", "分析人数", "分析预算", "分析兴趣", "分析活动", "生成路线", "动态绘制路线图"];
  $("#route-thinking").innerHTML = thinkingSteps
    .map((step, index) => `<span class="thinking-step" style="animation-delay:${index * 0.08}s">${step}完成</span>`)
    .join("");
  $("#route-output").innerHTML = `
    <div class="route-title">
      <h3>${label} · ${data.interest}</h3>
      <strong>${data.start} / ${data.people}人 / ${data.budget}</strong>
    </div>
    ${steps
      .map(
        ([time, title, detail]) => `
          <article class="route-step">
            <span class="tag">${time}</span>
            <div>
              <h3>${title}</h3>
              <p>${detail}</p>
            </div>
          </article>
        `,
      )
      .join("")}
  `;
}

function answerQuestion(question) {
  const q = question.toLowerCase();
  if (q.includes("好吃") || q.includes("吃什么")) return "今天可以按时间选：早餐看汤包早面，午餐选砂锅或面馆，下午适合白茶甜品和咖啡，夜间推荐城区夜食线。";
  if (q.includes("散步")) return "推荐天目湖周边步道、城区公园和老街短线。晴天傍晚优先湖边，雨天改城区咖啡加短步行。";
  if (q.includes("停车")) return "停车优先看游客停车点、商家门口车位和游客服务中心周边点位；平台只展示公共或授权停车信息，出发前建议电话确认。";
  if (q.includes("附近")) return "附近推荐会优先在本机使用定位，筛选附近商家、活动、停车场和公共服务点，不默认上传或公开你的实时位置。";
  if (q.includes("拍照")) return "推荐茶田公路、竹林边缘、湖边栈道和乡路咖啡窗口。下午四点后光线更柔和。";
  if (q.includes("农家乐")) return "农家乐优先看是否有停车、儿童座椅、明码菜单和食品安全认证；竹海山脚和茶田周边更适合周末中午。";
  if (q.includes("露营")) return "优先选择可停车、有卫生间、可查询风力的轻露营点。高温和大风天建议改成湖边野餐或室内活动。";
  if (q.includes("孩子") || q.includes("亲子")) return "亲子优先农场自然课、茶文化手作、短步道和甜品店。路线不要超过三个点。";
  if (q.includes("约会")) return "约会适合白茶甜品、湖边黄昏、城区夜食和轻音乐小店。动线短比点位多更重要。";
  if (q.includes("周末") || q.includes("活动")) return "周末优先看茶文化体验、亲子农场、市集、露营和小店音乐活动；雨天自动把室内手作排到前面。";
  if (q.includes("今天")) return `${aiProfiles[state.weather].headline}。${aiProfiles[state.weather].summary}`;
  if (q.includes("夜")) return "夜间推荐城区夜食、甜品、老街散步和小店活动。骑行和水边长停留要看风力。";
  return "可以按天气、时间、预算和人数组合推荐。今天我会优先把低门槛、好停车、能顺路吃饭的点排在前面。";
}

function addMessage(role, text) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;
  $("#chat-window").appendChild(item);
  $("#chat-window").scrollTop = $("#chat-window").scrollHeight;
}

function renderDiscover() {
  $("#discover-grid").innerHTML = discoverData[state.discover]
    .map(
      ([tag, title, detail, color]) => `
        <article class="info-card" style="--accent:${colorMap[color]}">
          <span class="tag">${tag}</span>
          <h3>${title}</h3>
          <p>${detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderFoodCategories() {
  const categories = ["全部", ...new Set(foods.map(([category]) => category))];
  $("#food-categories").innerHTML = categories
    .map((category) => `<button class="chip ${category === state.food ? "active" : ""}" type="button" data-food="${category}">${category}</button>`)
    .join("");
}

function renderFoods() {
  const visible = state.food === "全部" ? foods : foods.filter(([category]) => category === state.food);
  $("#food-list").innerHTML = visible
    .map(
      ([category, title, detail, score]) => `
        <article class="food-item">
          <span class="tag">${category}</span>
          <div>
            <h3>${title}</h3>
            <p>${detail}</p>
          </div>
          <span class="food-score">${score}</span>
          <div class="food-actions">
            <button class="small-action" type="button" data-food-action="导航" data-title="${title}">导航</button>
            <button class="small-action" type="button" data-food-action="电话" data-title="${title}">电话</button>
            <button class="small-action" type="button" data-food-action="收藏" data-title="${title}">收藏</button>
            <button class="small-action" type="button" data-food-action="评价" data-title="${title}">评价</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderActivities() {
  $("#activity-grid").innerHTML = activityData[state.activity]
    .map(
      ([tag, title, detail], index) => `
        <article class="info-card" style="--accent:${Object.values(colorMap)[index + 1]}">
          <span class="tag">${tag}</span>
          <h3>${title}</h3>
          <p>${detail}</p>
        </article>
      `,
    )
    .join("");
}

const savedCommunity = JSON.parse(localStorage.getItem("liyangCityCommunity") || "[]");
let communityPosts = [...savedCommunity, ...seedCommunity];

function renderCommunityCategories() {
  const categories = ["全部", "美食", "摄影", "骑行", "露营", "钓鱼", "宠物", "亲子", "二手", "招聘", "拼车"];
  $("#community-categories").innerHTML = categories
    .map((category) => `<button class="chip ${category === state.community ? "active" : ""}" type="button" data-community="${category}">${category}</button>`)
    .join("");
}

function renderCommunity() {
  const visible =
    state.community === "全部" ? communityPosts : communityPosts.filter(([category]) => category === state.community);
  $("#community-list").innerHTML = visible
    .map(
      ([category, title, detail, status]) => `
        <article class="community-item">
          <span class="tag">${escapeHtml(category)}</span>
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(detail)}</p>
          </div>
          <span class="community-status">${escapeHtml(status)}</span>
        </article>
      `,
    )
    .join("");
}

function renderMapFilters() {
  const types = ["全部", ...mapPins.map(([type]) => type)];
  $("#map-filters").innerHTML = types
    .map((type) => `<button class="chip ${type === state.map ? "active" : ""}" type="button" data-map="${type}">${type}</button>`)
    .join("");
}

function renderMap() {
  const visible = state.map === "全部" ? mapPins : mapPins.filter(([type]) => type === state.map);
  $("#map-canvas").innerHTML = `
    <div class="map-heat" style="left:40%;top:58%" aria-hidden="true"></div>
    <div class="map-heat" style="left:66%;top:42%;animation-delay:.9s" aria-hidden="true"></div>
    <div class="map-heat" style="left:52%;top:30%;animation-delay:1.7s" aria-hidden="true"></div>
    <div class="map-route" aria-hidden="true"></div>
    ${visible
      .map(
        ([type, title, x, y, color]) => `
          <button class="map-pin" type="button" style="left:${x}%;top:${y}%;--pin-color:${colorMap[color]}" aria-label="${title}">
            ${type.slice(0, 1)}
            <span>${title}<br>${type}<br>公共/授权点位，可生成导航建议</span>
          </button>
        `,
      )
      .join("")}
  `;
}

function speakText(text, lang = "zh-CN") {
  if (!("speechSynthesis" in window)) {
    showToast("当前浏览器不支持语音播报");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang === "zh-CN" ? 1 : 0.92;
  window.speechSynthesis.speak(utterance);
}

function welcomeText(lang) {
  const texts = {
    "zh-CN": "欢迎来到文明城市溧阳。我是溧阳AI生活助手。您可以问我今天去哪玩、附近有什么好吃的、周末有哪些活动、怎么规划一日游路线。请问有什么可以帮您的？",
    "en-US": "Welcome to Liyang. I am your AI city life assistant. You can ask me where to go, what to eat, what events are happening, or how to plan a one day route.",
    "ja-JP": "文明都市、溧陽へようこそ。私は溧陽AI生活アシスタントです。観光、食事、週末イベント、日帰りルートについて質問できます。",
    "ko-KR": "문명 도시 리양에 오신 것을 환영합니다. 저는 리양 AI 생활 도우미입니다. 여행, 맛집, 주말 행사, 하루 코스를 물어보세요.",
  };
  return texts[lang] || texts["zh-CN"];
}

function renderGuideRoles(active = "guide") {
  const role = guideRoles.find(([id]) => id === active) || guideRoles[0];
  $("#guide-role-kicker").textContent = role[1];
  $("#guide-role-title").textContent = role[2];
  $("#guide-role-copy").textContent = role[3];
  $("#guide-avatar").textContent = role[1].slice(2, 3) || "溧";
  $("#guide-roles").innerHTML = guideRoles
    .map(([id, name]) => `<button class="${id === role[0] ? "active" : ""}" type="button" data-guide-role="${id}">${name}</button>`)
    .join("");
}

function renderCulture(active = "lake") {
  const theme = cultureThemes.find(([id]) => id === active) || cultureThemes[0];
  $("#culture-themes").innerHTML = cultureThemes
    .map(([id, name]) => `<button class="chip ${id === active ? "active" : ""}" type="button" data-culture="${id}">${name}</button>`)
    .join("");
  $("#culture-feature").innerHTML = `
    <span class="tag">${theme[1]}</span>
    <h3>${theme[2]}</h3>
    <p>${theme[3]} AI可生成历史人物介绍、城市故事讲解、短视频文案、图文内容、语音讲解和首页壁纸说明。</p>
  `;
  $("#culture-grid").innerHTML = [
    ["历史内容", "溧阳历史、名人、老照片、老地图和地方传说。"],
    ["城市故事", "天目湖发展故事、南山竹海文化、白茶文化和城市变化。"],
    ["AI生成", "自动生成图文、短视频文案、语音讲解和研学脚本。"],
    ["壁纸切换", "天目湖、竹海、白茶、历史人物、城市夜景、乡村田园主题。"],
  ]
    .map(([title, detail]) => `<article class="mini-card"><h3>${title}</h3><p>${detail}</p></article>`)
    .join("");
  renderHistoricalFigure();
  renderTimeMachine();
}

function renderHistoricalFigure() {
  const person = historicalFigures[Math.floor((new Date().getDate() + new Date().getHours()) % historicalFigures.length)];
  $("#historical-figure").innerHTML = `
    <span class="tag">AI历史人物复活计划</span>
    <h3>${person[0]}</h3>
    <p>${person[1]}</p>
    <p>可语音讲述历史故事、城市发展、文化知识和地方记忆。</p>
  `;
}

function renderTimeMachine(active = "2026") {
  $("#timeline-years").innerHTML = timeMachineStories
    .map(([year]) => `<button class="${year === active ? "active" : ""}" type="button" data-year="${year}">${year}</button>`)
    .join("");
  const story = timeMachineStories.find(([year]) => year === active) || timeMachineStories.at(-1);
  $("#timeline-story").innerHTML = `<h3>${story[0]} 年</h3><p>${story[1]}</p><p>AI可展示历史照片、城市变化、建筑变化、产业变化、人口变化和文化变化。</p>`;
}

function renderCompanions(active = "city") {
  const option = companionOptions.find(([id]) => id === active) || companionOptions[0];
  $("#companion-name").textContent = option[1];
  $("#companion-message").textContent = option[2];
  $("#companion-avatar").textContent = option[1].includes("小溧") ? "小溧" : option[1].slice(0, 2);
  $("#companion-options").innerHTML = companionOptions
    .map(([id, name]) => `<button class="${id === option[0] ? "active" : ""}" type="button" data-companion="${id}">${name}</button>`)
    .join("");
}

function renderPageFactory(prompt) {
  const raw = escapeHtml(prompt || "我想做一个溧阳夜宵地图");
  const isPublic = /首页|热榜|商业排序|公共|平台/.test(raw);
  const title = raw.replace(/^我想/, "").replace(/[。.!！]$/g, "") || "溧阳新页面";
  $("#factory-output").innerHTML = `
    <article class="factory-card">
      <span class="factory-status">${isPublic ? "公共改动：需管理员确认" : "个人草稿：可生成"}</span>
      <h3>${title}</h3>
      <p>模块布局：推荐卡片、地图点位、社区入口、SEO文案和分享文案。</p>
      <p>SEO标题：${title}｜溧阳AI城市生活平台</p>
      <p>分享文案：我用AI生成了一个${title}，可以继续完善为个人页面或提交平台审核。</p>
    </article>
  `;
}

function showToast(text) {
  const old = $(".toast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}

function renderMerchant(formData) {
  const name = escapeHtml(formData.get("name") || "本地商家");
  const type = escapeHtml(formData.get("type") || "本地商家");
  const feature = escapeHtml(formData.get("feature") || "本地特色");
  const promo = escapeHtml(formData.get("promo") || "本周优惠活动");
  const phone = escapeHtml(formData.get("phone") || "待补充");
  const address = escapeHtml(formData.get("address") || "待补充");
  const hours = escapeHtml(formData.get("hours") || "待补充");
  const parking = escapeHtml(formData.get("parking") || "建议电话确认");
  const friendly = escapeHtml(formData.get("friendly") || "需提前咨询");
  $("#merchant-output").innerHTML = `
    <article class="generated-block">
      <h3>店铺主页介绍</h3>
      <p>${name}是一家面向溧阳本地居民和周边游客的${type}，主打${feature}。地址：${address}。营业时间：${hours}。电话：${phone}。</p>
    </article>
    <article class="generated-block">
      <h3>菜单/产品页面</h3>
      <p>推荐展示招牌产品、价格区间、适合人群、${friendly}、停车信息：${parking}。</p>
    </article>
    <article class="generated-block">
      <h3>活动/优惠页面</h3>
      <p>${promo}。建议标注预约电话、停车信息、适用日期、是否商业推荐和退款规则。</p>
    </article>
    <article class="generated-block">
      <h3>SEO内容</h3>
      <p>溧阳${type}推荐｜${name}｜${feature}｜适合周末、亲子、朋友聚会和本地生活发现。</p>
    </article>
    <article class="generated-block">
      <h3>短视频脚本</h3>
      <p>开头3秒展示门头和招牌产品，中段展示${feature}，结尾提示${promo}和到店方式。</p>
    </article>
    <article class="generated-block">
      <h3>招聘页面</h3>
      <p>可生成岗位说明、薪资范围、工作时间和防骗提醒；招聘发布前需实名与风险审核。</p>
    </article>
    <div class="platform-copies">
      <article class="generated-block"><h3>百度推广</h3><p>搜索溧阳${type}，来${name}体验${feature}。</p></article>
      <article class="generated-block"><h3>抖音推广</h3><p>周末来溧阳，这家${type}把${feature}安排好了。</p></article>
      <article class="generated-block"><h3>微信推广</h3><p>${name}本周活动：${promo}，适合转发给家人朋友。</p></article>
      <article class="generated-block"><h3>小红书推广</h3><p>溧阳周末小攻略：${name}，关键词是${feature}。</p></article>
    </div>
  `;
}

function renderJobs(formData) {
  const role = escapeHtml(formData.get("role") || "服务业");
  const experience = escapeHtml(formData.get("experience") || "本地生活经验");
  $("#jobs-output").innerHTML = `
    <article class="job-card">
      <h3>${role}岗位推荐</h3>
      <p>根据“${experience}”，推荐关注本地商家运营、门店服务、活动执行和短视频助理岗位。</p>
    </article>
    <article class="job-card">
      <h3>AI简历摘要</h3>
      <p>熟悉溧阳本地生活场景，有${experience}，可胜任${role}相关岗位。</p>
    </article>
    <article class="job-card">
      <h3>求职防骗提醒</h3>
      <p>禁止刷单兼职、保证金、高薪拉人、资金盘、虚拟币推广和非法贷款岗位。</p>
    </article>
  `;
}

function completedTasks() {
  return JSON.parse(localStorage.getItem("liyangCompletedTasks") || "[]");
}

function renderTasks() {
  const completed = completedTasks();
  const points = Number(localStorage.getItem("liyangPoints") || "120");
  $("#points-total").textContent = points;
  $("#task-list").innerHTML = cityTasks
    .map(([title, detail, score], index) => {
      const done = completed.includes(index);
      return `
        <article class="task-item">
          <div>
            <h3>${title}</h3>
            <p>${detail}，完成后获得 ${score} 积分。</p>
          </div>
          <button type="button" data-task="${index}" ${done ? "disabled" : ""}>${done ? "已完成" : "完成任务"}</button>
        </article>
      `;
    })
    .join("");
}

function renderAlerts() {
  const weatherAlerts = {
    晴天: [
      ["出行提醒", "晴天适合户外，但午后注意防晒和补水。", "low", ["提醒电话确认", "推荐湖边步道"]],
      ["停车提醒", "热门景区和湖边停车可能紧张。", "medium", ["提前导航", "错峰出发"]],
    ],
    雨天: [
      ["暴雨/湿滑提醒", "降低山路、露营和骑行推荐，优先室内活动。", "high", ["弹窗提醒", "改室内路线"]],
      ["活动取消提醒", "户外市集和露营活动需电话确认。", "medium", ["电话确认", "更新日报"]],
    ],
    高温: [
      ["高温提醒", "减少长时间户外，推荐竹海避暑、咖啡馆和室内茶文化。", "high", ["弹窗提醒", "降低骑行权重"]],
      ["亲子提醒", "亲子活动优先选择有遮阴、空调和补水点的场所。", "medium", ["推荐室内活动", "路线少走路"]],
    ],
    大风: [
      ["大风提醒", "降低露营、骑行和湖边长时间停留推荐。", "high", ["弹窗提醒", "改城区路线"]],
      ["拼车风险", "大风天气拼车需核验车主和车辆信息。", "medium", ["实名认证", "车辆认证"]],
    ],
  };
  const alerts = weatherAlerts[state.weather] || weatherAlerts["晴天"];
  $("#alert-list").innerHTML = alerts
    .map(([title, detail, level, actions]) => `
      <article class="alert-item" style="--accent:${level === "high" ? "#b95d3b" : level === "medium" ? "#efbd58" : "#426d45"}">
        <strong>${title}</strong>
        <p>${detail}</p>
        <div class="alert-actions">${actions.map((item) => `<span>${item}</span>`).join("")}</div>
      </article>
    `)
    .join("");
}

function renderPublicServices() {
  $("#public-service-grid").innerHTML = publicServices
    .map(([title, detail]) => `<article class="service-card"><h3>${title}</h3><p>${detail}</p></article>`)
    .join("");
}

function renderGrowth() {
  $("#growth-levels").innerHTML = growthLevels
    .map(([level, name], index) => `
      <article class="growth-card ${index === growthLevels.length - 1 ? "active" : ""}">
        <h3>${level}</h3>
        <p>${name}</p>
      </article>
    `)
    .join("");
}

function renderEmotion() {
  const interests = [
    ["亲子", "你经常查看亲子和农场内容，首页会优先推荐少走路、有卫生间、好停车的路线。"],
    ["夜宵", "你关注夜游和夜宵，AI会在夜间自动提高城区小店和砂锅热度。"],
    ["摄影", "你偏好拍照点，下午会优先展示茶田、公路、湖边黄昏和城市夜景。"],
  ];
  $("#emotion-output").innerHTML = interests
    .map(([title, detail]) => `<article class="emotion-card"><h3>${title}偏好</h3><p>${detail}</p></article>`)
    .join("");
}

function applyTheme() {
  document.body.classList.remove("theme-blue", "theme-night", "theme-tea", "font-large", "font-compact");
  const theme = $("#theme-color").value;
  const scale = $("#font-scale").value;
  if (theme !== "default") document.body.classList.add(`theme-${theme}`);
  if (scale !== "normal") document.body.classList.add(`font-${scale}`);
  localStorage.setItem("liyangTheme", theme);
  localStorage.setItem("liyangFontScale", scale);
}

function restoreTheme() {
  const theme = localStorage.getItem("liyangTheme") || "default";
  const scale = localStorage.getItem("liyangFontScale") || "normal";
  $("#theme-color").value = theme;
  $("#font-scale").value = scale;
  applyTheme();
}

function renderCockpit() {
  $("#cockpit-grid").innerHTML = cockpitStats
    .map(([label, value], index) => {
      const changing = typeof value === "number" ? Math.round(value + ((Date.now() / 1000 + index * 5) % 17)) : value;
      const suffix = ["今日天气", "消费热度", "社区活跃度", "商家活跃度"].includes(label) && typeof changing === "number" ? "%" : "";
      return `<article class="cockpit-card"><strong>${changing}${suffix}</strong><span>${label}</span></article>`;
    })
    .join("");
}

function auditContent(formData) {
  const type = escapeHtml(formData.get("type"));
  const content = String(formData.get("content") || "");
  const highRiskWords = ["保证金", "刷单", "资金盘", "虚拟币", "拉人", "贷款", "高薪兼职", "先交"];
  const illegalGoods = ["假货", "盗版", "违禁", "非法交易"];
  const riskHits = [...highRiskWords, ...illegalGoods].filter((word) => content.includes(word));
  const level = riskHits.length ? "高风险" : "低风险";
  const advice = riskHits.length
    ? "建议自动下架并进入人工复核；涉及招聘、拼车、二手交易时要求实名认证。"
    : "可进入待发布队列，同时保留举报、投诉和追溯记录。";
  $("#audit-result").innerHTML = `
    <p><strong class="${riskHits.length ? "risk-high" : "risk-low"}">${level}</strong> · ${type}</p>
    <p>命中规则：${riskHits.length ? riskHits.map(escapeHtml).join("、") : "未命中高风险词"}</p>
    <p>${advice}</p>
  `;
}

function renderReports() {
  const profile = aiProfiles[state.weather];
  $("#daily-report").innerHTML = [
    ["今日活动", profile.recs[2][1], profile.recs[2][2]],
    ["新增店铺", "白茶咖啡和夜食小店", "建议进入今日推荐和美食地图。"],
    ["热门路线", profile.recs[0][1], profile.recs[0][2]],
    ["天气提醒", state.weather, profile.summary],
    ["社区热点", profile.recs[3][1], profile.recs[3][2]],
  ]
    .map(
      ([tag, title, detail]) => `
        <article class="report-item">
          <strong>${tag}</strong>
          <div>
            <h3>${title}</h3>
            <p>${detail}</p>
          </div>
        </article>
      `,
    )
    .join("");

  $("#weekly-report").innerHTML = [
    ["最火路线", "竹海茶田一日线"],
    ["最火活动", "周末茶文化体验"],
    ["最火餐厅", "城区砂锅小馆"],
    ["最火社区内容", "骑行补给地图共建"],
  ]
    .map(
      ([tag, title]) => `
        <article class="report-item">
          <strong>${tag}</strong>
          <div>
            <h3>${title}</h3>
            <p>自动汇总收藏、搜索、发布和天气联动信号。</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function upgradeDecisionMap() {
  return JSON.parse(localStorage.getItem("liyangUpgradeDecisions") || "{}");
}

function saveUpgradeDecision(id, status) {
  const decisions = upgradeDecisionMap();
  decisions[id] = status;
  localStorage.setItem("liyangUpgradeDecisions", JSON.stringify(decisions));
}

function renderUpgradeSystem() {
  const profile = aiProfiles[state.weather];
  const issues = upgradeIssues.map((issue) => {
    if (issue.id !== "weather-mismatch") return issue;
    return {
      ...issue,
      title: `${state.weather}场景下的推荐匹配度需要复核`,
      signal: `当前首页推荐为“${profile.headline}”，需同步检查路线、活动和美食排序`,
    };
  });
  const decisions = upgradeDecisionMap();
  const autoCount = upgradeActions.filter((item) => item.mode === "auto").length;
  const reviewCount = upgradeActions.filter((item) => item.mode === "review").length;
  const riskCount = issues.filter((item) => item.severity === "high").length;

  $("#upgrade-auto-count").textContent = autoCount;
  $("#upgrade-review-count").textContent = reviewCount;
  $("#upgrade-risk-count").textContent = riskCount;
  $("#upgrade-week-count").textContent = state.upgradeRun + 1;

  $("#upgrade-issues").innerHTML = issues
    .map(
      (item) => `
        <article class="issue-item">
          <div class="issue-meta">
            <span class="severity ${item.severity}">${item.severity === "high" ? "高" : item.severity === "medium" ? "中" : "低"}风险</span>
            <span class="tag">${item.area}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.signal}</p>
          <p>${item.suggestion}</p>
        </article>
      `,
    )
    .join("");

  $("#upgrade-actions").innerHTML = upgradeActions
    .map((item) => {
      const status = decisions[item.id] || (item.mode === "auto" ? "待自动应用" : "待管理员确认");
      return `
        <article class="action-item">
          <div class="action-meta">
            <span class="mode-badge ${item.mode}">${item.mode === "auto" ? "自动更新草案" : "人工确认"}</span>
            <span class="action-status">${status}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.detail}</p>
          <div class="action-controls">
            <button class="approve-action" type="button" data-upgrade-approve="${item.id}">${item.mode === "auto" ? "应用草案" : "管理员确认"}</button>
            <button class="defer-action" type="button" data-upgrade-defer="${item.id}">暂缓</button>
          </div>
        </article>
      `;
    })
    .join("");

  $("#product-weekly-report").innerHTML = productWeeklyItems
    .map(
      ([title, detail]) => `
        <article class="policy-card">
          <strong>${title}</strong>
          <p>${detail}</p>
        </article>
      `,
    )
    .join("");
}

function setActive(selector, attr, value) {
  $$(selector).forEach((button) => button.classList.toggle("active", button.dataset[attr] === value));
}

function bindEvents() {
  $$("[data-weather]").forEach((button) => {
    button.addEventListener("click", () => {
      state.weather = button.dataset.weather;
      setActive("[data-weather]", "weather", state.weather);
      renderAiHome();
      renderReports();
      renderUpgradeSystem();
      renderAlerts();
    });
  });

  $$("[data-time]").forEach((button) => {
    button.addEventListener("click", () => {
      state.time = button.dataset.time;
      setActive("[data-time]", "time", state.time);
      renderAiHome();
    });
  });

  $("#pulse-segments").addEventListener("click", (event) => {
    const button = event.target.closest("[data-pulse]");
    if (!button) return;
    renderPulse(button.dataset.pulse);
    renderWeatherEffects();
  });

  $("#push-live-item").addEventListener("click", () => {
    renderLiveFeed(true);
    pushBarrage();
  });

  $$("[data-audio-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.audioMode = button.dataset.audioMode;
      localStorage.setItem("liyangAudioMode", state.audioMode);
      renderAmbience();
      if (state.audioMode === "on") {
        playAmbience();
        showToast("环境音已开启");
      } else {
        stopAmbience();
        showToast(state.audioMode === "auto" ? "自动模式：保持静音，按场景选择声景" : "环境音已关闭");
      }
    });
  });

  $("#soundscape-map").addEventListener("click", (event) => {
    const button = event.target.closest("[data-soundscape]");
    if (!button) return;
    state.soundscape = button.dataset.soundscape;
    localStorage.setItem("liyangSoundscape", state.soundscape);
    renderAmbience();
    if (state.audioMode === "on") playAmbience();
  });

  $("#play-ambience").addEventListener("click", () => {
    playAmbience();
    showToast("正在试听今日溧阳环境音");
  });

  $("#stop-ambience").addEventListener("click", () => {
    stopAmbience();
    showToast("环境音已停止");
  });

  $("#planner-form").addEventListener("submit", (event) => {
    event.preventDefault();
    generateRoute(new FormData(event.currentTarget));
  });

  $$(".quick-questions button").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;
      addMessage("user", question);
      addMessage("ai", answerQuestion(question));
    });
  });

  $("#assistant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#assistant-input");
    const question = input.value.trim();
    if (!question) return;
    addMessage("user", question);
    addMessage("ai", answerQuestion(question));
    input.value = "";
  });

  $$("[data-discover]").forEach((button) => {
    button.addEventListener("click", () => {
      state.discover = button.dataset.discover;
      setActive("[data-discover]", "discover", state.discover);
      renderDiscover();
    });
  });

  $("#food-categories").addEventListener("click", (event) => {
    const button = event.target.closest("[data-food]");
    if (!button) return;
    state.food = button.dataset.food;
    renderFoodCategories();
    renderFoods();
  });

  $("#food-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-food-action]");
    if (!button) return;
    showToast(`${button.dataset.title}：${button.dataset.foodAction}已记录`);
  });

  $("#food-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const time = formData.get("time");
    const people = formData.get("people");
    const budget = formData.get("budget");
    const best = foods
      .filter(([category]) => (time === "早餐" ? category === "早餐" : true))
      .sort((a, b) => b[3] - a[3])
      .slice(0, 2)
      .map(([, title]) => title)
      .join("、");
    $("#food-result").textContent = `${people}人，${budget}，${state.weather}：推荐 ${best}。`;
  });

  $$("[data-activity]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activity = button.dataset.activity;
      setActive("[data-activity]", "activity", state.activity);
      renderActivities();
    });
  });

  $("#community-categories").addEventListener("click", (event) => {
    const button = event.target.closest("[data-community]");
    if (!button) return;
    state.community = button.dataset.community;
    renderCommunityCategories();
    renderCommunity();
  });

  $("#map-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-map]");
    if (!button) return;
    state.map = button.dataset.map;
    renderMapFilters();
    renderMap();
  });

  $("#map-canvas").addEventListener("click", (event) => {
    const pin = event.target.closest(".map-pin");
    if (!pin) return;
    showToast(`${pin.getAttribute("aria-label")}：仅展示公共点位，不展示个人位置`);
  });

  $("#play-welcome").addEventListener("click", () => {
    const lang = $("#voice-language").value;
    const text = welcomeText(lang);
    $("#voice-status").textContent = text;
    speakText(text, lang);
  });

  $("#toggle-voice").addEventListener("click", () => {
    const current = localStorage.getItem("liyangVoiceMuted") === "true";
    localStorage.setItem("liyangVoiceMuted", String(!current));
    $("#toggle-voice").textContent = current ? "关闭自动语音" : "开启自动语音";
    $("#voice-status").textContent = current ? "自动语音已开启。" : "自动语音已关闭，后续进入不会主动播报。";
    if (!current && "speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  $$(".wake-phrases button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".wake-phrases button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const answer = "我在，请问有什么可以帮助您的？";
      $("#voice-status").textContent = `${button.dataset.wake}：${answer}`;
      addMessage("user", button.dataset.wake);
      addMessage("ai", answer);
      speakText(answer, $("#voice-language").value);
    });
  });

  $("#guide-roles").addEventListener("click", (event) => {
    const button = event.target.closest("[data-guide-role]");
    if (!button) return;
    renderGuideRoles(button.dataset.guideRole);
  });

  $("#guide-speak").addEventListener("click", () => {
    const text = `${$("#guide-role-kicker").textContent}。${$("#guide-role-title").textContent}${$("#guide-role-copy").textContent}`;
    speakText(text, "zh-CN");
  });

  $("#culture-themes").addEventListener("click", (event) => {
    const button = event.target.closest("[data-culture]");
    if (!button) return;
    renderCulture(button.dataset.culture);
  });

  $("#timeline-years").addEventListener("click", (event) => {
    const button = event.target.closest("[data-year]");
    if (!button) return;
    renderTimeMachine(button.dataset.year);
  });

  $("#companion-options").addEventListener("click", (event) => {
    const button = event.target.closest("[data-companion]");
    if (!button) return;
    renderCompanions(button.dataset.companion);
  });

  $("#companion-remind").addEventListener("click", () => {
    const messages = companionOptions.map(([, , message]) => message);
    const message = messages[Math.floor(Math.random() * messages.length)];
    $("#companion-message").textContent = message;
    showToast("AI伙伴已生成提醒");
  });

  $("#page-factory-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderPageFactory(new FormData(event.currentTarget).get("prompt"));
  });

  $("#assistant-image").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addMessage("user", `上传图片：${file.name}`);
    addMessage("ai", "已收到图片。正式接入后可识别菜单、店铺门头、活动海报和路线照片；当前演示会转为本地生活建议。");
    event.target.value = "";
  });

  $("#voice-button").addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage("ai", "当前浏览器不支持语音识别，可继续用文本提问。");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      $("#assistant-input").value = text;
      addMessage("user", text);
      addMessage("ai", answerQuestion(text));
    };
    recognition.start();
  });

  $("#merchant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderMerchant(new FormData(event.currentTarget));
  });

  $("#jobs-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderJobs(new FormData(event.currentTarget));
  });

  $("#task-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-task]");
    if (!button) return;
    const id = Number(button.dataset.task);
    const completed = completedTasks();
    if (completed.includes(id)) return;
    completed.push(id);
    const score = cityTasks[id][2];
    const points = Number(localStorage.getItem("liyangPoints") || "120") + score;
    localStorage.setItem("liyangCompletedTasks", JSON.stringify(completed));
    localStorage.setItem("liyangPoints", String(points));
    renderTasks();
    showToast(`任务完成，获得 ${score} 积分`);
  });

  $("#refresh-alerts").addEventListener("click", () => {
    renderAlerts();
    showToast("城市提醒已根据当前天气刷新");
  });

  $("#apply-theme").addEventListener("click", () => {
    applyTheme();
    showToast("个人主题已应用");
  });

  $("#refresh-cockpit").addEventListener("click", () => {
    renderCockpit();
    showToast("城市驾驶舱已刷新");
  });

  $("#audit-form").addEventListener("submit", (event) => {
    event.preventDefault();
    auditContent(new FormData(event.currentTarget));
  });

  $("#run-upgrade-scan").addEventListener("click", () => {
    state.upgradeRun += 1;
    renderUpgradeSystem();
    showToast("今日扫描完成：已生成优化建议和确认队列");
  });

  $("#upgrade-actions").addEventListener("click", (event) => {
    const approve = event.target.closest("[data-upgrade-approve]");
    const defer = event.target.closest("[data-upgrade-defer]");
    if (!approve && !defer) return;
    const id = approve?.dataset.upgradeApprove || defer?.dataset.upgradeDefer;
    saveUpgradeDecision(id, approve ? "已确认执行" : "已暂缓");
    renderUpgradeSystem();
    showToast(approve ? "升级建议已确认" : "升级建议已暂缓");
  });

  $$(".publish-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = $("#publish-dialog");
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });

  $("#publish-dialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });

  $("#publish-form").addEventListener("submit", (event) => {
    const submitter = event.submitter;
    if (submitter?.value === "cancel") return;
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const post = [
      data.get("category"),
      data.get("title").trim(),
      data.get("detail").trim(),
      "待核验",
    ];
    if (!post[1] || !post[2]) return;
    communityPosts = [post, ...communityPosts];
    const saved = communityPosts.filter((item) => item[3] === "待核验");
    localStorage.setItem("liyangCityCommunity", JSON.stringify(saved));
    state.community = "全部";
    renderCommunityCategories();
    renderCommunity();
    event.currentTarget.reset();
    $("#publish-dialog").close();
  });

  $("#refresh-report").addEventListener("click", renderReports);
}

function init() {
  restoreTheme();
  renderAiHome();
  renderPulse();
  renderLiveFeed();
  renderAchievements();
  renderDynamicRanks();
  generateRoute(new FormData($("#planner-form")));
  addMessage("ai", "我是溧阳AI本地助手。可以问散步、拍照、露营、亲子、约会、夜游和美食。");
  renderDiscover();
  renderFoodCategories();
  renderFoods();
  renderActivities();
  renderCommunityCategories();
  renderCommunity();
  renderMapFilters();
  renderMap();
  renderReports();
  renderGuideRoles();
  renderCulture();
  renderHistoricalFigure();
  renderTimeMachine();
  renderCompanions();
  renderPageFactory("我想做一个溧阳夜宵地图");
  renderMerchant(new FormData($("#merchant-form")));
  auditContent(new FormData($("#audit-form")));
  renderUpgradeSystem();
  renderGrowth();
  renderEmotion();
  renderCockpit();
  renderJobs(new FormData($("#jobs-form")));
  renderTasks();
  renderAlerts();
  renderPublicServices();
  const muted = localStorage.getItem("liyangVoiceMuted") === "true";
  $("#toggle-voice").textContent = muted ? "开启自动语音" : "关闭自动语音";
  $("#voice-status").textContent = muted ? "自动语音已关闭，可手动播放欢迎语。" : "首次进入可播放欢迎语；浏览器可能需要点击后才允许播报。";
  bindEvents();
  setInterval(() => {
    renderAchievements();
    renderCockpit();
  }, 15000);
}

init();
