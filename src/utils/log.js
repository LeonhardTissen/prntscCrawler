const color = {
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	reset: '\x1b[0m',
};

export function log(colorName, message) {
	console.log(`${color[colorName]}${message}${color.reset}`);
}
