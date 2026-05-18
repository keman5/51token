package model

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/bytedance/gopkg/util/gopool"
	"gorm.io/gorm"
)

const (
	tokenQuota5hWindowSeconds     int64 = 5 * 60 * 60
	tokenQuotaWeeklyWindowSeconds int64 = 7 * 24 * 60 * 60
)

type Token struct {
	Id                 int            `json:"id"`
	UserId             int            `json:"user_id" gorm:"index"`
	Key                string         `json:"key" gorm:"type:varchar(128);uniqueIndex"`
	Status             int            `json:"status" gorm:"default:1"`
	Name               string         `json:"name" gorm:"index" `
	CreatedTime        int64          `json:"created_time" gorm:"bigint"`
	AccessedTime       int64          `json:"accessed_time" gorm:"bigint"`
	ExpiredTime        int64          `json:"expired_time" gorm:"bigint;default:-1"` // -1 means never expired
	RemainQuota        int            `json:"remain_quota" gorm:"default:0"`
	UnlimitedQuota     bool           `json:"unlimited_quota"`
	ModelLimitsEnabled bool           `json:"model_limits_enabled"`
	ModelLimits        string         `json:"model_limits" gorm:"type:text"`
	AllowIps           *string        `json:"allow_ips" gorm:"default:''"`
	UsedQuota          int            `json:"used_quota" gorm:"default:0"` // used quota
	Quota5hLimit       int            `json:"quota_5h_limit" gorm:"column:quota_5h_limit;default:0"`
	Quota5hUsed        int            `json:"quota_5h_used" gorm:"column:quota_5h_used;default:0"`
	Quota5hWindowStart int64          `json:"quota_5h_window_start" gorm:"column:quota_5h_window_start;bigint;default:0"`
	Quota5hAvailable   int            `json:"quota_5h_available" gorm:"-"`
	Quota5hExpiresAt   int64          `json:"quota_5h_expires_at" gorm:"-"`
	WeeklyLimit        int            `json:"quota_weekly_limit" gorm:"column:quota_weekly_limit;default:0"`
	WeeklyUsed         int            `json:"quota_weekly_used" gorm:"column:quota_weekly_used;default:0"`
	WeeklyWindowStart  int64          `json:"quota_weekly_window_start" gorm:"column:quota_weekly_window_start;bigint;default:0"`
	WeeklyAvailable    int            `json:"quota_weekly_available" gorm:"-"`
	WeeklyExpiresAt    int64          `json:"quota_weekly_expires_at" gorm:"-"`
	Group              string         `json:"group" gorm:"default:''"`
	CrossGroupRetry    bool           `json:"cross_group_retry"` // 跨分组重试，仅auto分组有效
	DeletedAt          gorm.DeletedAt `gorm:"index"`
}

func (token *Token) Clean() {
	token.Key = ""
}

func TokenMonthlyExpirationFromCreatedTime(createdTime int64) int64 {
	if createdTime <= 0 {
		createdTime = common.GetTimestamp()
	}
	created := time.Unix(createdTime, 0)
	year, month, day := created.Date()
	hour, minute, second := created.Clock()
	nextMonth := month + 1
	lastDayOfNextMonth := time.Date(year, nextMonth+1, 0, hour, minute, second, created.Nanosecond(), created.Location()).Day()
	if day > lastDayOfNextMonth {
		day = lastDayOfNextMonth
	}
	return time.Date(year, nextMonth, day, hour, minute, second, created.Nanosecond(), created.Location()).Unix()
}

func (token *Token) IsExpiredAt(now int64) bool {
	return token != nil && token.ExpiredTime != -1 && token.ExpiredTime > 0 && token.ExpiredTime < now
}

func (token *Token) EnsureMonthlyExpiration() {
	if token == nil {
		return
	}
	if token.ExpiredTime <= 0 {
		token.ExpiredTime = TokenMonthlyExpirationFromCreatedTime(token.CreatedTime)
	}
}

