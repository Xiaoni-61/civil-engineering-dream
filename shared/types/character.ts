/**
 * 人物创建类型定义
 */

export interface CharacterCreation {
  name: string;
  gender: 'male' | 'female';
  workAbility: number;  // 0-10
  luck: number;          // 0-10
}

export interface CharacterEvaluation {
  minAbility?: number;
  maxAbility?: number;
  minLuck?: number;
  maxLuck?: number;
  title: string;
  description: string;
}

export const RANDOM_NAMES = {
  male: [
    "张伟", "李强", "王磊", "刘洋", "陈杰", "杨帆", "赵鹏", "孙浩",
    "周明", "吴昊", "郑涛", "王涛", "冯磊", "陈晨", "楚云", "魏强",
    "蒋勇", "韩旭", "曹阳", "许杰"
  ],
  female: [
    "李娜", "王芳", "张敏", "刘静", "陈丽", "杨雪", "赵婷", "孙悦",
    "周倩", "吴娟", "郑梅", "王丹", "冯静", "陈晓", "楚琳", "魏婷",
    "蒋欣", "韩雪", "曹颖", "许慧"
  ]
};

export const EVALUATIONS: CharacterEvaluation[] = [
  {
    minAbility: 7,
    title: "技术型人才",
    description: "你的专业能力很强，在职场发展中要发挥技术优势，同时注意风险控制。"
  },
  {
    minLuck: 7,
    title: "幸运儿",
    description: "你的运气很好，经常能遇到贵人相助，但要避免过度依赖运气。"
  },
  {
    minAbility: 4,
    maxAbility: 6,
    title: "平衡发展",
    description: "你的各项属性比较平衡，在职场中可以根据情况灵活调整策略。"
  },
  {
    maxAbility: 3,
    title: "艰难开局",
    description: "你的起点较低，需要付出更多努力才能追赶上来，但成长空间很大。"
  }
];
