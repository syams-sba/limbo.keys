const startBtn = document.getElementById('start-button');
const audio = document.getElementById('limbo-audio');
const container = document.getElementsByClassName('container')[0];
const keys = document.getElementsByClassName('key');
const wrong = document.getElementById('wrong');
const correct = document.getElementById('correct');

function getRedirectUrl() {
	const marker = '/limbo.keys/';
	const markerIndex = window.location.pathname.indexOf(marker);
	const targetParameter = new URLSearchParams(window.location.search).get('target');

	if (targetParameter && /^https?:\/\//i.test(targetParameter)) {
		return targetParameter;
	}

	if (markerIndex === -1) {
		return 'https://www.google.com';
	}

	const targetPath = decodeURIComponent(window.location.pathname.slice(markerIndex + marker.length));
	if (!/^https?:\/\//i.test(targetPath)) {
		return 'https://www.google.com';
	}

	return `${targetPath}${window.location.search}${window.location.hash}`;
}

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
startBtn.onclick = () => {
	audio.currentTime = 0;
	audio.play();
	startBtn.classList.add('hidden');
	window.setTimeout(() => {
		container.classList.remove('hidden');
		window.setTimeout(() => {
			let correctKey = Math.floor(Math.random() * 8);
			keys[correctKey].style.setProperty('--col', '#0f0');
			window.setTimeout(() => {
				keys[correctKey].style.setProperty('--col', '#f00');
				window.setTimeout(() => {
					let i = 0
					let moveInterval = window.setInterval(() => {
						if(doMove[i]) {
							let movement = movements[Math.floor(Math.random() * movements.length)];
							for(let j = 0; j < 8; j++) {
								if(movement[j][0] !== 0 || movement[j][1] !== 0) {
									keys[j].animate([{translate: '0px 0px'}, {translate: `${movement[j][0] * 20}vh ${movement[j][1] * 20}vh`}],
												   {duration: 270, easing: 'ease-in-out'});
								}
							}
							correctKey += movement[correctKey][0] + movement[correctKey][1] * 2;
						}
						else if(i === 5) {
							for(let j = 0; j < 4; j++) {
								keys[j].animate([{translate: '0px 0px'}, {translate: '0px 40vh'}],
											   {duration: 540, easing: 'ease-in-out'});
							}
							for(let j = 4; j < 8; j++) {
								keys[j].animate([{translate: '0px 0px'}, {translate: '-30vh -20vh'}, {translate: '0px -40vh'}],
											   {duration: 540, easing: 'ease-in-out'});
							}
							correctKey = (correctKey + 4) % 8
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
											container.className = 'rotary-container';
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
												window.clearInterval(blinkInterval);
												let containerAnims = container.getAnimations();
												for(let l = 0; l < containerAnims.length; l++) {
                                                    containerAnims[l].cancel();
                                                }
												container.classList.add('hidden');
												document.body.animate([{backgroundColor: keys[k].style.getPropertyValue('--col')}, {backgroundColor: '#000'}],
																	 {duration: 1000});
												window.setTimeout(() => {
													let text = (k === correctKey) ? correct : wrong;
													text.style.color = keys[correctKey].style.getPropertyValue('--col');
													text.animate([{opacity: 1}, {opacity: 0}],
																{duration: 2000});
													if (k === correctKey) {
														window.setTimeout(() => {
																window.location.href = getRedirectUrl();
														}, 1500);
													}
													container.classList.remove('rotary-container');
													container.classList.add('container');
													for(let l = 0; l < 8; l++) {
														keys[l].getAnimations()[0].cancel();
														keys[l].style.setProperty('--col', '#f00');
													}
													window.setTimeout(() => {
														startBtn.classList.remove('hidden');
													}, 2000);
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