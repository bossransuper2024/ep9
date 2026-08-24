/* AUTO-GENERATED from config.ini — do not edit by hand. */
(function () {
  window.SITE_CONFIG = Object.assign({}, window.SITE_CONFIG, {
  "site": {
    "title": "RanOnline EP9",
    "tagline": "Student calls. Answer it.",
    "brandShort": "RAN online",
    "brandLong": "RanOnline EP9",
    "logo": "assets/logo.png",
    "favicon": "assets/logo.png",
    "version": "EP9",
    "year": "2026"
  },
  "nav": "Home,Server,News,Classes,Combat,Roadmap,Download,Community,Services",
  "hero": {
    "title": "RAN ONLINE",
    "subtitle": "RanOnline EP9",
    "description": "A new era of RAN Online arrives. Build your legend, claim the battlefield, and answer the call of EP9.",
    "bg": "assets/hero-bg-01.png",
    "ctaPlay": "WATCH TRAILER",
    "ctaPlayUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "ctaDownload": "DOWNLOAD NOW"
  },
  "music": {
    "enabled": true,
    "src": "assets/audio/ranmixed-clean.mp3",
    "title": "RanOnline EP9",
    "autoplay": false,
    "bounce": true,
    "aggressive": false,
    "lowGain": 0.3,
    "highGain": 1
  },
  "audioFx": {
    "enabled": false,
    "clickVolume": 0.3,
    "hoverVolume": 0.15
  },
  "background": {
    "zoom": 1.1,
    "rotate": 3,
    "duration": 40
  },
  "server": {
    "bg": "assets/hero-bg-02.png",
    "intro": "A balanced economy and progression curve tuned for hardcore raiders and casual guildmates alike. No pay-to-win — only pay-to-look-fly.",
    "stats": [
      {
        "label": "PLAYABLE CLASSES",
        "value": "07",
        "note": "Each with unique skill trees"
      },
      {
        "label": "MAX CHAR LEVEL",
        "value": "260",
        "note": "Endgame ceiling"
      },
      {
        "label": "MAX SKILL LEVEL",
        "value": "217",
        "note": "Mastery progression"
      },
      {
        "label": "MAX UPGRADE",
        "value": "+10",
        "note": "Unique Upgrade system"
      },
      {
        "label": "LAST ARMOR",
        "value": "CELESTIAL",
        "note": "End-game tier"
      },
      {
        "label": "LAST WEAPON",
        "value": "BLACK DRAGON",
        "note": "Mythic class arsenal"
      },
      {
        "label": "LAST MAP",
        "value": "SAINT POWER PLANT",
        "note": "Endgame zone"
      }
    ],
    "rates": [
      {
        "k": "ITEM DROP",
        "v": "lowhalf"
      },
      {
        "k": "GOLD DROP",
        "v": "low"
      },
      {
        "k": "EXP RATE",
        "v": "mid"
      }
    ]
  },
  "classes": {
    "bg": "assets/hero-bg-03.png",
    "list": [
      {
        "name": "BRAWLER",
        "role": "Melee DPS",
        "spec": "Fist-form striker",
        "difficulty": 2,
        "img": "assets/class-brawler.png",
        "playstyle": "A close-range pressure class built around fast engages, chase pressure and punishing enemies who overextend. Brawler performs best when forcing small skirmishes instead of standing in the middle of a full ranged fight.",
        "pvpAdvantage": "Strong duelist with reliable gap-close pressure and high burst when targets are isolated.",
        "pvpDisadvantage": "Struggles when kited by coordinated ranged classes or locked down before reaching the backline."
      },
      {
        "name": "ARCHER",
        "role": "Ranged DPS",
        "spec": "Sniper / scout",
        "difficulty": 3,
        "img": "assets/class-archer.png",
        "playstyle": "A spacing-based marksman that wins by controlling distance, poking safely and finishing weakened enemies before they can reset. Archer rewards map awareness, target selection and clean movement.",
        "pvpAdvantage": "Excellent range, safe poke and strong pick potential against low-health targets.",
        "pvpDisadvantage": "Vulnerable when melee classes close the gap or when caught without room to reposition."
      },
      {
        "name": "SWORDSMAN",
        "role": "Tank / DPS",
        "spec": "Frontline stopper",
        "difficulty": 2,
        "img": "assets/class-swordsman.png",
        "playstyle": "A durable frontline class that protects space, absorbs pressure and creates openings for the team. Swordsman is ideal for players who want to anchor pushes, peel for allies and survive extended fights.",
        "pvpAdvantage": "High survivability and strong frontline control make it reliable in group clashes.",
        "pvpDisadvantage": "Lower chase speed and burst compared with pure DPS classes, so mobile targets can escape."
      },
      {
        "name": "SHAMAN",
        "role": "Support",
        "spec": "Elemental binder",
        "difficulty": 4,
        "img": "assets/class-shaman.png",
        "playstyle": "A tactical support class focused on sustain, buffs and fight control. Shaman shines when playing behind the frontline, keeping key allies alive and turning long fights through timing and positioning.",
        "pvpAdvantage": "Valuable in organized PvP because utility and sustain can swing extended team fights",
        "pvpDisadvantage": "Needs protection and careful positioning; focused burst or silence pressure can shut it down quickly."
      },
      {
        "name": "EXTREME",
        "role": "Hybrid",
        "spec": "Heavy ordnance",
        "difficulty": 3,
        "img": "assets/class-extreme.png",
        "playstyle": "A flexible combatant with heavy pressure tools and enough utility to adapt between offense and disruption. Extreme is best for players who like switching targets and creating chaos during crowded fights.",
        "pvpAdvantage": "Versatile damage profile and disruptive pressure work well in messy group battles.",
        "pvpDisadvantage": "Can feel less specialized than pure classes, and poor cooldown timing leaves it exposed."
      },
      {
        "name": "GUNNER",
        "role": "Ranged DPS",
        "spec": "Tech-augment vanguard",
        "difficulty": 3,
        "img": "assets/class-gunner.png",
        "playstyle": "A ranged damage dealer built around steady pressure, burst windows and disciplined positioning. Gunner thrives when firing from protected angles and punishing enemies who commit too deep.",
        "pvpAdvantage": "Strong sustained ranged damage and good backline threat in team fights.",
        "pvpDisadvantage": "Needs space and protection; collapses quickly when surrounded or forced into close combat."
      },
      {
        "name": "ASSASSIN",
        "role": "Burst DPS",
        "spec": "Shadow operative",
        "difficulty": 5,
        "img": "assets/class-assassin.png",
        "playstyle": "A high-risk burst class that specializes in flanking, target deletion and escaping before the enemy can respond. Assassin rewards patience, timing and reading the fight before committing.",
        "pvpAdvantage": "Exceptional burst and backline threat against supports, archers and isolated carries.",
        "pvpDisadvantage": "Punishing to misplay; if the opening burst fails, it can be controlled and eliminated fast."
      }
    ]
  },
  "combat": {
    "bg": "assets/hero-bg-04.png",
    "intro": "Competitive PvP modes and flagship PvE pillars. EP9 rewards aggression — but only the disciplined survive Forbidden Tower and Outer Wall.",
    "liveEvent": {
      "tag": "LIVE EVENT",
      "title": "Tyranny Wars: Season 01",
      "desc": "All-out guild war — even guilds from the same school clash for territory and supremacy.",
      "schedule": "Schedule: Everyday 1PM, 4PM, 7PM, 9PM and 11PM"
    },
    "modes": [
      {
        "n": "TYRANNY WARS",
        "t": "All-out guild war",
        "cap": "100v100",
        "schedule": "Everyday 1PM, 4PM, 7PM, 9PM and 11PM",
        "hot": true
      },
      {
        "n": "CLUB WAR(CW)",
        "t": "Faction control",
        "cap": "Guild vs Guild",
        "schedule": "Everyday Saturday 8PM",
        "hot": true
      },
      {
        "n": "WAR OF EMPERIUM (WOE)",
        "t": "Free-for-all arena",
        "cap": "8v8",
        "schedule": "Everyday Wednesday/Sunday 9PM",
        "hot": true
      },
      {
        "n": "CAPTURE THE FLAG",
        "t": "Objective skirmish",
        "cap": "5v5",
        "schedule": "TBA",
        "hot": false
      }
    ],
    "raids": [
      {
        "n": "Eternal Towers",
        "t": "5 Man Dungeon raid — 8 floors, If party gets wiped , need to restart the run",
        "limit": "1 raid limit per Week"
      },
      {
        "n": "OUTER WALL",
        "t": "Open-field gauntlet — 5 floors",
        "limit": "TBA"
      }
    ]
  },
  "roadmap": {
    "bg": "assets/hero-bg-05.png",
    "intro": "A living roadmap shaped by the community. Here is where EP9 is headed next.",
    "progress": 1,
    "items": [
      {
        "phase": "PHASE 01",
        "title": "Closed Alpha & Mechanics Test",
        "status": "IN PROGRESS",
        "points": [
          "Internal Server & Gameplay Test",
          "Bug Fixing & Server Calibration",
          "Database & Security Setup"
        ]
      },
      {
        "phase": "PHASE 02",
        "title": "Closed & Open Beta Test",
        "status": "TBA",
        "points": [
          "Player Beta Testing",
          "Stress & Load Testing",
          "Economy & Shop Calibration"
        ]
      },
      {
        "phase": "PHASE 03",
        "title": "Grand Official Launch",
        "status": "TBA",
        "points": [
          "Official Server Up",
          "Launch Event & Freebies",
          "Leaderboard & Ranking Open"
        ]
      },
      {
        "phase": "PHASE 04",
        "title": "Post-Launch & Live Ops",
        "status": "TBA",
        "points": [
          "First Major Content Update",
          "Guild War / Competitive Events",
          "Quality of Life & anti-cheat Updates"
        ]
      }
    ]
  },
  "download": {
    "title": "GET IN THE",
    "accent": "FIGHT.",
    "intro": "Choose your platform and language. Full clients include all EP9 content.",
    "mirrors": [
      {
        "label": "Google Drive (EN)",
        "url": "https://drive.google.com/",
        "note": "full client mirror1"
      },
      {
        "label": "Google Drive (EN)",
        "url": "https://drive.google.com/",
        "note": "full client mirror1"
      },
      {
        "label": "MediaFire (EN)",
        "url": "https://www.mediafire.com/",
        "note": "full client  mirror1"
      },
      {
        "label": "MediaFire (EN)",
        "url": "https://www.mediafire.com/",
        "note": "full client mirror2"
      }
    ],
    "discordUrl": "https://discord.gg/WFVzNXqd8",
    "facebookUrl": "https://www.facebook.com/ranonlineix",
    "sheets": [
      {
        "section": "Download",
        "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0VR0xFeBPfB2vFwepHAMdIk_OVHpr-8Hae9FZPyY1zbZX8iLP0esSEphwR1tJI3eubpO65ON5NsyD/pub?output=csv&gid=770300372"
      }
    ]
  },
  "news": {
    "bg": "assets/hero-bg-08.png",
    "title": "THE LATEST",
    "accent": "NEWS.",
    "intro": "Announcements, patch notes and live events — straight from the Ran Online EP9 team.",
    "tabAnnouncement": "Announcement",
    "tabEvent": "Event",
    "homeLimit": 4,
    "pageSize": 10,
    "announcement": [
      {
        "id": "1",
        "uid": "a1",
        "slug": "open-beta",
        "type": "ANNOUNCEMENT",
        "cat": "ANNOUNCEMENT",
        "date": "August 20, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Open Beta",
        "image": "",
        "link": "",
        "description": "",
        "context": "news-open-beta.txt",
        "hide": false,
        "text": "Open Beta is LIVE!\r\n\r\nThe gates of EP9 are open. Jump in and claim your starter pack before the servers fill up.\r\n\r\n**Important:** Please read the rules before playing.\r\n\r\n__This welcome bonus is only available during Open Beta.__\r\n\r\n~~The old legacy launcher is no longer supported.~~ Use the new EP9 client.\r\n\r\nServer Features\r\n\r\n- Free to Play\r\n- Auto Skill System\r\n- Daily Rewards\r\n- Custom Events\r\n\r\nSee you on the battlefield, soldier."
      },
      {
        "id": "2",
        "uid": "a2",
        "slug": "patch-notes-v1-1",
        "type": "ANNOUNCEMENT",
        "cat": "ANNOUNCEMENT",
        "date": "September 1, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Patch Notes v1.1",
        "image": "",
        "link": "",
        "description": "",
        "context": "news-patch-1-1.txt",
        "hide": false,
        "text": "Patch Notes — v1.1\r\n\r\nThis patch focuses on balance, rewards and security.\r\n\r\n**Highlights**\r\n\r\n- Drop-rate tuning across all dungeon tiers\r\n- New daily login rewards\r\n- Improved anti-cheat detection\r\n\r\n**Bug Fixes**\r\n\r\n- Fixed a rare crash on class selection\r\n- Resolved an issue where __trade windows could desync__\r\n- Patched the ~~dupe exploit~~ that affected a small number of accounts\r\n\r\nThank you for reporting issues on our Discord. Keep them coming!"
      },
      {
        "id": "3",
        "uid": "a3",
        "slug": "community-event-tyranny-wars",
        "type": "ANNOUNCEMENT",
        "cat": "ANNOUNCEMENT",
        "date": "September 10, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Community Event: Tyranny Wars",
        "image": "",
        "link": "",
        "description": "",
        "context": "news-tyranny-wars.txt",
        "hide": false,
        "text": "Community Event: Tyranny Wars\r\n\r\nThe first season of Tyranny Wars begins. For the first time, __even guilds from the same school can clash__ for territory and supremacy.\r\n\r\n**How it works**\r\n\r\n- Form or join a warband\r\n- Capture territory nodes across the map\r\n- Hold them to earn weekly supremacy points\r\n\r\n~~Solo players cannot register alone.~~ Actually, solo registration is allowed — bring your best build.\r\n\r\nRewards scale with your rank at the end of the season. Good luck, commander."
      }
    ],
    "event": [
      {
        "id": "1",
        "uid": "e1",
        "slug": "community-event-tyranny-wars",
        "type": "NEWS",
        "cat": "NEWS",
        "date": "September 10, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Community Event: Tyranny Wars",
        "image": "",
        "link": "",
        "description": "",
        "context": "news-tyranny-wars.txt",
        "hide": false,
        "text": "Community Event: Tyranny Wars\r\n\r\nThe first season of Tyranny Wars begins. For the first time, __even guilds from the same school can clash__ for territory and supremacy.\r\n\r\n**How it works**\r\n\r\n- Form or join a warband\r\n- Capture territory nodes across the map\r\n- Hold them to earn weekly supremacy points\r\n\r\n~~Solo players cannot register alone.~~ Actually, solo registration is allowed — bring your best build.\r\n\r\nRewards scale with your rank at the end of the season. Good luck, commander."
      },
      {
        "id": "2",
        "uid": "e2",
        "slug": "double-exp-weekend",
        "type": "NEWS",
        "cat": "NEWS",
        "date": "September 15, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Double EXP Weekend",
        "image": "",
        "link": "",
        "description": "",
        "context": "event-double-exp.txt",
        "hide": false,
        "text": "Double EXP Weekend\r\nLog in this weekend and earn double EXP across every map — the perfect time to push a new character or catch up on levels.\r\n- Event runs Friday 6PM through Sunday midnight (server time)\r\n- Applies to all PvE and quest EXP gains\r\n- Premium members get an extra +20% on top\r\nStack the bonus with the daily login reward and climb the ladder fast. See you on the battlefield!\r\n"
      },
      {
        "id": "3",
        "uid": "e3",
        "slug": "founding-member-giveaway",
        "type": "NEWS",
        "cat": "NEWS",
        "date": "September 20, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Founding Member Giveaway",
        "image": "",
        "link": "",
        "description": "",
        "context": "event-giveaway.txt",
        "hide": false,
        "text": "Founding Member Giveaway\r\nTo celebrate launch week, we're giving away exclusive founder cosmetics and a starter gear pack to the first 500 registered players.\r\n- Create your account and reach level 30 before the deadline\r\n- Founder titles are permanent and account-bound\r\n- Winners are announced in the Discord community\r\nDon't miss your chance to wear the badge of a founding member. Good luck!\r\n"
      }
    ],
    "tutorial": [
      {
        "id": "1",
        "uid": "g1",
        "slug": "how-to-install",
        "type": "GUIDE",
        "cat": "GUIDE",
        "date": "August 25, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "How to Install",
        "image": "",
        "link": "",
        "description": "",
        "context": "tutorial-install.txt",
        "hide": false,
        "text": "How to Install the EP9 Client\r\n\r\nFollow these steps to get into the game.\r\n\r\n**Step 1 — Download**\r\n\r\n- Get the full client from the Download section\r\n- Choose the mirror closest to your region\r\n\r\n**Step 2 — Extract**\r\n\r\n- Unzip the archive to a folder you can find easily\r\n- __Do not__ place it inside Program Files (Windows can block writes)\r\n\r\n**Step 3 — Launch**\r\n\r\n- Run the launcher as administrator\r\n- Let it patch to the latest version\r\n\r\n~~If you see a virus warning, ignore it.~~ Modern launchers are signed — if your antivirus flags it, add an exception.\r\n\r\nYou're ready to play. See you in-game!"
      },
      {
        "id": "2",
        "uid": "g2",
        "slug": "beginner-class-guide",
        "type": "GUIDE",
        "cat": "GUIDE",
        "date": "August 28, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Beginner Class Guide",
        "image": "",
        "link": "",
        "description": "",
        "context": "tutorial-classes.txt",
        "hide": false,
        "text": "Beginner Class Guide\r\n\r\nNot sure where to start? Here's a quick breakdown of the seven classes.\r\n\r\n**Melee**\r\n\r\n- Sword Warrior — high burst, close range\r\n- Blade Specialist — fast, mobile duelist\r\n\r\n**Ranged**\r\n\r\n- Archer — sustained damage from afar\r\n- Mage — area control and crowd control\r\n\r\n**Support**\r\n\r\n- Priest — healing and buffs\r\n- Bard — utility and team scaling\r\n\r\n__Pick what fits your playstyle, not just the meta.__\r\n\r\nExperiment in the training grounds before committing your build."
      },
      {
        "id": "3",
        "uid": "g3",
        "slug": "safe-trading-with-middleman",
        "type": "GUIDE",
        "cat": "GUIDE",
        "date": "September 5, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Safe Trading with Middleman",
        "image": "",
        "link": "",
        "description": "",
        "context": "tutorial-middleman.txt",
        "hide": false,
        "text": "Safe Trading with a Middleman\r\n\r\nAlways use a __verified middleman__ for big trades. It only takes a minute and prevents scams.\r\n\r\n**The process**\r\n\r\n- Both players agree on a verified middleman\r\n- The seller hands the item to the middleman\r\n- The buyer sends payment to the middleman\r\n- The middleman releases item and payment at the same time\r\n\r\n~~Never trade directly with someone you don't trust.~~ Even friends can be compromised — use a middleman for high-value deals.\r\n\r\nOpen a ticket in our Discord to request a middleman."
      }
    ],
    "items": [
      {
        "id": "3",
        "uid": "a3",
        "slug": "community-event-tyranny-wars",
        "type": "ANNOUNCEMENT",
        "cat": "ANNOUNCEMENT",
        "date": "September 10, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Community Event: Tyranny Wars",
        "image": "",
        "link": "",
        "description": "",
        "context": "news-tyranny-wars.txt",
        "hide": false,
        "text": "Community Event: Tyranny Wars\r\n\r\nThe first season of Tyranny Wars begins. For the first time, __even guilds from the same school can clash__ for territory and supremacy.\r\n\r\n**How it works**\r\n\r\n- Form or join a warband\r\n- Capture territory nodes across the map\r\n- Hold them to earn weekly supremacy points\r\n\r\n~~Solo players cannot register alone.~~ Actually, solo registration is allowed — bring your best build.\r\n\r\nRewards scale with your rank at the end of the season. Good luck, commander."
      },
      {
        "id": "2",
        "uid": "a2",
        "slug": "patch-notes-v1-1",
        "type": "ANNOUNCEMENT",
        "cat": "ANNOUNCEMENT",
        "date": "September 1, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Patch Notes v1.1",
        "image": "",
        "link": "",
        "description": "",
        "context": "news-patch-1-1.txt",
        "hide": false,
        "text": "Patch Notes — v1.1\r\n\r\nThis patch focuses on balance, rewards and security.\r\n\r\n**Highlights**\r\n\r\n- Drop-rate tuning across all dungeon tiers\r\n- New daily login rewards\r\n- Improved anti-cheat detection\r\n\r\n**Bug Fixes**\r\n\r\n- Fixed a rare crash on class selection\r\n- Resolved an issue where __trade windows could desync__\r\n- Patched the ~~dupe exploit~~ that affected a small number of accounts\r\n\r\nThank you for reporting issues on our Discord. Keep them coming!"
      },
      {
        "id": "1",
        "uid": "a1",
        "slug": "open-beta",
        "type": "ANNOUNCEMENT",
        "cat": "ANNOUNCEMENT",
        "date": "August 20, 2026",
        "eventDate": "",
        "author": "Admin",
        "title": "Open Beta",
        "image": "",
        "link": "",
        "description": "",
        "context": "news-open-beta.txt",
        "hide": false,
        "text": "Open Beta is LIVE!\r\n\r\nThe gates of EP9 are open. Jump in and claim your starter pack before the servers fill up.\r\n\r\n**Important:** Please read the rules before playing.\r\n\r\n__This welcome bonus is only available during Open Beta.__\r\n\r\n~~The old legacy launcher is no longer supported.~~ Use the new EP9 client.\r\n\r\nServer Features\r\n\r\n- Free to Play\r\n- Auto Skill System\r\n- Daily Rewards\r\n- Custom Events\r\n\r\nSee you on the battlefield, soldier."
      }
    ]
  },
  "newsFilter": [
    {
      "key": "all",
      "label": "All"
    },
    {
      "key": "announcement",
      "label": "Announcement"
    }
  ],
  "newsConfig": {
    "itemsPerPage": 10,
    "showImagesInList": false,
    "showImagesInArticle": true,
    "showDate": true,
    "showCategory": true,
    "showExcerpt": true,
    "pagination": true,
    "previousLabel": "Previous",
    "nextLabel": "Next"
  },
  "community": {
    "title": "JOIN THE",
    "accent": "LEGEND.",
    "desc": "Connect with thousands of players on Discord, the Facebook group, marketplace, school chats and 24/7 admin support. EP9 calls. Answer it — forge your legend.",
    "discordUrl": "https://discord.gg/WFVzNXqd8",
    "facebookUrl": "https://www.facebook.com/ranonlineix",
    "facebookGroupUrl": "https://www.facebook.com/groups/ranonlineix",
    "stats": [
      [
        "100+",
        "Active members"
      ],
      [
        "24/7",
        "Mod coverage"
      ]
    ],
    "facebookPage": "ranOnline EP9"
  },
  "services": {
    "bg": "assets/hero-bg-07.png",
    "title": "OUR",
    "accent": "SERVICES.",
    "intro": "Run by players, for players — every service below is staff-verified and backed by the Ran Online EP9 team.",
    "apply": {
      "Pilots": "https://www.facebook.com/ranonlineix",
      "Middleman": "https://www.facebook.com/ranonlineix",
      "Streamer": "https://www.facebook.com/ranonlineix",
      "Services": ""
    },
    "items": [
      {
        "img": "assets/service-pilots.png",
        "section": "Pilots",
        "ykc": "1",
        "saying": "dito free rosa",
        "fee": "50",
        "rateperh": "/hr",
        "social": "www.fb.com/rey",
        "name": "reymart bello"
      },
      {
        "img": "assets/service-middleman.png",
        "section": "Middleman",
        "ykc": "1",
        "ign": "[midman]low",
        "saying": "dito free rosa",
        "fee": "2%",
        "social": "www.fb.com/rey",
        "name": "reymart bello"
      },
      {
        "img": "assets/service-middleman.png",
        "section": "Middleman",
        "ykc": "1",
        "ign": "[midman]low",
        "saying": "dito free rosa",
        "fee": "2%",
        "social": "www.fb.com/rey",
        "name": "reymart bello"
      },
      {
        "img": "assets/service-middleman.png",
        "section": "Middleman",
        "ykc": "1",
        "ign": "[midman]low",
        "saying": "dito free rosa",
        "fee": "2%",
        "social": "www.fb.com/rey",
        "name": "reymart bello"
      },
      {
        "img": "assets/service-streamer.png",
        "section": "Streamer",
        "ykc": "1",
        "socialtype": "facebook",
        "streamkey": "lowkey",
        "url": "www.fb.com/rey",
        "name": "rey b"
      }
    ],
    "sheets": [
      {
        "section": "Streamer",
        "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0VR0xFeBPfB2vFwepHAMdIk_OVHpr-8Hae9FZPyY1zbZX8iLP0esSEphwR1tJI3eubpO65ON5NsyD/pub?output=csv&gid=0"
      },
      {
        "section": "Middleman",
        "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0VR0xFeBPfB2vFwepHAMdIk_OVHpr-8Hae9FZPyY1zbZX8iLP0esSEphwR1tJI3eubpO65ON5NsyD/pub?output=csv&gid=1728512928"
      },
      {
        "section": "Pilots",
        "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0VR0xFeBPfB2vFwepHAMdIk_OVHpr-8Hae9FZPyY1zbZX8iLP0esSEphwR1tJI3eubpO65ON5NsyD/pub?output=csv&gid=275874110"
      }
    ]
  },
  "facebook": {
    "bg": "assets/hero-bg-09.png",
    "pageId": "ranonlineix",
    "title": "FIND US ON",
    "accent": "FACEBOOK."
  },
  "footer": {
    "bg": "assets/hero-bg-10.png",
    "tagline": "EP9 calls. Answer it.",
    "columns": [
      {
        "title": "SERVER",
        "links": [
          {
            "label": "Server Info",
            "href": "#server"
          },
          {
            "label": "Classes",
            "href": "#classes"
          },
          {
            "label": "Combat",
            "href": "#combat"
          },
          {
            "label": "Roadmap",
            "href": "#roadmap"
          }
        ]
      },
      {
        "title": "PLAY",
        "links": [
          {
            "label": "Download",
            "href": "#download"
          },
          {
            "label": "Community",
            "href": "#community"
          },
          {
            "label": "Services",
            "href": "#services"
          },
          {
            "label": "Discord",
            "href": "https://discord.gg/WFVzNXqd8"
          },
          {
            "label": "Facebook",
            "href": "https://www.facebook.com/ranonlineix"
          }
        ]
      },
      {
        "title": "SUPPORT",
        "links": [
          {
            "label": "Bug Reports",
            "href": "https://discord.gg/WFVzNXqd8"
          },
          {
            "label": "Contact",
            "href": "https://www.facebook.com/ranonlineix"
          }
        ]
      }
    ],
    "copyright": "2026 RAN EP9. All Rights Reserved."
  }
});
})();
