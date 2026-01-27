/**
 * 实习生事件（10个）
 * - 专业型事件（5个）：涉及技术决策、工程质量、安全管理
 * - 职场型事件（5个）：涉及人际关系、职场文化、职业发展
 */

import { DecisionEvent } from './eventTypes';
import { Rank, RelationshipType } from '@shared/types';

export const internEvents: DecisionEvent[] = [
  // ==================== 专业型事件 ====================

  {
    id: 'int_001_prof',
    title: '工地上的失误',
    description: '你在工地巡查时发现，劳务队的钢筋绑扎间距不符合规范要求。如果现在不整改，后期混凝土浇筑后就无法整改了。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_001_opt1',
        text: '坚持按规范要求，立即叫停整改',
        feedback: '你坚持原则要求整改，劳务队很不满意，觉得你一个实习生太较真。但监理对你的专业态度很认可。',
        effects: {
          reputation: 3,
          health: -2,
          relationships: [
            { type: RelationshipType.LABOR, change: -5 },
            { type: RelationshipType.SUPERVISION, change: 5 },
          ],
        },
      },
      {
        id: 'int_001_opt2',
        text: '提出折中方案，部分整改重点区域',
        feedback: '你和劳务队商量后，同意重点整改关键部位。双方都接受了这个折中方案，但监理提醒你下次要更严格。',
        effects: {
          reputation: 1,
          relationships: [
            { type: RelationshipType.LABOR, change: 2 },
            { type: RelationshipType.SUPERVISION, change: -2 },
          ],
        },
      },
      {
        id: 'int_001_opt3',
        text: '保持沉默，假装没发现',
        feedback: '你选择了沉默。工程继续进行，但你心里一直担心这个问题。后来验收时果然被发现了，项目经理对你印象不佳。',
        effects: {
          reputation: -3,
          relationships: [
            { type: RelationshipType.LABOR, change: 3 },
          ],
        },
      },
    ],
  },

  {
    id: 'int_002_prof',
    title: '图纸疑问',
    description: '在审图时，你发现结构图和建筑图在一处梁的尺寸标注上存在矛盾。你不确定该怎么处理这个问题。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_002_opt1',
        text: '虚心请教前辈工程师',
        feedback: '老工程师告诉你这是常见问题，并教你如何处理。你学到了实用的审图技巧，前辈对你的虚心态度很赞赏。',
        effects: {
          reputation: 2,
          health: -1,
          relationships: [
            { type: RelationshipType.DESIGN, change: 3 },
          ],
        },
      },
      {
        id: 'int_002_opt2',
        text: '直接联系设计院确认',
        feedback: '你主动联系设计院，设计师很快发来了变更通知单。项目经理觉得你做事主动，但提醒你以后要先请示。',
        effects: {
          reputation: 3,
          health: -2,
          relationships: [
            { type: RelationshipType.DESIGN, change: 5 },
          ],
        },
      },
      {
        id: 'int_002_opt3',
        text: '先观察施工队怎么做',
        feedback: '你决定先观察施工队的做法。结果他们按结构图施工，后来建筑设计师来现场发现了问题，造成了返工。',
        effects: {
          reputation: -2,
          relationships: [
            { type: RelationshipType.DESIGN, change: -5 },
          ],
        },
      },
      {
        id: 'int_002_opt4',
        text: '🔧 独立研究分析（需工作能力≥20）',
        feedback: '你凭借扎实的专业基础，仔细分析了两张图纸的矛盾点，独立提出了合理的解决方案。设计师对你的专业能力印象深刻！',
        requiredAbility: { workAbility: 20 },
        hidden: true,
        effects: {
          reputation: 5,
          workAbility: 2,
          relationships: [
            { type: RelationshipType.DESIGN, change: 5 },
          ],
        },
      },
    ],
  },

  {
    id: 'int_003_prof',
    title: '材料验收',
    description: '一批新到的水泥看起来有些受潮，包装袋上有水渍。材料供应商说只是表面问题，不影响使用。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_003_opt1',
        text: '坚持退换，不能使用不合格材料',
        feedback: '你坚持原则要求退换。供应商虽然不高兴，但还是同意了。项目经理对你的认真态度很认可。',
        effects: {
          reputation: 3,
          health: -2,
          relationships: [
            { type: RelationshipType.LABOR, change: 2 },
          ],
        },
      },
      {
        id: 'int_003_opt2',
        text: '取样送检，根据结果决定',
        feedback: '你建议先取样送检，结果显示水泥强度略低于标准但可用。这个折中方案让大家都能接受。',
        effects: {
          reputation: 1,
          relationships: [
            { type: RelationshipType.LABOR, change: 3 },
          ],
        },
      },
      {
        id: 'int_003_opt3',
        text: '接受供应商说法，直接使用',
        feedback: '你接受了供应商的说法。但后来用这批水泥浇筑的混凝土出现了强度问题，需要返工。',
        effects: {
          reputation: -4,
          cash: -500,
          relationships: [
            { type: RelationshipType.LABOR, change: -3 },
          ],
        },
      },
      {
        id: 'int_003_opt4',
        text: '🔧 专业快速检测（需工作能力≥20）',
        feedback: '你运用专业知识，通过观察水泥颜色和凝结时间快速判断出水泥已受潮变质，果断拒绝使用。避免了质量事故！',
        requiredAbility: { workAbility: 20 },
        hidden: true,
        effects: {
          reputation: 5,
          quality: 2,
          workAbility: 2,
          relationships: [
            { type: RelationshipType.LABOR, change: 3 },
          ],
        },
      },
    ],
  },

  {
    id: 'int_004_prof',
    title: '施工延误',
    description: '连续雨天导致基础施工严重延误，甲方催促进度。项目经理问你应该如何汇报这个情况。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_004_opt1',
        text: '如实汇报，说明天气影响',
        feedback: '你如实汇报了情况。甲方虽然不满，但也理解这是不可抗力。项目经理认为你汇报得当。',
        effects: {
          reputation: 2,
          health: -1,
          relationships: [
            { type: RelationshipType.CLIENT, change: -2 },
          ],
        },
      },
      {
        id: 'int_004_opt2',
        text: '承诺加班赶工期',
        feedback: '你主动提出加班赶工。甲方满意了，但你连续加班一周，身体很累。劳务队也有怨言。',
        effects: {
          reputation: 3,
          health: -5,
          relationships: [
            { type: RelationshipType.CLIENT, change: 5 },
            { type: RelationshipType.LABOR, change: -3 },
          ],
        },
      },
      {
        id: 'int_004_opt3',
        text: '推给上级，说自己无法决定',
        feedback: '你让甲方直接找项目经理。项目经理觉得你缺乏担当，不够主动。',
        effects: {
          reputation: -2,
          relationships: [
            { type: RelationshipType.CLIENT, change: -2 },
          ],
        },
      },
    ],
  },

  {
    id: 'int_005_prof',
    title: '安全隐患',
    description: '你在工地看到几个工人没戴安全帽就进入施工区域，这是严重的安全违规行为。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_005_opt1',
        text: '友好提醒工人注意安全',
        feedback: '你友善地提醒工人，他们虽然不太情愿，但还是戴上了安全帽。安全员看到了你的做法，表示认可。',
        effects: {
          reputation: 2,
          health: -1,
          relationships: [
            { type: RelationshipType.LABOR, change: 2 },
          ],
        },
      },
      {
        id: 'int_005_opt2',
        text: '报告安全员处理',
        feedback: '你报告了安全员，安全员对工人进行了处罚。工人知道是你报告的，对你有意见。',
        effects: {
          reputation: 1,
          relationships: [
            { type: RelationshipType.LABOR, change: -5 },
          ],
        },
      },
      {
        id: 'int_005_opt3',
        text: '假装没看见，避免麻烦',
        feedback: '你选择了回避。后来有个工人被掉落的砖块砸伤头部，幸好只是轻伤。你为此感到内疚。',
        effects: {
          reputation: -2,
          health: -2,
        },
      },
      {
        id: 'int_005_opt4',
        text: '🎲 豪赌不会出事（需幸运≥25）',
        feedback: '你赌这次不会出事，没有制止工人。运气不错，工人安全完成了工作，但你也捏了一把汗。',
        requiredAbility: { luck: 25 },
        riskFactor: 0.4,
        hidden: true,
        failureFeedback: '很不幸，工人真的出事了！被掉落的材料砸伤，需要住院治疗。你因为知情不报受到严厉批评。',
        effects: {
          reputation: 1,
          relationships: [
            { type: RelationshipType.LABOR, change: 3 },
          ],
          failure: {
            reputation: -8,
            cash: -2000,
            relationships: [
              { type: RelationshipType.LABOR, change: -10 },
            ],
          },
        },
      },
    ],
  },

  // ==================== 职场型事件 ====================

  {
    id: 'int_001_work',
    title: '办公室琐事',
    description: '项目部的打印机坏了，工程部的老同事让你帮忙复印50份材料。这是你今天第三次被叫去帮忙复印了。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_001_w_opt1',
        text: '欣然接受，主动帮忙',
        feedback: '你热情地帮忙复印，老同事很满意，觉得你是个好相处的实习生。后来在工作中也愿意指导你。',
        effects: {
          reputation: 2,
          health: -1,
        },
      },
      {
        id: 'int_001_w_opt2',
        text: '面露难色，但还是照做',
        feedback: '你虽然不太情愿，但还是完成了任务。老同事感觉到了你的态度，以后不太找你帮忙了。',
        effects: {
          reputation: -1,
          health: -1,
        },
      },
      {
        id: 'int_001_w_opt3',
        text: '婉转拒绝，说自己也有工作',
        feedback: '你礼貌地说明自己手头也有工作要做。老同事有些不高兴，说你这个实习生架子不小。',
        effects: {
          reputation: -2,
        },
      },
    ],
  },

  {
    id: 'int_002_work',
    title: '前辈指导',
    description: '一位老工程师教你用手工方法计算钢筋下料长度。你在学校学的是用软件计算，觉得手工方法已经过时了。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_002_w_opt1',
        text: '虚心学习，认真记笔记',
        feedback: '你认真学习老工程师的经验，发现手工计算确实能帮助你更好地理解原理。老工程师很欣慰，把你当徒弟看待。',
        effects: {
          reputation: 3,
          health: -1,
        },
      },
      {
        id: 'int_002_w_opt2',
        text: '委婉提出软件计算更高效',
        feedback: '你提到可以用软件计算。老工程师有些不悦，说你不要仗着懂点新东西就目中无人。',
        effects: {
          reputation: -1,
        },
      },
      {
        id: 'int_002_w_opt3',
        text: '表面上听，实际按学校学的做',
        feedback: '你表面上在听，心里不以为然。后来在实际工作中，你发现自己对一些特殊情况处理不了，还是需要请教前辈。',
        effects: {
          reputation: 1,
          health: -1,
        },
      },
    ],
  },

  {
    id: 'int_003_work',
    title: '加班文化',
    description: '周五下午5点，项目经理说今晚需要加班整理资料。你本来和朋友约好了晚上聚餐。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_003_w_opt1',
        text: '积极加入，取消私人安排',
        feedback: '你主动留下来加班，项目经理觉得你很有奉献精神。虽然爽约了朋友，但在团队中留下了好印象。',
        effects: {
          reputation: 3,
          health: -3,
        },
      },
      {
        id: 'int_003_w_opt2',
        text: '说明已有安排，询问是否可以下次',
        feedback: '你礼貌地说明已有安排，项目经理虽然不太高兴，但也表示理解。你按时下班了，但感觉气氛有些尴尬。',
        effects: {
          reputation: 0,
          health: 1,
        },
      },
      {
        id: 'int_003_w_opt3',
        text: '直接拒绝，到点就下班',
        feedback: '你说自己有安排就直接下班了。第二天发现项目经理对你的态度冷淡了，把你列入了"不积极"的名单。',
        effects: {
          reputation: -3,
          health: 1,
        },
      },
    ],
  },

  {
    id: 'int_004_work',
    title: '食堂偶遇',
    description: '中午在食堂吃饭时，你听到项目经理和设计总监在隔壁桌谈论项目变更的事。这是重要的内部信息。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_004_w_opt1',
        text: '安静吃饭，假装没听到',
        feedback: '你装作没听到，继续吃饭。后来项目经理发现你在旁边，对你的分寸感表示认可。',
        effects: {
          reputation: 2,
        },
      },
      {
        id: 'int_004_w_opt2',
        text: '主动打招呼，加入话题',
        feedback: '你主动打招呼并加入讨论。项目经理脸色一沉，说"我们在谈公事"，然后他们换了个位置。',
        effects: {
          reputation: -2,
        },
      },
      {
        id: 'int_004_w_opt3',
        text: '换个位置，避免听到敏感信息',
        feedback: '你主动换到远处的桌子。后来项目经理知道你这么做，觉得你很有职业素养。',
        effects: {
          reputation: 3,
        },
      },
    ],
  },

  {
    id: 'int_005_work',
    title: '团建活动',
    description: '项目部组织周末爬山团建活动，每个人需要自费200元。你本来周末打算去兼职赚钱。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_005_w_opt1',
        text: '参加活动，自费承担',
        feedback: '你参加了团建，虽然花了钱，但和同事们拉近了关系。项目经理觉得你团队意识强。',
        effects: {
          reputation: 2,
          cash: -200,
          health: 2,
        },
      },
      {
        id: 'int_005_w_opt2',
        text: '说明经济困难，询问是否可以不参加',
        feedback: '你如实说明经济困难。项目经理表示理解，说以后有免费的活动再叫你。但感觉团队中你是个"外人"。',
        effects: {
          reputation: -1,
        },
      },
      {
        id: 'int_005_w_opt3',
        text: '找借口说家里有事',
        feedback: '你找了个借口没去。后来同事们分享活动照片时，你感觉更加疏远了。部门里有什么消息你总是最后才知道。',
        effects: {
          reputation: -2,
        },
      },
    ],
  },
];
