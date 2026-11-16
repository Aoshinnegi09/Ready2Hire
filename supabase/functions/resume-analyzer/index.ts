import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescriptionText, requiredSkills, requiredYears } = await req.json();

    if (!resumeText || !jobDescriptionText) {
      return new Response(
        JSON.stringify({ error: 'Missing resumeText or jobDescriptionText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Standard 5-Agent Evaluation Logic
    const lowerResume = resumeText.toLowerCase();
    const lowerJd = jobDescriptionText.toLowerCase();

    // 1. Parser extraction
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const hasDegree = /b\.?tech|bachelor|computer science|engineering/i.test(resumeText);
    const parserScore = (emailMatch ? 30 : 0) + (hasDegree ? 30 : 10) + 40;

    // 2. Skills Matcher
    const skillsList = requiredSkills || ['react', 'typescript', 'node.js', 'sql', 'python', 'docker'];
    const matched = skillsList.filter((s: string) => lowerResume.includes(s.toLowerCase()));
    const missing = skillsList.filter((s: string) => !lowerResume.includes(s.toLowerCase()));
    const skillsScore = Math.round((matched.length / Math.max(1, skillsList.length)) * 100);

    // 3. Experience Evaluator
    const expScore = lowerResume.includes('experience') || lowerResume.includes('internship') ? 85 : 65;

    // 4. ATS Checker
    const hasStructure = ['education', 'skills', 'experience', 'projects'].filter((sec) => lowerResume.includes(sec));
    const atsScore = Math.round((hasStructure.length / 4) * 100);

    // 5. Final Scorer
    const overallScore = Math.round(
      parserScore * 0.10 + skillsScore * 0.45 + expScore * 0.25 + atsScore * 0.20
    );

    const result = {
      overallScore,
      summary: `Candidate achieved ${overallScore}% alignment with ${matched.length} verified matching skillsets.`,
      breakdown: {
        parserScore,
        skillsScore,
        experienceScore: expScore,
        atsScore,
      },
      matchedSkills: matched,
      missingSkills: missing,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
