/**
 * 关系特殊剧情事件
 * 当关系值达到高值时触发的特殊剧情事件
 * 每个关系类型 3 个事件，共 15 个
 */

import { EventCard } from '@shared/types';
import { RelationshipType } from '@shared/types';

/**
 * 甲方关系特殊事件（关系 ≥ 80）
 */

// 甲方的私人邀请
const clientPrivateInvite: EventCard = {
  id: 'special_client_private_invite',
  title: '⭐⭐ 甲方的私人邀请',
  description: `周末的晚上，你接到了甲方王总的电话。

"老弟，明天有空吗？我几个朋友约着打球，缺个人，你过来一起？都是些做工程的，多认识认识没坏处。"

你犹豫了一下，王总继续说："放松放松嘛，工作中我们是甲乙方，私底下就是朋友。对了，我也想跟你聊聊接下来的几个项目。"

这是一个难得的社交机会，但也要付出私人时间...`,
  options: [
    {
      id: 'opt_client_invite_1',
      text: '欣然前往，扩大人脉',
      effects: {
        cash: -2000,
        health: -3,
        reputation: 10,
      },
      feedback: '你在球场上认识了几个行业大佬，王总对你的评价也更高了。这次社交的价值远超预期！',
    },
    {
      id: 'opt_client_invite_2',
      text: '礼貌婉拒',
      effects: {
        reputation: -2,
        health: 2,
      },
      feedback: '王总有些失望，但也没说什么。不过你错过了一个建立私人关系的好机会。',
    },
    {
      id: 'opt_client_invite_3',
      text: '提议改时间',
      effects: {
        reputation: 3,
        health: -1,
      },
      feedback: '你表达了重视，但提议换个时间。王总表示理解，说下次再约。',
    },
  ],
};

// 甲方的内部消息
const clientInsiderInfo: EventCard = {
  id: 'special_client_insider_info',
  title: '⭐⭐ 甲方的内部消息',
  description: `王总把你叫到办公室，关上门后说："老弟，我跟你说个事。公司年底可能有个人事调整，现在的总经理要退休了。我听到消息，新任总经理可能会调整合作策略，对咱们这些老合作方影响不小。"

他顿了顿："不过你放心，我会帮你说话的。你自己也要做好准备，该表现的时候一定要表现。"

这条消息对你来说非常重要...`,
  options: [
    {
      id: 'opt_client_info_1',
      text: '感谢信任，表示会努力表现',
      effects: {
        reputation: 8,
        health: -5,
        progress: 5,
      },
      feedback: '王总很满意你的态度。接下来的几个月，你更加努力工作，为新领导的到来做好准备。',
    },
    {
      id: 'opt_client_info_2',
      text: '询问具体应对策略',
      effects: {
        reputation: 5,
        cash: 3000,
      },
      feedback: '王总给了你一些具体建议。按照他的指点，你提前做了布局，避免了不少损失。',
    },
    {
      id: 'opt_client_info_3',
      text: '只是表示感谢',
      effects: {
        reputation: 2,
      },
      feedback: '王总有些遗憾，觉得你没有充分重视这个消息。不过他也理解你的谨慎。',
    },
  ],
};

// 甲方的推荐
const clientRecommendation: EventCard = {
  id: 'special_client_recommendation',
  title: '⭐⭐ 甲方的强烈推荐',
  description: `公司年终会议上，王总在汇报中特别提到了你的团队："今年最满意的项目就是和XX公司的合作。他们的专业能力、服务态度都是一流的。我强烈建议公司继续深化合作。"

会议结束后，公司董事长找到你："王总对你的评价很高。这样吧，明年有两个重点项目，优先考虑你们公司。不过质量要求很高，你能保证吗？"

这是甲方对你最高的认可！`,
  options: [
    {
      id: 'opt_client_rec_1',
      text: '郑重承诺，全力保证',
      effects: {
        cash: 25000,
        reputation: 15,
        health: -8,
        quality: 10,
      },
      feedback: '你顶着压力完成了重点项目，质量得到各方认可。甲方对你的信任达到新的高度！',
    },
    {
      id: 'opt_client_rec_2',
      text: '坦诚沟通，理性承诺',
      effects: {
        cash: 15000,
        reputation: 8,
        progress: 3,
      },
      feedback: '你的坦诚让董事长很欣赏。项目顺利完成，双方都满意。',
    },
  ],
};

