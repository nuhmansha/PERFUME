let preinputvalue = "";

async function handleSearchInput(event) {
  const partialInput = document.getElementById("searchInput").value;
  if (event.key === "Enter") {
    window.location.href = `/shop?search=${partialInput}`;
  } else {
    if (partialInput !== preinputvalue) {
      try {
        const response = await fetch(`/search?input=${partialInput}`);
        const data = await response.json();

        displayAutocompleteSuggestions(data.suggestions);
        preinputvalue = partialInput;
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      }
    }
  }
}
function displayAutocompleteSuggestions(suggestions) {
  const partialInput = document
    .getElementById("searchInput")
    .value.tolowerCase();
  const suggestionsList = document.getElementById("suggestionsList");

  suggestionsList.innerHTML = "";

  suggestions.forEach((suggestion) => {
    const listItem = document.createElement("li");
    listItem.textContent = suggestion.name;

    listItem.addEventListener("click", () => {
      document.getElementById("searchInput").value = suggestion.name;
      suggestionsList.innerHTML = ""; // Clear suggestions list
    });

    suggestionsList.appendChild(listItem);
  });
  const suggestionsContainer = document.querySelector(".suggestions-container");
  suggestionsContainer.style.display =
    suggestions.length > 0 ? "block" : "none";
}

document
  .getElementById("applyFiltersBtn")
  .addEventListener("click", function () {
    const selectedCategory = document.querySelector(
      'input[name="category"]:checked'
    );
    const categoryValue = selectedCategory ? selectedCategory.value : null;
    console.log('Selected category:', categoryValue);   
    

    const selectedPriceFilter = document.querySelector(
      'input[name="price-filter"]:checked'
    );
    const priceFilterValue = selectedPriceFilter
      ? selectedPriceFilter.value
      : null;

    const filters = {
      category: categoryValue,
      priceFilter: priceFilterValue,
    };
    console.log(filters);

    const queryString = Object.keys(filters)
      .filter((key) => filters[key] !== null)
      .map((key) => `${key}=${encodeURIComponent(filters[key])}`)
      .join("&");

    const url = `/shop?${queryString}`;
    console.log(url,'url');

    window.location.href = url;
  });
