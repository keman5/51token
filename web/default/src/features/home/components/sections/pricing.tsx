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
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { EXTERNAL_APP_URLS } from '@/lib/external-app-urls'
import { cn } from '@/lib/utils'

interface PricingProps {
  isAuthenticated?: boolean
}

export function Pricing(props: PricingProps) {
  const { t } = useTranslation()
  const target = props.isAuthenticated
    ? EXTERNAL_APP_URLS.console
    : EXTERNAL_APP_URLS.register
  const plans = [
    {
      name: t('基础开发者'),
      price: '80',
      frequency: t('/ 个'),
      description: t('适用于个人开发者测试与小规模内部系统接入。'),
      features: [
        t('$500 固定额度'),
        t('不限使用时间，用完即止'),
        t('共享 Codex 基础速率'),
        t('基础并发限流 (3次/秒)'),
        t('标准请求响应速度'),
        t('过去 7 天调用日志'),
        t('免费社区技术支持'),
      ],
      buttonText: props.isAuthenticated ? t('Go to Dashboard') : t('立即订阅'),
      highlighted: false,
    },
    {
      name: t('Plus 资源合租'),
      price: '120',
      frequency: t('/ 个'),
      description: t('独立团队或中小型企业，平摊高昂的 Plus 账号费用。'),
      features: [
        t('$850 固定额度'),
        t('不限使用时间，用完即止'),
        t('独享或少量共享的 Plus 级速率'),
        t('放宽并发限制 (20次/秒)'),
        t('专属加速通道与高可用路由'),
        t('近 30 天详细调用明细分析'),
        t('自定义子账号限额与分组管理'),
        t('7x24 小时随时支持'),
      ],
      buttonText: props.isAuthenticated ? t('Go to Dashboard') : t('立即订阅'),
      highlighted: true,
    },
    {
      name: t('Pro 资源合租'),
      price: '400',
      frequency: t('/ 个'),
      description: t('为高端业务场景定制，提供无缝的 Pro 层级极致体验。'),
      features: [
        t('$2500 固定额度'),
        t('按官方 5 小时限额与周限额同步使用'),
        t('独享或高级优化的 Pro 级速率'),
        t('极致并发与极低延迟节点'),
        t('专用 API 域名与独立网关'),
        t('无限制的全局数据分析与导出'),
        t('企业级子账号及权限分配'),
        t('7x24 小时专属工单响应'),
      ],
      buttonText: props.isAuthenticated ? t('Go to Dashboard') : t('立即订阅'),
      highlighted: false,
    },
  ]
  const shortTermPlans = [
    {
      name: t('1日小包'),
      price: '5',
      tokens: t('$33 额度'),
      equivalent: t('适合轻量测试与临时验证'),
    },
    {
      name: t('1日中包'),
      price: '15',
      tokens: t('$100 额度'),
      equivalent: t('适合一天内集中开发调试'),
    },
    {
      name: t('1日大包'),
      price: '30',
      tokens: t('$200 额度'),
      equivalent: t('适合短期演示与高频测试'),
    },
    {
      name: t('1周小包'),
      price: '35',
      tokens: t('$233 额度'),
      equivalent: t('适合一周内低频稳定使用'),
    },
    {
      name: t('1周中包'),
      price: '84',
      tokens: t('$560 额度'),
      equivalent: t('适合小团队阶段性开发'),
    },
    {
      name: t('1周大包'),
      price: '168',
      tokens: t('$1120 额度'),
      equivalent: t('适合高频开发与项目冲刺'),
    },
  ]

  return (
    <section
      id='pricing'
      className='bg-background border-border/60 relative scroll-mt-20 border-t py-16 md:py-20'
    >
      <div className='container-main relative z-10'>
        <div className='mb-16 text-center'>
          <h2 className='text-foreground font-display mb-4 text-3xl font-bold tracking-tight md:text-4xl'>
            {t('低成本解决算力瓶颈')}
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            {t(
              '无需每个人都订阅昂贵的 Pro 账号。极大降低研发测试与项目演示成本。'
            )}
          </p>
        </div>

        <div className='mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={cn(
                'relative flex flex-col rounded-3xl border p-8',
                plan.highlighted
                  ? 'bg-muted border-primary shadow-[0_0_40px_color-mix(in_oklch,var(--primary)_15%,transparent)]'
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
                <span className='text-foreground font-display text-5xl font-bold tracking-tight'>
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

              <a
                href={target}
                className={cn(
                  'flex w-full items-center justify-center rounded-xl px-6 py-3 font-medium transition-colors',
                  plan.highlighted
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 shadow-lg'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                )}
              >
                {plan.buttonText}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className='border-border mt-16 border-t pt-12'
        >
          <div className='mb-10 text-center'>
            <h3 className='text-foreground font-display text-2xl font-bold tracking-tight'>
              {t('灵活的短期用量包')}
            </h3>
            <p className='text-muted-foreground mt-2'>
              {t('专为短期应急或小规模测试提供，即买即用，不绑定长期订阅。')}
            </p>
          </div>

          <div className='mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
            {shortTermPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className='panel-card border-border group hover:border-primary/50 flex min-h-64 flex-col items-center justify-center p-6 text-center transition-colors'
              >
                <span className='text-muted-foreground group-hover:text-foreground text-sm font-medium transition-colors'>
                  {plan.name}
                </span>
                <div className='mt-3 mb-2 flex items-baseline gap-1'>
                  <span className='text-muted-foreground text-sm'>￥</span>
                  <span className='text-foreground font-display text-3xl font-bold'>
                    {plan.price}
                  </span>
                </div>
                <div className='mb-4 text-xs'>
                  <div className='text-primary mb-1 font-semibold'>
                    {plan.tokens}
                  </div>
                  <div className='text-muted-foreground leading-relaxed'>
                    {plan.equivalent}
                  </div>
                </div>
                <a
                  href={target}
                  className='bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground mt-auto flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                >
                  {t('快速购买')}
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
