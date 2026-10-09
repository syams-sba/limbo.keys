const startBtn = document.getElementById('start-button');
const audio = document.getElementById('limbo-audio');
const container = document.getElementsByClassName('container')[0];
const keys = document.getElementsByClassName('key');
const wrong = document.getElementById('wrong');
const correct = document.getElementById('correct');
const linkGenerator = document.getElementById('link-generator');
const generatorForm = document.getElementById('generator-form');
const destinationInput = document.getElementById('destination-input');
const customIdInput = document.getElementById('custom-id-input');
const pageTitleInput = document.getElementById('page-title-input');
const buttonTextInput = document.getElementById('button-text-input');
const showHintInput = document.getElementById('show-hint-input');
const formStatus = document.getElementById('form-status');
const generatedLink = document.getElementById('generated-link');
const linkOutput = document.getElementById('link-output');
const copyLink = document.getElementById('copy-link');
const copyStatus = document.getElementById('copy-status');
const linkTitle = document.getElementById('link-title');
const challengeHint = document.getElementById('challenge-hint');
const createOwnLink = document.getElementById('create-own-link');
let challengeInProgress = false;

function isTargetPage() {
	const hashParameters = new URLSearchParams(window.location.hash.slice(1));
	const pathname = window.location.pathname;
	return Boolean(
		new URLSearchParams(window.location.search).get('target') ||
		new URLSearchParams(window.location.search).get('link') ||
		hashParameters.get('target') ||
		hashParameters.get('link') ||
		/^\/https?:\/\//i.test(pathname) ||
		pathname.includes('/limbo.keys/http') ||
		(/^\/[a-z0-9-]{1,36}\/?$/i.test(pathname) && pathname !== '/')
	);
}

document.title = isTargetPage()
	? 'Complete the challenge first before you enter!'
	: 'limbo keys';

