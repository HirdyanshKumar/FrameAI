import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 9,
        period: "month",
        features: [
            "25 AI thumbnail generations",
            "Basic Template Library",
            "Standard Resolution",
            "No Watermark",
            "Email support"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 21,
        period: "month",
        features: [
            "Unlimited generations",
            "Premium Template Library",
            "4K Resolution",
            "A/B Testing",
            "Priority Email support",
            "Custom Fonts & Colors",
            "Brand Kit Analytics"
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 51,
        period: "month",
        features: [
            "Everything in Pro",
            "API Access",
            "Team Collaboration",
            "Custom Branding",
            "Dedicated Account Manager",
        ],
        mostPopular: false
    }
];