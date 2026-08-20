// ----------------------------------------------------
// NUTRIFLOW DIET APPLICATION LOGIC (app.js)
// ----------------------------------------------------

// Default Initial State
const DEFAULT_STATE = {
  user: {
    name: "Vikashini Balasubramanian",
    role: "Administrator",
    gender: "female",
    age: 28,
    height: 165,
    weight: 68.0,
    targetWeight: 60.0,
    activity: "light",
    dietType: "Balanced",
    goalType: "lose",
    customMacros: {
      carbs: 40,
      protein: 30,
      fats: 30
    }
  },
  dailyGoal: {
    calories: 1600,
    protein: 120,
    carbs: 160,
    fats: 53
  },
  logs: {},
  weightHistory: [
    { date: "2026-08-14", weight: 69.5 },
    { date: "2026-08-16", weight: 69.1 },
    { date: "2026-08-18", weight: 68.6 },
    { date: "2026-08-20", weight: 68.0 }
  ],
  measurementsHistory: [
    { date: "2026-08-14", waist: 82.0, chest: 94.0, hips: 102.5 },
    { date: "2026-08-20", waist: 80.5, chest: 93.5, hips: 101.0 }
  ],
  weeklyMealPlans: {
    Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null
  },
  customFoodsLibrary: []
};

// Active state
let state = {};
let activeSwap = null; // Stores { day, category } during active meal swapping
let instamartAddress = null;
let instamartCart = [];
let instamartQuery = "";

// Common Foods Library (Preseeded)
const FOOD_LIBRARY = [
  { name: "Chicken Breast", calories: 165, protein: 31.0, carbs: 0.0, fats: 3.6, baseGrams: 100 },
  { name: "Oatmeal", calories: 150, protein: 6.0, carbs: 27.0, fats: 2.5, baseGrams: 100 },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3, baseGrams: 100 },
  { name: "Whole Egg", calories: 143, protein: 12.6, carbs: 0.7, fats: 9.5, baseGrams: 100 },
  { name: "Salmon Filet", calories: 208, protein: 22.0, carbs: 0.0, fats: 13.0, baseGrams: 100 },
  { name: "White Rice (Cooked)", calories: 130, protein: 2.7, carbs: 28.0, fats: 0.3, baseGrams: 100 },
  { name: "Avocado", calories: 160, protein: 2.0, carbs: 8.5, fats: 14.7, baseGrams: 100 },
  { name: "Greek Yogurt", calories: 73, protein: 10.0, carbs: 3.6, fats: 1.9, baseGrams: 100 },
  { name: "Protein Powder (Whey)", calories: 400, protein: 80.0, carbs: 10.0, fats: 5.0, baseGrams: 100 },
  { name: "Apple", calories: 52, protein: 0.3, carbs: 13.8, fats: 0.2, baseGrams: 100 },
  { name: "Almonds", calories: 579, protein: 21.0, carbs: 21.6, fats: 49.9, baseGrams: 100 },
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7.0, fats: 0.4, baseGrams: 100 },
  { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20.1, fats: 0.1, baseGrams: 100 },
  { name: "Olive Oil", calories: 884, protein: 0.0, carbs: 0.0, fats: 100.0, baseGrams: 100 },
  { name: "Whole Wheat Bread", calories: 247, protein: 13.0, carbs: 41.0, fats: 3.4, baseGrams: 100 },
  { name: "Mixed Berries", calories: 50, protein: 1.0, carbs: 12.0, fats: 0.5, baseGrams: 100 },
  { name: "Skim Milk", calories: 35, protein: 3.4, carbs: 5.0, fats: 0.1, baseGrams: 100 },
  { name: "Peanut Butter", calories: 588, protein: 25.0, carbs: 20.0, fats: 50.0, baseGrams: 100 }
];

// Meal Plan Generator Database (Seeded options)
const PLANNER_FOODS_DATABASE = {
  Breakfast: [
    { name: "Oatmeal & Blueberries Parfait", calories: 290, protein: 10.5, carbs: 52.0, fats: 5.5 },
    { name: "Scrambled Eggs with Avocado", calories: 340, protein: 15.0, carbs: 7.0, fats: 28.0 },
    { name: "Protein Powder Chia Pudding", calories: 260, protein: 22.0, carbs: 18.0, fats: 8.5 },
    { name: "Whole Wheat Avocado Toast", calories: 220, protein: 6.0, carbs: 24.0, fats: 11.0 }
  ],
  "Morning Snack": [
    { name: "Apple & Almonds Handful", calories: 170, protein: 4.0, carbs: 18.0, fats: 10.0 },
    { name: "Low-Fat Cottage Cheese cup", calories: 120, protein: 14.0, carbs: 6.0, fats: 2.5 },
    { name: "Strawberry Greek Yogurt", calories: 110, protein: 12.0, carbs: 10.0, fats: 1.5 },
    { name: "Mixed Seeds & Walnuts", calories: 160, protein: 5.0, carbs: 8.0, fats: 13.0 }
  ],
  Lunch: [
    { name: "Grilled Chicken Quinoa Salad", calories: 460, protein: 38.0, carbs: 45.0, fats: 12.0 },
    { name: "Whole Wheat Turkey Wrap", calories: 390, protein: 29.0, carbs: 36.0, fats: 13.0 },
    { name: "Mediterranean Chickpea Bowl", calories: 420, protein: 14.0, carbs: 58.0, fats: 15.0 },
    { name: "Classic Tuna Salad Plate", calories: 350, protein: 31.0, carbs: 9.0, fats: 20.0 }
  ],
  "Evening Snack": [
    { name: "Protein Shake & Rice Cake", calories: 180, protein: 26.5, carbs: 12.0, fats: 2.0 },
    { name: "Carrots & Hummus dip", calories: 130, protein: 4.0, carbs: 18.0, fats: 5.5 },
    { name: "Almond Butter Celery Sticks", calories: 150, protein: 5.0, carbs: 10.0, fats: 11.5 },
    { name: "Hard Boiled Egg & Cucumber", calories: 95, protein: 7.0, carbs: 2.0, fats: 6.5 }
  ],
  Dinner: [
    { name: "Baked Garlic Herb Salmon", calories: 480, protein: 36.0, carbs: 4.0, fats: 34.0 },
    { name: "Lean Beef & Broccoli Stir-Fry", calories: 510, protein: 42.0, carbs: 32.0, fats: 15.0 },
    { name: "Pan-roasted Cod & Sweet Potato", calories: 410, protein: 32.0, carbs: 44.0, fats: 7.5 },
    { name: "Sesame Ginger Vegetable Tofu", calories: 360, protein: 18.0, carbs: 28.0, fats: 18.0 }
  ]
};

// Recipes Guide List
const RECIPES = [
  // BREAKFASTS
  {
    name: "Oatmeal & Blueberries Parfait",
    category: "Breakfast",
    description: "Classic dietary fiber-rich warm oatmeal layered with sweet blueberries.",
    calories: 290,
    protein: 11,
    carbs: 52,
    fats: 6,
    ingredients: ["50g Oats", "100ml skim milk (100g)", "50g fresh blueberries", "1 tsp honey (7g)"],
    instructions: "Boil oats in milk/water for 5 mins. Pour into bowl and top with blueberries and honey."
  },
  {
    name: "Scrambled Eggs with Avocado",
    category: "Breakfast",
    description: "Fluffy scrambled eggs cooked in real butter and served with creamy sliced avocado.",
    calories: 340,
    protein: 15,
    carbs: 7,
    fats: 28,
    ingredients: ["2 Large Eggs (110g)", "1/2 Avocado, sliced (75g)", "1 tsp Butter (5g)", "Salt & Pepper (to taste)"],
    instructions: "Whisk eggs with a pinch of salt. Melt butter in a skillet over medium heat, cook eggs until scrambled, and serve alongside fresh sliced avocado."
  },
  {
    name: "Protein Powder Chia Pudding",
    category: "Breakfast",
    description: "Creamy chia seed pudding infused with high-quality whey protein for long-lasting morning fullness.",
    calories: 260,
    protein: 22,
    carbs: 18,
    fats: 9,
    ingredients: ["3 tbsp Chia Seeds (30g)", "1 scoop Whey Protein (30g)", "150ml Almond Milk (150g)", "1/2 tsp Vanilla Extract (2g)"],
    instructions: "Stir chia seeds, protein powder, vanilla, and almond milk together in a jar. Cover and chill in the fridge overnight. Stir before serving."
  },
  {
    name: "Whole Wheat Avocado Toast",
    category: "Breakfast",
    description: "Simple toast topped with seasoned mashed avocado and crushed red pepper flakes.",
    calories: 220,
    protein: 6,
    carbs: 24,
    fats: 11,
    ingredients: ["1 slice Whole Wheat Bread (50g)", "1/2 Avocado (75g)", "1 tsp Lemon juice (5g)", "Red pepper flakes (1g)", "Salt & Pepper (to taste)"],
    instructions: "Toast the bread. Mash the avocado with lemon juice, salt, and pepper. Spread evenly on the toast and garnish with red pepper flakes."
  },

  // SNACKS
  {
    name: "Apple & Almonds Handful",
    category: "Snacks",
    description: "Fresh crisp apple slices served with raw unsalted almonds for a perfect healthy fat snack.",
    calories: 170,
    protein: 4,
    carbs: 18,
    fats: 10,
    ingredients: ["1 medium Apple (150g)", "15 raw Almonds (15g)"],
    instructions: "Wash and slice apple. Serve fresh fruit alongside a handful of raw almonds."
  },
  {
    name: "Low-Fat Cottage Cheese cup",
    category: "Snacks",
    description: "Creamy low-fat cottage cheese perfect for casein protein delivery.",
    calories: 120,
    protein: 14,
    carbs: 6,
    fats: 3,
    ingredients: ["1 cup Low-Fat Cottage Cheese (220g)", "50g fresh pineapple or mixed berries"],
    instructions: "Scoop cottage cheese into a small bowl. Top with pineapple cubes or fresh berries."
  },
  {
    name: "Strawberry Greek Yogurt",
    category: "Snacks",
    description: "High protein snack sweetened naturally with sliced fresh strawberries.",
    calories: 110,
    protein: 12,
    carbs: 10,
    fats: 2,
    ingredients: ["150g Greek Yogurt (150g)", "40g sliced Strawberries (40g)"],
    instructions: "Stir together in a small serving cup and eat immediately."
  },
  {
    name: "Mixed Seeds & Walnuts",
    category: "Snacks",
    description: "Power mix of healthy pumpkin seeds, sunflower seeds, and whole walnuts.",
    calories: 160,
    protein: 5,
    carbs: 8,
    fats: 13,
    ingredients: ["1 tbsp Pumpkin Seeds (15g)", "1 tbsp Sunflower Seeds (15g)", "5 Walnut halves (10g)"],
    instructions: "Combine all ingredients in a snack pack for raw, heart-healthy nibbles."
  },
  {
    name: "Protein Shake & Rice Cake",
    category: "Snacks",
    description: "Rapidly absorbed whey protein shake paired with crispy brown rice cakes.",
    calories: 180,
    protein: 27,
    carbs: 12,
    fats: 2,
    ingredients: ["1 scoop Whey Protein (30g)", "200ml water (200g)", "2 Brown Rice Cakes (18g)"],
    instructions: "Mix protein powder with cold water in a shaker. Enjoy alongside dry rice cakes."
  },
  {
    name: "Carrots & Hummus dip",
    category: "Snacks",
    description: "Crispy cold baby carrot sticks served with a savory portion of smooth chickpeas hummus.",
    calories: 130,
    protein: 4,
    carbs: 18,
    fats: 6,
    ingredients: ["10 Baby Carrots (100g)", "3 tbsp Hummus (45g)"],
    instructions: "Arrange carrots on a plate with hummus on the side for easy dipping."
  },
  {
    name: "Almond Butter Celery Sticks",
    category: "Snacks",
    description: "Crisp raw celery stalks filled with rich, creamy natural almond butter.",
    calories: 150,
    protein: 5,
    carbs: 10,
    fats: 12,
    ingredients: ["3 Celery stalks (120g)", "2 tbsp Almond Butter (32g)"],
    instructions: "Wash and clean celery. Cut into sticks and spread almond butter inside the curves."
  },
  {
    name: "Hard Boiled Egg & Cucumber",
    category: "Snacks",
    description: "Perfect hard-boiled egg served with hydrating sliced fresh cucumbers.",
    calories: 95,
    protein: 7,
    carbs: 2,
    fats: 7,
    ingredients: ["1 Large Egg (55g)", "100g Cucumber slices (100g)"],
    instructions: "Hard boil egg in water for 9 mins. Cool, peel, and cut in half. Serve with cucumber."
  },

  // LUNCHES
  {
    name: "Grilled Chicken Quinoa Salad",
    category: "Lunch",
    description: "Lean chicken breast, cooked quinoa, cucumbers, and tomatoes with lemon vinaigrette.",
    calories: 460,
    protein: 38,
    carbs: 45,
    fats: 12,
    ingredients: ["150g Chicken Breast (150g)", "1/2 cup cooked Quinoa (90g)", "1 cup chopped cucumbers/tomatoes (150g)", "1 tbsp lemon juice & olive oil (15g)"],
    instructions: "Season and grill chicken breast. Toss chicken, quinoa, and vegetables in a bowl with dressing."
  },
  {
    name: "Whole Wheat Turkey Wrap",
    category: "Lunch",
    description: "Smoked turkey breast, Swiss cheese, romaine lettuce, and light mayo in a wheat wrap.",
    calories: 390,
    protein: 29,
    carbs: 36,
    fats: 13,
    ingredients: ["1 Whole Wheat Wrap (45g)", "100g Smoked Turkey (100g)", "1 slice Swiss Cheese (20g)", "Romaine Lettuce (15g)", "1 tbsp light mayo (15g)"],
    instructions: "Spread mayo on wrap. Layer turkey, cheese, and lettuce. Roll tightly, cut in half and serve."
  },
  {
    name: "Mediterranean Chickpea Bowl",
    category: "Lunch",
    description: "High-fiber canned chickpeas, cucumber, cherry tomatoes, feta, and vinaigrette.",
    calories: 420,
    protein: 14,
    carbs: 58,
    fats: 15,
    ingredients: ["1 cup Chickpeas, rinsed (120g)", "50g Cherry Tomatoes (50g)", "50g Cucumber (50g)", "30g Feta cheese (30g)", "1 tbsp vinaigrette (15g)"],
    instructions: "Toss chickpeas and salad vegetables in a bowl. Top with crumbled feta and dress."
  },
  {
    name: "Classic Tuna Salad Plate",
    category: "Lunch",
    description: "Flaked tuna mixed with light Greek yogurt and celery, served on fresh garden greens.",
    calories: 350,
    protein: 31,
    carbs: 9,
    fats: 20,
    ingredients: ["1 can Tuna, drained (120g)", "1 tbsp Greek yogurt (15g)", "1 tbsp chopped Celery (10g)", "2 cups Mixed Greens (60g)"],
    instructions: "Stir tuna, Greek yogurt, and celery together. Serve on top of fresh mixed greens."
  },

  // DINNERS
  {
    name: "Baked Garlic Herb Salmon",
    category: "Dinner",
    description: "Salmon filet baked with aromatic herbs and minced garlic, served with asparagus.",
    calories: 480,
    protein: 36,
    carbs: 4,
    fats: 34,
    ingredients: ["150g Salmon filet (150g)", "1 clove Garlic, minced (5g)", "1 tsp Olive Oil (5g)", "Fresh Dill (2g)", "Lemon juice (5g)"],
    instructions: "Brush salmon with oil, garlic, and herbs. Bake at 400°F (200°C) for 12 mins. Squeeze lemon."
  },
  {
    name: "Lean Beef & Broccoli Stir-Fry",
    category: "Dinner",
    description: "Thinly sliced flank steak stir-fried with broccoli in low-sodium ginger soy sauce.",
    calories: 510,
    protein: 42,
    carbs: 32,
    fats: 15,
    ingredients: ["120g Flank Steak, sliced (120g)", "150g Broccoli florets (150g)", "1 tsp Sesame oil (5g)", "1 tbsp soy sauce (15g)", "Minced ginger (3g)"],
    instructions: "Sauté steak in oil. Add broccoli, ginger, and soy sauce. Stir-fry for 5 mins until hot."
  },
  {
    name: "Pan-roasted Cod & Sweet Potato",
    category: "Dinner",
    description: "Flaky cod filet pan-seared and served with roasted sweet potato cubes.",
    calories: 410,
    protein: 32,
    carbs: 44,
    fats: 8,
    ingredients: ["150g Cod filet (150g)", "120g Sweet Potato, cubed (120g)", "1 tbsp Olive Oil (15g)", "Salt & Paprika (to taste)"],
    instructions: "Roast sweet potatoes with oil and spices at 400°F for 20 mins. Pan-fry cod for 4 mins each side."
  },
  {
    name: "Sesame Ginger Vegetable Tofu",
    category: "Dinner",
    description: "Crispy firm tofu stir-fried with broccoli and snap peas in sesame-soy glaze.",
    calories: 360,
    protein: 18,
    carbs: 28,
    fats: 18,
    ingredients: ["120g Firm Tofu, cubed (120g)", "100g Broccoli (100g)", "50g Snap Peas (50g)", "1 tbsp Sesame oil (15g)", "Ginger soy sauce (20g)"],
    instructions: "Pan fry tofu cubes in sesame oil until golden. Toss in vegetables and ginger-soy sauce, stir-fry 4 minutes."
  }
];

