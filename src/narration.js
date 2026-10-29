// Aslan's lines: ONLY verified book quotes from the Roster Page "Narrator & Guide: Aslan" table, verbatim.
// Edit here to change what Aslan says at each moment. Do not add invented lines.
export const ASLAN = {
  arenaIntro: [
    { text: '\u201cWelcome, child.\u201d', source: 'Prince Caspian, ch. 10' },
    { text: '\u201cYou would not have called to me unless I had been calling to you.\u201d', source: 'The Silver Chair, ch. 2' },
  ],
  mathEncouragement: [
    { text: '\u201cCourage, dear heart.\u201d', source: 'The Voyage of the Dawn Treader, ch. 12' },
    { text: '\u201cRemember, remember, remember the signs.\u201d', source: 'The Silver Chair, ch. 2' },
  ],
  mathHint: [
    { text: '\u201c...the first step is to remember.\u201d', source: 'The Silver Chair, ch. 2' },
  ],
  wrongAnswer: [
    { text: '\u201cThings never happen the same way twice.\u201d', source: 'Prince Caspian, ch. 10' },
  ],
  betweenRounds: [
    { text: '\u201cWhatever happens, never forget to wipe your sword.\u201d', source: 'The Lion, the Witch and the Wardrobe, ch. 12' },
  ],
  levelUp: [
    { text: '\u201cEvery year you grow, you will find me bigger.\u201d', source: 'Prince Caspian, ch. 10' },
  ],
  victory: [
    { text: '\u201cWell done, last of the Kings of Narnia who stood firm at the darkest hour.\u201d', source: 'The Last Battle, ch. 13' },
    { text: '\u201cNow you are a lioness.\u201d', source: 'Prince Caspian, ch. 10' },
  ],
  defeat: [
    { text: '\u201cIt is hard for you, little one.\u201d', source: 'Prince Caspian, ch. 10' },
  ],
  playAgain: [
    { text: '\u201cCome further in! Come further up!\u201d', source: 'The Last Battle, ch. 14' },
  ],
};
let last = {};
export function aslanLine(moment) {
  const list = ASLAN[moment]; if (!list) return null;
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && i === last[moment]) i = (i + 1) % list.length;
  last[moment] = i; return list[i];
}

// A random line from the whole verified set (used by the Welcome screen); never repeats the previous one.
export function aslanAny() {
  const all = Object.values(ASLAN).flat(); let i = Math.floor(Math.random() * all.length); if (all.length > 1 && i === last.__any) i = (i + 1) % all.length; last.__any = i; return all[i];
}
export const ASLAN_COUNT = Object.values(ASLAN).flat().length;
