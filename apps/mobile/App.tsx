import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetchFavorites, fetchRecipes, hasSession, login, register, setFavorite } from './src/api';

type Recipe = {
  id: string;
  title: string;
  category: string;
  time: string;
  difficulty: string;
  emoji: string;
  description: string;
  ingredients: string[];
};

const categories = ['All', 'Quick', 'Vegetarian', 'Comfort'];

const recipes: Recipe[] = [
  {
    id: 'lemon-pasta',
    title: 'Lemony greens pasta',
    category: 'Quick',
    time: '20 min',
    difficulty: 'Easy',
    emoji: '🍋',
    description: 'Silky, bright pasta with greens, lemon, and parmesan for busy evenings.',
    ingredients: ['Spaghetti', 'Baby spinach', 'Lemon', 'Parmesan', 'Garlic'],
  },
  {
    id: 'coconut-curry',
    title: 'Golden coconut curry',
    category: 'Vegetarian',
    time: '35 min',
    difficulty: 'Easy',
    emoji: '🥥',
    description: 'A warm, generous bowl of vegetables simmered in fragrant coconut sauce.',
    ingredients: ['Sweet potato', 'Chickpeas', 'Coconut milk', 'Curry paste', 'Lime'],
  },
  {
    id: 'tomato-toast',
    title: 'Whipped feta tomato toast',
    category: 'Quick',
    time: '15 min',
    difficulty: 'Easy',
    emoji: '🍅',
    description: 'Crisp sourdough, creamy feta, and juicy tomatoes with a peppery finish.',
    ingredients: ['Sourdough', 'Feta', 'Cherry tomatoes', 'Basil', 'Olive oil'],
  },
  {
    id: 'miso-salmon',
    title: 'Miso glazed salmon',
    category: 'Comfort',
    time: '30 min',
    difficulty: 'Medium',
    emoji: '🐟',
    description: 'Tender salmon with a caramelized miso glaze and sesame rice.',
    ingredients: ['Salmon fillets', 'White miso', 'Soy sauce', 'Rice', 'Cucumber'],
  },
];

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [recipeList, setRecipeList] = useState<Recipe[]>(recipes);
  const [favorites, setFavorites] = useState<string[]>(['coconut-curry']);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    hasSession().then(setAuthenticated);
  }, []);

  if (authenticated === null) return <SafeAreaView style={styles.safeArea} />;
  if (!authenticated) return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;

  useEffect(() => {
    fetchRecipes().then((remoteRecipes) => setRecipeList(remoteRecipes)).catch(() => undefined);
    fetchFavorites().then((savedRecipes) => setFavorites(savedRecipes.map((recipe) => recipe.id))).catch(() => undefined);
  }, []);

  const filteredRecipes = useMemo(() => recipeList.filter((recipe) => {
    const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
    const searchText = `${recipe.title} ${recipe.description}`.toLowerCase();
    return matchesCategory && searchText.includes(query.toLowerCase().trim());
  }), [activeCategory, query]);

  const toggleFavorite = (id: string) => {
    const saved = !favorites.includes(id);
    setFavorites((current) => saved
      ? [...current, id]
      : current.filter((favorite) => favorite !== id));
    setFavorite(id, saved).catch(() => undefined);
  };

  if (selectedRecipe) {
    const isFavorite = favorites.includes(selectedRecipe.id);
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.detailPage}>
          <View style={styles.detailTopbar}>
            <Pressable onPress={() => setSelectedRecipe(null)} style={styles.backButton} accessibilityLabel="Back to recipes">
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Pressable onPress={() => toggleFavorite(selectedRecipe.id)} accessibilityLabel="Toggle favorite">
              <Text style={styles.favoriteIcon}>{isFavorite ? '♥' : '♡'}</Text>
            </Pressable>
          </View>
          <View style={styles.detailHero}>
            <Text style={styles.detailEmoji}>{selectedRecipe.emoji}</Text>
          </View>
          <Text style={styles.eyebrow}>{selectedRecipe.category.toUpperCase()}</Text>
          <Text style={styles.detailTitle}>{selectedRecipe.title}</Text>
          <Text style={styles.detailDescription}>{selectedRecipe.description}</Text>
          <View style={styles.metaRow}>
            <Meta label="TIME" value={selectedRecipe.time} />
            <Meta label="LEVEL" value={selectedRecipe.difficulty} />
            <Meta label="SAVES" value={`${favorites.includes(selectedRecipe.id) ? 1 : 0}`} />
          </View>
          <Text style={styles.sectionTitle}>What you need</Text>
          {selectedRecipe.ingredients.map((ingredient) => (
            <View key={ingredient} style={styles.ingredientRow}>
              <Text style={styles.ingredientDot}>•</Text>
              <Text style={styles.ingredient}>{ingredient}</Text>
            </View>
          ))}
          <Pressable style={styles.primaryButton} onPress={() => toggleFavorite(selectedRecipe.id)}>
            <Text style={styles.primaryButtonText}>{isFavorite ? 'Saved to my cookbook' : 'Save to my cookbook'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <FlatList
        data={filteredRecipes}
        keyExtractor={(recipe) => recipe.id}
        contentContainerStyle={styles.page}
        ListHeaderComponent={<>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>cookly<Text style={styles.brandDot}>.</Text></Text>
              <Text style={styles.greeting}>Good food, less fuss.</Text>
            </View>
            <View style={styles.avatar}><Text style={styles.avatarText}>C</Text></View>
          </View>
          <Text style={styles.heading}>What are you{`\n`}cooking today?</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput value={query} onChangeText={setQuery} placeholder="Search recipes" placeholderTextColor="#8B8A84" style={styles.searchInput} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {categories.map((category) => (
              <Pressable key={category} onPress={() => setActiveCategory(category)} style={[styles.category, activeCategory === category && styles.activeCategory]}>
                <Text style={[styles.categoryText, activeCategory === category && styles.activeCategoryText]}>{category}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fresh for you</Text>
            <Text style={styles.count}>{filteredRecipes.length} recipes</Text>
          </View>
        </>}
        renderItem={({ item }) => (
          <Pressable style={styles.recipeCard} onPress={() => setSelectedRecipe(item)}>
            <View style={styles.recipeImage}><Text style={styles.recipeEmoji}>{item.emoji}</Text></View>
            <View style={styles.recipeContent}>
              <View style={styles.recipeTitleRow}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={8} accessibilityLabel="Toggle favorite">
                  <Text style={styles.cardFavorite}>{favorites.includes(item.id) ? '♥' : '♡'}</Text>
                </Pressable>
              </View>
              <Text style={styles.recipeDescription} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.recipeMeta}>{item.time}  ·  {item.difficulty}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No recipes match that search.</Text>}
      />
    </SafeAreaView>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.includes('@') || password.length < 8 || (mode === 'register' && !name.trim())) {
      setError(mode === 'register' ? 'Enter your name, a valid email, and an 8-character password.' : 'Enter a valid email and an 8-character password.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'register') await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      onAuthenticated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to connect. Try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.authPage} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>cookly<Text style={styles.brandDot}>.</Text></Text>
        <Text style={styles.authEyebrow}>A BETTER WAY TO COOK</Text>
        <Text style={styles.authTitle}>{mode === 'login' ? 'Welcome back.' : 'Make room for good food.'}</Text>
        <Text style={styles.authDescription}>{mode === 'login' ? 'Sign in to keep your cookbook and favorites with you.' : 'Create your cookbook and start saving recipes.'}</Text>
        {mode === 'register' && <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#8B8A84" style={styles.authInput} autoCapitalize="words" />}
        <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#8B8A84" style={styles.authInput} autoCapitalize="none" keyboardType="email-address" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor="#8B8A84" style={styles.authInput} secureTextEntry />
        {!!error && <Text style={styles.authError}>{error}</Text>}
        <Pressable style={styles.primaryButton} onPress={submit} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</Text>
        </Pressable>
        <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={styles.authSwitch}>
          <Text style={styles.authSwitchText}>{mode === 'login' ? 'New to Cookly? Create an account' : 'Already have an account? Sign in'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <View><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F6F1' },
  authPage: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  authEyebrow: { color: '#E46E48', fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginTop: 74, marginBottom: 12 },
  authTitle: { color: '#202B25', fontSize: 36, lineHeight: 40, fontWeight: '800', letterSpacing: -1.1, marginBottom: 12 },
  authDescription: { color: '#777A72', fontSize: 15, lineHeight: 23, marginBottom: 28 },
  authInput: { height: 54, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#ECEAE3', paddingHorizontal: 16, color: '#202B25', fontSize: 15, marginBottom: 12 },
  authError: { color: '#B74837', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  authSwitch: { alignItems: 'center', paddingVertical: 18 },
  authSwitchText: { color: '#40523E', fontWeight: '700', fontSize: 13 },
  page: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 38 },
  brand: { color: '#202B25', fontSize: 27, fontWeight: '800', letterSpacing: -1 },
  brandDot: { color: '#E46E48' },
  greeting: { color: '#7A7C75', fontSize: 12, marginTop: 3 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#D9E5D2', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#40523E', fontWeight: '700', fontSize: 16 },
  heading: { color: '#202B25', fontSize: 35, lineHeight: 39, fontWeight: '800', letterSpacing: -1.1, marginBottom: 22 },
  searchBox: { height: 53, borderRadius: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: '#ECEAE3' },
  searchIcon: { color: '#6D7068', fontSize: 27, marginRight: 8, marginTop: -5 },
  searchInput: { flex: 1, color: '#202B25', fontSize: 15 },
  categories: { gap: 9, paddingVertical: 23 },
  category: { borderRadius: 20, paddingHorizontal: 17, paddingVertical: 9, backgroundColor: '#EEEDE7' },
  activeCategory: { backgroundColor: '#25342B' },
  categoryText: { color: '#696D66', fontSize: 13, fontWeight: '600' },
  activeCategoryText: { color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 13 },
  sectionTitle: { color: '#202B25', fontSize: 20, fontWeight: '800' },
  count: { color: '#8B8A84', fontSize: 12 },
  recipeCard: { backgroundColor: '#FFFFFF', borderRadius: 15, overflow: 'hidden', marginBottom: 14, flexDirection: 'row', borderWidth: 1, borderColor: '#EEECE5' },
  recipeImage: { width: 112, minHeight: 146, backgroundColor: '#E3ECDD', alignItems: 'center', justifyContent: 'center' },
  recipeEmoji: { fontSize: 52 },
  recipeContent: { flex: 1, padding: 15 },
  recipeTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  recipeTitle: { flex: 1, color: '#25342B', fontSize: 17, fontWeight: '800', lineHeight: 21 },
  cardFavorite: { color: '#E46E48', fontSize: 22, lineHeight: 21 },
  recipeDescription: { color: '#777A72', fontSize: 12, lineHeight: 18, marginTop: 8 },
  recipeMeta: { color: '#9A9991', fontSize: 11, marginTop: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#777A72', marginTop: 30 },
  detailPage: { padding: 24, paddingBottom: 42 },
  detailTopbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#25342B', fontSize: 32, lineHeight: 29, marginLeft: -2 },
  favoriteIcon: { color: '#E46E48', fontSize: 29 },
  detailHero: { height: 230, borderRadius: 18, backgroundColor: '#E3ECDD', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  detailEmoji: { fontSize: 100 },
  eyebrow: { color: '#E46E48', fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 7 },
  detailTitle: { color: '#202B25', fontSize: 33, lineHeight: 37, fontWeight: '800', letterSpacing: -1, marginBottom: 10 },
  detailDescription: { color: '#777A72', fontSize: 15, lineHeight: 23 },
  metaRow: { flexDirection: 'row', gap: 42, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E6E3DB', paddingVertical: 17, marginVertical: 25 },
  metaLabel: { color: '#9A9991', fontSize: 9, letterSpacing: 1, fontWeight: '800', marginBottom: 5 },
  metaValue: { color: '#25342B', fontSize: 15, fontWeight: '700' },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  ingredientDot: { color: '#E46E48', fontSize: 20, marginRight: 9 },
  ingredient: { color: '#4A514B', fontSize: 15 },
  primaryButton: { backgroundColor: '#25342B', alignItems: 'center', borderRadius: 12, paddingVertical: 16, marginTop: 28 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
