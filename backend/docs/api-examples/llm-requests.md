# LLM API 请求示例

本文档展示如何使用豆包 API 进行 LLM 调用。

## 豆包 API 基础请求

```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
     "model": "doubao-seed-1-6-lite-251015",
     "max_completion_tokens": 65535,
     "messages": [
        {
            "role": "user",
            "content": "你好，请介绍一下你自己"
        }
     ],
     "reasoning_effort": "medium"
  }'
```

## 带图片的请求（多模态）

```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
     "model": "doubao-seed-1-6-lite-251015",
     "max_completion_tokens": 65535,
     "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                },
                {
                    "type": "text",
                    "text": "图片主要讲了什么?"
                }
            ]
        }
     ],
     "reasoning_effort": "medium"
  }'
```

## 项目中的使用

在项目中，LLM 调用已经封装在 `backend/src/services/llmService.ts` 中。

**重要提示**：
- 请勿将 API 密钥提交到代码仓库
- 请在 `.env` 文件中设置 `LLM_API_KEY`
- `.env` 文件已在 `.gitignore` 中，不会被提交

## 获取 API 密钥

- 豆包: https://ark.cn-beijing.volces.com/
- DeepSeek: https://platform.deepseek.com/api_keys
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