/**
 * 监理关系特殊事件（关系 ≥ 75）
 */

// 监理的默契
const supervisionUnderstanding: EventCard = {
  id: 'special_supervision_understanding',
  title: '⭐⭐ 监理的默契配合',
  description: `项目进行到关键阶段，工期紧张。监理单位的陈总找到你："老弟，我知道你们赶进度很辛苦。这样吧，在不影响质量和安全的前提下，我们配合你们加快验收流程。但是你要答应我，该检查的环节一个都不能少。"

这种默契配合是多年信任的结果...`,
  options: [
    {
      id: 'opt_sup_under_1',
      text: '郑重承诺，保证质量',
      effects: {
        progress: 15,
        quality: 5,
        reputation: 8,
        health: -5,
      },
      feedback: '有了监理的配合，项目进度大大加快。你没有辜负这份信任，质量也得到了保证。',
    },
    {
      id: 'opt_sup_under_2',
      text: '表示感谢，但按常规流程',
      effects: {
        reputation: 5,
        quality: 8,
      },
      feedback: '陈总很欣赏你的严谨。虽然进度慢了点，但质量更有保障。',
    },
  ],
};

// 监理的推荐
const supervisionRecommendation: EventCard = {
  id: 'special_supervision_recommendation',
  title: '⭐⭐ 监理的行业推荐',
  description: `陈总给你打电话："老弟，有个外地项目，监理单位是我老同学。他说找个靠谱的合作方很难，我推荐了你。项目不大，但是挺重要的。你要不要试试？"

这是监理把你当做自己人的表现...`,
  options: [
    {
      id: 'opt_sup_rec_1',
      text: '欣然接受，全力以赴',
      effects: {
        cash: 18000,
        reputation: 12,
        health: -6,
        progress: 5,
      },
      feedback: '项目顺利完成，陈总的老同学对你的工作非常满意。这次合作为你在行业内打开了新局面！',
    },
    {
      id: 'opt_sup_rec_2',
      text: '谨慎评估后决定',
      effects: {
        cash: 10000,
        reputation: 6,
        progress: 3,
      },
      feedback: '项目顺利完成，监理的关系网也为你拓展了新的人脉。',
    },
    {
      id: 'opt_sup_rec_3',
      text: '婉言谢绝',
      effects: {
        reputation: -3,
      },
      feedback: '陈总有些失望，说这么好的机会都可惜了。',
    },
  ],
};

// 监理的帮助
const supervisionHelp: EventCard = {
  id: 'special_supervision_help',
  title: '⭐⭐ 监理的及时帮助',
  description: `项目遇到了技术难题，方案迟迟定不下来，各方争执不下。监理陈总主动站出来："我干了三十年监理，这个问题我见过。按照我的经验，应该这样处理..."

他详细分析了问题，提出了折中方案。各方都表示认可，问题迎刃而解。

关键时刻，老专家的经验就是救命稻草...`,
  options: [
    {
      id: 'opt_sup_help_1',
      text: '虚心接受，深度感谢',
      effects: {
        quality: 15,
        progress: 10,
        reputation: 10,
        cash: -3000,
      },
      feedback: '你专门准备了一份感谢礼。陈总虽然推辞，但也很感动。这次帮助让你避免了大损失！',
    },
    {
      id: 'opt_sup_help_2',
      text: '表示感谢',
      effects: {
        quality: 10,
        progress: 5,
        reputation: 5,
      },
      feedback: '问题解决了，监理对你的专业态度更认可了。',
    },
  ],
};

/**
 * 劳务队关系特殊事件（关系 ≥ 75）
 */

