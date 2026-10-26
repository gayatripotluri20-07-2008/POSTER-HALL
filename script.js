
// ========================================
// 1. CONNECT JAVASCRIPT TO HTML ELEMENTS
// ========================================

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results");
const status = document.getElementById("status");
const resultCount = document.getElementById("result-count");


// ========================================
// 2. HANDLE SEARCH FORM SUBMISSION
// ========================================

form.addEventListener("submit", async function (event) {

    // Stop the browser from refreshing the page
    event.preventDefault();

    // Read the search text and remove extra spaces
    const query = input.value.trim();

    // Ignore an empty search
    if (query === "") {
        return;
    }

    // Clear the previous search results
    results.innerHTML = "";
    resultCount.textContent = "";

    // Show the loading state before fetching
    status.className = "status-message";
    status.innerHTML =
        '<span class="spinner" aria-hidden="true"></span> Searching for images...';

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
        "&iiurlwidth=400" +
        "&format=json" +
        "&origin=*";

    try {

        // ========================================
        // 4. FETCH DATA FROM THE API
        // ========================================

        const response = await fetch(url);

        // Check whether the request succeeded
        if (!response.ok) {
            throw new Error("Request failed: " + response.status);
        }

        // Convert the response into JavaScript data
        const data = await response.json();

        // Get the image results
        const items = Object.values(data.query?.pages || {});

        // Keep only results that contain image information
        const imageItems = items.filter(function (item) {
            return item.imageinfo && item.imageinfo[0];
        });

        // ========================================
        // 5. HANDLE THE EMPTY STATE
        // ========================================

        if (imageItems.length === 0) {
            status.className = "status-message empty";
            status.textContent =
                'No images found for "' + query + '". Try another search.';

            resultCount.textContent = "";
            return;
        }

        // ========================================
        // 6. HANDLE THE RESULTS STATE
        // ========================================

        status.className = "status-message";
        status.textContent = "Search completed successfully!";

        resultCount.textContent =
            "Showing " + imageItems.length +
            ' results for "' + query + '".';

        // Display the image cards
        renderResults(imageItems);

    } catch (error) {

        // ========================================
        // 7. HANDLE THE ERROR STATE
        // ========================================

        console.error("Error fetching images:", error);

        results.innerHTML = "";

        status.className = "status-message error";
        status.textContent =
            "Something went wrong. Please check your internet connection and try again.";

        resultCount.textContent = "";
    }
});


// ========================================
// 8. CREATE AND DISPLAY IMAGE CARDS
// ========================================

function renderResults(items) {

    // Clear old results before displaying new cards
    results.innerHTML = "";

    // Create a card for each image
    items.forEach(function (item) {

        const imageInfo = item.imageinfo[0];

        // Create the card element
        const card = document.createElement("article");
        card.className = "card";

        // Create the image element
        const img = document.createElement("img");

        // Set the image URL
        img.src = imageInfo.thumburl || imageInfo.url;

        // Add alternative text
        img.alt = item.title || "Poster Hall image";

        // Load images when needed
        img.loading = "lazy";

        // Create the image caption
        const caption = document.createElement("p");

        // Add the image title as text
        caption.textContent = item.title || "Untitled image";

        // Put the image inside the card
        card.appendChild(img);

        // Put the caption inside the card
        card.appendChild(caption);

        // Add the card to the results grid
        results.appendChild(card);
    });
}


// ========================================
// 9. MAKE POPULAR SEARCH BUTTONS WORK
// ========================================

const suggestionButtons =
    document.querySelectorAll(".suggestion-chip");

suggestionButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Fill the search box with the selected topic
        input.value = button.dataset.query;

        // Submit the search automatically
        form.requestSubmit();
    });
});
