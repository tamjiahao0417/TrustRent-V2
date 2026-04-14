<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Property;

class AiController extends Controller
{
    // Fetches properties for the auto-fill dropdown
    public function getLandlordProperties($landlordId)
    {
        $properties = Property::where('landlord_id', $landlordId)->get();
        return response()->json($properties);
    }

    // Connects to Gemini to get the AI Prediction
    public function predictPrice(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string',
            'type' => 'required|string',
            'size' => 'required|numeric',
            'rooms' => 'required|numeric',
            'furnishing' => 'required|string',
            'features' => 'nullable|string'
        ]);

        // Replace this with your actual API key, or better yet, put it in your .env file!
        $apiKey = "AIzaSyBMr9zmjzlUYv0eJC96c0oGnD0gTmlm6_4"; 

        $prompt = "You are an expert real estate appraiser in Malaysia. Analyze the following property and estimate a fair monthly rental price in RM (Malaysian Ringgit). 
Property Details:
- Type: " . $validated['type'] . "
- Location: " . $validated['location'] . "
- Size: " . $validated['size'] . " sqft
- Bedrooms: " . $validated['rooms'] . "
- Furnishing: " . $validated['furnishing'] . "
- Features: " . ($validated['features'] ?? 'None') . "

Based on the Malaysian property market, respond ONLY with a valid JSON object matching this exact structure. Do not include Markdown blocks like ```json.
{
  \"price_range\": \"RM [Low End] - RM [High End] / month\",
  \"factors\": {
    \"location\": \"Explain why this specific location affects the price (1-2 sentences).\",
    \"size\": \"Explain how the size and bedroom count affect the price.\",
    \"features\": \"Explain how the furnishing and specific features add value.\",
    \"trends\": \"Provide a realistic 1-sentence market trend for this type of property.\"
  }
}";

        // Send the request securely via Laravel HTTP Client
        $response = Http::withOptions(['verify' => false]) // Prevents SSL local errors
            ->post("[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=){$apiKey}", [
                "contents" => [["parts" => [["text" => $prompt]]]],
                "generationConfig" => ["responseMimeType" => "application/json"]
            ]);

        if ($response->successful()) {
            $result = $response->json();
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
            $aiText = str_replace(['```json', '```'], '', $aiText); // Clean up markdown
            $aiData = json_decode(trim($aiText), true);

            if ($aiData) {
                return response()->json(['success' => true, 'data' => $aiData]);
            }
        }

        return response()->json(['success' => false, 'error' => 'AI Service failed or returned invalid format.'], 500);
    }
}