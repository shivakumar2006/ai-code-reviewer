package llmclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"review-service/internal/models"
	"time"
)

type LLMClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewLLMClient(baseURL string) *LLMClient {
	return &LLMClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			// llm takes longer than normal api's so we give it more time
			Timeout: 120 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        10,
				MaxIdleConnsPerHost: 5,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// review sends code to llm service and gets back a review
func (c *LLMClient) Review(ctx context.Context, req *models.LLMReviewRequest) (*models.LLMReviewResponse, error) {
	// marshal request to json
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// build http request
	url := c.baseURL + "/llm/review"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build requests: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	// fire the request

}
