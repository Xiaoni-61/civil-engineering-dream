/**
 * 项目经理事件池
 * 职级：项目经理 (Rank.PROJECT_MANAGER)
 * 特点：全面负责项目管理，协调各方资源，承担盈亏责任
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';
import { RelationshipType } from '@shared/types';

export const managerEvents: DecisionEvent[] = [
  // ==================== 专业型事件（5个）====================

  {
    id: 'mgr_001_prof',
    title: '项目亏损危机',
    description: '负责的项目出现亏损，如果不能扭亏为盈，会影响你的职业发展和公司业绩。',
    category: 'professional',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '项目盈亏是项目经理的重要考核指标...',
    options: [
      {
        id: 'mgr_001_opt_a',
        text: '大力压缩成本，争取扭亏',
        feedback: '你大力压缩成本，通过精细管理成功扭亏为盈。虽然很辛苦，但展现了优秀的成本控制能力。',
        effects: {
          health: -4,
          reputation: 6,
          cash: 5000,
          quality: -2
        }
      },
      {
        id: 'mgr_001_opt_b',
        text: '寻求变更追加，增加收入',
        feedback: '你通过工程变更争取到了追加款项。虽然增加了收入，但需要和甲方反复协调。',
        effects: {
          health: -2,
          reputation: 4,
          cash: 4000,
          relationships: [
            { type: RelationshipType.CLIENT, change: -2 }
          ]
        }
      },
      {
        id: 'mgr_001_opt_c',
        text: '向公司申请支持',
        feedback: '你向公司说明了项目困难，申请了支持。公司同意了部分支持，项目得以继续，但你的能力受到质疑。',
        effects: {
          reputation: 2,
          cash: 2000
        }
      }
    ]
  },

  {
    id: 'mgr_002_prof',
    title: '项目资源冲突',
    description: '多个项目同时需要同一种资源（如设备、人员），你需要协调分配。如何处理会影响多个项目的进度。',
    category: 'professional',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '资源协调是项目经理的核心能力...',
    options: [
      {
        id: 'mgr_002_opt_a',
        text: '优先保障自己的项目',
        feedback: '你优先为自己项目争取资源。虽然保证了本项目的进度，但引起其他项目经理的不满。',
        effects: {
          reputation: 2,
          progress: 3,
          relationships: [
            { type: RelationshipType.LABOR, change: -3 }
          ]
        }
      },
      {
        id: 'mgr_002_opt_b',
        text: '协调各方，合理分配',
        feedback: '你主动协调各方，制定了合理的资源分配方案。所有项目都受到影响，但整体协调性很好。',
        effects: {
          health: -2,
          reputation: 5,
          progress: 1
        }
      },
      {
        id: 'mgr_002_opt_c',
        text: '向上级申请增加资源',
        feedback: '你向上级说明了资源冲突，申请增加资源投入。上级同意了部分申请，问题得到缓解。',
        effects: {
          reputation: 3,
          progress: 2,
          cash: -1000
        }
      }
    ]
  },

  {
    id: 'mgr_003_prof',
    title: '重大项目变更',
    description: '甲方提出了重大工程变更，需要重新评估成本和工期。这关系到项目盈亏，需要谨慎决策。',
    category: 'professional',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '重大变更是项目盈亏的关键点...',
    options: [
      {
        id: 'mgr_003_opt_a',
        text: '详细评估，争取合理价格',
        feedback: '你详细评估了变更影响，和甲方进行了多轮谈判。最终达成了合理的变更价格，项目利益得到保障。',
        effects: {
          health: -3,
          reputation: 5,
          cash: 6000,
          relationships: [
            { type: RelationshipType.CLIENT, change: 2 }
          ]
        }
      },
      {
        id: 'mgr_003_opt_b',
        text: '快速接受，维护客户关系',
        feedback: '你快速接受了变更，虽然价格不太理想，但维护了客户关系，为后续合作打下基础。',
        effects: {
          reputation: 3,
          cash: 3000,
          relationships: [
            { type: RelationshipType.CLIENT, change: 4 }
          ]
        }
      },
      {
        id: 'mgr_003_opt_c',
        text: '拒绝变更，坚持原合同',
        feedback: '你拒绝了甲方的变更要求。虽然保护了项目利益，但客户关系受到影响。',
        effects: {
          reputation: 2,
          relationships: [
            { type: RelationshipType.CLIENT, change: -5 }
          ]
        }
      }
    ]
  },

  {
    id: 'mgr_004_prof',
    title: '分包商管理',
    description: '分包商的进度和质量出现问题，影响整体项目。需要采取强硬措施还是协调解决？',
    category: 'professional',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '分包商管理是项目管理的重要环节...',
    options: [
      {
        id: 'mgr_004_opt_a',
        text: '强硬措施，要求整改',
        feedback: '你采取了强硬措施，要求分包商限期整改，否则扣除款项。分包商认真整改，问题得到解决。',
        effects: {
          reputation: 4,
          quality: 2,
          progress: 1,
          relationships: [
            { type: RelationshipType.LABOR, change: -3 }
          ]
        }
      },
      {
        id: 'mgr_004_opt_b',
        text: '协调支持，帮助改进',
        feedback: '你协调资源帮助分包商改进。虽然花费了一些精力，但问题得到解决，双方关系也更好了。',
        effects: {
          health: -2,
          reputation: 4,
          quality: 2,
          relationships: [
            { type: RelationshipType.LABOR, change: 3 }
          ]
        }
      },
      {
        id: 'mgr_004_opt_c',
        text: '更换分包商',
        feedback: '你决定更换分包商。虽然需要重新招标，但新分包商表现更好，长期来看是正确选择。',
        effects: {
          cash: -2000,
          progress: -2,
          quality: 2,
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'mgr_005_prof',
    title: '竣工验收攻坚',
    description: '项目进入竣工验收阶段，还有许多问题需要整改。时间紧迫，需要组织冲刺。',
    category: 'professional',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '竣工验收是项目的最后冲刺...',
    options: [
      {
        id: 'mgr_005_opt_a',
        text: '组织全员加班，冲刺验收',
        feedback: '你组织全员加班加点，快速完成所有整改。项目顺利通过验收，但团队都很疲惫。',
        effects: {
          health: -5,
          reputation: 5,
          progress: 3,
          quality: 2
        }
      },
      {
        id: 'mgr_005_opt_b',
        text: '合理安排，稳步推进',
        feedback: '你合理安排整改工作，稳步推进各项问题。虽然进度稍慢，但团队状态保持得不错。',
        effects: {
          health: -2,
          reputation: 4,
          progress: 1,
          quality: 2
        }
      },
      {
        id: 'mgr_005_opt_c',
        text: '协调验收方，放宽标准',
        feedback: '你和验收方进行了协调，一些次要问题得以放宽。验收顺利通过，但质量有所妥协。',
        effects: {
          reputation: 3,
          quality: -1,
          relationships: [
            { type: RelationshipType.SUPERVISION, change: -2 },
            { type: RelationshipType.GOVERNMENT, change: -2 }
          ]
        }
      }
    ]
  },

  // ==================== 职场型事件（5个）====================

  {
    id: 'mgr_001_work',
    title: '团队建设',
    description: '你负责的项目团队士气不高，需要采取措施提升团队凝聚力和士气。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '团队建设是项目经理的重要职责...',
    options: [
      {
        id: 'mgr_001_w_opt_a',
        text: '组织团建活动，增进感情',
        feedback: '你组织了团队建设活动，虽然花了一些钱，但团队氛围明显改善，工作效率提升了。',
        effects: {
          cash: -1500,
          health: -1,
          reputation: 4,
          progress: 2
        }
      },
      {
        id: 'mgr_001_w_opt_b',
        text: '改善工作条件，提高待遇',
        feedback: '你改善了团队的工作条件和生活待遇。虽然增加了成本，但大家工作积极性提高了。',
        effects: {
          cash: -3000,
          reputation: 4,
          progress: 2
        }
      },
      {
        id: 'mgr_001_w_opt_c',
        text: '强化管理，严格要求',
        feedback: '你强化了管理，制定了更严格的纪律。短期内团队效率提升了，但有些人有抵触情绪。',
        effects: {
          reputation: 2,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'mgr_002_work',
    title: '高层汇报',
    description: '需要向公司高层汇报项目进展。这是展现项目管理能力的机会，也面临被质疑的风险。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '向高层汇报是展现能力的重要场合...',
    options: [
      {
        id: 'mgr_002_w_opt_a',
        text: '精心准备，充分展示成果',
        feedback: '你精心准备了汇报材料，充分展示了项目成果和管理能力。高层对项目很满意，你的职业发展更有前景。',
        effects: {
          health: -2,
          reputation: 6
        }
      },
      {
        id: 'mgr_002_w_opt_b',
        text: '如实汇报，不夸大不隐瞒',
        feedback: '你如实汇报了项目情况，既说了成绩也说了问题。高层认可你的诚实，但也提出了一些改进要求。',
        effects: {
          health: -1,
          reputation: 4
        }
      },
      {
        id: 'mgr_002_w_opt_c',
        text: '突出亮点，淡化问题',
        feedback: '你的汇报突出了项目亮点，淡化了一些问题。虽然汇报效果不错，但高层可能发现了你的回避态度。',
        effects: {
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'mgr_003_work',
    title: '职业倦怠',
    description: '长期的高强度工作让你感到职业倦怠。需要调整心态和工作方式，否则会影响表现。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '职业倦怠是长期工作的常见问题...',
    options: [
      {
        id: 'mgr_003_w_opt_a',
        text: '坚持下去，克服倦怠',
        feedback: '你努力克服职业倦怠，坚持工作。虽然很辛苦，但展现了职业素养，项目业绩保持稳定。',
        effects: {
          health: -4,
          reputation: 3,
          progress: 1
        }
      },
      {
        id: 'mgr_003_w_opt_b',
        text: '调整工作方式，提高效率',
        feedback: '你调整了工作方式，授权团队更多，提高了效率。虽然需要时间适应，但长期看更可持续。',
        effects: {
          health: 1,
          reputation: 4,
          progress: 1
        }
      },
      {
        id: 'mgr_003_w_opt_c',
        text: '申请休假，调整状态',
        feedback: '你申请了短期休假调整状态。虽然工作暂时受到影响，但恢复后状态更好了。',
        effects: {
          health: 5,
          reputation: 2,
          progress: -1
        }
      }
    ]
  },

  {
    id: 'mgr_004_work',
    title: '客户关系维护',
    description: '项目完成后，需要维护客户关系，争取后续合作。这关系到未来的业务发展。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '客户关系是业务发展的重要基础...',
    options: [
      {
        id: 'mgr_004_w_opt_a',
        text: '主动拜访，深化关系',
        feedback: '你主动拜访客户，了解他们的需求和意见。客户很认可你的服务态度，后续合作机会大增。',
        effects: {
          health: -2,
          reputation: 5,
          relationships: [
            { type: RelationshipType.CLIENT, change: 5 }
          ]
        }
      },
      {
        id: 'mgr_004_w_opt_b',
        text: '定期联系，保持联络',
        feedback: '你定期和客户保持联系，虽然没有深入交往，但关系维护得不错。',
        effects: {
          reputation: 3,
          relationships: [
            { type: RelationshipType.CLIENT, change: 2 }
          ]
        }
      },
      {
        id: 'mgr_004_w_opt_c',
        text: '等待客户联系，被动应对',
        feedback: '你等待客户主动联系，客户也没有特别的需求。关系逐渐淡化，错失了一些后续机会。',
        effects: {
          reputation: 1,
          relationships: [
            { type: RelationshipType.CLIENT, change: -2 }
          ]
        }
      }
    ]
  },

  {
    id: 'mgr_005_work',
    title: '晋升机会',
    description: '公司有一个项目总监的职位空缺，你是候选人之一。需要争取这个晋升机会。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_MANAGER,
    flavorText: '晋升到项目总监是职业发展的重要一步...',
    options: [
      {
        id: 'mgr_005_w_opt_a',
        text: '积极争取，展现能力',
        feedback: '你积极争取晋升，充分展现了自己的管理能力和业绩。成功晋升为项目总监，开启了新的职业阶段。',
        effects: {
          health: -2,
          reputation: 7
        }
      },
      {
        id: 'mgr_005_w_opt_b',
        text: '保持现状，不主动争取',
        feedback: '你没有主动争取，而是保持现状。虽然错失了晋升机会，但也避免了竞争失败的风险。',
        effects: {
          reputation: 2
        }
      },
      {
        id: 'mgr_005_w_opt_c',
        text: '支持其他候选人',
        feedback: '你支持了其他候选人竞选。虽然没有自己晋升，但赢得了同事的好感，建立了良好的口碑。',
        effects: {
          reputation: 4
        }
      }
    ]
  }
];
