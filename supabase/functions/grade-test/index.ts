import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { attemptId, userAnswers, durationSeconds, proctoringRiskScore } = await req.json();

    if (!attemptId || !userAnswers) {
      return new Response(
        JSON.stringify({ error: 'Missing attemptId or userAnswers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Initialize Supabase admin client for secure server-side grading
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch official questions and correct answers for this attempt
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('test_attempts')
      .select('test_id, user_id, tests(title, track_id, passing_score)')
      .eq('id', attemptId)
      .single();

    let correctCount = 0;
    const totalCount = Object.keys(userAnswers).length;
    const topicStats: Record<string, { correct: number; total: number }> = {};

    // Evaluate answers
    for (const [qId, selectedOptionId] of Object.entries(userAnswers)) {
      const { data: q } = await supabaseAdmin
        .from('questions')
        .select('correct_answers, topic')
        .eq('id', qId)
        .single();

      const topic = q?.topic || 'General';
      if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
      topicStats[topic].total++;

      const isCorrect = Array.isArray(q?.correct_answers)
        ? q.correct_answers.includes(selectedOptionId)
        : q?.correct_answers === selectedOptionId;

      if (isCorrect) {
        correctCount++;
        topicStats[topic].correct++;
      }
    }

    const percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    const roundedScore = Math.round(percentage * 10) / 10;

    // Grade Band Matrix
    let gradeBand = 'F';
    if (roundedScore >= 90) gradeBand = 'A+';
    else if (roundedScore >= 80) gradeBand = 'A';
    else if (roundedScore >= 70) gradeBand = 'B';
    else if (roundedScore >= 60) gradeBand = 'C';
    else if (roundedScore >= 50) gradeBand = 'D';

    // Proctoring Status Determination
    const risk = Number(proctoringRiskScore) || 0;
    let proctoringStatus = 'clean';
    if (risk >= 60) proctoringStatus = 'flagged';
    else if (risk >= 30) proctoringStatus = 'needs_review';

    // Strengths & Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    for (const [topic, stat] of Object.entries(topicStats)) {
      const topicRatio = stat.correct / stat.total;
      if (topicRatio >= 0.75) strengths.push(topic);
      else weaknesses.push(topic);
    }

    // Update attempt row in database
    await supabaseAdmin
      .from('test_attempts')
      .update({
        status: 'completed',
        score_percentage: roundedScore,
        grade_band: gradeBand,
        correct_answers_count: correctCount,
        total_questions: totalCount,
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds || 0,
        topic_breakdown: topicStats,
        strengths,
        weaknesses,
        proctoring_risk_score: risk,
        proctoring_status: proctoringStatus,
      })
      .eq('id', attemptId);

    return new Response(
      JSON.stringify({
        scorePercentage: roundedScore,
        gradeBand,
        correctAnswersCount: correctCount,
        totalQuestions: totalCount,
        proctoringRiskScore: risk,
        proctoringStatus,
        strengths,
        weaknesses,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Grading failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
