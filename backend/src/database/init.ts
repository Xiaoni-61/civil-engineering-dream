import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'game.db');

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📁 创建数据目录: ${DATA_DIR}`);
}

export interface Database {
  run: (sql: string, params?: any[]) => Promise<{ lastID?: number; changes?: number }>;
  get: <T = any>(sql: string, params?: any[]) => Promise<T | undefined>;
  all: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  close: () => Promise<void>;
}

/**
 * 初始化 SQLite 数据库
 */
export async function initDatabase(): Promise<Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // 创建表结构
      db.serialize(() => {
        // 游戏会话表
        db.run(`
          CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            deviceId TEXT NOT NULL,
            score INTEGER NOT NULL,
            payload TEXT NOT NULL,
            signature TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 排行榜表
        db.run(`
          CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deviceId TEXT UNIQUE NOT NULL,
            playerName TEXT NOT NULL DEFAULT '匿名玩家',
            bestScore INTEGER NOT NULL DEFAULT 0,
            totalGames INTEGER NOT NULL DEFAULT 0,
            totalCash INTEGER NOT NULL DEFAULT 0,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 为已存在的表添加 playerName 字段（如果不存在）
        db.run(`
          ALTER TABLE leaderboard ADD COLUMN playerName TEXT DEFAULT '匿名玩家'
        `, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('ℹ️ playerName 字段已存在或其他情况:', err.message);
          }
        });

        // 游戏统计表（单局游戏排行榜数据源）
        db.run(`
          CREATE TABLE IF NOT EXISTS game_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            runId TEXT UNIQUE NOT NULL,
            deviceId TEXT NOT NULL,
            playerName TEXT NOT NULL DEFAULT '匿名玩家',
            score INTEGER NOT NULL,
            finalCash INTEGER NOT NULL,
            finalHealth INTEGER NOT NULL,
            finalReputation INTEGER NOT NULL,
            finalProgress INTEGER NOT NULL,
            finalQuality INTEGER NOT NULL,
            roundsPlayed INTEGER NOT NULL,
            endReason TEXT,
            finalRank TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 为已存在的表添加新字段（如果不存在）
        db.run(`ALTER TABLE game_stats ADD COLUMN runId TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('ℹ️ runId 字段添加:', err.message);
          }
        });
        db.run(`ALTER TABLE game_stats ADD COLUMN playerName TEXT DEFAULT '匿名玩家'`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('ℹ️ playerName 字段添加:', err.message);
          }
        });
        db.run(`ALTER TABLE game_stats ADD COLUMN endReason TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('ℹ️ endReason 字段添加:', err.message);
          }
        });
        db.run(`ALTER TABLE game_stats ADD COLUMN finalRank TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('ℹ️ finalRank 字段添加:', err.message);
          }
        });

        // 动态事件表
        db.run(`
          CREATE TABLE IF NOT EXISTS dynamic_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT UNIQUE NOT NULL,
            source_type TEXT NOT NULL,
            source_url TEXT,
            news_title TEXT,
            news_date TEXT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            options TEXT NOT NULL,
            min_rank TEXT NOT NULL,
            max_rank TEXT NOT NULL,
            base_weight REAL DEFAULT 1.0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_used_at TEXT,
            usage_count INTEGER DEFAULT 0,
            is_validated BOOLEAN DEFAULT 0,
            quality_score REAL DEFAULT 0.5
          )
        `);

        // 职业传记缓存表
        db.run(`
          CREATE TABLE IF NOT EXISTS career_biographies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id TEXT UNIQUE NOT NULL,
            player_name TEXT NOT NULL,
            content TEXT NOT NULL,
            game_data TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            shared_count INTEGER DEFAULT 0
          )
        `);

        // 事件使用日志表
        db.run(`
          CREATE TABLE IF NOT EXISTS event_usage_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT NOT NULL,
            player_name TEXT,
            player_rank TEXT,
            choice_index INTEGER,
            played_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 为动态事件创建索引
        db.run(`CREATE INDEX IF NOT EXISTS idx_dynamic_events_rank
                ON dynamic_events (min_rank, max_rank)`);

        db.run(`CREATE INDEX IF NOT EXISTS idx_dynamic_events_created
                ON dynamic_events (created_at DESC)`);

        db.run(`CREATE INDEX IF NOT EXISTS idx_dynamic_events_weight
                ON dynamic_events (base_weight DESC)`);

        console.log('✅ 数据库表创建成功');
      });

      // 包装数据库方法为 Promise
      const wrappedDb: Database = {
        run: (sql: string, params?: any[]) =>
          new Promise((resolve, reject) => {
            db.run(sql, params || [], function (err) {
              if (err) reject(err);
              else resolve({ lastID: this.lastID, changes: this.changes });
            });
          }),

        get: <T = any>(sql: string, params?: any[]) =>
          new Promise<T | undefined>((resolve, reject) => {
            db.get(sql, params || [], (err, row) => {
              if (err) reject(err);
              else resolve(row as T | undefined);
            });
          }),

        all: <T = any>(sql: string, params?: any[]) =>
          new Promise<T[]>((resolve, reject) => {
            db.all(sql, params || [], (err, rows) => {
              if (err) reject(err);
              else resolve((rows || []) as T[]);
            });
          }),

        close: () =>
          new Promise((resolve, reject) => {
            db.close((err) => {
              if (err) reject(err);
              else resolve();
            });
          }),
      };

      resolve(wrappedDb);
    });
  });
}
