package text

import (
	"regexp"
	"strings"
)

// CleanOptionPrefix removes common prefixes from multiple choice options
// Examples: "A) The heart" -> "The heart"
//           "b. The liver" -> "The liver"
//           "C - The lungs" -> "The lungs"
func CleanOptionPrefix(optionText string) string {
	// Regex pattern to match: single letter (A-E case insensitive) followed by any combination of ) . - and optional whitespace
	pattern := `(?i)^[a-e]\s*[\)\.\-\s]+\s*`

	re := regexp.MustCompile(pattern)
	cleaned := re.ReplaceAllString(optionText, "")

	return strings.TrimSpace(cleaned)
}

// CleanOptionPrefixes applies CleanOptionPrefix to a slice of option texts
func CleanOptionPrefixes(optionTexts []string) []string {
	cleaned := make([]string, len(optionTexts))
	for i, text := range optionTexts {
		cleaned[i] = CleanOptionPrefix(text)
	}
	return cleaned
}
