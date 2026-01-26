/**
 * 项目总监事件池
 * 职级：项目总监 (Rank.PROJECT_DIRECTOR)
 * 特点：管理多个项目，制定战略决策，承担更大的经营责任
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';

export const directorEvents: DecisionEvent[] = [
  // ==================== 专业型事件（5个）====================

  {
    id: 'dir_001_prof',
    title: '多项目协调',
    description: '你同时管理多个项目，出现了资源分配冲突。需要统筹协调，确保所有项目都能顺利推进。',
    category: 'professional',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '多项目协调是项目总监的核心能力...',
    options: [
      {
        id: 'dir_001_opt_a',
        text: '制定优先级，重点保障关键项目',
        feedback: '你制定了项目优先级，重点保障关键项目的资源。关键项目进展顺利，但其他项目受到一定影响。',
        effects: {
          health: -2,
          reputation: 5,
          progress: 2,
          quality: 1
        }
      },
      {
        id: 'dir_001_opt_b',
        text: '优化资源配置，平衡各方需求',
        feedback: '你优化了资源配置，平衡了各项目的需求。虽然协调工作很辛苦，但整体效果很好。',
        effects: {
          health: -3,
          reputation: 6,
          progress: 2,
          quality: 2
        }
      },
      {
        id: 'dir_001_opt_c',
        text: '申请增加资源投入',
        feedback: '你向公司申请了增加资源投入。公司同意了部分申请，问题得到缓解，但你的协调能力受到质疑。',
        effects: {
          reputation: 3,
          progress: 2,
          cash: -3000
        }
      }
    ]
  },

  {
    id: 'dir_002_prof',
    title: '战略项目决策',
    description: '公司有一个重大战略项目需要决策，投资大但前景好。需要你评估风险并提出建议。',
    category: 'professional',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '战略项目决策影响公司的长远发展...',
    options: [
      {
        id: 'dir_002_opt_a',
        text: '支持项目，积极推动',
        feedback: '你积极支持这个战略项目，提供了详实的分析报告。公司采纳了你的建议，项目成功实施，为公司开拓了新业务。',
        effects: {
          health: -3,
          reputation: 8,
          cash: 10000
        }
      },
      {
        id: 'dir_002_opt_b',
        text: '谨慎评估，提出风险',
        feedback: '你谨慎评估了项目风险，提出了一些担忧。虽然最终项目还是实施了，但你的专业意见得到了重视。',
        effects: {
          health: -2,
          reputation: 5
        }
      },
      {
        id: 'dir_002_opt_c',
        text: '反对项目，建议观望',
        feedback: '你反对这个项目，建议公司观望。虽然错失了机会，但后来的市场变化证明了你的谨慎是正确的。',
        effects: {
          reputation: 6
        }
      }
    ]
  },

  {
    id: 'dir_003_prof',
    title: '业务拓展',
    description: '公司需要拓展新市场或新业务领域。需要你制定拓展策略并负责实施。',
    category: 'professional',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '业务拓展是公司发展的重要驱动力...',
    options: [
      {
        id: 'dir_003_opt_a',
        text: '积极拓展，抢占市场',
        feedback: '你制定了积极的拓展策略，带领团队快速进入新市场。虽然投入很大，但成功抢占了市场先机。',
        effects: {
          health: -4,
          reputation: 7,
          cash: -5000,
          progress: 3
        }
      },
      {
        id: 'dir_003_opt_b',
        text: '稳健拓展，控制风险',
        feedback: '你采取了稳健的拓展策略，逐步进入新市场。虽然进展较慢，但风险控制得很好。',
        effects: {
          health: -2,
          reputation: 5,
          progress: 1
        }
      },
      {
        id: 'dir_003_opt_c',
        text: '专注现有市场，暂不拓展',
        feedback: '你建议公司专注现有市场，暂不拓展。虽然错失了新市场机会，但巩固了现有业务。',
        effects: {
          reputation: 3,
          progress: 1
        }
      }
    ]
  },

  {
    id: 'dir_004_prof',
    title: '危机处理',
    description: '公司面临一场重大危机（如安全事故、质量问题）。作为项目总监，需要你负责处理危机。',
    category: 'professional',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '危机处理考验领导者的应变能力...',
    options: [
      {
        id: 'dir_004_opt_a',
        text: '果断处理，勇于承担责任',
        feedback: '你果断采取措施处理危机，勇于承担责任。虽然过程很艰难，但危机得到化解，公司声誉损失降到最低。',
        effects: {
          health: -5,
          reputation: 7,
          cash: -4000
        }
      },
      {
        id: 'dir_004_opt_b',
        text: '协调各方，稳妥处理',
        feedback: '你协调各方资源，稳妥处理危机。虽然处理速度不快，但最终化解了危机。',
        effects: {
          health: -3,
          reputation: 5,
          cash: -3000
        }
      },
      {
        id: 'dir_004_opt_c',
        text: '委托他人处理',
        feedback: '你委托了下属处理危机。虽然自己避免了压力，但处理不够及时，危机影响扩大了。',
        effects: {
          reputation: -2,
          cash: -6000
        }
      }
    ]
  },

  {
    id: 'dir_005_prof',
    title: '技术创新战略',
    description: '公司需要制定技术创新战略，决定技术发展方向。需要你提出专业建议。',
    category: 'professional',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '技术创新是公司长期竞争力的保障...',
    options: [
      {
        id: 'dir_005_opt_a',
        text: '大胆创新，领先发展',
        feedback: '你提出了大胆的创新战略，建议公司投入资源研发新技术。公司采纳后，技术实力大幅提升。',
        effects: {
          health: -3,
          reputation: 7,
          cash: -4000,
          quality: 3
        }
      },
      {
        id: 'dir_005_opt_b',
        text: '跟进发展，稳妥创新',
        feedback: '你建议公司跟进行业发展，适度创新。虽然不是领先者，但避免了研发风险。',
        effects: {
          health: -2,
          reputation: 5,
          cash: -2000,
          quality: 2
        }
      },
      {
        id: 'dir_005_opt_c',
        text: '技术引进，快速提升',
        feedback: '你建议引进成熟技术，快速提升公司技术水平。虽然需要支付许可费，但效果显著。',
        effects: {
          reputation: 5,
          cash: -3000,
          quality: 2
        }
      }
    ]
  },

  // ==================== 职场型事件（5个）====================

  {
    id: 'dir_001_work',
    title: '高管团队协作',
    description: '作为公司高管，需要与其他高管协作。有时候会有意见分歧，需要协调处理。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '高管团队协作需要大局观...',
    options: [
      {
        id: 'dir_001_w_opt_a',
        text: '坚持原则，据理力争',
        feedback: '你在讨论中坚持自己的专业观点，据理力争。虽然可能有争议，但最终证明你的判断是正确的。',
        effects: {
          reputation: 5
        }
      },
      {
        id: 'dir_001_w_opt_b',
        text: '妥协折中，维护关系',
        feedback: '你选择妥协折中，维护团队关系。虽然自己的意见没有完全被采纳，但团队协作很好。',
        effects: {
          reputation: 4
        }
      },
      {
        id: 'dir_001_w_opt_c',
        text: '支持他人，积累人脉',
        feedback: '你支持了其他高管的意见。虽然没有推进自己的想法，但积累了人脉，获得了他们的支持。',
        effects: {
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'dir_002_work',
    title: '接班人培养',
    description: '公司希望你能培养接班人，为公司储备管理人才。这需要投入时间和精力。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '接班人培养是高管的重要责任...',
    options: [
      {
        id: 'dir_002_w_opt_a',
        text: '系统培养，精心指导',
        feedback: '你制定了系统的培养计划，精心指导接班人。接班人成长很快，公司认可你的培养能力。',
        effects: {
          health: -3,
          reputation: 6
        }
      },
      {
        id: 'dir_002_w_opt_b',
        text: '压担子，在实践中锻炼',
        feedback: '你给接班人压重担，让其在实践中锻炼。虽然压力较大，但接班人成长迅速。',
        effects: {
          reputation: 5
        }
      },
      {
        id: 'dir_002_w_opt_c',
        text: '有限参与，提供咨询',
        feedback: '你只提供了有限的指导咨询。虽然也帮助了接班人，但系统性和深度不够。',
        effects: {
          health: -1,
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'dir_003_work',
    title: '行业影响力',
    description: '作为行业专家，有机会在行业论坛发表演讲或担任评委。可以提升个人和公司的行业影响力。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '行业影响力是高管的重要资产...',
    options: [
      {
        id: 'dir_003_w_opt_a',
        text: '积极参与，扩大影响',
        feedback: '你积极参与行业活动，发表了精彩演讲。个人和公司的行业影响力大幅提升。',
        effects: {
          health: -2,
          reputation: 7,
          cash: 2000
        }
      },
      {
        id: 'dir_003_w_opt_b',
        text: '有限参与，保持低调',
        feedback: '你有限参与了行业活动，虽然影响力提升有限，但也节省了时间和精力。',
        effects: {
          reputation: 3
        }
      },
      {
        id: 'dir_003_w_opt_c',
        text: '委婉拒绝，专注工作',
        feedback: '你委婉拒绝了行业活动邀请，专注于公司工作。虽然错失了提升影响力的机会，但工作业绩很好。',
        effects: {
          reputation: 4,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'dir_004_work',
    title: '工作生活平衡',
    description: '长期的高强度工作让你开始思考工作生活平衡。作为高管，需要找到合适的平衡点。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '工作生活平衡是长期健康的保障...',
    options: [
      {
        id: 'dir_004_w_opt_a',
        text: '继续全力投入工作',
        feedback: '你继续全力投入工作，虽然业绩很好，但身体和精神都开始出现问题。',
        effects: {
          health: -5,
          reputation: 4,
          progress: 2
        }
      },
      {
        id: 'dir_004_w_opt_b',
        text: '调整工作方式，提高效率',
        feedback: '你调整了工作方式，更多授权给团队。虽然需要时间适应，但效率提高了，压力减轻了。',
        effects: {
          health: 2,
          reputation: 5,
          progress: 1
        }
      },
      {
        id: 'dir_004_w_opt_c',
        text: '减少工作时间，享受生活',
        feedback: '你减少了工作时间，更多陪伴家人。虽然工作业绩略有下降，但生活质量大幅提升。',
        effects: {
          health: 5,
          reputation: 2,
          progress: -1
        }
      }
    ]
  },

  {
    id: 'dir_005_work',
    title: '合伙人晋升',
    description: '公司有一个合伙人晋升机会，你是候选人之一。这是职业发展的最高层次。',
    category: 'workplace',
    requiredRank: Rank.PROJECT_DIRECTOR,
    flavorText: '合伙人是职业发展的顶峰...',
    options: [
      {
        id: 'dir_005_w_opt_a',
        text: '全力争取，展现能力',
        feedback: '你全力争取晋升，充分展现了自己的综合能力。成功晋升为合伙人，达到了职业发展顶峰。',
        effects: {
          health: -3,
          reputation: 10
        }
      },
      {
        id: 'dir_005_w_opt_b',
        text: '保持现状，顺其自然',
        feedback: '你保持现状，顺其自然。虽然没有晋升，但也避免了竞争失败的风险。',
        effects: {
          reputation: 3
        }
      },
      {
        id: 'dir_005_w_opt_c',
        text: '支持其他候选人',
        feedback: '你支持了其他候选人。虽然没有自己晋升，但赢得了同事的尊重和感激。',
        effects: {
          reputation: 5
        }
      }
    ]
  }
];
