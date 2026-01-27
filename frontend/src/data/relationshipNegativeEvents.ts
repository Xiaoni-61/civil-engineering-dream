/**
 * 关系负面事件数据
 * 当各方关系值过低时触发，共 25 个负面事件（每种关系 5 个）
 */

import { RelationshipNegativeEvent, RelationshipType, EndReason } from '@shared/types';

export const RELATIONSHIP_NEGATIVE_EVENTS: RelationshipNegativeEvent[] = [
  // ==================== 甲方关系低事件 ====================
  {
    id: 'client_low_40',
    title: '甲方刁难',
    description: '甲方对你的工作表现开始挑剔，频繁提出额外要求，给项目推进带来困难。',
    triggerCondition: {
      relationshipType: RelationshipType.CLIENT,
      maxValue: 40,
    },
    effects: {
      progress: -2,
      reputation: -2,
    },
  },
  {
    id: 'client_low_30',
    title: '工程款拖延',
    description: '甲方以各种理由拖延工程款支付，导致项目资金链紧张。',
    triggerCondition: {
      relationshipType: RelationshipType.CLIENT,
      maxValue: 30,
    },
    effects: {
      cash: -5000,
      relationshipChanges: {
        [RelationshipType.CLIENT]: -5,
      },
    },
  },
  {
    id: 'client_low_20',
    title: '甲方威胁停工',
    description: '甲方对项目进展极其不满，威胁要停工更换项目负责人！',
    triggerCondition: {
      relationshipType: RelationshipType.CLIENT,
      maxValue: 20,
    },
    effects: {
      progress: -5,
      health: -5,
    },
  },
  {
    id: 'client_low_10',
    title: '被踢出项目',
    description: '甲方彻底失去信任，决定将你从项目中移除，这是一个巨大的职业打击！',
    triggerCondition: {
      relationshipType: RelationshipType.CLIENT,
      maxValue: 10,
    },
    effects: {
      reputation: -15,
      cash: -10000,
    },
  },
  {
    id: 'client_low_0',
    title: '彻底决裂',
    description: '与甲方关系彻底破裂，被行业内部通报批评，职业生涯面临毁灭性打击！',
    triggerCondition: {
      relationshipType: RelationshipType.CLIENT,
      maxValue: 0,
    },
    effects: {
      reputation: -50,
    },
    isGameEnding: true,
    gameEndingReason: EndReason.REPUTATION_DEPLETED,
  },

  // ==================== 监理关系低事件 ====================
  {
    id: 'supervision_low_40',
    title: '监理挑刺',
    description: '监理工程师开始对你的工作吹毛求疵，任何小问题都被放大。',
    triggerCondition: {
      relationshipType: RelationshipType.SUPERVISION,
      maxValue: 40,
    },
    effects: {
      quality: -2,
      progress: -1,
    },
  },
  {
    id: 'supervision_low_30',
    title: '频繁返工',
    description: '监理频繁要求返工，严重影响项目进度和成本。',
    triggerCondition: {
      relationshipType: RelationshipType.SUPERVISION,
      maxValue: 30,
    },
    effects: {
      cash: -3000,
      progress: -3,
    },
  },
  {
    id: 'supervision_low_20',
    title: '停工整改',
    description: '监理下发停工整改通知书，项目被迫暂停，需要投入大量资金整改。',
    triggerCondition: {
      relationshipType: RelationshipType.SUPERVISION,
      maxValue: 20,
    },
    effects: {
      progress: -8,
      cash: -8000,
    },
  },
  {
    id: 'supervision_low_10',
    title: '吊销执业资格',
    description: '监理向主管部门举报你的违规行为，执业资格面临被吊销的风险！',
    triggerCondition: {
      relationshipType: RelationshipType.SUPERVISION,
      maxValue: 10,
    },
    effects: {
      reputation: -20,
    },
  },
  {
    id: 'supervision_low_0',
    title: '行业封杀',
    description: '监理联合多家单位对你进行行业封杀，你已无法在行业内立足！',
    triggerCondition: {
      relationshipType: RelationshipType.SUPERVISION,
      maxValue: 0,
    },
    effects: {
      reputation: -50,
    },
    isGameEnding: true,
    gameEndingReason: EndReason.REPUTATION_DEPLETED,
  },

  // ==================== 设计院关系低事件 ====================
  {
    id: 'design_low_40',
    title: '图纸变更慢',
    description: '设计院对你的项目优先级降低，图纸变更流程异常缓慢。',
    triggerCondition: {
      relationshipType: RelationshipType.DESIGN,
      maxValue: 40,
    },
    effects: {
      progress: -2,
    },
  },
  {
    id: 'design_low_30',
    title: '设计配合消极',
    description: '设计院在技术问题上配合消极，影响项目质量。',
    triggerCondition: {
      relationshipType: RelationshipType.DESIGN,
      maxValue: 30,
    },
    effects: {
      quality: -2,
    },
  },
  {
    id: 'design_low_20',
    title: '重大设计错误',
    description: '设计院在关键节点出现重大设计错误，需要大量资金返工！',
    triggerCondition: {
      relationshipType: RelationshipType.DESIGN,
      maxValue: 20,
    },
    effects: {
      cash: -10000,
      quality: -5,
    },
  },
  {
    id: 'design_low_10',
    title: '设计院断绝合作',
    description: '设计院正式宣布不再与你的项目合作，项目进度陷入停滞，公司被迫降职处理。',
    triggerCondition: {
      relationshipType: RelationshipType.DESIGN,
      maxValue: 10,
    },
    effects: {
      progress: -20,
      reputation: -10,
    },
  },
  {
    id: 'design_low_0',
    title: '设计全面崩溃',
    description: '多家设计院联合抵制，项目无法推进，职业生涯宣告终结！',
    triggerCondition: {
      relationshipType: RelationshipType.DESIGN,
      maxValue: 0,
    },
    effects: {
      reputation: -50,
      progress: -30,
    },
    isGameEnding: true,
    gameEndingReason: EndReason.REPUTATION_DEPLETED,
  },

  // ==================== 劳务队关系低事件 ====================
  {
    id: 'labor_low_40',
    title: '工人消极怠工',
    description: '劳务队对你的管理方式不满，工人开始消极怠工。',
    triggerCondition: {
      relationshipType: RelationshipType.LABOR,
      maxValue: 40,
    },
    effects: {
      progress: -2,
      quality: -1,
    },
  },
  {
    id: 'labor_low_30',
    title: '劳务罢工',
    description: '劳务队因待遇问题组织罢工，项目被迫中断。',
    triggerCondition: {
      relationshipType: RelationshipType.LABOR,
      maxValue: 30,
    },
    effects: {
      progress: -5,
      cash: -2000,
    },
  },
  {
    id: 'labor_low_20',
    title: '群体事件',
    description: '劳务纠纷升级为群体事件，引起有关部门关注，声誉和资金双双受损。',
    triggerCondition: {
      relationshipType: RelationshipType.LABOR,
      maxValue: 20,
    },
    effects: {
      reputation: -10,
      cash: -5000,
    },
  },
  {
    id: 'labor_low_10',
    title: '劳务队集体离职',
    description: '劳务队集体辞职，项目无法继续，公司宣布项目失败！',
    triggerCondition: {
      relationshipType: RelationshipType.LABOR,
      maxValue: 10,
    },
    effects: {
      progress: -15,
      cash: -8000,
    },
    isGameEnding: true,
    gameEndingReason: EndReason.REPUTATION_DEPLETED,
  },
  {
    id: 'labor_low_0',
    title: '劳务全面断供',
    description: '整个劳务行业对你进行封锁，没有任何队伍愿意接手你的项目！',
    triggerCondition: {
      relationshipType: RelationshipType.LABOR,
      maxValue: 0,
    },
    effects: {
      reputation: -50,
      cash: -15000,
    },
    isGameEnding: true,
    gameEndingReason: EndReason.REPUTATION_DEPLETED,
  },

  // ==================== 政府关系低事件 ====================
  {
    id: 'government_low_40',
    title: '检查增多',
    description: '政府部门加强对你的项目检查，你需要花费大量时间应对，健康受到影响。',
    triggerCondition: {
      relationshipType: RelationshipType.GOVERNMENT,
      maxValue: 40,
    },
    effects: {
      health: -3,
      progress: -1,
    },
  },
  {
    id: 'government_low_30',
    title: '行政处罚',
    description: '政府部门对你的项目违规行为进行行政处罚，罚款并记入档案。',
    triggerCondition: {
      relationshipType: RelationshipType.GOVERNMENT,
      maxValue: 30,
    },
    effects: {
      cash: -5000,
      reputation: -5,
    },
  },
  {
    id: 'government_low_20',
    title: '项目被叫停',
    description: '政府下令暂停你的项目，进行全面审查，项目进度和资金受到重创。',
    triggerCondition: {
      relationshipType: RelationshipType.GOVERNMENT,
      maxValue: 20,
    },
    effects: {
      progress: -10,
      cash: -15000,
    },
  },
  {
    id: 'government_low_10',
    title: '被列入黑名单',
    description: '被政府列入行业黑名单，所有在建项目被叫停，公司业务全面瘫痪！',
    triggerCondition: {
      relationshipType: RelationshipType.GOVERNMENT,
      maxValue: 10,
    },
    effects: {
      reputation: -30,
      cash: -20000,
    },
    isGameEnding: true,
    gameEndingReason: EndReason.REPUTATION_DEPLETED,
  },
  {
    id: 'government_low_0',
    title: '吊销资质',
    description: '政府正式吊销你的执业资质，你将永远无法再从事土木工程行业！',
    triggerCondition: {
      relationshipType: RelationshipType.GOVERNMENT,
      maxValue: 0,
    },
    effects: {
      reputation: -50,
    },
    isGameEnding: true,
    gameEndingReason: EndReason.REPUTATION_DEPLETED,
  },
];