// Active State Helpers
function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getHeaderDateString() {
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

// Get or initialize log for today
function getTodayLog() {
  const today = getTodayDateString();
  if (!state.logs[today]) {
    state.logs[today] = {
      meals: {
        Breakfast: [],
        "Morning Snack": [],
        Lunch: [],
        "Evening Snack": [],
        Dinner: []
      },
      water: 0,
      exercises: []
    };
  }
  return state.logs[today];
}

// ----------------------------------------------------
// LOCAL STORAGE SYSTEM
// ----------------------------------------------------
function loadState() {
  const stored = localStorage.getItem("nutriflow_state");
  if (stored) {
    try {
      state = JSON.parse(stored);
      // Fallbacks
      if (!state.logs) state.logs = {};
      if (!state.weightHistory) state.weightHistory = [];
      if (!state.measurementsHistory) state.measurementsHistory = [];
      if (!state.weeklyMealPlans) state.weeklyMealPlans = JSON.parse(JSON.stringify(DEFAULT_STATE.weeklyMealPlans));
      if (!state.customFoodsLibrary) state.customFoodsLibrary = [];
      if (!state.user) state.user = DEFAULT_STATE.user;
      if (!state.dailyGoal) state.dailyGoal = DEFAULT_STATE.dailyGoal;
    } catch (e) {
      console.error("Local storage corrupt, loading defaults", e);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
  }
}

function saveState() {
  localStorage.setItem("nutriflow_state", JSON.stringify(state));
}

// ----------------------------------------------------
// CALCULATORS & ENGINES
// ----------------------------------------------------
function recalculateGoals() {
  const u = state.user;
  let bmr = 0;
  
  if (u.gender === "male") {
    bmr = 10 * u.weight + 6.25 * u.height - 5 * u.age + 5;
  } else if (u.gender === "female") {
    bmr = 10 * u.weight + 6.25 * u.height - 5 * u.age - 161;
  } else {
    bmr = 10 * u.weight + 6.25 * u.height - 5 * u.age - 78;
  }

  let activityMultiplier = 1.2;
  if (u.activity === "light") activityMultiplier = 1.375;
  else if (u.activity === "moderate") activityMultiplier = 1.55;
  else if (u.activity === "active") activityMultiplier = 1.725;

  let tdee = bmr * activityMultiplier;

  let targetCalories = Math.round(tdee);
  if (u.goalType === "lose") {
    targetCalories = Math.round(tdee - 500);
    if (targetCalories < 1200) targetCalories = 1200;
  } else if (u.goalType === "gain") {
    targetCalories = Math.round(tdee + 500);
  }

  let carbsPct = 40, proteinPct = 30, fatsPct = 30;
  if (u.dietType === "Balanced") {
    carbsPct = 50; proteinPct = 20; fatsPct = 30;
  } else if (u.dietType === "High Protein") {
    carbsPct = 35; proteinPct = 35; fatsPct = 30;
  } else if (u.dietType === "Keto") {
    carbsPct = 5; proteinPct = 25; fatsPct = 70;
  } else if (u.dietType === "Low Carb") {
    carbsPct = 20; proteinPct = 40; fatsPct = 40;
  } else if (u.dietType === "custom" && u.customMacros) {
    carbsPct = u.customMacros.carbs;
    proteinPct = u.customMacros.protein;
    fatsPct = u.customMacros.fats;
  }

  let proteinGrams = Math.round((targetCalories * (proteinPct / 100)) / 4);
  let carbsGrams = Math.round((targetCalories * (carbsPct / 100)) / 4);
  let fatsGrams = Math.round((targetCalories * (fatsPct / 100)) / 9);

  state.dailyGoal = {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatsGrams
  };
  
  saveState();
}

function computeAIRecommendations(eatenCalories, targetCalories, eatenProtein, targetProtein, eatenCarbs, eatenFats, waterLogged) {
  const adviceDiv = document.getElementById("aiAdviceBox");
  if (!adviceDiv) return;

  let tips = [];
  
  if (waterLogged < 1250) {
    tips.push("Your water intake is low. Drink 2-3 glasses now to support kidney health and digestion.");
  }
  
  if (eatenCalories > targetCalories) {
    tips.push("You've exceeded your calorie budget. Focus on fiber-rich vegetables and walk for 20 minutes to improve glucose clearance.");
  } else if (eatenCalories > 0 && eatenCalories < targetCalories * 0.4) {
    tips.push("You have consumed very few calories. Make sure you don't skip meals to avoid late-night cravings.");
  }

  if (eatenCalories > 0 && eatenProtein < targetProtein * 0.5) {
    tips.push("Protein intake is low today. Consider adding egg whites, tuna, Greek yogurt, or whey protein to your upcoming snack/meal.");
  }

  if (eatenCalories > 0 && eatenCarbs > targetCalories * 0.6 / 4) {
    tips.push("Carbohydrates are running high. Pair your next meal with protein and healthy fats to minimize insulin spikes.");
  }

  if (tips.length === 0) {
    adviceDiv.innerHTML = "Your nutrition targets are perfectly balanced today. Keep up the excellent work!";
  } else {
    adviceDiv.innerHTML = tips[Math.floor(Math.random() * tips.length)];
  }
}

// ----------------------------------------------------
// MEAL PLANNER ENGINE
// ----------------------------------------------------
let activePlannedDay = "Mon";
let activeMealsSubTab = "meal-plan";

function generateDailyMealPlan(day, force = false) {
  if (!state.weeklyMealPlans) state.weeklyMealPlans = {};
  
  if (state.weeklyMealPlans[day] && !force) return;

  const newPlan = {};
  const categories = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];

  categories.forEach(cat => {
    const list = PLANNER_FOODS_DATABASE[cat];
    const randomIndex = Math.floor(Math.random() * list.length);
    newPlan[cat] = { ...list[randomIndex] };
  });

  state.weeklyMealPlans[day] = newPlan;
  saveState();
}

// Triggered when Swap Meal (↻) is clicked
window.swapMealItem = function(day, category) {
  // Clear any existing swapping highlights
  document.querySelectorAll(".planned-slot-item").forEach(item => {
    item.classList.remove("swapping-highlight");
  });

  // Activate Swap Mode state
  activeSwap = { day: day, category: category };
  
  // Highlight the clicked element
  const slotEl = document.querySelector(`[data-slot-category="${category}"]`);
  if (slotEl) {
    slotEl.classList.add("swapping-highlight");
  }

  // Open Swap Recipe Modal
  document.getElementById("swapRecipeSearchInput").value = "";
  renderSwapRecipesList("");
  document.getElementById("swapRecipeModal").classList.add("show");
};

window.cancelSwap = function() {
  activeSwap = null;
  document.getElementById("swapRecipeModal").classList.remove("show");
  document.querySelectorAll(".planned-slot-item").forEach(item => {
    item.classList.remove("swapping-highlight");
  });
};

// Render recipes inside the swap selection modal
window.renderSwapRecipesList = function(query = "") {
  const container = document.getElementById("swapRecipesList");
  if (!container) return;
  container.innerHTML = "";
  
  if (!activeSwap) return;
  
  const targetCategory = activeSwap.category;
  let targetFilter = targetCategory.includes("Snack") ? "Snacks" : targetCategory;
  const lowercaseQuery = query.toLowerCase().trim();
  
  // Filter recipes: first by category, then by search query
  const filtered = RECIPES.filter(rec => {
    const categoryMatch = (rec.category === targetFilter);
    let searchMatch = true;
    if (lowercaseQuery) {
      const nameMatch = rec.name.toLowerCase().includes(lowercaseQuery);
      const descMatch = rec.description.toLowerCase().includes(lowercaseQuery);
      const ingMatch = rec.ingredients.some(i => i.toLowerCase().includes(lowercaseQuery));
      searchMatch = nameMatch || descMatch || ingMatch;
    }
    return categoryMatch && searchMatch;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; font-size:12px; color:var(--color-muted); padding:16px;">No recipes matching "${targetFilter}" found.</div>`;
    return;
  }
  
  filtered.forEach(rec => {
    const item = document.createElement("div");
    item.className = "library-item";
    item.style.cursor = "pointer";
    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px;">
        <span class="library-item-name" style="font-weight:700; font-size:14px; color:var(--color-foreground);">${rec.name}</span>
        <span style="font-size:11px; color:var(--color-muted);">P: ${rec.protein}g · C: ${rec.carbs}g · F: ${rec.fats}g</span>
      </div>
      <span class="library-item-cals" style="font-weight:700; font-size:14px; color:var(--color-primary);">${rec.calories} kcal</span>
    `;
    item.onclick = () => {
      // Execute swap
      const swap = activeSwap;
      state.weeklyMealPlans[swap.day][swap.category] = {
        name: rec.name,
        calories: rec.calories,
        protein: rec.protein,
        carbs: rec.carbs,
        fats: rec.fats
      };
      
      // Save and Close
      saveState();
      activeSwap = null;
      document.getElementById("swapRecipeModal").classList.remove("show");
      updateUI();
      alert(`Swapped planned ${swap.category} on ${swap.day} with "${rec.name}"!`);
    };
    container.appendChild(item);
  });
};

function customizeMealItem(day, category) {
  if (!state.weeklyMealPlans[day]) return;
  const currentItem = state.weeklyMealPlans[day][category];
  
  const newName = prompt(`Enter custom food name for ${category}:`, currentItem.name);
  if (newName === null) return;
  
  const newCal = parseInt(prompt("Enter calories (kcal):", currentItem.calories));
  if (isNaN(newCal)) return;
  
  const newProt = parseFloat(prompt("Enter protein (g):", currentItem.protein));
  const newCarbs = parseFloat(prompt("Enter carbs (g):", currentItem.carbs));
  const newFats = parseFloat(prompt("Enter fats (g):", currentItem.fats));

  if (isNaN(newProt) || isNaN(newCarbs) || isNaN(newFats)) return;

  state.weeklyMealPlans[day][category] = {
    name: newName,
    calories: newCal,
    protein: newProt,
    carbs: newCarbs,
    fats: newFats
  };

  saveState();
  updateUI();
}

function logAllPlannedMeals() {
  const plan = state.weeklyMealPlans[activePlannedDay];
  if (!plan) {
    alert("No meal plan generated for " + activePlannedDay + " yet. Click 'Generate Menu' first.");
    return;
  }

  const log = getTodayLog();
  const categories = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];

  categories.forEach(cat => {
    const plannedFood = plan[cat];
    const duplicate = log.meals[cat].some(item => item.name === plannedFood.name);
    if (!duplicate) {
      log.meals[cat].push({
        name: plannedFood.name,
        calories: plannedFood.calories,
        protein: plannedFood.protein,
        carbs: plannedFood.carbs,
        fats: plannedFood.fats,
        servingSize: 100
      });
    }
  });

  saveState();
  updateUI();
  alert(`All planned items for ${activePlannedDay} successfully copied to today's logged meals!`);
}

// ----------------------------------------------------
// UI SYNCHRONIZER
// ----------------------------------------------------
function updateUI() {
  const log = getTodayLog();
  const goals = state.dailyGoal;
  const user = state.user;
  
  // --- Header ---
  document.getElementById("currentDateDisplay").innerText = getHeaderDateString();

  // --- Profile Snapshot ---
  document.getElementById("snapshotName").innerText = user.name;
  document.getElementById("snapshotDiet").innerText = user.role || `${user.dietType} Diet`;
  
  // Extract dynamic initials from username
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  const avatar = document.querySelector(".user-profile-snapshot .avatar");
  if (avatar) {
    avatar.innerText = initials || "U";
  }

  // --- Calorie / Macros Logging Calculations ---
  let eatenCalories = 0;
  let eatenProtein = 0;
  let eatenCarbs = 0;
  let eatenFats = 0;

  const categories = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];
  
  categories.forEach(cat => {
    let mealCal = 0, mealP = 0, mealC = 0, mealF = 0;
    const items = log.meals[cat] || [];
    
    items.forEach(item => {
      mealCal += item.calories;
      mealP += item.protein;
      mealC += item.carbs;
      mealF += item.fats;
    });

    eatenCalories += mealCal;
    eatenProtein += mealP;
    eatenCarbs += mealC;
    eatenFats += mealF;

    const elementIdBase = cat.toLowerCase().replace(" ", "");
    const calEl = document.getElementById(`${elementIdBase}Cal`);
    const protEl = document.getElementById(`${elementIdBase}Protein`);
    const carbEl = document.getElementById(`${elementIdBase}Carbs`);
    const fatEl = document.getElementById(`${elementIdBase}Fats`);
    
    if (calEl) calEl.innerText = Math.round(mealCal);
    if (protEl) protEl.innerText = Math.round(mealP);
    if (carbEl) carbEl.innerText = Math.round(mealC);
    if (fatEl) fatEl.innerText = Math.round(mealF);

    renderMealItemsList(cat, items);
  });

  // Calculate exercises
  let burnedCalories = 0;
  log.exercises.forEach(ex => {
    burnedCalories += ex.calories;
  });

  // Remaining calories
  let remainingCalories = Math.max(0, goals.calories - eatenCalories + burnedCalories);
  eatenProtein = Math.round(eatenProtein);
  eatenCarbs = Math.round(eatenCarbs);
  eatenFats = Math.round(eatenFats);

  document.getElementById("calRemainingVal").innerText = remainingCalories.toLocaleString();
  document.getElementById("calGoalVal").innerText = goals.calories.toLocaleString();
  document.getElementById("calEatenVal").innerText = eatenCalories.toLocaleString();
  document.getElementById("calBurnedVal").innerText = burnedCalories.toLocaleString();

  // Circular progress ring
  const ring = document.querySelector(".progress-ring__bar");
  if (ring) {
    const radius = ring.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(1, eatenCalories / (goals.calories + burnedCalories || 1));
    ring.style.strokeDasharray = `${circumference} ${circumference}`;
    ring.style.strokeDashoffset = circumference - (progress * circumference);
  }

  // Linear Macro progress bars
  document.getElementById("proteinCurrent").innerText = eatenProtein;
  document.getElementById("proteinGoal").innerText = goals.protein;
  document.getElementById("proteinBar").style.width = `${Math.min(100, (eatenProtein / (goals.protein || 1)) * 100)}%`;

  document.getElementById("carbsCurrent").innerText = eatenCarbs;
  document.getElementById("carbsGoal").innerText = goals.carbs;
  document.getElementById("carbsBar").style.width = `${Math.min(100, (eatenCarbs / (goals.carbs || 1)) * 100)}%`;

  document.getElementById("fatsCurrent").innerText = eatenFats;
  document.getElementById("fatsGoal").innerText = goals.fats;
  document.getElementById("fatsBar").style.width = `${Math.min(100, (eatenFats / (goals.fats || 1)) * 100)}%`;

  let pPct = 20, cPct = 50, fPct = 30;
  if (user.dietType === "High Protein") { pPct = 35; cPct = 35; fPct = 30; }
  else if (user.dietType === "Keto") { pPct = 25; cPct = 5; fPct = 70; }
  else if (user.dietType === "Low Carb") { pPct = 40; cPct = 20; fPct = 40; }
  else if (user.dietType === "custom") {
    pPct = user.customMacros.protein;
    cPct = user.customMacros.carbs;
    fPct = user.customMacros.fats;
  }
  document.getElementById("proteinPct").innerText = pPct;
  document.getElementById("carbsPct").innerText = cPct;
  document.getElementById("fatsPct").innerText = fPct;

  // --- Water Tracking ---
  document.getElementById("waterLoggedVal").innerText = log.water;
  document.getElementById("waterFill").style.height = `${Math.min(100, (log.water / 2500) * 100)}%`;

  // --- Exercises Logger ---
  renderExerciseList(log.exercises);

  // --- Profile Settings values binder ---
  document.getElementById("profileName").value = user.name;
  document.getElementById("profileGender").value = user.gender;
  document.getElementById("profileAge").value = user.age;
  document.getElementById("profileHeight").value = user.height;
  document.getElementById("profileWeight").value = user.weight;
  document.getElementById("profileTargetWeight").value = user.targetWeight;
  document.getElementById("profileActivity").value = user.activity;
  document.getElementById("profileDietType").value = user.dietType;
  document.getElementById("profileGoalType").value = user.goalType;

  if (user.dietType === "custom") {
    document.getElementById("customMacrosConfig").style.display = "block";
    document.getElementById("customCarbsPct").value = user.customMacros.carbs;
    document.getElementById("customCarbsVal").innerText = user.customMacros.carbs;
    document.getElementById("customProteinPct").value = user.customMacros.protein;
    document.getElementById("customProteinVal").innerText = user.customMacros.protein;
    document.getElementById("customFatsPct").value = user.customMacros.fats;
    document.getElementById("customFatsVal").innerText = user.customMacros.fats;
    document.getElementById("macroTotalVal").innerText = user.customMacros.carbs + user.customMacros.protein + user.customMacros.fats;
  } else {
    document.getElementById("customMacrosConfig").style.display = "none";
  }

  // --- Weight & Body Measurements history ---
  renderProgressRecords();

  // --- Recipes tab grids ---
  renderRecipesList();

  // --- Weekly Planner section renders ---
  renderMealPlanTab();

  // --- Dashboard Meal Plan & Snapshot widgets ---
  renderDashboardWidgets(log);

  // --- AI Adviser output trigger ---
  computeAIRecommendations(eatenCalories, goals.calories, eatenProtein, goals.protein, eatenCarbs, eatenFats, log.water);
}

// ----------------------------------------------------
// TAB & RENDERS SUB-ROUTINES
// ----------------------------------------------------

function renderMealItemsList(mealKey, items) {
  const elementIdBase = mealKey.toLowerCase().replace(" ", "");
  const container = document.getElementById(`${elementIdBase}Items`);
  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<li class="empty-meal-placeholder">No foods logged.</li>`;
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "meal-item";
    li.innerHTML = `
      <div class="meal-item-name-wrap">
        <span class="meal-item-name">${item.name}</span>
        <span class="meal-item-weight">${item.servingSize}g</span>
      </div>
      <div class="meal-item-macros-wrap">
        <div style="text-align: right;">
          <span class="meal-item-cals">${Math.round(item.calories)} kcal</span>
          <div class="meal-item-macros">P: ${Math.round(item.protein)}g · C: ${Math.round(item.carbs)}g · F: ${Math.round(item.fats)}g</div>
        </div>
        <button class="delete-meal-item-btn" onclick="deleteMealItem('${mealKey}', ${index})" aria-label="Delete food item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-17v6"/></svg>
        </button>
      </div>
    `;
    container.appendChild(li);
  });
}

// Delete logged food item
function deleteMealItem(mealKey, index) {
  const log = getTodayLog();
  if (log.meals[mealKey]) {
    log.meals[mealKey].splice(index, 1);
    saveState();
    updateUI();
  }
}

// Render Exercise rows
function renderExerciseList(exercises) {
  const container = document.getElementById("loggedActivities");
  if (!container) return;
  container.innerHTML = "";

  if (exercises.length === 0) {
    container.innerHTML = `<div class="empty-list-placeholder">No exercises logged today.</div>`;
    return;
  }

  exercises.forEach((ex, idx) => {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
      <div class="activity-item-info">
        <span class="activity-item-name">${ex.name}</span>
        <span class="activity-item-cals">-${ex.calories} kcal</span>
      </div>
      <button class="delete-activity-btn" onclick="deleteExercise(${idx})" aria-label="Delete exercise log">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-17v6"/></svg>
      </button>
    `;
    container.appendChild(item);
  });
}

function deleteExercise(idx) {
  const log = getTodayLog();
  log.exercises.splice(idx, 1);
  saveState();
  updateUI();
}

// Render Meal Plan tab inside Meals combined section
// Collapsible recipe toggle helper
window.toggleRecipeDetails = function(category) {
  const detailsBox = document.getElementById(`recipe-details-${category}`);
  const btn = document.getElementById(`btn-toggle-recipe-${category}`);
  if (!detailsBox || !btn) return;
  const btnSpan = btn.querySelector("span");
  if (!btnSpan) return;
  
  if (detailsBox.style.display === "none") {
    detailsBox.style.display = "block";
    btnSpan.innerText = "📖 Hide Recipe";
  } else {
    detailsBox.style.display = "none";
    btnSpan.innerText = "📖 View Recipe";
  }
};

function getIngredientTag(name) {
  const lower = name.toLowerCase();
  if (lower.includes("bread") || lower.includes("oat") || lower.includes("broccoli") || lower.includes("cucumber") || lower.includes("tomato") || lower.includes("carrot") || lower.includes("apple") || lower.includes("berry") || lower.includes("banana")) {
    return "Fiber rich";
  }
  if (lower.includes("avocado") || lower.includes("almond") || lower.includes("walnut") || lower.includes("seed") || lower.includes("oil") || lower.includes("butter") || lower.includes("cheese") || lower.includes("feta")) {
    return "Good fats";
  }
  if (lower.includes("salmon") || lower.includes("chicken") || lower.includes("turkey") || lower.includes("egg") || lower.includes("tofu") || lower.includes("protein") || lower.includes("yogurt") || lower.includes("paneer")) {
    return "High protein";
  }
  if (lower.includes("lemon") || lower.includes("ginger") || lower.includes("garlic") || lower.includes("pepper") || lower.includes("spice") || lower.includes("cinnamon")) {
    return "Immunity booster";
  }
  return "Vitamins & Min";
}

function getIngredientYouNeed(ingredientStr, cleanName) {
  let temp = ingredientStr.replace(new RegExp(cleanName, "i"), "").trim();
  temp = temp.replace(/\s+/g, " ");
  if (temp.startsWith("(") && temp.endsWith(")")) {
    temp = temp.substring(1, temp.length - 1);
  }
  if (temp === "") {
    return "1 unit";
  }
  return temp;
}

// Render Meal Plan tab inside Meals combined section
function renderMealPlanTab() {
  generateDailyMealPlan(activePlannedDay);
  
  document.getElementById("plannedDayTitle").innerText = `${activePlannedDay}'s Menu`;
  
  const plan = state.weeklyMealPlans[activePlannedDay];
  const list = document.getElementById("plannedSlotsList");
  if (!list) return;
  list.innerHTML = "";

  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  const categories = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];

  categories.forEach(cat => {
    const food = plan[cat];
    totalCal += food.calories;
    totalP += food.protein;
    totalC += food.carbs;
    totalF += food.fats;

    const item = document.createElement("div");
    item.className = "planned-slot-item";
    item.style.display = "flex";
    item.style.flexDirection = "column";
    item.style.gap = "8px";
    
    item.setAttribute("data-slot-category", cat);
    if (activeSwap && activeSwap.day === activePlannedDay && activeSwap.category === cat) {
      item.classList.add("swapping-highlight");
    }

    // Search recipe match
    const recipe = RECIPES.find(r => r.name.toLowerCase() === food.name.toLowerCase());
    let recipeHtml = "";
    if (recipe) {
      let initialTotal = 0;
      let initialCount = 0;
      
      const tableRowsHtml = recipe.ingredients.map(i => {
        // Extract clean name for Instamart search (e.g. "Avocado" from "1/2 Avocado (75g)")
        const cleanName = i.replace(/^\d+(\/\d+)?\s*(slice|slices|tsp|tbsp|g|ml|cup|clove|cloves|scoop|scoops|medium|raw|sliced|can|fresh|tbsp)?\s*/i, "")
                           .replace(/\(.*?\)/g, "")
                           .replace(/,.*$/, "")
                           .trim();
        
        // Find matching product
        const products = window.findInstamartProducts(cleanName);
        const p = (products && products.length > 0) ? products[0] : { name: `Fresh ${cleanName}`, brand: "Generic", weight: "1 unit", price: 40, spinId: "im_gen_01", img: "🛒" };
        
        initialTotal += p.price;
        initialCount++;
        
        const tag = getIngredientTag(cleanName);
        const youNeed = getIngredientYouNeed(i, cleanName);
        
        return `
          <tr class="im-grocery-row">
            <td style="display:flex; gap:10px; align-items:center; border-bottom: none;">
              <span style="font-size:24px;">${p.img}</span>
              <div style="display:flex; flex-direction:column; text-align:left;">
                <span style="font-weight:700; font-size:13px; color:var(--color-foreground);">${p.name}</span>
                <span class="im-badge-tag">${tag}</span>
              </div>
            </td>
            <td style="color:var(--color-muted); font-size:12px; font-weight:500;">
              ${youNeed}
            </td>
            <td style="color:#7E808C; font-weight:700; text-align:center;">➔</td>
            <td style="text-align:left; font-size:12px;">
              <strong style="color:var(--color-foreground); font-weight:700; display:block;">${p.weight}</strong>
              <span style="color:#FF5200; font-weight:700;">₹${p.price}</span>
            </td>
            <td>
              <div class="im-checkbox-wrapper">
                <input type="checkbox" checked class="im-row-checkbox" 
                       data-spinid="${p.spinId}" 
                       data-name="${p.name.replace(/'/g, "\\'")}" 
                       data-price="${p.price}" 
                       onchange="updateInstamartBatchButtonTotal('${cat}')">
              </div>
            </td>
          </tr>
        `;
      }).join("");

      recipeHtml = `
        <div class="planned-recipe-collapsible" style="margin-top: 4px; width:100%;">
          <button class="btn btn-text btn-sm" onclick="toggleRecipeDetails('${cat}')" id="btn-toggle-recipe-${cat}" style="padding: 0; font-size: 11px; color: var(--color-primary); font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: none; background: transparent; cursor: pointer;">
            <span>📖 View Recipe</span>
          </button>
          <div id="recipe-details-${cat}" class="planned-recipe-details" style="display: none; margin-top: 8px; padding: 16px; background-color: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; font-size: 12px; line-height: 1.4; width:100%;">
            
            <div id="recipe-details-container-${cat}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid var(--color-border); padding-bottom:8px;">
                <strong style="color:var(--color-foreground); font-size:14px; font-weight:800;">Ingredients</strong>
                <span class="im-text-muted" style="font-size:11px;">Select ingredients to order</span>
              </div>
              
              <div style="overflow-x:auto; width:100%; margin-bottom:16px;">
                <table class="im-grocery-table">
                  <thead>
                    <tr>
                      <th style="width:40%;">Ingredient</th>
                      <th style="width:25%;">You need (recipe)</th>
                      <th style="width:5%;"></th>
                      <th style="width:25%;">Instamart pack</th>
                      <th style="width:5%; text-align:center;">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                  </tbody>
                </table>
              </div>
              
              <div style="margin-bottom:16px;">
                <button class="im-batch-buy-btn im-btn-primary" onclick="addAllSelectedRecipeIngredientsToInstamart('${cat}')" 
                        style="padding: 12px; font-size:13px; width:100%; font-family:sans-serif; font-weight:700;">
                  🛒 Add ${initialCount} items to Instamart Cart (₹${initialTotal})
                </button>
              </div>
            </div>

            <div style="border-top:1px solid var(--color-border); padding-top:12px; margin-top:12px;">
              <strong style="color: var(--color-foreground); font-size:13px; font-weight:700;">Instructions:</strong>
              <p style="margin-top: 4px; color: var(--color-muted); line-height:1.5;">${recipe.instructions}</p>
            </div>
          </div>
        </div>
      `;
    }
    
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
        <div class="planned-slot-info">
          <span class="planned-slot-label">${cat}</span>
          <span class="planned-slot-food" style="font-size: 15px; font-weight: 700; display: block; margin-top: 2px;">${food.name}</span>
          <span class="planned-slot-macros" style="font-size: 11px; color: var(--color-muted); display: block; margin-top: 2px;">${food.calories} kcal · P: ${food.protein}g · C: ${food.carbs}g · F: ${food.fats}g</span>
        </div>
        <div class="planned-slot-actions" style="display: flex; gap: 8px;">
          <!-- Swap button redirects directly to Recipe Library -->
          <button class="btn btn-outline btn-icon" onclick="swapMealItem('${activePlannedDay}', '${cat}')" title="Swap and Choose from Recipes" style="width: 36px; height: 36px; border-radius: 50%; padding: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 1l4 4-4 4M21 5H9a5 5 0 0 0-5 5v3m3 8l-4-4 4-4m-4 4h12a5 5 0 0 0 5-5v-3"/></svg>
          </button>
          <!-- Edit button -->
          <button class="btn btn-outline btn-icon" onclick="customizeMealItem('${activePlannedDay}', '${cat}')" title="Customize Meal Details" style="width: 36px; height: 36px; border-radius: 50%; padding: 0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
        </div>
      </div>
      ${recipeHtml}
    `;
    list.appendChild(item);
  });

  // Target goals binder
  document.getElementById("planCalVal").innerText = `${totalCal} / ${state.dailyGoal.calories} kcal`;
  document.getElementById("planProteinVal").innerText = `${Math.round(totalP)}g / ${state.dailyGoal.protein}g`;
  document.getElementById("planCarbsVal").innerText = `${Math.round(totalC)}g / ${state.dailyGoal.carbs}g`;
  document.getElementById("planFatsVal").innerText = `${Math.round(totalF)}g / ${state.dailyGoal.fats}g`;
}

// Render Dashboard widgets
function renderDashboardWidgets(todayLog) {
  const wh = state.weightHistory;
  const startW = wh.length > 0 ? wh[0].weight : state.user.weight;
  const currW = wh.length > 0 ? wh[wh.length - 1].weight : state.user.weight;
  const delta = currW - startW;
  
  let deltaText = "--";
  if (delta < 0) deltaText = `${delta.toFixed(1)} kg`;
  else if (delta > 0) deltaText = `+${delta.toFixed(1)} kg`;
  else deltaText = "0.0 kg";

  document.getElementById("snapWeightDelta").innerText = deltaText;

  const mh = state.measurementsHistory;
  if (mh.length > 0) {
    const latest = mh[mh.length - 1];
    document.getElementById("snapWaist").innerText = `${latest.waist} cm`;
    document.getElementById("snapChest").innerText = `${latest.chest} cm`;
    document.getElementById("snapHips").innerText = `${latest.hips} cm`;
  } else {
    document.getElementById("snapWaist").innerText = "--";
    document.getElementById("snapChest").innerText = "--";
    document.getElementById("snapHips").innerText = "--";
  }

  // Dashboard planned meals preview list
  const container = document.getElementById("dashMealPlanList");
  if (!container) return;
  container.innerHTML = "";

  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = daysShort[new Date().getDay()];
  const todayPlannedDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(currentDay) ? currentDay : "Mon";
  
  generateDailyMealPlan(todayPlannedDay);
  const plan = state.weeklyMealPlans[todayPlannedDay];
  const categories = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];

  categories.forEach(cat => {
    const plannedFood = plan[cat];
    const isLogged = todayLog.meals[cat] && todayLog.meals[cat].some(item => item.name === plannedFood.name);
    
    const div = document.createElement("div");
    div.className = "dash-meal-slot";
    div.innerHTML = `
      <div>
        <span class="dash-meal-slot-name">${cat}</span>
        <div class="dash-meal-slot-food">${plannedFood.name}</div>
      </div>
      <span class="dash-meal-slot-status ${isLogged ? 'status-logged' : 'status-planned'}">
        ${isLogged ? 'Logged' : 'Planned'}
      </span>
    `;
    container.appendChild(div);
  });
}

// Progress metrics tables binder
function renderProgressRecords() {
  const history = state.weightHistory;
  const user = state.user;
  
  const startWeight = history.length > 0 ? history[0].weight : user.weight;
  const currentWeight = history.length > 0 ? history[history.length - 1].weight : user.weight;
  
  document.getElementById("startWeightVal").innerText = `${startWeight} kg`;
  document.getElementById("currentWeightVal").innerText = `${currentWeight} kg`;
  document.getElementById("targetWeightVal").innerText = `${user.targetWeight} kg`;

  // Weight History Table
  const tbody = document.getElementById("weightHistoryBody");
  if (tbody) {
    tbody.innerHTML = "";
    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-muted);">No weight history recorded.</td></tr>`;
    } else {
      const sorted = [...history].reverse();
      sorted.forEach(w => {
        let changeText = "--";
        let changeClass = "";
        const origIndex = history.findIndex(item => item.date === w.date);
        
        if (origIndex > 0) {
          const diff = w.weight - history[origIndex - 1].weight;
          if (diff > 0) { changeText = `+${diff.toFixed(1)} kg`; changeClass = "text-accent"; }
          else if (diff < 0) { changeText = `${diff.toFixed(1)} kg`; changeClass = "text-primary"; }
          else changeText = "0.0 kg";
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${w.date}</td>
          <td>${w.weight} kg</td>
          <td class="${changeClass}">${changeText}</td>
          <td style="text-align: right;">
            <button class="delete-meal-item-btn" style="display:inline-flex;" onclick="deleteWeightEntry('${w.date}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-17v6"/></svg>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  // Measurements History Table
  const mbody = document.getElementById("measurementsHistoryBody");
  if (mbody) {
    mbody.innerHTML = "";
    const mHistory = state.measurementsHistory || [];
    if (mHistory.length === 0) {
      mbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-muted);">No body measurements logged.</td></tr>`;
    } else {
      const mSorted = [...mHistory].reverse();
      mSorted.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${m.date}</td>
          <td>${m.waist} cm</td>
          <td>${m.chest} cm</td>
          <td>${m.hips} cm</td>
          <td style="text-align: right;">
            <button class="delete-meal-item-btn" style="display:inline-flex;" onclick="deleteMeasurementEntry('${m.date}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-17v6"/></svg>
            </button>
          </td>
        `;
        mbody.appendChild(tr);
      });
    }
  }

  drawWeightChart();
}

window.deleteWeightEntry = function(date) {
  state.weightHistory = state.weightHistory.filter(w => w.date !== date);
  saveState();
  updateUI();
};

window.deleteMeasurementEntry = function(date) {
  state.measurementsHistory = state.measurementsHistory.filter(m => m.date !== date);
  saveState();
  updateUI();
};

// SVG Weight chart plotter
function drawWeightChart() {
  const svg = document.getElementById("weightSvgChart");
  if (!svg) return;
  svg.innerHTML = "";

  const data = state.weightHistory;
  if (data.length < 2) {
    svg.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="chart-text" style="font-size: 13px;">
        Record at least 2 weight logs to generate charts.
      </text>
    `;
    return;
  }

  const width = svg.clientWidth || 500;
  const height = 240;
  const paddingX = 40;
  const paddingY = 40;

  const weights = data.map(d => d.weight);
  let maxW = Math.max(...weights);
  let minW = Math.min(...weights);

  if (maxW === minW) { maxW += 5; minW -= 5; }
  else {
    const diff = maxW - minW;
    maxW += diff * 0.15;
    minW -= diff * 0.15;
  }

  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const ratio = i / gridLines;
    const yVal = minW + ratio * (maxW - minW);
    const yCoord = height - paddingY - ratio * (height - paddingY * 2);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", paddingX);
    line.setAttribute("y1", yCoord);
    line.setAttribute("x2", width - paddingX);
    line.setAttribute("y2", yCoord);
    line.setAttribute("class", "chart-grid-line");
    svg.appendChild(line);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", paddingX - 10);
    text.setAttribute("y", yCoord + 4);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("class", "chart-text");
    text.textContent = yVal.toFixed(1);
    svg.appendChild(text);
  }

  const points = [];
  data.forEach((entry, idx) => {
    const xCoord = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    const yRatio = (entry.weight - minW) / (maxW - minW);
    const yCoord = height - paddingY - yRatio * (height - paddingY * 2);
    points.push({ x: xCoord, y: yCoord, weight: entry.weight, date: entry.date });
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathD);
  path.setAttribute("class", "chart-path");
  svg.appendChild(path);

  points.forEach((pt, index) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", pt.x);
    circle.setAttribute("cy", pt.y);
    circle.setAttribute("r", 4);
    circle.setAttribute("class", "chart-dot");
    
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${pt.date}: ${pt.weight} kg`;
    circle.appendChild(title);
    svg.appendChild(circle);

    if (data.length <= 6 || index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 5) === 0) {
      const parts = pt.date.split('-');
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : pt.date;

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", pt.x);
      text.setAttribute("y", height - paddingY + 20);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "chart-text");
      text.textContent = label;
      svg.appendChild(text);
    }
  });
}

// Recipes list view binder with Search support
let activeRecipeFilter = "all";

function renderRecipesList() {
  const grid = document.getElementById("recipesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const searchInput = document.getElementById("recipeSearchInput");
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const filtered = RECIPES.filter(rec => {
    // 1. Tag Category Filter
    let categoryMatch = false;
    if (activeRecipeFilter === "all") {
      categoryMatch = true;
    } else if (activeRecipeFilter === "High Protein") {
      categoryMatch = (rec.protein >= 25);
    } else if (activeRecipeFilter === "Low Calorie") {
      categoryMatch = (rec.calories <= 300);
    } else {
      categoryMatch = (rec.category === activeRecipeFilter);
    }

    // 2. Search Keyword Filter
    let searchMatch = true;
    if (searchQuery) {
      const nameMatch = rec.name.toLowerCase().includes(searchQuery);
      const descMatch = rec.description.toLowerCase().includes(searchQuery);
      const ingMatch = rec.ingredients.some(i => i.toLowerCase().includes(searchQuery));
      searchMatch = nameMatch || descMatch || ingMatch;
    }

    return categoryMatch && searchMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--color-muted); padding: 32px 0;">No recipes matching active filters.</div>`;
    return;
  }

  filtered.forEach(rec => {
    const card = document.createElement("div");
    card.className = "card recipe-card";
    const ingredientsHtml = rec.ingredients.map(i => `<li>${i}</li>`).join("");

    // Show "Select as Replacement" button if activeSwap is set
    const ctaButtonText = activeSwap ? "Select as Replacement" : "Plan / Log Recipe";
    const ctaButtonClass = activeSwap ? "btn-accent" : "btn-primary";

    card.innerHTML = `
      <span class="recipe-tag">${rec.category}</span>
      <h3 style="margin-right: 75px; margin-bottom: 8px; font-size:16px;">${rec.name}</h3>
      <p class="recipe-desc">${rec.description}</p>
      
      <div class="recipe-macros-row">
        <div class="recipe-macro-item"><span>${rec.calories}</span><span>kcal</span></div>
        <div class="recipe-macro-item"><span>${rec.protein}g</span><span>Prot</span></div>
        <div class="recipe-macro-item"><span>${rec.carbs}g</span><span>Carbs</span></div>
        <div class="recipe-macro-item"><span>${rec.fats}g</span><span>Fats</span></div>
      </div>

      <div style="font-size: 11px; margin-bottom: 12px;">
        <strong style="display:block; margin-bottom:3px;">Ingredients:</strong>
        <ul style="padding-left:14px; color:var(--color-muted);">${ingredientsHtml}</ul>
      </div>

      <button class="btn ${ctaButtonClass} full-width" onclick="triggerRecipeAction('${rec.name}')" style="margin-top:auto;">
        ${ctaButtonText}
      </button>
    `;
    grid.appendChild(card);
  });
}

// Action button logic for recipes
window.triggerRecipeAction = function(recipeName) {
  const rec = RECIPES.find(r => r.name === recipeName);
  if (!rec) return;

  if (activeSwap) {
    // 1. Swap mode replacement logic
    const swap = activeSwap;
    state.weeklyMealPlans[swap.day][swap.category] = {
      name: rec.name,
      calories: rec.calories,
      protein: rec.protein,
      carbs: rec.carbs,
      fats: rec.fats
    };
    
    // Clear swap mode
    activeSwap = null;
    
    // Return and save
    saveState();
    updateUI();
    alert(`Swapped planned ${swap.category} on ${swap.day} with "${rec.name}"!`);
  } else {
    // Check if user wants to Plan or Log
    const action = prompt(`Choose action for "${rec.name}":\nType "PLAN" to add to ${activePlannedDay}'s menu planner, or\nType "LOG" to add to today's food intake logs:`, "PLAN");
    if (!action) return;

    const cleanedAction = action.trim().toUpperCase();
    if (cleanedAction === "PLAN") {
      const slot = prompt(`Add "${rec.name}" to which slot on ${activePlannedDay}?\n(Breakfast, Morning Snack, Lunch, Evening Snack, Dinner)`, "Breakfast");
      if (!slot) return;
      const valid = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];
      const cleanedSlot = slot.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      if (!valid.includes(cleanedSlot)) {
        alert("Invalid slot name.");
        return;
      }
      state.weeklyMealPlans[activePlannedDay][cleanedSlot] = {
        name: rec.name,
        calories: rec.calories,
        protein: rec.protein,
        carbs: rec.carbs,
        fats: rec.fats
      };
      saveState();
      updateUI();
      alert(`Planned "${rec.name}" for ${activePlannedDay}'s ${cleanedSlot}!`);
    } else if (cleanedAction === "LOG") {
      const meal = prompt(`Log "${rec.name}" to which eaten meal logs today?\n(Breakfast, Morning Snack, Lunch, Evening Snack, Dinner)`, "Breakfast");
      if (!meal) return;
      const valid = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];
      const cleanedMeal = meal.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      if (!valid.includes(cleanedMeal)) {
        alert("Invalid meal category.");
        return;
      }
      const log = getTodayLog();
      log.meals[cleanedMeal].push({
        name: rec.name,
        calories: rec.calories,
        protein: rec.protein,
        carbs: rec.carbs,
        fats: rec.fats,
        servingSize: 100
      });
      saveState();
      updateUI();
      alert(`Logged "${rec.name}" to your eaten ${cleanedMeal} logs!`);
    } else {
      alert("Invalid option. Please enter 'PLAN' or 'LOG'.");
    }
  }
};

// ----------------------------------------------------
// NAVIGATION & EVENT LISTENERS
// ----------------------------------------------------
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item, .mobile-nav-item, .mobile-settings-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      
      const titleMap = {
        dashboard: "Overview Dashboard",
        "meals-combined": "Meals Planner & Recipes",
        meals: "Daily Meal Logs",
        analytics: "Progress & Metrics Journal",
        settings: "Settings & Goals"
      };

      document.getElementById("pageTitle").innerText = titleMap[tabId] || "NutriFlow";

      // Reset Top active states
      navItems.forEach(i => i.classList.remove("active"));
      document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(el => el.classList.add("active"));

      tabContents.forEach(tab => {
        tab.classList.remove("active");
        if (tab.id === `tab-${tabId}`) tab.classList.add("active");
      });

      if (tabId === "analytics") {
        setTimeout(drawWeightChart, 100);
      }
    });
  });
}

