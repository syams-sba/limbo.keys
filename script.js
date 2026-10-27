const startBtn = document.getElementById('start-button');
const audio = document.getElementById('limbo-audio');
const container = document.getElementsByClassName('container')[0];
const keys = document.getElementsByClassName('key');
const outcomeScene = document.getElementById('outcome-scene');
const challengeScene = document.getElementById('challenge-scene');
const backdrop = document.getElementById('challenge-backdrop');
const backdropContext = backdrop.getContext('2d');
const outcomeMessage = document.getElementById('outcome-message');
const linkGenerator = document.getElementById('link-generator');
const generatorForm = document.getElementById('generator-form');
const destinationInput = document.getElementById('destination-input');
const customIdInput = document.getElementById('custom-id-input');
const pageTitleInput = document.getElementById('page-title-input');
const buttonTextInput = document.getElementById('button-text-input');
const detailModeInput = document.getElementById('detail-mode-input');
const keyModeInput = document.getElementById('key-mode-input');
const showHintInput = document.getElementById('show-hint-input');
const formStatus = document.getElementById('form-status');
const generatedLink = document.getElementById('generated-link');
const linkOutput = document.getElementById('link-output');
const copyLink = document.getElementById('copy-link');
const copyStatus = document.getElementById('copy-status');
const linkTitle = document.getElementById('link-title');
const challengeHint = document.getElementById('challenge-hint');
const createOwnLink = document.getElementById('create-own-link');
const challengeReportLink = document.getElementById('challenge-report-link');
let challengeInProgress = false;
let challengeMode = 'classic';
let backdropMode = 'idle';
let backdropFrame = 0;
let backdropStartedAt = 0;
let backdropFlashColor = '#fff';
let backdropWidth = 0;
let backdropHeight = 0;
let backdropPixelRatio = 1;

function resizeBackdrop() {
	backdropPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
	backdropWidth = window.innerWidth;
	backdropHeight = window.innerHeight;
	backdrop.width = Math.round(backdropWidth * backdropPixelRatio);
	backdrop.height = Math.round(backdropHeight * backdropPixelRatio);
	backdropContext.setTransform(backdropPixelRatio, 0, 0, backdropPixelRatio, 0, 0);
}

function drawBackdropFrame(now) {
	if (backdropMode === 'idle') {
		return;
	}
	const elapsed = (now - backdropStartedAt) / 1000;
	const ctx = backdropContext;
	const w = backdropWidth;
	const h = backdropHeight;
	if (backdropMode === 'flash') {
		ctx.clearRect(0, 0, w, h);
		const holdDuration = 0.2;
		const fadeDuration = 0.6;
		const opacity = Math.max(0, 1 - Math.max(0, elapsed - holdDuration) / fadeDuration);
		ctx.globalAlpha = opacity;
		ctx.fillStyle = backdropFlashColor;
		ctx.fillRect(0, 0, w, h);
		ctx.globalAlpha = 1;
		if (elapsed < 1) {
			backdropFrame = window.requestAnimationFrame(drawBackdropFrame);
		}
		return;
	}
}

function startBackdrop(mode, flashColor, result) {
	window.cancelAnimationFrame(backdropFrame);
	if (mode === 'landing' || mode === 'crash') {
		backdropMode = 'idle';
		document.body.classList.remove('flash-active');
		document.body.classList.remove('challenge-active');
		document.body.classList.add('scene-active');
		const resultColor = outcomeMessage.style.getPropertyValue('--result-color');
		const resultQuery = new URLSearchParams({ result, color: resultColor }).toString();
		outcomeScene.src = `${mode === 'landing' ? 'landing.html' : 'crash.html'}?${resultQuery}`;
		outcomeScene.hidden = false;
		return;
	}
	outcomeScene.hidden = true;
	outcomeScene.src = 'about:blank';
	document.body.classList.remove('scene-active');
	document.body.classList.toggle('flash-active', mode === 'flash');
	backdropMode = mode;
	if (flashColor) {
		backdropFlashColor = flashColor;
	}
	backdropStartedAt = performance.now();
	document.body.classList.add('challenge-active');
	if (mode === 'shuffle') {
		challengeScene.style.display = 'none';
		void challengeScene.getBoundingClientRect();
		challengeScene.style.display = '';
		backdropContext.clearRect(0, 0, backdropWidth, backdropHeight);
	} else if (mode === 'flash') {
		backdropFrame = window.requestAnimationFrame(drawBackdropFrame);
	}
}

