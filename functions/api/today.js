const ALL_ANIMALS =
  ["Aardvark", "African Leopard", "African Penguin", "African Savannah Elephant", "African Tigerfish", "Axolotl", "Blacktip Reef Shark", "Blue and Gold Fusilier", "Blue Wildebeest", "Blunthead Cichlid", "Boa Constrictor", "Brown Trout", "Common BlueTongue", "Common Hippopotamus", "Danube Crested Newt", "Eurasian Brown Bear", "European Bison", "European Peacock", "Fire Salamander", "Gemsbok", "Gharial", "Giant Malaysian Leaf Insect", "Gila Monster", "Golden Eagle", "Golden Lion Tamarin", "Golden Poison Frog", "Goodfellow's Tree-Kangaroo", "Great Hammerhead", "Hawksbill Turtle", "Humphead Wrasse", "Lion", "Longfin Batfish", "Masai Giraffe", "Ocean Sunfish", "Plains Zebra", "Red Deer", "Red Lionfish", "Red Panda", "Saltwater Crocodile", "Schooling Bannerfish", "Secretarybird", "Spotted Eagle Ray", "Springbok", "Sumatran Tiger",
    "Western Chimpanzee"];

export async function onRequestGet(context) {
  const KV = context.env.PZORDLE_KV_BINDING;

  if (!KV) {
      return new Response(
        JSON.stringify({
          error: "Could not connect to storage."
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  let todayAnswer = await KV.get("TODAY");

  if (!todayAnswer) {
      todayAnswer = await pickNextAnswer(KV);
  }
  return new Response(JSON.stringify({ answer: todayAnswer }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
}
async function pickNextAnswer(KV) {
  const allHistory = await KV.get("ALL_HISTORY");
  const playedJson = await KV.get("RECENTLY_PLAYED");
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

  await KV.put("TODAY", selectedAnswer);
  await KV.put("LAST_UPDATED", currentTime);
  await KV.put("RECENTLY_PLAYED", JSON.stringify(playedAnimals));
  await KV.put("ALL_HISTORY", JSON.stringify(allHistoryList));

  return selectedAnswer;
}
