const webhookUrl = process.env.WEBHOOK_URL;

export function sendViaWebhook(imageUrls) {
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
