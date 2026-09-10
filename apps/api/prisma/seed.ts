import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const recipes = [
  { id: 'lemon-pasta', title: 'Lemony greens pasta', category: 'Quick', time: '20 min', difficulty: 'Easy', emoji: '🍋', description: 'Silky, bright pasta with greens, lemon, and parmesan for busy evenings.', ingredients: ['Spaghetti', 'Baby spinach', 'Lemon', 'Parmesan', 'Garlic'] },
  { id: 'coconut-curry', title: 'Golden coconut curry', category: 'Vegetarian', time: '35 min', difficulty: 'Easy', emoji: '🥥', description: 'A warm, generous bowl of vegetables simmered in fragrant coconut sauce.', ingredients: ['Sweet potato', 'Chickpeas', 'Coconut milk', 'Curry paste', 'Lime'] },
  { id: 'tomato-toast', title: 'Whipped feta tomato toast', category: 'Quick', time: '15 min', difficulty: 'Easy', emoji: '🍅', description: 'Crisp sourdough, creamy feta, and juicy tomatoes with a peppery finish.', ingredients: ['Sourdough', 'Feta', 'Cherry tomatoes', 'Basil', 'Olive oil'] },
  { id: 'miso-salmon', title: 'Miso glazed salmon', category: 'Comfort', time: '30 min', difficulty: 'Medium', emoji: '🐟', description: 'Tender salmon with a caramelized miso glaze and sesame rice.', ingredients: ['Salmon fillets', 'White miso', 'Soy sauce', 'Rice', 'Cucumber'] },
];

async function main() {
  for (const recipe of recipes) {
    await prisma.recipe.upsert({ where: { id: recipe.id }, update: recipe, create: recipe });
  }
}

main().finally(() => prisma.$disconnect());
