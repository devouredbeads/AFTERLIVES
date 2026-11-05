/* AFTERLIVES demo collection.
   The story, versions, passages, and "AI suggestions" below are INVENTED for this prototype.
   Replace this file with your own verified case study (see README.md for the schema). */
window.AFTERLIVES_DATA = {
  collection: {
    title: "Stories in Motion",
    subtitle: "Traditional narratives · Online fiction · Screen adaptations",
    note: "The story and every version are invented, so the prototype makes no claims about real works."
  },
  work: { title: "The Lantern Keeper’s Daughter" },
  topics: [
    { id: "opening", label: "Opening" },
    { id: "protagonist", label: "Protagonist" },
    { id: "conflict", label: "Resolving the conflict" },
    { id: "ending", label: "Ending" },
    { id: "culture", label: "Cultural references" }
  ],
  versions: [
    { id: "v1", short: "Traditional tale", title: "The Lantern Keeper’s Daughter", medium: "Written-down folk tale", year: "Undated", lang: "English (demo)",
      summary: "A quiet daughter waits while a heron rescues the harbor’s light; she is rewarded with marriage." },
    { id: "v2", short: "Online novel", title: "The Lantern Keeper’s Daughter (serial)", medium: "Serialized online novel, 40 chapters", year: "2021 (demo)", lang: "English (demo)",
      summary: "The daughter climbs the tower herself, bargains with the river spirit, and declines marriage to become keeper." },
    { id: "v3", short: "Vertical drama", title: "Lantern Girl", medium: "Vertical short drama, 60 episodes", year: "2024 (demo)", lang: "English, dubbed (demo)",
      summary: "A fast, romance-driven retelling of about 90 seconds per episode that ends on a cliffhanger." }
  ],
  edges: [
    { from: "v1", to: "v2", type: "documented adaptation",
      evidence: "The author’s note in chapter 1 states that the novel retells the folk tale. (Demo evidence)" },
    { from: "v2", to: "v3", type: "documented adaptation",
      evidence: "The drama’s credits list the novel as source material. (Demo evidence)" },
    { from: "v1", to: "v3", type: "stated inspiration",
      evidence: "Promotional copy calls the series “inspired by an old river tale,” without naming the tale. (Demo evidence)" }
  ],
  passages: {
    v1: {
      opening: "In a village where the river meets the sea, an old lantern keeper lit a lamp each dusk so the fishing boats could find the harbor. His daughter Ilan carried the oil and said nothing.",
      protagonist: "Ilan was obedient and quiet. She waited by the window while others decided what should be done, and the villagers praised her patience.",
      conflict: "When the old man fell ill, the lamp went dark and the boats were lost in fog. Ilan wept and prayed at the water’s edge until a heron, the river’s messenger, carried a spark to the tower.",
      ending: "The boats returned. The grateful boatman asked for Ilan’s hand, and the village celebrated. Her father kept the lamp until the end of his days.",
      culture: "The tale closes with a proverb: patience is the lamp that never goes out. The heron is honored each year at the harvest festival."
    },
    v2: {
      opening: "Ilan has trimmed the wicks since she was nine. When her father coughs through another dusk, she takes the taper from his hand and climbs the tower herself, counting the steps aloud to keep from shaking.",
      protagonist: "Ilan is stubborn and sharp-tongued. She argues with the elders, keeps the tower’s account book, and decides what the village is told about her father’s illness.",
      conflict: "The fog comes early and the lamp oil is spoiled. Ilan rows out to the river spirit’s shoal and bargains: three years of her evenings in exchange for clear water. She keeps the bargain on her own terms.",
      ending: "The boatman proposes in the final chapter. Ilan declines and names herself keeper. The last line shows her lighting the lamp alone, the harbor full of lit windows.",
      culture: "The heron stays, but as a negotiator rather than a rescuer. The harvest festival becomes a market scene where a street vendor questions the proverb about patience."
    },
    v3: {
      opening: "Episode 1 opens the moment the lamp goes out: a close-up of Ilan’s face, fog, a boat’s horn. Her father collapses while a stranger on the shore watches.",
      protagonist: "Ilan is resourceful, but her choices revolve around two men who compete for her: the boatman and a wealthy lamp merchant. Her fear is shown in repeated close-ups.",
      conflict: "She lights the lamp, but a rival cuts the oil supply. The boatman arrives in the last minute of episode 58 and rows her to safety as the lamp flares.",
      ending: "Episode 60 ends on a cliffhanger: the merchant’s ledger reveals the lamp was never her father’s to keep. A caption reads, Season 2 coming soon.",
      culture: "The heron becomes a pendant the boatman gives Ilan. The proverb is spoken once in voiceover and then dropped. The harvest festival is replaced by a wedding scene."
    }
  },
  ledger: {
    v1: [
      { field: "Creator", value: "Unknown (oral tradition)", status: "missing" },
      { field: "Source", value: "Demo retelling written for this prototype", status: "verified" },
      { field: "Date", value: "Undated", status: "missing" },
      { field: "Language", value: "English (demo)", status: "verified" },
      { field: "Medium", value: "Written-down folk tale", status: "verified" },
      { field: "Translator or adaptation credits", value: "None recorded", status: "missing" },
      { field: "Context note", value: "The tale seems to teach patience as a virtue, which may reflect the values of the community that told it.", status: "interpretation" }
    ],
    v2: [
      { field: "Creator", value: "Invented author (demo)", status: "verified" },
      { field: "Source", value: "Serialized online novel, 40 chapters (demo)", status: "verified" },
      { field: "Date", value: "Serialized 2021 (demo)", status: "verified" },
      { field: "Language", value: "English (demo)", status: "verified" },
      { field: "Medium", value: "Online serial", status: "verified" },
      { field: "Translator or adaptation credits", value: "Author’s note names the folk tale as source", status: "verified" },
      { field: "Context note", value: "Serial publication may reward chapter-ending hooks and a more active protagonist.", status: "ai" }
    ],
    v3: [
      { field: "Creator", value: "Invented studio (demo)", status: "verified" },
      { field: "Source", value: "Vertical short drama, 60 episodes of about 90 seconds (demo)", status: "verified" },
      { field: "Date", value: "Released 2024 (demo)", status: "verified" },
      { field: "Language", value: "English, dubbed (demo)", status: "verified" },
      { field: "Translator or adaptation credits", value: "Credits list the novel as source material", status: "verified" },
      { field: "Dubbing and localization credits", value: "Dubbing translator not credited", status: "missing" },
      { field: "Context note", value: "The romantic triangle may be aimed at a wider romance audience.", status: "interpretation" },
      { field: "Context note", value: "Very short episodes may favor fast pacing and a cliffhanger ending.", status: "ai" }
    ]
  },
  suggestions: [
    { id: "s1", pair: ["v1", "v2"], topic: "protagonist",
      observation: "In the traditional tale Ilan waits and prays. In the novel she climbs the tower, argues with the elders, and keeps the account book.",
      question: "Does this added agency change how the narrative treats gender and authority? Is it tied to the novel’s serial format, its readers, or the author’s own choices?",
      passages: [{ v: "v1", t: "protagonist" }, { v: "v2", t: "protagonist" }, { v: "v2", t: "opening" }] },
    { id: "s2", pair: ["v1", "v2"], topic: "conflict",
      observation: "The tale’s rescue comes from outside, through the heron. In the novel Ilan rows out and bargains with the river spirit.",
      question: "What does it mean that the solution moves from divine help to negotiation? What would the author’s note or reader comments say about that choice?",
      passages: [{ v: "v1", t: "conflict" }, { v: "v2", t: "conflict" }] },
    { id: "s3", pair: ["v2", "v3"], topic: "ending",
      observation: "The novel ends with Ilan declining marriage and naming herself keeper. The drama ends on a cliffhanger that returns to a romantic plot and a new threat.",
      question: "Is the cliffhanger a convention of short-form serial drama, or a sign of different values about her independence? What production or reception evidence could test each explanation?",
      passages: [{ v: "v2", t: "ending" }, { v: "v3", t: "ending" }, { v: "v3", t: "protagonist" }] },
    { id: "s4", pair: ["v1", "v3"], topic: "culture",
      observation: "The proverb about patience closes the tale. In the drama it is spoken once in voiceover and then dropped.",
      question: "What is lost when a proverb that organizes the tale’s moral becomes a single line? Does adapting for a wider audience explain it, or is something else at work?",
      passages: [{ v: "v1", t: "culture" }, { v: "v3", t: "culture" }] },
    { id: "s5", pair: ["v2", "v3"], topic: "protagonist",
      observation: "The drama frames Ilan’s choices around two suitors, while the novel frames them around the tower and the village.",
      question: "Does the shift to a romantic triangle reflect the intended audience, the platform’s genre conventions, or the creators’ decisions?",
      passages: [{ v: "v2", t: "protagonist" }, { v: "v3", t: "protagonist" }] }
  ]
};
