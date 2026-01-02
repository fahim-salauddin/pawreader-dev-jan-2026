"use client";

import { useState, useEffect } from "react";
import PsychicImageResult from "@/components/PsychicImageResult";

/* ======================================================
   LICENSE HELPERS
====================================================== */

function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("pawreader_license_key") !== null;
}

function saveLicenseKey(key: string): void {
  localStorage.setItem("pawreader_license_key", key.trim().toUpperCase());
  localStorage.setItem("pawreader_unlock_date", new Date().toISOString());
}

function validateLicenseKeyFormat(key: string): boolean {
  const normalized = key.trim().toUpperCase();
  const pattern = /^[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}$/;
  return pattern.test(normalized);
}

async function validateLicenseKey(
  key: string
): Promise<{ valid: boolean; error?: string }> {
  if (isUnlocked()) return { valid: true };

  if (!validateLicenseKeyFormat(key)) {
    return {
      valid: false,
      error: "Invalid license key format. Please check and try again."
    };
  }

  try {
    const response = await fetch("/api/verify-license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey: key.trim().toUpperCase()
      })
    });

    const data = await response.json();
    console.log("VERIFY LICENSE RESPONSE:", data);

    if (data.success === true) {
      return { valid: true };
    }

    return {
      valid: false,
      error: data.error || "License key invalid."
    };
  } catch (err) {
    console.error("License verification error:", err);
    return {
      valid: false,
      error: "Verification failed. Please try again."
    };
  }
}

/* ======================================================
   USAGE LIMITING
====================================================== */

function checkUsageLimit() {
  if (isUnlocked()) {
    return { canUse: true, remaining: "unlimited", isPremium: true };
  }

  const today = new Date().toDateString();
  const stored = localStorage.getItem("pawreader_usage");
  const FREE_DAILY_LIMIT = 3;

  if (!stored) {
    return { canUse: true, remaining: FREE_DAILY_LIMIT, isPremium: false };
  }

  const data = JSON.parse(stored);

  if (data.date !== today) {
    localStorage.setItem(
      "pawreader_usage",
      JSON.stringify({ date: today, count: 0 })
    );
    return { canUse: true, remaining: FREE_DAILY_LIMIT, isPremium: false };
  }

  const remaining = FREE_DAILY_LIMIT - data.count;
  return {
    canUse: remaining > 0,
    remaining: Math.max(0, remaining),
    isPremium: false
  };
}

function incrementUsage() {
  if (isUnlocked()) return;

  const today = new Date().toDateString();
  const stored = localStorage.getItem("pawreader_usage");

  if (!stored) {
    localStorage.setItem(
      "pawreader_usage",
      JSON.stringify({ date: today, count: 1 })
    );
    return;
  }

  const data = JSON.parse(stored);

  if (data.date !== today) {
    localStorage.setItem(
      "pawreader_usage",
      JSON.stringify({ date: today, count: 1 })
    );
  } else {
    data.count += 1;
    localStorage.setItem("pawreader_usage", JSON.stringify(data));
  }
}

/* ======================================================
   PAGE
====================================================== */

export default function HomePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | string>(3);
  const [isPremium, setIsPremium] = useState(false);

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const { remaining, isPremium } = checkUsageLimit();
    setRemaining(remaining);
    setIsPremium(isPremium);
  }, []);

  const handleImageChange = (file: File) => {
    setError("");
    setResultText("");
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const readMyMind = async () => {
    if (!imageFile) return;

    const { canUse } = checkUsageLimit();
    if (!canUse) {
      setError("Daily limit reached (3/3 used). Upgrade for unlimited readings!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch("/api/psychic", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResultText(data.text);
      incrementUsage();

      const updated = checkUsageLimit();
      setRemaining(updated.remaining);
      setIsPremium(updated.isPremium);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setUnlockError("");
    setVerifying(true);

    const result = await validateLicenseKey(licenseKey);

    if (result.valid) {
      saveLicenseKey(licenseKey);
      setIsPremium(true);
      setRemaining("unlimited");
      setShowUnlockModal(false);
      setLicenseKey("");
      alert("🎉 Premium unlocked!");
    } else {
      setUnlockError(result.error || "Invalid license key.");
    }

    setVerifying(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-4">
      {/* TITLE */}
      <h1 className="text-6xl font-bold mb-2 text-center">
        🐱🐶 Paw Reader 🐾🔮
      </h1>
      <p className="text-2xl mb-8 text-center">
        Upload a photo and discover what your pet is <i>really</i> thinking
      </p>

      {/* STATUS */}
      {isPremium ? (
        <div className="mb-4 px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
          ⭐ Premium – Unlimited Readings
        </div>
      ) : (
        <div className="mb-4 px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-500/50">
          Free readings today: {remaining}/3 remaining
        </div>
      )}

      {!isPremium && (
        <button
          onClick={() => setShowUnlockModal(true)}
          className="mb-6 text-sm text-purple-400 hover:text-purple-300 underline"
        >
          Already purchased? Enter license key
        </button>
      )}

      {/* UPLOAD */}
      {!imageUrl && (
        <label className="w-full max-w-md h-64 border-2 border-dashed border-neutral-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files && handleImageChange(e.target.files[0])
            }
          />
          <span className="text-neutral-400">
            Click to upload or take a photo
          </span>
        </label>
      )}

      {/* ACTIONS */}
      {imageUrl && !resultText && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={readMyMind}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold transition"
          >
            Read My Mind 🧠
          </button>

          <button
            onClick={() => {
              setImageFile(null);
              setImageUrl(null);
              setResultText("");
              setError("");
            }}
            className="px-6 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-semibold transition"
          >
            Reset
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="mt-8 text-purple-400 animate-pulse text-lg">
          🔮 Consulting the psychic realm...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-6 text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>

          {error.includes("Daily limit reached") && (
            <div className="space-y-3">
              <a
                href="https://fahimprince8.gumroad.com/l/pawreader-premium"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 font-semibold"
              >
                Get Premium – $6.99 (Lifetime)
              </a>

              <button
                onClick={() => setShowUnlockModal(true)}
                className="block w-full px-6 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-semibold"
              >
                I have an unlock code
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESULT */}
      {imageUrl && resultText && (
        <div className="mt-10">
          <PsychicImageResult
            imageUrl={imageUrl}
            text={resultText}
            isPremium={isPremium}
          />
        </div>
      )}

      {/* PRIVACY */}
      {!resultText && (
        <footer className="absolute bottom-4 text-center text-neutral-500 text-sm">
          <a href="/privacy" className="hover:text-purple-400 transition">
            Privacy Policy
          </a>
        </footer>
      )}

      {/* UNLOCK MODAL */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className="bg-neutral-900 rounded-xl p-6 max-w-md w-full border border-purple-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Enter License Key</h2>

            <input
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-700 mb-4 font-mono text-sm"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              disabled={verifying}
            />

            {unlockError && (
              <p className="text-red-400 text-sm mb-4">{unlockError}</p>
            )}

            <button
              onClick={handleUnlock}
              disabled={verifying || !licenseKey.trim()}
              className="w-full px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold"
            >
              {verifying ? "Verifying..." : "Unlock Premium"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