// 劳务队的忠诚
const laborLoyalty: EventCard = {
  id: 'special_labor_loyalty',
  title: '⭐⭐ 劳务队的患难忠诚',
  description: `项目遇到资金问题，工资拖欠了一个月。其他项目的队伍都闹起来了，有的甚至停工抗议。

但你的队伍却没有。老张找到你："老板，我们知道你为人仗义，肯定不是故意拖欠。你放心，我们兄弟不会给你添乱。钱什么时候有，我们什么时候走。"

这份患难中的忠诚，让你眼眶发热...`,
  options: [
    {
      id: 'opt_labor_loyal_1',
      text: '承诺尽快解决，额外奖励',
      effects: {
        cash: -8000,
        reputation: 15,
        health: 5,
        progress: 8,
      },
      feedback: '你东拼西凑，终于凑够了工资，还额外给了奖金。工人们很感动，队伍更加稳定团结了。',
    },
    {
      id: 'opt_labor_loyal_2',
      text: '表示感谢，尽快解决',
      effects: {
        cash: -5000,
        reputation: 10,
        progress: 5,
      },
      feedback: '你尽快解决了工资问题。劳务队对你的信任度达到了新高度。',
    },
  ],
};

// 劳务队的建议
const laborSuggestion: EventCard = {
  id: 'special_labor_suggestion',
  title: '⭐⭐ 劳务队的宝贵建议',
  description: `老张找到你："老板，我看了下图纸，这个节点按照图纸做有点问题。我们以前做过类似的，如果稍微改一下，既省钱又省时间，质量还更好。要不要跟设计院说说？"

工人的实践经验有时候比理论更宝贵...`,
  options: [
    {
      id: 'opt_labor_sug_1',
      text: '重视建议，与设计院沟通',
      effects: {
        cash: 12000,
        quality: 10,
        progress: 8,
        health: -3,
      },
      feedback: '设计院采纳了建议，方案得到优化。老张的建议为公司节省了大量成本！',
    },
    {
      id: 'opt_labor_sug_2',
      text: '表示感谢，但按图施工',
      effects: {
        quality: 5,
        reputation: 3,
      },
      feedback: '老张有些失望，但也理解。你按照图纸完成了施工，没有出现问题。',
    },
  ],
};

// 劳务队的支持
const laborSupport: EventCard = {
  id: 'special_labor_support',
  title: '⭐⭐ 劳务队的鼎力支持',
  description: `项目工期紧张，需要赶工。你找到老张，说明了情况。

老张二话不说："老板，你说怎么干就怎么干。我们兄弟加班加点，绝不掉链子。不过你放心，该检查的环节一个不会少，质量你放心。"

这份支持，让你在甲方面前有了底气...`,
  options: [
    {
      id: 'opt_labor_sup_1',
      text: '给予加班奖励，表达感谢',
      effects: {
        cash: -6000,
        progress: 20,
        quality: 5,
        reputation: 10,
        health: -3,
      },
      feedback: '你给予了丰厚的加班费。工人们干劲十足，项目按时完成，质量也得到了保证！',
    },
    {
      id: 'opt_labor_sup_2',
      text: '表示感谢',
      effects: {
        progress: 15,
        reputation: 5,
        health: -5,
      },
      feedback: '工人们加班加点，项目勉强按时完成。你欠了他们一个人情。',
    },
  ],
};

/**
 * 设计院关系特殊事件（关系 ≥ 80）
 */

// 设计院的内幕
const designInsider: EventCard = {
  id: 'special_design_insider',
  title: '⭐⭐ 设计院的重要内幕',
  description: `李工约你吃饭，酒过三巡，他说："老弟，跟你交个底。明年新规范要实施了，现在的材料很多都要淘汰。我看了下你们的材料采购清单，如果按清单买，到时候肯定要返工。听我的，换个方案。"

这个消息太重要了，如果没提前知道，损失就大了...`,
  options: [
    {
      id: 'opt_design_insider_1',
      text: '虚心接受，调整方案',
      effects: {
        cash: 20000,
        reputation: 10,
        quality: 10,
        health: -3,
      },
      feedback: '你立即调整了采购计划。新规范实施时，其他项目都在返工，只有你的项目顺利通过验收！',
    },
    {
      id: 'opt_design_insider_2',
      text: '表示怀疑，谨慎评估',
      effects: {
        cash: 8000,
        reputation: 5,
        quality: 5,
      },
      feedback: '你做了些调研，最后还是调整了方案。虽然不如全部调整收益大，但也避免了损失。',
    },
  ],
};

