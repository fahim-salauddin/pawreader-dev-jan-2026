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
      model: 'gemini-2.5-flash',
      systemInstruction: "You are 'The Oracle of Paws', an arrogant, intellectual pet psychic roasting the owner based on photo details. Speak as the pet. 20 words max. One emoji.",
    generationConfig: {
        temperature: 1.0, // Higher = more unpredictable and funny
        topP: 0.95,
    }
    });

    const prompt =
      "Channel your inner pet psychic and decode this furry friend's vibe from its expression, pose, environment and surroundings. " +
      "Spit out one hilariously sassy, first-person thought it's pondering—under 20 words. " +
      "Amp up the sarcasm, drama, or whimsy for maximum LOLs!";

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
