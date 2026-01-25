/**
 * LLM Prompt 模板
 * 所有 Prompt 在后端定义，确保安全性
 */

interface EnhancePromptParams {
  title: string;
  description: string;
  stats: {
    cash: number;
    health: number;
    reputation: number;
    progress: number;
    quality: number;
  };
  round: number;
}

interface SpecialEventPromptParams {
  stats: {
    cash: number;
    health: number;
    reputation: number;
    progress: number;
    quality: number;
  };
  round: number;
}

/**
 * 构建事件描述增强 Prompt
 */
export function buildEnhancePrompt(params: EnhancePromptParams): string {
  const { title, description, stats, round } = params;

  // 根据玩家状态选择上下文
  let context = '';
  if (stats.cash < 30) context += '当前资金紧张，';
  if (stats.health < 30) context += '身体状态不佳，';
  if (stats.reputation > 70) context += '行业口碑很好，';
  if (round > 15) context += '项目进入后期，';

  return `你是土木工程游戏的内容编辑。请重写以下事件卡的描述，使其更生动、更有代入感。

【原始事件】
标题：${title}
描述：${description}

【当前状态】
第 ${round} 回合
${context}

【要求】
1. 保持原事件的核心情节和选择逻辑不变
2. 增加细节描写（时间、地点、人物表情、环境等）
3. 使用第一人称或第二人称视角，增强代入感
4. 加入土木工程行业术语和真实感
5. 控制在 50-80 字
6. 只返回描述文本，不要其他内容

【重写后的描述】`;
}

/**
 * 构建特殊事件生成 Prompt
 */
export function buildSpecialEventPrompt(params: SpecialEventPromptParams): string {
  const { stats, round } = params;

  // 根据状态选择事件类型
  let eventType = '随机事件';
  if (stats.cash < 20) {
    eventType = '资金危机';
  } else if (stats.health < 20) {
    eventType = '健康危机';
  } else if (stats.reputation > 70) {
    eventType = '意外好运';
  } else if (round > 15) {
    eventType = '项目后期事件';
  }

  return `你是土木工程游戏的资深策划。请设计一个${eventType}的特殊事件。

【游戏背景】
- 这是一个土木工程项目管理的模拟游戏
- 玩家需要平衡 5 项指标：现金、健康、声誉、进度、质量
- 每项指标范围 0-100，归零会失败

【当前状态】
- 第 ${round} 回合
- 现金：${stats.cash}
- 健康：${stats.health}
- 声誉：${stats.reputation}
- 进度：${stats.progress}%
- 质量：${stats.quality}%

【要求】
1. 设计一个戏剧性的事件（50-80字描述）
2. 提供 3 个选项，每个选项有明确的后果
3. 数值变化范围：-30 到 +30
4. 确保没有必死选项（所有指标不会同时降到 0 以下）
5. 使用 JSON 格式返回

【返回格式】
\`\`\`json
{
  "title": "事件标题（5-10字）",
  "description": "事件描述",
  "options": [
    {
      "id": "opt_1",
      "text": "选项1描述",
      "effects": {
        "cash": 数值,
        "health": 数值,
        "reputation": 数值,
        "progress": 数值,
        "quality": 数值
      },
      "feedback": "选择后的反馈"
    }
  ]
}
\`\`\`

现在请生成一个${eventType}事件：`;
}

/**
 * 获取降级描述（当 LLM 失败时使用）
 */
const fallbackDescriptions: Record<string, string> = {
  'event_001': '甲方项目负责人突然打电话过来，声音有些急促："小张啊，这个方案还得再调整一下，明天早上开会要用。你看看今晚能不能加个班？"',
  'event_002': '施工队老王发来消息，说钢筋价格又涨了，现在进货比原预算多了 20%。他问你怎么办：是按原价找老供应商，还是想办法从其他地方省点钱？',
  'event_003': '项目部的通知栏贴出了新的安全检查通知，监理要求下周一进行全面的安全大检查。如果检查不通过，项目可能要停工整改。',
  // ... 可以添加更多
};

export function getFallbackDescription(eventId: string): string | null {
  return fallbackDescriptions[eventId] || null;
}

/**
 * 获取预设的特殊事件（降级用）
 */
export function getPresetSpecialEvent(): any {
  const presetEvents = [
    {
      id: 'fallback_special_1',
      title: '意外好运',
      description: '你在整理旧文件时，发现了一份之前遗漏的设计图纸，里面有一些可以优化的地方，这可能会节省不少成本。',
      llmEnhanced: false,
      isSpecialEvent: true,
      options: [
        {
          id: 'opt_1',
          text: '立即实施优化',
          effects: { cash: 15, progress: 5, quality: 5 },
          feedback: '优化实施顺利，节省了不少开支！',
        },
        {
          id: 'opt_2',
          text: '先上报领导',
          effects: { reputation: 10, progress: -5 },
          feedback: '领导对你的细心表示赞赏。',
        },
        {
          id: 'opt_3',
          text: '暂不处理',
          effects: {},
          feedback: '保持现状，稳妥为上。',
        },
      ],
    },
    {
      id: 'fallback_special_2',
      title: '突发状况',
      description: '工地突然接到通知，附近居民投诉夜间施工噪音问题。如果继续夜间施工可能会被罚款，但白天施工会影响工期。',
      llmEnhanced: false,
      isSpecialEvent: true,
      options: [
        {
          id: 'opt_1',
          text: '调整施工时间',
          effects: { progress: -10, health: 5 },
          feedback: '虽然工期延误，但身体得到了休息。',
        },
        {
          id: 'opt_2',
          text: '支付罚款继续施工',
          effects: { cash: -15, progress: 10 },
          feedback: '花了钱但保住了工期。',
        },
        {
          id: 'opt_3',
          text: '与居民协商',
          effects: { reputation: 5, progress: -5 },
          feedback: '协商达成了一致，双方都做了让步。',
        },
      ],
    },
  ];

  return presetEvents[Math.floor(Math.random() * presetEvents.length)];
}
