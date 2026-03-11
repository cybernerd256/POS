import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { products } = body;

        if (!Array.isArray(products)) {
            return NextResponse.json({ error: "Invalid payload. Expected an array of products." }, { status: 400 });
        }

        // Simulate an AI algorithm to predict restock needs based on current stock
        // Real implementation would pass this data to Gemini or OpenAI with a prompt
        const predictions = products
            .filter((p: { id: string; name: string; stock_quantity: number }) => p.stock_quantity <= 15) // Only predict for items somewhat low on stock
            .map((p: { id: string; name: string; stock_quantity: number }) => {
                let urgency = 'Low';
                let suggestedQuantity = 0;
                let reason = 'Stock is below optimal levels.';

                if (p.stock_quantity === 0) {
                    urgency = 'Critical';
                    suggestedQuantity = 50;
                    reason = 'Item is completely out of stock. Immediate action required to prevent lost sales.';
                } else if (p.stock_quantity <= 5) {
                    urgency = 'High';
                    suggestedQuantity = 30;
                    reason = 'Stock level is dangerously low. High risk of stockouts.';
                } else if (p.stock_quantity <= 15) {
                    urgency = 'Medium';
                    suggestedQuantity = 20;
                    reason = 'Stock is approaching reorder point. Consider ordering soon.';
                }

                return {
                    productId: p.id,
                    productName: p.name,
                    currentStock: p.stock_quantity,
                    suggestedQuantity,
                    urgency,
                    reason
                };
            });

        // Simulate some network delay to feel like a real AI call
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json({ predictions });

    } catch (error) {
        console.error("AI Restock Predictor Error:", error);
        return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 });
    }
}
