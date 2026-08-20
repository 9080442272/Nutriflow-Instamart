# NutriFlow - Calorie & Diet Tracker

NutriFlow is a premium, client-side single-page application (SPA) designed to make tracking calories, macronutrients, water intake, and weight simple, highly interactive, and completely private.

## Key Features

1. **Intelligent BMR & TDEE Calculations**:
   Uses the clinically recognized **Mifflin-St Jeor formula** to calculate custom daily calorie requirements based on your gender, age, height, weight, activity level, and weight strategy (loss, maintenance, or surplus).
   
2. **Macronutrient Strategy Splits**:
   Automatic macro targets based on popular dietary plans:
   - **Balanced**: 50% Carbs, 20% Protein, 30% Fats
   - **High Protein**: 35% Carbs, 35% Protein, 30% Fats
   - **Ketogenic (Keto)**: 5% Carbs, 25% Protein, 70% Fats
   - **Low Carb**: 20% Carbs, 40% Protein, 40% Fats
   - **Custom Ratios**: Customize slider values to any breakdown summing to 100%.

3. **Daily Calorie Circular Progress Ring**:
   An SVG-driven visual dashboard tracking eaten vs remaining calories with live calculations.

4. **Meal Logging by Category**:
   Log food items for **Breakfast**, **Lunch**, **Dinner**, or **Snacks**. Choose from the pre-populated library, customize serving sizes in grams/ml, or write custom one-off items.

5. **Animated Water Glass**:
   Log water consumption (ml) with a fluid wave effect that fills up the glass container in real-time as you progress toward your daily target.

6. **Interactive Weight Analytics Chart**:
   An SVG trend line plotting weight changes over time. Features grid markings, interactive tooltip details, milestone logs (start weight, current weight, target weight), and an option to manage historical data.

7. **Healthy Recipes Library**:
   Pre-loaded dietary recipes with exact caloric and macro breakdowns. Add recipe portions straight to your meal logs with a single click.

8. **Privacy-First Data Storage**:
   All profiles, daily consumption records, custom foods library, and weight points are stored directly in your browser using `localStorage`. No accounts, no servers, and no trackers are used.

## Architecture

- **Structure**: Vanilla semantic HTML5 layout.
- **Styling**: Vanilla modern CSS using color variables, custom animations, flat geometric blocks, and responsive rules (optimised for mobile bottom tabs and desktop sidebar).
- **Behavior**: Pure Vanilla ES6 JavaScript state manager driving real-time UI synchronization.

## How to Run Locally

You can run NutriFlow directly by opening the `index.html` file in any modern web browser. 

Alternatively, you can run a local development server for a premium experience (e.g., handling asset resolution or debugging tools):

### Option A: Using Python (Native macOS / Linux)
In your terminal, navigate to the project directory and run:
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

### Option B: Using Node.js (npx)
If you have Node.js installed, run:
```bash
npx serve -s .
```
Then follow the port instructions printed on the screen.
