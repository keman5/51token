package model

import (
	"strings"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func seedWindowLimitedToken(t *testing.T, token *Token) {
	t.Helper()
	if token.Id == 0 {
		token.Id = 9001
	}
	if token.UserId == 0 {
		token.UserId = 9001
	}
	if token.Key == "" {
		token.Key = "window-limited-token"
	}
	if token.Name == "" {
		token.Name = "window limited token"
	}
	token.Status = common.TokenStatusEnabled
	require.NoError(t, DB.Create(token).Error)
}

func TestDecreaseTokenQuotaEnforcesFiveHourLimit(t *testing.T) {
	truncateTables(t)
	seedWindowLimitedToken(t, &Token{
		RemainQuota:    1000,
		Quota5hLimit:   100,
		WeeklyLimit:    500,
		UnlimitedQuota: true,
	})

	require.NoError(t, DecreaseTokenQuota(9001, "window-limited-token", 60))
	err := DecreaseTokenQuota(9001, "window-limited-token", 50)

	require.Error(t, err)
	assert.True(t, strings.Contains(err.Error(), "5小时"), err.Error())

	var token Token
	require.NoError(t, DB.First(&token, 9001).Error)
	assert.Equal(t, 60, token.Quota5hUsed)
	assert.Equal(t, 60, token.WeeklyUsed)
	assert.Equal(t, 940, token.RemainQuota)
}

func TestIncreaseTokenQuotaRefundsWindowUsage(t *testing.T) {
	truncateTables(t)
	seedWindowLimitedToken(t, &Token{
		RemainQuota:    1000,
		Quota5hLimit:   100,
		WeeklyLimit:    500,
		UnlimitedQuota: true,
	})

	require.NoError(t, DecreaseTokenQuota(9001, "window-limited-token", 60))
	require.NoError(t, IncreaseTokenQuota(9001, "window-limited-token", 20))

	var token Token
	require.NoError(t, DB.First(&token, 9001).Error)
	assert.Equal(t, 40, token.Quota5hUsed)
	assert.Equal(t, 40, token.WeeklyUsed)
	assert.Equal(t, 960, token.RemainQuota)
}

func TestDecreaseTokenQuotaResetsExpiredFiveHourWindow(t *testing.T) {
	truncateTables(t)
	now := GetDBTimestamp()
	seedWindowLimitedToken(t, &Token{
		RemainQuota:        1000,
		Quota5hLimit:       100,
		Quota5hUsed:        100,
		Quota5hWindowStart: now - tokenQuota5hWindowSeconds - 1,
		WeeklyLimit:        500,
		WeeklyUsed:         100,
		WeeklyWindowStart:  currentTokenWeeklyWindowStart(now),
		UnlimitedQuota:     true,
	})

	require.NoError(t, DecreaseTokenQuota(9001, "window-limited-token", 70))

	var token Token
	require.NoError(t, DB.First(&token, 9001).Error)
	assert.Equal(t, 70, token.Quota5hUsed)
	assert.Equal(t, 170, token.WeeklyUsed)
	assert.Equal(t, 930, token.RemainQuota)
}

func TestDecreaseTokenQuotaEnforcesWeeklyLimit(t *testing.T) {
	truncateTables(t)
	now := GetDBTimestamp()
	seedWindowLimitedToken(t, &Token{
		RemainQuota:        1000,
		Quota5hLimit:       500,
		Quota5hUsed:        80,
		Quota5hWindowStart: now,
		WeeklyLimit:        100,
		WeeklyUsed:         80,
		WeeklyWindowStart:  currentTokenWeeklyWindowStart(now),
		UnlimitedQuota:     true,
	})

	err := DecreaseTokenQuota(9001, "window-limited-token", 25)

	require.Error(t, err)
	assert.True(t, strings.Contains(err.Error(), "周"), err.Error())

	var token Token
	require.NoError(t, DB.First(&token, 9001).Error)
	assert.Equal(t, 80, token.Quota5hUsed)
	assert.Equal(t, 80, token.WeeklyUsed)
	assert.Equal(t, 1000, token.RemainQuota)
}

func TestTokenWeeklyWindowStartUsesTokenCreationTime(t *testing.T) {
	location := time.FixedZone("UTC+8", 8*60*60)
	created := time.Date(2026, time.May, 6, 10, 30, 0, 0, location).Unix()

	assert.Equal(t, created, tokenWeeklyWindowStart(created, created+6*24*60*60))
	assert.Equal(t, created+7*24*60*60, tokenWeeklyWindowStart(created, created+8*24*60*60))
	assert.Equal(t, created+14*24*60*60, tokenWeeklyWindowStart(created, created+15*24*60*60))
}

func TestTokenMonthlyExpirationUsesTokenCreationTime(t *testing.T) {
	location := time.FixedZone("UTC+8", 8*60*60)
	created := time.Date(2026, time.January, 31, 9, 0, 0, 0, location).Unix()
	expected := time.Date(2026, time.February, 28, 9, 0, 0, 0, location).Unix()

	assert.Equal(t, expected, TokenMonthlyExpirationFromCreatedTime(created))
}

func TestDecreaseTokenQuotaRejectsExpiredToken(t *testing.T) {
	truncateTables(t)
	now := common.GetTimestamp()
	seedWindowLimitedToken(t, &Token{
		RemainQuota:        1000,
		Quota5hLimit:       100,
		Quota5hUsed:        20,
		Quota5hWindowStart: now,
		WeeklyLimit:        500,
		WeeklyUsed:         100,
		WeeklyWindowStart:  tokenWeeklyWindowStart(now-8*24*60*60, now),
		CreatedTime:        now - 40*24*60*60,
		ExpiredTime:        now - 60,
		UnlimitedQuota:     true,
	})
	var seeded Token
	require.NoError(t, DB.First(&seeded, 9001).Error)
	require.Equal(t, now-60, seeded.ExpiredTime)

	err := DecreaseTokenQuota(9001, "window-limited-token", 10)

	require.Error(t, err)
	assert.True(t, strings.Contains(err.Error(), "expired") || strings.Contains(err.Error(), "过期"), err.Error())
}

func TestResetDueTokenQuotaWindowsResetsExpiredWindows(t *testing.T) {
	truncateTables(t)
	now := GetDBTimestamp()
	createdTime := now - 15*24*60*60
	lastWeekStart := tokenWeeklyWindowStart(createdTime, now-8*24*60*60)
	seedWindowLimitedToken(t, &Token{
		Id:                 9001,
		RemainQuota:        1000,
		CreatedTime:        createdTime,
		ExpiredTime:        now + 24*60*60,
		Quota5hLimit:       100,
		Quota5hUsed:        100,
		Quota5hWindowStart: now - tokenQuota5hWindowSeconds - 1,
		WeeklyLimit:        500,
		WeeklyUsed:         400,
		WeeklyWindowStart:  lastWeekStart,
		UnlimitedQuota:     true,
	})
	seedWindowLimitedToken(t, &Token{
		Id:                 9002,
		Key:                "fresh-window-token",
		RemainQuota:        1000,
		CreatedTime:        createdTime,
		ExpiredTime:        now + 24*60*60,
		Quota5hLimit:       100,
		Quota5hUsed:        20,
		Quota5hWindowStart: now,
		WeeklyLimit:        500,
		WeeklyUsed:         30,
		WeeklyWindowStart:  tokenWeeklyWindowStart(createdTime, now),
		UnlimitedQuota:     true,
	})

	resetCount, err := ResetDueTokenQuotaWindows(100)

	require.NoError(t, err)
	assert.Equal(t, 2, resetCount)

	var expired Token
	require.NoError(t, DB.First(&expired, 9001).Error)
	assert.Equal(t, 0, expired.Quota5hUsed)
	assert.Equal(t, int64(0), expired.Quota5hWindowStart)
	assert.Equal(t, 0, expired.WeeklyUsed)
	assert.Equal(t, tokenWeeklyWindowStart(createdTime, now), expired.WeeklyWindowStart)

	var fresh Token
	require.NoError(t, DB.First(&fresh, 9002).Error)
	assert.Equal(t, 20, fresh.Quota5hUsed)
	assert.Equal(t, 30, fresh.WeeklyUsed)
}
