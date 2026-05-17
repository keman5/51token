package router

import (
	"embed"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// ThemeAssets holds the embedded frontend assets for both themes.
type ThemeAssets struct {
	DefaultBuildFS   embed.FS
	DefaultIndexPage []byte
	ClassicBuildFS   embed.FS
	ClassicIndexPage []byte
}

func SetWebRouter(router *gin.Engine, assets ThemeAssets) {
	defaultFS := common.EmbedFolder(assets.DefaultBuildFS, "web/default/dist")
	classicFS := common.EmbedFolder(assets.ClassicBuildFS, "web/classic/dist")
	themeFS := common.NewThemeAwareFS(defaultFS, classicFS)

	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.Use(static.Serve("/", themeFS))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if !shouldServeIndexFallback(c.Request.URL.Path) {
			c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
			controller.RelayNotFound(c)
			return
		}
		c.Header("Cache-Control", "no-cache")
		if common.GetTheme() == "classic" {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.ClassicIndexPage)
		} else {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.DefaultIndexPage)
		}
	})
}

func shouldServeIndexFallback(path string) bool {
	nonPagePrefixes := []string{
		"/v1",
		"/api",
		"/assets",
		"/static",
		"/@vite",
		"/@react-refresh",
		"/src",
		"/node_modules",
		"/.well-known",
	}
	for _, prefix := range nonPagePrefixes {
		if path == prefix || strings.HasPrefix(path, prefix+"/") {
			return false
		}
	}

	lastSlash := strings.LastIndex(path, "/")
	fileName := path
	if lastSlash >= 0 {
		fileName = path[lastSlash+1:]
	}
	dot := strings.LastIndex(fileName, ".")
	if dot >= 0 {
		switch strings.ToLower(fileName[dot:]) {
		case ".css",
			".gif",
			".ico",
			".jpeg",
			".jpg",
			".js",
			".json",
			".map",
			".mjs",
			".png",
			".svg",
			".ts",
			".tsx",
			".ttf",
			".wasm",
			".webp",
			".woff",
			".woff2":
			return false
		}
	}
	return true
}
