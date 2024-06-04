import { log } from './utils/log.js';
import { addToValidImagePool } from './webhook.js';
import { getImageUrlFromHtml, verifyImageUrlResponse } from './image.js';
import { getRandomPrntScLink } from './prntsc.js';

async function main() {
	while (true) {
		const randomPrntScLink = getRandomPrntScLink();
		log('yellow', `Checking ${randomPrntScLink}...`);

		const response = await fetch(randomPrntScLink);

		const html = await response.text();

		const imageUrl = getImageUrlFromHtml(html, randomPrntScLink);

		if (!imageUrl) {
			log('red', 'No image found!');
			continue;
		}

		const isValidImage = await verifyImageUrlResponse(imageUrl);

		if (!isValidImage) {
			log('red', 'Invalid image!');
			continue;
		}

		addToValidImagePool(randomPrntScLink);
	}
}

main();
