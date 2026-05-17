# 51Token Pricing Reference

This document records the current public pricing reference and the calculation
logic used for the homepage package quotas.

## Cost Baseline

- Current resource pool: Codex Pro 5x
- Current monthly cost: about RMB 830
- Business goal: recover the fixed monthly resource cost while leaving enough
  buffer for server cost, payment fees, support, refunds, high-concurrency peaks,
  and unused/overused capacity variance.

Suggested minimum monthly revenue targets:

| Target gross margin | Minimum monthly revenue |
| --- | ---: |
| 20% | RMB 1,038 |
| 30% | RMB 1,186 |
| 40% | RMB 1,384 |
| 50% | RMB 1,660 |

For a 5x Pro pool, the practical early-stage target is RMB 1,300-1,600/month.
Do not sell unlimited Pro seats. Start with 3 Pro monthly seats and only expand
to 4 after usage is stable.

## Quota Conversion

The project default quota conversion is:

```text
$1 quota = 500,000 Tokens
```

The peer reference table uses:

```text
pay-as-you-go = RMB 0.5 / $1 quota
```

If selling strictly by this pay-as-you-go rate:

```text
RMB price / 0.5 = $ quota
$ quota * 500,000 = Tokens
```

However, public package quotas should not use the full theoretical value when
the upstream cost is a fixed Codex Pro resource pool. A capacity buffer must be
kept so the service does not collapse under 5-hour limits, weekly limits, and
simultaneous heavy users.

## Peer Billing Strategy Reference

The peer screenshot uses a transparent pay-as-you-go settlement model:

| Item | Observed value |
| --- | --- |
| Input unit price | $5 / 1M Tokens |
| Output unit price | $30 / 1M Tokens |
| Cache read cost | Shown separately |
| Service tier | Standard |
| Group ratio | 1.00x |
| Log detail | Input cost, output cost, cache cost, total charge |

This is useful as a product pattern: make the usage log explain why a request
costs what it costs. The current project already supports this in usage log
details: input/output tokens, cache read/write tokens, model ratio, group ratio,
user-exclusive ratio, and final quota deduction are recorded in log `other`
fields and displayed in the frontend detail dialog.

## Margin Strategy With Group Ratios

Do not sell at the same effective rate as the upstream cost. The safest way to
preserve margin without changing every model price is to keep public package
quota stable, then use group ratios to convert public quota into lower effective
upstream usage.

```text
charged quota = base model cost * group ratio
effective upstream quota = public quota / group ratio
gross margin from ratio only = (group ratio - 1) / group ratio
```

Reference margins:

| Group ratio | Gross margin from ratio only |
| ---: | ---: |
| 1.20x | 16.7% |
| 1.25x | 20.0% |
| 1.30x | 23.1% |
| 1.35x | 25.9% |
| 1.45x | 31.0% |
| 1.55x | 35.5% |
| 1.70x | 41.2% |

Recommended starting ratios:

| Segment | Suggested group ratio | Notes |
| --- | ---: | --- |
| Internal/admin testing | 1.00x | Do not mix with paid users |
| Pro monthly shared pool | 1.20x-1.25x | Margin mainly comes from controlled seats, concurrency, and official time windows |
| Plus shared pool | 1.30x-1.35x | Follows official 5-hour and daily limits; still attractive against short-term packages |
| Basic fixed package | 1.40x-1.45x | Higher support cost per RMB, keep more buffer |
| Day/week short-term packages | 1.55x-1.70x | Burst usage is riskier and should pay more effective margin |

Operational rule: public homepage quota is a customer-facing accounting number.
When a paid group ratio is above 1.00x, the user's real upstream-equivalent
usage is lower than the public quota. For example, a `$180 quota` package at
`1.35x` gives about `$133.33` upstream-equivalent usage before cache and model
ratio effects.

## Cache Billing Strategy

The backend already supports cache accounting:

- OpenAI-compatible usage can read `cached_tokens`.
- Claude usage can read cache creation and cache read tokens.
- Model settings include `CacheRatio` and `CreateCacheRatio`.
- Usage logs can display cache read/write tokens and cache-related prices.

Use cache pricing as a margin and fairness tool:

1. Keep cache reads cheaper than normal input so users benefit from repeated
   context.
2. Do not set cache reads to `0` for paid groups unless it is a promotional
   decision; it removes a natural margin buffer.
3. Keep cache creation at or above actual upstream cost, especially for Claude
   style cache write billing.
4. Review real cache hit data before lowering package prices. High cache hit
   rates can improve margin, but low cache hit rates make package quotas burn
   faster than expected.
5. For Codex-style usage, expect long contexts and repeated repository context.
   Cache savings may appear, but do not rely on cache alone to make the Pro pool
   profitable.

Suggested starting cache policy:

| Item | Suggested policy |
| --- | --- |
| Cache read | Keep model defaults, usually 0.1x-0.5x depending on model |
| Cache creation | Keep model defaults, commonly 1.25x for Claude-style writes |
| Public explanation | Show cache tokens in usage logs, not on the homepage |
| Margin control | Use group ratio first, cache ratio second |

## Homepage Package Quotas

Current homepage packages use the following conservative quotas:

The homepage currently displays `$ quota` instead of Tokens. Token values are
kept here as internal references.

| Package | Price | Public display | Internal Token reference | Limit model |
| --- | ---: | ---: | ---: | --- |
| Basic Developer | RMB 80 / package | $112 quota | 56,000,000 Tokens | Fixed quota, no time limit, expires when used up |
| Plus Shared Pool | RMB 120 / package | about $180 reference quota | about 90,000,000 Tokens | Subject to official 5-hour and daily limits |
| Pro Shared Pool | RMB 400 / month | about $600 reference quota | about 300,000,000 Tokens | Subject to official 5-hour and weekly limits |

The Plus and Pro packages are intentionally shown as reference quotas rather
than hard fixed token quotas, because the real constraint is the official account
window capacity, not only token accounting. Plus follows the official 5-hour and
daily limits; Pro follows the official 5-hour and weekly limits.

## Short-Term Packages

Short-term packages use the lower end of the recommended quota range. They are
intended for trials, urgent temporary use, and low-priority burst demand.

| Package | Price | Validity | Public display | Internal Token reference |
| --- | ---: | ---: | ---: | ---: |
| 1-day small | RMB 5 | 1 day | $16 quota | 8,000,000 Tokens |
| 1-day medium | RMB 15 | 1 day | $50 quota | 25,000,000 Tokens |
| 1-day large | RMB 30 | 1 day | $120 quota | 60,000,000 Tokens |
| 1-week small | RMB 35 | 7 days | $100 quota | 50,000,000 Tokens |
| 1-week medium | RMB 84 | 7 days | $300 quota | 150,000,000 Tokens |
| 1-week large | RMB 168 | 7 days | $700 quota | 350,000,000 Tokens |

Operational rules for short-term packages:

- Lower priority than Pro monthly seats.
- Keep concurrency limits lower than long-term plans.
- Preserve room for queueing or throttling at peak times.
- Avoid increasing short-term quotas unless actual utilization data shows users
  consistently leave enough unused capacity.

## Pricing Adjustment Rules

Use these rules when changing package pricing or quotas:

1. Keep at least 25%-35% pool capacity buffer.
2. Do not calculate Pro purely from `price / 0.5 * 500,000`; official time
   windows and weekly limits are the real bottleneck.
3. Fixed token packages can be stricter because they end when quota is used up.
4. Short-term packages can be used for acquisition, but they must be lower
   priority and should not cannibalize Pro monthly seats.
5. Revisit package quota after there is enough real usage data: peak-hour usage,
   average utilization, refund rate, and support cost.