func PrepareTokenQuotaSummary(token *Token, now int64) {
	if token == nil {
		return
	}
	token.Quota5hAvailable = 0
	token.Quota5hExpiresAt = 0
	token.WeeklyAvailable = 0
	token.WeeklyExpiresAt = 0
	if token.IsExpiredAt(now) {
		return
	}
	if token.Quota5hLimit > 0 {
		used := token.Quota5hUsed
		windowStart := token.Quota5hWindowStart
		if windowStart <= 0 || now < windowStart || now-windowStart >= tokenQuota5hWindowSeconds {
			used = 0
			windowStart = now
		}
		token.Quota5hAvailable = max(token.Quota5hLimit-used, 0)
		token.Quota5hExpiresAt = windowStart + tokenQuota5hWindowSeconds
	}
	if token.WeeklyLimit > 0 {
		windowStart := tokenWeeklyWindowStart(token.CreatedTime, now)
		used := token.WeeklyUsed
		if token.WeeklyWindowStart != windowStart {
			used = 0
		}
		token.WeeklyAvailable = max(token.WeeklyLimit-used, 0)
		token.WeeklyExpiresAt = windowStart + tokenQuotaWeeklyWindowSeconds
	}
}

func MaskTokenKey(key string) string {
	if key == "" {
		return ""
	}
	if len(key) <= 4 {
		return strings.Repeat("*", len(key))
	}
	if len(key) <= 8 {
		return key[:2] + "****" + key[len(key)-2:]
	}
	return key[:4] + "**********" + key[len(key)-4:]
}

func (token *Token) GetFullKey() string {
	return token.Key
}

func (token *Token) GetMaskedKey() string {
	return MaskTokenKey(token.Key)
}

func (token *Token) GetIpLimits() []string {
	// delete empty spaces
	//split with \n
	ipLimits := make([]string, 0)
	if token.AllowIps == nil {
		return ipLimits
	}
	cleanIps := strings.ReplaceAll(*token.AllowIps, " ", "")
	if cleanIps == "" {
		return ipLimits
	}
	ips := strings.Split(cleanIps, "\n")
	for _, ip := range ips {
		ip = strings.TrimSpace(ip)
		ip = strings.ReplaceAll(ip, ",", "")
		if ip != "" {
			ipLimits = append(ipLimits, ip)
		}
	}
	return ipLimits
}

func GetAllUserTokens(userId int, startIdx int, num int) ([]*Token, error) {
	var tokens []*Token
	var err error
	err = DB.Where("user_id = ?", userId).Order("id desc").Limit(num).Offset(startIdx).Find(&tokens).Error
	return tokens, err
}

// sanitizeLikePattern 校验并清洗用户输入的 LIKE 搜索模式。
// 规则：
//  1. 转义 ! 和 _（使用 ! 作为 ESCAPE 字符，兼容 MySQL/PostgreSQL/SQLite）
//  2. 连续的 % 合并为单个 %
//  3. 最多允许 2 个 %
//  4. 含 % 时（模糊搜索），去掉 % 后关键词长度必须 >= 2
//  5. 不含 % 时按精确匹配
func sanitizeLikePattern(input string) (string, error) {
	// 1. 先转义 ESCAPE 字符 ! 自身，再转义 _
	//    使用 ! 而非 \ 作为 ESCAPE 字符，避免 MySQL 中反斜杠的字符串转义问题
	input = strings.ReplaceAll(input, "!", "!!")
	input = strings.ReplaceAll(input, `_`, `!_`)

	// 2. 连续的 % 直接拒绝
	if strings.Contains(input, "%%") {
		return "", errors.New("搜索模式中不允许包含连续的 % 通配符")
	}

	// 3. 统计 % 数量，不得超过 2
	count := strings.Count(input, "%")
	if count > 2 {
		return "", errors.New("搜索模式中最多允许包含 2 个 % 通配符")
	}

	// 4. 含 % 时，去掉 % 后关键词长度必须 >= 2
	if count > 0 {
		stripped := strings.ReplaceAll(input, "%", "")
		if len(stripped) < 2 {
			return "", errors.New("使用模糊搜索时，关键词长度至少为 2 个字符")
		}
		return input, nil
	}

	// 5. 无 % 时，精确全匹配
	return input, nil
}

const searchHardLimit = 100