function setupModals() {
  const modal = document.getElementById("foodModal");
  const closeBtn = document.getElementById("closeFoodModalBtn");
  let activeLoggingMeal = "Breakfast";

  const swapModal = document.getElementById("swapRecipeModal");
  const closeSwapBtn = document.getElementById("closeSwapModalBtn");
  const instamartModal = document.getElementById("instamartModal");
  const closeInstamartBtn = document.getElementById("closeInstamartModalBtn");

  closeBtn.onclick = () => modal.classList.remove("show");
  closeSwapBtn.onclick = () => {
    swapModal.classList.remove("show");
    window.cancelSwap();
  };
  if (closeInstamartBtn) {
    closeInstamartBtn.onclick = () => {
      window.closeInstamartModal();
    };
  }

  window.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("show");
    if (e.target === swapModal) {
      swapModal.classList.remove("show");
      window.cancelSwap();
    }
    if (e.target === instamartModal) {
      window.closeInstamartModal();
    }
  };

  document.getElementById("swapRecipeSearchInput").addEventListener("input", (e) => {
    renderSwapRecipesList(e.target.value);
  });

  document.addEventListener("click", (e) => {
    const buyBtn = e.target.closest(".instamart-buy-btn");
    if (buyBtn) {
      const query = buyBtn.getAttribute("data-query");
      window.openInstamartSearch(query);
    }

    const addBtn = e.target.closest(".add-meal-item-btn");
    if (addBtn) {
      activeLoggingMeal = addBtn.getAttribute("data-meal");
      document.getElementById("foodModalTitle").innerText = `Log Food to ${activeLoggingMeal}`;
      document.getElementById("servingAdjuster").style.display = "none";
      document.getElementById("foodSearchInput").value = "";
      renderLibrarySearch("");
      modal.classList.add("show");
    }
  });

  const searchTabBtn = document.getElementById("tabSelectCommonBtn");
  const customTabBtn = document.getElementById("tabCustomFoodBtn");
  const searchTabContent = document.getElementById("modalTabCommon");
  const customTabContent = document.getElementById("modalTabCustom");

  searchTabBtn.onclick = () => {
    searchTabBtn.classList.add("active");
    customTabBtn.classList.remove("active");
    searchTabContent.classList.add("active");
    customTabContent.classList.remove("active");
  };

  customTabBtn.onclick = () => {
    customTabBtn.classList.add("active");
    searchTabBtn.classList.remove("active");
    customTabContent.classList.add("active");
    searchTabContent.classList.remove("active");
  };

  let selectedFood = null;

  function renderLibrarySearch(query) {
    const container = document.getElementById("foodLibraryList");
    container.innerHTML = "";
    const lowercaseQuery = query.toLowerCase().trim();
    const combined = [...FOOD_LIBRARY, ...state.customFoodsLibrary];

    const filtered = combined.filter(f => f.name.toLowerCase().includes(lowercaseQuery));
    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; font-size:12px; color:var(--color-muted); padding:12px;">No matching foods found.</div>`;
      return;
    }

    filtered.forEach(food => {
      const item = document.createElement("div");
      item.className = "library-item";
      item.innerHTML = `
        <span class="library-item-name">${food.name}</span>
        <span class="library-item-cals">${food.calories} kcal <span style="font-size:10px; font-weight:normal; color:var(--color-muted);">/${food.baseGrams}g</span></span>
      `;
      item.onclick = () => {
        selectedFood = food;
        document.getElementById("selectedFoodName").innerText = food.name;
        document.getElementById("selectedFoodMacrosSummary").innerText = `${food.calories} kcal · P: ${food.protein}g · C: ${food.carbs}g · F: ${food.fats}g`;
        document.getElementById("foodServingGrams").value = food.baseGrams;
        document.getElementById("servingBaseInfo").innerText = `(Base: ${food.baseGrams}g)`;
        document.getElementById("adjustedCalVal").innerText = `${food.calories} kcal`;
        document.getElementById("servingAdjuster").style.display = "block";
      };
      container.appendChild(item);
    });
  }

  document.getElementById("foodSearchInput").addEventListener("input", (e) => {
    renderLibrarySearch(e.target.value);
  });

  document.getElementById("foodServingGrams").addEventListener("input", () => {
    if (!selectedFood) return;
    const val = parseFloat(document.getElementById("foodServingGrams").value) || 0;
    const ratio = val / selectedFood.baseGrams;
    document.getElementById("adjustedCalVal").innerText = `${Math.round(selectedFood.calories * ratio)} kcal`;
  });

  document.getElementById("addSelectedFoodToLogBtn").onclick = () => {
    if (!selectedFood) return;
    const val = parseFloat(document.getElementById("foodServingGrams").value);
    if (isNaN(val) || val <= 0) return;

    const ratio = val / selectedFood.baseGrams;
    const log = getTodayLog();
    log.meals[activeLoggingMeal].push({
      name: selectedFood.name,
      calories: selectedFood.calories * ratio,
      protein: selectedFood.protein * ratio,
      carbs: selectedFood.carbs * ratio,
      fats: selectedFood.fats * ratio,
      servingSize: val
    });

    saveState();
    updateUI();
    modal.classList.remove("show");
  };

  document.getElementById("customFoodForm").onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById("customFoodName").value.trim();
    const cals = parseFloat(document.getElementById("customFoodCalories").value);
    const prot = parseFloat(document.getElementById("customFoodProtein").value);
    const carbs = parseFloat(document.getElementById("customFoodCarbs").value);
    const fats = parseFloat(document.getElementById("customFoodFats").value);
    const serving = parseFloat(document.getElementById("customFoodServing").value);

    if (isNaN(cals) || isNaN(prot) || isNaN(carbs) || isNaN(fats) || isNaN(serving)) return;

    const log = getTodayLog();
    log.meals[activeLoggingMeal].push({
      name: name,
      calories: cals,
      protein: prot,
      carbs: carbs,
      fats: fats,
      servingSize: serving
    });

    if (document.getElementById("saveToLibraryCheckbox").checked) {
      state.customFoodsLibrary.push({
        name: name,
        calories: cals,
        protein: prot,
        carbs: carbs,
        fats: fats,
        baseGrams: serving
      });
    }

    saveState();
    updateUI();
    document.getElementById("customFoodForm").reset();
    modal.classList.remove("show");
  };
}

