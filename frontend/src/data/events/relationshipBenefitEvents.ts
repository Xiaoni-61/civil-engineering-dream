/**
 * 关系福利特殊事件
 * 当关系值达到一定阈值时触发，提供额外的赚钱机会
 */

import { EventCard } from '@shared/types';
import { RelationshipType } from '@shared/types';

/**
 * 甲方推荐项目事件
 * 触发条件：甲方关系 ≥ 75
 * 每季度 20% 概率触发（≥90 时 35%）
 */
const clientRecommendedProject: EventCard = {
  id: 'benefit_client_recommended',
  title: '⭐ 甲方的私人邀请',
  description: `甲方王总私下联系你："老弟，有个不错的项目想交给你做。虽然预算不是特别高，但是胜在稳定，而且做完之后我会在行业里帮你多美言几句。不过项目时间比较紧，可能会辛苦点。你觉得怎么样？"

这是一个难得的机会，但也要权衡清楚...`,
  options: [
    {
      id: 'opt_client_1',
      text: '欣然接受，全力以赴',
      effects: {
        cash: 15000,
        health: -3,
        reputation: 5,
        progress: 3,
      },
      feedback: '你加班加点完成了项目，王总很满意，在圈子里帮你说了不少好话。',
    },
    {
      id: 'opt_client_2',
      text: '谨慎评估，量力而行',
      effects: {
        cash: 8000,
        health: -1,
        progress: 2,
      },
      feedback: '你稳扎稳打，项目顺利完成，关系也更进一步。',
    },
    {
      id: 'opt_client_3',
      text: '婉言谢绝',
      effects: {
        reputation: -3,
      },
      feedback: '王总有些失望，不过也表示理解，说下次有机会再合作。',
    },
  ],
};

/**
 * 设计优化奖励事件
 * 触发条件：设计院关系 ≥ 75，完成项目时触发
 */
const designOptimizationReward: EventCard = {
  id: 'benefit_design_optimization',
  title: '⭐ 设计院的优化建议',
  description: `项目刚刚完成，设计院李工找到你："你的项目做得不错，不过我看了下，如果按照我们的新方案，材料成本可以降不少。这个方案我们可以免费提供，就当是感谢你之前的配合。"

这是一个难得的机会！`,
  options: [
    {
      id: 'opt_design_1',
      text: '接受优化方案',
      effects: {
        cash: 5000,
        reputation: 3,
        progress: 2,
      },
      feedback: '设计院的方案果然专业，既节省了成本，又保证了质量。',
    },
    {
      id: 'opt_design_2',
      text: '按原方案完成',
      effects: {
        quality: 5,
      },
      feedback: '你选择稳扎稳打，虽然没有额外收益，但质量有保障。',
    },
  ],
};

/**
 * 政府补贴项目事件
 * 触发条件：政府关系 ≥ 80
 * 每季度 15% 概率触发（≥90 时 25%）
 */
const governmentSubsidyProject: EventCard = {
  id: 'benefit_government_subsidy',
  title: '⭐ 政府的特殊照顾',
  description: `建委的张科长给你打电话："你们公司最近表现不错，市里有个绿色建筑示范项目，补贴很丰厚。我觉得你们很适合，要不要申请试试？不过竞争还挺激烈的，得好好准备材料。"

这可是个千载难逢的机会！`,
  options: [
    {
      id: 'opt_gov_1',
      text: '全力准备，精心申报',
      effects: {
        health: -5,
        cash: 20000,
        reputation: 5,
        progress: 3,
      },
      feedback: '你加班准备了详细的材料，申报成功！政府对你的工作很认可。',
    },
    {
      id: 'opt_gov_2',
      text: '简单准备试试看',
      effects: {
        health: -2,
        cash: 10000,
        reputation: 2,
      },
      feedback: '虽然准备得不够充分，但还是拿到了补贴，算是意外之喜。',
    },
    {
      id: 'opt_gov_3',
      text: '太麻烦，算了',
      effects: {
        reputation: -3,
      },
      feedback: '张科长有些失望，说这么好的机会都错过了，太可惜了。',
    },
  ],
};

/**
 * 监理推荐事件
 * 触发条件：监理关系 ≥ 75
 * 每季度 10% 概率触发
 */
