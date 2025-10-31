# Gemini AI Setup Guide

This document explains how to set up and troubleshoot the Gemini AI integration in your language learning app.

## Current Configuration

- **API Key**: AIzaSyB3DChiKfl4Pi_kkcta0eSGh3dvOXMG7f8
- **Model**: gemini-1.5-flash (fast and efficient)
- **Location**: `src/config/gemini.ts`

## Prerequisites

1. **Internet Connection**: The device must have an active internet connection
2. **Gemini API Access**: The API key must be valid and have the Gemini API enabled
3. **No Quota Exceeded**: Ensure your API quota hasn't been exceeded

## Verifying Your Setup

### Step 1: Check API Key Validity

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verify the API key is listed and active
3. Ensure the Gemini API is enabled

### Step 2: Test API Access

1. Go to [Google AI Studio Chat](https://makersuite.google.com/)
2. Try generating content with your API key
3. If this works, the issue is likely in the app configuration

### Step 3: Check Quota

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Dashboard
3. Check Generative Language API quota usage

## Common Issues and Solutions

### Issue 1: "Network error. Please check your internet connection."

**Possible Causes:**
- Device has no internet connection
- Firewall blocking Google's API endpoints
- DNS resolution issues

**Solutions:**
1. Verify device internet connection
2. Try switching between WiFi and mobile data
3. Check if other internet-dependent features work

### Issue 2: "Invalid API key"

**Possible Causes:**
- API key is incorrect
- API key has been revoked
- API key restrictions prevent access

**Solutions:**
1. Regenerate API key in Google AI Studio
2. Update `src/config/gemini.ts` with new key
3. Check API key restrictions (IP, referrer, etc.)

### Issue 3: "API quota exceeded"

**Possible Causes:**
- Free tier quota has been exhausted
- Rate limits exceeded

**Solutions:**
1. Wait for quota to reset (usually daily)
2. Upgrade to paid tier
3. Optimize API usage (reduce requests)

### Issue 4: "Model not found"

**Possible Causes:**
- Model name is incorrect
- Model not available in your region
- API version mismatch

**Solutions:**
1. Try alternative model: "gemini-pro"
2. Update to latest @google/generative-ai package
3. Check Google AI documentation for available models

### Issue 5: "Response was blocked by safety filters"

**Possible Causes:**
- User input triggered safety filters
- Content policy violation

**Solutions:**
1. Rephrase the message
2. Avoid sensitive topics
3. Current safety settings are already relaxed (BLOCK_ONLY_HIGH)

## Testing the AI Features

### In the App:

1. **Open AI Tutor**: Navigate to the AI Tutor tab
2. **Try Chat**: Send a simple message like "Hello"
3. **Check Console**: Look for logs with emoji markers:
   - 🤖 AI Chat - Starting request...
   - 📤 Sending request to Gemini API...
   - 📥 Received response from Gemini API
   - ✅ AI Response: [response text]

### Test Different Features:

1. **Chat**: "Tell me about Spanish greetings"
2. **Grammar**: Switch to Grammar mode, enter "I goes to school"
3. **Translate**: Switch to Translate mode, enter "Hello, how are you?"
4. **Culture**: Switch to Culture mode, ask about "Spanish food traditions"

## Debugging

### Enable Detailed Logging

The service already includes comprehensive logging. In your development environment:

1. Open React Native debugger
2. Check the console for detailed logs
3. Look for error messages with specific error types

### Common Log Messages

**Success Flow:**
```
🤖 AI Chat - Starting request...
User message: Hello
Language: Spanish
Level: beginner
📤 Sending request to Gemini API...
Using model: gemini-1.5-flash
📥 Received response from Gemini API
✅ AI Response: ¡Hola! ¿Cómo estás?
```

**Error Flow:**
```
🤖 AI Chat - Starting request...
User message: Hello
Language: Spanish
Level: beginner
📤 Sending request to Gemini API...
Using model: gemini-1.5-flash
❌ Error in chat: [Error object]
Error name: Error
Error message: [specific error]
Error details: [JSON object]
```

## Alternative Models

If `gemini-1.5-flash` doesn't work, try these alternatives:

```typescript
// In src/config/gemini.ts
export const geminiConfig = {
  // Option 1: Gemini Pro (more capable, slower)
  model: "gemini-pro",

  // Option 2: Gemini 1.5 Pro (most capable)
  model: "gemini-1.5-pro",

  // Current: Gemini 1.5 Flash (fastest)
  model: "gemini-1.5-flash",
};
```

## Security Note

⚠️ **Important**: The API key is currently hardcoded in the source code. For production:

1. Use environment variables
2. Implement server-side proxy for API calls
3. Use Firebase Functions or similar backend
4. Never expose API keys in client-side code

## Rate Limiting

The current configuration includes:
- Max requests per minute: 30
- Max requests per day: 500
- Max conversation history: 20 messages

Adjust these in `src/config/gemini.ts` based on your needs.

## Support

If issues persist:

1. Check [Google AI Studio Documentation](https://ai.google.dev/docs)
2. Review [Gemini API Status](https://status.cloud.google.com/)
3. Check [GitHub Issues](https://github.com/google/generative-ai-js/issues)

## Files Modified

- `src/config/gemini.ts` - Configuration
- `src/services/GeminiService.ts` - Service implementation
- `src/screens/AITutorScreen.tsx` - UI implementation
- `src/navigation/AppNavigator.tsx` - Navigation setup

## Next Steps

1. Test the AI features on a physical device or emulator with internet access
2. Monitor the console logs for any errors
3. Adjust safety settings if needed
4. Customize prompts for better responses
5. Consider implementing caching for frequently asked questions

---

**Last Updated**: 2025-10-31
**Configuration Version**: 1.0
**Model**: gemini-1.5-flash