// ----------------------------------------------------
// GENERAL CLICK OPERATORS
// ----------------------------------------------------
window.addWater = function(amount) {
  const log = getTodayLog();
  log.water += amount;
  saveState();
  updateUI();
};

window.resetWater = function() {
  if (confirm("Reset water count?")) {
    const log = getTodayLog();
    log.water = 0;
    saveState();
    updateUI();
  }
};

document.getElementById("saveProgressBtn").onclick = () => {
  const wInput = document.getElementById("newWeightInput");
  const waistInput = document.getElementById("newWaistInput");
  const chestInput = document.getElementById("newChestInput");
  const hipsInput = document.getElementById("newHipsInput");

  const weight = parseFloat(wInput.value);
  const waist = parseFloat(waistInput.value);
  const chest = parseFloat(chestInput.value);
  const hips = parseFloat(hipsInput.value);
  
  const today = getTodayDateString();

  if (!isNaN(weight)) {
    if (weight > 10 && weight < 400) {
      const idx = state.weightHistory.findIndex(item => item.date === today);
      if (idx !== -1) state.weightHistory[idx].weight = weight;
      else state.weightHistory.push({ date: today, weight: weight });
      state.weightHistory.sort((a,b) => new Date(a.date) - new Date(b.date));
      state.user.weight = weight;
    } else {
      alert("Invalid weight value entered.");
      return;
    }
  }

  if (!isNaN(waist) || !isNaN(chest) || !isNaN(hips)) {
    const finalWaist = isNaN(waist) ? (state.measurementsHistory.length > 0 ? state.measurementsHistory[state.measurementsHistory.length - 1].waist : 0) : waist;
    const finalChest = isNaN(chest) ? (state.measurementsHistory.length > 0 ? state.measurementsHistory[state.measurementsHistory.length - 1].chest : 0) : chest;
    const finalHips = isNaN(hips) ? (state.measurementsHistory.length > 0 ? state.measurementsHistory[state.measurementsHistory.length - 1].hips : 0) : hips;

    const mIdx = state.measurementsHistory.findIndex(m => m.date === today);
    if (mIdx !== -1) {
      state.measurementsHistory[mIdx] = { date: today, waist: finalWaist, chest: finalChest, hips: finalHips };
    } else {
      state.measurementsHistory.push({ date: today, waist: finalWaist, chest: finalChest, hips: finalHips });
    }
    state.measurementsHistory.sort((a,b) => new Date(a.date) - new Date(b.date));
  }

  recalculateGoals();
  saveState();
  updateUI();
  
  wInput.value = "";
  waistInput.value = "";
  chestInput.value = "";
  hipsInput.value = "";
};