const supervisionRecommendation: EventCard = {
  id: 'benefit_supervision_recommend',
  title: '⭐ 监理的默契推荐',
  description: `监理单位的陈总找到你："老弟，有个紧急项目，甲方要求很高，时间也紧。其他公司我都不敢推荐，但你的技术和管理我信得过。要不要试试？这个项目做好了，对你的声誉提升很大。"

这是监理对你专业能力的认可！`,
  options: [
    {
      id: 'opt_sup_1',
      text: '接受挑战，证明实力',
      effects: {
        cash: 12000,
        health: -4,
        reputation: 8,
        quality: 5,
      },
      feedback: '你顶着压力完成了项目，质量得到各方认可，声誉大增！',
    },
    {
      id: 'opt_sup_2',
      text: '谨慎评估后再决定',
      effects: {
        cash: 6000,
        reputation: 3,
        progress: 2,
      },
      feedback: '你稳扎稳打，项目顺利完成，监理对你的专业能力更认可了。',
    },
    {
      id: 'opt_sup_3',
      text: '婉言谢绝',
      effects: {
        reputation: -2,
      },
      feedback: '陈总有些失望，不过也表示理解，说下次有合适的再联系。',
    },
  ],
};

/**
 * 劳务队支持事件
 * 触发条件：劳务队关系 ≥ 75
 * 每季度 10% 概率触发
 */
const laborSupport: EventCard = {
  id: 'benefit_labor_support',
  title: '⭐ 劳务队的忠诚支持',
  description: `劳务队的老张找到你："老板，最近行情不好，好多队伍都没活干。但你一直对我们不错，我们想跟着你干。如果你有项目，我们给你优惠价格，质量保证，而且随叫随到。"

这是劳务队对你最大的认可！`,
  options: [
    {
      id: 'opt_labor_1',
      text: '感动接受，建立长期合作',
      effects: {
        cash: 8000,
        health: -2,
        reputation: 5,
        progress: 5,
      },
      feedback: '劳务队的忠诚让你节省了不少成本，项目进展也更快了。',
    },
    {
      id: 'opt_labor_2',
      text: '暂不需要，但表示感谢',
      effects: {
        reputation: 3,
      },
      feedback: '老张很理解，说只要你需要，随时联系他们。',
    },
  ],
};

/**
 * 获取关系福利事件
 * @param relationshipType 关系类型
 * @param relationshipValue 关系值
 * @returns 事件卡片或 null
 */
export function getRelationshipBenefitEvent(
  relationshipType: RelationshipType,
  relationshipValue: number
): EventCard | null {
  // 检查是否达到触发条件
  switch (relationshipType) {
    case RelationshipType.CLIENT:
      if (relationshipValue >= 75) {
        // 关系值 ≥ 90 时触发概率翻倍
        const triggerChance = relationshipValue >= 90 ? 0.35 : 0.20;
        if (Math.random() < triggerChance) {
          return clientRecommendedProject;
        }
      }
      break;

    case RelationshipType.DESIGN:
      if (relationshipValue >= 75) {
        // 设计优化奖励在项目完成时触发，这里简化处理
        const triggerChance = 0.15;
        if (Math.random() < triggerChance) {
          return designOptimizationReward;
        }
      }
      break;

    case RelationshipType.GOVERNMENT:
      if (relationshipValue >= 80) {
        // 关系值 ≥ 90 时触发概率翻倍
        const triggerChance = relationshipValue >= 90 ? 0.25 : 0.15;
        if (Math.random() < triggerChance) {
          return governmentSubsidyProject;
        }
      }
      break;

    case RelationshipType.SUPERVISION:
      if (relationshipValue >= 75) {
        const triggerChance = 0.10;
        if (Math.random() < triggerChance) {
          return supervisionRecommendation;
        }
      }
      break;

    case RelationshipType.LABOR:
      if (relationshipValue >= 75) {
        const triggerChance = 0.10;
        if (Math.random() < triggerChance) {
          return laborSupport;
        }
      }
      break;
  }

  return null;
}

/**
 * 检查是否应该触发关系福利事件
 * @param relationships 所有关系值
 * @returns 事件卡片或 null
 */
export function checkRelationshipBenefitTrigger(
  relationships: Record<RelationshipType, number>
): EventCard | null {
  // 随机检查一个关系
  const relationshipTypes = Object.values(RelationshipType);
  const randomType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];

  const relationshipValue = relationships[randomType];
  return getRelationshipBenefitEvent(randomType, relationshipValue);
}

/**
 * 获取所有关系福利事件（用于测试或直接调用）
 */
export function getAllRelationshipBenefitEvents(): EventCard[] {
  return [
    clientRecommendedProject,
    designOptimizationReward,
    governmentSubsidyProject,
    supervisionRecommendation,
    laborSupport,
  ];
}
