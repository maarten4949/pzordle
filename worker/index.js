const ALL_ANIMALS =
  ["Aardvark", "African Leopard", "African Penguin", "African Savannah Elephant", "African Tigerfish", "Axolotl", "Blacktip Reef Shark", "Blue and Gold Fusilier", "Blue Wildebeest", "Blunthead Cichlid", "Boa Constrictor", "Brown Trout", "Common Bluetongue", "Common Hippopotamus", "Danube Crested Newt", "Eurasian Brown Bear", "European Bison", "European Peacock", "Fire Salamander", "Gemsbok", "Gharial", "Giant Malaysian Leaf Insect", "Gila Monster", "Golden Eagle", "Golden Lion Tamarin", "Golden Poison Frog", "Goodfellow's Tree-Kangaroo", "Great Hammerhead", "Hawksbill Turtle", "Humphead Wrasse", "Lion", "Longfin Batfish", "Masai Giraffe", "Ocean Sunfish", "Plains Zebra", "Red Deer", "Red Lionfish", "Red Panda", "Saltwater Crocodile", "Schooling Bannerfish", "Secretarybird", "Spotted Eagle Ray", "Springbok", "Sumatran Tiger",
    "Western Chimpanzee"];

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pickNextAnswer(env.PZORDLE_KV));
  },
};

async function pickNextAnswer(KV) {
  const allHistory = await KV.get("ALL_HISTORY");
  const playedJson = await KV.get("RECENTLY_PLAYED");
  let count = await KV.get("COUNT");
  let playedAnimals = playedJson ? JSON.parse(playedJson) : [];
  let allHistoryList = allHistory ? JSON.parse(allHistory) : [];


  let remaining = ALL_ANIMALS.filter(id => !playedAnimals.includes(id));

  if (remaining.length === 0) {
    remaining = [...ALL_ANIMALS];
    playedAnimals = [];
  }

  const randomIndex = Math.floor(Math.random() * remaining.length);
  const selectedAnswer = remaining[randomIndex];
  const currentTime = new Date().toISOString();

  playedAnimals.push(selectedAnswer);
  allHistoryList.push({"date": currentTime, "answer": selectedAnswer});

  if (count) {
    count = parseInt(count) + 1;
    await KV.put("COUNT", count);
  } else {
    count = allHistoryList.length + 1;
    await KV.put("COUNT", count);
  }

  await KV.put("TODAY", selectedAnswer);
  await KV.put("LAST_UPDATED", currentTime);
  await KV.put("RECENTLY_PLAYED", JSON.stringify(playedAnimals));
  await KV.put("ALL_HISTORY", JSON.stringify(allHistoryList));

  return selectedAnswer;
}
