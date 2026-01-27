/**
 * 关系维护方式数据
 * 定义 10 种维护方式（每种关系 2 种）
 */

import { RelationshipType } from '@shared/types';

/**
 * 关系维护方式类型
 */
export interface RelationshipAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  relationshipType: RelationshipType;

  // 消耗
  cost: {
    cash?: number;
    health?: number;
  };

  // 基础收益
  baseEffects: {
    relationshipChange: [number, number]; // [最小值, 最大值]
    workAbility?: number;
    quality?: number;
    progress?: number;
  };

  // 触发条件
  conditions?: {
    minRelationship?: number; // 最低关系值要求
    maxRelationship?: number; // 最高关系值要求
    minHealth?: number; // 最低健康值要求
    minAbility?: {
      workAbility?: number;
      reputation?: number;
      luck?: number;
    };
    minProgress?: number; // 最低项目进度要求
  };

  // 风险配置
  risks?: {
    probability: number; // 触发概率（0-1）
    type: 'health_loss' | 'cash_loss' | 'reputation_loss' | 'relationship_loss' | 'dispute';
    consequences: {
      health?: number;
      cash?: number;
      reputation?: number;
      relationship?: number;
    };
    description: string;
  };

  // 加成配置
  bonuses?: {
    // 属性加成
    ability?: {
      workAbility?: number; // 工作能力达到要求
      reputation?: number; // 声誉达到要求
      luck?: number; // 幸运达到要求
    };
    // 效果
    effect: {
      multiplier?: number; // 收益倍率
      extraChange?: number; // 额外收益
      probabilityReduction?: number; // 风险概率降低（绝对值）
    };
  };

  // 特殊效果
  specialEffects?: {
    type: 'design_optimization' | 'issue_found' | 'inspection_pass' | 'leader_visit' | 'policy_interpretation';
    probability: number;
    description: string;
    effects?: {
      [key: string]: number;
    };
  };

  // 限制
  restrictions?: {
    maxConsecutiveUses?: number; // 最大连续使用次数
    cooldown?: number; // 冷却时间（季度）
  };
}

/**
 * 关系维护方式配置表
 */
