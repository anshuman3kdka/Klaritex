import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.Klaritex;

if (!apiKey) {
  throw new Error(
    "Missing environment variable 'Klaritex'. Set it before using the Google Generative AI SDK."
  );
}

export const genAI = new GoogleGenerativeAI(apiKey);
