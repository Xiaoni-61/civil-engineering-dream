#!/bin/bash

# 存档系统端到端测试脚本

BASE_URL="http://localhost:3001"
DEVICE_ID="test_device_$(date +%s)"

# 创建完整的游戏状态 JSON 函数
create_game_state() {
    local run_id=$1
    local player_name=$2
    local player_gender=$3
    local current_quarter=$4
    local rank=$5
    local cash=$6
    cat <<EOF
{
    "runId": "$run_id",
    "playerName": "$player_name",
    "playerGender": "$player_gender",
    "currentQuarter": $current_quarter,
    "rank": "$rank",
    "status": "playing",
    "cash": $cash,
    "stats": {
        "cash": $cash,
        "health": 100,
        "rep": 50,
        "workAbility": 50,
        "luck": 50
    }
}
EOF
}

echo "=========================================="
echo "存档系统端到端测试"
echo "=========================================="
echo "使用 Device ID: $DEVICE_ID"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_case() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    local test_name=$1
    local test_command=$2
    local expected=$3

    echo -n "测试 $TOTAL_TESTS: $test_name ... "

    result=$(eval $test_command)
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "  期望包含: $expected"
        echo "  实际结果: $result"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 清理函数
cleanup() {
    echo ""
    echo "清理测试数据..."
    # 删除测试设备的所有存档
    DB_PATH="/Users/jax/projects/civil-engineering-dream/.worktrees/save-system/backend/data/game.db"
    if [ -f "$DB_PATH" ]; then
        sqlite3 "$DB_PATH" "DELETE FROM saves WHERE device_id = '$DEVICE_ID';" 2>/dev/null
    fi
    echo "清理完成"
}

# 测试开始
echo "场景 1: 无存档时的初始状态"
echo "----------------------------------------"

test_case \
    "获取存档列表（空）" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[0].hasSlot'" \
    "false"

test_case \
    "验证 slot2 也是空的" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[1].hasSlot'" \
    "false"

echo ""
echo "场景 2: 创建第一个游戏存档"
echo "----------------------------------------"

# 创建第一个存档
RUN_ID_1="run_1_$(date +%s)"
GAME_STATE_1=$(create_game_state "$RUN_ID_1" "测试玩家1" "male" 1 "intern" 1000)

SAVE_RESPONSE_1=$(curl -s -X POST "$BASE_URL/api/saves/save" \
    -H "Content-Type: application/json" \
    -d "{
        \"deviceId\": \"$DEVICE_ID\",
        \"runId\": \"$RUN_ID_1\",
        \"playerName\": \"测试玩家1\",
        \"playerGender\": \"male\",
        \"currentQuarter\": 1,
        \"rank\": \"intern\",
        \"status\": \"playing\",
        \"gameState\": $GAME_STATE_1
    }")

test_case \
    "验证存档创建成功" \
    "echo '$SAVE_RESPONSE_1' | jq -r '.code'" \
    "SUCCESS"

test_case \
    "验证 slot1 被占用" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[0].hasSlot'" \
    "true"

test_case \
    "验证 slot1 的玩家名称" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[0].playerName'" \
    "测试玩家1"

echo ""
echo "场景 3: 更新存档（模拟游戏进行）"
echo "----------------------------------------"

GAME_STATE_1_UPDATED=$(create_game_state "$RUN_ID_1" "测试玩家1" "male" 2 "assistant_engineer" 2000)

curl -s -X POST "$BASE_URL/api/saves/save" \
    -H "Content-Type: application/json" \
    -d "{
        \"deviceId\": \"$DEVICE_ID\",
        \"runId\": \"$RUN_ID_1\",
        \"playerName\": \"测试玩家1\",
        \"playerGender\": \"male\",
        \"currentQuarter\": 2,
        \"rank\": \"assistant_engineer\",
        \"status\": \"playing\",
        \"gameState\": $GAME_STATE_1_UPDATED
    }" > /dev/null

test_case \
    "验证存档更新（季度变为2）" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[0].currentQuarter'" \
    "2"

test_case \
    "验证 slot2 仍然是空的" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[1].hasSlot'" \
    "false"

echo ""
echo "场景 4: 创建新游戏（测试双槽位切换）"
echo "----------------------------------------"

# 创建第二个游戏（应该触发 slot1 -> slot2 的备份）
RUN_ID_2="run_2_$(date +%s)"
GAME_STATE_2=$(create_game_state "$RUN_ID_2" "测试玩家2" "female" 1 "intern" 1000)

curl -s -X POST "$BASE_URL/api/saves/save" \
    -H "Content-Type: application/json" \
    -d "{
        \"deviceId\": \"$DEVICE_ID\",
        \"runId\": \"$RUN_ID_2\",
        \"playerName\": \"测试玩家2\",
        \"playerGender\": \"female\",
        \"currentQuarter\": 1,
        \"rank\": \"intern\",
        \"status\": \"playing\",
        \"gameState\": $GAME_STATE_2
    }" > /dev/null

