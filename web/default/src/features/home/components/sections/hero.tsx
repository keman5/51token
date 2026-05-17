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
import { Link } from '@tanstack/react-router'
import { ArrowRight, Terminal } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { EXTERNAL_APP_URLS } from '@/lib/external-app-urls'
import { cn } from '@/lib/utils'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

const snippets = {
  mac: `# macOS / Linux 环境设置命令

# 临时设置 (当前终端有效)
export OPENAI_API_BASE="https://api.upit.top/51Token/v1"
export OPENAI_API_KEY="sk-gw-xxxxxxxx"

# 永久设置
echo 'export OPENAI_API_BASE="https://api.upit.top/51Token/v1"' >> ~/.zshrc
echo 'export OPENAI_API_KEY="sk-gw-xxxxxxxx"' >> ~/.zshrc
source ~/.zshrc`,
  windows: `# Windows 环境设置命令 (cmd / powershell)

# 临时设置 (当前控制台有效)
set OPENAI_API_BASE=https://api.upit.top/51Token/v1
set OPENAI_API_KEY=sk-gw-xxxxxxxx

# 永久设置 (修改系统变量)
setx OPENAI_API_BASE "https://api.upit.top/51Token/v1"
setx OPENAI_API_KEY "sk-gw-xxxxxxxx"`,
  python: `import openai

# 只需要修改两行代码，无缝切换至 Gateway
openai.api_base = "https://api.upit.top/51Token/v1"
openai.api_key = "sk-gw-xxxxxxxx"

# 像往常一样发请求，内部自动映射加速
response = openai.ChatCompletion.create(
  model="codex-pro",
  messages=[{"role": "user", "content": "写一个快排算法"}]
)

print(response.choices[0].message.content)`,
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'mac' | 'windows' | 'python'>(
    'mac'
  )

  return (
    <section className='bg-background relative z-10 overflow-hidden pt-28 pb-14 md:pt-40 md:pb-20'>
      <div
        aria-hidden
        className='bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]'
      />

      <div className='container-main relative z-10'>
        <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col items-start text-left'
          >
            <div className='border-border bg-background mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium'>
              <span className='relative flex size-2'>
                <span className='bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
                <span className='bg-success relative inline-flex size-2 rounded-full' />
              </span>
              {t('Codex Pro 资源共享现已就绪')}
            </div>

            <h1 className='font-display mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl'>
              {t('极致高效的')}
              <br />
              <span className='text-gradient-main'>{t('AI 接口分发网关')}</span>
            </h1>

            <p className='text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed'>
              {t(
                '将昂贵的 Codex Pro 账号聚合为统一的接口。两行代码无缝接入，提供安全鉴权、并发控制与详尽的用量统计。释放创造力并且成倍降低研发成本。'
              )}
            </p>

            <div className='flex flex-wrap gap-4'>
              {props.isAuthenticated ? (
                <a href='#pricing' className='btn-primary'>
                  {t('立即获取密钥')}
                  <ArrowRight className='size-4' />
                </a>
              ) : (
                <a href={EXTERNAL_APP_URLS.login} className='btn-primary'>
                  {t('立即获取密钥')}
                  <ArrowRight className='size-4' />
                </a>
              )}
              <Link to='/about' className='btn-secondary'>
                <Terminal className='size-4' />
                {t('阅读文档')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className='relative w-full'
          >
            <div
              aria-hidden
              className='from-primary/10 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr via-transparent to-cyan-500/10 blur-3xl'
            />
            <div className='panel-card bg-background/80 overflow-hidden shadow-2xl backdrop-blur-xl'>
              <div className='bg-muted/30 border-border flex items-center justify-between border-b px-4'>
                <div className='flex gap-2 py-4'>
                  <span className='size-3 rounded-full border border-red-500/50 bg-red-500/20' />
                  <span className='size-3 rounded-full border border-yellow-500/50 bg-yellow-500/20' />
                  <span className='size-3 rounded-full border border-emerald-500/50 bg-emerald-500/20' />
                </div>
                <div className='no-scrollbar flex overflow-x-auto'>
                  {[
                    ['mac', 'macOS/Linux'],
                    ['windows', 'Windows'],
                    ['python', 'integration.py'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() =>
                        setActiveTab(id as 'mac' | 'windows' | 'python')
                      }
                      className={cn(
                        'border-b-2 px-3 py-3 font-mono text-xs whitespace-nowrap transition-colors sm:px-4',
                        activeTab === id
                          ? 'border-primary text-primary'
                          : 'text-muted-foreground hover:text-foreground border-transparent'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className='flex min-h-[18rem] w-full items-center overflow-x-auto p-5 sm:p-6'>
                <pre className='font-mono text-sm leading-relaxed break-all whitespace-pre-wrap'>
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