func SearchUserTokens(userId int, keyword string, token string, offset int, limit int) (tokens []*Token, total int64, err error) {
	// model 层强制截断
	if limit <= 0 || limit > searchHardLimit {
		limit = searchHardLimit
	}
	if offset < 0 {
		offset = 0
	}

	if token != "" {
		token = strings.TrimPrefix(token, "sk-")
	}

	// 超量用户（令牌数超过上限）只允许精确搜索，禁止模糊搜索
	maxTokens := operation_setting.GetMaxUserTokens()
	hasFuzzy := strings.Contains(keyword, "%") || strings.Contains(token, "%")
	if hasFuzzy {
		count, err := CountUserTokens(userId)
		if err != nil {
			common.SysLog("failed to count user tokens: " + err.Error())
			return nil, 0, errors.New("获取令牌数量失败")
		}
		if int(count) > maxTokens {
			return nil, 0, errors.New("令牌数量超过上限，仅允许精确搜索，请勿使用 % 通配符")
		}
	}

	baseQuery := DB.Model(&Token{}).Where("user_id = ?", userId)

	// 非空才加 LIKE 条件，空则跳过（不过滤该字段）
	if keyword != "" {
		keywordPattern, err := sanitizeLikePattern(keyword)
		if err != nil {
			return nil, 0, err
		}
		baseQuery = baseQuery.Where("name LIKE ? ESCAPE '!'", keywordPattern)
	}
	if token != "" {
		tokenPattern, err := sanitizeLikePattern(token)
		if err != nil {
			return nil, 0, err
		}
		baseQuery = baseQuery.Where(commonKeyCol+" LIKE ? ESCAPE '!'", tokenPattern)
	}

	// 先查匹配总数（用于分页，受 maxTokens 上限保护，避免全表 COUNT）
	err = baseQuery.Limit(maxTokens).Count(&total).Error
	if err != nil {
		common.SysError("failed to count search tokens: " + err.Error())
		return nil, 0, errors.New("搜索令牌失败")
	}

	// 再分页查数据
	err = baseQuery.Order("id desc").Offset(offset).Limit(limit).Find(&tokens).Error
	if err != nil {
		common.SysError("failed to search tokens: " + err.Error())
		return nil, 0, errors.New("搜索令牌失败")
	}
	return tokens, total, nil
}

func ValidateUserToken(key string) (token *Token, err error) {
	if key == "" {
		return nil, ErrTokenNotProvided
	}
	token, err = GetTokenByKey(key, false)
	if err == nil {
		if token.Status == common.TokenStatusExhausted ||
			token.Status == common.TokenStatusExpired ||
			token.Status != common.TokenStatusEnabled {
			return token, ErrTokenInvalid
		}
		if token.ExpiredTime != -1 && token.ExpiredTime < common.GetTimestamp() {
			if !common.RedisEnabled {
				token.Status = common.TokenStatusExpired
				err := token.SelectUpdate()
				if err != nil {
					common.SysLog("failed to update token status" + err.Error())
				}
			}
			return token, ErrTokenInvalid
		}
		if !token.UnlimitedQuota && token.RemainQuota <= 0 {
			if !common.RedisEnabled {
				token.Status = common.TokenStatusExhausted
				err := token.SelectUpdate()
				if err != nil {
					common.SysLog("failed to update token status" + err.Error())
				}
			}
			return token, ErrTokenInvalid
		}
		return token, nil
	}
	common.SysLog("ValidateUserToken: failed to get token: " + err.Error())
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrTokenInvalid
	}
	return nil, fmt.Errorf("%w: %v", ErrDatabase, err)
}

func GetTokenByIds(id int, userId int) (*Token, error) {
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	token := Token{Id: id, UserId: userId}
	var err error = nil
	err = DB.First(&token, "id = ? and user_id = ?", id, userId).Error
	return &token, err
}

func GetTokenById(id int) (*Token, error) {
	if id == 0 {
		return nil, errors.New("id 为空！")
	}
	token := Token{Id: id}
	var err error = nil
	err = DB.First(&token, "id = ?", id).Error
	if shouldUpdateRedis(true, err) {
		gopool.Go(func() {
			if err := cacheSetToken(token); err != nil {
				common.SysLog("failed to update user status cache: " + err.Error())
			}
		})
	}
	return &token, err
}

func GetTokenByKey(key string, fromDB bool) (token *Token, err error) {
	defer func() {
		// Update Redis cache asynchronously on successful DB read
		if shouldUpdateRedis(fromDB, err) && token != nil {
			gopool.Go(func() {
				if err := cacheSetToken(*token); err != nil {
					common.SysLog("failed to update user status cache: " + err.Error())
				}
			})
		}
	}()
	if !fromDB && common.RedisEnabled {
		// Try Redis first
		token, err := cacheGetTokenByKey(key)
		if err == nil {
			return token, nil
		}
		// Don't return error - fall through to DB
	}
	fromDB = true
	err = DB.Where(commonKeyCol+" = ?", key).First(&token).Error
	return token, err
}

func (token *Token) Insert() error {
	var err error
	err = DB.Create(token).Error
	return err
}

