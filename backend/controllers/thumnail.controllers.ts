import { Request, Response } from "express"
import Thumbnail from "../models/Thumnail.js";
import { GenerateContentConfig, HarmCategory } from "@google/genai";
import { HarmBlockThreshold } from "@google/genai";
import ai from '../configs/AI.js'
import path from 'path'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'


const stylePrompts = {
    'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
}
const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
}
function getPublicIdFromUrl(url: string) {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    const publicPath = parts.slice(uploadIndex + 2).join("/"); // skip version
    return publicPath.replace(/\.[^/.]+$/, ""); // remove file extension
}

export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        const {
            title,
            prompt: user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay
        } = req.body;

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        })
        const model = 'imagen-4.0-generate-001';

        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: ${title}`;

        if (color_scheme) {
            prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme .`
        }
        if (user_prompt) {
            prompt += `Additional details: ${user_prompt}.`
        }
        prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`

        // Generate Img using AI model 
        const response: any = await ai.models.generateImages({
            model,
            prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspect_ratio || '16:9',
                outputMimeType: 'image/png'
            }
        })

        if (!response?.generatedImages?.[0]?.image?.imageBytes) {
            throw new Error('Unexpected response')
        }

        let finalBuffer = Buffer.from(response.generatedImages[0].image.imageBytes, 'base64');
        const filename = `final-output-${Date.now()}.png`
        const filePath = path.join('images', filename);

        // create the images directory if it doesn't exist 
        fs.mkdirSync('images', { recursive: true })

        // write the final image to the file
        fs.writeFileSync(filePath, finalBuffer!);

        const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'image' })

        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false
        await thumbnail.save()
        res.json({ message: 'Thumbnail Generated', thumbnail })


        // remove image file from disk
        fs.unlinkSync(filePath)
    } catch (error: any) {

        console.log(error)
        res.status(500).json({ message: error.message })
    }

}


export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;

        const thumbnail = await Thumbnail.findOne({ _id: id, userId })

        if (!thumbnail) {
            return res.status(404).json({ message: 'Thumbnail not found' })
        }

        const image_url = thumbnail.image_url

        if (image_url) {
            const publicId = getPublicIdFromUrl(image_url);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await Thumbnail.deleteOne({ _id: id })

        res.json({ message: 'Thumbnail deleted successfully' })

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}