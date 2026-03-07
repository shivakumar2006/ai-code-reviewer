package llmclient

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
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
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return nil, fmt.Errorf("llm service timed out: %w", err)
		}
		return nil, fmt.Errorf("failed to call ll service: %w", err)
	}
	defer resp.Body.Close()

	// read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// handle non 200 responses
	if resp.StatusCode != http.StatusOK {
		// try to extract error message from response
		var errResp struct {
			Error string `json:"error"`
		}
		if jsonErr := json.Unmarshal(respBody, &errResp); jsonErr != nil && errResp.Error != "" {
			return nil, fmt.Errorf("llm service error: %s", errResp.Error)
		}
		return nil, fmt.Errorf("Error service returned status: %d", resp.StatusCode)
	}

	// unmarshal response
	var llmResp models.LLMReviewResponse
	if err := json.Unmarshal(respBody, &llmResp); err != nil {
		return nil, fmt.Errorf("failed to parse llm response: %w", err)
	}

	// validate reesponse
	if err := validateLLMResponse(&llmResp); err != nil {
		return nil, fmt.Errorf("invalid llm response : %w", err)
	}

	return &llmResp, nil
}

// ping checks if llm-service is alive
func (c *LLMClient) Ping(ctx context.Context) error {
	url := c.baseURL + "/health"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("llm service unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("llm service unhealthy, status: %d", resp.StatusCode)
	}
	return nil
}

// private helper
func validateLLMResponse(resp *models.LLMReviewResponse) error {
	if resp.Score < 0 || resp.Score > 10 {
		return errors.New("score out of range (0-10)")
	}

	if resp.Suggestions == nil {
		return errors.New("Summary is empty")
	}

	// validate each issue
	for i, issue := range resp.Issues {
		if issue.Message == "" {
			return fmt.Errorf("issue %d has empty message", i)
		}
		if !isValidSeverity(issue.Severity) {
			return fmt.Errorf("issue %d has invalid severity: %s", i, issue.Severity)
		}
	}
	return nil
}

func isValidSeverity(s models.Severity) bool {
	switch s {
	case models.SeverityBug,
		models.SeverityWarning,
		models.SeverityInfo,
		models.SeveritySecurity:
		return true
	}
	return false
}
