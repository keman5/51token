/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'python', label: 'Python' },
  { id: 'nodejs', label: 'Node.js' },
  { id: 'curl', label: 'cURL' },
  { id: 'langchain', label: 'LangChain' },
] as const

const snippets = {
  python: `import openai

openai.api_base = "https://51token.upit.top/51token/v1"
openai.api_key = "sk-gw-xxxxxxxxxxxxxxxx"

response = openai.ChatCompletion.create(
    model="codex-pro",
    messages=[
        {"role": "user", "content": "How to optimize React performance?"}
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`,
  nodejs: `import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "sk-gw-xxxxxxxxxxxxxxxx",
  basePath: "https://51token.upit.top/51token/v1",
});

const openai = new OpenAIApi(configuration);

const completion = await openai.createChatCompletion({
  model: "codex-pro",
  messages: [{ role: "user", content: "Optimize this algorithm..." }],
});`,
  curl: `curl https://51token.upit.top/51token/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-gw-xxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "codex-pro",
    "messages": [{"role": "user", "content": "Hello World!"}]
  }'`,
  langchain: `from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

chat = ChatOpenAI(
    openai_api_base="https://51token.upit.top/51token/v1",
    openai_api_key="sk-gw-xxxxxxxxxxxxxxxx",
    model_name="codex-pro"
)

response = chat([HumanMessage(content="Explain quantum computing.")])`,
}

export function Integrations() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]['id']>('python')

  const bullets = [
    t('完美兼容所有围绕 OpenAI 封装的开源库'),
    t('支持原生 Stream 流式输出，视觉无感知延迟'),
    t('支持 Function Calling 等高级模型特性转发'),
  ]

  return (
    <section className='bg-background border-border/60 relative overflow-hidden border-t py-24'>
      <div className='container-main relative z-10'>
        <div className='grid items-center gap-14 lg:grid-cols-2'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className='text-foreground mb-6 text-3xl font-bold tracking-tight md:text-4xl'>
              {t('两行代码')}
              <br />
              {t('完成底层架构平替')}
            </h2>
            <p className='text-muted-foreground mb-8 text-lg leading-relaxed'>
              {t(
                '网关 100% 遵守开源生态的事实标准。无论你使用官方 SDK、LangChain、LlamaIndex 还是其他生态工具，只需替换 API 地址和密钥，瞬间接入。'
              )}
            </p>

            <ul className='space-y-4'>
              {bullets.map((item) => (
                <li key={item} className='flex items-center gap-3'>
                  <span className='border-success/20 bg-success/10 text-success flex size-6 shrink-0 items-center justify-center rounded-full border'>
                    <Check className='size-3.5' />
                  </span>
                  <span className='text-foreground/90'>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className='panel-card bg-background/70 overflow-hidden shadow-2xl backdrop-blur-md'>
              <div className='bg-muted/30 border-border no-scrollbar flex overflow-x-auto border-b px-4'>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground border-transparent'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className='w-full overflow-x-auto p-6'>
                <pre className='font-mono text-sm leading-relaxed whitespace-pre-wrap'>
                  <code className='text-foreground/90'>
                    {snippets[activeTab]}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