function getAppUrl() {
	return `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
}

function getLinkToken() {
	const hashParameters = new URLSearchParams(window.location.hash.slice(1));
	const token = new URLSearchParams(window.location.search).get('link') ||
		hashParameters.get('link');
	if (token) {
		return token;
	}
	const pathToken = window.location.pathname.match(/^\/([a-z0-9-]{1,36})\/?$/i);
	return pathToken ? pathToken[1] : null;
}

function getRedirectUrl() {
	const marker = '/limbo.keys/';
	const markerIndex = window.location.pathname.indexOf(marker);
	const queryTarget = new URLSearchParams(window.location.search).get('target');
	const hashTarget = new URLSearchParams(window.location.hash.slice(1)).get('target');
	const targetParameter = hashTarget || queryTarget;

	if (targetParameter && /^https?:\/\//i.test(targetParameter)) {
		return targetParameter;
	}

	const targetPath = markerIndex === -1
		? window.location.pathname.replace(/^\/+/, '')
		: decodeURIComponent(window.location.pathname.slice(markerIndex + marker.length));
	if (!/^https?:\/\//i.test(targetPath)) {
		return 'https://www.google.com';
	}

	return `${targetPath}${window.location.search}${window.location.hash}`;
}

let resolvedRedirectUrl = null;
const linkToken = getLinkToken();
const linkResolution = linkToken
	? fetch(`resolve-link.php?id=${encodeURIComponent(linkToken)}`)
		.then(async (response) => {
			const result = await response.json();
			if (!response.ok || typeof result.destination !== 'string') {
				throw new Error(result.error || 'Could not resolve link.');
			}
			resolvedRedirectUrl = result.destination;
			startBtn.textContent = typeof result.buttonText === 'string' && result.buttonText
				? result.buttonText
				: 'GO TO SITE';
			if (typeof result.pageTitle === 'string' && result.pageTitle) {
				linkTitle.textContent = result.pageTitle;
				linkTitle.hidden = challengeInProgress;
			}
			challengeHint.dataset.enabled = result.showHint === true ? 'true' : 'false';
		})
		.catch((error) => {
			console.error(error);
			startBtn.textContent = 'LINK UNAVAILABLE';
			startBtn.classList.add('hidden');
		})
	: Promise.resolve();

const movements = [
	[[1, 0], [0, 1], [0, -1], [-1, 0], [1, 0], [0, 1], [0, -1], [-1, 0]],     // small rotate cw, cw
	[[1, 0], [0, 1], [0, -1], [-1, 0], [0, 1], [-1, 0], [1, 0], [0, -1]],     // small rotate cw, ccw
	[[0, 1], [-1, 0], [1, 0], [0, -1], [1, 0], [0, 1], [0, -1], [-1, 0]],     // small rotate ccw,cw
	[[0, 1], [-1, 0], [1, 0], [0, -1], [0, 1], [-1, 0], [1, 0], [0, -1]],     // small rotate ccw,ccw
	[[1, 0], [0, 1], [0, -1], [0, 1], [0, -1], [0, 1], [0, -1], [-1, 0]],     // big rotate cw
	[[0, 1], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1], [1, 0], [0, -1]],     // big rotate ccw
	[[1, 3], [-1, 3], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],  // top to bottom swap
	[[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, -3], [-1, -3]],      // bottom to top swap
	[[1, 0], [-1, 0], [1, 0], [-1, 0], [1, 0], [-1, 0], [1, 0], [-1, 0]],     // horizontal swap
	[[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]], // small diagonal swap
	[[1, 1], [0, 0], [1, 1], [-1, -1], [1, 1], [-1, -1], [0, 0], [-1, -1]],   // big diagonal swap tl/br
	[[0, 0], [-1, 1], [1, -1], [-1, 1], [1, -1], [-1, 1], [1, -1], [0, 0]]    // big diagonal swap bl/tr
]
const doMove = [true, true, true, true, true, false, false, true, true, true, false, false, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true, true, true, false];

function animateKeyToPosition(keyElement, keyIndex, fromPosition, toPosition, duration, viaOffset = null) {
	const keySize = parseFloat(getComputedStyle(keyElement).width);
	const offset = (position) => {
		const x = (position % 2) - (keyIndex % 2);
		const y = Math.floor(position / 2) - Math.floor(keyIndex / 2);
		return `${x * keySize}px ${y * keySize}px`;
	};
	const fromOffset = offset(fromPosition).split(' ');
	const keyframes = [{translate: fromOffset.join(' ')}];
	if (viaOffset) {
		const viaScale = keySize / 20;
		keyframes.push({
			translate: `${parseFloat(fromOffset[0]) + viaOffset[0] * viaScale}px ${parseFloat(fromOffset[1]) + viaOffset[1] * viaScale}px`
		});
	}
	const targetOffset = offset(toPosition);
	keyframes.push({translate: targetOffset});
	const animation = keyElement.animate(keyframes, {
		duration,
		easing: 'ease-in-out',
		fill: 'forwards'
	});
	animation.onfinish = () => {
		keyElement.style.translate = targetOffset;
		animation.cancel();
	};
}

if (isTargetPage()) {
	document.body.classList.remove('generator-page');
	linkGenerator.hidden = true;
	startBtn.classList.remove('hidden');
}

generatorForm.onsubmit = async (event) => {
	event.preventDefault();
	const destination = destinationInput.value.trim();
	let url;
	try {
		url = new URL(destination);
	} catch {
		destinationInput.setCustomValidity('Enter a valid https:// URL.');
		destinationInput.reportValidity();
		return;
	}
	if (url.protocol !== 'https:') {
		destinationInput.setCustomValidity('Enter a valid https:// URL.');
		destinationInput.reportValidity();
		return;
	}
	destinationInput.setCustomValidity('');
	formStatus.textContent = '';
	generatedLink.hidden = true;

	try {
		const id = customIdInput.value.trim().toLowerCase() || createShortId();
		const response = await fetch('create-link.php', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				id,
				destination: url.href,
				pageTitle: pageTitleInput.value.trim(),
				buttonText: buttonTextInput.value.trim(),
				showHint: showHintInput.checked,
			}),
		});
		const result = await response.json();
		if (!response.ok || result.id !== id) {
			throw new Error(result.error || 'Could not create link.');
		}

		linkOutput.value = `${getAppUrl()}${encodeURIComponent(id)}`;
		generatedLink.hidden = false;
		copyStatus.textContent = '';
		formStatus.textContent = '';
	} catch (error) {
		console.error(error);
		formStatus.textContent = error.message || 'Could not create link.';
	}
};

destinationInput.oninput = () => destinationInput.setCustomValidity('');

function createShortId() {
	const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
	let id = '';
	while (id.length < 8) {
		const bytes = crypto.getRandomValues(new Uint8Array(16));
		for (const byte of bytes) {
			if (byte < 252) {
				id += alphabet[byte % alphabet.length];
				if (id.length === 8) {
					break;
				}
			}
		}
	}
	return id;
}

copyLink.onclick = async () => {
	await navigator.clipboard.writeText(linkOutput.value);
	copyStatus.textContent = 'Copied!';
};

startBtn.onclick = () => {
	challengeInProgress = true;
	createOwnLink.hidden = true;
	linkTitle.hidden = true;
	audio.currentTime = 0;
	audio.play();
	startBtn.classList.add('hidden');
	window.setTimeout(() => {
		container.classList.remove('hidden');
		window.setTimeout(() => {
			const keyElements = Array.from(keys);
			let keysAtPosition = Array.from(keys, (_, index) => index);
			const moveKeys = (movement, duration, swapHalves = false) => {
				const nextKeysAtPosition = new Array(keys.length);
				for (let position = 0; position < keys.length; position++) {
					const keyIndex = keysAtPosition[position];
					const destination = swapHalves
						? (position + 4) % keys.length
						: position + movement[position][0] + movement[position][1] * 2;
					nextKeysAtPosition[destination] = keyIndex;
					if (destination !== position) {
						const viaOffset = swapHalves && position >= 4 ? [-30, -20] : null;
						animateKeyToPosition(keyElements[keyIndex], keyIndex, position, destination, duration, viaOffset);
					}
				}
				keysAtPosition = nextKeysAtPosition;
			};
			let correctKey = Math.floor(Math.random() * 8);
			keys[correctKey].style.setProperty('--col', '#0f0');
			window.setTimeout(() => {
				keys[correctKey].style.setProperty('--col', '#f00');
				window.setTimeout(() => {
					let i = 0
					let moveInterval = window.setInterval(() => {
						if(doMove[i]) {
							let movement = movements[Math.floor(Math.random() * movements.length)];
							moveKeys(movement, 250);
						}
						else if(i === 5) {
							moveKeys(null, 520, true);
						}
						else if(i === 10) {
                            container.animate([{rotate: '0deg'}, {rotate: '180deg'}],
											 {duration: 540, easing: 'ease-in-out', fill: 'forwards'});
                        }
						else if(i === 20) {
                            container.animate([{rotate: '-180deg'}, {rotate: '0deg'}],
											 {duration: 540, easing: 'ease-in-out', fill: 'forwards'});
                        }
						i++;
						if(i === 30) {
							window.clearInterval(moveInterval);
							colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#80f', '#f08', '#f70'].sort(() => Math.random() - .5);
							let j = 0;
							let colorInterval = window.setInterval(() => {
								keys[j].animate([{rotate: '0deg'}, {rotate: '360deg'}],
											   {duration: 1000, easing: 'cubic-bezier(.2, .3, 0, 1)'});
								keys[j].style.setProperty('--col', colors[j]);
								j++;
								if(j === 8) {
									window.clearInterval(colorInterval);
									window.setTimeout(() => {
										container.classList.add('hidden');
										window.setTimeout(() => {
											const correctPosition = keysAtPosition.indexOf(correctKey);
											for (const keyIndex of keysAtPosition) {
												const keyElement = keyElements[keyIndex];
												keyElement.style.translate = '0px 0px';
												container.appendChild(keyElement);
											}
											container.className = 'rotary-container';
											challengeHint.hidden = challengeHint.dataset.enabled !== 'true';
											container.animate([{rotate: '0deg'}, {rotate: '360deg'}],
															 {duration: 15000, iterations: Infinity});
											for(let k = 0; k < 8; k++) {
												keys[k].animate([{rotate: '0deg'}, {rotate: '-360deg'}],
														       {duration: 15000, iterations: Infinity});
											}
											let k = -1;
											let blinkInterval = window.setInterval(() => {
												k = (k + 1) % 8;
												keys[k].animate([{textShadow: '0px 0px 8vh var(--col), 0px 0px 8vh #fffd', color: '#fff'}, {textShadow: '0px 0px 8vh var(--col)', color: 'var(--col)'}],
															   {duration: 500});
											}, 500);
											document.body.onclick = () => {
												document.body.onclick = () => null;
												challengeHint.hidden = true;
												window.clearInterval(blinkInterval);
												let containerAnims = container.getAnimations();
												for(let l = 0; l < containerAnims.length; l++) {
                                                    containerAnims[l].cancel();
                                                }
												container.classList.add('hidden');
												document.body.animate([{backgroundColor: keys[k].style.getPropertyValue('--col')}, {backgroundColor: '#000'}],
																	 {duration: 1000});
												window.setTimeout(() => {
													let text = (k === correctPosition) ? correct : wrong;
													text.style.color = keys[correctPosition].style.getPropertyValue('--col');
													text.animate([{opacity: 1}, {opacity: 0}],
																{duration: 2000});
													if (k === correctPosition) {
														window.setTimeout(async () => {
															await linkResolution;
															window.location.href = resolvedRedirectUrl || getRedirectUrl();
														}, 1500);
													} else {
														window.setTimeout(() => {
															challengeInProgress = false;
															linkTitle.hidden = !linkTitle.textContent;
															createOwnLink.hidden = false;
															startBtn.classList.remove('hidden');
														}, 2000);
													}
													container.classList.remove('rotary-container');
													container.classList.add('container');
													for(let l = 0; l < 8; l++) {
														keys[l].getAnimations()[0].cancel();
														keys[l].style.setProperty('--col', '#f00');
													}
												}, 3000)
											}
										}, 1000);
									}, 500);
								}
							}, 50);
						}
					}, 270);
				}, 500);
			}, 500);
		}, 1000);
	}, 200);
}