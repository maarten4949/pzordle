
<template>
    <div class = "game-grid">
        <table class="answer-grid">
            <thead>
            <tr class="header-grid">
                <th>Guess</th>
                <th>Animal Species</th>
                <th>Habitat Type</th>
                <th>Biome</th>
                <th>Continent/Ocean</th>
                <th>Conservation Status</th>
                <th>Content Pack</th>
            </tr>
            </thead>
            <TransitionGroup name="list" tag="tbody">
            <tr v-for="(guess, index) in guesses" :key="guess.name" class="answer-row">
                <td class="answer-cell empty">
                    {{index + 1}}
                </td>
                <td :class="`${guess.name.correctness}`" class="answer-cell">
                    {{guess.name.value}}
                </td>
                <td :class="`${guess.habitat.correctness}`" class="answer-cell">
                    <div v-for="habitat in guess.habitat.value">{{ habitat}}</div>
                </td>
                <td :class="`${guess.biome.correctness}`" class="answer-cell">
                    <div v-for="biome in guess.biome.value">{{ biome}}</div>
                </td>
                <td :class="`${guess.continent.correctness}`" class="answer-cell">
                    <div v-for="continent in guess.continent.value">{{ continent}}</div>
                </td>
                <td :class="`${guess.conservation.correctness}`" class="answer-cell">
                    <div v-for="conservation in guess.conservation.value">{{ conservation}}</div>
                </td>
                <td :class="`${guess.contentPack.correctness}`" class="answer-cell">
                    {{guess.contentPack.value}}
                </td>
            </tr>
            <tr v-for="(guess, index) in (5 - guesses.length)" :key="guess" class="answer-row">
                <td class="answer-cell empty">
                    {{ index + 1 + guesses.length}}
                </td>
                <td  class="answer-cell empty">
                </td>
                <td  class="answer-cell empty">
                </td>
                <td  class="answer-cell empty">
                </td>
                <td  class="answer-cell empty">
                </td>
                <td  class="answer-cell empty">
                </td>
                <td  class="answer-cell empty">
                </td>
            </tr>
            </TransitionGroup>
        </table>
    </div>
    <div v-if="gameSucceeded" class="game-success">
        <h2>You guessed correctly!</h2>
        <span>Check back tomorrow to guess a new animal.</span>
    </div>
    <div v-if="gameFailed" class="game-failed">
        <h2>Better luck next time!</h2>
        <p>The correct animal was: {{correctAnimal.name}}</p>
        <p>Check back tomorrow to guess a new animal.</p>
    </div>
    <div v-if="isLoading">
        Loading...
    </div>
    <form v-else class="input-form" @submit.prevent="checkAnswer" v-if="!gameSucceeded">
        <div class="input-form-body">
        <div class="input-container">
            <input type="text" ref="inputField" v-model="guessInput" @input="input" placeholder="Enter an animal" class="input-field">
            <div class="input-suggestions-container" v-if="suggestions.length > 0">
                <button v-for="suggestion in suggestions" :key="suggestion" @click="selectSuggestion(suggestion)" class="suggestion"><img :src="getImageUrl(suggestion)" :alt="`${ suggestion }`">{{ suggestion }}</button>
            </div>
        </div>
            <button class="submit-button">Submit</button>
        </div>
        <div class="error-message">{{errorMessage}}</div>
    </form>
