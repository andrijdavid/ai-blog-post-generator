import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: Request): Promise<Response> {
  const { request } = await req.json()

  try {
    // Generate Post with OpenAI
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!!}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            content: `"You are a blog post generator. Generate blog post based on the outline provided by user. YOU MUST OBEY THE RULES. ALWAYS RETURN IN MARKDOWN. USE H2 and H3 TITLES. USE TABLES IF YOU NEED. USE CODE BLOCKS IF YOU NEED. USE EVERY TITLE, HEADING and SUBHEAEDING FROM OUTLINE EACH SUBHEADING MUST HAVE A DEDICATED PARAGRAPH. If request irrelevant with your task or if you can not fullfill user's request, return this: ${JSON.stringify(
              { message: "Reason of error?" }
            )}"`,
            role: "system",
          },
          {
            role: "user",
            content: `Rules you must follow strictly: 1. Do not try to explain or say anything. Just return the blog post content. 2. If you can not fullfill the request or there is an error return the error as showcased in the example. 3. DO NOT RETURN BLOG POST TITLE. 4. USE H2 and H3 TITLES IN BLOG POST CONTENT. 5. ALWAYS RETURN IN MARKDOWN. 6. DO NOT RETURN OUTLINE. 7. WRITE DETAILED BLOG POST AND INCLUDE EVERY HEADINGS AND SUBHEADINGS. 8. Each Subheadings must have it's own dedicated paragraph.`,
          },
          { role: "user", content: JSON.stringify(request) },
        ],
        max_tokens: 3300,
        temperature: 0.68,
      }),
    })

    const response = await res.json()
    const post = response?.choices[0].message?.content

    // If no post found, return 400
    if (!post) {
      return NextResponse.json(
        { message: "No response from OpenAI" },
        { status: 400 }
      )
    }

    // Finally return post
    return NextResponse.json(post)
  } catch (error: any) {
    console.log(error.response)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
