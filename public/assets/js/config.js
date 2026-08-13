/* ============================================================================
 * SITE CONFIG — DEFAULTS
 * ----------------------------------------------------------------------------
 * This file is the fallback default. The build step (npm run build) generates
 * `generated.js` from `config.ini` and it OVERRIDES these values at runtime.
 * Edit `config.ini` (single source of truth), then run `npm run build`.
 * ========================================================================== */
(function () {
  var defaults = {
    site: {
      title: "RAN GS Eternity EP9",
      tagline: "Eternity calls. Answer it.",
      brandShort: "RAN GS",
      brandLong: "ETERNITY",
      logo: "assets/logo.png",
      favicon: "assets/logo.png",
      version: "EP9",
      year: "2026"
    },
    hero: {
      title: "RAN ONLINE",
      subtitle: "ETERNITY EP9",
      description: "A new era of RAN Online arrives. Build your legend, claim the battlefield, and answer the call of Eternity.",
      bg: "assets/hero-bg.png",
      ctaPlay: "WATCH TRAILER",
      ctaPlayUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      ctaDownload: "DOWNLOAD NOW"
    },
    music: {
      enabled: true,
      src: "assets/audio/ran-eternity-mixed-clean.mp3",
      title: "RAN GS Eternity",
      autoplay: false
    },
    nav: ["Home", "Server", "Classes", "Combat", "Roadmap", "Download", "Community"],
    server: {
      intro: "A balanced economy and progression curve tuned for hardcore raiders and casual guildmates alike. No pay-to-win — only pay-to-look-fly.",
      stats: [
        { label: "PLAYABLE CLASSES", value: "07", note: "Each with unique skill trees" },
        { label: "MAX CHAR LEVEL", value: "260", note: "Endgame ceiling" },
        { label: "MAX SKILL LEVEL", value: "237", note: "Mastery progression" },
        { label: "MAX UPGRADE", value: "+11", note: "Pristine forging system" },
        { label: "LAST ARMOR", value: "BLACK LUNAR", note: "End-game tier" },
        { label: "LAST WEAPON", value: "BLACK DRAGON", note: "Mythic class arsenal" },
        { label: "LAST MAP", value: "SAINT POWER PLANT", note: "Endgame zone" }
      ],
      rates: [
        { k: "ITEM DROP", v: "lowhalf" },
        { k: "GOLD DROP", v: "low" },
        { k: "EXP RATE", v: "mid" }
      ]
    },
    classes: [
      { name: "BRAWLER", role: "Melee DPS", spec: "Fist-form striker", difficulty: 2, img: "assets/class-brawler.png", playstyle: "A close-range pressure class built around fast engages, chase pressure and punishing enemies who overextend. Brawler performs best when forcing small skirmishes instead of standing in the middle of a full ranged fight.", pvpAdvantage: "Strong duelist with reliable gap-close pressure and high burst when targets are isolated.", pvpDisadvantage: "Struggles when kited by coordinated ranged classes or locked down before reaching the backline." },
      { name: "ARCHER", role: "Ranged DPS", spec: "Sniper / scout", difficulty: 3, img: "assets/class-archer.png", playstyle: "A spacing-based marksman that wins by controlling distance, poking safely and finishing weakened enemies before they can reset. Archer rewards map awareness, target selection and clean movement.", pvpAdvantage: "Excellent range, safe poke and strong pick potential against low-health targets.", pvpDisadvantage: "Vulnerable when melee classes close the gap or when caught without room to reposition." },
      { name: "SWORDSMAN", role: "Tank / DPS", spec: "Frontline stopper", difficulty: 2, img: "assets/class-swordsman.png", playstyle: "A durable frontline class that protects space, absorbs pressure and creates openings for the team. Swordsman is ideal for players who want to anchor pushes, peel for allies and survive extended fights.", pvpAdvantage: "High survivability and strong frontline control make it reliable in group clashes.", pvpDisadvantage: "Lower chase speed and burst compared with pure DPS classes, so mobile targets can escape." },
      { name: "SHAMAN", role: "Support", spec: "Elemental binder", difficulty: 4, img: "assets/class-shaman.png", playstyle: "A tactical support class focused on sustain, buffs and fight control. Shaman shines when playing behind the frontline, keeping key allies alive and turning long fights through timing and positioning.", pvpAdvantage: "Valuable in organized PvP because utility and sustain can swing extended team fights", pvpDisadvantage: "Needs protection and careful positioning; focused burst or silence pressure can shut it down quickly." },
      { name: "EXTREME", role: "Hybrid", spec: "Heavy ordnance", difficulty: 3, img: "assets/class-extreme.png", playstyle: "A flexible combatant with heavy pressure tools and enough utility to adapt between offense and disruption. Extreme is best for players who like switching targets and creating chaos during crowded fights.", pvpAdvantage: "Versatile damage profile and disruptive pressure work well in messy group battles.", pvpDisadvantage: "Can feel less specialized than pure classes, and poor cooldown timing leaves it exposed." },
      { name: "GUNNER", role: "Ranged DPS", spec: "Tech-augment vanguard", difficulty: 3, img: "assets/class-gunner.png", playstyle: "A ranged damage dealer built around steady pressure, burst windows and disciplined positioning. Gunner thrives when firing from protected angles and punishing enemies who commit too deep.", pvpAdvantage: "Strong sustained ranged damage and good backline threat in team fights.", pvpDisadvantage: "Needs space and protection; collapses quickly when surrounded or forced into close combat." },
      { name: "ASSASSIN", role: "Burst DPS", spec: "Shadow operative", difficulty: 5, img: "assets/class-assassin.png", playstyle: "A high-risk burst class that specializes in flanking, target deletion and escaping before the enemy can respond. Assassin rewards patience, timing and reading the fight before committing.", pvpAdvantage: "Exceptional burst and backline threat against supports, archers and isolated carries.", pvpDisadvantage: "Punishing to misplay; if the opening burst fails, it can be controlled and eliminated fast." }
    ],
    combat: {
      intro: "Competitive PvP modes and flagship PvE pillars. Eternity rewards aggression — but only the disciplined survive Forbidden Tower and Outer Wall.",
      liveEvent: { tag: "LIVE EVENT", title: "Tyranny Wars: Season 01", desc: "All-out guild war — even guilds from the same school clash for territory and supremacy.", schedule: "Schedule: Everyday 10AM, 1PM, 4PM, 7PM, 10PM and 1AM" },
      modes: [
        { n: "TYRANNY WARS", t: "All-out guild war", cap: "100v100", schedule: "Everyday 10AM, 1PM, 4PM, 7PM, 10PM and 1AM", hot: true },
        { n: "CAPTURE THE FLAG", t: "Objective skirmish", cap: "5v5", schedule: "TBA" },
        { n: "CLUB DEATH MATCH", t: "Free-for-all arena", cap: "8v8", schedule: "TBA" },
        { n: "CLUB WAR", t: "Faction control", cap: "Open", schedule: "TBA" }
      ],
      raids: [
        { n: "FORBIDDEN TOWER", t: "Vertical raid — 30 floors", limit: "2 raids limit per day" },
        { n: "OUTER WALL", t: "Open-field gauntlet — 5 floors", limit: "1 raid limit per day" }
      ]
    },

    roadmap: {
      intro: "A living roadmap shaped by the community. Here is where Eternity is headed next.",
      progress: 0,
      items: [
        { phase: "PHASE 01", title: "Launch & Foundation", status: "DONE", points: ["Server launch & stability pass", "Core class balance v1", "Anti-cheat hardening"] },
        { phase: "PHASE 02", title: "Content Expansion", status: "IN PROGRESS", points: ["New endgame maps", "Seasonal PvP ranking", "Quality-of-life updates"] },
        { phase: "PHASE 03", title: "Community Systems", status: "PLANNED", points: ["Guild tournaments", "Player marketplace", "Community events calendar"] },
        { phase: "PHASE 04", title: "The Long Game", status: "TBA", points: ["Major content update", "Cross-server events", "New progression systems"] }
      ]
    },
    download: {
      bg: "assets/hero-bg.png",
      title: "GET IN THE",
      accent: "FIGHT.",
      intro: "Choose your platform and language. Full clients include all EP9 content.",
      mirrors: [],
      discordUrl: "https://discord.gg/eternity",
      facebookUrl: "https://facebook.com/RanGsEternityEp9"
    },
    community: {
      title: "JOIN THE",
      accent: "LEGEND.",
      desc: "Connect with thousands of players on Discord, the Facebook group, marketplace, school chats and 24/7 admin support. Eternity calls. Answer it — forge your legend.",
      discordUrl: "https://discord.gg/eternity",
      facebookUrl: "https://facebook.com/RanGsEternityEp9",
      stats: [["100+", "Active members"], ["24/7", "Mod coverage"]],
      facebookPage: "RanGsEternityEp9",
      facebookFeed: []
    },
    facebook: {
      pageId: "RanGsEternityEp9",
      title: "FIND US ON",
      accent: "FACEBOOK."
    },
    footer: {
      tagline: "Eternity calls. Answer it.",
      columns: [
        { title: "SERVER", links: [{ label: "Server Info", href: "#server" }, { label: "Classes", href: "#classes" }, { label: "Combat", href: "#combat" }, { label: "Roadmap", href: "#roadmap" }] },
        { title: "PLAY", links: [{ label: "Download", href: "#download" }, { label: "Community", href: "#community" }, { label: "Discord", href: "https://discord.gg/eternity" }, { label: "Facebook", href: "https://facebook.com/RanGsEternityEp9" }] },
        { title: "SUPPORT", links: [{ label: "Bug Reports", href: "https://discord.gg/eternity" }, { label: "Contact", href: "https://facebook.com/RanGsEternityEp9" }] }
      ],
      copyright: "2026 RAN GS Eternity EP9. All Rights Reserved."
    }
  };

  window.SITE_CONFIG = defaults;
})();

