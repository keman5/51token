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
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PricingProps {
  isAuthenticated?: boolean
}

export function Pricing(props: PricingProps) {
  const { t } = useTranslation()
  const target = props.isAuthenticated ? '/dashboard' : '/sign-up'
  const plans = [
    {
      name: t('基础开发者'),
      price: '0',
      frequency: t('/ 永久免费'),
      description: t('适用于个人开发者测试与小规模内部系统接入。'),
      features: [
        t('共享 Codex 基础速率'),
        t('基础并发限流'),
        t('标准请求响应速度'),
        t('过去 7 天调用日志'),
        t('免费社区技术支持'),
      ],
      buttonText: props.isAuthenticated ? t('Go to Dashboard') : t('免费开始'),
      highlighted: false,
    },
    {
      name: t('Pro 资源合租'),
      price: '49',
      frequency: t('/ 月'),
      description: t('独立团队或中小型企业，平摊高昂的 Pro 账号费用。'),
      features: [
        t('独享或少量共享的 Pro 级速率'),
        t('放宽并发限制'),
        t('专属加速通道与高可用路由'),
        t('近 30 天详细调用明细分析'),
        t('自定义子账号限额与分组管理'),
        t('7x24 小时工单优先处理'),
      ],
      buttonText: props.isAuthenticated ? t('Go to Dashboard') : t('立即订阅'),
      highlighted: true,
    },
  ]

  return (
    <section className='bg-background relative py-24'>
      <div className='container-main relative z-10'>
        <div className='mb-16 text-center'>
          <h2 className='text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl'>
            {t('低成本解决算力瓶颈')}
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            {t(
              '无需每个人都订阅昂贵的 Pro 账号。极大降低研发测试与项目演示成本。'
            )}
          </p>
        </div>

        <div className='mx-auto grid max-w-4xl gap-8 md:grid-cols-2'>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={cn(
                'relative flex flex-col rounded-2xl border p-8',
                plan.highlighted
                  ? 'bg-muted border-primary shadow-[0_0_40px_color-mix(in_oklch,var(--primary)_12%,transparent)]'
                  : 'bg-background border-border md:my-4'
              )}
            >
              {plan.highlighted && (
                <div className='bg-primary text-primary-foreground absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-lg'>
                  {t('最受欢迎')}
                </div>
              )}

              <h3 className='text-foreground mb-2 text-xl font-bold'>
                {plan.name}
              </h3>
              <p className='text-muted-foreground mb-6 min-h-10 text-sm'>
                {plan.description}
              </p>

              <div className='mb-8 flex items-end gap-2'>
                <span className='text-muted-foreground text-2xl font-bold'>
                  ￥
                </span>
                <span className='text-foreground text-5xl font-bold tracking-tight'>
                  {plan.price}
                </span>
                <span className='text-muted-foreground mb-1'>
                  {plan.frequency}
                </span>
              </div>

              <ul className='mb-8 flex-1 space-y-4'>
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className='text-foreground/80 flex items-start gap-3 text-sm'
                  >
                    <Check className='text-primary size-5 shrink-0' />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'default' : 'secondary'}
                className='h-11 w-full'
                render={<Link to={target} />}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
