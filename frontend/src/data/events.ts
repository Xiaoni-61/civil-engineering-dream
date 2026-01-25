/**
 * 游戏事件卡数据
 * 共 20 张基础事件卡，涵盖土木工程项目的各个阶段
 */

import { EventCard } from '@shared/types';

export const EVENTS: EventCard[] = [
  // ========== 项目初期（1-5回合）==========
  {
    id: 'event_001',
    title: '项目启动会',
    description: '甲方召开项目启动会，提出了一些额外要求。作为项目负责人，你需要做出回应。',
    options: [
      {
        id: 'opt_001_1',
        text: '全部答应，展现积极态度',
        effects: { reputation: 10, quality: -5, cash: -2500 },
        feedback: '甲方很满意，但项目压力增加了...',
      },
      {
        id: 'opt_001_2',
        text: '据理力争，坚持原方案',
        effects: { reputation: -5, quality: 5, health: -5 },
        feedback: '保住了合理方案，但关系有些紧张。',
      },
      {
        id: 'opt_001_3',
        text: '折中处理，部分接受',
        effects: { reputation: 3, progress: 2 },
        feedback: '双方都做了让步，还算和谐。',
      },
    ],
  },

  {
    id: 'event_002',
    title: '人员招聘',
    description: '项目需要招聘施工队，有三个队伍可选：老牌施工队经验丰富但要价高，新兴队伍便宜但不确定，熟人介绍的队伍质量一般。',
    options: [
      {
        id: 'opt_002_1',
        text: '选择老牌施工队',
        effects: { cash: -11250, quality: 10, progress: 5 },
        feedback: '虽然贵，但确实专业，工程进展顺利。',
      },
      {
        id: 'opt_002_2',
        text: '选择新兴队伍',
        effects: { cash: 5000, quality: -5 },
        feedback: '省了不少钱，但质量让人担心...',
      },
      {
        id: 'opt_002_3',
        text: '选择熟人队伍',
        effects: { reputation: 5, quality: -2, cash: -2500 },
        feedback: '给朋友面子，但工作效率确实一般。',
      },
    ],
  },

  {
    id: 'event_003',
    title: '材料采购',
    description: '钢筋价格突然上涨20%，预算吃紧。你需要决定如何应对。',
    options: [
      {
        id: 'opt_003_1',
        text: '使用原预算，减少其他开支',
        effects: { cash: -5000, health: -5, quality: 5 },
        feedback: '保证了主材质量，但要从其他地方节省。',
      },
      {
        id: 'opt_003_2',
        text: '寻找替代供应商',
        effects: { cash: -2500, progress: -5, quality: -3 },
        feedback: '找到了便宜的货源，但耽误了时间。',
      },
      {
        id: 'opt_003_3',
        text: '向甲方申请追加预算',
        effects: { reputation: -10, cash: 11250 },
        feedback: '甲方不太高兴，但还是批了钱。',
      },
    ],
  },

  {
    id: 'event_004',
    title: '设计变更',
    description: '设计院突然通知有一处设计需要变更，会影响已完成的部分工作。',
    options: [
      {
        id: 'opt_004_1',
        text: '立即停工整改',
        effects: { quality: 10, progress: -10, cash: -5000 },
        feedback: '按规矩办事，质量有保障。',
      },
      {
        id: 'opt_004_2',
        text: '继续施工，后续再说',
        effects: { progress: 5, quality: -15 },
        feedback: '进度保住了，但埋下了隐患...',
      },
      {
        id: 'opt_004_3',
        text: '沟通协调，最小化影响',
        effects: { health: -10, progress: -5, quality: 5 },
        feedback: '加班协调，总算把损失降到最低。',
      },
    ],
  },

  {
    id: 'event_005',
    title: '安全检查',
    description: '上级部门突击检查工地安全，发现几处小问题。',
    options: [
      {
        id: 'opt_005_1',
        text: '虚心接受，立即整改',
        effects: { cash: -4000, reputation: 5, progress: -3 },
        feedback: '获得了检查组的好评。',
      },
      {
        id: 'opt_005_2',
        text: '辩解问题不大',
        effects: { reputation: -10, health: -5 },
        feedback: '检查组很不满意，留下不良记录。',
      },
      {
        id: 'opt_005_3',
        text: '迅速整改并汇报',
        effects: { cash: -2500, health: -5, reputation: 8 },
        feedback: '加班处理，给领导留下好印象。',
      },
    ],
  },

  // ========== 项目中期（6-15回合）==========
  {
    id: 'event_006',
    title: '加班赶工',
    description: '项目进度有些滞后，需要考虑是否加班赶工。',
    options: [
      {
        id: 'opt_006_1',
        text: '大规模加班',
        effects: { progress: 15, health: -15, cash: -5000 },
        feedback: '进度追上来了，但身体和钱包都吃不消。',
      },
      {
        id: 'opt_006_2',
        text: '适度加班',
        effects: { progress: 8, health: -8, cash: -2500 },
        feedback: '平衡了进度和健康。',
      },
      {
        id: 'opt_006_3',
        text: '不加班，优化流程',
        effects: { progress: 3, health: 5 },
        feedback: '身体保住了，但进度依然紧张。',
      },
    ],
  },

  {
    id: 'event_007',
    title: '质量事故',
    description: '混凝土浇筑出现质量问题，需要返工。',
    options: [
      {
        id: 'opt_007_1',
        text: '全部返工',
        effects: { quality: 15, progress: -15, cash: -15000, health: -10 },
        feedback: '虽然痛苦，但保证了质量。',
      },
      {
        id: 'opt_007_2',
        text: '部分修补',
        effects: { quality: 5, progress: -5, cash: -5000 },
        feedback: '修补了主要问题，但留有遗憾。',
      },
      {
        id: 'opt_007_3',
        text: '隐瞒过关',
        effects: { quality: -20, reputation: -15 },
        feedback: '暂时掩盖了，但内心忐忑不安...',
      },
    ],
  },

  {
    id: 'event_008',
    title: '天气影响',
    description: '连续一周大雨，工地无法施工。',
    options: [
      {
        id: 'opt_008_1',
        text: '停工等待',
        effects: { progress: -8, health: 10, cash: -2500 },
        feedback: '借机休息，养精蓄锐。',
      },
      {
        id: 'opt_008_2',
        text: '冒险施工',
        effects: { progress: 5, quality: -10, health: -5 },
        feedback: '强行推进，但质量堪忧。',
      },
      {
        id: 'opt_008_3',
        text: '安排室内工作',
        effects: { progress: 3, health: -3 },
        feedback: '合理安排，也算没白费时间。',
      },
    ],
  },

  {
    id: 'event_009',
    title: '供应商纠纷',
    description: '供应商送来的材料与合同不符，要求加价。',
    options: [
      {
        id: 'opt_009_1',
        text: '拒绝加价，更换供应商',
        effects: { progress: -10, cash: 2500, health: -10 },
        feedback: '原则保住了，但耽误了工期。',
      },
      {
        id: 'opt_009_2',
        text: '接受加价',
        effects: { cash: -11250, progress: 5 },
        feedback: '花钱买时间，也是无奈之举。',
      },
      {
        id: 'opt_009_3',
        text: '协商折中方案',
        effects: { cash: -4000, health: -5, reputation: 3 },
        feedback: '双方各让一步，算是解决了。',
      },
    ],
  },

  {
    id: 'event_010',
    title: '工人受伤',
    description: '工地上有工人受轻伤，需要处理。',
    options: [
      {
        id: 'opt_010_1',
        text: '妥善处理，全力救治',
        effects: { cash: -11250, reputation: 10, health: -5 },
        feedback: '赢得了工人的信任。',
      },
      {
        id: 'opt_010_2',
        text: '按流程处理',
        effects: { cash: -4000, reputation: 3 },
        feedback: '按规定办事，还算合理。',
      },
      {
        id: 'opt_010_3',
        text: '私下了解',
        effects: { cash: -2500, reputation: -10 },
        feedback: '省了麻烦，但工人们心里有怨气。',
      },
    ],
  },

  {
    id: 'event_011',
    title: '技术难题',
    description: '遇到一个复杂的技术问题，施工队解决不了。',
    options: [
      {
        id: 'opt_011_1',
        text: '请专家指导',
        effects: { cash: -5000, quality: 15, progress: -5 },
        feedback: '专业的事交给专业的人。',
      },
      {
        id: 'opt_011_2',
        text: '自己研究解决',
        effects: { health: -15, quality: 10, progress: -8 },
        feedback: '熬了几个通宵，总算搞定了。',
      },
      {
        id: 'opt_011_3',
        text: '绕开问题',
        effects: { quality: -10, progress: 3 },
        feedback: '暂时跳过了，但可能留下隐患。',
      },
    ],
  },

  {
    id: 'event_012',
    title: '甲方视察',
    description: '甲方领导突然来工地视察，提出一些意见。',
    options: [
      {
        id: 'opt_012_1',
        text: '认真记录，承诺改进',
        effects: { reputation: 10, health: -5 },
        feedback: '领导很满意你的态度。',
      },
      {
        id: 'opt_012_2',
        text: '解释实际困难',
        effects: { reputation: -5, cash: 2500 },
        feedback: '领导表示理解，但印象打了折扣。',
      },
      {
        id: 'opt_012_3',
        text: '应付了事',
        effects: { reputation: -15 },
        feedback: '领导很不满意，列入重点关注名单。',
      },
    ],
  },

  {
    id: 'event_013',
    title: '预算超支',
    description: '项目预算出现超支，需要想办法解决。',
    options: [
      {
        id: 'opt_013_1',
        text: '申请追加预算',
        effects: { cash: 15000, reputation: -15, health: -10 },
        feedback: '钱批下来了，但要受不少批评。',
      },
      {
        id: 'opt_013_2',
        text: '压缩其他开支',
        effects: { quality: -10, health: -10 },
        feedback: '东拼西凑，勉强维持。',
      },
      {
        id: 'opt_013_3',
        text: '自己垫付部分',
        effects: { cash: 5000, health: -5, reputation: 5 },
        feedback: '自掏腰包，但保住了信誉。',
      },
    ],
  },

  {
    id: 'event_014',
    title: '同行交流',
    description: '参加一个行业交流会，可以学习新技术，但会耽误工期。',
    options: [
      {
        id: 'opt_014_1',
        text: '参加学习',
        effects: { progress: -5, quality: 10, reputation: 5 },
        feedback: '学到了不少新东西，开阔了眼界。',
      },
      {
        id: 'opt_014_2',
        text: '专心项目',
        effects: { progress: 5, health: -5 },
        feedback: '把时间用在了工地上。',
      },
    ],
  },

  {
    id: 'event_015',
    title: '团队矛盾',
    description: '项目团队内部出现矛盾，影响工作效率。',
    options: [
      {
        id: 'opt_015_1',
        text: '组织团建活动',
        effects: { cash: -5000, progress: -3, reputation: 8, health: 5 },
        feedback: '团建后气氛好多了。',
      },
      {
        id: 'opt_015_2',
        text: '单独谈心',
        effects: { health: -8, reputation: 5 },
        feedback: '花了不少精力，总算调解好了。',
      },
      {
        id: 'opt_015_3',
        text: '不管不问',
        effects: { progress: -5, reputation: -10 },
        feedback: '矛盾越来越深，严重影响工作。',
      },
    ],
  },

  // ========== 项目后期（16-20回合）==========
  {
    id: 'event_016',
    title: '验收准备',
    description: '项目即将验收，需要做最后的准备工作。',
    options: [
      {
        id: 'opt_016_1',
        text: '全面检查整改',
        effects: { progress: -5, quality: 15, cash: -5000, health: -10 },
        feedback: '确保万无一失。',
      },
      {
        id: 'opt_016_2',
        text: '重点部位检查',
        effects: { quality: 8, health: -5, cash: -2500 },
        feedback: '抓住重点，合理安排。',
      },
      {
        id: 'opt_016_3',
        text: '简单检查',
        effects: { quality: -5 },
        feedback: '草草了事，心里没底。',
      },
    ],
  },

  {
    id: 'event_017',
    title: '最后冲刺',
    description: '距离截止日期只剩几天，但还有一些扫尾工作。',
    options: [
      {
        id: 'opt_017_1',
        text: '通宵达旦赶工',
        effects: { progress: 20, health: -20, cash: -11250 },
        feedback: '终于赶在deadline前完成了！',
      },
      {
        id: 'opt_017_2',
        text: '合理加班',
        effects: { progress: 12, health: -10, cash: -4000 },
        feedback: '按部就班完成了大部分工作。',
      },
      {
        id: 'opt_017_3',
        text: '申请延期',
        effects: { reputation: -20, health: 5 },
        feedback: '保住了健康，但信誉受损。',
      },
    ],
  },

  {
    id: 'event_018',
    title: '质量验收',
    description: '质监站来进行质量验收，对几处细节提出疑问。',
    options: [
      {
        id: 'opt_018_1',
        text: '耐心解释，提供证据',
        effects: { quality: 10, reputation: 10, health: -5 },
        feedback: '专业的解答赢得了认可。',
      },
      {
        id: 'opt_018_2',
        text: '承认不足，立即整改',
        effects: { progress: -5, quality: 5, cash: -5000 },
        feedback: '及时纠正，避免了大问题。',
      },
      {
        id: 'opt_018_3',
        text: '找关系疏通',
        effects: { cash: -11250, reputation: -10 },
        feedback: '花钱消灾，但不是长久之计。',
      },
    ],
  },

  {
    id: 'event_019',
    title: '经验总结',
    description: '公司要求对项目进行总结，提炼经验教训。',
    options: [
      {
        id: 'opt_019_1',
        text: '认真总结，形成报告',
        effects: { reputation: 15, health: -5 },
        feedback: '深入总结，为未来积累经验。',
      },
      {
        id: 'opt_019_2',
        text: '简单汇报',
        effects: { reputation: 5 },
        feedback: '走个流程，交差了事。',
      },
      {
        id: 'opt_019_3',
        text: '推脱不做',
        effects: { reputation: -10, health: 5 },
        feedback: '逃避总结，但可能错过成长机会。',
      },
    ],
  },

  {
    id: 'event_020',
    title: '项目收尾',
    description: '项目基本完成，还有一些收尾工作和资料整理。',
    options: [
      {
        id: 'opt_020_1',
        text: '细致收尾',
        effects: { quality: 10, reputation: 10, health: -8, progress: 5 },
        feedback: '善始善终，留下好印象。',
      },
      {
        id: 'opt_020_2',
        text: '常规处理',
        effects: { progress: 5, health: -3 },
        feedback: '按部就班完成了。',
      },
      {
        id: 'opt_020_3',
        text: '快速结束',
        effects: { quality: -5, health: 5, progress: 3 },
        feedback: '终于解放了，但有些粗糙。',
      },
    ],
  },

  // ========== 项目初期补充（21-25回合）==========
  {
    id: 'event_021',
    title: '政府部门手续',
    description: '项目办理各类政府部门的施工许可、安全证等手续，流程繁琐且耗时。',
    options: [
      {
        id: 'opt_021_1',
        text: '全部自己跑',
        effects: { progress: -8, health: -10, cash: -2500 },
        feedback: '虽然省了中介费，但跑断了腿。',
      },
      {
        id: 'opt_021_2',
        text: '聘请专业代理',
        effects: { cash: -9000, progress: 3 },
        feedback: '花钱买效率，很值得。',
      },
      {
        id: 'opt_021_3',
        text: '找当地熟人',
        effects: { reputation: 3, cash: -4000, progress: 2 },
        feedback: '人脉派上用场了。',
      },
    ],
  },

  {
    id: 'event_022',
    title: '工人宿舍问题',
    description: '施工队的工人宿舍条件恶劣，工人有意见。',
    options: [
      {
        id: 'opt_022_1',
        text: '立即改善宿舍',
        effects: { cash: -11250, health: 5, reputation: 8 },
        feedback: '工人很感激，积极性提高。',
      },
      {
        id: 'opt_022_2',
        text: '给补贴代替',
        effects: { cash: -5000, reputation: 3 },
        feedback: '算是安抚了，但不够彻底。',
      },
      {
        id: 'opt_022_3',
        text: '不管他们怨言',
        effects: { reputation: -15, health: -5 },
        feedback: '工人情绪低落，效率下降。',
      },
    ],
  },

  {
    id: 'event_023',
    title: '设备采购',
    description: '需要采购重型施工设备，价格和性能需要平衡。',
    options: [
      {
        id: 'opt_023_1',
        text: '购买最新型设备',
        effects: { cash: -25000, progress: 10, quality: 8 },
        feedback: '设备先进，工作效率大幅提升。',
      },
      {
        id: 'opt_023_2',
        text: '租赁二手设备',
        effects: { cash: -4000, progress: 3, quality: -3 },
        feedback: '省钱了，但设备时常出问题。',
      },
      {
        id: 'opt_023_3',
        text: '购买二手设备',
        effects: { cash: -9000, progress: 5, quality: -2 },
        feedback: '一次性投资，长期省钱。',
      },
    ],
  },

  {
    id: 'event_024',
    title: '环评整改通知',
    description: '环保部门要求对施工方案进行环评整改。',
    options: [
      {
        id: 'opt_024_1',
        text: '主动整改，超标准执行',
        effects: { cash: -5000, health: 5, reputation: 12 },
        feedback: '获得了环保部门的高度评价。',
      },
      {
        id: 'opt_024_2',
        text: '按最低标准整改',
        effects: { cash: -2500, reputation: 2 },
        feedback: '勉强过关。',
      },
      {
        id: 'opt_024_3',
        text: '拖延处理',
        effects: { reputation: -20, health: -10 },
        feedback: '环保部门威胁停工，压力巨大。',
      },
    ],
  },

  {
    id: 'event_025',
    title: '员工培训',
    description: '为项目团队组织职业培训，提升专业素质。',
    options: [
      {
        id: 'opt_025_1',
        text: '投入重金，邀请行业专家',
        effects: { cash: -11250, quality: 12, reputation: 8 },
        feedback: '团队素质明显提升。',
      },
      {
        id: 'opt_025_2',
        text: '内部培训',
        effects: { cash: -2500, quality: 5, progress: -3 },
        feedback: '节省成本，效果一般。',
      },
      {
        id: 'opt_025_3',
        text: '不培训',
        effects: { cash: 2500, quality: -8 },
        feedback: '省钱了，但技能水平堪忧。',
      },
    ],
  },

  // ========== 项目中期补充（26-45回合）==========
  {
    id: 'event_026',
    title: '甲方改图',
    description: '甲方又提出设计变更，这已经是第三次了！需要返工施工的部分。',
    options: [
      {
        id: 'opt_026_1',
        text: '虽然不爽也得改',
        effects: { progress: -12, quality: 5, cash: -11250, health: -10 },
        feedback: '甲方是爹，只能照办。',
      },
      {
        id: 'opt_026_2',
        text: '协商部分改进',
        effects: { reputation: -8, progress: -5, quality: 3 },
        feedback: '讲价成功，损失有所缓解。',
      },
      {
        id: 'opt_026_3',
        text: '据理力争，拒绝无理要求',
        effects: { reputation: -15, quality: 5 },
        feedback: '这回站住了立场，但关系紧张。',
      },
    ],
  },

  {
    id: 'event_027',
    title: '工期款拖欠',
    description: '甲方以各种理由拖延支付工程款，工人工资无法及时发放。',
    options: [
      {
        id: 'opt_027_1',
        text: '先垫付工资，后追款',
        effects: { cash: -15000, reputation: 10, health: -8 },
        feedback: '委屈自己，维护工人利益。',
      },
      {
        id: 'opt_027_2',
        text: '停工逼甲方支付',
        effects: { progress: -15, reputation: -10, health: -5 },
        feedback: '强硬了一回，但后果严重。',
      },
      {
        id: 'opt_027_3',
        text: '走法律程序',
        effects: { progress: -8, health: -15, reputation: 5 },
        feedback: '合理却冗长，项目进展缓慢。',
      },
    ],
  },

  {
    id: 'event_028',
    title: '暴雨停工',
    description: '突如其来的暴雨导致工地积水，能见度极低，必须停工。',
    options: [
      {
        id: 'opt_028_1',
        text: '停工排水，确保安全',
        effects: { progress: -10, health: 8 },
        feedback: '安全至上，合理决策。',
      },
      {
        id: 'opt_028_2',
        text: '冒险施工',
        effects: { progress: 3, quality: -15, health: -8 },
        feedback: '强行开工，质量和安全双重风险。',
      },
      {
        id: 'opt_028_3',
        text: '室内作业，转移工作',
        effects: { progress: 2, health: 5 },
        feedback: '灵活应对，最小化损失。',
      },
    ],
  },

  {
    id: 'event_029',
    title: '钢筋短缺',
    description: '供应商突然通知钢筋供应不足，无法按时交货。',
    options: [
      {
        id: 'opt_029_1',
        text: '紧急调货，全力采购',
        effects: { cash: -13500, progress: 5 },
        feedback: '花了大价钱，但保住了进度。',
      },
      {
        id: 'opt_029_2',
        text: '替代方案，使用其他材料',
        effects: { cash: -4000, quality: -10 },
        feedback: '省了钱，但质量受影响。',
      },
      {
        id: 'opt_029_3',
        text: '停工等待',
        effects: { progress: -15, health: 10 },
        feedback: '工期吃紧，但工人终于能休息。',
      },
    ],
  },

  {
    id: 'event_030',
    title: '混凝土初凝事故',
    description: '大体积混凝土浇筑后发现温度裂缝，需要技术处理。',
    options: [
      {
        id: 'opt_030_1',
        text: '立即请专家，全力补救',
        effects: { cash: -15000, quality: 12, progress: -8, health: -10 },
        feedback: '虽然花钱，但避免了大问题。',
      },
      {
        id: 'opt_030_2',
        text: '自己研究补救',
        effects: { health: -20, quality: 5, progress: -5 },
        feedback: '几个通宵后总算解决了。',
      },
      {
        id: 'opt_030_3',
        text: '隐瞒并继续施工',
        effects: { quality: -30, reputation: -20 },
        feedback: '暂时躲过了，但这是定时炸弹...',
      },
    ],
  },

  {
    id: 'event_031',
    title: '监理检查不通过',
    description: '监理单位检查发现多个不符合规范的施工细节，要求整改。',
    options: [
      {
        id: 'opt_031_1',
        text: '虚心接受，立即整改',
        effects: { cash: -4000, quality: 10, progress: -5, reputation: 5 },
        feedback: '与监理关系和谐，未来合作顺利。',
      },
      {
        id: 'opt_031_2',
        text: '讨价还价，部分整改',
        effects: { reputation: -5, quality: 3 },
        feedback: '各让一步，勉强过关。',
      },
      {
        id: 'opt_031_3',
        text: '找关系疏通',
        effects: { cash: -11250, reputation: -10 },
        feedback: '花钱消灾，但名声受损。',
      },
    ],
  },

  {
    id: 'event_032',
    title: '工地偷盗事件',
    description: '工地发生多起财物失窃事件，工人士气下降。',
    options: [
      {
        id: 'opt_032_1',
        text: '加强安保，安装监控',
        effects: { cash: -9000, reputation: 8, health: 5 },
        feedback: '投资安全，工人很放心。',
      },
      {
        id: 'opt_032_2',
        text: '派人巡查',
        effects: { cash: -2500, reputation: 3 },
        feedback: '缓解了问题，但不够彻底。',
      },
      {
        id: 'opt_032_3',
        text: '放任不管',
        effects: { reputation: -20, health: -15 },
        feedback: '工人越来越不信任，纪律混乱。',
      },
    ],
  },

  {
    id: 'event_033',
    title: '关键人才离职',
    description: '项目的技术负责人突然提出辞职，理由是工作压力太大。',
    options: [
      {
        id: 'opt_033_1',
        text: '挽留，给予提升机会',
        effects: { cash: -5000, health: 5, reputation: 5, quality: 10 },
        feedback: '人才留住了，项目稳了。',
      },
      {
        id: 'opt_033_2',
        text: '放他走，另找人才',
        effects: { cash: -11250, quality: -15, progress: -8 },
        feedback: '新人上手需要时间，短期阵痛。',
      },
      {
        id: 'opt_033_3',
        text: '强行挽留，晓之以理',
        effects: { reputation: -8, health: -10 },
        feedback: '人虽留了，但心已飞了。',
      },
    ],
  },

  {
    id: 'event_034',
    title: '包工头欠账',
    description: '与你合作的包工头无法按合同支付工人工资，要求延期。',
    options: [
      {
        id: 'opt_034_1',
        text: '立即垫付，维护信誉',
        effects: { cash: -13500, reputation: 8 },
        feedback: '工人的工资有了着落，感谢有你。',
      },
      {
        id: 'opt_034_2',
        text: '与包工头讨价还价',
        effects: { reputation: -5, progress: -3 },
        feedback: '勉强达成协议，但关系有裂痕。',
      },
      {
        id: 'opt_034_3',
        text: '停工逼迫',
        effects: { progress: -12, reputation: -15, health: -8 },
        feedback: '虽然有理，但代价太大。',
      },
    ],
  },

  {
    id: 'event_035',
    title: '竞争对手抢单',
    description: '得知另一个单位也在争取后续项目，竞争激烈。',
    options: [
      {
        id: 'opt_035_1',
        text: '加倍努力，用成绩说话',
        effects: { progress: 5, health: -15, quality: 8 },
        feedback: '虽然累，但赢得了信任。',
      },
      {
        id: 'opt_035_2',
        text: '加强与甲方沟通',
        effects: { reputation: 5, health: -5 },
        feedback: '建立了情感联系，增加了优势。',
      },
      {
        id: 'opt_035_3',
        text: '暗中抵触竞争对手',
        effects: { reputation: -20, quality: -10 },
        feedback: '小动作被发现，名声受损。',
      },
    ],
  },

  {
    id: 'event_036',
    title: '安全生产标准化验收',
    description: '接到政府部门安全标准化验收通知，需要达到一级标准。',
    options: [
      {
        id: 'opt_036_1',
        text: '按一级标准全力整改',
        effects: { cash: -11250, health: 10, reputation: 15 },
        feedback: '成为了行业标杆项目。',
      },
      {
        id: 'opt_036_2',
        text: '按二级标准达标',
        effects: { cash: -4000, reputation: 5 },
        feedback: '能过关，但不够突出。',
      },
      {
        id: 'opt_036_3',
        text: '应付检查',
        effects: { reputation: -15, health: -10 },
        feedback: '临时过关，后患无穷。',
      },
    ],
  },

  {
    id: 'event_037',
    title: '铺装材料涨价',
    description: '铺装所需的瓷砖、石材突然涨价，供应商要求加价20%。',
    options: [
      {
        id: 'opt_037_1',
        text: '接受涨价',
        effects: { cash: -13500, progress: 5 },
        feedback: '虽然肉疼，但不耽误工期。',
      },
      {
        id: 'opt_037_2',
        text: '更换材料品牌',
        effects: { cash: -5000, quality: -8 },
        feedback: '省钱了，但质量档次降低。',
      },
      {
        id: 'opt_037_3',
        text: '延期采购，等待降价',
        effects: { progress: -8, health: 5 },
        feedback: '有的可能等到降价，也可能一直不降。',
      },
    ],
  },

  {
    id: 'event_038',
    title: '分包商质量问题',
    description: '分包商施工的外墙保温出现脱落问题，需要返工。',
    options: [
      {
        id: 'opt_038_1',
        text: '全部返工，追究责任',
        effects: { cash: -15000, quality: 15, reputation: 5 },
        feedback: '虽然麻烦，但保证了质量。',
      },
      {
        id: 'opt_038_2',
        text: '部分返工，控制成本',
        effects: { cash: -5000, quality: 5 },
        feedback: '平衡了质量和成本。',
      },
      {
        id: 'opt_038_3',
        text: '隐瞒过关',
        effects: { quality: -25, reputation: -15 },
        feedback: '暂时躲过，但迟早会暴露。',
      },
    ],
  },

  {
    id: 'event_039',
    title: '项目评比活动',
    description: '地方政府举办"建筑施工示范项目"评选，你的项目有机会。',
    options: [
      {
        id: 'opt_039_1',
        text: '积极参与，全力争取',
        effects: { cash: -5000, reputation: 15, progress: -5 },
        feedback: '虽然花钱又耽误进度，但获得了殊荣。',
      },
      {
        id: 'opt_039_2',
        text: '参加，但不特别投入',
        effects: { reputation: 3 },
        feedback: '碰碰运气，没想到真的获奖了。',
      },
      {
        id: 'opt_039_3',
        text: '不参与',
        effects: { progress: 3 },
        feedback: '省心了，但错过了展示机会。',
      },
    ],
  },

  {
    id: 'event_040',
    title: '政策法规变化',
    description: '国家出台新的建筑行业法规，对施工规范有新要求。',
    options: [
      {
        id: 'opt_040_1',
        text: '立即全面整改',
        effects: { cash: -9000, progress: -8, quality: 10, reputation: 10 },
        feedback: '虽然短期有压力，但长期受益。',
      },
      {
        id: 'opt_040_2',
        text: '部分调整',
        effects: { cash: -2500, quality: 3 },
        feedback: '基本符合，但可能有遗漏。',
      },
      {
        id: 'opt_040_3',
        text: '按原计划继续',
        effects: { reputation: -15, health: -10 },
        feedback: '迟早要被整改，问题很大。',
      },
    ],
  },

  {
    id: 'event_041',
    title: '春节工人返乡潮',
    description: '春节临近，大批农民工要求回家过年，导致用工紧张。',
    options: [
      {
        id: 'opt_041_1',
        text: '给予长假，保留职位',
        effects: { progress: -10, health: 15, reputation: 8 },
        feedback: '人道主义获赞，节后还能回归。',
      },
      {
        id: 'opt_041_2',
        text: '给予加薪奖励，留任工作',
        effects: { cash: -11250, progress: 5 },
        feedback: '花钱留住了劳动力。',
      },
      {
        id: 'opt_041_3',
        text: '强制留任',
        effects: { reputation: -20, health: -15 },
        feedback: '工人怨气冲天，安全隐患增加。',
      },
    ],
  },

  {
    id: 'event_042',
    title: '多塔吊协调',
    description: '工地有3个塔吊同时作业，频繁干涉，安全风险高。',
    options: [
      {
        id: 'opt_042_1',
        text: '制定详细的协调方案',
        effects: { progress: -3, health: 10, quality: 8, reputation: 5 },
        feedback: '虽然复杂，但安全有保障。',
      },
      {
        id: 'opt_042_2',
        text: '轮流作业，降低效率',
        effects: { progress: -15, health: 5 },
        feedback: '安全了，但进度下降。',
      },
      {
        id: 'opt_042_3',
        text: '听天由命',
        effects: { quality: -15, health: -20, reputation: -10 },
        feedback: '险象环生，迟早出事。',
      },
    ],
  },

  {
    id: 'event_043',
    title: '审计检查',
    description: '财务部门来进行项目资金审计，需要提交详细报表。',
    options: [
      {
        id: 'opt_043_1',
        text: '主动配合，完整提供资料',
        effects: { health: 5, reputation: 8 },
        feedback: '账目清楚，获得好评。',
      },
      {
        id: 'opt_043_2',
        text: '被动应付',
        effects: { reputation: -5, health: -5 },
        feedback: '虽然过关了，但留下了隐患。',
      },
      {
        id: 'opt_043_3',
        text: '隐瞒真相',
        effects: { reputation: -25, health: -20 },
        feedback: '真是太大意了，后果严重。',
      },
    ],
  },

  {
    id: 'event_044',
    title: '邻居投诉噪音',
    description: '附近居民投诉工地噪音扰民，有人去政府部门上访。',
    options: [
      {
        id: 'opt_044_1',
        text: '主动沟通，赔偿损失',
        effects: { cash: -5000, reputation: 10, health: 5 },
        feedback: '化解了矛盾，获得了谅解。',
      },
      {
        id: 'opt_044_2',
        text: '采取降噪措施',
        effects: { cash: -4000, progress: -5 },
        feedback: '虽然耽误进度，但问题解决了。',
      },
      {
        id: 'opt_044_3',
        text: '不理会',
        effects: { reputation: -20, health: -15 },
        feedback: '投诉越来越多，问题升级。',
      },
    ],
  },

  {
    id: 'event_045',
    title: '项目融资困难',
    description: '由于资金链紧张，甲方延迟拨款，导致项目面临资金短缺。',
    options: [
      {
        id: 'opt_045_1',
        text: '银行贷款',
        effects: { cash: 25000, health: -10, progress: 2 },
        feedback: '解决了燃眉之急，但债务增加。',
      },
      {
        id: 'opt_045_2',
        text: '向分包商延期付款',
        effects: { reputation: -10, quality: -5 },
        feedback: '缓解了压力，但关系受损。',
      },
      {
        id: 'opt_045_3',
        text: '减少工程量',
        effects: { progress: -10, quality: -10 },
        feedback: '削足适履，影响工程质量。',
      },
    ],
  },

  // ========== 项目后期补充（46-60回合）==========
  {
    id: 'event_046',
    title: '门窗安装质量问题',
    description: '门窗安装后发现有渗水现象，需要返工调整。',
    options: [
      {
        id: 'opt_046_1',
        text: '立即返工，完全解决',
        effects: { cash: -9000, quality: 12, progress: -8 },
        feedback: '彻底解决了问题。',
      },
      {
        id: 'opt_046_2',
        text: '调整密封胶',
        effects: { cash: -2500, quality: 5 },
        feedback: '成本低，效果也还可以。',
      },
      {
        id: 'opt_046_3',
        text: '暂时隐瞒',
        effects: { quality: -20, reputation: -15 },
        feedback: '迟早会被发现。',
      },
    ],
  },

  {
    id: 'event_047',
    title: '最后期限逼近',
    description: '距离合同约定的完工日期只剩不到2周，但还有不少工作。',
    options: [
      {
        id: 'opt_047_1',
        text: '全力冲刺，不计成本',
        effects: { progress: 20, health: -20, cash: -11250 },
        feedback: '虽然透支了，但如期完成。',
      },
      {
        id: 'opt_047_2',
        text: '加班加点，量力而为',
        effects: { progress: 12, health: -12, cash: -5000 },
        feedback: '有序推进，大部分完成。',
      },
      {
        id: 'opt_047_3',
        text: '申请延期',
        effects: { reputation: -20, health: 10 },
        feedback: '虽然保住了健康，但信誉受损。',
      },
    ],
  },

  {
    id: 'event_048',
    title: '竣工验收前的小问题',
    description: '在最终验收前发现了几个小缺陷，需要快速整改。',
    options: [
      {
        id: 'opt_048_1',
        text: '逐一整改，完美呈现',
        effects: { progress: -5, quality: 15, cash: -4000 },
        feedback: '完美收官。',
      },
      {
        id: 'opt_048_2',
        text: '整改主要问题',
        effects: { progress: -2, quality: 8, cash: -2000 },
        feedback: '基本完美，细节有遗漏。',
      },
      {
        id: 'opt_048_3',
        text: '虽有遗憾但直接提交',
        effects: { quality: -10, reputation: -8 },
        feedback: '可能被扣分。',
      },
    ],
  },

  {
    id: 'event_049',
    title: '工程保修责任',
    description: '竣工后，甲方提出了工程保修期间内出现的多个问题。',
    options: [
      {
        id: 'opt_049_1',
        text: '主动承担，完全免费维修',
        effects: { cash: -5000, reputation: 15, health: 5 },
        feedback: '完全诠释了什么叫"质量承诺"。',
      },
      {
        id: 'opt_049_2',
        text: '按合同维修',
        effects: { cash: -2500, reputation: 5 },
        feedback: '按规定办事，尽职尽责。',
      },
      {
        id: 'opt_049_3',
        text: '推脱责任',
        effects: { reputation: -20, health: -10 },
        feedback: '名声彻底坏了。',
      },
    ],
  },

  {
    id: 'event_050',
    title: '资料整理竣工',
    description: '所有施工资料、竣工图、质量文件等需要整理成档。',
    options: [
      {
        id: 'opt_050_1',
        text: '专业整理，形成完整档案',
        effects: { reputation: 10, health: -8, progress: 3 },
        feedback: '为企业留下宝贵财富。',
      },
      {
        id: 'opt_050_2',
        text: '基本整理',
        effects: { reputation: 3, health: -3 },
        feedback: '勉强交差。',
      },
      {
        id: 'opt_050_3',
        text: '不整理',
        effects: { reputation: -15 },
        feedback: '极其不负责任。',
      },
    ],
  },

  {
    id: 'event_051',
    title: '成本汇总统计',
    description: '项目成本需要详细汇总，计算实际盈利情况。',
    options: [
      {
        id: 'opt_051_1',
        text: '详细统计，发现成本节约机会',
        effects: { cash: 11250, reputation: 5 },
        feedback: '数据清楚，可为下一个项目借鉴。',
      },
      {
        id: 'opt_051_2',
        text: '粗略统计',
        effects: { cash: 2500 },
        feedback: '大概知道了赚多少。',
      },
      {
        id: 'opt_051_3',
        text: '不统计',
        effects: { cash: -5000, reputation: -5 },
        feedback: '糊里糊涂，损失无算。',
      },
    ],
  },

  {
    id: 'event_052',
    title: '项目总结大会',
    description: '公司召开项目总结大会，你需要作总结发言。',
    options: [
      {
        id: 'opt_052_1',
        text: '深入总结，提炼经验教训',
        effects: { reputation: 15, health: -5 },
        feedback: '赢得了一片掌声。',
      },
      {
        id: 'opt_052_2',
        text: '简单汇报',
        effects: { reputation: 5 },
        feedback: '走个流程。',
      },
      {
        id: 'opt_052_3',
        text: '推脱',
        effects: { reputation: -15, health: 10 },
        feedback: '虽然轻松了，但显得不负责任。',
      },
    ],
  },

  {
    id: 'event_053',
    title: '员工表彰激励',
    description: '项目圆满完成，是时候表彰优秀员工了。',
    options: [
      {
        id: 'opt_053_1',
        text: '大方奖励，现金红包',
        effects: { cash: -9000, reputation: 15, health: 10 },
        feedback: '员工非常满足，明年继续合作。',
      },
      {
        id: 'opt_053_2',
        text: '适度奖励',
        effects: { cash: -2500, reputation: 8 },
        feedback: '略感满意。',
      },
      {
        id: 'opt_053_3',
        text: '不奖励',
        effects: { reputation: -20, health: -10 },
        feedback: '员工极其失望。',
      },
    ],
  },

  {
    id: 'event_054',
    title: '新闻宣传机会',
    description: '当地媒体想要报道你的项目成功案例。',
    options: [
      {
        id: 'opt_054_1',
        text: '全力配合，制作精美宣传素材',
        effects: { reputation: 15, health: -5, progress: 2 },
        feedback: '获得了广泛关注。',
      },
      {
        id: 'opt_054_2',
        text: '简单配合',
        effects: { reputation: 5 },
        feedback: '有所提升。',
      },
      {
        id: 'opt_054_3',
        text: '拒绝媒体采访',
        effects: { reputation: -5 },
        feedback: '错失了宣传机会。',
      },
    ],
  },

  {
    id: 'event_055',
    title: '与甲方关系维护',
    description: '项目完成，要与甲方建立长期合作关系。',
    options: [
      {
        id: 'opt_055_1',
        text: '定期走访，建立友谊',
        effects: { cash: -2500, reputation: 15 },
        feedback: '为将来合作铺路。',
      },
      {
        id: 'opt_055_2',
        text: '定期汇报',
        effects: { reputation: 8 },
        feedback: '保持联系。',
      },
      {
        id: 'opt_055_3',
        text: '项目完成后失去联系',
        effects: { reputation: -10 },
        feedback: '十分遗憾，机会错失。',
      },
    ],
  },

  {
    id: 'event_056',
    title: '质量评比表彰',
    description: '你的项目入选了省级优质工程奖的表彰名单。',
    options: [
      {
        id: 'opt_056_1',
        text: '庆祝活动，全员分享荣誉',
        effects: { cash: -4000, reputation: 20, health: 8 },
        feedback: '荣誉鼓舞人心。',
      },
      {
        id: 'opt_056_2',
        text: '简单庆祝',
        effects: { reputation: 10, health: 5 },
        feedback: '适度庆祝。',
      },
      {
        id: 'opt_056_3',
        text: '没什么特别',
        effects: { health: 3 },
        feedback: '失去了激励的机会。',
      },
    ],
  },

  {
    id: 'event_057',
    title: '项目财务结清',
    description: '最后的工程款终于到账，项目财务正式结清。',
    options: [
      {
        id: 'opt_057_1',
        text: '支付所有分包款，兑现承诺',
        effects: { reputation: 15, health: 8 },
        feedback: '信誉完美收官。',
      },
      {
        id: 'opt_057_2',
        text: '逐步结清',
        effects: { reputation: 5 },
        feedback: '一切按规矩。',
      },
      {
        id: 'opt_057_3',
        text: '拖延支付',
        effects: { cash: 5000, reputation: -20 },
        feedback: '虽然赚了，但完全失信。',
      },
    ],
  },

  {
    id: 'event_058',
    title: '员工离职与交接',
    description: '项目完成，核心员工纷纷要求调往新项目。',
    options: [
      {
        id: 'opt_058_1',
        text: '妥善交接，做好知识转移',
        effects: { reputation: 10, health: 5 },
        feedback: '为企业留下了经验财富。',
      },
      {
        id: 'opt_058_2',
        text: '仓促交接',
        effects: { reputation: 3, health: -3 },
        feedback: '人走茶凉。',
      },
      {
        id: 'opt_058_3',
        text: '百般阻挠',
        effects: { reputation: -15, health: -10 },
        feedback: '搬起石头砸自己的脚。',
      },
    ],
  },

  {
    id: 'event_059',
    title: '下一个项目竞标',
    description: '基于这个项目的成功，公司推荐你竞标下一个大项目。',
    options: [
      {
        id: 'opt_059_1',
        text: '全力投入，力争中标',
        effects: { health: -15, reputation: 10 },
        feedback: '累但有希望。',
      },
      {
        id: 'opt_059_2',
        text: '参加但态度一般',
        effects: { reputation: 3 },
        feedback: '有可能，有可能不。',
      },
      {
        id: 'opt_059_3',
        text: '无暇顾及',
        effects: { health: 8, reputation: -5 },
        feedback: '错失了机遇。',
      },
    ],
  },

  {
    id: 'event_060',
    title: '项目全面圆满收官',
    description: '所有工作已完成，项目即将正式归档，这是整个过程的最终考验。',
    options: [
      {
        id: 'opt_060_1',
        text: '完美收官，为企业添砖加瓦',
        effects: { reputation: 20, quality: 10, health: 5, progress: 10 },
        feedback: '向所有参与者致敬！',
      },
      {
        id: 'opt_060_2',
        text: '正常收官',
        effects: { reputation: 10, progress: 5 },
        feedback: '完成了任务。',
      },
      {
        id: 'opt_060_3',
        text: '尽快结束，解放自己',
        effects: { health: 10, quality: -5 },
        feedback: '虽然轻松了，但留下了遗憾。',
      },
    ],
  },
];

// 事件索引（方便快速查找）
export const EVENT_MAP = EVENTS.reduce((map, event) => {
  map[event.id] = event;
  return map;
}, {} as Record<string, EventCard>);

// 按回合推荐的事件（可用于顺序模式）
export const EVENT_BY_PHASE = {
  early: EVENTS.slice(0, 10),   // 1-10 回合（初期 10 张）
  mid: EVENTS.slice(10, 40),    // 11-40 回合（中期 30 张）
  late: EVENTS.slice(40, 60),   // 41-60 回合（后期 20 张）
};
