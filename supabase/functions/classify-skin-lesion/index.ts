import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Processing skin lesion classification...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI for image analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert dermatology AI assistant specializing in skin lesion classification. 
            Analyze the provided dermoscopic or clinical image and classify it into one of these categories:
            - Melanoma (MEL): Malignant melanoma
            - Basal Cell Carcinoma (BCC): Common skin cancer
            - Actinic Keratosis (AK): Precancerous lesion
            - Benign Keratosis (BKL): Non-cancerous growth
            - Dermatofibroma (DF): Benign fibrous tissue growth
            - Melanocytic Nevus (NV): Common mole
            - Vascular Lesion (VASC): Blood vessel abnormality
            
            Respond in JSON format with:
            {
              "classification": "category abbreviation",
              "classification_full": "full category name",
              "confidence": number between 0-100,
              "description": "brief description of findings",
              "characteristics": ["key visual features observed"],
              "recommendation": "suggested next steps"
            }
            
            Be professional and emphasize this is for educational purposes only.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this skin lesion image and provide a classification.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    console.log('AI response received');

    const aiResponse = aiData.choices[0].message.content;
    
    // Parse JSON response
    let classificationResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      classificationResult = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Fallback if parsing fails
      classificationResult = {
        classification: 'NV',
        classification_full: 'Analysis pending',
        confidence: 0,
        description: aiResponse.substring(0, 200),
        characteristics: ['Image analyzed'],
        recommendation: 'Manual review recommended'
      };
    }

    // Store result in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: dbResult, error: dbError } = await supabase
      .from('classifications')
      .insert({
        image_url: 'uploaded_image',
        classification_type: classificationResult.classification_full || classificationResult.classification,
        confidence_score: classificationResult.confidence || 0,
        details: classificationResult
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB save fails
    } else {
      console.log('Classification saved to database');
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: classificationResult,
        id: dbResult?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in classify-skin-lesion:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
