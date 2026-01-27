/**
 * 通用事件池
 * 所有职级都可以遇到的通用事件
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';
import { RelationshipType } from '@shared/types';

export const commonEvents: DecisionEvent[] = [
  // ==================== 专业型事件（10个）====================

  {
    id: 'com_001_prof',
    title: '天气突变',
    description: '天气预报说今晚有暴雨，可能会影响明天的混凝土浇筑计划。你可以提前做准备，也可以赌一把天气好转。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '建筑行业的天气风险永远存在...',
    options: [
      {
        id: 'com_001_opt_a',
        text: '提前准备防雨措施，购买雨布和遮盖材料',
        feedback: '你未雨绸缪，准备了充足的防雨材料。虽然花了一些钱，但保证了工程质量，甲方对你的责任心表示赞赏。',
        effects: {
          cash: -500,
          reputation: 3,
          relationships: [
            { type: RelationshipType.CLIENT, change: 3 }
          ]
        }
      },
      {
        id: 'com_001_opt_b',
        text: '等待天气进一步确认，暂不行动',
        feedback: '你决定观望。天气预报有时不准确，冒点险也许能省下防雨措施的费用。结果雨真的下了，导致部分混凝土表面出现瑕疵。',
        effects: {
          quality: -3,
          reputation: -2
        }
      },
      {
        id: 'com_001_opt_c',
        text: '联系气象部门获取更准确的预报',
        feedback: '你通过人脉关系获取了更准确的气象信息，提前调整了施工计划。专业的人脉资源帮了大忙。',
        effects: {
          reputation: 2,
          relationships: [
            { type: RelationshipType.GOVERNMENT, change: 2 }
          ]
        }
      },
      {
        id: 'com_001_opt_d',
        text: '🎲 豪赌天气好转（需幸运≥40）',
        feedback: '你凭借直觉判断天气会好转，决定不采取防雨措施。运气爆棚！雨真的停了，你省下了防雨费用，工程也顺利完成。',
        requiredAbility: { luck: 40 },
        riskFactor: 0.3,
        hidden: true,
        failureFeedback: '很不幸，暴雨倾盆而下！工地被淹，材料和设备都受损，损失惨重。',
        effects: {
          reputation: 3,
          cash: 500,
          failure: {
            reputation: -5,
            cash: -3000,
            quality: -3,
            progress: -3
          }
        }
      }
    ]
  },

  {
    id: 'com_002_prof',
    title: '设备故障',
    description: '工地上的一台关键设备突然故障，维修需要时间和费用。这会影响施工进度，你需要做出决策。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '设备老化是每个工地都会遇到的问题...',
    options: [
      {
        id: 'com_002_opt_a',
        text: '立即联系厂家维修，不耽误工期',
        feedback: '你果断联系厂家进行紧急维修。虽然花费较高，但设备很快恢复正常，没有延误工期。',
        effects: {
          cash: -1000,
          progress: 2,
          reputation: 2
        }
      },
      {
        id: 'com_002_opt_b',
        text: '尝试自己修理，节省费用',
        feedback: '你决定自己动手修理。虽然花了一些时间研究，但最终还是修好了，省下了一笔维修费。',
        effects: {
          cash: -200,
          progress: -2,
          health: -2
        }
      },
      {
        id: 'com_002_opt_c',
        text: '租用替代设备，继续施工',
        feedback: '你租了一台替代设备，虽然有点贵，但保证了施工进度不受影响。',
        effects: {
          cash: -800,
          progress: 1
        }
      },
      {
        id: 'com_002_opt_d',
        text: '🔧 技术诊断维修（需工作能力≥25）',
        feedback: '你凭借扎实的机械知识，精准诊断出故障原因并自己动手修理。不仅省了维修费，还提升了团队对你的技术能力的认可。',
        requiredAbility: { workAbility: 25 },
        hidden: true,
        effects: {
          cash: -100,
          progress: 1,
          reputation: 5,
          workAbility: 2
        }
      }
    ]
  },

  {
    id: 'com_003_prof',
    title: '材料价格波动',
    description: '近期主要建材价格出现明显波动。钢材价格上涨，水泥价格下跌。你需要调整采购策略。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '市场行情瞬息万变，需要灵活应对...',
    options: [
      {
        id: 'com_003_opt_a',
        text: '提前锁定钢材价格，大量采购',
        feedback: '你果断锁定钢材价格，大量采购。之后钢材继续上涨，你的决策为公司节省了成本。',
        effects: {
          cash: -2000,
          reputation: 3
        }
      },
      {
        id: 'com_003_opt_b',
        text: '观望行情，暂不大量采购',
        feedback: '你决定谨慎观望。结果钢材持续上涨，水泥价格反弹，两头都没占到便宜，被批评不够果断。',
        effects: {
          cash: -500,
          reputation: -2
        }
      },
      {
        id: 'com_003_opt_c',
        text: '调整材料配比，减少钢材用量',
        feedback: '你通过技术手段调整了配比，在不影响质量的前提下降低了钢材消耗。展现了专业能力。',
        effects: {
          quality: 1,
          reputation: 2,
          health: -1
        }
      },
      {
        id: 'com_003_opt_d',
        text: '🔧 精准市场预测（需工作能力≥30）',
        feedback: '你凭借对市场的深入研究和分析，精准预测了价格走势。提前低买高卖，为公司节省了大量成本，被誉为"市场分析师"！',
        requiredAbility: { workAbility: 30 },
        hidden: true,
        effects: {
          cash: 3000,
          reputation: 6,
          workAbility: 2
        }
      }
    ]
  },

  {
    id: 'com_004_prof',
    title: '现场变更',
    description: '甲方在现场发现一处设计不合理的地方，要求立即变更。这需要重新计算和调整施工方案。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '甲方的临时要求总是让人头疼...',
    options: [
      {
        id: 'com_004_opt_a',
        text: '立即执行变更，加班完成方案调整',
        feedback: '你连夜加班完成了方案调整，及时满足了甲方要求。甲方对你的效率和执行力很满意。',
        effects: {
          health: -3,
          reputation: 4,
          relationships: [
            { type: RelationshipType.CLIENT, change: 5 }
          ]
        }
      },
      {
        id: 'com_004_opt_b',
        text: '向甲方说明影响，建议延后变更',
        feedback: '你向甲方详细说明了变更的影响和风险。甲方理解后同意延期到下一阶段，避免了匆忙变更可能带来的问题。',
        effects: {
          reputation: 2,
          relationships: [
            { type: RelationshipType.CLIENT, change: 2 }
          ]
        }
      },
      {
        id: 'com_004_opt_c',
        text: '联系设计院，由专业设计师确认',
        feedback: '你联系设计院的专业设计师进行评估。设计师提出了一些优化建议，既满足了甲方需求，又保证了工程质量。',
        effects: {
          reputation: 3,
          relationships: [
            { type: RelationshipType.CLIENT, change: 2 },
            { type: RelationshipType.DESIGN, change: 3 }
          ]
        }
      },
      {
        id: 'com_004_opt_d',
        text: '🎲 豪赌甲方放弃（需幸运≥30）',
        feedback: '你赌甲方只是随口一说，故意拖延处理。运气不错！甲方后来真的忘记了这件事，避免了额外工作。',
        requiredAbility: { luck: 30 },
        riskFactor: 0.5,
        hidden: true,
        failureFeedback: '很不幸，甲方非常重视这个变更，发现你拖延处理大发雷霆！关系严重受损，需要花大量精力弥补。',
        effects: {
          reputation: 3,
          health: 1,
          failure: {
            reputation: -8,
            relationships: [
              { type: RelationshipType.CLIENT, change: -10 }
            ]
          }
        }
      }
    ]
  },

  {
    id: 'com_005_prof',
    title: '第三方检测',
    description: '第三方检测机构突然到工地进行抽检，发现一些小问题（如安全警示标识不足、材料堆放不规范）。需要整改。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '第三方检查总是来得猝不及防...',
    options: [
      {
        id: 'com_005_opt_a',
        text: '立即整改所有问题，配合检查',
        feedback: '你迅速组织整改，消除了所有问题。检测机构对你的配合度和整改效率表示认可。',
        effects: {
          cash: -300,
          reputation: 2,
          relationships: [
            { type: RelationshipType.GOVERNMENT, change: 3 }
          ]
        }
      },
      {
        id: 'com_005_opt_b',
        text: '说明情况，争取从宽处理',
        feedback: '你向检测人员详细说明了项目进度和实际困难。他们表示理解，只要求限期整改，没有开具罚单。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'com_005_opt_c',
        text: '通过关系协调，减轻处罚',
        feedback: '你通过人脉关系与检测机构沟通，最终问题得到了妥善处理，没有影响项目进度。',
        effects: {
          reputation: 2,
          relationships: [
            { type: RelationshipType.GOVERNMENT, change: -2 },
            { type: RelationshipType.SUPERVISION, change: 2 }
          ]
        }
      }
    ]
  },

  {
    id: 'com_006_prof',
    title: '技术交底会',
    description: '下周将进行重要的技术交底会，需要准备详细的PPT和技术资料。这是展示专业能力的好机会。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '技术交底会是工程师的舞台...',
    options: [
      {
        id: 'com_006_opt_a',
        text: '精心准备，通宵制作高质量PPT',
        feedback: '你投入大量精力准备了精美的技术交底材料。会议效果很好，领导和同事都认可你的专业能力。',
        effects: {
          health: -3,
          reputation: 4
        }
      },
      {
        id: 'com_006_opt_b',
        text: '使用旧模板，简单更新内容',
        feedback: '你用旧模板快速完成了准备。虽然内容没问题，但 presentation 效果一般，没有给人留下深刻印象。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'com_006_opt_c',
        text: '请教前辈，获取专业建议',
        feedback: '你主动请教资深工程师，获得了一些宝贵建议。技术交底会表现不错，前辈也赞赏你的好学态度。',
        effects: {
          reputation: 3,
          health: -1
        }
      }
    ]
  },

  {
    id: 'com_007_prof',
    title: '工期紧张',
    description: '项目工期突然提前，需要在更短时间内完成更多工作。团队士气受到影响，你需要应对。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '工期压力是建筑行业的常态...',
    options: [
      {
        id: 'com_007_opt_a',
        text: '组织团队会议，鼓舞士气',
        feedback: '你召开动员会，向团队说明了情况并鼓舞士气。虽然还是辛苦，但大家情绪有所好转。',
        effects: {
          reputation: 2,
          progress: 2,
          health: -1
        }
      },
      {
        id: 'com_007_opt_b',
        text: '申请增加资源，加班赶工',
        feedback: '你向上级申请增加人力和设备投入。虽然需要协调，但资源到位后进度明显加快。',
        effects: {
          progress: 3,
          reputation: 2,
          health: -2
        }
      },
      {
        id: 'com_007_opt_c',
        text: '优化施工流程，提高效率',
        feedback: '你分析了施工流程，找出可以优化的环节。通过调整工序，在不增加成本的情况下提高了效率。',
        effects: {
          progress: 2,
          quality: 1,
          reputation: 3,
          health: -2
        }
      }
    ]
  },

  {
    id: 'com_008_prof',
    title: '图纸会审',
    description: '项目开始前进行图纸会审，你发现了几处明显的设计问题。需要在会上提出或私下处理。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '图纸会审是发现问题的关键环节...',
    options: [
      {
        id: 'com_008_opt_a',
        text: '在会上直接指出，寻求解决方案',
        feedback: '你在会上坦诚地指出了问题。虽然让设计师有点尴尬，但问题得到了及时解决，避免了后期返工。',
        effects: {
          reputation: 2,
          quality: 2,
          relationships: [
            { type: RelationshipType.DESIGN, change: -2 }
          ]
        }
      },
      {
        id: 'com_008_opt_b',
        text: '会后私下联系设计师沟通',
        feedback: '你在会后私下联系了设计师，委婉地指出了问题。设计师很感激你的面子，问题也得到了解决。',
        effects: {
          reputation: 1,
          quality: 2,
          relationships: [
            { type: RelationshipType.DESIGN, change: 3 }
          ]
        }
      },
      {
        id: 'com_008_opt_c',
        text: '记录问题，等待施工时再说',
        feedback: '你记录了问题但没立即处理。结果施工时这些问题暴露出来，造成了不必要的返工和延误。',
        effects: {
          reputation: -3,
          progress: -3,
          quality: -2
        }
      }
    ]
  },

  {
    id: 'com_009_prof',
    title: '特殊工艺',
    description: '项目中有一项特殊工艺，团队之前没有接触过。需要学习新技术或寻求外部支持。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '新技术既是挑战也是机遇...',
    options: [
      {
        id: 'com_009_opt_a',
        text: '组织技术培训，团队共同学习',
        feedback: '你组织了技术培训，团队一起学习新工艺。虽然花了时间，但团队整体能力得到提升。',
        effects: {
          health: -2,
          reputation: 3,
          progress: -1,
          quality: 2
        }
      },
      {
        id: 'com_009_opt_b',
        text: '外包给专业团队',
        feedback: '你决定将这部分工作外包给专业团队。虽然增加了成本，但保证了质量和进度。',
        effects: {
          cash: -1500,
          progress: 1,
          quality: 2
        }
      },
      {
        id: 'com_009_opt_c',
        text: '自己先研究，再指导团队',
        feedback: '你自己先花时间研究新工艺，然后指导团队实施。展现了学习能力，但身体有点吃不消。',
        effects: {
          health: -4,
          reputation: 2,
          quality: 1
        }
      }
    ]
  },

  {
    id: 'com_010_prof',
    title: '验收准备',
    description: '项目即将进行阶段验收，需要准备大量资料和现场整改。时间紧任务重。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '验收是每个项目的关键节点...',
    options: [
      {
        id: 'com_010_opt_a',
        text: '加班加点，确保万无一失',
        feedback: '你连续几天加班准备验收资料和现场整改。验收顺利通过，但身体有点透支。',
        effects: {
          health: -4,
          reputation: 4,
          quality: 2
        }
      },
      {
        id: 'com_010_opt_b',
        text: '按部就班，能准备多少算多少',
        feedback: '你按常规节奏准备。虽然验收勉强通过，但被指出了一些细节问题，需要整改。',
        effects: {
          reputation: 1,
          quality: 1
        }
      },
      {
        id: 'com_010_opt_c',
        text: '寻求同事帮助，分工协作',
        feedback: '你组织同事分工协作，高效完成了验收准备工作。验收顺利通过，团队协作也得到加强。',
        effects: {
          health: -2,
          reputation: 3,
          quality: 2
        }
      }
    ]
  },

  // ==================== 职场型事件（10个）====================

  {
    id: 'com_001_work',
    title: '办公室聚餐',
    description: '同事们提议周末聚餐，AA制，人均约200元。你最近手头有点紧，但不去可能影响关系。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '职场社交总是逃不掉的...',
    options: [
      {
        id: 'com_001_w_opt_a',
        text: '参加聚餐，维护同事关系',
        feedback: '你参加了聚餐，虽然花了不少钱，但和同事的关系更加融洽。工作中大家也更愿意配合你。',
        effects: {
          cash: -200,
          reputation: 2
        }
      },
      {
        id: 'com_001_w_opt_b',
        text: '委婉拒绝，说明经济困难',
        feedback: '你坦诚说明了自己的经济情况。同事们表示理解，没有强求。虽然少了一次社交机会，但也没人因此对你有意见。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'com_001_w_opt_c',
        text: '参加但只点便宜的菜品',
        feedback: '你参加了聚餐但点了便宜的菜品。虽然有点尴尬，但至少参与其中了。',
        effects: {
          cash: -100,
          reputation: 1
        }
      }
    ]
  },

  {
    id: 'com_002_work',
    title: '领导视察',
    description: '公司高层领导要来工地视察，需要准备汇报材料和现场整理。这是一个展示工作的机会。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '高层视察既是压力也是机遇...',
    options: [
      {
        id: 'com_002_w_opt_a',
        text: '精心准备，争取给领导留下好印象',
        feedback: '你精心准备了汇报材料，现场也整理得很整洁。领导对你的工作印象深刻，可能对你未来的发展有帮助。',
        effects: {
          health: -2,
          reputation: 4
        }
      },
      {
        id: 'com_002_w_opt_b',
        text: '按常规准备，不过分强调',
        feedback: '你按常规流程准备了视察工作。领导视察顺利，但也没有特别亮点。',
        effects: {
          health: -1,
          reputation: 2
        }
      },
      {
        id: 'com_002_w_opt_c',
        text: '借机汇报工作中的困难',
        feedback: '你在汇报中提到了项目遇到的实际困难。领导很重视，当场指示相关部门协调解决。',
        effects: {
          health: -1,
          reputation: 3,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'com_003_work',
    title: '行业会议',
    description: '行业协会组织技术交流会，参会费用500元，可以学习新技术和拓展人脉。但需要占用一个周末。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '行业交流是提升自己的重要途径...',
    options: [
      {
        id: 'com_003_w_opt_a',
        text: '参加会议，积极学习交流',
        feedback: '你参加了技术交流会，学到了不少新知识，也认识了一些行业同仁。对自己的职业发展有帮助。',
        effects: {
          cash: -500,
          health: -2,
          reputation: 3
        }
      },
      {
        id: 'com_003_w_opt_b',
        text: '不参加，休息调整',
        feedback: '你决定不参加会议，好好休息。虽然错失了学习机会，但身体得到了放松。',
        effects: {
          health: 3
        }
      },
      {
        id: 'com_003_w_opt_c',
        text: '参加但只听免费的公开课',
        feedback: '你参加了会议但只听了免费的公开课部分。虽然学得不多，但至少了解了行业动态。',
        effects: {
          cash: -100,
          health: -1,
          reputation: 1
        }
      }
    ]
  },

  {
    id: 'com_004_work',
    title: '项目协调会',
    description: '多部门项目协调会，各方都有自己的利益诉求。会议可能会很漫长，需要协调各方矛盾。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '协调会是检验沟通能力的地方...',
    options: [
      {
        id: 'com_004_w_opt_a',
        text: '积极协调，寻求各方都能接受的方案',
        feedback: '你在会议中积极协调各方矛盾，最终找到了大家都接受的方案。领导和同事都认可你的协调能力。',
        effects: {
          health: -2,
          reputation: 3
        }
      },
      {
        id: 'com_004_w_opt_b',
        text: '保持沉默，让其他人先讨论',
        feedback: '你在会议上保持沉默，让更有经验的人主导讨论。虽然显得比较被动，但也没犯错误。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'com_004_w_opt_c',
        text: '维护自己部门的利益',
        feedback: '你在会议上积极维护自己部门的利益。虽然可能让其他部门不爽，但为本部门争取到了更好的条件。',
        effects: {
          reputation: 2,
          relationships: [
            { type: RelationshipType.LABOR, change: -2 }
          ]
        }
      }
    ]
  },

  {
    id: 'com_005_work',
    title: '考证学习',
    description: '公司鼓励员工考取专业证书，但需要大量时间学习。你最近工作很忙，很难平衡学习和工作。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '专业证书是职业发展的重要助力...',
    options: [
      {
        id: 'com_005_w_opt_a',
        text: '加班学习，争取早日拿到证书',
        feedback: '你每天晚上都坚持学习，虽然很累但进步很快。同事们都佩服你的毅力，领导也注意到了你的上进心。',
        effects: {
          health: -3,
          reputation: 3
        }
      },
      {
        id: 'com_005_w_opt_b',
        text: '暂时放弃，等工作不忙再考虑',
        feedback: '你决定暂时放下考证，专注于工作。虽然放弃了学习机会，但工作表现不错。',
        effects: {
          reputation: 1,
          progress: 1
        }
      },
      {
        id: 'com_005_w_opt_c',
        text: '利用碎片时间学习，慢慢准备',
        feedback: '你利用通勤和午休时间学习。虽然进度慢，但长期坚持也会有收获。',
        effects: {
          health: -1,
          reputation: 2
        }
      }
    ]
  },

  {
    id: 'com_006_work',
    title: '出差安排',
    description: '公司安排你到外地项目出差一周，需要离开家人和朋友。但这是积累经验的好机会。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '出差是成长的必经之路...',
    options: [
      {
        id: 'com_006_w_opt_a',
        text: '欣然接受，积极学习',
        feedback: '你积极接受出差安排，在外地项目中学习了很多新知识。虽然很辛苦，但收获很大。',
        effects: {
          health: -2,
          reputation: 3,
          progress: 2
        }
      },
      {
        id: 'com_006_w_opt_b',
        text: '尝试推脱，留在本地',
        feedback: '你尝试推脱出差，但领导表示需要你的支持。你勉强接受了，但给领导留下了不太积极的印象。',
        effects: {
          reputation: -2
        }
      },
      {
        id: 'com_006_w_opt_c',
        text: '接受但争取缩短出差时间',
        feedback: '你接受了出差但和领导协商缩短了时间。领导理解你的困难，同意了调整方案。',
        effects: {
          health: -1,
          reputation: 2
        }
      }
    ]
  },

  {
    id: 'com_007_work',
    title: '绩效评估',
    description: '到了年度绩效评估时间，需要写工作总结和自评。你今年表现不错，但不确定领导是否认可。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '绩效评估是展示自己的机会...',
    options: [
      {
        id: 'com_007_w_opt_a',
        text: '认真准备，详细总结工作成果',
        feedback: '你认真准备了工作总结，详细列出了自己的成绩和贡献。领导认可了你的工作，绩效评级不错。',
        effects: {
          health: -1,
          reputation: 3
        }
      },
      {
        id: 'com_007_w_opt_b',
        text: '简单写写，低调处理',
        feedback: '你的工作总结写得比较简单。虽然领导知道你的工作表现，但自评不够积极可能影响了评级。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'com_007_w_opt_c',
        text: '请教领导，了解对自己的评价',
        feedback: '你在写总结前先请教了领导的意见。领导给了你一些反馈，你的自评更加准确和积极。',
        effects: {
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'com_008_work',
    title: '技术分享',
    description: '部门组织技术分享会，需要有人主讲。你最近接触了一些新技术，可以考虑分享。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '技术分享是提升影响力的好机会...',
    options: [
      {
        id: 'com_008_w_opt_a',
        text: '主动报名分享新技术',
        feedback: '你主动报名进行了技术分享。虽然准备很辛苦，但分享效果很好，同事们都学到了新东西，你的专业形象也提升了。',
        effects: {
          health: -2,
          reputation: 4
        }
      },
      {
        id: 'com_008_w_opt_b',
        text: '不主动报名，只是旁听',
        feedback: '你没有主动报名，只是作为听众参与了分享会。虽然学到了一些东西，但也没有特别收获。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'com_008_w_opt_c',
        text: '协助主讲人准备材料',
        feedback: '你没有主讲，但协助主讲人准备了分享材料。主讲人很感谢你的帮助，你的贡献也被大家看到。',
        effects: {
          health: -1,
          reputation: 2
        }
      }
    ]
  },

  {
    id: 'com_009_work',
    title: '岗位调整',
    description: '公司进行组织调整，可能需要轮岗到其他项目或部门。你当前的项目做得不错，但轮岗可能带来新的机会。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '岗位调整既是挑战也是机遇...',
    options: [
      {
        id: 'com_009_w_opt_a',
        text: '接受轮岗，迎接新挑战',
        feedback: '你积极接受岗位调整，在新岗位上快速适应。虽然需要重新建立关系，但学到了更多经验。',
        effects: {
          health: -1,
          reputation: 3,
          progress: 2
        }
      },
      {
        id: 'com_009_w_opt_b',
        text: '申请留在当前岗位',
        feedback: '你申请留在当前熟悉的项目。领导理解你的想法，同意让你继续负责当前工作。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'com_009_w_opt_c',
        text: '咨询领导意见，听取建议',
        feedback: '你主动咨询领导对岗位调整的建议。领导分析了你的发展情况，给出了中肯的建议。你按照建议做出了选择。',
        effects: {
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'com_010_work',
    title: '工作压力',
    description: '最近工作压力很大，经常加班。身体开始出现疲劳信号，需要适当调整。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    flavorText: '工作是马拉松，不是百米冲刺...',
    options: [
      {
        id: 'com_010_w_opt_a',
        text: '坚持工作，争取尽快完成任务',
        feedback: '你咬牙坚持工作，加班加点赶进度。虽然任务完成了，但身体明显吃不消，需要好好休息。',
        effects: {
          health: -5,
          progress: 3,
          reputation: 2
        }
      },
      {
        id: 'com_010_w_opt_b',
        text: '适当休息，调整状态',
        feedback: '你决定放慢节奏，适当休息调整。虽然进度稍慢，但身体状态改善了，工作效率反而提高了。',
        effects: {
          health: 3,
          progress: -1
        }
      },
      {
        id: 'com_010_w_opt_c',
        text: '和领导沟通，调整工作安排',
        feedback: '你和领导沟通了工作压力问题。领导理解你的困难，适当调整了工作分配。你感觉轻松了一些。',
        effects: {
          health: 2,
          reputation: 2
        }
      }
    ]
  }
];
