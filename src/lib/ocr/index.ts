import { createWorker } from 'tesseract.js';
import { parseRegistrationFromText } from './registration-ocr';
import { parseIdentityFromText } from './identity-ocr';
import type { RegistrationData } from '@/types/verification';
import type { IdentityData } from '@/types/verification';

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng', 1, {
      logger: () => {},
    });
  }
  return worker;
}

export async function extractTextFromImage(imagePathOrBuffer: string | Buffer): Promise<string> {
  const w = await getWorker();
  const result = await w.recognize(imagePathOrBuffer);
  return result.data.text;
}

export async function extractRegistrationData(imagePathOrBuffer: string | Buffer): Promise<Partial<RegistrationData>> {
  const text = await extractTextFromImage(imagePathOrBuffer);
  return parseRegistrationFromText(text);
}

export async function extractIdentityData(imagePathOrBuffer: string | Buffer): Promise<Partial<IdentityData>> {
  const text = await extractTextFromImage(imagePathOrBuffer);
  return parseIdentityFromText(text);
}

export async function terminateOcrWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