function stopBackdrop() {
	window.cancelAnimationFrame(backdropFrame);
	backdropMode = 'idle';
	outcomeScene.hidden = true;
	outcomeScene.src = 'about:blank';
	document.body.classList.remove('scene-active');
	document.body.classList.remove('flash-active');
	backdropContext.clearRect(0, 0, backdropWidth, backdropHeight);
	document.body.classList.remove('challenge-active');
}

window.addEventListener('resize', resizeBackdrop);
resizeBackdrop();

function setChallengeMode(mode) {
	challengeMode = mode === 'key-select' ? 'key-select' : 'classic';
	challengeHint.textContent = challengeMode === 'key-select'
		? 'Select the correct key'
		: 'Click when the correct key flashes';
}

function setDetailMode(mode) {
	document.body.classList.toggle('low-detail', mode === 'low-detail');
}

function setKeyColor(key, color) {
	const hue = {
		'#f00': 0,
		'#ff0': 60,
		'#0f0': 120,
		'#0ff': 180,
		'#00f': 240,
		'#80f': 270,
		'#f08': 320,
		'#f70': 30,
	}[color.toLowerCase()];
	key.style.setProperty('--col', color);
	key.style.setProperty('--hue', `${hue ?? 0}deg`);
}

setChallengeMode(challengeMode);

function isTargetPage() {
	return getLinkToken() !== null || testMode;
}

const testMode = (
	window.location.protocol === 'file:' ||
	window.location.hostname === 'localhost' ||
	window.location.hostname === '127.0.0.1'
) && new URLSearchParams(window.location.search).get('test') === '1' &&
	getLinkToken() === null;

document.title = testMode
	? 'Limbo Keys - Test Challenge'
	: isTargetPage()
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

