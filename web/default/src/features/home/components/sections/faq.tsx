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
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(0)
  const faqs = [
    {
      question: t('我们和官方 API 有什么区别？'),
      answer: t(
        '业务侧仍按兼容协议调用，只是请求先进入你的统一网关，再由网关根据渠道、额度、负载和权限转发到真实上游。'
      ),
    },
    {
      question: t('迁移现有项目需要多久？'),
      answer: t(
        '通常只需要替换 API Base 与 API Key。模型名、流式响应、函数调用等能力会按照系统配置继续转发。'
      ),
    },
    {
      question: t('能否限制团队成员的用量？'),
      answer: t(
        '可以。你可以通过用户、令牌、分组、模型权限、额度和过期时间进行细粒度控制，并在日志中审计调用情况。'
      ),
    },
    {
      question: t('后台页面也会跟随新主题吗？'),
      answer: t(
        '会。此次迁移将黑白主题写入全局语义变量，导航、侧边栏、表格、弹窗和设置页都会使用同一套颜色基础。'
      ),
    },
  ]

  return (
    <section className='bg-background border-border-light relative border-t py-24'>
      <div className='container-main relative z-10'>
        <div className='mb-16 text-center'>
          <h2 className='text-foreground font-display mb-4 text-3xl font-bold tracking-tight md:text-4xl'>
            {t('常见问题')}
          </h2>
          <p className='text-muted-foreground text-lg'>
            {t('围绕接入、权限、计费和运维体验的核心问题。')}
          </p>
        </div>

        <div className='space-y-4'>
          {faqs.map((faq, index) => {
            const open = openIndex === index
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className='panel-card border-border bg-background/50'
              >
                <button
                  type='button'
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className='flex w-full items-center justify-between p-6 text-left focus:outline-none'
                >
                  <span className='text-foreground text-lg font-medium'>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground size-5 shrink-0 transition-transform duration-300',
                      open && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className='text-muted-foreground px-6 pb-6 leading-relaxed'>
                    {faq.answer}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
