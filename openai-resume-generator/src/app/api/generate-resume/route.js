// app/api/generate-resume/route.js
import OpenAI from "openai";

export async function POST(request) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription || !jobDescription.trim()) {
      return new Response(JSON.stringify({ error: "jobDescription required" }), { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return new Response(JSON.stringify({ error: "Server missing API key" }), { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // change to model you have access to
      messages: [
        {
          role: "user",
          content: `Create a concise, professional software developer resume tailored to this job description:\n\n${jobDescription}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const resume = completion.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ resume }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-resume error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
