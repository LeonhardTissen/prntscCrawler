import { choice } from './utils/random.js';

const urlChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
const urlCharLength = 6;

export function getRandomPrntScLink() {
	const baseUrl = 'https://prnt.sc/';
	const randomChars = Array.from({ length: urlCharLength }, () => choice(urlChars));
	return baseUrl + randomChars.join('');
}