</template>
<script setup>
  import { ref, onMounted } from 'vue'
  import animals from "../assets/animals.json"
  import schedule from "../assets/schedule.json"

  const correctness = { correct: "correct", incorrect: "incorrect", partiallyCorrect: "partially-correct" }

  let guesses = ref([]);
  let suggestions = ref([]);
  let correctAnimal = ref('');
  const guessInput = defineModel("guessInput");
  let inputField = ref("")
  const isLoading = ref(true);
  let errorMessage = ref("");
  let gameSucceeded = ref(false);
  let gameFailed = ref(false);
  onMounted(async () => {
    try {
        const response = await fetch('/api/today');
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }
        const data = await response.json();

        const animalNameToGuess = data.answer;
        correctAnimal = animals.find(animal => animal.name.toLowerCase() === animalNameToGuess.toLowerCase());
      } catch (err) {
        console.error('Failed to load today\'s character:', err);
        errorMessage.value = 'Could not load today\'s puzzle. Please try again!';
      } finally {
        isLoading.value = false;
      }
    });
  function getImageUrl(name) {
    return new URL(`../assets/images/${name}.webp`, import.meta.url).href;
  }
  function getAnimalSchedule() {
    let animalOfTheDay = "";
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i].date === today) {
        animalOfTheDay = schedule[i].animal;
      }
    }
    return animals.find(animal => animal.name.toLowerCase() === animalOfTheDay.toLowerCase());
  }
  function input(e){
    errorMessage.value = "";
    suggestions.value = [];
    if (guessInput.value === "") return;
    for (let i = 0; i < animals.length; i++) {
      if (animals[i].name.toLowerCase().includes(guessInput.value.toLowerCase())) {
        suggestions.value.push(animals[i].name);
      }
    }
  }
  function selectSuggestion(suggestion) {
    console.log("selected suggestion", suggestion);
    guessInput.value = suggestion;
    checkAnswer();
  }
  function checkAnswer(e) {
    suggestions.value = [];
    var answer = guessInput.value;
    if (answer === "") return;

    var guessedAnimal = animals.find(animal => animal.name.toLowerCase() === answer.toLowerCase());

    if (guessedAnimal === undefined) {
      console.log("Animal not in list")
      errorMessage.value = "Animal is not in the list of valid animals"
    }
    else if (guesses.value.length > 0 && guesses.value.find(guess => guess.name.value.toLowerCase() === guessedAnimal.name.toLowerCase()) != undefined)
    {
        console.log("already guessed");
        errorMessage.value = "You already guessed this animal"
    }
    else {
      console.log("guessing")
      guesses.value.push({
        name: { value: guessedAnimal.name, correctness: getCorrectNess(guessedAnimal.name, correctAnimal.name) },
        habitat: { value: guessedAnimal.habitat, correctness: getCorrectNess(guessedAnimal.habitat, correctAnimal.habitat) },
        biome: { value: guessedAnimal.biome, correctness: getCorrectNess(guessedAnimal.biome, correctAnimal.biome) },
        continent: { value: guessedAnimal.continent, correctness: getCorrectNess(guessedAnimal.continent, correctAnimal.continent) },
        conservation: { value: guessedAnimal.conservation, correctness: getCorrectNess(guessedAnimal.conservation, correctAnimal.conservation) },
        contentPack: { value: guessedAnimal.contentPack, correctness: getCorrectNess(guessedAnimal.contentPack, correctAnimal.contentPack) },
        })
    }
    if (guessedAnimal === correctAnimal) {
      console.log("Game succeeded")
      gameSucceeded.value = true;
    }

    else if (guesses.value.length === 5) {
      console.log("Game Failed")
      gameFailed.value = true;
    }
    guessInput.value = "";
      inputField.value?.focus();


  }
  function getCorrectNess(guess, correctValue) {
  console.log(guess)
    console.log(correctValue)
    if (Array.isArray(guess) && compareArrays(guess, correctValue))
    {
      console.log("return correct")

      return correctness.correct;
      }
    if (Array.isArray(guess) === false && guess.toLowerCase() === correctValue.toLowerCase())
    {
      console.log("return correct")

      return correctness.correct;
    }
    if (Array.isArray(guess))
    {
      for (const guessedValue of guess)
      {
        if (correctValue.includes(guessedValue))
        {
          console.log("return partially correct")

          return correctness.partiallyCorrect;
        }
      }
    }
    console.log("return incorrect")
    return correctness.incorrect;
  }
  const compareArrays = (a, b) => {
    return a.toString() === b.toString();
  };
</script>

