// ========================================
// 1. CONNECT JAVASCRIPT TO HTML ELEMENTS
// ========================================

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results");
const resultCount = document.getElementById("result-count");

// ========================================
// 2. LISTEN FOR SEARCH FORM SUBMISSION
// ========================================

form.addEventListener("submit", async function (event) {

    // Stop the page from refreshing
    event.preventDefault();

    // Get the search text and remove extra spaces
    const query = input.value.trim();

    // Do nothing if the search is empty
    if (query === "") {
        return;
    }

    // Clear the previous results
    results.innerHTML = "";

    // Show a loading message
    results.textContent = "Loading images...";

    // Clear the previous result count
    resultCount.textContent = "";

    // ========================================
    // 3. CREATE THE WIKIMEDIA API URL
    // ========================================

    const url =
        "https://commons.wikimedia.org/w/api.php" +
        "?action=query" +
        "&generator=search" +
        "&gsrsearch=" + encodeURIComponent(query) +
        "&gsrnamespace=6" +
        "&gsrlimit=12" +
        "&prop=imageinfo" +
        "&iiprop=url" +
        "&iiurlwidth=300" +
        "&format=json" +
        "&origin=*";

    try {

        // ========================================
        // 4. FETCH IMAGES FROM THE API
        // ========================================

        const response = await fetch(url);

        // Check whether the request was successful
        if (!response.ok) {
            throw new Error("Failed to fetch images");
        }

        // Convert the response into JavaScript data
        const data = await response.json();

        // Get the list of image results
        const items = Object.values(data.query?.pages || {});

        // ========================================
        // 5. DISPLAY THE IMAGE RESULTS
        // ========================================

        renderResults(items, query);

    } catch (error) {

        // Display an error message if something goes wrong
        console.error("Error fetching images:", error);

        results.innerHTML =
            "<p>Sorry, we could not load the images. Please try again.</p>";

        resultCount.textContent = "";
    }
});


// ========================================
// 6. CREATE AND DISPLAY IMAGE CARDS
// ========================================

function renderResults(items, query) {

    // Remove any previous results
    results.innerHTML = "";

    // Keep only results that contain image information
    const imageItems = items.filter(function (item) {
        return item.imageinfo && item.imageinfo[0];
    });

    // Display the number of images found
    resultCount.textContent =
        "Showing " + imageItems.length +
        ' results for "' + query + '"';

    // Display a message if no images are found
    if (imageItems.length === 0) {
        results.textContent =
            'No images found for "' + query + '". Try another search.';
        return;
    }

    // Go through each image result
    imageItems.forEach(function (item) {

        const imageInfo = item.imageinfo[0];

        // Create a card for the image
        const card = document.createElement("article");
        card.className = "card";

        // Create the image element
        const img = document.createElement("img");

        // Add the image URL
        img.src = imageInfo.thumburl || imageInfo.url;

        // Add alternative text for accessibility
        img.alt = item.title || "Poster Hall image";

        // Load images when needed
        img.loading = "lazy";

        // Create the image caption
        const caption = document.createElement("p");

        // Add the image title
        caption.textContent = item.title || "Untitled image";

        // Put the image inside the card
        card.appendChild(img);

        // Put the caption inside the card
        card.appendChild(caption);

        // Add the card to the results section
        results.appendChild(card);
    });
}


// ========================================
// 7. MAKE POPULAR SEARCH BUTTONS WORK
// ========================================

const suggestionButtons =
    document.querySelectorAll(".suggestion-chip");

suggestionButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Put the selected topic into the search box
        input.value = button.dataset.query;

        // Automatically submit the search form
        form.requestSubmit();
    });
});
