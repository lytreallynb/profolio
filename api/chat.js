// api/chat.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    // 设置CORS头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS请求 (预检请求)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: '消息不能为空'
            });
        }

        // 检查API密钥
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'API密钥未配置'
            });
        }

        // 调用OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: context || "你是Yutong Lyu的AI助手。Yutong是密歇根大学数据科学专业的本科生，对机器学习、NLP和数据驱动系统很有热情。他做过Labubu Art Generator和Labubu Explorer Game等项目，还在Labubu Studio实习过。请友好地回答关于他的背景、项目和经历的问题。"
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);

        res.status(500).json({
            success: false,
            error: '服务暂时不可用，请稍后再试'
        });
    }
}