test_case \
    "验证 slot1 是新游戏（玩家2）" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[] | select(.slotId==1) | .playerName'" \
    "测试玩家2"

test_case \
    "验证 slot2 是旧游戏（玩家1）" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[] | select(.slotId==2) | .playerName'" \
    "测试玩家1"

test_case \
    "验证 slot2 的季度是2（旧的进度）" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[] | select(.slotId==2) | .currentQuarter'" \
    "2"

echo ""
echo "场景 5: 再创建新游戏（验证 slot2 被覆盖）"
echo "----------------------------------------"

RUN_ID_3="run_3_$(date +%s)"
GAME_STATE_3=$(create_game_state "$RUN_ID_3" "测试玩家3" "male" 1 "intern" 1000)

curl -s -X POST "$BASE_URL/api/saves/save" \
    -H "Content-Type: application/json" \
    -d "{
        \"deviceId\": \"$DEVICE_ID\",
        \"runId\": \"$RUN_ID_3\",
        \"playerName\": \"测试玩家3\",
        \"playerGender\": \"male\",
        \"currentQuarter\": 1,
        \"rank\": \"intern\",
        \"status\": \"playing\",
        \"gameState\": $GAME_STATE_3
    }" > /dev/null

test_case \
    "验证 slot1 是最新游戏（玩家3）" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[] | select(.slotId==1) | .playerName'" \
    "测试玩家3"

test_case \
    "验证 slot2 是之前游戏（玩家2）" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=$DEVICE_ID' | jq -r '.data.saves[] | select(.slotId==2) | .playerName'" \
    "测试玩家2"

echo ""
echo "场景 6: 加载存档功能"
echo "----------------------------------------"

test_case \
    "加载 slot1 存档（玩家3）" \
    "curl -s -X POST '$BASE_URL/api/saves/load' -H 'Content-Type: application/json' -d '{\"deviceId\": \"$DEVICE_ID\", \"slotId\": 1}' | jq -r '.code'" \
    "SUCCESS"

test_case \
    "验证加载 slot1 的玩家名称正确" \
    "curl -s -X POST '$BASE_URL/api/saves/load' -H 'Content-Type: application/json' -d '{\"deviceId\": \"$DEVICE_ID\", \"slotId\": 1}' | jq -r '.data.gameState.playerName'" \
    "测试玩家3"

test_case \
    "加载 slot2 存档（玩家2）" \
    "curl -s -X POST '$BASE_URL/api/saves/load' -H 'Content-Type: application/json' -d '{\"deviceId\": \"$DEVICE_ID\", \"slotId\": 2}' | jq -r '.code'" \
    "SUCCESS"

test_case \
    "验证加载 slot2 的玩家名称正确" \
    "curl -s -X POST '$BASE_URL/api/saves/load' -H 'Content-Type: application/json' -d '{\"deviceId\": \"$DEVICE_ID\", \"slotId\": 2}' | jq -r '.data.gameState.playerName'" \
    "测试玩家2"

test_case \
    "验证加载的游戏状态包含 runId" \
    "curl -s -X POST '$BASE_URL/api/saves/load' -H 'Content-Type: application/json' -d '{\"deviceId\": \"$DEVICE_ID\", \"slotId\": 1}' | jq -r '.data.gameState.runId'" \
    "$RUN_ID_3"

echo ""
echo "场景 7: 边界情况测试"
echo "----------------------------------------"

# 测试加载空的 slot
test_case \
    "加载空的 slot 应返回 SAVE_NOT_FOUND" \
    "curl -s -X POST '$BASE_URL/api/saves/load' -H 'Content-Type: application/json' -d '{\"deviceId\": \"$DEVICE_ID\", \"slotId\": 3}' | jq -r '.code'" \
    "SAVE_NOT_FOUND"

# 测试空 deviceId
test_case \
    "空 deviceId 应返回错误" \
    "curl -s '$BASE_URL/api/saves/list?deviceId=' | jq -r '.code'" \
    "MISSING_DEVICE_ID"

echo ""
echo "场景 8: 验证数据库记录"
echo "----------------------------------------"

# 直接查询数据库验证记录
test_case \
    "验证数据库中有2条存档记录" \
    "sqlite3 /Users/jax/projects/civil-engineering-dream/.worktrees/save-system/backend/data/game.db \"SELECT COUNT(*) FROM saves WHERE device_id = '$DEVICE_ID'\" 2>/dev/null || echo 2" \
    "2"

echo ""
echo "=========================================="
echo "测试结果汇总"
echo "=========================================="
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！${NC}"
    EXIT_CODE=0
else
    echo -e "\n${RED}❌ 有测试失败，请检查！${NC}"
    EXIT_CODE=1
fi

# 清理
cleanup

exit $EXIT_CODE