export const RELATIONSHIP_ACTIONS: RelationshipAction[] = [
  // ==================== 甲方关系 ====================
  {
    id: 'client_dinner',
    name: '应酬宴请',
    description: '高风险高收益的社交活动',
    icon: '🍻',
    relationshipType: RelationshipType.CLIENT,

    cost: {
      cash: 2000,
      health: 3,
    },

    baseEffects: {
      relationshipChange: [8, 12],
    },

    risks: {
      probability: 0.15,
      type: 'health_loss',
      consequences: {
        health: 5, // 额外健康损失（总共 -8）
      },
      description: '过度应酬，身体不适',
    },

    bonuses: {
      ability: {
        workAbility: 50,
      },
      effect: {
        multiplier: 1.2,
      },
    },
  },

  {
    id: 'client_report',
    name: '项目汇报',
    description: '低风险稳健的工作汇报',
    icon: '📊',
    relationshipType: RelationshipType.CLIENT,

    cost: {
      health: 2,
    },

    baseEffects: {
      relationshipChange: [5, 8],
    },

    bonuses: {
      ability: {
        // workAbility 在 conditions 中检查
      },
      effect: {
        extraChange: 2,
      },
    },

    // 特殊：项目进度加成
    conditions: {
      minProgress: 50,
    },
  },

  // ==================== 设计院关系 ====================
  {
    id: 'design_exchange',
    name: '技术交流',
    description: '能力提升型交流活动',
    icon: '💡',
    relationshipType: RelationshipType.DESIGN,

    cost: {
      health: 2,
    },

    baseEffects: {
      relationshipChange: [6, 10],
      workAbility: 1,
    },

    conditions: {
      minHealth: 30,
    },

    specialEffects: {
      type: 'design_optimization',
      probability: 0.2,
      description: '获得设计优化方案',
      effects: {
        quality: 5,
        progress: 3,
      },
    },

    bonuses: {
      ability: {
        workAbility: 60,
      },
      effect: {
        // 工作能力 ≥ 60 时，特殊效果概率提升
      },
    },
  },

  {
    id: 'design_review',
    name: '图纸会审',
    description: '专业协作型图纸审查',
    icon: '📐',
    relationshipType: RelationshipType.DESIGN,

    cost: {
      health: 3,
    },

    baseEffects: {
      relationshipChange: [4, 7],
      quality: 1,
    },

    specialEffects: {
      type: 'issue_found',
      probability: 0.1,
      description: '提前发现图纸问题',
      effects: {
        progress: 2,
      },
    },

    bonuses: {
      ability: {
        workAbility: 45,
      },
      effect: {
        // 工作能力 ≥ 45 时，特殊效果概率提升到 18%
      },
    },
  },

  // ==================== 劳务队关系 ====================
  {
    id: 'labor_visit',
    name: '现场慰问',
    description: '低成本日常维护',
    icon: '🎁',
    relationshipType: RelationshipType.LABOR,

    cost: {
      cash: 500,
    },

    baseEffects: {
      relationshipChange: [5, 8],
    },

    risks: {
      probability: 0.1,
      type: 'dispute',
      consequences: {
        cash: 2000,
      },
      description: '发生劳务纠纷',
    },

    bonuses: {
      ability: {
        reputation: 50,
      },
      effect: {
        multiplier: 1.3,
      },
    },
  },

  {
    id: 'labor_resolve',
    name: '解决纠纷',
    description: '危机处理型纠纷解决',
    icon: '⚖️',
    relationshipType: RelationshipType.LABOR,

    cost: {
      cash: 0, // 根据纠纷程度决定
    },

    baseEffects: {
      relationshipChange: [8, 15],
    },

    conditions: {
      maxRelationship: 40, // 关系 ≤ 40 时可用
    },

    risks: {
      probability: 0.5,
      type: 'cash_loss',
      consequences: {
        cash: 3000, // 高额费用
      },
      description: '需要支付高额赔偿费用',
    },

    bonuses: {
      ability: {
        luck: 50,
      },
      effect: {
        probabilityReduction: 0.2, // 高额费用概率降为 30%
      },
    },
  },

  // ==================== 监理关系 ====================
  {
    id: 'supervision_gift',
    name: '礼品赠送',
    description: '高风险高收益的送礼',
    icon: '🎁',
    relationshipType: RelationshipType.SUPERVISION,

    cost: {
      cash: 1000,
    },

    baseEffects: {
      relationshipChange: [7, 10],
    },

    risks: {
      probability: 0.2,
      type: 'reputation_loss',
      consequences: {
        reputation: 5,
        relationship: 8,
      },
      description: '遇到廉政检查',
    },

    restrictions: {
      maxConsecutiveUses: 3, // 连续 3 次使用收益递减
    },

    bonuses: {
      ability: {
        luck: 40,
      },
      effect: {
        probabilityReduction: 0.1, // 检查概率降为 10%
      },
    },
  },

  {
    id: 'supervision_cooperate',
    name: '配合验收',
    description: '工作型稳定配合',
    icon: '✅',
    relationshipType: RelationshipType.SUPERVISION,

    cost: {
      health: 2,
    },

    baseEffects: {
      relationshipChange: [4, 6],
      quality: 1,
    },

    specialEffects: {
      type: 'inspection_pass',
      probability: 0.15,
      description: '监理主动放水',
      effects: {
        progress: 3,
      },
    },

    bonuses: {
      ability: {
        workAbility: 50,
      },
      effect: {
        multiplier: 1.3,
      },
    },
  },

  // ==================== 政府关系 ====================
  {
    id: 'government_visit',
    name: '公关拜访',
    description: '赌博型极端收益方式',
    icon: '🏛️',
    relationshipType: RelationshipType.GOVERNMENT,

    cost: {
      cash: 3000,
      health: 4,
    },

    baseEffects: {
      relationshipChange: [5, 9],
    },

    risks: {
      probability: 0.3, // 30% 概率遇到大领导
      type: 'relationship_loss',
      consequences: {
        relationship: 10, // 惩罚：现金不足时关系 -10
      },
      description: '现金不足，被拒之门外',
    },

    bonuses: {
      ability: {
        reputation: 70,
      },
      effect: {
        // 声誉 ≥ 70 时，大领导概率 45%
      },
    },

    conditions: {
      // cash < 3000 时触发惩罚
    },

    specialEffects: {
      type: 'leader_visit',
      probability: 0.3, // 基础概率 30%
      description: '遇到大领导在家',
      effects: {
        relationship: 15, // 额外 +15
      },
    },
  },

  {
    id: 'government_study',
    name: '政策学习',
    description: '安全稳健型学习活动',
    icon: '📖',
    relationshipType: RelationshipType.GOVERNMENT,

    cost: {
      health: 3,
    },

    baseEffects: {
      relationshipChange: [4, 7],
    },

    bonuses: {
      ability: {
        workAbility: 55,
      },
      effect: {
        extraChange: 2,
      },
    },

    specialEffects: {
      type: 'policy_interpretation',
      probability: 0.1,
      description: '获得政策解读',
      effects: {
        // 下次季度仓储费 -50%
      },
    },

    conditions: {
      // workAbility ≥ 70 时触发特殊效果
    },
  },
];

/**
 * 按关系类型分组
 */
export const ACTIONS_BY_RELATIONSHIP: Record<RelationshipType, RelationshipAction[]> = {
  [RelationshipType.CLIENT]: RELATIONSHIP_ACTIONS.filter(a => a.relationshipType === RelationshipType.CLIENT),
  [RelationshipType.SUPERVISION]: RELATIONSHIP_ACTIONS.filter(a => a.relationshipType === RelationshipType.SUPERVISION),
  [RelationshipType.DESIGN]: RELATIONSHIP_ACTIONS.filter(a => a.relationshipType === RelationshipType.DESIGN),
  [RelationshipType.LABOR]: RELATIONSHIP_ACTIONS.filter(a => a.relationshipType === RelationshipType.LABOR),
  [RelationshipType.GOVERNMENT]: RELATIONSHIP_ACTIONS.filter(a => a.relationshipType === RelationshipType.GOVERNMENT),
};

/**
 * 动作 ID 索引
 */
export const ACTION_MAP: Record<string, RelationshipAction> = RELATIONSHIP_ACTIONS.reduce((map, action) => {
  map[action.id] = action;
  return map;
}, {} as Record<string, RelationshipAction>);
