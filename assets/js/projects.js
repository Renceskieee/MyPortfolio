window.initProjects = () => {
	const projectViewers = [
		{
			selector: ".project-aqua .project-link",
			name: "AquaLex",
			images: Array.from({ length: 6 }, (_, index) => ({
				src: `assets/images/projects/AquaLex/${index + 1}.jpg`,
				alt: `AquaLex application screen ${index + 1} of 6`,
			})),
		},
		{
			selector: ".project-hris .project-link",
			name: "EARIST HRIS",
			images: [8, 9, 10, 11].map((number, index) => ({
				src: `assets/images/projects/EARISTHRIS/${number}.jpg`,
				alt: `EARIST HRIS application screen ${index + 1} of 4`,
			})),
		},
	];
	const availableProject = projectViewers.find(({ selector }) =>
		document.querySelector(selector),
	);
	if (!availableProject) return;

	const viewer = document.createElement("div");
	viewer.className = "image-viewer";
	viewer.setAttribute("aria-hidden", "true");
	viewer.innerHTML = `
		<div class="image-viewer-backdrop" data-viewer-close></div>
		<section class="image-viewer-panel" role="dialog" aria-modal="true" aria-label="Project image preview" tabindex="-1">
			<button class="image-viewer-close" type="button" aria-label="Close image preview" data-viewer-close>×</button>
			<button class="image-viewer-control image-viewer-previous" type="button" aria-label="Previous AquaLex image">‹</button>
			<figure class="image-viewer-figure">
				<img class="image-viewer-image" alt="" />
				<figcaption class="image-viewer-counter" aria-live="polite"></figcaption>
			</figure>
			<button class="image-viewer-control image-viewer-next" type="button" aria-label="Next AquaLex image">›</button>
		</section>
	`;
	document.body.append(viewer);

	const image = viewer.querySelector(".image-viewer-image");
	const counter = viewer.querySelector(".image-viewer-counter");
	const closeButton = viewer.querySelector(".image-viewer-close");
	const previousButton = viewer.querySelector(".image-viewer-previous");
	const nextButton = viewer.querySelector(".image-viewer-next");
	let currentProject = availableProject;
	let currentIndex = 0;
	let lastFocusedElement;
	let touchStartX = 0;
	let closeTimeout;

	function renderImage() {
		const currentImage = currentProject.images[currentIndex];
		image.classList.add("is-switching");
		image.src = currentImage.src;
		image.alt = currentImage.alt;
		counter.textContent = `${currentIndex + 1} / ${currentProject.images.length}`;
		viewer.querySelector(".image-viewer-panel").setAttribute(
			"aria-label",
			`${currentProject.name} image preview`,
		);
		previousButton.setAttribute("aria-label", `Previous ${currentProject.name} image`);
		nextButton.setAttribute("aria-label", `Next ${currentProject.name} image`);
		window.setTimeout(() => image.classList.remove("is-switching"), 90);
	}

	function showImage(index) {
		currentIndex = (index + currentProject.images.length) % currentProject.images.length;
		renderImage();
	}

	function openViewer(event) {
		event.preventDefault();
		lastFocusedElement = event.currentTarget;
		currentProject = projectViewers.find(({ selector }) =>
			event.currentTarget.matches(selector),
		) ?? availableProject;
		currentIndex = 0;
		renderImage();
		window.clearTimeout(closeTimeout);
		viewer.classList.remove("is-closing");
		viewer.classList.add("is-open");
		viewer.setAttribute("aria-hidden", "false");
		document.body.classList.add("viewer-open");
		closeButton.focus();
	}

	function closeViewer() {
		if (!viewer.classList.contains("is-open")) return;
		viewer.classList.remove("is-open");
		viewer.classList.add("is-closing");
		viewer.setAttribute("aria-hidden", "true");
		document.body.classList.remove("viewer-open");
		closeTimeout = window.setTimeout(() => viewer.classList.remove("is-closing"), 240);
		lastFocusedElement?.focus();
	}

	projectViewers.forEach(({ selector }) => {
		document.querySelector(selector)?.addEventListener("click", openViewer);
	});
	viewer.addEventListener("click", (event) => {
		if (event.target.matches("[data-viewer-close]")) closeViewer();
	});
	previousButton.addEventListener("click", () => showImage(currentIndex - 1));
	nextButton.addEventListener("click", () => showImage(currentIndex + 1));
	const handleKeydown = (event) => {
		if (!viewer.classList.contains("is-open")) return;
		if (event.key === "Escape") closeViewer();
		if (event.key === "ArrowLeft") showImage(currentIndex - 1);
		if (event.key === "ArrowRight") showImage(currentIndex + 1);
	};
	document.addEventListener("keydown", handleKeydown);
	viewer.cleanup = () => document.removeEventListener("keydown", handleKeydown);
	viewer.addEventListener("touchstart", (event) => {
		touchStartX = event.changedTouches[0].screenX;
	}, { passive: true });
	viewer.addEventListener("touchend", (event) => {
		const distance = event.changedTouches[0].screenX - touchStartX;
		if (Math.abs(distance) < 50) return;
		showImage(currentIndex + (distance < 0 ? 1 : -1));
	}, { passive: true });
};
