export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Paw Reader Privacy Policy (Australia)
        </h1>
        <div className="space-y-4 text-neutral-300">
          <p>
            <strong>1. Data Collection:</strong> We only access files that you
            manually select and upload. We do not use your camera live.
          </p>
          <p>
            <strong>2. Processing:</strong> Uploaded photos are sent via
            encrypted connection to Google Gemini 2.5 Flash. The AI "sees" the
            photo to generate the text and then the image.
          </p>
          <p>
            <strong>3. No Permanent Storage:</strong> We do not save your
            photos on our servers.  Once your "Psychic Reading" is generated, the photo exists only in your browser's temporary memory.
          </p>
          <p>
            <strong>4. Payments:</strong> Payment processing is handled by
            Stripe. We never see or store your credit card details.
          </p>
          {/* Add the rest of the policy points here as they are provided */}
        </div>
      </div>
    </main>
  );
}
