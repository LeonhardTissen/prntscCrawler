import { log } from './utils/log.js';
import { sendViaWebhook } from './webhook.js';
import { verifyImageUrlResponse } from './image.js';
import { getRandomPrntScLink } from './prntsc.js';

const maxImagesPerWebhookMessage = 4;

async function main() {
	const imageUrls = [];

	while (true) {
		const randomPrntScLink = getRandomPrntScLink();
		log('yellow', `Checking ${randomPrntScLink}...`);

		const response = await fetch(randomPrntScLink);

		const text = await response.text();

		// Search for image tags
		const imageRegex = /<img[^>]*src="([^"]+)"/g;

		const matches = text.matchAll(imageRegex);

		let imageUrl = null;

		for (const match of matches) {
			const src = match[1];

			// Filter out wrong images
			if (src.includes('footer') || src === randomPrntScLink) continue;

			imageUrl = src;
		}

		if (!imageUrl) {
			log('red', 'No image found!');
			continue;
		}

		const isValidImage = await verifyImageUrlResponse(imageUrl);

		if (!isValidImage) {
			log('red', 'Invalid image!');
			continue;
		}

		imageUrls.push(randomPrntScLink);

		const collection = `[${imageUrls.length}/${maxImagesPerWebhookMessage}]`;
		log('green', `Found image: ${imageUrl} ${collection}`);

		if (imageUrls.length === maxImagesPerWebhookMessage) {
			sendViaWebhook(imageUrls);
			imageUrls.length = 0;
		}
	}
}

main();
