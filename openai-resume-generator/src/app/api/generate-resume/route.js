import { InferenceClient } from "@huggingface/inference";
import resume from "@/data/resume.json";


export async function POST(req) {
  const body = await req.json();
  const { jobDescription } = body || {};
  // console.log()
   const jsonPrompt = `
You are an expert resume writer. Output ONLY valid JSON (no extra text). The JSON must be an object with keys: "Name", "Contact", "Summary", "Skills", "Experience", "Education".
Example:
${JSON.stringify(resume)}
Create the JSON resume for this job description: 
${jobDescription}
`;

  if (!jobDescription || !jobDescription.trim()) {
    return new Response(JSON.stringify({ error: 'jobDescription required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const client = new InferenceClient(process.env.HF_API_KEY);

  const chatCompletion = await client.chatCompletion({
    model: "meta-llama/Llama-3.2-1B-Instruct:novita",
    messages: [
      {
        role: "user",
        content: jsonPrompt,
      },
    ],
  });
  // console.log('chatCompletion?.choices?.[0]?.message', chatCompletion?.choices?.[0]?.message?.content );
  
  console.log('chatCompletion.choices[0].message JSON', JSON.parse(chatCompletion?.choices?.[0]?.message?.content));
  return new Response(JSON.stringify({ resume: chatCompletion?.choices?.[0]?.message  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}


// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { jobDescription } = body || {};

//     if (!jobDescription || !jobDescription.trim()) {
//       return new Response(JSON.stringify({ error: 'jobDescription required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
//     }

//     // Build a strict JSON-only prompt
//     const jsonPrompt = `
// You are an expert resume writer. Output ONLY valid JSON (no extra text). The JSON must be an object with keys: "Name", "Contact", "Summary", "Skills", "Experience", "Education".
// Example:
// {
//   "Name": "John Doe",
//   "Contact": { "email": "john@example.com", "phone": "+1 555 5555", "linkedin": "https://linkedin.com/in/johndoe" },
//   "Summary": "One-line summary...",
//   "Skills": ["JavaScript","React","Node.js"],
//   "Experience": [{ "title":"Senior Dev", "company":"Acme", "period":"2020-2024", "bullets":["Did X","Did Y"] }],
//   "Education": ["BSc Computer Science"]
// }
// Create the JSON resume for this job description: 
// ${jobDescription}
// `;

//     // initialize your client (keep as you already have)
//     const client = new InferenceClient(process.env.HF_API_KEY);

//     const chatCompletion = await client.chatCompletion({
//       model: process.env.HF_MODEL || "meta-llama/Llama-3.2-1B-Instruct:novita",
//       messages: [{ role: 'user', content: jsonPrompt }],
//       // add other options if your client supports them
//     });

//     // pull assistant content (based on your shown response shape)
//     const message = chatCompletion?.choices?.[0]?.message?.content;
//     return new Response(JSON.stringify({ resume: message }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//     // message may be a string or object depending on provider
//     const text = typeof message === 'string' ? message : (message?.text || JSON.stringify(message));

//     // helper: try JSON.parse
//     const tryParseJSON = (s) => {
//       try {
//         return JSON.parse(s);
//       } catch (e) {
//         return null;
//       }
//     };

//     // 1) direct parse
//     let parsed = tryParseJSON(text);
//     if (!parsed) {
//       // 2) try to extract a JSON block between ```json ... ``` or { ... }
//       const jsonBlockMatch = text.match(/```json\\s*([\\s\\S]*?)\\s*```/) || text.match(/({[\\s\\S]*})/);
//       if (jsonBlockMatch) {
//         parsed = tryParseJSON(jsonBlockMatch[1]);
//       }
//     }

//     if (!parsed) {
//       // 3) fallback: simple markdown/asterisk extractor for "**Key:** value" or "**Key:**\\nvalue" patterns
//       const fallback = {};
//       const sections = ['Name', 'Contact', 'Summary', 'Skills', 'Experience', 'Education'];
//       for (const sec of sections) {
//         const re = new RegExp(`\\*\\*${sec}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*\\w+:\\*\\*|$)`, 'i');
//         const m = text.match(re);
//         if (m) {
//           let val = m[1].trim();
//           // Post-process for Skills -> array
//           if (sec === 'Skills') {
//             // split by commas or newlines, remove bullets/asterisks
//             val = val.replace(/^[\\-\\*\\s]*/gm, '').replace(/\\s+$/, '');
//             const arr = val.split(/,|\\n|\\r/).map(s => s.trim()).filter(Boolean);
//             fallback[sec] = arr;
//             continue;
//           }
//           // Experience -> try to split into bullets array
//           if (sec === 'Experience') {
//             const bullets = val.split(/\\n\\s*\\*\\s*|\\n\\s*\\-\\s*|\\n\\s*/).map(s => s.trim()).filter(Boolean);
//             fallback[sec] = bullets;
//             continue;
//           }
//           // Contact: try to parse email/phone/linkedin lines
//           if (sec === 'Contact') {
//             const contactObj = {};
//             const lines = val.split(/\\n|\\r/).map(l => l.trim()).filter(Boolean);
//             for (const line of lines) {
//               const emailMatch = line.match(/([\\w.+-]+@[\\w.-]+\\.[\\w.-]+)/);
//               if (emailMatch) contactObj.email = emailMatch[1];
//               const phoneMatch = line.match(/(\\+?\\d[\\d\\s-().]{6,}\\d)/);
//               if (phoneMatch && !contactObj.phone) contactObj.phone = phoneMatch[1];
//               // const urlMatch = line.match(/https?:\\/\\/[\\S]+/);
//               const urlMatch = "";
//               if (urlMatch) {
//                 const u = urlMatch[0];
//                 if (u.includes('linkedin')) contactObj.linkedin = u;
//                 else if (u.includes('github')) contactObj.github = u;
//                 else contactObj.website = u;
//               }
//             }
//             fallback[sec] = contactObj;
//             continue;
//           }

//           fallback[sec] = val;
//         }
//       }
//       parsed = fallback;
//     }

//     // Ensure parsed has the expected keys (fill missing with empty)
//     const final = {
//       Name: parsed?.Name || parsed?.name || '',
//       Contact: parsed?.Contact || parsed?.contact || {},
//       Summary: parsed?.Summary || parsed?.summary || '',
//       Skills: parsed?.Skills || parsed?.skills || [],
//       Experience: parsed?.Experience || parsed?.experience || [],
//       Education: parsed?.Education || parsed?.education || [],
//     };

//     return new Response(JSON.stringify({ resume: final }), { status: 200, headers: { 'Content-Type': 'application/json' } });

//   } catch (err) {
//     console.error('Unexpected handler error:', err);
//     return new Response(JSON.stringify({ error: 'Internal server error', detail: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
//   }
// }