<style>
.list-enter-active {
  transition: all 0.3s ease-in-out;
}
.list-enter-from {
  opacity: 0;
}
.game-grid {
    overflow-x: auto;
    display:grid;
    width: 100%;
    container-type: inline-size;
    container-name: game-grid;
}
.header-grid {
    width: 100%;
    min-width: min-content;
    & > *{
      padding: var(--spacing-04) var(--spacing-06);
      margin: 0 auto;
      box-sizing: border-box;
    }
}
.answer-grid{
    width: 100%;
}
.answer-row:first-child{
    border-top-right-radius: var(--radii-m);
}
.answer-row:last-child{
    border-bottom-left-radius: var(--radii-m);
    border-bottom-right-radius: var(--radii-m);
}
.input-form{
    display: flex;
    flex-direction: column;
    gap: var(--spacing-02);
    margin: auto;
}
.input-container {
    width: 100%;
    display: flex;
    justify-content: center;
    gap:var(--spacing-03);
    flex-wrap: wrap;
}
.input-form-body {
    display: flex;
    align-items: start;
    gap: var(--spacing-06);
    padding-block: var(--spacing-05);

}
.input-field {
    width: 100%;
    border: solid var(--green) 2px;
    border-radius: var(--radii-m);
    padding: var(--spacing-04) var(--spacing-05);
    min-width: 50%;
     font-size: var(--type-05);
}
.submit-button {

    padding: var(--spacing-04) var(--spacing-05);
    background-color: var(--green);
    border: 4px solid var(--dark-green);
    border-radius: var(--radii-m);
    color: var(--text-white);
    font-size: var(--type-05);
    font-family: var(--font-eagle-bold);
    transition: all 200ms ease-in-out;
    &:hover {
        background-color: var(--dark-green);
    }
}
.suggestion {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--spacing-04);
    & img {
        width: var(--spacing-11);
    }
    background-color: transparent;
    border: none;
    padding: var(--spacing-02) var(--spacing-03);
    border-radius: var(--radii-s);
    color: var(--text-white);
    &:hover, &:focus-visible {
        background-color: var(--bg-1);
    }

}
.input-suggestions-container {
    background-color: var(--bg-2);
    width: 100%;
    border-radius: var(--radii-m);
    padding: var(--spacing-04) var(--spacing-05);
}
table {
    border-collapse: collapse;
    border-spacing: var(--spacing-03) var(--spacing-03);
}
table tbody tr:first-child td:first-child{
    border-top-left-radius: var(--radii-m);
}
table tbody tr:first-child td:last-child{
    border-top-right-radius: var(--radii-m);
}
table tbody tr:last-child td:first-child{
    border-bottom-left-radius: var(--radii-m);
}
table tbody tr:last-child td:last-child{
    border-bottom-right-radius: var(--radii-m);
}
.game-success {
    padding: var(--spacing-04) var(--spacing-06);
    margin-block:var(--spacing-06);

    border-radius: var(--radii-m);
    display:flex;
    flex-direction: column;
    gap: var(--spacing-02);
    background-color: var(--bg-3);
    color: var(--green);
}
.game-failed {
    padding: var(--spacing-04) var(--spacing-06);
    margin-block:var(--spacing-06);

    border-radius: var(--radii-m);
    display:flex;
    flex-direction: column;
    gap: var(--spacing-02);
    & h2 {
        color: var(--red);
    }
    color: var(--text-dark);
    background-color: var(--bg-3);
}
.answer-cell {
    box-sizing:border-box;
    min-width:calc(var(--spacing-06) * 2 + 2.8645625rem);
    padding: var(--spacing-04) var(--spacing-06);
    gap: var(--spacing-02);
     & div:not(:first-child)
     {
         margin-top: var(--spacing-02);
     }
    &.correct {
        background-color: var(--green);
    }
    &.incorrect {
        background-color: var(--red);
    }
    &.partially-correct {
        color: var(--text-dark);
        background-color: var(--orange);
    }
    &.empty {
        background-color: var(--bg-2);
        text-align: center;
    }
}
.error-message{
    color: var(--red);
    text-align: center;
}
@container game-grid (width < 700px)
{
   .header-grid span {
    padding: var(--spacing-02) var(--spacing-04);
    font-size: var(--type-02);
    line-height: var(--spacing-05);
    }
    .answer-cell {
        padding: var(--spacing-02) var(--spacing-04);
        min-width:calc(var(--spacing-03) * 2 + 2.8645625rem);
        font-size: var(--type-02);
        line-height: var(--spacing-05);
    }
}
@media (width < 400px)
{
    .input-field, .submit-button {
        flex-grow: 1;
    }
}
</style>