document.getElementById("logExerciseBtn").onclick = () => {
  const nameInput = document.getElementById("exerciseName");
  const calInput = document.getElementById("exerciseCalories");
  const name = nameInput.value.trim();
  const calories = parseInt(calInput.value);

  if (!name || isNaN(calories) || calories <= 0) return;

  const log = getTodayLog();
  log.exercises.push({ name: name, calories: calories });
  saveState();
  updateUI();

  nameInput.value = "";
  calInput.value = "";
};

function setupCustomSliders() {
  const cRange = document.getElementById("customCarbsPct");
  const pRange = document.getElementById("customProteinPct");
  const fRange = document.getElementById("customFatsPct");

  const cVal = document.getElementById("customCarbsVal");
  const pVal = document.getElementById("customProteinVal");
  const fVal = document.getElementById("customFatsVal");
  const totalVal = document.getElementById("macroTotalVal");
  const warning = document.getElementById("macroTotalWarning");

  function adjust() {
    const c = parseInt(cRange.value);
    const p = parseInt(pRange.value);
    const f = parseInt(fRange.value);
    const total = c + p + f;
    
    cVal.innerText = c;
    pVal.innerText = p;
    fVal.innerText = f;
    totalVal.innerText = total;

    if (total === 100) warning.style.color = "var(--color-primary)";
    else warning.style.color = "var(--color-destructive)";
  }

  cRange.addEventListener("input", adjust);
  pRange.addEventListener("input", adjust);
  fRange.addEventListener("input", adjust);
}