// Update Make sure your token's fields is completed, because this will update non-zero values
func (token *Token) Update() (err error) {
	defer func() {
		if shouldUpdateRedis(true, err) {
			gopool.Go(func() {
				err := cacheSetToken(*token)
				if err != nil {
					common.SysLog("failed to update token cache: " + err.Error())
				}
			})
		}
	}()
	err = DB.Model(token).Select("name", "status", "expired_time", "remain_quota", "unlimited_quota",
		"model_limits_enabled", "model_limits", "allow_ips", "quota_5h_limit", "quota_5h_used",
		"quota_5h_window_start", "quota_weekly_limit", "quota_weekly_used", "quota_weekly_window_start",
		"group", "cross_group_retry").Updates(token).Error
	return err
}

func (token *Token) SelectUpdate() (err error) {
	defer func() {
		if shouldUpdateRedis(true, err) {
			gopool.Go(func() {
				err := cacheSetToken(*token)
				if err != nil {
					common.SysLog("failed to update token cache: " + err.Error())
				}
			})
		}
	}()
	// This can update zero values
	return DB.Model(token).Select("accessed_time", "status").Updates(token).Error
}

func (token *Token) Delete() (err error) {
	defer func() {
		if shouldUpdateRedis(true, err) {
			gopool.Go(func() {
				err := cacheDeleteToken(token.Key)
				if err != nil {
					common.SysLog("failed to delete token cache: " + err.Error())
				}
			})
		}
	}()
	err = DB.Delete(token).Error
	return err
}

func (token *Token) IsModelLimitsEnabled() bool {
	return token.ModelLimitsEnabled
}

func (token *Token) GetModelLimits() []string {
	if token.ModelLimits == "" {
		return []string{}
	}
	return strings.Split(token.ModelLimits, ",")
}

func (token *Token) GetModelLimitsMap() map[string]bool {
	limits := token.GetModelLimits()
	limitsMap := make(map[string]bool)
	for _, limit := range limits {
		limitsMap[limit] = true
	}
	return limitsMap
}

func DisableModelLimits(tokenId int) error {
	token, err := GetTokenById(tokenId)
	if err != nil {
		return err
	}
	token.ModelLimitsEnabled = false
	token.ModelLimits = ""
	return token.Update()
}

func DeleteTokenById(id int, userId int) (err error) {
	// Why we need userId here? In case user want to delete other's token.
	if id == 0 || userId == 0 {
		return errors.New("id 或 userId 为空！")
	}
	token := Token{Id: id, UserId: userId}
	err = DB.Where(token).First(&token).Error
	if err != nil {
		return err
	}
	return token.Delete()
}

func IncreaseTokenQuota(tokenId int, key string, quota int) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	err = increaseTokenQuota(tokenId, quota)
	if err == nil && common.RedisEnabled {
		gopool.Go(func() {
			err := cacheIncrTokenQuota(key, int64(quota))
			if err != nil {
				common.SysLog("failed to increase token quota: " + err.Error())
			}
		})
	}
	return err
}

func increaseTokenQuota(id int, quota int) (err error) {
	if quota == 0 {
		return nil
	}
	return DB.Transaction(func(tx *gorm.DB) error {
		var token Token
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", id).First(&token).Error; err != nil {
			return err
		}
		now := common.GetTimestamp()
		normalizeTokenQuotaWindows(&token, now)
		token.RemainQuota += quota
		token.UsedQuota -= quota
		if token.Quota5hLimit > 0 {
			token.Quota5hUsed -= quota
			if token.Quota5hUsed < 0 {
				token.Quota5hUsed = 0
			}
		}
		if token.WeeklyLimit > 0 {
			token.WeeklyUsed -= quota
			if token.WeeklyUsed < 0 {
				token.WeeklyUsed = 0
			}
		}
		token.AccessedTime = now
		return saveTokenQuotaStateTx(tx, &token)
	})
}

func DecreaseTokenQuota(id int, key string, quota int) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	err = decreaseTokenQuota(id, quota)
	if err == nil && common.RedisEnabled {
		gopool.Go(func() {
			err := cacheDecrTokenQuota(key, int64(quota))
			if err != nil {
				common.SysLog("failed to decrease token quota: " + err.Error())
			}
		})
	}
	return err
}

