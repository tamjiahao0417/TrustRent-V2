<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    // Fetches properties for the auto-fill dropdown
    public function getLandlordProperties($landlordId)
    {
        $properties = Property::where('landlord_id', $landlordId)->get();
        return response()->json($properties);
    }

    // Connects to Gemini to get the AI Price Prediction
    public function estimatePrice(Request $request)
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

            $apiKey = "AIzaSyAfXyvd4AR1ztwzxEzCYWb5IPkGVzz--RY"; 

            $prompt = "You are an expert real estate appraiser in Malaysia. Analyze the following property and estimate a fair monthly rental price in RM (Malaysian Ringgit). 
            Property Details:
            - Type: " . $validated['type'] . "
            - Location: " . $validated['location'] . "
            - Size: " . $validated['size'] . " sqft
            - Bedrooms: " . $validated['rooms'] . "
            - Furnishing: " . $validated['furnishing'] . "
            - Features: " . ($validated['features'] ?? 'None') . "

            Based on the Malaysian property market, respond ONLY with a valid JSON object matching this exact structure:
            {
            \"price_range\": \"RM [Low] - RM [High] / month\",
            \"factors\": {
                \"location\": \"Explain why this specific location affects the price (1-2 sentences).\",
                \"size\": \"Explain how the size and bedroom count affect the price.\",
                \"features\": \"Explain how the furnishing and specific features add value.\",
                \"trends\": \"Provide a realistic 1-sentence market trend for this type of property.\"
            }
            }";

            $response = Http::withoutVerifying() 
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    "contents" => [["parts" => [["text" => $prompt]]]],
                    "generationConfig" => ["responseMimeType" => "application/json"]
                ]);

            if ($response->successful()) {
                $result = $response->json();
                $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
                $aiData = json_decode(trim($aiText), true);

                if ($aiData) {
                    return response()->json(['success' => true, 'data' => $aiData]);
                }
            }

            return response()->json(['success' => false, 'error' => 'API Error'], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 200);
        }
    }

    // 🌟 TENANT POV: Fetch ALL Properties in the system
    public function match(Request $request)
    {
        $request->validate([
            'budget_min' => 'required|numeric',
            'budget_max' => 'required|numeric',
            'location' => 'required|string',
        ]);

        try {
            // 🌟 GLOBAL SEARCH: Get EVERY unrented property in the entire system!
            $properties = Property::where(function ($query) {
                $query->where('is_rented', 0)
                      ->orWhereNull('is_rented');
            })->get(['id', 'title', 'price', 'location', 'rooms', 'address', 'description']);

            if ($properties->isEmpty()) {
                return response()->json(['matches' => []]);
            }

            $prompt = "You are an expert real estate AI matchmaker working for a TENANT. You will be given a Tenant's rental preferences and a list of available properties in the system. " .
                "Analyze the compatibility. Return a strict JSON object with a single key 'matches' containing an array of the top matching properties. " .
                "Each object must have three keys: 'id' (the integer ID of the property), 'match_score' (an integer from 0-100), and 'match_reasons'. " .
                "CRITICAL SCORING RULES: " .
                "1. BUDGET: If the property's 'price' falls anywhere between the tenant's 'budget_min' and 'budget_max', this is a major success. " .
                "2. LOCATION: Be flexible. If the tenant searches for 'Johor', a property located in 'Kulai, Johor' is a strong match. " .
                "3. If both the budget and location align, the 'match_score' MUST be between 85 and 100. " .
                "CRITICAL INSTRUCTION: The 'match_reasons' must be an array of 3 short sentences written DIRECTLY TO THE TENANT explaining why they should rent this property. " .
                "You MUST use phrasing like 'This property fits your budget of...', 'It features the [Amenity] you requested...', or 'The location perfectly matches your need for...'\n\n" .
                "Data to analyze:\n" .
                json_encode([
                    'user_preferences' => $request->all(),
                    'available_properties' => $properties->toArray()
                ]);

            $apiKey = "AIzaSyAfXyvd4AR1ztwzxEzCYWb5IPkGVzz--RY"; 

            $response = Http::withoutVerifying()
                ->timeout(60)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    "contents" => [["parts" => [["text" => $prompt]]]],
                    "generationConfig" => ["responseMimeType" => "application/json"]
                ]);

            if ($response->failed()) throw new \Exception('Gemini API Error: ' . $response->body());

            $result = $response->json();
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
            $aiResult = json_decode(trim($aiText), true);
            $aiMatches = $aiResult['matches'] ?? [];

            $finalMatches = [];
            foreach ($aiMatches as $aiMatch) {
                $realProperty = Property::find($aiMatch['id']);
                if ($realProperty) {
                    $realProperty->match_score = $aiMatch['match_score'];
                    $realProperty->match_reasons = $aiMatch['match_reasons'];
                    $finalMatches[] = $realProperty;
                }
            }

            usort($finalMatches, fn($a, $b) => $b->match_score <=> $a->match_score);
            return response()->json(['matches' => array_slice($finalMatches, 0, 10)]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 🌟 LANDLORD POV: Fetch ALL Tenants in the system
    public function matchTenants(Request $request)
    {
        try {
            // 🌟 GLOBAL SEARCH: Get EVERY tenant in the system who has saved their preferences!
            $tenants = User::where('role', 'tenant')
                ->whereNotNull('rental_preferences')
                ->where('rental_preferences', '!=', '')
                ->get(['id', 'name', 'email', 'rental_preferences']);

            if ($tenants->isEmpty()) {
                return response()->json(['matches' => []]);
            }

            $prompt = "You are an expert real estate AI matchmaker working for a LANDLORD. You will be given the Landlord's property details and a list of registered tenants in the system with their personal rental preferences. " .
                "Analyze the compatibility. Return a strict JSON object with a single key 'matches' containing an array of the top matched tenants. " .
                "Each object must have three keys: 'id' (the integer ID of the tenant), 'match_score' (an integer from 0-100), and 'match_reasons'. " .
                "CRITICAL INSTRUCTION: The 'match_reasons' must be an array of 3 short sentences written DIRECTLY TO THE LANDLORD explaining why they should accept this tenant. " .
                "You MUST use phrasing like 'This tenant's budget matches your...', 'They specifically requested...', or 'Their desire to live near [Location] aligns with your property.' Do NOT speak to the tenant.\n\n" .
                "Data to analyze:\n" .
                json_encode([
                    'landlord_property' => $request->all(),
                    'available_tenants' => $tenants->toArray()
                ]);

            $apiKey = "AIzaSyAfXyvd4AR1ztwzxEzCYWb5IPkGVzz--RY"; 

            $response = Http::withoutVerifying()
                ->timeout(60)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    "contents" => [["parts" => [["text" => $prompt]]]],
                    "generationConfig" => ["responseMimeType" => "application/json"]
                ]);

            if ($response->failed()) throw new \Exception('Gemini API Error: ' . $response->body());

            $result = $response->json();
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
            $aiResult = json_decode(trim($aiText), true);
            $aiMatches = $aiResult['matches'] ?? [];

            $finalMatches = [];
            foreach ($aiMatches as $aiMatch) {
                $realTenant = User::find($aiMatch['id']);
                if ($realTenant) {
                    $realTenant->match_score = $aiMatch['match_score'];
                    $realTenant->match_reasons = $aiMatch['match_reasons'];
                    $finalMatches[] = $realTenant;
                }
            }

            usort($finalMatches, fn($a, $b) => $b->match_score <=> $a->match_score);
            return response()->json(['matches' => array_slice($finalMatches, 0, 10)]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}