let resolvedRedirectUrl = null;
const linkToken = getLinkToken();
const linkResolution = testMode
	? Promise.resolve().then(() => {
		resolvedRedirectUrl = 'https://example.com/';
		startBtn.textContent = 'START TEST';
		linkTitle.textContent = 'LOCAL TEST CHALLENGE';
		linkTitle.hidden = false;
		challengeHint.dataset.enabled = 'false';
		setChallengeMode('classic');
		setDetailMode('high-detail');
		startBtn.classList.remove('hidden');
	})
	: linkToken
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
			setChallengeMode(result.keyMode);
			setDetailMode(result.detailMode);
			startBtn.classList.remove('hidden');
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
	if (!linkToken) {
		startBtn.classList.remove('hidden');
	}
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
		const id = customIdInput.value.trim() || createShortId();
		const response = await fetch('create-link.php', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				id,
				destination: url.href,
				pageTitle: pageTitleInput.value.trim(),
				buttonText: buttonTextInput.value.trim(),
				showHint: showHintInput.checked,
				keyMode: keyModeInput.value,
				detailMode: detailModeInput.value,
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
	const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let id = '';
	while (id.length < 8) {
		const bytes = crypto.getRandomValues(new Uint8Array(16));
		for (const byte of bytes) {
			if (byte < 248) {
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
	const runMode = challengeMode;
	startBackdrop('shuffle');
	createOwnLink.hidden = true;
	challengeReportLink.hidden = true;
	linkTitle.hidden = true;
	audio.currentTime = 0;
	audio.play();
	startBtn.classList.add('hidden');
	window.setTimeout(() => {
		container.hidden = false;
		container.getBoundingClientRect();
		window.requestAnimationFrame(() => {
			container.classList.remove('hidden');
		});
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
			setKeyColor(keys[correctKey], '#0f0');
			keys[correctKey].classList.add('correct-reveal');
			window.setTimeout(() => {
				keys[correctKey].classList.remove('correct-reveal');
				setKeyColor(keys[correctKey], '#f00');
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
							const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#80f', '#f08', '#f70'].sort(() => Math.random() - .5);
							let j = 0;
							let colorInterval = window.setInterval(() => {
								keys[j].animate([{rotate: '0deg'}, {rotate: '360deg'}],
											   {duration: 1000, easing: 'cubic-bezier(.2, .3, 0, 1)'});
								setKeyColor(keys[j], colors[j]);
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
											container.className = `rotary-container${runMode === 'key-select' ? ' key-select-mode' : ''}`;
											challengeHint.hidden = challengeHint.dataset.enabled !== 'true';
											container.animate([{rotate: '0deg'}, {rotate: '360deg'}],
															 {duration: 15000, iterations: Infinity});
											if (runMode === 'key-select') {
												for (const key of Array.from(keys)) {
													key.setAttribute('role', 'button');
													key.setAttribute('tabindex', '0');
													key.setAttribute('aria-label', 'Select this key');
													key.onkeydown = (event) => {
														if (event.key === 'Enter' || event.key === ' ') {
															event.preventDefault();
															key.click();
														}
													};
												}
											}
											for(let k = 0; k < 8; k++) {
												keys[k].animate([{rotate: '0deg'}, {rotate: '-360deg'}],
														       {duration: 15000, iterations: Infinity});
											}
											let k = -1;
											let blinkInterval = null;
											if (runMode === 'classic') {
												blinkInterval = window.setInterval(() => {
													if (k >= 0) {
														keys[k].classList.remove('flash-highlight');
													}
													k = (k + 1) % 8;
													keys[k].classList.add('flash-highlight');
												}, 500);
											}
											document.body.onclick = (event) => {
												const clickedKey = event.target instanceof Element
													? event.target.closest('.key')
													: null;
												if (runMode === 'key-select' && !clickedKey) {
													return;
												}
												if (runMode === 'classic' && k < 0) {
													return;
												}
												const selectedPosition = runMode === 'key-select'
													? Array.from(keys).indexOf(clickedKey)
													: k;
												document.body.onclick = () => null;
												challengeHint.hidden = true;
												if (blinkInterval !== null) {
													window.clearInterval(blinkInterval);
												}
												for (const key of keyElements) {
													key.classList.remove('flash-highlight');
													key.classList.remove('correct-reveal');
													key.removeAttribute('role');
													key.removeAttribute('tabindex');
													key.removeAttribute('aria-label');
													key.onkeydown = null;
												}
												let containerAnims = container.getAnimations();
												for(let l = 0; l < containerAnims.length; l++) {
                                                    containerAnims[l].cancel();
                                                }
												container.classList.add('hidden');
												const landedCorrectly = selectedPosition === correctPosition;
												const correctColor = keys[correctPosition].style.getPropertyValue('--col').trim();
												const result = landedCorrectly ? 'correct' : 'wrong';
												container.hidden = true;
												outcomeMessage.dataset.result = result;
												outcomeMessage.style.setProperty('--result-color', landedCorrectly ? '#eee' : correctColor);
												outcomeMessage.replaceChildren(document.createTextNode(landedCorrectly ? 'CORRECT!' : 'WRONG'));
												outcomeMessage.hidden = true;
												startBackdrop('flash', keys[selectedPosition].style.getPropertyValue('--col'));
												window.setTimeout(() => {
													startBackdrop(landedCorrectly ? 'landing' : 'crash', null, landedCorrectly ? 'CORRECT!' : 'WRONG');
												}, 1000);
												container.classList.remove('rotary-container');
												container.classList.remove('key-select-mode');
												container.classList.add('container');
												for (const key of keyElements) {
													for (const animation of key.getAnimations()) {
														animation.cancel();
													}
													setKeyColor(key, '#f00');
												}
												window.setTimeout(async () => {
													if (landedCorrectly) {
														await linkResolution;
														const redirectDetail = document.createElement('span');
														redirectDetail.className = 'redirect-detail';
														if (typeof resolvedRedirectUrl === 'string' && /^https:\/\//i.test(resolvedRedirectUrl)) {
															redirectDetail.textContent = `Landing complete. Redirecting you to ${resolvedRedirectUrl}`;
														} else {
															redirectDetail.textContent = 'Landing complete, but the destination is unavailable.';
														}
															outcomeMessage.replaceChildren(redirectDetail);
															outcomeMessage.hidden = false;
													}
													if (landedCorrectly) {
														if (typeof resolvedRedirectUrl === 'string' && /^https:\/\//i.test(resolvedRedirectUrl)) {
															window.setTimeout(() => {
																window.location.href = resolvedRedirectUrl;
															}, 1000);
														}
													} else {
														window.setTimeout(() => {
															outcomeMessage.hidden = true;
															stopBackdrop();
															challengeInProgress = false;
															linkTitle.hidden = !linkTitle.textContent;
															createOwnLink.hidden = false;
															challengeReportLink.hidden = false;
															startBtn.classList.remove('hidden');
														}, 1800);
													}
												}, 7900);
											}
										}, 1000);
									}, 500);
								}
							}, 50);
						}
					}, 270);
				}, 500);
			}, 750);
		}, 1000);
	}, 200);
}