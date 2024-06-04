import { Image } from 'canvas';

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

export async function verifyImageUrlResponse(imageUrl) {
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