/**
 * 根据关系类型和当前值获取可能触发的负面事件
 * @param relationshipType 关系类型
 * @param currentValue 当前关系值
 * @returns 可能触发的负面事件数组
 */
export function getNegativeEventsForRelationship(
  relationshipType: string,
  currentValue: number
): RelationshipNegativeEvent[] {
  return RELATIONSHIP_NEGATIVE_EVENTS.filter(
    event =>
      event.triggerCondition.relationshipType === relationshipType &&
      currentValue <= event.triggerCondition.maxValue
  );
}

/**
 * 获取某个关系类型最严重的可触发事件
 * @param relationshipType 关系类型
 * @param currentValue 当前关系值
 * @returns 最严重的负面事件，如果没有则返回 undefined
 */
export function getMostSevereNegativeEvent(
  relationshipType: string,
  currentValue: number
): RelationshipNegativeEvent | undefined {
  const events = getNegativeEventsForRelationship(relationshipType, currentValue);
  // 返回 maxValue 最小的（最严重的）事件
  return events.reduce((mostSevere, event) => {
    if (!mostSevere || event.triggerCondition.maxValue < mostSevere.triggerCondition.maxValue) {
      return event;
    }
    return mostSevere;
  }, undefined as RelationshipNegativeEvent | undefined);
}

/**
 * 检查是否有游戏结束级别的负面事件
 * @param relationshipType 关系类型
 * @param currentValue 当前关系值
 * @returns 游戏结束事件，如果没有则返回 undefined
 */
export function getGameEndingNegativeEvent(
  relationshipType: string,
  currentValue: number
): RelationshipNegativeEvent | undefined {
  return RELATIONSHIP_NEGATIVE_EVENTS.find(
    event =>
      event.isGameEnding &&
      event.triggerCondition.relationshipType === relationshipType &&
      currentValue <= event.triggerCondition.maxValue
  );
}
