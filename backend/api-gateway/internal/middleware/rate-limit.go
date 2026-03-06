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
	mu      *sync.Mutex
	clients map[string]*client
	limit   int
	window  time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*client),
		limit:   limit,
		window:  window,
	}

	go rl.cleanupLoop()

	return rl
}

func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// identlify whose making the request
		// use userID if authenticated, otherwise use IP
		key := rl.getClientKey(r)

		// check if the rate limit is exceeded
		if !rl.isAllowed(key) {
			w.Header().Set("X-RateLimit-Limit", string(rune(rl.limit)))
			w.Header().Set("Retry-After", rl.window.String())
			writeError(w, http.StatusTooManyRequests, "rate limit exceeded, please slow down")
		}

		// forward to next handler
		next.ServeHTTP(w, r)
	})
}

// private helpers functions

func (rl *RateLimiter) getClientKey(r *http.Request) string {
	// if user is authenticated use their userID as a key
	// this prevents users from bypassing limit by changing IP
	userID := r.Header.Get("X-User-ID")
	if userID != "" {
		return "user:" + userID
	}

	// fallback to IP
	ip := r.Header.Get("X-Real-IP")
	if ip == "" {
		ip = r.Header.Get("X-Forwarded-For")
	}
	if ip == "" {
		ip = r.RemoteAddr
	}

	return "ip: " + ip
}

func (rl *RateLimiter) isAllowed(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	c, exists := rl.clients[key]

	if !exists {
		// first requests from clients
		rl.clients[key] = &client{
			count:    1,
			lastSeen: now,
		}
		return true
	}

	// check if the window has reset
	if c.count >= rl.limit {
		return false // means rate limit exceed
	}

	// increment count
	c.count++
	c.lastSeen = now
	return true
}

func (rl *RateLimiter) cleanupLoop() {
	// run every minute
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.cleanup()
	}
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for key, c := range rl.clients {
		// delete the clinet we haven't seen in 3x the window
		if now.Sub(c.lastSeen) > rl.window*3 {
			delete(rl.clients, key)
		}
	}
}
