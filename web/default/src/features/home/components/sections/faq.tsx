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
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(0)
  const faqs = [
    {
      question: t('它和官方 API 有什么区别？'),
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
    <section className='bg-background border-border/60 border-t py-24'>
      <div className='container-main'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl'>
            {t('常见问题')}
          </h2>
          <p className='text-muted-foreground text-lg'>
            {t('围绕接入、权限、计费和运维体验的核心问题。')}
          </p>
        </div>

        <div className='divide-border border-border bg-card mx-auto max-w-3xl divide-y rounded-2xl border'>
          {faqs.map((faq, index) => {
            const open = openIndex === index
            return (
              <div key={faq.question}>
                <button
                  type='button'
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className='flex w-full items-center justify-between gap-4 px-6 py-5 text-left'
                >
                  <span className='text-foreground font-semibold'>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground size-5 shrink-0 transition-transform',
                      open && 'rotate-180'
                    )}
                  />
                </button>
                {open && (
                  <div className='text-muted-foreground px-6 pb-5 text-sm leading-relaxed'>
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
