<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Property;
use Illuminate\Support\Facades\Log;

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
            $apiKey = "AIzaSyAQrHK4_VuE8Oc8HpBPKVXz4KV4mAP6CRY"; 

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

    public function match(Request $request)
    {
        // 1. Validate the user's input
        $request->validate([
            'budget_min' => 'required|numeric',
            'budget_max' => 'required|numeric',
            'location' => 'required|string',
        ]);

        try {
            // 2. Fetch all available properties from your database
            $properties = Property::get(['id', 'title', 'price', 'address', 'description']);

            if ($properties->isEmpty()) {
                return response()->json(['matches' => []]);
            }

            // 3. Construct the Prompt for Gemini
            $prompt = "You are an expert real estate AI matchmaker. You will be given a user's rental preferences and a list of available properties. " .
                "Analyze the semantic meaning of the descriptions, features, and locations. " .
                "Return a strict JSON object with a single key 'matches'. This key must contain an array of objects representing the top matches. " .
                "Each object must have exactly three keys: 'id' (the integer ID of the property), 'match_score' (an integer from 0-100), and 'match_reasons' (an array of 3 short, personalized string sentences explaining exactly why this property fits their specific lifestyle/prompt).\n\n" .
                "Data to analyze:\n" .
                json_encode([
                    'user_preferences' => $request->all(),
                    'available_properties' => $properties->toArray()
                ]);

            // 4. Use your existing Gemini API Key
            $apiKey = "AIzaSyAQrHK4_VuE8Oc8HpBPKVXz4KV4mAP6CRY"; 

            // 5. Call the Google Gemini API (with SSL verification bypassed for local testing)
            $response = Http::withoutVerifying()
                ->timeout(60)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    "contents" => [["parts" => [["text" => $prompt]]]],
                    "generationConfig" => ["responseMimeType" => "application/json"]
                ]);

            if ($response->failed()) {
                throw new \Exception('Gemini API Error: ' . $response->body());
            }

            // 6. Decode Gemini's response
            $result = $response->json();
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
            
            // Clean up Markdown (just in case Gemini includes ```json)
            $aiText = str_replace(['```json', '```'], '', $aiText); 
            $aiResult = json_decode(trim($aiText), true);
            
            $aiMatches = $aiResult['matches'] ?? [];

            // 7. Map the AI's suggested IDs back to your FULL database records
            $finalMatches = [];
            foreach ($aiMatches as $aiMatch) {
                // Find the real property in our database
                $realProperty = Property::find($aiMatch['id']);
                
                if ($realProperty) {
                    // Inject the AI's custom score and reasons into the model temporarily
                    $realProperty->match_score = $aiMatch['match_score'];
                    $realProperty->match_reasons = $aiMatch['match_reasons'];
                    $finalMatches[] = $realProperty;
                }
            }

            // Sort them by the AI's score, highest first
            usort($finalMatches, function ($a, $b) {
                return $b->match_score <=> $a->match_score;
            });

            // 8. Return exactly what Angular is expecting!
            return response()->json(['matches' => array_slice($finalMatches, 0, 10)]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'AI Matching Engine is temporarily unavailable. Error: ' . $e->getMessage() . ' on line ' . $e->getLine()
            ], 500);
        }
    }

    public function matchTenants(Request $request)
    {
        // 1. Validate the Landlord's property details
        $request->validate([
            'price' => 'required|numeric',
            'location' => 'required|string',
        ]);

        try {
            // 2. Fetch all available Tenants from your database
            // 🌟 NOTE: We only fetch 'id', 'name', and 'email' to prevent SQL crashes. 
            // If your users table has columns for 'budget' or 'preferences', add them to this array!
            $tenants = \App\Models\User::where('role', 'tenant')
                ->get(['id', 'name', 'email']);

            if ($tenants->isEmpty()) {
                return response()->json(['matches' => []]);
            }

            // 3. Construct the Prompt for Gemini
            $prompt = "You are an expert real estate AI matchmaker. You will be given a landlord's property details and a list of registered tenants. " .
                "Analyze the compatibility between what the property offers and what a tenant might need. " .
                "Return a strict JSON object with a single key 'matches'. This key must contain an array of objects representing the top matched tenants. " .
                "Each object must have exactly three keys: 'id' (the integer ID of the tenant), 'match_score' (an integer from 0-100), and 'match_reasons' (an array of 3 short, personalized string sentences explaining exactly why this tenant is a great fit for this specific property).\n\n" .
                "Data to analyze:\n" .
                json_encode([
                    'landlord_property' => $request->all(),
                    'available_tenants' => $tenants->toArray()
                ]);

            $apiKey = "AIzaSyAQrHK4_VuE8Oc8HpBPKVXz4KV4mAP6CRY"; 

            // 4. Call the Google Gemini API
            $response = Http::withoutVerifying()
                ->timeout(60)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    "contents" => [["parts" => [["text" => $prompt]]]],
                    "generationConfig" => ["responseMimeType" => "application/json"]
                ]);

            if ($response->failed()) {
                throw new \Exception('Gemini API Error: ' . $response->body());
            }

            // 5. Decode Gemini's response
            $result = $response->json();
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
            $aiText = str_replace(['```json', '```'], '', $aiText); 
            $aiResult = json_decode(trim($aiText), true);
            
            $aiMatches = $aiResult['matches'] ?? [];

            // 6. Map the AI's suggested IDs back to your FULL User database records
            $finalMatches = [];
            foreach ($aiMatches as $aiMatch) {
                $realTenant = \App\Models\User::find($aiMatch['id']);
                
                if ($realTenant) {
                    $realTenant->match_score = $aiMatch['match_score'];
                    $realTenant->match_reasons = $aiMatch['match_reasons'];
                    $finalMatches[] = $realTenant;
                }
            }

            // Sort them by highest score
            usort($finalMatches, function ($a, $b) {
                return $b->match_score <=> $a->match_score;
            });

            return response()->json(['matches' => array_slice($finalMatches, 0, 10)]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'AI Matching Engine is temporarily unavailable. Error: ' . $e->getMessage()
            ], 500);
        }
    }
}