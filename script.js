const fileInput = document.querySelector(".file-input"),
    filterOptions = document.querySelectorAll(".filter button, #sepia, #blur"),
    filterName = document.querySelector(".filter-info .name"),
    filterValue = document.querySelector(".filter-info .value"),
    filterSlider = document.querySelector(".slider input"),
    rotateOptions = document.querySelectorAll(".rotate button"),
    previewImg = document.querySelector(".preview-img img"),
    resetFilterBtn = document.querySelector(".reset-filter"),
    chooseImgBtn = document.querySelector(".choose-img"),
    saveImgBtn = document.querySelector(".save-img"),
    undoBtn = document.querySelector(".undo-btn"),
    removeBgBtn = document.getElementById("remove-bg-btn");

let brightness = "100",
    saturation = "100",
    inversion = "0",
    grayscale = "0",
    blur = "0",
    sepia = "0";

let rotate = 0,
    flipHorizontal = 1,
    flipVertical = 1;

let imageStates = [];

// Add your remove.bg API key here
const removeBgApiKey = 'YfZUNH3KDFCHm5fTPERotEEH';

const removeBackground = async () => {
    try {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': removeBgApiKey,
            },
            body: formData,
        });
        

        if (response.ok) {
            const result = await response.json();
            previewImg.src = result.data.result;
            alert('Background removed successfully!');
        } else {
            alert('Failed to remove background. Please try again.');
        }
    } catch (error) {
        console.error('Error removing background:', error);
        alert('An error occurred. Please try again.');
    }
};

const loadImage = () => {
    let file = fileInput.files[0];
    if (!file) return;
    const prevState = {
        src: previewImg.src,
        brightness,
        saturation,
        inversion,
        grayscale,
        rotate,
        flipHorizontal,
        flipVertical,
        blur,
        sepia,
        filter: document.querySelector(".filter .active").id,
        filterName: filterName.innerText,
        filterSliderMax: filterSlider.max,
        filterSliderValue: filterSlider.value,
        filterValue: filterValue.innerText,
    };
    imageStates = [prevState];
    previewImg.src = URL.createObjectURL(file);
    previewImg.addEventListener("load", () => {
        resetFilterBtn.click();
        document.querySelector(".container").classList.remove("disable");
    });
};

const applyFilter = () => {
    previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
    previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%) blur(${blur}px) sepia(${sepia}%)`;
};

const updateFilter = () => {
    filterValue.innerText = `${filterSlider.value}%`;
    const selectedFilter = document.querySelector(".filter .active");

    if (selectedFilter.id === "brightness") {
        brightness = filterSlider.value;
    } else if (selectedFilter.id === "saturation") {
        saturation = filterSlider.value;
    } else if (selectedFilter.id === "inversion") {
        inversion = filterSlider.value;
    } else if (selectedFilter.id === "grayscale") {
        grayscale = filterSlider.value;
    } else if (selectedFilter.id === "blur") {
        blur = filterSlider.value;
    } else if (selectedFilter.id === "sepia") {
        sepia = filterSlider.value;
    }

    applyFilter();
};

const rotateImage = (degree) => {
    rotate += degree;
    applyFilter();
};

const flipImage = (horizontal, vertical) => {
    flipHorizontal = horizontal ? -1 : 1;
    flipVertical = vertical ? -1 : 1;
    applyFilter();
};

const resetFilter = () => {
    brightness = "100";
    saturation = "100";
    inversion = "0";
    grayscale = "0";
    blur = "0";
    sepia = "0";
    rotate = 0;
    flipHorizontal = 1;
    flipVertical = 1;
    filterOptions[0].click();
    applyFilter();
};

const saveImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = previewImg.naturalWidth;
    canvas.height = previewImg.naturalHeight;

    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%) blur(${blur}px) sepia(${sepia}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotate !== 0) {
        ctx.rotate((rotate * Math.PI) / 180);
    }
    ctx.scale(flipHorizontal, flipVertical);
    ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = "image.jpg";
    link.href = canvas.toDataURL();
    link.click();
};

const undoChanges = () => {
    if (imageStates.length > 1) {
        imageStates.pop(); // Remove the current state
        const prevState = imageStates[imageStates.length - 1];
        previewImg.src = prevState.src;
        brightness = prevState.brightness;
        saturation = prevState.saturation;
        inversion = prevState.inversion;
        grayscale = prevState.grayscale;
        rotate = prevState.rotate;
        flipHorizontal = prevState.flipHorizontal;
        flipVertical = prevState.flipVertical;
        blur = prevState.blur;
        sepia = prevState.sepia;
        applyFilter();
        document.querySelector(".active").classList.remove("active");
        document.getElementById(prevState.filter).classList.add("active");
        filterName.innerText = prevState.filterName;
        filterSlider.max = prevState.filterSliderMax;
        filterSlider.value = prevState.filterSliderValue;
        filterValue.innerText = prevState.filterValue;
    }
};

filterOptions.forEach((option) => {
    option.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        option.classList.add("active");
        filterName.innerText = option.innerText;

        if (option.id === "brightness" || option.id === "saturation") {
            filterSlider.max = "200";
        } else {
            filterSlider.max = "100";
        }
        filterSlider.value = option.id === "brightness" ? brightness : option.id === "saturation" ? saturation : option.id === "inversion" ? inversion : option.id === "grayscale" ? grayscale : option.id === "blur" ? blur : sepia;
        filterValue.innerText = `${filterSlider.value}%`;
    });
});

rotateOptions.forEach((option) => {
    option.addEventListener("click", () => {
        if (option.id === "left") {
            rotateImage(-90);
        } else if (option.id === "right") {
            rotateImage(90);
        } else if (option.id === "horizontal") {
            flipImage(true, false);
        } else if (option.id === "vertical") {
            flipImage(false, true);
        }
    });
});

filterSlider.addEventListener("input", updateFilter);
resetFilterBtn.addEventListener("click", resetFilter);
saveImgBtn.addEventListener("click", saveImage);
fileInput.addEventListener("change", loadImage);
chooseImgBtn.addEventListener("click", () => fileInput.click());
undoBtn.addEventListener("click", undoChanges);
removeBgBtn.addEventListener("click", removeBackground);