// 设计院的建议
const designSuggestion: EventCard = {
  id: 'special_design_suggestion',
  title: '⭐⭐ 设计院的专业建议',
  description: `李工在看完你的项目后说："老弟，你这个项目做得不错。不过我有个建议，如果在这个环节做些优化，成本能降30%，质量还能提升。这个方案我们可以免费给你，就当是感谢之前的合作。"

专业建议的价值，有时候比直接给钱还重要...`,
  options: [
    {
      id: 'opt_design_sug_1',
      text: '欣然接受，表示感谢',
      effects: {
        cash: 15000,
        quality: 15,
        reputation: 8,
        progress: 5,
      },
      feedback: '优化方案效果显著，成本大幅降低，质量还有提升。甲方对你的专业能力赞不绝口！',
    },
    {
      id: 'opt_design_sug_2',
      text: '表示感谢，但暂不采用',
      effects: {
        reputation: 3,
      },
      feedback: '李工有些遗憾，但也表示理解。你按照原方案完成了项目。',
    },
  ],
};

// 设计院的优化
const designOptimization: EventCard = {
  id: 'special_design_optimization',
  title: '⭐⭐ 设计院的深度优化',
  description: `李工找到你："老弟，我们院最近在研究新工艺，我觉得你的项目很适合。我们可以免费给你做个优化方案，成本降20%，工期还能缩短10天。不过这是新技术，有一定风险。"

新技术往往伴随着机遇和风险...`,
  options: [
    {
      id: 'opt_design_opt_1',
      text: '大胆尝试，勇于创新',
      effects: {
        cash: 25000,
        progress: 10,
        quality: 10,
        reputation: 15,
        health: -5,
      },
      feedback: '你敢于尝试新技术，项目大获成功！设计院在你的项目中树立了标杆，你的声誉也达到新高度！',
    },
    {
      id: 'opt_design_opt_2',
      text: '谨慎评估，小范围试验',
      effects: {
        cash: 12000,
        progress: 5,
        quality: 8,
        reputation: 8,
      },
      feedback: '你先在小范围试验，成功后再推广。虽然收益不如全部采用，但风险也控制住了。',
    },
    {
      id: 'opt_design_opt_3',
      text: '稳妥起见，按传统方案',
      effects: {
        reputation: -2,
      },
      feedback: '李工有些失望，说这是推广新技术的好机会。你按传统方案完成了项目。',
    },
  ],
};

/**
 * 政府关系特殊事件（关系 ≥ 85）
 */

// 政府的特殊照顾
const governmentSpecialCare: EventCard = {
  id: 'special_government_care',
  title: '⭐⭐ 政府的特殊照顾',
  description: `建委张科长找到你："老弟，市里要在咱们区选几个示范项目，享受税收优惠和政策扶持。我觉得你们的项目很有希望，要不要申请申请？不过名额有限，竞争很激烈。"

这是政府对你的认可，也是难得的机会...`,
  options: [
    {
      id: 'opt_gov_care_1',
      text: '全力争取，精心准备',
      effects: {
        cash: 30000,
        reputation: 15,
        health: -5,
        progress: 5,
      },
      feedback: '你精心准备了申报材料，项目成功入选示范工程！政府的支持让你在行业中树立了标杆！',
    },
    {
      id: 'opt_gov_care_2',
      text: '简单准备试试看',
      effects: {
        cash: 15000,
        reputation: 8,
      },
      feedback: '虽然没有入选示范工程，但政府给了政策扶持，也算有所收获。',
    },
  ],
};

// 政府的支持
const governmentSupport: EventCard = {
  id: 'special_government_support',
  title: '⭐⭐ 政府的鼎力支持',
  description: `项目遇到了一些手续问题，按流程至少要等一个月。你找到张科长求助。

张科长说："你们的项目是市里的重点工程，不能耽误。我给你们开通绿色通道，三天内办完所有手续。不过你们要保证质量，别给我丢脸。"

政府的支持，让项目得以顺利进行...`,
  options: [
    {
      id: 'opt_gov_sup_1',
      text: '郑重承诺，全力保证质量',
      effects: {
        progress: 20,
        quality: 10,
        reputation: 12,
        cash: -4000,
      },
      feedback: '项目顺利完成，张科长在总结大会上专门表扬了你们。政府的支持让你受益匪浅！',
    },
    {
      id: 'opt_gov_sup_2',
      text: '表示感谢',
      effects: {
        progress: 15,
        reputation: 8,
        quality: 5,
      },
      feedback: '手续快速办完，项目得以顺利进行。你对政府的帮助心存感激。',
    },
  ],
};

