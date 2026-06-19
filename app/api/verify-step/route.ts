import { verifyRepairStep } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    imageBase64?: string;
    mediaType?: string;
    itemName?: string;
    currentStep?: string;
    stepIndex?: number;
    totalSteps?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    imageBase64 = "",
    mediaType = "image/jpeg",
    itemName = "your item",
    currentStep = "",
    stepIndex = 0,
    totalSteps = 1,
  } = body;

  const result = await verifyRepairStep({
    imageBase64,
    mediaType,
    itemName,
    currentStep,
    stepIndex,
    totalSteps,
  });

  return Response.json({ result });
}
