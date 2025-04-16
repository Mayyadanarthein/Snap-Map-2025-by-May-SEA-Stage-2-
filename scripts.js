
document.addEventListener('DOMContentLoaded', () => {

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    document.body.style.fontFamily = "'Poppins', sans-serif";

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        body {
            background-color: #f6f0e2;
            color: #333;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Playfair Display', serif;
        }
        
        .recipe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            padding: 25px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .recipe-card {
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .recipe-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .recipe-image {
            height: 200px;
            width: 100%;
            object-fit: cover;
        }
        
        .recipe-info {
            padding: 20px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        
        .recipe-info h3 {
            margin: 0 0 10px 0;
            font-size: 1.4rem;
            color: #333;
        }
        
        .recipe-country {
            font-style: italic;
            margin-bottom: 10px;
            color: #666;
        }
        
        .recipe-time {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .recipe-time i {
            margin-right: 5px;
        }
        
        .view-recipe {
            margin-top: auto;
            background: linear-gradient(90deg, #06e4e5, #06c5e5);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.9rem;
        }
        
        .view-recipe:hover {
            background: linear-gradient(90deg, #06c5e5, #06e4e5);
        }
        
        /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 30px;
            border: none;
            width: 85%;
            max-width: 700px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
        }
        
        .close {
            position: absolute;
            right: 20px;
            top: 15px;
            font-size: 28px;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
        }
        
        .close:hover {
            color: #333;
        }
        
        .recipe-details h2 {
            margin-top: 0;
            color: #333;
            font-size: 2rem;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
        }
        
        .recipe-details-image {
            width: 100%;
            max-height: 400px;
            object-fit: cover;
            border-radius: 10px;
            margin: 15px 0;
        }
        
        .recipe-details-country {
            font-style: italic;
            color: #666;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .recipe-details-time {
            color: #666;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }
        
        .recipe-details h3 {
            color: #333;
            margin: 25px 0 15px;
            font-size: 1.5rem;
        }
        
        .recipe-details ul, .recipe-details ol {
            padding-left: 25px;
        }
        
        .recipe-details li {
            margin-bottom: 8px;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(styleElement);

    const isHomePage = document.getElementById('world-map');
    const isRecipePage = document.querySelector('.recipe-catalog');

    if (isHomePage) {
        setupMapInteractions();
    }

    if (isRecipePage) {
        setupRecipeCatalog();
    }
});

function setupMapInteractions() {
    const continents = document.querySelectorAll('.continent');

    continents.forEach(continent => {
        continent.addEventListener('click', () => {
            let continentId = continent.id;
            console.log("Continent clicked:", continentId);
            window.location.href = `recipes.html?continent=${continentId}`;
        });
    });
}


function setupRecipeCatalog() {
    const recipeCatalog = document.querySelector('.recipe-catalog');
    const searchInput = document.getElementById('recipe-search');
    const searchButton = document.querySelector('button[id="search-button"]');
    const clearButton = document.querySelector('button[id="clear-search"]');
    const continentFilter = document.getElementById('continent-filter');
    const sortAZButton = document.querySelector('button[id="sort-az"]');
    const sortZAButton = document.querySelector('button[id="sort-za"]');
    const addRecipeButton = document.querySelector('button[id="add-recipe-btn"]');

    // Add loading message
    recipeCatalog.innerHTML = '<p style="text-align: center; padding: 30px; font-size: 1.1rem;">Loading delicious snacks from around the world...</p>';

    // Fetch recipes
    fetch('recipes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(recipes => {
            // Store all recipes and initialize filtered recipes
            let allRecipes = recipes;
            let filteredRecipes = [...allRecipes];


            const urlParams = new URLSearchParams(window.location.search);
            const continentParam = urlParams.get('continent');

            if (continentParam && continentParam !== 'all') {
                continentFilter.value = continentParam;
                filteredRecipes = allRecipes.filter(recipe => recipe.continent === continentParam);
            }

            displayRecipes(filteredRecipes);

            // Search function
            function performSearch() {
                const searchTerm = searchInput.value.toLowerCase().trim();
                const continentValue = continentFilter.value;

                if (searchTerm === '' && continentValue === 'all') {
                    filteredRecipes = [...allRecipes];
                } else if (searchTerm === '') {
                    filteredRecipes = allRecipes.filter(recipe => recipe.continent === continentValue);
                } else if (continentValue === 'all') {
                    filteredRecipes = allRecipes.filter(recipe =>
                        recipe.name.toLowerCase().includes(searchTerm) ||
                        recipe.country.toLowerCase().includes(searchTerm)
                    );
                } else {
                    filteredRecipes = allRecipes.filter(recipe => {
                        const matchesContinent = recipe.continent === continentValue;
                        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                            recipe.country.toLowerCase().includes(searchTerm);
                        return matchesContinent && matchesSearch;
                    });
                }

                displayRecipes(filteredRecipes);
            }


            if (searchButton) {
                searchButton.addEventListener('click', performSearch);
            }

            if (searchInput) {
                searchInput.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        performSearch();
                    }
                });
            }

            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    searchInput.value = '';
                    performSearch();
                });
            }

            if (continentFilter) {
                continentFilter.addEventListener('change', performSearch);
            }

            if (sortAZButton) {
                sortAZButton.addEventListener('click', () => {
                    filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));
                    displayRecipes(filteredRecipes);
                });
            }

            if (sortZAButton) {
                sortZAButton.addEventListener('click', () => {
                    filteredRecipes.sort((a, b) => b.name.localeCompare(a.name));
                    displayRecipes(filteredRecipes);
                });
            }

            if (addRecipeButton) {
                addRecipeButton.addEventListener('click', () => {
                    showAddRecipeModal();
                });
            }
        })
        .catch(error => {
            console.error('Error loading recipes:', error);
            recipeCatalog.innerHTML = `
                <div style="text-align: center; color: #e74c3c; padding: 30px;">
                    <h3 style="font-size: 1.5rem;">Error loading recipes</h3>
                    <p>${error.message}</p>
                    <p>Please make sure recipes.json is in the same directory as this HTML file.</p>
                </div>
            `;
        });
}

