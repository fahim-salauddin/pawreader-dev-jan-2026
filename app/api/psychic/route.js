import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt =
      "Act as a pet psychic. Analyze this animal's expression and body language. " +
      "Output a single, funny, first-person thought that the animal is thinking. " +
      "Keep it under 20 words. Be sarcastic or dramatic.";

    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type || 'image/jpeg',
        },
      },
      prompt,
    ]);

    return NextResponse.json({
      text: response.response.text().trim(),
    });
  } catch (err) {
    console.error('Psychic API error:', err);
    return NextResponse.json(
      { error: 'Failed to read pet thoughts 🐾' },
      { status: 500 }
    );
  }
}
