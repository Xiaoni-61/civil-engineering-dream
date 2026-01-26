/**
 * 工程师事件池
 * 职级：工程师 (Rank.ENGINEER)
 * 特点：能够独立负责专业工作，开始承担技术管理职责
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';
import { RelationshipType } from '@shared/types';

export const engineerEvents: DecisionEvent[] = [
  // ==================== 专业型事件（5个）====================

  {
    id: 'eng_001_prof',
    title: '专业技术难题',
    description: '项目中遇到一个复杂的技术问题，需要你作为技术负责人组织攻关。这关系到项目成败，压力很大。',
    category: 'professional',
    requiredRank: Rank.ENGINEER,
    flavorText: '成为工程师意味着承担更大的技术责任...',
    options: [
      {
        id: 'eng_001_opt_a',
        text: '组织技术团队，集中攻关',
        feedback: '你组织了一个技术攻关小组，集中团队智慧解决问题。经过一段时间努力，成功攻克了技术难题。',
        effects: {
          health: -3,
          reputation: 5,
          quality: 3,
          progress: 2
        }
      },
      {
        id: 'eng_001_opt_b',
        text: '寻求外部专家支持',
        feedback: '你联系了行业专家寻求支持。虽然花费了一些咨询费，但问题很快得到解决，项目进度得以保障。',
        effects: {
          cash: -2000,
          reputation: 3,
          progress: 3
        }
      },
      {
        id: 'eng_001_opt_c',
        text: '调整方案，避开技术难点',
        feedback: '你调整了技术方案，避开了原技术难点。虽然方案有些妥协，但工程得以顺利推进。',
        effects: {
          reputation: 2,
          quality: 1,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'eng_002_prof',
    title: '项目投标技术标',
    description: '公司参与一个项目投标，需要你编制技术标书。这是投标的关键部分，直接影响能否中标。',
    category: 'professional',
    requiredRank: Rank.ENGINEER,
    flavorText: '投标技术标是展现公司技术实力的窗口...',
    options: [
      {
        id: 'eng_002_opt_a',
        text: '精心编制，突出技术优势',
        feedback: '你精心编制了技术标书，突出了公司的技术优势和创新能力。最终成功中标，公司领导对你的工作非常满意。',
        effects: {
          health: -4,
          reputation: 6,
          cash: 3000
        }
      },
      {
        id: 'eng_002_opt_b',
        text: '参考以往模板，快速完成',
        feedback: '你参考了以往的标书模板，快速完成了编制。虽然质量还可以，但缺乏亮点，最终没有中标。',
        effects: {
          reputation: 1,
          health: -2
        }
      },
      {
        id: 'eng_002_opt_c',
        text: '请教投标专家，获取指导',
        feedback: '你请教了有经验的投标专家，获得了很多宝贵建议。编制的标书质量很高，成功中标。',
        effects: {
          health: -3,
          reputation: 5,
          cash: 3000
        }
      }
    ]
  },

  {
    id: 'eng_003_prof',
    title: '新技术应用',
    description: '项目有机会应用一项新技术（如BIM技术、新材料）。这可以提升项目质量，但也有风险。',
    category: 'professional',
    requiredRank: Rank.ENGINEER,
    flavorText: '新技术应用既是机遇也是挑战...',
    options: [
      {
        id: 'eng_003_opt_a',
        text: '大胆应用，争取创新突破',
        feedback: '你决定应用新技术。虽然前期准备很辛苦，但成功应用后项目质量显著提升，获得了业界的认可。',
        effects: {
          health: -4,
          reputation: 6,
          quality: 4,
          cash: -1500
        }
      },
      {
        id: 'eng_003_opt_b',
        text: '谨慎试点，小范围尝试',
        feedback: '你决定先在小范围内试点新技术。试点效果不错，为以后全面应用积累了经验。',
        effects: {
          health: -2,
          reputation: 3,
          quality: 2,
          cash: -800
        }
      },
      {
        id: 'eng_003_opt_c',
        text: '采用传统方案，稳妥为主',
        feedback: '你决定采用传统方案，避免风险。项目顺利完成，但失去了创新的机会。',
        effects: {
          reputation: 2,
          quality: 1
        }
      }
    ]
  },

  {
    id: 'eng_004_prof',
    title: '工程质量事故',
    description: '项目发生了质量事故，虽然不严重但影响不好。需要你负责调查处理并提出整改方案。',
    category: 'professional',
    requiredRank: Rank.ENGINEER,
    flavorText: '质量事故是对工程师能力的严峻考验...',
    options: [
      {
        id: 'eng_004_opt_a',
        text: '深入调查，彻底整改',
        feedback: '你深入调查了事故原因，制定了全面的整改方案。虽然花费较大，但彻底解决了问题，监理和甲方都很认可。',
        effects: {
          health: -3,
          reputation: 4,
          quality: 3,
          cash: -2000,
          relationships: [
            { type: RelationshipType.CLIENT, change: 3 },
            { type: RelationshipType.SUPERVISION, change: 4 }
          ]
        }
      },
      {
        id: 'eng_004_opt_b',
        text: '快速处理，尽量降低影响',
        feedback: '你快速处理了问题部位，尽量降低了事故影响。虽然整改不够彻底，但控制了损失和负面影响。',
        effects: {
          reputation: 2,
          quality: 1,
          cash: -1000
        }
      },
      {
        id: 'eng_004_opt_c',
        text: '推卸责任，避免承担',
        feedback: '你试图推卸责任，但调查后认定你负有管理责任。你的声誉受到了影响，需要吸取教训。',
        effects: {
          reputation: -5,
          quality: -2,
          relationships: [
            { type: RelationshipType.SUPERVISION, change: -3 }
          ]
        }
      }
    ]
  },

  {
    id: 'eng_005_prof',
    title: '成本优化',
    description: '项目成本超出预算，需要你提出成本优化方案。这需要在保证质量的前提下降低成本。',
    category: 'professional',
    requiredRank: Rank.ENGINEER,
    flavorText: '成本优化考验工程师的综合能力...',
    options: [
      {
        id: 'eng_005_opt_a',
        text: '优化施工方案，降低成本',
        feedback: '你通过优化施工方案和工艺，成功降低了成本，同时保证了质量。公司对你的成本控制能力很赞赏。',
        effects: {
          health: -3,
          reputation: 5,
          cash: 5000,
          progress: 1
        }
      },
      {
        id: 'eng_005_opt_b',
        text: '更换低价材料，降低成本',
        feedback: '你建议更换价格更低的材料。虽然降低了成本，但质量略有下降，监理对此有些担心。',
        effects: {
          cash: 3000,
          reputation: 2,
          quality: -2,
          relationships: [
            { type: RelationshipType.SUPERVISION, change: -2 }
          ]
        }
      },
      {
        id: 'eng_005_opt_c',
        text: '保持现状，申请追加预算',
        feedback: '你决定不降低标准，申请追加预算。甲方同意了部分追加，但认为你的成本控制能力有待提高。',
        effects: {
          reputation: 1,
          cash: 2000
        }
      }
    ]
  },

  // ==================== 职场型事件（5个）====================

  {
    id: 'eng_001_work',
    title: '团队管理',
    description: '你被任命为一个小团队的负责人，需要管理几个下属。这是你第一次承担管理职责。',
    category: 'workplace',
    requiredRank: Rank.ENGINEER,
    flavorText: '从技术人员转向管理是一个重要转变...',
    options: [
      {
        id: 'eng_001_w_opt_a',
        text: '严格管理，确保效率',
        feedback: '你对团队进行严格管理，制定了明确的工作标准和考核机制。团队效率提高了，但有些人觉得压力太大。',
        effects: {
          health: -2,
          reputation: 3,
          progress: 2
        }
      },
      {
        id: 'eng_001_w_opt_b',
        text: '民主管理，听取团队意见',
        feedback: '你采用民主管理风格，经常听取团队意见。团队氛围很好，大家工作积极性高，效率也有所提升。',
        effects: {
          reputation: 4,
          progress: 1
        }
      },
      {
        id: 'eng_001_w_opt_c',
        text: '以身作则，带头工作',
        feedback: '你以身作则，经常带头加班干活。团队很敬佩你的工作态度，但长期下来身体有些吃不消。',
        effects: {
          health: -4,
          reputation: 3,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'eng_002_work',
    title: '晋升竞争',
    description: '部门有一个高级工程师的晋升名额，你和几个同事都在竞争。需要展现自己的优势。',
    category: 'workplace',
    requiredRank: Rank.ENGINEER,
    flavorText: '晋升竞争是职场发展的关键节点...',
    options: [
      {
        id: 'eng_002_w_opt_a',
        text: '积极争取，展示工作成果',
        feedback: '你积极向领导展示自己的工作成果和能力。虽然过程有些累，但最终成功晋升，职级得到提升。',
        effects: {
          health: -2,
          reputation: 6
        }
      },
      {
        id: 'eng_002_w_opt_b',
        text: '保持低调，让成果说话',
        feedback: '你保持低调，相信自己的工作成果会被认可。虽然最终没有晋升，但领导肯定了你的工作。',
        effects: {
          reputation: 2
        }
      },
      {
        id: 'eng_002_w_opt_c',
        text: '和同事沟通，寻求支持',
        feedback: '你和同事沟通了晋升意向，获得了他们的支持。虽然竞争激烈，但最终成功晋升。',
        effects: {
          reputation: 4
        }
      }
    ]
  },

  {
    id: 'eng_003_work',
    title: '外部培训机会',
    description: '公司有一个外部高端培训机会，但需要自费一部分费用。培训内容对你的职业发展很有帮助。',
    category: 'workplace',
    requiredRank: Rank.ENGINEER,
    flavorText: '外部培训是提升专业能力的重要途径...',
    options: [
      {
        id: 'eng_003_w_opt_a',
        text: '参加培训，提升能力',
        feedback: '你参加了培训，虽然花了一些钱，但学到了很多新知识，对工作很有帮助。',
        effects: {
          cash: -2000,
          health: -2,
          reputation: 4
        }
      },
      {
        id: 'eng_003_w_opt_b',
        text: '放弃培训，节省费用',
        feedback: '你决定放弃培训，节省了费用。虽然错失了学习机会，但经济压力小了一些。',
        effects: {
          reputation: 1
        }
      },
      {
        id: 'eng_003_w_opt_c',
        text: '申请公司资助',
        feedback: '你向公司申请培训资助。公司同意部分资助，你只需要承担一小部分费用。',
        effects: {
          cash: -500,
          health: -2,
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'eng_004_work',
    title: '项目收尾',
    description: '负责的项目即将收尾，需要组织竣工验收和资料归档。工作很繁琐，但很重要。',
    category: 'workplace',
    requiredRank: Rank.ENGINEER,
    flavorText: '项目收尾工作繁琐但不可或缺...',
    options: [
      {
        id: 'eng_004_w_opt_a',
        text: '认真组织，确保完善',
        feedback: '你认真组织了收尾工作，所有资料齐全完备。验收顺利通过，公司对你的工作很满意。',
        effects: {
          health: -3,
          reputation: 5,
          quality: 2
        }
      },
      {
        id: 'eng_004_w_opt_b',
        text: '简化流程，快速结束',
        feedback: '你简化了一些收尾流程，快速结束了项目。虽然效率高，但有些资料不够完善，后续需要补充。',
        effects: {
          health: -1,
          reputation: 2
        }
      },
      {
        id: 'eng_004_w_opt_c',
        text: '委托给团队，自己监督',
        feedback: '你将收尾工作委托给团队，自己负责监督。团队完成了大部分工作，你也有一些时间休息。',
        effects: {
          health: 1,
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'eng_005_work',
    title: '行业交流',
    description: '行业组织技术交流会议，邀请你作为专家分享经验。这是提升个人影响力的机会。',
    category: 'workplace',
    requiredRank: Rank.ENGINEER,
    flavorText: '行业分享是提升影响力的重要途径...',
    options: [
      {
        id: 'eng_005_w_opt_a',
        text: '精心准备，积极分享',
        feedback: '你精心准备了分享内容，在会议上做了精彩演讲。业界同行都很认可你的专业能力，个人影响力大幅提升。',
        effects: {
          health: -3,
          reputation: 6
        }
      },
      {
        id: 'eng_005_w_opt_b',
        text: '简单分享，低调处理',
        feedback: '你做了一些简单分享，虽然内容不错，但 presentation 不够精彩，影响力有限。',
        effects: {
          health: -1,
          reputation: 2
        }
      },
      {
        id: 'eng_005_w_opt_c',
        text: '婉拒邀请，专注于工作',
        feedback: '你婉拒了分享邀请，专注于项目工作。虽然错失了提升影响力的机会，但保证了项目进度。',
        effects: {
          reputation: 2,
          progress: 1
        }
      }
    ]
  }
];