// 政府的荣誉
const governmentHonor: EventCard = {
  id: 'special_government_honor',
  title: '⭐⭐ 政府的崇高荣誉',
  description: `市政府召开年度建筑行业大会，你的项目被评为"年度优质工程"。

市长亲自为你颁奖："这个项目是行业的标杆，值得所有人学习。希望你们再接再厉，为城市建设做出更大贡献。"

这是行业内的最高荣誉，你的声誉达到了顶峰...`,
  options: [
    {
      id: 'opt_gov_honor_1',
      text: '珍惜荣誉，再创佳绩',
      effects: {
        cash: 20000,
        reputation: 20,
        health: 3,
        progress: 5,
      },
      feedback: '你把荣誉证书挂在公司最显眼的位置。这个荣誉为你带来了更多项目和合作机会！',
    },
    {
      id: 'opt_gov_honor_2',
      text: '谦虚谨慎，低调处理',
      effects: {
        reputation: 12,
        cash: 10000,
      },
      feedback: '你低调处理了这个荣誉，但行业内还是传开了。你的专业能力得到了广泛认可。',
    },
  ],
};

/**
 * 获取关系特殊剧情事件
 * @param relationshipType 关系类型
 * @param relationshipValue 关系值
 * @returns 事件卡片数组
 */
export function getRelationshipSpecialEvents(
  relationshipType: RelationshipType,
  relationshipValue: number
): EventCard[] {
  const events: EventCard[] = [];

  switch (relationshipType) {
    case RelationshipType.CLIENT:
      if (relationshipValue >= 80) {
        events.push(clientPrivateInvite, clientInsiderInfo, clientRecommendation);
      }
      break;

    case RelationshipType.SUPERVISION:
      if (relationshipValue >= 75) {
        events.push(supervisionUnderstanding, supervisionRecommendation, supervisionHelp);
      }
      break;

    case RelationshipType.LABOR:
      if (relationshipValue >= 75) {
        events.push(laborLoyalty, laborSuggestion, laborSupport);
      }
      break;

    case RelationshipType.DESIGN:
      if (relationshipValue >= 80) {
        events.push(designInsider, designSuggestion, designOptimization);
      }
      break;

    case RelationshipType.GOVERNMENT:
      if (relationshipValue >= 85) {
        events.push(governmentSpecialCare, governmentSupport, governmentHonor);
      }
      break;
  }

  return events;
}

/**
 * 检查是否应该触发关系特殊事件
 * @param relationshipType 关系类型
 * @param relationshipValue 关系值
 * @returns 事件卡片或 null
 */
export function checkRelationshipSpecialEventTrigger(
  relationshipType: RelationshipType,
  relationshipValue: number
): EventCard | null {
  const events = getRelationshipSpecialEvents(relationshipType, relationshipValue);

  if (events.length === 0) {
    return null;
  }

  // 10% 概率触发特殊事件
  if (Math.random() >= 0.10) {
    return null;
  }

  // 随机返回一个事件
  return events[Math.floor(Math.random() * events.length)];
}

/**
 * 获取所有关系特殊剧情事件（用于测试）
 */
export function getAllRelationshipSpecialEvents(): EventCard[] {
  return [
    // 甲方
    clientPrivateInvite,
    clientInsiderInfo,
    clientRecommendation,
    // 监理
    supervisionUnderstanding,
    supervisionRecommendation,
    supervisionHelp,
    // 劳务队
    laborLoyalty,
    laborSuggestion,
    laborSupport,
    // 设计院
    designInsider,
    designSuggestion,
    designOptimization,
    // 政府
    governmentSpecialCare,
    governmentSupport,
    governmentHonor,
  ];
}