function displayRecipes(recipes) {
    const recipeCatalog = document.querySelector('.recipe-catalog');

    
    recipeCatalog.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        recipeCatalog.innerHTML = '<p style="text-align: center; padding: 30px; font-size: 1.1rem;">No recipes found. Try adjusting your search or filters.</p>';
        return;
    }


    const recipeGrid = document.createElement('div');
    recipeGrid.className = 'recipe-grid';


    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';


        const image = document.createElement('img');
        const imageName = recipe.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const imagePath = `img/${recipe.continent}/${imageName}.jpg`;
        image.src = imagePath;
        image.alt = recipe.name;
        image.className = 'recipe-image';


        image.onerror = function() {
            this.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(recipe.name);
        };

        // Recipe info
        const info = document.createElement('div');
        info.className = 'recipe-info';

        const name = document.createElement('h3');
        name.textContent = recipe.name;

        const country = document.createElement('div');
        country.className = 'recipe-country';
        country.textContent = recipe.country;

        const time = document.createElement('div');
        time.className = 'recipe-time';
        time.innerHTML = `<i class="fas fa-clock"></i> ${recipe.prepTime} minutes`;

        const button = document.createElement('button');
        button.className = 'view-recipe';
        button.textContent = 'View Recipe';

        button.addEventListener('click', () => {
            showRecipeDetails(recipe);
        });

       
        info.appendChild(name);
        info.appendChild(country);
        info.appendChild(time);
        info.appendChild(button);

        
        card.appendChild(image);
        card.appendChild(info);

       
        recipeGrid.appendChild(card);
    });


    recipeCatalog.appendChild(recipeGrid);
}




function showRecipeDetails(recipe) {

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';


    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';


    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';

    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });


    const recipeDetails = document.createElement('div');
    recipeDetails.className = 'recipe-details';


    const title = document.createElement('h2');
    title.textContent = recipe.name;

    const image = document.createElement('img');
    const imageName = recipe.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const imagePath = `img/${recipe.continent}/${imageName}.jpg`;
    image.src = imagePath;
    image.alt = recipe.name;
    image.className = 'recipe-details-image';


    image.onerror = function() {
        this.src = 'https://via.placeholder.com/600x300?text=' + encodeURIComponent(recipe.name);
    };

    const country = document.createElement('div');
    country.className = 'recipe-details-country';
    country.textContent = `From: ${recipe.country}`;


    const prepTime = document.createElement('div');
    prepTime.className = 'recipe-details-time';
    prepTime.innerHTML = `<i class="fas fa-clock"></i> Preparation Time: ${recipe.prepTime} minutes`;


    const ingredientsTitle = document.createElement('h3');
    ingredientsTitle.textContent = 'Ingredients';

    const ingredientsList = document.createElement('ul');

    recipe.ingredients.forEach(ingredient => {
        const item = document.createElement('li');
        item.textContent = ingredient;
        ingredientsList.appendChild(item);
    });


    const instructionsTitle = document.createElement('h3');
    instructionsTitle.textContent = 'Instructions';

    const instructionsList = document.createElement('ol');

    recipe.instructions.forEach(instruction => {
        const item = document.createElement('li');
        item.textContent = instruction;
        instructionsList.appendChild(item);
    });

    recipeDetails.appendChild(title);
    recipeDetails.appendChild(image);
    recipeDetails.appendChild(country);
    recipeDetails.appendChild(prepTime);
    recipeDetails.appendChild(ingredientsTitle);
    recipeDetails.appendChild(ingredientsList);
    recipeDetails.appendChild(instructionsTitle);
    recipeDetails.appendChild(instructionsList);

   
    modalContent.appendChild(closeButton);
    modalContent.appendChild(recipeDetails);


    modal.appendChild(modalContent);

    
    document.body.appendChild(modal);

  
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}


function showAddRecipeModal() {
    // Create a simple alert for now
    alert("The Add Recipe feature will be available soon!");

}
