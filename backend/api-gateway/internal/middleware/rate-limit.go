package middleware

import (
	"net/http"
	"sync"
	"time"
)

type client struct {
	count    int
	lastSeen time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	clients map[string]*client
	limit   int
	window  time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*client), // ← this was the real issue
		limit:   limit,
		window:  window,
	}

	go rl.cleanupLoop()
	return rl
}

func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := rl.getClientKey(r)

		if !rl.isAllowed(key) {
			writeError(w, http.StatusTooManyRequests, "rate limit exceeded, please slow down")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) getClientKey(r *http.Request) string {
	userID := r.Header.Get("X-User-ID")
	if userID != "" {
		return "user:" + userID
	}

	ip := r.Header.Get("X-Real-IP")
	if ip == "" {
		ip = r.Header.Get("X-Forwarded-For")
	}
	if ip == "" {
		ip = r.RemoteAddr
	}
	return "ip:" + ip
}

func (rl *RateLimiter) isAllowed(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	// ← make sure clients map is never nil
	if rl.clients == nil {
		rl.clients = make(map[string]*client)
	}

	now := time.Now()
	c, exists := rl.clients[key]

	if !exists {
		rl.clients[key] = &client{count: 1, lastSeen: now}
		return true
	}

	if now.Sub(c.lastSeen) > rl.window {
		c.count = 1
		c.lastSeen = now
		return true
	}

	if c.count >= rl.limit {
		return false
	}

	c.count++
	c.lastSeen = now
	return true
}

func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.cleanup()
	}
}

func (rl *RateLimiter) cleanup() {
	// ← guard against nil mutex
	if rl == nil {
		return
	}

	rl.mu.Lock()
	defer rl.mu.Unlock()

	if rl.clients == nil {
		return
	}

	now := time.Now()
	for key, c := range rl.clients {
		if now.Sub(c.lastSeen) > rl.window*3 {
			delete(rl.clients, key)
		}
	}
}
