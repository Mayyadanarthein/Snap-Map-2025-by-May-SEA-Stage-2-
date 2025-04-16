// Enhanced recipes.js - Handles all functionality for the recipes page
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const recipeCatalog = document.querySelector('.recipe-catalog');
    const searchInput = document.getElementById('recipe-search');
    const searchButton = document.getElementById('search-button');
    const cancelSearchBtn = document.getElementById('cancel-search');
    const continentFilter = document.getElementById('continent-filter');
    const sortAZBtn = document.getElementById('sort-az');
    const sortZABtn = document.getElementById('sort-za');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const addRecipeModal = document.getElementById('add-recipe-modal');
    const closeModal = document.querySelector('.close');
    const recipeForm = document.getElementById('recipe-form');
    const formImagePreview = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('recipe-image');

    // Add loading message
    recipeCatalog.innerHTML = `
        <div class="loading-animation">
            <div class="pulse-circle"></div>
            <p>Looking for delicious snacks around the world...</p>
        </div>
    `;

    // Check URL parameters for continent filter
    const urlParams = new URLSearchParams(window.location.search);
    const continentParam = urlParams.get('continent');

    // Recipes arrays - will be populated from recipes.json and localStorage
    let allRecipes = [];
    let filteredRecipes = [];
    let currentSortOrder = 'asc';

    // Load and combine recipes from JSON and localStorage
    Promise.all([
        fetch('recipes.json').then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        }),
        Promise.resolve().then(() => {
            try {
                const storedRecipes = localStorage.getItem('userRecipes');
                return storedRecipes ? JSON.parse(storedRecipes) : [];
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return [];
            }
        })
    ])
        .then(([jsonRecipes, localRecipes]) => {
            // Ensure no duplicate IDs between JSON recipes and user recipes
            allRecipes = [...jsonRecipes];

            // Only add user recipes that are not duplicates
            if (localRecipes && localRecipes.length) {
                const existingIds = new Set(allRecipes.map(recipe => recipe.id));
                localRecipes.forEach(recipe => {
                    if (!existingIds.has(recipe.id)) {
                        allRecipes.push({...recipe, userAdded: true});
                        existingIds.add(recipe.id);
                    }
                });
            }

            // Apply continent filter if present in URL
            if (continentParam && continentParam !== 'all') {
                continentFilter.value = continentParam;
                filteredRecipes = allRecipes.filter(recipe => recipe.continent === continentParam);
            } else {
                filteredRecipes = [...allRecipes];
            }

            // Display recipes
            displayRecipes(filteredRecipes);

            // Set up event listeners
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error loading recipes:', error);
            recipeCatalog.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Recipes</h3>
                <p>${error.message}</p>
                <p>Please make sure recipes.json is in the same directory as this HTML file.</p>
            </div>
        `;
        });

    // Set up event listeners for user interactions
    function setupEventListeners() {
        // Search functionality
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });

        // Cancel search
        cancelSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            handleSearch();
        });

        // Continent filter
        continentFilter.addEventListener('change', handleFilter);

        // Sorting
        sortAZBtn.addEventListener('click', () => {
            currentSortOrder = 'asc';
            sortRecipes('asc');
            updateSortButtons();
        });

        sortZABtn.addEventListener('click', () => {
            currentSortOrder = 'desc';
            sortRecipes('desc');
            updateSortButtons();
        });

        // Add recipe modal
        addRecipeBtn.addEventListener('click', () => {
            addRecipeModal.style.display = 'block';
            document.body.classList.add('modal-open');
        });

        // Close modal
        closeModal.addEventListener('click', () => {
            addRecipeModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === addRecipeModal) {
                addRecipeModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        // Preview image when URL is entered
        if (imageUrlInput && formImagePreview) {
            imageUrlInput.addEventListener('input', () => {
                const imageUrl = imageUrlInput.value.trim();
                if (imageUrl) {
                    formImagePreview.src = imageUrl;
                    formImagePreview.style.display = 'block';
                } else {
                    formImagePreview.style.display = 'none';
                }
            });

            // Handle image load errors
            formImagePreview.addEventListener('error', () => {
                formImagePreview.src = 'https://via.placeholder.com/300x200?text=Image+Preview';
            });
        }

        // Handle recipe form submission
        recipeForm.addEventListener('submit', handleRecipeSubmit);
    }

    // Update sort button active states
    function updateSortButtons() {
        sortAZBtn.classList.toggle('active', currentSortOrder === 'asc');
        sortZABtn.classList.toggle('active', currentSortOrder === 'desc');
    }

    // Handle search functionality
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            // If search is cleared, apply only continent filter
            if (continentFilter.value === 'all') {
                filteredRecipes = [...allRecipes];
            } else {
                filteredRecipes = allRecipes.filter(recipe => recipe.continent === continentFilter.value);
            }
        } else {
            // Apply search term and continent filter
            filteredRecipes = allRecipes.filter(recipe => {
                const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                    recipe.country.toLowerCase().includes(searchTerm) ||
                    recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm));

                const matchesContinent = continentFilter.value === 'all' ||
                    recipe.continent === continentFilter.value;

                return matchesSearch && matchesContinent;
            });
        }

        sortRecipes(currentSortOrder);
    }

    // Handle continent filter
    function handleFilter() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (continentFilter.value === 'all') {
            // If 'All Continents' is selected, apply only search filter
            if (searchTerm === '') {
                filteredRecipes = [...allRecipes];
            } else {
                filteredRecipes = allRecipes.filter(recipe =>
                    recipe.name.toLowerCase().includes(searchTerm) ||
                    recipe.country.toLowerCase().includes(searchTerm) ||
                    recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
                );
            }
        } else {
            // Apply continent filter and search filter
            filteredRecipes = allRecipes.filter(recipe => {
                const matchesContinent = recipe.continent === continentFilter.value;

                if (searchTerm === '') {
                    return matchesContinent;
                } else {
                    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                        recipe.country.toLowerCase().includes(searchTerm) ||
                        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm));
                    return matchesContinent && matchesSearch;
                }
            });
        }

        sortRecipes(currentSortOrder);
    }

    // Sort recipes alphabetically
    function sortRecipes(direction) {
        if (direction === 'asc') {
            filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            filteredRecipes.sort((a, b) => b.name.localeCompare(a.name));
        }

        displayRecipes(filteredRecipes);
    }

    // Handle recipe form submission
    function handleRecipeSubmit(event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById('recipe-name').value;
        const continent = document.getElementById('recipe-continent').value;
        const country = document.getElementById('recipe-country').value;
        const ingredients = document.getElementById('recipe-ingredients').value
            .split('\n')
            .filter(item => item.trim() !== '');
        const instructions = document.getElementById('recipe-instructions').value
            .split('\n')
            .filter(item => item.trim() !== '');
        const prepTime = parseInt(document.getElementById('recipe-preptime').value);

        // For the image, use a placeholder if no URL is provided
        let image = document.getElementById('recipe-image').value.trim();

        if (!image) {
            // Default image based on continent
            const continentImages = {
                'asia': 'img/asia/placeholder.jpg',
                'africa': 'img/africa/placeholder.jpg',
                'europe': 'img/europe/placeholder.jpg',
                'north-america': 'img/north-america/placeholder.jpg',
                'south-america': 'img/south-america/placeholder.jpg',
                'australia': 'img/australia/placeholder.jpg',
                'antarctica': 'img/antarctica/placeholder.jpg'
            };

            image = continentImages[continent] || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(name);
        }

        // Create new recipe object with unique ID
        const newRecipe = {
            id: Date.now(), // Use timestamp as unique ID
            name,
            continent,
            country,
            ingredients,
            instructions,
            prepTime,
            image,
            userAdded: true
        };

        // Update local storage with new recipe
        let userRecipes = [];
        try {
            const storedRecipes = localStorage.getItem('userRecipes');
            if (storedRecipes) {
                userRecipes = JSON.parse(storedRecipes);
            }
        } catch (e) {
            console.error('Error reading from localStorage:', e);
        }

        userRecipes.push(newRecipe);
        localStorage.setItem('userRecipes', JSON.stringify(userRecipes));

        // Add recipe to our application state
        allRecipes.push(newRecipe);

        // Update filtered recipes and display if applicable
        if (continentFilter.value === 'all' || continentFilter.value === continent) {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm === '' ||
                name.toLowerCase().includes(searchTerm) ||
                country.toLowerCase().includes(searchTerm) ||
                ingredients.some(ing => ing.toLowerCase().includes(searchTerm))) {
                filteredRecipes.push(newRecipe);
                sortRecipes(currentSortOrder);
            }
        }

        // Show success message
        showSuccessMessage(`${name} has been added to your recipes!`);

        // Close modal and reset form
        addRecipeModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        recipeForm.reset();
        if (formImagePreview) {
            formImagePreview.style.display = 'none';
        }
    }

    // Success message function
    function showSuccessMessage(message) {
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;

        // Add to body
        document.body.appendChild(successMessage);

        // Remove after animation completes
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 3000);
    }

    // Display recipes in the catalog
    function displayRecipes(recipesToDisplay) {
        // Clear current recipes
        recipeCatalog.innerHTML = '';

        if (recipesToDisplay.length === 0) {
            recipeCatalog.innerHTML = `
                <div class="no-recipes-found">
                    <img src="img/no-results.svg" alt="No recipes found" onerror="this.src='https://via.placeholder.com/200x200?text=No+Recipes'">
                    <h3>No recipes found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }

        // Create recipe grid
        const recipeGrid = document.createElement('div');
        recipeGrid.className = 'recipe-grid';

        // Create recipe cards with staggered animation
        recipesToDisplay.forEach((recipe, index) => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.style.opacity = '0';
            recipeCard.style.transform = 'translateY(20px)';

            // Create recipe image
            const recipeImage = document.createElement('img');
            recipeImage.src = recipe.image;
            recipeImage.alt = recipe.name;
            recipeImage.classList.add('recipe-image');
            recipeImage.onerror = function() {
                this.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(recipe.name);
            };

            // Create recipe info
            const recipeInfo = document.createElement('div');
            recipeInfo.classList.add('recipe-info');

            // Recipe name
            const recipeName = document.createElement('h3');
            recipeName.textContent = recipe.name;

            // Recipe country
            const recipeCountry = document.createElement('div');
            recipeCountry.classList.add('recipe-country');
            recipeCountry.textContent = recipe.country;

            // Recipe prep time
            const recipeTime = document.createElement('div');
            recipeTime.classList.add('recipe-time');
            recipeTime.innerHTML = `<i class="fas fa-clock"></i> ${recipe.prepTime} minutes`;

            // View recipe button
            const viewRecipeBtn = document.createElement('button');
            viewRecipeBtn.classList.add('view-recipe');
            viewRecipeBtn.textContent = 'View Recipe';
            viewRecipeBtn.addEventListener('click', () => {
                showRecipeDetails(recipe);
            });

            // Add user added badge if applicable
            if (recipe.userAdded) {
                const badge = document.createElement('div');
                badge.className = 'user-added-badge';
                badge.innerHTML = '<i class="fas fa-user"></i> My Recipe';
                recipeInfo.appendChild(badge);
            }

            // Add elements to recipe info
            recipeInfo.appendChild(recipeName);
            recipeInfo.appendChild(recipeCountry);
            recipeInfo.appendChild(recipeTime);
            recipeInfo.appendChild(viewRecipeBtn);

            // Add elements to recipe card
            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeInfo);

            // Add recipe card to grid
            recipeGrid.appendChild(recipeCard);

            // Animate card with staggered entrance
            setTimeout(() => {
                recipeCard.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                recipeCard.style.opacity = '1';
                recipeCard.style.transform = 'translateY(0)';
            }, 50 * index);
        });

        // Add recipe grid to catalog
        recipeCatalog.appendChild(recipeGrid);
    }

    // Show recipe details in a modal
    function showRecipeDetails(recipe) {
        // Create modal
        const recipeModal = document.createElement('div');
        recipeModal.classList.add('modal', 'snapchat-modal');
        recipeModal.style.display = 'block';

        // Add modal-open class to body
        document.body.classList.add('modal-open');

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        // Close button
        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(recipeModal);
            document.body.classList.remove('modal-open');
        });

        // Recipe details
        const recipeDetails = document.createElement('div');
        recipeDetails.classList.add('recipe-details');

        // Recipe name
        const recipeName = document.createElement('h2');
        recipeName.textContent = recipe.name;

        // Recipe image
        const recipeImage = document.createElement('img');
        recipeImage.src = recipe.image;
        recipeImage.alt = recipe.name;
        recipeImage.classList.add('recipe-details-image');
        recipeImage.onerror = function() {
            this.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(recipe.name);
        };

        // Recipe details content container
        const detailsContent = document.createElement('div');
        detailsContent.classList.add('recipe-details-content');

        // Recipe header with country and time
        const detailsHeader = document.createElement('div');
        detailsHeader.classList.add('recipe-details-header');

        // Recipe origin info
        const recipeOrigin = document.createElement('div');
        recipeOrigin.classList.add('recipe-origin');

        // Recipe country
        const recipeCountry = document.createElement('div');
        recipeCountry.classList.add('recipe-details-country');
        recipeCountry.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${recipe.country}`;
        recipeOrigin.appendChild(recipeCountry);

        // Recipe prep time
        const recipeTime = document.createElement('div');
        recipeTime.classList.add('recipe-details-time');
        recipeTime.innerHTML = `<i class="fas fa-clock"></i> Preparation Time: ${recipe.prepTime} minutes`;
        recipeOrigin.appendChild(recipeTime);

        // Add origin info to header
        detailsHeader.appendChild(recipeOrigin);

        // Ingredients section
        const ingredientsSection = document.createElement('div');
        ingredientsSection.classList.add('recipe-section');

        const ingredientsTitle = document.createElement('h3');
        ingredientsTitle.innerHTML = '<i class="fas fa-list"></i> Ingredients';

        const ingredientsList = document.createElement('ul');
        recipe.ingredients.forEach(ingredient => {
            const item = document.createElement('li');
            item.textContent = ingredient;
            ingredientsList.appendChild(item);
        });

        ingredientsSection.appendChild(ingredientsTitle);
        ingredientsSection.appendChild(ingredientsList);

        // Instructions section
        const instructionsSection = document.createElement('div');
        instructionsSection.classList.add('recipe-section');

        const instructionsTitle = document.createElement('h3');
        instructionsTitle.innerHTML = '<i class="fas fa-utensils"></i> Instructions';

        const instructionsList = document.createElement('ol');
        recipe.instructions.forEach(instruction => {
            const item = document.createElement('li');
            item.textContent = instruction;
            instructionsList.appendChild(item);
        });

        instructionsSection.appendChild(instructionsTitle);
        instructionsSection.appendChild(instructionsList);

        // Add elements to details content
        detailsContent.appendChild(detailsHeader);
        detailsContent.appendChild(ingredientsSection);
        detailsContent.appendChild(instructionsSection);

        // Add user added badge if applicable
        if (recipe.userAdded) {
            const badge = document.createElement('div');
            badge.className = 'user-added-badge modal-badge';
            badge.innerHTML = '<i class="fas fa-user"></i> My Recipe';
            detailsContent.appendChild(badge);
        }

        // Add all elements to recipe details
        recipeDetails.appendChild(recipeName);
        recipeDetails.appendChild(recipeImage);
        recipeDetails.appendChild(detailsContent);

        // Add elements to modal content
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(recipeDetails);

        // Add modal content to modal
        recipeModal.appendChild(modalContent);

        // Add modal to body
        document.body.appendChild(recipeModal);

        // Close modal when clicking outside
        recipeModal.addEventListener('click', (event) => {
            if (event.target === recipeModal) {
                document.body.removeChild(recipeModal);
                document.body.classList.remove('modal-open');
            }
        });
    }
});