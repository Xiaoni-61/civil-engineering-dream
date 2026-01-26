/**
 * 高级工程师事件池
 * 职级：高级工程师 (Rank.SENIOR_ENGINEER)
 * 特点：资深技术专家，能够解决复杂技术问题，开始参与重大决策
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';

export const seniorEngineerEvents: DecisionEvent[] = [
  // ==================== 专业型事件（5个）====================

  {
    id: 'sen_001_prof',
    title: '重大项目技术负责人',
    description: '公司任命你为一个重大项目的总技术负责人。这个项目技术难度高，社会影响大，成败关系到公司声誉。',
    category: 'professional',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '成为重大项目技术负责人是职业生涯的里程碑...',
    options: [
      {
        id: 'sen_001_opt_a',
        text: '全力以赴，确保成功',
        feedback: '你投入全部精力，制定了周密的技术方案和组织计划。项目顺利完成，获得了行业奖项，公司声誉大幅提升。',
        effects: {
          health: -5,
          reputation: 8,
          quality: 4,
          progress: 3,
          cash: 8000
        }
      },
      {
        id: 'sen_001_opt_b',
        text: '组建技术团队，分工协作',
        feedback: '你组建了一个强大的技术团队，明确分工协作。虽然工作压力大，但团队配合默契，项目成功完成。',
        effects: {
          health: -3,
          reputation: 6,
          quality: 3,
          progress: 2
        }
      },
      {
        id: 'sen_001_opt_c',
        text: '谨慎保守，稳妥推进',
        feedback: '你采用了保守稳妥的技术方案。项目顺利完成，但缺乏创新亮点，成果平平。',
        effects: {
          health: -2,
          reputation: 4,
          quality: 2
        }
      }
    ]
  },

  {
    id: 'sen_002_prof',
    title: '技术创新项目',
    description: '公司启动一个技术创新项目，需要研发新技术或新工艺。你被选为项目负责人。',
    category: 'professional',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '技术创新是推动行业发展的重要动力...',
    options: [
      {
        id: 'sen_002_opt_a',
        text: '大胆创新，力争突破',
        feedback: '你带领团队大胆创新，经过艰苦攻关取得了技术突破。获得了多项专利，公司技术实力显著提升。',
        effects: {
          health: -5,
          reputation: 8,
          quality: 4,
          cash: -3000
        }
      },
      {
        id: 'sen_002_opt_b',
        text: '学习引进，消化吸收',
        feedback: '你选择引进国外先进技术，消化吸收后再创新。虽然研发周期较长，但技术风险较小，最终效果不错。',
        effects: {
          health: -3,
          reputation: 5,
          quality: 3,
          cash: -2000
        }
      },
      {
        id: 'sen_002_opt_c',
        text: '改良现有技术，渐进创新',
        feedback: '你选择改良现有技术，进行渐进式创新。虽然没有重大突破，但稳步提升了技术水平，风险可控。',
        effects: {
          health: -2,
          reputation: 4,
          quality: 2
        }
      }
    ]
  },

  {
    id: 'sen_003_prof',
    title: '行业标准制定',
    description: '行业协会邀请你参与制定行业标准。这是提升行业影响力的重要机会，但需要投入大量时间。',
    category: 'professional',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '参与标准制定是行业专家的标志...',
    options: [
      {
        id: 'sen_003_opt_a',
        text: '积极参与，发挥专家作用',
        feedback: '你积极参与标准制定工作，提出了很多专业建议。最终发布的标准充分吸收了你的意见，行业影响力大幅提升。',
        effects: {
          health: -4,
          reputation: 7
        }
      },
      {
        id: 'sen_003_opt_b',
        text: '有限参与，提供建议',
        feedback: '你有限参与了标准制定，提供了一些建议。虽然参与度不高，但也在标准中体现了你的专业观点。',
        effects: {
          health: -2,
          reputation: 4
        }
      },
      {
        id: 'sen_003_opt_c',
        text: '婉拒参与，专注工作',
        feedback: '你婉拒了标准制定的邀请，专注于本职工作。虽然错失了提升行业影响力的机会，但工作得到了保障。',
        effects: {
          health: 1,
          reputation: 2,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'sen_004_prof',
    title: '工程质量事故调查',
    description: '行业发生了一起重大工程质量事故，你被邀请作为专家参与事故调查。这需要专业判断，也面临压力。',
    category: 'professional',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '参与事故调查需要专业能力和职业操守...',
    options: [
      {
        id: 'sen_004_opt_a',
        text: '客观公正，坚持原则',
        feedback: '你坚持客观公正的调查原则，不受任何干扰。最终查明事故原因，提出了专业的处理建议，获得了业界的尊重。',
        effects: {
          health: -3,
          reputation: 7
        }
      },
      {
        id: 'sen_004_opt_b',
        text: '谨慎调查，稳妥处理',
        feedback: '你进行了谨慎调查，但处理上考虑了各方利益。虽然结论比较中庸，但也基本完成了调查任务。',
        effects: {
          health: -2,
          reputation: 4
        }
      },
      {
        id: 'sen_004_opt_c',
        text: '推脱参与，避免麻烦',
        feedback: '你推脱了事故调查的邀请。虽然避免了麻烦，但也错失了展现专业能力的机会。',
        effects: {
          reputation: 1
        }
      }
    ]
  },

  {
    id: 'sen_005_prof',
    title: '技术顾问',
    description: '一个合作项目邀请你作为技术顾问。可以增加收入，但也会分散精力。',
    category: 'professional',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '技术顾问是发挥专业能力的另一种方式...',
    options: [
      {
        id: 'sen_005_opt_a',
        text: '接受邀请，担任顾问',
        feedback: '你接受了技术顾问的邀请。虽然工作更忙了，但收入增加，专业能力也得到了更广泛的认可。',
        effects: {
          cash: 5000,
          health: -3,
          reputation: 4
        }
      },
      {
        id: 'sen_005_opt_b',
        text: '婉拒邀请，专注本职',
        feedback: '你婉拒了顾问邀请，专注于本职工作。虽然失去了一些收入，但本职工作做得更好。',
        effects: {
          health: 1,
          reputation: 3,
          progress: 2
        }
      },
      {
        id: 'sen_005_opt_c',
        text: '有偿咨询，灵活参与',
        feedback: '你提供了有偿咨询服务，但参与度有限。既增加了一些收入，又不会太影响本职工作。',
        effects: {
          cash: 2000,
          health: -1,
          reputation: 2
        }
      }
    ]
  },

  // ==================== 职场型事件（5个）====================

  {
    id: 'sen_001_work',
    title: '人才培养',
    description: '公司希望你能培养更多的技术人才。可以开设培训班或带徒弟，但需要投入时间。',
    category: 'workplace',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '人才培养是资深专家的重要责任...',
    options: [
      {
        id: 'sen_001_w_opt_a',
        text: '开设培训课程，系统培养',
        feedback: '你开设了系统培训课程，培养了大批技术人才。公司很认可你的贡献，你也被评为优秀导师。',
        effects: {
          health: -4,
          reputation: 6
        }
      },
      {
        id: 'sen_001_w_opt_b',
        text: '带几个徒弟，重点培养',
        feedback: '你带了几个徒弟进行重点培养。虽然人不多，但都成长很快，成为了公司的技术骨干。',
        effects: {
          health: -2,
          reputation: 5
        }
      },
      {
        id: 'sen_001_w_opt_c',
        text: '提供指导咨询，有限参与',
        feedback: '你只提供有限的指导咨询。虽然也帮助了一些人，但系统性和深度不够。',
        effects: {
          health: -1,
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'sen_002_work',
    title: '技术委员会',
    description: '公司成立了技术委员会，邀请你担任委员。需要参与技术决策和评审工作。',
    category: 'workplace',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '技术委员会是公司技术决策的核心机构...',
    options: [
      {
        id: 'sen_002_w_opt_a',
        text: '积极参与，发挥影响力',
        feedback: '你积极参与技术委员会的工作，在多项技术决策中发挥了关键作用。公司的技术水平得到了提升。',
        effects: {
          health: -3,
          reputation: 6,
          quality: 2
        }
      },
      {
        id: 'sen_002_w_opt_b',
        text: '有限参与，提供咨询',
        feedback: '你有限参与了委员会工作，主要提供咨询意见。虽然参与度不高，但专业性得到了认可。',
        effects: {
          health: -1,
          reputation: 3
        }
      },
      {
        id: 'sen_002_w_opt_c',
        text: '婉拒邀请，专注项目',
        feedback: '你婉拒了技术委员会的邀请，专注于项目工作。虽然失去了参与决策的机会，但项目业绩很好。',
        effects: {
          reputation: 3,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'sen_003_work',
    title: '竞争上岗',
    description: '公司实行竞争上岗，项目经理职位公开竞聘。你有机会晋升管理层。',
    category: 'workplace',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '竞争上岗是职业晋升的重要途径...',
    options: [
      {
        id: 'sen_003_w_opt_a',
        text: '积极竞聘，争取晋升',
        feedback: '你积极参与竞聘，充分展现了自己的能力和经验。成功晋升为项目经理，开启了新的职业阶段。',
        effects: {
          health: -3,
          reputation: 7
        }
      },
      {
        id: 'sen_003_w_opt_b',
        text: '观望态度，不主动竞聘',
        feedback: '你对竞聘持观望态度。虽然最终没有晋升，但也没有失败的风险，维持了现状。',
        effects: {
          reputation: 2
        }
      },
      {
        id: 'sen_003_w_opt_c',
        text: '支持其他同事竞聘',
        feedback: '你支持了其他同事的竞聘，展现了良好的团队精神。虽然自己没有晋升，但赢得了同事的尊重。',
        effects: {
          reputation: 4
        }
      }
    ]
  },

  {
    id: 'sen_004_work',
    title: '跨部门调动',
    description: '公司希望调动你去其他部门担任技术负责人。新岗位有挑战，但也要放弃现有基础。',
    category: 'workplace',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '跨部门调动是职业发展的重要抉择...',
    options: [
      {
        id: 'sen_004_w_opt_a',
        text: '接受调动，迎接新挑战',
        feedback: '你接受了调动，在新岗位上快速适应。虽然重新开始有些辛苦，但职业视野得到了拓展。',
        effects: {
          health: -2,
          reputation: 5,
          progress: 2
        }
      },
      {
        id: 'sen_004_w_opt_b',
        text: '婉拒调动，留在原岗位',
        feedback: '你婉拒了调动，留在原岗位继续工作。虽然失去了新的机会，但保持了稳定的发展。',
        effects: {
          reputation: 3
        }
      },
      {
        id: 'sen_004_w_opt_c',
        text: '申请考虑，暂不决定',
        feedback: '你申请时间考虑，暂时没有做出决定。公司同意了你的请求，给了你更多思考时间。',
        effects: {
          reputation: 2
        }
      }
    ]
  },

  {
    id: 'sen_005_work',
    title: '退休规划',
    description: '虽然离退休还早，但需要开始考虑长期职业规划。是继续技术路线还是转向管理？',
    category: 'workplace',
    requiredRank: Rank.SENIOR_ENGINEER,
    flavorText: '长期职业规划需要提前思考...',
    options: [
      {
        id: 'sen_005_w_opt_a',
        text: '深耕技术，成为技术权威',
        feedback: '你决定继续深耕技术领域，目标是成为行业技术权威。这个选择需要长期专注，但前景很好。',
        effects: {
          reputation: 4,
          health: -1
        }
      },
      {
        id: 'sen_005_w_opt_b',
        text: '转向管理，培养管理能力',
        feedback: '你决定转向管理方向，开始培养管理能力。虽然需要学习新知识，但职业道路更宽广。',
        effects: {
          reputation: 3,
          health: -2
        }
      },
      {
        id: 'sen_005_w_opt_c',
        text: '技术管理双轨，全面发展',
        feedback: '你选择技术和管理双轨发展。虽然压力更大，但能力更全面，职业选择更多。',
        effects: {
          reputation: 4,
          health: -3
        }
      }
    ]
  }
];