func decreaseTokenQuota(id int, quota int) (err error) {
	if quota == 0 {
		return nil
	}
	return DB.Transaction(func(tx *gorm.DB) error {
		var token Token
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", id).First(&token).Error; err != nil {
			return err
		}
		now := common.GetTimestamp()
		if token.IsExpiredAt(now) {
			return fmt.Errorf("token 已过期")
		}
		normalizeTokenQuotaWindows(&token, now)
		if !token.UnlimitedQuota && token.RemainQuota < quota {
			return fmt.Errorf("token quota is not enough, token remain quota: %d, need quota: %d", token.RemainQuota, quota)
		}
		if token.Quota5hLimit > 0 && token.Quota5hUsed+quota > token.Quota5hLimit {
			return fmt.Errorf("token 5小时限额不足, 5小时剩余额度: %d, need quota: %d", token.Quota5hLimit-token.Quota5hUsed, quota)
		}
		if token.WeeklyLimit > 0 && token.WeeklyUsed+quota > token.WeeklyLimit {
			return fmt.Errorf("token 周限额不足, 周剩余额度: %d, need quota: %d", token.WeeklyLimit-token.WeeklyUsed, quota)
		}
		token.RemainQuota -= quota
		token.UsedQuota += quota
		if token.Quota5hLimit > 0 {
			token.Quota5hUsed += quota
		}
		if token.WeeklyLimit > 0 {
			token.WeeklyUsed += quota
		}
		token.AccessedTime = now
		return saveTokenQuotaStateTx(tx, &token)
	})
}

func saveTokenQuotaStateTx(tx *gorm.DB, token *Token) error {
	return tx.Model(&Token{}).Where("id = ?", token.Id).Updates(map[string]interface{}{
		"remain_quota":              token.RemainQuota,
		"used_quota":                token.UsedQuota,
		"accessed_time":             token.AccessedTime,
		"quota_5h_used":             token.Quota5hUsed,
		"quota_5h_window_start":     token.Quota5hWindowStart,
		"quota_weekly_used":         token.WeeklyUsed,
		"quota_weekly_window_start": token.WeeklyWindowStart,
	}).Error
}

func normalizeTokenQuotaWindows(token *Token, now int64) {
	if token.Quota5hLimit > 0 {
		if token.Quota5hWindowStart <= 0 || now < token.Quota5hWindowStart || now-token.Quota5hWindowStart >= tokenQuota5hWindowSeconds {
			token.Quota5hWindowStart = now
			token.Quota5hUsed = 0
		}
	} else {
		token.Quota5hWindowStart = 0
		token.Quota5hUsed = 0
	}

	if token.WeeklyLimit > 0 {
		windowStart := tokenWeeklyWindowStart(token.CreatedTime, now)
		if token.WeeklyWindowStart != windowStart {
			token.WeeklyWindowStart = windowStart
			token.WeeklyUsed = 0
		}
	} else {
		token.WeeklyWindowStart = 0
		token.WeeklyUsed = 0
	}
}

func tokenWeeklyWindowStart(createdTime int64, now int64) int64 {
	if createdTime <= 0 {
		return currentTokenWeeklyWindowStart(now)
	}
	if now <= createdTime {
		return createdTime
	}
	windowsElapsed := (now - createdTime) / tokenQuotaWeeklyWindowSeconds
	return createdTime + windowsElapsed*tokenQuotaWeeklyWindowSeconds
}

