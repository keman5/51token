package router

import "testing"

func TestShouldServeIndexFallback(t *testing.T) {
	tests := []struct {
		name string
		path string
		want bool
	}{
		{
			name: "spa route falls back to index",
			path: "/system-settings/operations/performance",
			want: true,
		},
		{
			name: "missing static js does not fall back to index",
			path: "/static/js/missing-module.js",
			want: false,
		},
		{
			name: "missing static css does not fall back to index",
			path: "/static/css/missing.css",
			want: false,
		},
		{
			name: "stale vite client path does not fall back to index",
			path: "/@vite/client",
			want: false,
		},
		{
			name: "stale source module path does not fall back to index",
			path: "/src/main.tsx",
			want: false,
		},
		{
			name: "missing service worker does not fall back to index",
			path: "/sw.js",
			want: false,
		},
		{
			name: "api route does not fall back to index",
			path: "/api/status",
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := shouldServeIndexFallback(tt.path); got != tt.want {
				t.Fatalf("shouldServeIndexFallback(%q) = %v, want %v", tt.path, got, tt.want)
			}
		})
	}
}
