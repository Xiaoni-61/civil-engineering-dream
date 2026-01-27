/**
 * 合伙人事件池
 * 职级：合伙人 (Rank.PARTNER)
 * 特点：公司最高决策层，参与公司战略制定，享有股权分红
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';

export const partnerEvents: DecisionEvent[] = [
  // ==================== 专业型事件（5个）====================

  {
    id: 'prt_001_prof',
    title: '公司战略决策',
    description: '公司面临重大战略抉择，需要合伙人会议决策。你的意见将直接影响公司未来发展。',
    category: 'professional',
    requiredRank: Rank.PARTNER,
    flavorText: '战略决策是合伙人的核心职责...',
    options: [
      {
        id: 'prt_001_opt_a',
        text: '大胆扩张，抢占市场份额',
        feedback: '你主张大胆扩张，抢占市场份额。公司采纳后业绩大幅增长，你的战略眼光得到认可。',
        effects: {
          health: -3,
          reputation: 10,
          cash: 20000,
          progress: 3
        }
      },
      {
        id: 'prt_001_opt_b',
        text: '稳健发展，控制风险',
        feedback: '你主张稳健发展，控制风险。公司业绩稳步增长，虽然不如激进方案亮眼，但更可持续。',
        effects: {
          health: -2,
          reputation: 7,
          cash: 10000,
          progress: 2
        }
      },
      {
        id: 'prt_001_opt_c',
        text: '收缩业务，专注核心',
        feedback: '你主张收缩非核心业务，专注优势领域。公司业务精简后效率提升，盈利能力增强。',
        effects: {
          reputation: 6,
          cash: 15000
        }
      },
      {
        id: 'prt_001_opt_d',
        text: '🔧 战略革新（需工作能力≥60）',
        feedback: '你凭借深厚的行业洞察力，提出了颠覆性的战略革新方案！通过商业模式创新，公司实现了跨越式发展，成为行业领军企业！',
        requiredAbility: { workAbility: 60 },
        hidden: true,
        effects: {
          health: -4,
          reputation: 15,
          cash: 35000,
          progress: 5
        }
      }
    ]
  },

  {
    id: 'prt_002_prof',
    title: '重大投资决策',
    description: '公司有一个重大投资机会，需要投入大量资金。投资回报可能很高，但风险也不小。',
    category: 'professional',
    requiredRank: Rank.PARTNER,
    flavorText: '重大投资决策考验合伙人的判断力...',
    options: [
      {
        id: 'prt_002_opt_a',
        text: '全力支持投资',
        feedback: '你全力支持这个投资项目。投资获得成功，为公司带来巨额回报，你的决策英明得到广泛认可。',
        effects: {
          reputation: 10,
          cash: 50000
        }
      },
      {
        id: 'prt_002_opt_b',
        text: '谨慎评估，适度投资',
        feedback: '你建议谨慎评估，适度投资。投资获得了一定回报，虽然不如全力投资收益高，但风险更小。',
        effects: {
          reputation: 7,
          cash: 20000
        }
      },
      {
        id: 'prt_002_opt_c',
        text: '反对投资，规避风险',
        feedback: '你反对这次投资，认为风险太大。后来的市场变化证明了你的谨慎是正确的，公司避免了一大笔损失。',
        effects: {
          reputation: 8
        }
      },
      {
        id: 'prt_002_opt_d',
        text: '🎲 豪赌独角兽项目（需幸运≥60）',
        feedback: '你敏锐地识别出这是下一个独角兽项目，力排众议全力投资！项目超预期成功，投资回报率超过10倍，你的投资眼光成为业界传奇！',
        requiredAbility: { luck: 60 },
        riskFactor: 0.35,
        hidden: true,
        failureFeedback: '很不幸，你的投资判断失误了！项目失败，公司损失惨重，你的投资决策能力受到质疑。',
        effects: {
          health: -2,
          reputation: 15,
          cash: 80000,
          failure: {
            reputation: -12,
            cash: -40000
          }
        }
      }
    ]
  },

  {
    id: 'prt_003_prof',
    title: '业务转型',
    description: '行业形势发生变化，公司需要考虑业务转型。转型的成败关系到公司生存发展。',
    category: 'professional',
    requiredRank: Rank.PARTNER,
    flavorText: '业务转型是公司发展的关键时刻...',
    options: [
      {
        id: 'prt_003_opt_a',
        text: '积极推动转型',
        feedback: '你积极推动业务转型，虽然过程痛苦，但公司成功实现转型，在新领域站稳脚跟。',
        effects: {
          health: -5,
          reputation: 10,
          cash: -10000,
          progress: 3
        }
      },
      {
        id: 'prt_003_opt_b',
        text: '稳步转型，控制风险',
        feedback: '你主张稳步转型，逐步调整业务结构。虽然转型速度慢，但风险控制得很好。',
        effects: {
          health: -3,
          reputation: 7,
          cash: -5000,
          progress: 1
        }
      },
      {
        id: 'prt_003_opt_c',
        text: '维持现状，观望形势',
        feedback: '你建议维持现状，观望形势发展。虽然错失了转型良机，但避免了转型失败的风险。',
        effects: {
          reputation: 4
        }
      }
    ]
  },

  {
    id: 'prt_004_prof',
    title: '股权激励',
    description: '公司需要制定股权激励计划，吸引和留住核心人才。作为合伙人，需要参与方案设计。',
    category: 'professional',
    requiredRank: Rank.PARTNER,
    flavorText: '股权激励是公司人才战略的重要工具...',
    options: [
      {
        id: 'prt_004_opt_a',
        text: '慷慨激励，广纳人才',
        feedback: '你主张给予核心人才优厚的股权激励。虽然稀释了现有股权，但吸引了大批优秀人才，公司发展后劲十足。',
        effects: {
          reputation: 8,
          cash: -8000,
          progress: 2
        }
      },
      {
        id: 'prt_004_opt_b',
        text: '适度激励，平衡各方',
        feedback: '你主张适度激励，平衡各方利益。股权激励方案得到了广泛认可，人才稳定性得到提升。',
        effects: {
          reputation: 6,
          cash: -4000,
          progress: 1
        }
      },
      {
        id: 'prt_004_opt_c',
        text: '保守激励，控制成本',
        feedback: '你主张保守的激励方案。虽然节省了成本，但激励效果有限，核心人才的吸引力不足。',
        effects: {
          reputation: 4
        }
      }
    ]
  },

  {
    id: 'prt_005_prof',
    title: '国际化战略',
    description: '公司考虑开拓国际市场。这需要大量投入，也有很大风险，但成功后回报丰厚。',
    category: 'professional',
    requiredRank: Rank.PARTNER,
    flavorText: '国际化是公司发展的重要战略...',
    options: [
      {
        id: 'prt_005_opt_a',
        text: '积极开拓国际市场',
        feedback: '你积极推动国际化战略。虽然初期投入很大，但最终成功打开国际市场，公司业绩大幅增长。',
        effects: {
          health: -4,
          reputation: 10,
          cash: -15000,
          progress: 3
        }
      },
      {
        id: 'prt_005_opt_b',
        text: '谨慎试探，小规模尝试',
        feedback: '你建议谨慎试探，小规模尝试。虽然进展慢，但风险控制得很好，积累了不少经验。',
        effects: {
          health: -2,
          reputation: 6,
          cash: -5000,
          progress: 1
        }
      },
      {
        id: 'prt_005_opt_c',
        text: '专注国内市场，暂不国际化',
        feedback: '你建议公司专注国内市场。虽然错失了国际化机会，但深耕国内市场也取得了不错业绩。',
        effects: {
          reputation: 5,
          cash: 5000
        }
      }
    ]
  },

  // ==================== 职场型事件（5个）====================

  {
    id: 'prt_001_work',
    title: '合伙人冲突',
    description: '合伙人之间对公司发展有不同意见，产生了分歧。需要妥善处理分歧。',
    category: 'workplace',
    requiredRank: Rank.PARTNER,
    flavorText: '合伙人之间的分歧需要妥善处理...',
    options: [
      {
        id: 'prt_001_w_opt_a',
        text: '坚持己见，据理力争',
        feedback: '你坚持自己的观点，据理力争。虽然争论激烈，但最终证明你的判断是正确的。',
        effects: {
          reputation: 7
        }
      },
      {
        id: 'prt_001_w_opt_b',
        text: '妥协折中，维护团结',
        feedback: '你选择妥协折中，维护合伙人团结。虽然意见没有完全被采纳，但团队关系保持融洽。',
        effects: {
          reputation: 5
        }
      },
      {
        id: 'prt_001_w_opt_c',
        text: '寻求第三方意见',
        feedback: '你建议寻求第三方专业意见。最终在专业意见基础上达成共识，分歧得到妥善解决。',
        effects: {
          reputation: 6
        }
      }
    ]
  },

  {
    id: 'prt_002_work',
    title: '社会责任',
    description: '作为知名公司合伙人，需要考虑社会责任和公益事业。这关系到公司声誉。',
    category: 'workplace',
    requiredRank: Rank.PARTNER,
    flavorText: '社会责任是企业声誉的重要来源...',
    options: [
      {
        id: 'prt_002_w_opt_a',
        text: '积极履行社会责任',
        feedback: '你积极推动公司履行社会责任，参与公益事业。虽然花费不少，但公司声誉大幅提升，品牌价值增强。',
        effects: {
          cash: -10000,
          reputation: 8
        }
      },
      {
        id: 'prt_002_w_opt_b',
        text: '适度参与社会责任',
        feedback: '你适度参与社会责任项目，平衡了公益投入和商业利益。公司声誉得到一定提升。',
        effects: {
          cash: -5000,
          reputation: 5
        }
      },
      {
        id: 'prt_002_w_opt_c',
        text: '专注商业，暂不参与',
        feedback: '你建议公司专注商业经营。虽然节省了公益支出，但也错失了提升声誉的机会。',
        effects: {
          reputation: 3
        }
      }
    ]
  },

  {
    id: 'prt_003_work',
    title: '行业地位',
    description: '有机会担任行业协会重要职务，可以提升个人和公司的行业影响力。',
    category: 'workplace',
    requiredRank: Rank.PARTNER,
    flavorText: '行业地位是商业资源的重要来源...',
    options: [
      {
        id: 'prt_003_w_opt_a',
        text: '接受职务，积极履职',
        feedback: '你接受了行业协会职务，积极履职。个人和公司的行业影响力大幅提升，获得了更多商业机会。',
        effects: {
          health: -3,
          reputation: 9,
          cash: 10000
        }
      },
      {
        id: 'prt_003_w_opt_b',
        text: '有限参与，保持低调',
        feedback: '你有限参与了行业协会工作。虽然影响力提升有限，但也节省了时间和精力。',
        effects: {
          reputation: 4
        }
      },
      {
        id: 'prt_003_w_opt_c',
        text: '婉拒职务，专注公司',
        feedback: '你婉拒了行业协会职务，专注于公司经营。虽然错失了提升行业地位的机会，但公司业绩很好。',
        effects: {
          reputation: 5,
          cash: 5000,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'prt_004_work',
    title: '财富管理',
    description: '作为合伙人，你已经积累了可观的财富。需要进行合理的财富管理和规划。',
    category: 'workplace',
    requiredRank: Rank.PARTNER,
    flavorText: '财富管理是保障长期生活的关键...',
    options: [
      {
        id: 'prt_004_w_opt_a',
        text: '多元化投资，分散风险',
        feedback: '你进行了多元化投资配置，分散了风险。投资组合表现稳健，财富持续增值。',
        effects: {
          cash: 15000,
          reputation: 5
        }
      },
      {
        id: 'prt_004_w_opt_b',
        text: '保守理财，保值为主',
        feedback: '你选择了保守的理财方式，以保值为主。虽然收益不高，但很安全。',
        effects: {
          cash: 8000
        }
      },
      {
        id: 'prt_004_w_opt_c',
        text: '追加投资公司发展',
        feedback: '你将大部分资金追加投资到公司发展中。虽然风险集中，但公司发展带来的回报更丰厚。',
        effects: {
          cash: 25000,
          reputation: 6,
          progress: 2
        }
      }
    ]
  },

  {
    id: 'prt_005_work',
    title: '传承规划',
    description: '作为资深合伙人，需要考虑传承规划。如何培养下一代，将自己的经验传承下去。',
    category: 'workplace',
    requiredRank: Rank.PARTNER,
    flavorText: '传承规划是长期发展的保障...',
    options: [
      {
        id: 'prt_005_w_opt_a',
        text: '系统培养接班人',
        feedback: '你系统培养了接班人，将自己的经验和理念传承下去。接班人快速成长，公司后继有人。',
        effects: {
          health: -3,
          reputation: 8
        }
      },
      {
        id: 'prt_005_w_opt_b',
        text: '建立培养机制，制度传承',
        feedback: '你建立了完善的人才培养机制，通过制度实现传承。公司的人才梯队更加完善。',
        effects: {
          reputation: 7
        }
      },
      {
        id: 'prt_005_w_opt_c',
        text: '专注当下，暂不考虑传承',
        feedback: '你专注于当下的公司经营，暂不考虑传承问题。虽然公司业绩很好，但长期传承存在隐忧。',
        effects: {
          reputation: 5,
          progress: 2
        }
      }
    ]
  }
];
