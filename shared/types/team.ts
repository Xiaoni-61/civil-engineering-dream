/**
 * 团队系统类型定义
 */

export enum TeamMemberType {
  ENGINEER = 'engineer',      // 工程师：提升项目质量
  SALESPERSON = 'salesperson', // 业务员：增加项目收益
  WORKER = 'worker',           // 劳务工：降低项目成本
  DESIGNER = 'designer',       // 设计师：提升项目效率
}

export interface TeamMember {
  id: string;
  type: TeamMemberType;
  name: string;
  skill: number;        // 技能等级 1-5
  salary: number;       // 季度工资
  morale: number;       // 士气 0-100
  efficiency: number;   // 效率 50-150%
}

export interface TeamIssue {
  id: string;
  type: 'conflict' | 'burnout' | 'mistake' | 'demand';
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedMember?: string;
  requiredLeadership: number;
  resolveReward: {
    leadership?: number;
    efficiency?: number;
    morale?: number;
  };
}

export interface TeamState {
  members: TeamMember[];
  leadership: number;
  teamEfficiency: number;
  pendingIssues: TeamIssue[];
}
