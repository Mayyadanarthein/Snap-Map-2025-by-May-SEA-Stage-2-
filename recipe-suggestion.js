
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const bitmojiIcon = document.getElementById('bitmoji-icon');
    const suggestionPopup = document.getElementById('recipe-suggestion-popup');
    const closePopup = document.querySelector('.close-popup');
    const suggestedRecipeContent = document.getElementById('suggested-recipe-content');
    const viewSuggestionBtn = document.getElementById('view-suggestion-btn');
    const newSuggestionBtn = document.getElementById('new-suggestion-btn');


    bitmojiIcon.onerror = function() {
        this.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
    };


    let allRecipes = [];
    let currentSuggestion = null;


    fetch('recipes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(recipes => {
            allRecipes = recipes;
            console.log('Recipes loaded for suggestions:', allRecipes.length);

            // Try to add any user added recipes from localStorage
            try {
                const userRecipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
                allRecipes = [...allRecipes, ...userRecipes];
            } catch (error) {
                console.error('Error loading user recipes:', error);
            }
        })
        .catch(error => {
            console.error('Error loading recipes for suggestions:', error);
            // Set some fallback recipes if JSON loading fails
            allRecipes = [
                {
                    id: 1,
                    name: "Dumplings (Guotie)",
                    continent: "asia",
                    country: "China",
                    ingredients: ["Wheat flour", "Ground pork", "Chinese cabbage"],
                    instructions: ["Fill dumpling wrappers with the mixture", "Pan-fry until crispy on the bottom"],
                    prepTime: 30,
                    image: "img/asia/dumplings-guotie.jpg"
                },
                {
                    id: 13,
                    name: "Churros",
                    continent: "europe",
                    country: "Spain",
                    ingredients: ["Flour", "Sugar", "Cinnamon"],
                    instructions: ["Pipe dough into hot oil", "Fry until golden"],
                    prepTime: 25,
                    image: "img/europe/churros.jpg"
                }
            ];
        });

    bitmojiIcon.addEventListener('click', () => {
        if (allRecipes.length > 0) {
            suggestRandomRecipe();
            suggestionPopup.style.display = 'block';
            document.body.classList.add('modal-open');

            // Add bounce animation to Bitmoji
            bitmojiIcon.style.animation = 'bounce 0.5s forwards';
        } else {
            alert('Still loading recipes... Please try again in a moment!');
        }
    });

    // Close popup when clicking the X
    closePopup.addEventListener('click', () => {
        closeRecipeSuggestion();
    });

    // Close popup when clicking outside
    suggestionPopup.addEventListener('click', (event) => {
        if (event.target === suggestionPopup) {
            closeRecipeSuggestion();
        }
    });

    viewSuggestionBtn.addEventListener('click', () => {
        if (currentSuggestion) {
            // Close the popup
            closeRecipeSuggestion();

            if (window.showRecipeDetails && typeof window.showRecipeDetails === 'function') {
                window.showRecipeDetails(currentSuggestion);
            } else {

                window.location.href = `recipes.html?continent=${currentSuggestion.continent}`;
            }
        }
    });

    newSuggestionBtn.addEventListener('click', () => {
        suggestRandomRecipe();
    });

    function suggestRandomRecipe() {
        // Get a random recipe
        const randomIndex = Math.floor(Math.random() * allRecipes.length);
        currentSuggestion = allRecipes[randomIndex];

        const recipeHTML = `
            <img src="${currentSuggestion.image}" alt="${currentSuggestion.name}" onerror="this.src='https://via.placeholder.com/500x300?text=${encodeURIComponent(currentSuggestion.name)}'">
            <div class="recipe-suggestion-name">${currentSuggestion.name}</div>
            <div class="recipe-suggestion-country"><i class="fas fa-map-marker-alt"></i> ${currentSuggestion.country}</div>
            <div class="recipe-suggestion-time"><i class="fas fa-clock"></i> Prep time: ${currentSuggestion.prepTime} minutes</div>
        `;

        suggestedRecipeContent.innerHTML = recipeHTML;


        suggestedRecipeContent.classList.add('suggestion-animation');

        setTimeout(() => {
            suggestedRecipeContent.classList.remove('suggestion-animation');
        }, 500);
    }

    function closeRecipeSuggestion() {
        suggestionPopup.style.display = 'none';
        document.body.classList.remove('modal-open');


        bitmojiIcon.style.animation = '';
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && suggestionPopup.style.display === 'block') {
            closeRecipeSuggestion();
        }
    });

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes bounce {
            0% { transform: scale(1); }
            50% { transform: scale(0.8); }
            100% { transform: scale(1); }
        }
        
        .suggestion-animation {
            animation: fade 0.3s ease;
        }
        
        @keyframes fade {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .modal-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(styleElement);
});