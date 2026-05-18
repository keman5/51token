package service

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/bytedance/gopkg/util/gopool"
)

const (
	tokenQuotaWindowResetTickInterval = 1 * time.Minute
	tokenQuotaWindowResetBatchSize    = 300
)

var (
	tokenQuotaWindowResetOnce    sync.Once
	tokenQuotaWindowResetRunning atomic.Bool
)

func StartTokenQuotaWindowResetTask() {
	tokenQuotaWindowResetOnce.Do(func() {
		if !common.IsMasterNode {
			return
		}
		gopool.Go(func() {
			logger.LogInfo(context.Background(), fmt.Sprintf("token quota window reset task started: tick=%s", tokenQuotaWindowResetTickInterval))
			ticker := time.NewTicker(tokenQuotaWindowResetTickInterval)
			defer ticker.Stop()

			runTokenQuotaWindowResetOnce()
			for range ticker.C {
				runTokenQuotaWindowResetOnce()
			}
		})
	})
}

func runTokenQuotaWindowResetOnce() {
	if !tokenQuotaWindowResetRunning.CompareAndSwap(false, true) {
		return
	}
	defer tokenQuotaWindowResetRunning.Store(false)

	ctx := context.Background()
	totalReset := 0
	for {
		n, err := model.ResetDueTokenQuotaWindows(tokenQuotaWindowResetBatchSize)
		if err != nil {
			logger.LogWarn(ctx, fmt.Sprintf("token quota window reset task failed: %v", err))
			return
		}
		if n == 0 {
			break
		}
		totalReset += n
		if n < tokenQuotaWindowResetBatchSize {
			break
		}
	}
	if common.DebugEnabled && totalReset > 0 {
		logger.LogDebug(ctx, "token quota window maintenance: reset_count=%d", totalReset)
	}
}
