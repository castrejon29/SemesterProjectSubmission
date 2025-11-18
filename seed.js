// seed.js (compat)
const db_seed = firebase.firestore();

const starterExercises = [
    { name: "Bench Press", muscle: "Chest", equipment: "Barbell" },
    { name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbells" },
    { name: "Push Ups", muscle: "Chest", equipment: "Bodyweight" },

    { name: "Squat", muscle: "Legs", equipment: "Barbell" },
    { name: "Lunges", muscle: "Legs", equipment: "Bodyweight" },
    { name: "Leg Press", muscle: "Legs", equipment: "Machine" },

    { name: "Deadlift", muscle: "Back", equipment: "Barbell" },
    { name: "Lat Pulldown", muscle: "Back", equipment: "Machine" },
    { name: "Pull Ups", muscle: "Back", equipment: "Bodyweight" },

    { name: "Shoulder Press", muscle: "Shoulders", equipment: "Dumbbells" },
    { name: "Lateral Raises", muscle: "Shoulders", equipment: "Dumbbells" },

    { name: "Bicep Curls", muscle: "Arms", equipment: "Dumbbells" },
    { name: "Tricep Pushdown", muscle: "Arms", equipment: "Cable" },

    { name: "Planks", muscle: "Core", equipment: "Bodyweight" },
    { name: "Crunches", muscle: "Core", equipment: "Bodyweight" }
];

async function seedExercises() {
    try {
        for (const ex of starterExercises) {
            await db_seed.collection("exercises").add(ex);
        }
        alert("Exercise library successfully seeded!");
    } catch (err) {
        console.error("Seeding error:", err);
        alert("Error seeding exercises. Check console.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("seedBtn");
    if (btn) {
        btn.addEventListener("click", seedExercises);
    } else {
        console.error("seedBtn not found in DOM");
    }
});
