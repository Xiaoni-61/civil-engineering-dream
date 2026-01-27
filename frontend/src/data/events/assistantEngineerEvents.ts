/**
 * 助理工程师事件池
 * 职级：助理工程师 (Rank.ASSISTANT_ENGINEER)
 * 特点：开始独立负责部分工作，需要更多技术能力和协调能力
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';
import { RelationshipType } from '@shared/types';

export const assistantEngineerEvents: DecisionEvent[] = [
  // ==================== 专业型事件（5个）====================

  {
    id: 'asst_001_prof',
    title: '独立负责任务',
    description: '领导第一次让你独立负责一个小型分项工程。虽然规模不大，但这是展现能力的机会，也让你感到压力。',
    category: 'professional',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '从实习生到助理工程师，这是职业生涯的一大步...',
    options: [
      {
        id: 'asst_001_opt_a',
        text: '精心策划，确保万无一失',
        feedback: '你投入大量精力制定详细的施工方案和进度计划。工程顺利完成，质量很好，领导对你的能力表示认可。',
        effects: {
          health: -3,
          reputation: 5,
          quality: 3,
          progress: 2
        }
      },
      {
        id: 'asst_001_opt_b',
        text: '寻求前辈指导，稳步推进',
        feedback: '你主动请教资深工程师，获得了很多宝贵建议。在指导下工程顺利完成，你也学到了很多。',
        effects: {
          health: -1,
          reputation: 3,
          quality: 2,
          progress: 1
        }
      },
      {
        id: 'asst_001_opt_c',
        text: '按常规流程执行',
        feedback: '你按照标准流程执行，虽然完成得不错，但也没有特别亮点。领导认为你表现合格但不够突出。',
        effects: {
          reputation: 2,
          quality: 1
        }
      }
    ]
  },

  {
    id: 'asst_002_prof',
    title: '变更单处理',
    description: '甲方提出了一项工程变更，需要你编制变更单和预算。这是你第一次独立处理变更，需要仔细核算成本。',
    category: 'professional',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '工程变更是考验专业能力的重要环节...',
    options: [
      {
        id: 'asst_002_opt_a',
        text: '详细核算，确保数据准确',
        feedback: '你仔细核对了所有工程量和单价，编制的变更单准确无误。甲方和监理都很认可你的专业能力。',
        effects: {
          health: -2,
          reputation: 4,
          relationships: [
            { type: RelationshipType.CLIENT, change: 3 },
            { type: RelationshipType.SUPERVISION, change: 3 }
          ]
        }
      },
      {
        id: 'asst_002_opt_b',
        text: '参考以往类似变更，快速完成',
        feedback: '你参考了以前的类似变更单，快速编制完成。虽然效率高，但有个别细节不够准确，需要返工修改。',
        effects: {
          reputation: 1,
          health: -1
        }
      },
      {
        id: 'asst_002_opt_c',
        text: '请造价工程师协助审核',
        feedback: '你编制完成后请造价工程师帮忙审核。发现了一些问题并及时修正，最终的变更单质量很高。',
        effects: {
          reputation: 3,
          health: -1
        }
      }
    ]
  },

  {
    id: 'asst_003_prof',
    title: '施工方案编制',
    description: '你需要编制一个专项施工方案（如脚手架搭设方案）。这需要查阅规范、计算参数，专业性很强。',
    category: 'professional',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '专项方案是工程质量和安全的重要保障...',
    options: [
      {
        id: 'asst_003_opt_a',
        text: '深入研究规范，确保方案规范',
        feedback: '你花时间深入研究相关规范和标准，编制的方案完全符合要求。监理审核一次通过，对你的专业能力很赞赏。',
        effects: {
          health: -3,
          reputation: 4,
          quality: 3,
          relationships: [
            { type: RelationshipType.SUPERVISION, change: 4 }
          ]
        }
      },
      {
        id: 'asst_003_opt_b',
        text: '套用模板，稍作修改',
        feedback: '你使用了以前的模板，只做了简单修改。方案基本可用，但有些地方不够贴合实际，需要补充完善。',
        effects: {
          reputation: 1,
          quality: 1
        }
      },
      {
        id: 'asst_003_opt_c',
        text: '请教技术负责人，获得指导',
        feedback: '你主动向技术负责人请教，获得了很多专业指导。编制的方案质量很高，也学到了规范要求。',
        effects: {
          health: -2,
          reputation: 3,
          quality: 2
        }
      },
      {
        id: 'asst_003_opt_d',
        text: '🔧 深度优化方案（需工作能力≥25）',
        feedback: '你凭借对规范的深入理解，编制了超越常规要求的高质量方案。监理对你的专业水平非常赞赏，方案成为样板。',
        requiredAbility: { workAbility: 25 },
        hidden: true,
        effects: {
          health: -3,
          reputation: 6,
          quality: 4,
          relationships: [
            { type: RelationshipType.SUPERVISION, change: 6 }
          ]
        }
      }
    ]
  },

  {
    id: 'asst_004_prof',
    title: '质量问题处理',
    description: '你负责的施工区域出现了质量问题（如混凝土蜂窝麻面）。需要分析原因并制定处理方案。',
    category: 'professional',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '质量问题是对工程师能力的真正考验...',
    options: [
      {
        id: 'asst_004_opt_a',
        text: '立即返工整改，确保质量',
        feedback: '你果断决定返工整改，虽然增加了成本和工期，但保证了最终质量。监理认可你的质量意识。',
        effects: {
          health: -2,
          reputation: 3,
          quality: 3,
          progress: -2,
          cash: -800
        }
      },
      {
        id: 'asst_004_opt_b',
        text: '制定修补方案，局部处理',
        feedback: '你制定了详细的修补方案，对问题部位进行局部处理。经过修补后质量达到要求，成本和工期影响较小。',
        effects: {
          reputation: 2,
          quality: 1,
          cash: -300
        }
      },
      {
        id: 'asst_004_opt_c',
        text: '隐瞒不报，试图掩盖',
        feedback: '你试图掩盖问题，但被监理检查时发现了。问题被严肃处理，你的声誉受到了影响。',
        effects: {
          reputation: -5,
          quality: -3,
          relationships: [
            { type: RelationshipType.SUPERVISION, change: -5 }
          ]
        }
      },
      {
        id: 'asst_004_opt_d',
        text: '🎲 豪赌隐蔽处理（需幸运≥35）',
        feedback: '你决定冒险对问题部位进行隐蔽处理，赌监理不会发现。幸运的是，监理确实没有发现，项目顺利推进。',
        requiredAbility: { luck: 35 },
        riskFactor: 0.35,
        hidden: true,
        failureFeedback: '不幸的是，监理在检查中发现了问题。问题被严肃处理，你的声誉受到了严重影响。',
        effects: {
          reputation: 3,
          quality: -1,
          progress: 2,
          failure: {
            reputation: -8,
            quality: -5,
            relationships: [
              { type: RelationshipType.SUPERVISION, change: -8 }
            ]
          }
        }
      }
    ]
  },

  {
    id: 'asst_005_prof',
    title: '技术攻关',
    description: '项目中遇到一个技术难题（如复杂节点的钢筋绑扎）。需要研究解决方案，可能需要创新或请教专家。',
    category: 'professional',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '技术难题是展现创新能力的机会...',
    options: [
      {
        id: 'asst_005_opt_a',
        text: '查阅资料，提出创新方案',
        feedback: '你查阅了大量技术资料，提出了一个创新解决方案。经过论证可行实施，效果很好，受到领导表扬。',
        effects: {
          health: -3,
          reputation: 5,
          quality: 3,
          progress: 1
        }
      },
      {
        id: 'asst_005_opt_b',
        text: '组织技术讨论会，集思广益',
        feedback: '你组织了技术讨论会，汇聚团队智慧。最终方案综合了各方建议，实施效果不错，团队协作也得到加强。',
        effects: {
          health: -2,
          reputation: 3,
          quality: 2
        }
      },
      {
        id: 'asst_005_opt_c',
        text: '请教外部专家',
        feedback: '你联系了行业专家请教，获得了专业指导。虽然需要花费一些咨询费，但问题得到很好的解决。',
        effects: {
          cash: -1000,
          reputation: 3,
          quality: 3
        }
      },
      {
        id: 'asst_005_opt_d',
        text: '🔧 自主技术攻关（需工作能力≥25）',
        feedback: '你凭借扎实的技术功底，独立研究了大量资料，提出了创新解决方案。虽然很辛苦，但技术能力得到大幅提升，领导对你的潜力刮目相看。',
        requiredAbility: { workAbility: 25 },
        hidden: true,
        effects: {
          health: -4,
          reputation: 6,
          quality: 4,
          workAbility: 3
        }
      }
    ]
  },

  // ==================== 职场型事件（5个）====================

  {
    id: 'asst_001_work',
    title: '新人带教',
    description: '部门来了新的实习生，领导安排你作为导师进行带教。这会增加你的工作量，但也是锻炼管理能力的机会。',
    category: 'workplace',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '带教新人是成长的必经之路...',
    options: [
      {
        id: 'asst_001_w_opt_a',
        text: '认真带教，倾囊相授',
        feedback: '你投入大量精力指导实习生，制定了详细的培养计划。实习生进步很快，领导也认可你的带教能力。',
        effects: {
          health: -2,
          reputation: 4
        }
      },
      {
        id: 'asst_001_w_opt_b',
        text: '让实习生自己摸索，适当指导',
        feedback: '你给实习生一些自主空间，在关键时刻给予指导。实习生学到了东西，你也没有太累。',
        effects: {
          health: -1,
          reputation: 2
        }
      },
      {
        id: 'asst_001_w_opt_c',
        text: '找借口推脱带教任务',
        feedback: '你以工作忙为由推脱了带教任务。领导虽然同意了，但对你不愿意承担更多责任有些失望。',
        effects: {
          reputation: -2
        }
      }
    ]
  },

  {
    id: 'asst_002_work',
    title: '部门会议发言',
    description: '在部门例会上，领导询问大家对某项工作的意见。你有想法但不太确定是否应该当众提出。',
    category: 'workplace',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '会议发言是展现思考能力的机会...',
    options: [
      {
        id: 'asst_002_w_opt_a',
        text: '积极发言，提出自己的见解',
        feedback: '你积极发言，提出了有建设性的意见。领导对你的思考能力表示认可，同事们也开始重视你的观点。',
        effects: {
          reputation: 4
        }
      },
      {
        id: 'asst_002_w_opt_b',
        text: '保持沉默，听听别人怎么说',
        feedback: '你没有发言，只是听取了大家的意见。虽然不会出错，但也失去了一个展现自己的机会。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'asst_002_w_opt_c',
        text: '会后私下向领导提出建议',
        feedback: '你没有在会上公开发言，但会后私下向领导提出了一些建议。领导觉得你的建议不错，也赞赏你的方式。',
        effects: {
          reputation: 2
        }
      }
    ]
  },

  {
    id: 'asst_003_work',
    title: '加班安排',
    description: '项目进入关键阶段，需要经常加班。你家里有些事情需要处理，但也不想影响工作。',
    category: 'workplace',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '工作与生活的平衡总是很难...',
    options: [
      {
        id: 'asst_003_w_opt_a',
        text: '以工作为重，全力投入',
        feedback: '你把工作放在第一位，全力投入加班。项目顺利推进，领导对你的敬业精神很满意，但身体有点吃不消。',
        effects: {
          health: -4,
          reputation: 4,
          progress: 2
        }
      },
      {
        id: 'asst_003_w_opt_b',
        text: '和领导沟通，争取灵活安排',
        feedback: '你和领导沟通了家庭情况，申请灵活安排加班时间。领导理解你的困难，同意了调整方案。',
        effects: {
          health: 1,
          reputation: 2
        }
      },
      {
        id: 'asst_003_w_opt_c',
        text: '按时下班，处理私事',
        feedback: '你按时下班处理家里的事情。虽然耽误了一些工作进度，但身体得到了休息，家庭关系也更好了。',
        effects: {
          health: 2,
          reputation: -1,
          progress: -1
        }
      }
    ]
  },

  {
    id: 'asst_004_work',
    title: '职称评审',
    description: '到了职称评审的时间，你准备申报中级工程师职称。需要准备大量材料，还需要通过考试。',
    category: 'workplace',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '职称是职业发展的重要里程碑...',
    options: [
      {
        id: 'asst_004_w_opt_a',
        text: '全力准备，争取一次通过',
        feedback: '你投入大量时间准备评审材料和考试。虽然很辛苦，但最终顺利通过了评审，职级得到提升。',
        effects: {
          health: -4,
          reputation: 5
        }
      },
      {
        id: 'asst_004_w_opt_b',
        text: '边工作边准备，稳步推进',
        feedback: '你在工作之余准备评审，进度较慢。今年材料准备不够充分，决定明年再试。',
        effects: {
          health: -2,
          reputation: 1
        }
      },
      {
        id: 'asst_004_w_opt_c',
        text: '咨询前辈，获取评审经验',
        feedback: '你咨询了通过评审的前辈，获得了很多宝贵经验。准备更有针对性，评审顺利通过。',
        effects: {
          health: -3,
          reputation: 4
        }
      }
    ]
  },

  {
    id: 'asst_005_work',
    title: '跨部门协作',
    description: '你需要和其他部门协调工作。对方的配合度不高，导致工作进展缓慢。需要想办法推进。',
    category: 'workplace',
    requiredRank: Rank.ASSISTANT_ENGINEER,
    flavorText: '跨部门协作考验沟通协调能力...',
    options: [
      {
        id: 'asst_005_w_opt_a',
        text: '向领导反映，寻求协调',
        feedback: '你向领导反映了协调困难。领导出面协调后，问题得到了解决，但你觉得有些依赖领导。',
        effects: {
          reputation: 2
        }
      },
      {
        id: 'asst_005_w_opt_b',
        text: '主动沟通，建立良好关系',
        feedback: '你主动和对方部门沟通，通过多次协调建立了良好的工作关系。之后的工作合作顺畅多了。',
        effects: {
          health: -2,
          reputation: 4
        }
      },
      {
        id: 'asst_005_w_opt_c',
        text: '发函催促，正式要求配合',
        feedback: '你发了正式函件要求对方配合。虽然形式上很正式，但对方配合度提高了，工作得以推进。',
        effects: {
          reputation: 2
        }
      }
    ]
  }
];