document.getElementById("settingsForm").onsubmit = (e) => {
  e.preventDefault();
  const user = state.user;
  
  user.name = document.getElementById("profileName").value.trim();
  user.gender = document.getElementById("profileGender").value;
  user.age = parseInt(document.getElementById("profileAge").value);
  user.height = parseInt(document.getElementById("profileHeight").value);
  user.weight = parseFloat(document.getElementById("profileWeight").value);
  user.targetWeight = parseFloat(document.getElementById("profileTargetWeight").value);
  user.activity = document.getElementById("profileActivity").value;
  user.dietType = document.getElementById("profileDietType").value;
  user.goalType = document.getElementById("profileGoalType").value;

  if (user.dietType === "custom") {
    const c = parseInt(document.getElementById("customCarbsPct").value);
    const p = parseInt(document.getElementById("customProteinPct").value);
    const f = parseInt(document.getElementById("customFatsPct").value);
    
    if (c + p + f !== 100) {
      alert("Custom macros split must equal 100%");
      return;
    }
    user.customMacros = { carbs: c, protein: p, fats: f };
  }

  const today = getTodayDateString();
  const idx = state.weightHistory.findIndex(item => item.date === today);
  if (idx !== -1) state.weightHistory[idx].weight = user.weight;
  else state.weightHistory.push({ date: today, weight: user.weight });
  state.weightHistory.sort((a,b) => new Date(a.date) - new Date(b.date));

  recalculateGoals();
  saveState();
  updateUI();
  alert("Settings updated!");
};

document.getElementById("resetAllDataBtn").onclick = () => {
  if (confirm("Reset everything? All logs will be deleted.")) {
    localStorage.removeItem("nutriflow_state");
    localStorage.removeItem("nutriflow_darkmode");
    location.reload();
  }
};

document.getElementById("quickAddCustomFoodBtn").onclick = () => {
  document.getElementById("foodModalTitle").innerText = "Log Food to Evening Snack";
  document.getElementById("servingAdjuster").style.display = "none";
  document.getElementById("tabCustomFoodBtn").click();
  document.getElementById("foodModal").classList.add("show");
};

  const searchInput = document.getElementById("recipeSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderRecipesList();
    });
  }

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeRecipeFilter = btn.getAttribute("data-filter");
      renderRecipesList();
    });
  });

document.querySelectorAll(".day-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".day-toggle").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activePlannedDay = btn.getAttribute("data-day");
    renderMealPlanTab();
  });
});

document.getElementById("generatePlanBtn").onclick = () => {
  generateDailyMealPlan(activePlannedDay, true);
  renderMealPlanTab();
};

document.getElementById("logAllPlannedMealsBtn").onclick = () => {
  logAllPlannedMeals();
};

// Dark Mode Toggle
document.getElementById("darkModeToggle").onclick = () => {
  document.body.classList.toggle("dark-mode");
  const sun = document.querySelector(".sun-icon");
  const moon = document.querySelector(".moon-icon");
  
  if (document.body.classList.contains("dark-mode")) {
    sun.style.display = "none";
    moon.style.display = "block";
    localStorage.setItem("nutriflow_darkmode", "enabled");
  } else {
    sun.style.display = "block";
    moon.style.display = "none";
    localStorage.setItem("nutriflow_darkmode", "disabled");
  }
};

function loadDarkModeSetting() {
  const dark = localStorage.getItem("nutriflow_darkmode");
  const sun = document.querySelector(".sun-icon");
  const moon = document.querySelector(".moon-icon");

  if (dark === "enabled") {
    document.body.classList.add("dark-mode");
    sun.style.display = "none";
    moon.style.display = "block";
  } else {
    document.body.classList.remove("dark-mode");
    sun.style.display = "block";
    moon.style.display = "none";
  }
}

// ----------------------------------------------------
// APPLICATION INITIALIZATION
// ----------------------------------------------------
function init() {
  loadState();
  loadDarkModeSetting();
  recalculateGoals();
  setupNavigation();
  setupModals();
  setupCustomSliders();
  updateUI();
  
  window.addEventListener("resize", drawWeightChart);
}

document.addEventListener("DOMContentLoaded", init);

// ====================================================
// SWIGGY INSTAMART INTEGRATION (MOCK CLIENT FLOW)
// ====================================================

