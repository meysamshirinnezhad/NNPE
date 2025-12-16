package services

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
    "time"

    "github.com/nppe-pro/api/internal/dto"
)

type OpenRouterClient struct {
    httpClient *http.Client
    apiKey     string
}

func NewOpenRouterClient() *OpenRouterClient {
    key := os.Getenv("OPENROUTER_API_KEY")
    return &OpenRouterClient{
        httpClient: &http.Client{Timeout: 30 * time.Second},
        apiKey:     key,
    }
}

// minimal request/response structs for OpenRouter

type orMessage struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type orRequest struct {
    Model          string      `json:"model"`
    Messages       []orMessage `json:"messages"`
    Stream         bool        `json:"stream"`
    ResponseFormat *struct {
        Type string `json:"type"`
    } `json:"response_format,omitempty"`
}

type orChoice struct {
    Message struct {
        Role    string `json:"role"`
        Content string `json:"content"`
    } `json:"message"`
}

type orResponse struct {
    Choices []orChoice `json:"choices"`
}

func (c *OpenRouterClient) GenerateCoachResponse(
    ctx context.Context,
    systemPrompt, userPrompt string,
) (*dto.CoachResponse, error) {

    reqBody := orRequest{
        Model:  "google/gemini-2.0-flash-001",
        Stream: false,
        Messages: []orMessage{
            {Role: "system", Content: systemPrompt},
            {Role: "user", Content: userPrompt},
        },
        ResponseFormat: &struct{ Type string `json:"type"` }{Type: "json_object"},
    }

    buf, err := json.Marshal(reqBody)
    if err != nil {
        return nil, fmt.Errorf("marshal request: %w", err)
    }

    httpReq, err := http.NewRequestWithContext(
        ctx,
        http.MethodPost,
        "https://openrouter.ai/api/v1/chat/completions",
        bytes.NewReader(buf),
    )
    if err != nil {
        return nil, fmt.Errorf("build request: %w", err)
    }

    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
    // Optional but recommended attribution header
    httpReq.Header.Set("HTTP-Referer", "https://nppepro.com")
    httpReq.Header.Set("X-Title", "NPPE Pro AI Coach")

    resp, err := c.httpClient.Do(httpReq)
    if err != nil {
        return nil, fmt.Errorf("openrouter request: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        var bodyBytes []byte
        bodyBytes, _ = io.ReadAll(resp.Body)
        return nil, fmt.Errorf("openrouter status %d: %s", resp.StatusCode, string(bodyBytes))
    }

    var orResp orResponse
    if err := json.NewDecoder(resp.Body).Decode(&orResp); err != nil {
        return nil, fmt.Errorf("decode openrouter response: %w", err)
    }

    if len(orResp.Choices) == 0 {
        return nil, fmt.Errorf("no choices returned from OpenRouter")
    }

    content := orResp.Choices[0].Message.Content

    var coach dto.CoachResponse
    if err := json.Unmarshal([]byte(content), &coach); err != nil {
        return nil, fmt.Errorf("parse coach JSON: %w; raw content: %s", err, content)
    }

    return &coach, nil
}