func currentTokenWeeklyWindowStart(now int64) int64 {
	current := time.Unix(now, 0)
	weekday := int(current.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	return time.Date(current.Year(), current.Month(), current.Day(), 0, 0, 0, 0, current.Location()).
		AddDate(0, 0, 1-weekday).
		Unix()
}

func ResetDueTokenQuotaWindows(limit int) (int, error) {
	if limit <= 0 {
		limit = 200
	}
	now := common.GetTimestamp()
	resetCount := 0

	var fiveHourTokens []Token
	fiveHourCutoff := now - tokenQuota5hWindowSeconds
	if err := DB.
		Where("quota_5h_limit > 0 AND quota_5h_window_start > 0 AND quota_5h_window_start <= ? AND (expired_time = -1 OR expired_time > ?)", fiveHourCutoff, now).
		Order("quota_5h_window_start asc").
		Limit(limit).
		Find(&fiveHourTokens).Error; err != nil {
		return resetCount, err
	}
	for _, candidate := range fiveHourTokens {
		tokenId := candidate.Id
		err := DB.Transaction(func(tx *gorm.DB) error {
			var locked Token
			if err := tx.Set("gorm:query_option", "FOR UPDATE").
				Where("id = ? AND quota_5h_limit > 0 AND quota_5h_window_start > 0 AND quota_5h_window_start <= ? AND (expired_time = -1 OR expired_time > ?)", tokenId, fiveHourCutoff, now).
				First(&locked).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil
				}
				return err
			}
			return tx.Model(&Token{}).Where("id = ?", locked.Id).Updates(map[string]interface{}{
				"quota_5h_used":         0,
				"quota_5h_window_start": 0,
			}).Error
		})
		if err != nil {
			return resetCount, err
		}
		resetCount++
	}

	remaining := limit - resetCount
	if remaining <= 0 {
		return resetCount, nil
	}
	var weeklyTokens []Token
	if err := DB.
		Where("quota_weekly_limit > 0 AND quota_weekly_window_start > 0 AND quota_weekly_window_start <= ? AND (expired_time = -1 OR expired_time > ?)", now-tokenQuotaWeeklyWindowSeconds, now).
		Order("quota_weekly_window_start asc").
		Limit(remaining).
		Find(&weeklyTokens).Error; err != nil {
		return resetCount, err
	}
	for _, candidate := range weeklyTokens {
		tokenId := candidate.Id
		err := DB.Transaction(func(tx *gorm.DB) error {
			var locked Token
			if err := tx.Set("gorm:query_option", "FOR UPDATE").
				Where("id = ? AND quota_weekly_limit > 0 AND quota_weekly_window_start > 0 AND quota_weekly_window_start <= ? AND (expired_time = -1 OR expired_time > ?)", tokenId, now-tokenQuotaWeeklyWindowSeconds, now).
				First(&locked).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil
				}
				return err
			}
			currentWeeklyStart := tokenWeeklyWindowStart(locked.CreatedTime, now)
			if locked.WeeklyWindowStart == currentWeeklyStart {
				return nil
			}
			return tx.Model(&Token{}).Where("id = ?", locked.Id).Updates(map[string]interface{}{
				"quota_weekly_used":         0,
				"quota_weekly_window_start": currentWeeklyStart,
			}).Error
		})
		if err != nil {
			return resetCount, err
		}
		resetCount++
	}

	return resetCount, nil
}

// CountUserTokens returns total number of tokens for the given user, used for pagination
func CountUserTokens(userId int) (int64, error) {
	var total int64
	err := DB.Model(&Token{}).Where("user_id = ?", userId).Count(&total).Error
	return total, err
}

// BatchDeleteTokens 删除指定用户的一组令牌，返回成功删除数量
func BatchDeleteTokens(ids []int, userId int) (int, error) {
	if len(ids) == 0 {
		return 0, errors.New("ids 不能为空！")
	}

	tx := DB.Begin()

	var tokens []Token
	if err := tx.Where("user_id = ? AND id IN (?)", userId, ids).Find(&tokens).Error; err != nil {
		tx.Rollback()
		return 0, err
	}

	if err := tx.Where("user_id = ? AND id IN (?)", userId, ids).Delete(&Token{}).Error; err != nil {
		tx.Rollback()
		return 0, err
	}

	if err := tx.Commit().Error; err != nil {
		return 0, err
	}

	if common.RedisEnabled {
		gopool.Go(func() {
			for _, t := range tokens {
				_ = cacheDeleteToken(t.Key)
			}
		})
	}

	return len(tokens), nil
}

func GetTokenKeysByIds(ids []int, userId int) ([]Token, error) {
	var tokens []Token
	err := DB.Select("id", commonKeyCol).
		Where("user_id = ? AND id IN (?)", userId, ids).
		Find(&tokens).Error
	return tokens, err
}

// InvalidateUserTokensCache 清理指定用户所有令牌在 Redis 中的缓存，
// 配合 InvalidateUserCache 使用，可在用户被禁用/删除时立即阻断其令牌的请求。
// 下一次请求将从数据库重新加载令牌及用户状态，从而立即识别出被禁用的用户。
func InvalidateUserTokensCache(userId int) error {
	if !common.RedisEnabled {
		return nil
	}
	if userId <= 0 {
		return errors.New("userId 无效")
	}
	var tokens []Token
	if err := DB.Unscoped().
		Select("id", commonKeyCol).
		Where("user_id = ?", userId).
		Find(&tokens).Error; err != nil {
		return err
	}
	var firstErr error
	for _, t := range tokens {
		if t.Key == "" {
			continue
		}
		if err := cacheDeleteToken(t.Key); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}