const INSTAMART_CATALOG = {
  "avocado": [
    { name: "Organic Hass Avocado", brand: "Fresho", weight: "1 pc (approx. 180g)", price: 95, spinId: "im_avo_01", img: "🥑" },
    { name: "Imported Avocado Pack", brand: "Fresho", weight: "2 pcs (approx. 350g)", price: 180, spinId: "im_avo_02", img: "🥑" }
  ],
  "whole wheat bread": [
    { name: "100% Whole Wheat Bread", brand: "Modern", weight: "400g", price: 50, spinId: "im_wwb_01", img: "🍞" },
    { name: "100% Atta Bread", brand: "The English Oven", weight: "400g", price: 55, spinId: "im_wwb_02", img: "🍞" }
  ],
  "lemon juice": [
    { name: "Fresh Local Lemon", brand: "Fresho", weight: "4 pcs", price: 24, spinId: "im_lem_01", img: "🍋" },
    { name: "Lemoneez Juice", brand: "Dabur Homemade", weight: "250ml", price: 65, spinId: "im_lem_02", img: "🍋" }
  ],
  "red pepper flakes": [
    { name: "Red Chilli Flakes Sprinkler", brand: "Keya", weight: "45g", price: 85, spinId: "im_rpf_01", img: "🌶️" }
  ],
  "chickpeas": [
    { name: "Kabuli Chana (Chickpeas) Pack", brand: "Tata Sampann", weight: "500g", price: 75, spinId: "im_chp_01", img: "🥣" },
    { name: "Organic Chickpeas (Kabuli Chana)", brand: "Organic Tattva", weight: "500g", price: 90, spinId: "im_chp_02", img: "🥣" }
  ],
  "cherry tomatoes": [
    { name: "Fresh Cherry Tomatoes", brand: "Fresho", weight: "250g", price: 45, spinId: "im_ctm_01", img: "🍅" }
  ],
  "cucumber": [
    { name: "Fresh Cucumber (Local)", brand: "Fresho", weight: "500g", price: 30, spinId: "im_cuc_01", img: "🥒" }
  ],
  "feta cheese": [
    { name: "Classic Feta Cheese", brand: "Amul", weight: "200g", price: 195, spinId: "im_fet_01", img: "🧀" }
  ],
  "vinaigrette": [
    { name: "Italian Vinaigrette Salad Dressing", brand: "Veeba", weight: "250g", price: 140, spinId: "im_vin_01", img: "🧴" }
  ],
  "oats": [
    { name: "100% Natural Oats", brand: "Quaker", weight: "1kg", price: 190, spinId: "im_oat_01", img: "🌾" },
    { name: "Natural Oats Bag", brand: "Saffola", weight: "1kg", price: 185, spinId: "im_oat_02", img: "🌾" }
  ],
  "skim milk": [
    { name: "Amul Taaza Slim & Trim Milk", brand: "Amul", weight: "1L", price: 68, spinId: "im_smk_01", img: "🥛" }
  ],
  "blueberries": [
    { name: "Fresh Blueberries Cup", brand: "Fresho", weight: "125g", price: 220, spinId: "im_blu_01", img: "🫐" }
  ],
  "honey": [
    { name: "Pure Squeezy Honey", brand: "Dabur", weight: "250g", price: 115, spinId: "im_hon_01", img: "🍯" }
  ],
  "eggs": [
    { name: "Table Eggs White (Large)", brand: "Eggoz", weight: "6 pcs", price: 55, spinId: "im_egg_01", img: "🥚" }
  ],
  "butter": [
    { name: "Amul Pasteurised Butter", brand: "Amul", weight: "100g", price: 58, spinId: "im_but_01", img: "🧈" }
  ],
  "chia seeds": [
    { name: "Raw Chia Seeds Premium", brand: "True Elements", weight: "150g", price: 110, spinId: "im_chi_01", img: "🌾" }
  ],
  "whey protein": [
    { name: "100% Gold Standard Whey (Vanilla)", brand: "Optimum Nutrition", weight: "450g", price: 1850, spinId: "im_pro_01", img: "🥤" }
  ],
  "almond milk": [
    { name: "Unsweetened Almond Milk", brand: "Raw Pressery", weight: "1L", price: 199, spinId: "im_amk_01", img: "🥛" }
  ],
  "vanilla extract": [
    { name: "Pure Vanilla Extract", brand: "Sprig", weight: "50ml", price: 295, spinId: "im_van_01", img: "🧴" }
  ]
};

window.findInstamartProducts = function(query) {
  const q = query.toLowerCase().trim();
  for (const key in INSTAMART_CATALOG) {
    if (q.includes(key) || key.includes(q)) {
      return INSTAMART_CATALOG[key];
    }
  }
  return [
    { name: `Fresh Packaged ${query}`, brand: "Generic Quality", weight: "1 pack (approx. 200g)", price: 80, spinId: "im_gen_01", img: "🛍️" },
    { name: `Premium Organic ${query}`, brand: "Organics", weight: "1 pack (approx. 250g)", price: 120, spinId: "im_gen_02", img: "🛍️" }
  ];
};

window.openInstamartSearch = function(query) {
  instamartAddress = null;
  instamartCart = [];
  instamartQuery = query;
  
  const modal = document.getElementById("instamartModal");
  if (modal) {
    modal.classList.add("show");
    window.renderInstamartAddressStep();
  }
};

window.selectInstamartAddress = function(label, id, addressText) {
  instamartAddress = { label, id, addressText };
  window.renderInstamartProductsStep();
};

window.renderInstamartAddressStep = function() {
  const body = document.getElementById("instamartModalBody");
  if (!body) return;
  
  body.innerHTML = `
    <h4 class="im-text-foreground" style="margin-bottom:12px; font-weight: 800; font-size:15px; font-family:sans-serif;">1. Select Delivery Address</h4>
    <p class="im-text-muted" style="font-size:12px; color:var(--color-muted); margin-bottom:16px; font-family:sans-serif;">Instamart needs your location to check stock availability in nearby dark stores.</p>
    
    <div style="display:flex; flex-direction:column; gap:12px; font-family:sans-serif;">
      <div class="im-address-card" onclick="selectInstamartAddress('Home', 'addr_home_09X', 'Flat 402, Block A, Green Glen Layout, Bangalore')" style="cursor:pointer; padding:14px; border-radius:8px; display:flex; gap:12px; align-items:center;">
        <span style="font-size:24px;">🏠</span>
        <div style="display:flex; flex-direction:column; gap:2px; flex:1; text-align:left;">
          <span class="im-text-foreground" style="font-weight:700; font-size:14px;">Home</span>
          <span class="im-text-muted" style="font-size:11px;">Flat 402, Block A, Green Glen Layout, Bangalore</span>
        </div>
      </div>
      
      <div class="im-address-card" onclick="selectInstamartAddress('Work', 'addr_work_12Y', '6th Floor, Embassy TechVillage, Devarabisanahalli, Bangalore')" style="cursor:pointer; padding:14px; border-radius:8px; display:flex; gap:12px; align-items:center;">
        <span style="font-size:24px;">🏢</span>
        <div style="display:flex; flex-direction:column; gap:2px; flex:1; text-align:left;">
          <span class="im-text-foreground" style="font-weight:700; font-size:14px;">Work</span>
          <span class="im-text-muted" style="font-size:11px;">6th Floor, Embassy TechVillage, Devarabisanahalli, Bangalore</span>
        </div>
      </div>
    </div>
  `;
};

window.renderInstamartProductsStep = function() {
  const body = document.getElementById("instamartModalBody");
  if (!body) return;
  
  body.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; padding:30px 0; gap:16px; font-family:sans-serif;">
      <div style="width:40px; height:40px; border:4px solid #FFF6F0; border-top:4px solid #FF5200; border-radius:50%; animation: spin 1s infinite linear;"></div>
      <div class="im-text-muted" style="font-size:13px; text-align:center;">
        Running <strong>search_products</strong>...<br/>Checking stock for "${instamartQuery}" at ${instamartAddress.label} address.
      </div>
    </div>
  `;
  
  setTimeout(() => {
    const products = window.findInstamartProducts(instamartQuery);
    
    body.innerHTML = `
      <div style="font-family:sans-serif;">
        <div style="border:1px solid var(--color-border); border-radius:8px; padding:10px 12px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
            <span class="im-text-muted" style="font-size:9px; text-transform:uppercase; font-weight:700;">Delivering to</span>
            <span class="im-text-foreground" style="font-size:11px; font-weight:700;">${instamartAddress.label} - ${instamartAddress.addressText.substring(0, 30)}...</span>
          </div>
          <button class="btn btn-xs btn-outline" onclick="renderInstamartAddressStep()" style="font-size:10px; padding:4px 8px;">Change</button>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="im-text-foreground" style="font-size:13px; font-weight:700;">Search Results for "${instamartQuery}"</span>
          <span id="instamartCartIndicator" onclick="renderInstamartCartStep()" style="background:#FF5200; color:#FFF; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; cursor:pointer; display:none; align-items:center; gap:6px;">
            🛒 <span id="instamartCartCount">0</span> Items
          </span>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          ${products.map(p => `
            <div class="im-product-card" style="border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; gap:12px; align-items:center; text-align:left;">
                <span style="font-size:32px;">${p.img}</span>
                <div style="display:flex; flex-direction:column; gap:2px;">
                  <span class="im-text-foreground" style="font-weight:700; font-size:13px;">${p.name}</span>
                  <span class="im-text-muted" style="font-size:11px;">${p.brand} · ${p.weight}</span>
                  <span style="font-weight:700; font-size:14px; color:#FF5200; margin-top:2px;">₹${p.price}</span>
                </div>
              </div>
              
              <div id="instamart-actions-${p.spinId}">
                <button class="im-btn-primary" onclick="addInstamartItem('${p.spinId}', '${p.name.replace(/'/g, "\\'")}', ${p.price})" style="padding:6px 12px; font-size:12px; width:auto;">
                  + ADD
                </button>
              </div>
            </div>
          `).join("")}
        </div>

        <div style="border-top:1px dashed var(--color-border); padding-top:12px;">
          <span class="im-text-muted" style="font-size:11px; font-weight:700; text-transform:uppercase; display:block; margin-bottom:8px;">Similar Suggestions</span>
          <div class="im-product-card" style="border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center; opacity:0.8; font-size:12px;">
            <div style="display:flex; gap:10px; align-items:center; text-align:left;">
              <span style="font-size:24px;">🥦</span>
              <div style="display:flex; flex-direction:column;">
                <span class="im-text-foreground" style="font-weight:700;">Organic Fresh Broccoli</span>
                <span class="im-text-muted" style="font-size:10px;">Fresho · 250g</span>
              </div>
            </div>
            <span style="font-weight:700; color:#FF5200;">₹38</span>
          </div>
        </div>
      </div>
    `;
    updateInstamartCartIndicator();
  }, 800);
};

window.addInstamartItem = function(spinId, name, price) {
  const existing = instamartCart.find(item => item.spinId === spinId);
  if (existing) {
    existing.quantity++;
  } else {
    instamartCart.push({ spinId, name, price, quantity: 1 });
  }
  
  const actionDiv = document.getElementById(`instamart-actions-${spinId}`);
  if (actionDiv) {
    const qty = existing ? existing.quantity : 1;
    actionDiv.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; border:1px solid #FF5200; border-radius:6px; overflow:hidden; font-family:sans-serif;">
        <button onclick="changeInstamartQty('${spinId}', -1)" style="border:none; background:transparent; font-weight:700; padding:6px 10px; font-size:12px; color:#FF5200; cursor:pointer;">-</button>
        <span class="im-text-foreground" style="font-weight:700; font-size:12px;">${qty}</span>
        <button onclick="changeInstamartQty('${spinId}', 1)" style="border:none; background:transparent; font-weight:700; padding:6px 10px; font-size:12px; color:#FF5200; cursor:pointer;">+</button>
      </div>
    `;
  }
  
  updateInstamartCartIndicator();
};

window.changeInstamartQty = function(spinId, change) {
  const idx = instamartCart.findIndex(item => item.spinId === spinId);
  if (idx !== -1) {
    instamartCart[idx].quantity += change;
    const qty = instamartCart[idx].quantity;
    if (qty <= 0) {
      instamartCart.splice(idx, 1);
      const actionDiv = document.getElementById(`instamart-actions-${spinId}`);
      if (actionDiv) {
        actionDiv.innerHTML = `
          <button class="im-btn-primary" onclick="addInstamartItem('${spinId}', '', 0)" style="padding:6px 12px; font-size:12px; width:auto;">
            + ADD
          </button>
        `;
      }
    } else {
      const actionDiv = document.getElementById(`instamart-actions-${spinId}`);
      if (actionDiv) {
        actionDiv.querySelector("span").innerText = qty;
      }
    }
  }
  updateInstamartCartIndicator();
};

function updateInstamartCartIndicator() {
  const indicator = document.getElementById("instamartCartIndicator");
  const countSpan = document.getElementById("instamartCartCount");
  if (!indicator || !countSpan) return;
  
  const totalItems = instamartCart.reduce((sum, i) => sum + i.quantity, 0);
  if (totalItems > 0) {
    indicator.style.display = "inline-flex";
    countSpan.innerText = totalItems;
  } else {
    indicator.style.display = "none";
  }
}

