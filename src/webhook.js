import { log } from "./utils/log.js";
import "dotenv/config";

const webhookUrl = process.env.WEBHOOK_URL;
const maxImagesPerWebhookMessage = 4;

function sendViaWebhook(imageUrls) {
	const body = {
		content: imageUrls.join('\n'),
	};

	fetch(webhookUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

const validImageUrls = [];
export function addToValidImagePool(imageUrl) {
	validImageUrls.push(imageUrl);

	const collection = `[${validImageUrls.length}/${maxImagesPerWebhookMessage}]`;
	log('green', `Found image: ${imageUrl} ${collection}`);

	if (validImageUrls.length === maxImagesPerWebhookMessage) {
		sendViaWebhook(validImageUrls);
		validImageUrls.length = 0;
	}
}
