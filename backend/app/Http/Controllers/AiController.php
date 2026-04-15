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
        try {
            $validated = $request->validate([
                'location' => 'required|string',
                'type' => 'required|string',
                'size' => 'required|numeric',
                'rooms' => 'required|numeric',
                'furnishing' => 'required|string',
                'features' => 'nullable|string'
            ]);

            // NOTE: If this is still "gen-lang-client...", Google will reject it! 
            // Real API keys almost always start with "AIza..."
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

            // Send the request using the current, active Gemini 2.5 Flash model
            $response = Http::withOptions(['verify' => false]) 
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
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

            // If Google rejects the API key or format, this catches it!
            return response()->json([
                'success' => false, 
                'error' => 'Google API Rejected the request: ' . $response->body()
            ], 200);

        } catch (\Exception $e) {
            // 🌟 IF LARAVEL CRASHES, THIS CATCHES IT AND TELLS YOU WHY! 🌟
            return response()->json([
                'success' => false, 
                'error' => 'Laravel Crash: ' . $e->getMessage() . ' on line ' . $e->getLine()
            ], 200);
        }
    }
}