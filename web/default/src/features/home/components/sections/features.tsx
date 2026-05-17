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
import {
  BadgeCheck,
  Braces,
  CreditCard,
  Globe2,
  Network,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      title: t('OpenAI 官方账号与额度'),
      description: t(
        '接入真实 OpenAI 官方账号资源与 Codex Pro 额度，不是套壳模型，也不是自建模型替代品。'
      ),
      icon: BadgeCheck,
    },
    {
      title: t('官方能力稳定透传'),
      description: t(
        '保留 ChatGPT 与 Codex 的原生能力边界，流式输出、工具调用和上下文表现更接近官方体验。'
      ),
      icon: ShieldCheck,
    },
    {
      title: t('解决购买渠道问题'),
      description: t(
        '面向国内团队降低海外账号、订阅、支付与额度维护门槛，把复杂采购流程收敛为一个可用接口。'
      ),
      icon: CreditCard,
    },
    {
      title: t('专业稳定 Codex 通道'),
      description: t(
        '当前聚焦 ChatGPT 与 Codex 场景，不盲目堆渠道，优先保障核心模型的稳定性与可用体验。'
      ),
      icon: Server,
    },
    {
      title: t('完全兼容 OpenAI 协议'),
      description: t(
        '业务代码只需修改 API Base 与 API Key，即可无缝迁移，兼容主流 OpenAI SDK 与开发工具链。'
      ),
      icon: Braces,
    },
    {
      title: t('团队额度统一管理'),
      description: t(
        '不同成员、项目或客户可使用独立 Key，额度、过期时间、权限范围和使用记录都能分开管理。'
      ),
      icon: Users,
    },
    {
      title: t('高可用账号池调度'),
      description: t(
        '系统持续监控账号状态、频率限制与失败请求，自动切换可用资源，减少单账号不可用带来的中断。'
      ),
      icon: Network,
    },
    {
      title: t('国内网络友好'),
      description: t(
        '面向本地开发、服务器部署和 CI/CD 流水线提供一致入口，减少网络环境差异带来的连接失败与排查成本。'
      ),
      icon: Globe2,
    },
  ]

  return (
    <section className='bg-background relative overflow-hidden py-24'>
      <div
        aria-hidden
        className='bg-primary/5 pointer-events-none absolute top-0 right-0 size-[36rem] translate-x-1/3 -translate-y-1/3 rounded-full blur-3xl'
      />

      <div className='container-main relative z-10'>
        <div className='mb-16 text-center'>
          <h2 className='text-foreground font-display mb-4 text-3xl font-bold tracking-tight md:text-4xl'>
            {t('高可用 AI 服务的核心基础设施')}
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            {t(
              '不止解决接口转发，更解决国内团队获取官方 AI 额度、稳定使用、权限隔离与成本核算的一整套问题。'
            )}
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className='panel-card border-border group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
            >
              <div className='border-border bg-background group-hover:border-primary/50 mb-6 flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-inner transition-all duration-300 group-hover:shadow-[0_0_15px_color-mix(in_oklch,var(--primary)_20%,transparent)]'>
                <feature.icon className='text-muted-foreground group-hover:text-primary size-6 transition-colors' />
              </div>
              <h3 className='text-foreground font-display mb-2 text-lg font-bold'>
                {feature.title}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed font-medium'>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
