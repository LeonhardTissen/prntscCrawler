const { Image } = require('canvas');
require('dotenv').config();

const urlChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
const urlCharLength = 6;
const maxImagesPerWebhookMessage = 4;
const webhookUrl = process.env.WEBHOOK_URL;

const color = {
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	reset: '\x1b[0m',
};

function log(colorName, message) {
	console.log(`${color[colorName]}${message}${color.reset}`);
}

function choice(arr) {
	const randomIndex = Math.floor(Math.random() * arr.length);
	return arr[randomIndex];
}

function getRandomPrntScLink() {
	const baseUrl = 'https://prnt.sc/';
	const randomChars = Array.from({ length: urlCharLength }, () => choice(urlChars));
	return baseUrl + randomChars.join('');
}

// Imgur returns an image with dimensions 161x81 saying the image is not found
function is404Dimension(width, height) {
	return width === 161 && height === 81;
}

async function verifyImageDimensions(imageUrl) {
	const img = new Image();
	img.src = imageUrl;

	return new Promise((resolve) => {
		img.onload = () => {
			const { width, height } = img;
			resolve(
				width > 0 &&
				height > 0 &&
				!is404Dimension(width, height)
			);
		};
	});
}

async function verifyImageUrlResponse(imageUrl) {
	try {
		const response = await fetch(imageUrl);

		if (response.status !== 200) return false;

		const contentType = response.headers.get('content-type');
		if (contentType.startsWith('image')) {
			return verifyImageDimensions(imageUrl);
		}

		return true;
	} catch (error) {
		return false;
	}
}

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