window.renderInstamartCartStep = function() {
  const body = document.getElementById("instamartModalBody");
  if (!body) return;
  
  const itemsTotal = instamartCart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const delFee = itemsTotal >= 99 ? 29 : 49;
  const platformFee = 5;
  const gst = Math.round(itemsTotal * 0.05);
  const grandTotal = itemsTotal + delFee + platformFee + gst;
  
  let checkoutButtonHtml = "";
  if (itemsTotal < 99) {
    checkoutButtonHtml = `
      <div style="background-color:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:10px; color:#EF4444; font-size:11px; margin-bottom:12px; line-height:1.4; font-family:sans-serif; text-align:left;">
        ⚠️ <strong>Minimum Order Not Met:</strong> Swiggy Instamart requires a minimum product order value of <strong>₹99</strong> to deliver. Please add more items to checkout.
      </div>
      <button class="im-btn-primary full-width" onclick="renderInstamartProductsStep()" style="background:#8a8c96 !important; cursor:not-allowed;" disabled>
        Add More Items to Pay
      </button>
    `;
  } else {
    checkoutButtonHtml = `
      <button class="im-btn-primary full-width" onclick="renderInstamartPaymentStep(${grandTotal})" style="font-size:14px; padding:12px 0;">
        Proceed to Checkout (₹${grandTotal})
      </button>
    `;
  }

  body.innerHTML = `
    <div style="font-family:sans-serif;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
        <button onclick="renderInstamartProductsStep()" style="background:none; border:none; color:#FF5200; cursor:pointer; padding:0; display:flex; align-items:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <h4 class="im-text-foreground" style="margin:0; font-weight: 800; font-size:15px;">2. Review Cart & Bill</h4>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px; border-bottom:1px dashed var(--color-border); padding-bottom:12px;">
        ${instamartCart.map(item => `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;">
            <div style="display:flex; flex-direction:column; text-align:left;">
              <span class="im-text-foreground" style="font-weight:700;">${item.name}</span>
              <span class="im-text-muted" style="font-size:11px;">Qty: ${item.quantity} · ₹${item.price} each</span>
            </div>
            <span class="im-text-foreground" style="font-weight:700;">₹${item.price * item.quantity}</span>
          </div>
        `).join("")}
      </div>

      <div style="border:1px solid var(--color-border); border-radius:8px; padding:12px; margin-bottom:16px; font-size:12px; display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between;">
          <span class="im-text-muted">Item Total:</span>
          <span class="im-text-foreground" style="font-weight:600;">₹${itemsTotal}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="im-text-muted">Delivery Partner Fee:</span>
          <span class="im-text-foreground" style="font-weight:600;">₹${delFee}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="im-text-muted">Platform Fee:</span>
          <span class="im-text-foreground" style="font-weight:600;">₹${platformFee}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="im-text-muted">GST & Charges:</span>
          <span class="im-text-foreground" style="font-weight:600;">₹${gst}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px solid var(--color-border); padding-top:6px; margin-top:4px; font-size:13px;">
          <span class="im-text-foreground">To Pay:</span>
          <span style="color:#FF5200;">₹${grandTotal}</span>
        </div>
      </div>

      ${checkoutButtonHtml}
    </div>
  `;
};

window.renderInstamartPaymentStep = function(grandTotal) {
  const body = document.getElementById("instamartModalBody");
  if (!body) return;
  
  body.innerHTML = `
    <div style="font-family:sans-serif;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
        <button onclick="renderInstamartCartStep()" style="background:none; border:none; color:#FF5200; cursor:pointer; padding:0; display:flex; align-items:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <h4 class="im-text-foreground" style="margin:0; font-weight: 800; font-size:15px;">3. Select Payment Mode</h4>
      </div>

      <p class="im-text-muted" style="font-size:11px; margin-bottom:14px;">Pay instantly using UPI intent picker (powered by Swiggy Pay) or Cash on Delivery.</p>

      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
        <div class="im-payment-card" onclick="selectPaymentMethod('Google Pay', ${grandTotal})" style="cursor:pointer; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:16px; font-weight:900; color:#4285F4; font-family:sans-serif;">G</span>
            <span class="im-text-foreground" style="font-weight:700; font-size:13px;">Google Pay (UPI Intent)</span>
          </div>
          <span style="font-size:11px; color:#34A853; font-weight:700;">FAST</span>
        </div>

        <div class="im-payment-card" onclick="selectPaymentMethod('PhonePe', ${grandTotal})" style="cursor:pointer; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:16px; font-weight:900; color:#5f259f; font-family:sans-serif;">P</span>
            <span class="im-text-foreground" style="font-weight:700; font-size:13px;">PhonePe (UPI Intent)</span>
          </div>
          <span style="font-size:11px; color:#34A853; font-weight:700;">POPULAR</span>
        </div>

        <div class="im-payment-card" onclick="selectPaymentMethod('UPI Scan QR', ${grandTotal})" style="cursor:pointer; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:18px;">📱</span>
            <span class="im-text-foreground" style="font-weight:700; font-size:13px;">Scan UPI QR Code</span>
          </div>
          <span class="im-text-muted" style="font-size:11px;">ANY APP</span>
        </div>

        <div class="im-payment-card" onclick="selectPaymentMethod('Cash on Delivery', ${grandTotal})" style="cursor:pointer; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:18px;">💵</span>
            <span class="im-text-foreground" style="font-weight:700; font-size:13px;">Cash on Delivery (COD)</span>
          </div>
          <span class="im-text-muted" style="font-size:11px;">FALLBACK</span>
        </div>
      </div>
      
      <div class="im-text-muted" style="font-size:10px; text-align:center;">
        Transaction secured by Swiggy Builders Club PCI gateway.
      </div>
    </div>
  `;
};

window.selectPaymentMethod = function(methodName, grandTotal) {
  const body = document.getElementById("instamartModalBody");
  if (!body) return;
  
  if (methodName === "UPI Scan QR") {
    body.innerHTML = `
      <div style="font-family:sans-serif;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
          <button onclick="renderInstamartPaymentStep(${grandTotal})" style="background:none; border:none; color:#FF5200; cursor:pointer; padding:0; display:flex; align-items:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
          <h4 class="im-text-foreground" style="margin:0; font-weight: 800; font-size:15px;">Scan QR to Pay</h4>
        </div>
        
        <div style="display:flex; flex-direction:column; align-items:center; gap:14px; padding:10px 0;">
          <div style="background:#FFF; padding:12px; border-radius:12px; border:2px solid #FF5200; box-shadow:0 4px 12px rgba(255,82,0,0.15); display:inline-block;">
            <div style="width:160px; height:160px; background:repeating-conic-gradient(from 45deg, #000 0% 25%, #FFF 0% 50%) 50% / 20px 20px; border:4px solid #000;"></div>
          </div>
          <div class="im-text-foreground" style="font-size:14px; font-weight:700;">To Pay: ₹${grandTotal}</div>
          <p class="im-text-muted" style="font-size:11px; text-align:center; max-width:280px; margin:0;">Open Google Pay, PhonePe, Paytm, or any BHIM UPI app on your phone and scan the QR code above.</p>
          <button class="im-btn-primary full-width" onclick="simulateOrderCheckout('${methodName}')" style="margin-top:8px; padding:10px 0;">
            Simulate Payment Done
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  body.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; padding:32px 0; gap:16px; font-family:sans-serif;">
      <div style="width:40px; height:40px; border:4px solid #FFF6F0; border-top:4px solid #FF5200; border-radius:50%; animation: spin 1s infinite linear;"></div>
      <div class="im-text-muted" style="font-size:13px; text-align:center;">
        Connecting to <strong>${methodName}</strong>...<br/>Authorizing order transaction of ₹${grandTotal}.
      </div>
    </div>
  `;
  
  setTimeout(() => {
    window.simulateOrderCheckout(methodName);
  }, 1000);
};

window.simulateOrderCheckout = function(methodName) {
  const orderId = `IM-${Math.floor(1000000 + Math.random() * 9000000)}`;
  
  let stage = 0;
  const stages = [
    { title: "Order Placed", time: "Just now", desc: "Instamart store received order.", icon: "✅" },
    { title: "Delivery Partner Assigned", time: "1 min ago", desc: "Partner is riding to dark store.", icon: "🛵" },
    { title: "Packing Items", time: "Just now", desc: "Store staff picking fresh products.", icon: "🛍️" },
    { title: "Out for Delivery", time: "In progress...", desc: "ETA: 10 mins. Driving to your address.", icon: "🚴" },
    { title: "Delivered", time: "Future", desc: "Delivered at your doorstep.", icon: "🏡" }
  ];

  window.instamartTrackerInterval = setInterval(() => {
    if (stage < stages.length - 1) {
      stage++;
      window.updateTrackerView(orderId, stage, stages);
    } else {
      clearInterval(window.instamartTrackerInterval);
    }
  }, 4000);
  
  window.updateTrackerView(orderId, stage, stages);
};

window.updateTrackerView = function(orderId, currentStage, stages) {
  const body = document.getElementById("instamartModalBody");
  if (!body) return;
  
  body.innerHTML = `
    <div style="font-family:sans-serif;">
      <h4 class="im-text-foreground" style="margin-bottom:6px; font-weight: 800; font-size:15px;">Order Placed Successfully!</h4>
      <div class="im-text-muted" style="font-size:12px; margin-bottom:16px;">
        Order ID: <strong>${orderId}</strong> · Tracked via <strong>track_order</strong>
      </div>

      <div style="position:relative; display:flex; flex-direction:column; gap:20px; padding-left:24px; border-left:2px solid var(--color-border); margin-bottom:20px; text-align:left;">
        ${stages.map((st, idx) => {
          let isDone = idx <= currentStage;
          let isCurrent = idx === currentStage;
          let dotColor = isDone ? "#FF5200" : "var(--color-border)";
          let icon = st.icon;
          
          return `
            <div style="position:relative; text-align:left;">
              <div style="position:absolute; left:-33px; top:0; width:18px; height:18px; border-radius:50%; background:${isCurrent ? '#FFF' : dotColor}; border:3px solid ${dotColor}; display:flex; align-items:center; justify-content:center; font-size:10px; box-shadow:0 0 6px ${isCurrent ? 'rgba(255,82,0,0.4)' : 'transparent'};">
                ${isDone && !isCurrent ? "✓" : ""}
              </div>
              
              <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <span class="${isDone ? 'im-text-foreground' : 'im-text-muted'}" style="font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px;">
                  <span>${icon}</span> ${st.title}
                </span>
                <span class="${isCurrent ? 'im-text-primary' : 'im-text-muted'}" style="font-size:10px; font-weight:700;">${isCurrent ? 'ACTIVE' : st.time}</span>
              </div>
              <p class="im-text-muted" style="font-size:11px; margin-top:2px; line-height:1.3;">${st.desc}</p>
            </div>
          `;
        }).join("")}
      </div>

      <button class="im-btn-primary full-width" onclick="closeInstamartModal()" style="padding: 12px 0; font-size: 14px;">
        Close Tracking Screen
      </button>
    </div>
  `;
};

window.closeInstamartModal = function() {
  if (window.instamartTrackerInterval) {
    clearInterval(window.instamartTrackerInterval);
  }
  document.getElementById("instamartModal").classList.remove("show");
};

window.addAllRecipeIngredientsToInstamart = function(recipeName) {
  const recipe = RECIPES.find(r => r.name === recipeName);
  if (!recipe) return;
  
  instamartAddress = { label: "Home", id: "addr_home_09X", addressText: "Flat 402, Block A, Green Glen Layout, Bangalore" };
  instamartCart = [];
  
  recipe.ingredients.forEach(i => {
    const cleanName = i.replace(/^\d+(\/\d+)?\s*(slice|slices|tsp|tbsp|g|ml|cup|clove|cloves|scoop|scoops|medium|raw|sliced|can|fresh|tbsp)?\s*/i, "")
                       .replace(/\(.*?\)/g, "")
                       .replace(/,.*$/, "")
                       .trim();
    
    const products = window.findInstamartProducts(cleanName);
    if (products && products.length > 0) {
      const p = products[0];
      const existing = instamartCart.find(item => item.spinId === p.spinId);
      if (existing) {
        existing.quantity++;
      } else {
        instamartCart.push({
          spinId: p.spinId,
          name: p.name,
          price: p.price,
          quantity: 1
        });
      }
    }
  });
  
  const modal = document.getElementById("instamartModal");
  if (modal) {
    modal.classList.add("show");
    window.renderInstamartCartStep();
  }
};

window.updateInstamartBatchButtonTotal = function(cat) {
  const container = document.getElementById(`recipe-details-container-${cat}`);
  if (!container) return;
  
  const checkboxes = container.querySelectorAll(".im-row-checkbox");
  let total = 0;
  let count = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) {
      total += parseFloat(cb.getAttribute("data-price") || 0);
      count++;
    }
  });
  
  const btn = container.querySelector(".im-batch-buy-btn");
  if (btn) {
    if (count === 0) {
      btn.innerHTML = `🛒 Add selected to Instamart Cart`;
      btn.disabled = true;
      btn.style.opacity = 0.5;
      btn.style.cursor = "not-allowed";
    } else {
      btn.innerHTML = `🛒 Add ${count} items to Instamart Cart (₹${total})`;
      btn.disabled = false;
      btn.style.opacity = 1;
      btn.style.cursor = "pointer";
    }
  }
};

window.addAllSelectedRecipeIngredientsToInstamart = function(cat) {
  const container = document.getElementById(`recipe-details-container-${cat}`);
  if (!container) return;
  
  const checkboxes = container.querySelectorAll(".im-row-checkbox");
  
  instamartAddress = { label: "Home", id: "addr_home_09X", addressText: "Flat 402, Block A, Green Glen Layout, Bangalore" };
  instamartCart = [];
  
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const spinId = cb.getAttribute("data-spinid");
      const name = cb.getAttribute("data-name");
      const price = parseFloat(cb.getAttribute("data-price") || 0);
      
      const existing = instamartCart.find(item => item.spinId === spinId);
      if (existing) {
        existing.quantity++;
      } else {
        instamartCart.push({
          spinId,
          name,
          price,
          quantity: 1
        });
      }
    }
  });
  
  const modal = document.getElementById("instamartModal");
  if (modal) {
    modal.classList.add("show");
    window.renderInstamartCartStep();
  }
};
