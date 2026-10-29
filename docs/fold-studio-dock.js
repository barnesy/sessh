/**
 * Session Drummer ("sessh") — 16-Bar (4-Section) Artist Groove Workstation PWA
 * 15 Legendary Artists × 75 Iconic Song Arrangements + 15 Swappable Drum Kits
 * Runs 100% Standalone Offline (GitHub Pages PWA) + Optional Ableton Live 12 Studio Bridge
 */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('fold-install-btn');
    if (btn) btn.style.display = 'inline-flex';
  });

  // ==========================================================================
  // 1. 8-Voice Drum Rack Definition (Standard GM / Ableton Drum Rack Mapping)
  // ==========================================================================
  const DRUM_VOICES = [
    { id: 'kick', name: 'KICK', short: 'KCK', pitch: 36, color: '#f43f5e' },
    { id: 'rim', name: 'RIM / PERC', short: 'RIM', pitch: 37, color: '#fb923c' },
    { id: 'snare', name: 'SNARE', short: 'SNR', pitch: 38, color: '#eab308' },
    { id: 'clap', name: 'CLAP', short: 'CLP', pitch: 39, color: '#f59e0b' },
    { id: 'ch', name: 'CL HAT', short: 'CHH', pitch: 42, color: '#38bdf8' },
    { id: 'oh', name: 'OP HAT', short: 'OHH', pitch: 46, color: '#06b6d4' },
    { id: 'tom', name: 'TOMS', short: 'TOM', pitch: 45, color: '#a855f7' },
    { id: 'crash', name: 'RIDE / CRASH', short: 'CYM', pitch: 49, color: '#ec4899' }
  ];

  // ==========================================================================
  // 2. 11 Swappable Drum Kit Sound Engines (WebAudio Synthesis Profiles)
  // ==========================================================================
  const DRUM_KITS = [
    {
      id: 'bonham',
      name: '🔨 Bonham 26" Vistalite Kit (Led Zeppelin)',
      kickStart: 155, kickEnd: 46, kickDecay: 0.39, kickClick: 0.58,
      snareTone: 196, snareHp: 240, snareDecay: 0.28, rimMix: 0.95,
      hatHp: 4900, hatDecay: 0.085, openHatDecay: 0.46, tomBase: 86, laybackMs: 5
    },
    {
      id: 'jamesbrown',
      name: '👑 Funky Drummer Brass Snare Kit (James Brown)',
      kickStart: 142, kickEnd: 52, kickDecay: 0.21, kickClick: 0.45,
      snareTone: 238, snareHp: 460, snareDecay: 0.14, rimMix: 1.15,
      hatHp: 6900, hatDecay: 0.044, openHatDecay: 0.22, tomBase: 124, laybackMs: 4
    },
    {
      id: 'linndrum',
      name: '☔ Minneapolis LinnDrum LM-1 Kit (Prince)',
      kickStart: 168, kickEnd: 44, kickDecay: 0.26, kickClick: 0.64,
      snareTone: 215, snareHp: 380, snareDecay: 0.21, rimMix: 1.35,
      hatHp: 7500, hatDecay: 0.048, openHatDecay: 0.32, tomBase: 138, laybackMs: 0
    },
    {
      id: 'neosoul',
      name: "🍯 Neo-Soul Pocket Kit (D'Angelo / Badu)",
      kickStart: 132, kickEnd: 38, kickDecay: 0.32, kickClick: 0.22,
      snareTone: 175, snareHp: 420, snareDecay: 0.14, rimMix: 1.25,
      hatHp: 7200, hatDecay: 0.042, openHatDecay: 0.26, tomBase: 105, laybackMs: 14
    },
    {
      id: 'gorillaz',
      name: '🦍 Gorillaz Lo-Fi Dub Kit',
      kickStart: 148, kickEnd: 41, kickDecay: 0.36, kickClick: 0.38,
      snareTone: 198, snareHp: 310, snareDecay: 0.22, rimMix: 1.15,
      hatHp: 5800, hatDecay: 0.06, openHatDecay: 0.38, tomBase: 122, laybackMs: 8
    },
    {
      id: 'abbey60s',
      name: '🪲 Abbey Road 60s Kit (The Beatles / Ringo)',
      kickStart: 118, kickEnd: 52, kickDecay: 0.22, kickClick: 0.28,
      snareTone: 162, snareHp: 260, snareDecay: 0.18, rimMix: 0.9,
      hatHp: 5200, hatDecay: 0.075, openHatDecay: 0.34, tomBase: 92, laybackMs: 6
    },
    {
      id: 'kanye',
      name: '🐻 Late Registration Soul-Chop Kit (Kanye)',
      kickStart: 158, kickEnd: 36, kickDecay: 0.38, kickClick: 0.45,
      snareTone: 205, snareHp: 480, snareDecay: 0.19, rimMix: 1.1,
      hatHp: 6800, hatDecay: 0.05, openHatDecay: 0.3, tomBase: 110, laybackMs: 7
    },
    {
      id: 'mpc3000',
      name: '🌙 Brooklyn MPC-3000 Kit (Mos Def / Premier)',
      kickStart: 145, kickEnd: 42, kickDecay: 0.29, kickClick: 0.42,
      snareTone: 192, snareHp: 390, snareDecay: 0.16, rimMix: 1.0,
      hatHp: 6500, hatDecay: 0.048, openHatDecay: 0.25, tomBase: 112, laybackMs: 10
    },
    {
      id: 'daftpunk',
      name: '🤖 French Touch 909 Kit (Daft Punk)',
      kickStart: 175, kickEnd: 45, kickDecay: 0.27, kickClick: 0.55,
      snareTone: 220, snareHp: 520, snareDecay: 0.18, rimMix: 1.0,
      hatHp: 7600, hatDecay: 0.052, openHatDecay: 0.36, tomBase: 128, laybackMs: 0
    },
    {
      id: 'strokes',
      name: '🎸 NYC Garage Rock Kit (The Strokes)',
      kickStart: 160, kickEnd: 54, kickDecay: 0.21, kickClick: 0.62,
      snareTone: 212, snareHp: 290, snareDecay: 0.24, rimMix: 0.85,
      hatHp: 5600, hatDecay: 0.07, openHatDecay: 0.4, tomBase: 118, laybackMs: 0
    },
    {
      id: 'outkast',
      name: '🛸 Stankonia ATLiens 808 & Funk Kit (OutKast)',
      kickStart: 154, kickEnd: 33, kickDecay: 0.44, kickClick: 0.42,
      snareTone: 214, snareHp: 510, snareDecay: 0.17, rimMix: 1.2,
      hatHp: 7800, hatDecay: 0.042, openHatDecay: 0.27, tomBase: 108, laybackMs: 6
    },
    {
      id: 'beegees',
      name: '🕺 Saturday Night Fever Tape-Loop Kit (Bee Gees)',
      kickStart: 138, kickEnd: 48, kickDecay: 0.23, kickClick: 0.36,
      snareTone: 184, snareHp: 340, snareDecay: 0.16, rimMix: 1.05,
      hatHp: 6400, hatDecay: 0.052, openHatDecay: 0.31, tomBase: 114, laybackMs: 3
    },
    {
      id: 'rush',
      name: '🦉 Le Studio Tam-Tam & Paragon Kit (Rush / Neil Peart)',
      kickStart: 164, kickEnd: 47, kickDecay: 0.25, kickClick: 0.65,
      snareTone: 228, snareHp: 390, snareDecay: 0.19, rimMix: 1.15,
      hatHp: 7400, hatDecay: 0.046, openHatDecay: 0.34, tomBase: 142, laybackMs: 0
    },
    {
      id: 'radiohead',
      name: '📻 In Rainbows / Kid A Krautrock Kit (Radiohead)',
      kickStart: 144, kickEnd: 46, kickDecay: 0.24, kickClick: 0.44,
      snareTone: 188, snareHp: 350, snareDecay: 0.15, rimMix: 1.35,
      hatHp: 6700, hatDecay: 0.045, openHatDecay: 0.29, tomBase: 112, laybackMs: 2
    },
    {
      id: 'philcollins',
      name: '🥁 Townhouse SSL Gated-Reverb Concert-Tom Kit (Phil Collins)',
      kickStart: 162, kickEnd: 45, kickDecay: 0.34, kickClick: 0.62,
      snareTone: 186, snareHp: 220, snareDecay: 0.32, rimMix: 1.25,
      hatHp: 6800, hatDecay: 0.055, openHatDecay: 0.36, tomBase: 132, laybackMs: 2
    },
    {
      id: 'hotchip',
      name: '🎹 Modular 707/808 & Live Indie-Disco Kit (Hot Chip)',
      kickStart: 152, kickEnd: 41, kickDecay: 0.31, kickClick: 0.52,
      snareTone: 204, snareHp: 420, snareDecay: 0.16, rimMix: 1.45,
      hatHp: 7600, hatDecay: 0.042, openHatDecay: 0.28, tomBase: 126, laybackMs: 2
    },
    {
      id: 'blink182',
      name: '🛹 OCDP Vent-Snare & Zildjian Pop-Punk Kit (Travis Barker)',
      kickStart: 172, kickEnd: 49, kickDecay: 0.22, kickClick: 0.68,
      snareTone: 244, snareHp: 450, snareDecay: 0.16, rimMix: 1.15,
      hatHp: 7500, hatDecay: 0.048, openHatDecay: 0.38, tomBase: 104, laybackMs: 0
    },
    {
      id: 'trap808',
      name: '🔊 Modern 808 Sub-Trap Kit',
      kickStart: 150, kickEnd: 31, kickDecay: 0.52, kickClick: 0.35,
      snareTone: 210, snareHp: 620, snareDecay: 0.15, rimMix: 1.1,
      hatHp: 8200, hatDecay: 0.038, openHatDecay: 0.28, tomBase: 98, laybackMs: 2
    }
  ];

  // ==========================================================================
  // 3. 11 Artists × 5 Iconic Song Grooves Each (55 Total · Original BPMs)
  // ==========================================================================
  const ARTIST_CATALOG = [
    {
      artistId: 'zeppelin',
      artistName: '🔨 Led Zeppelin',
      drummer: 'John Bonham',
      defaultKit: 'bonham',
      songs: [
        {
          id: 'zep_levee',
          title: 'When the Levee Breaks',
          bpm: 71,
          swing: 8,
          kit: 'bonham',
          desc: 'Headley Grange stairwell stomp: kick on 1, a-of-2 (step 7), 3, &-of-3 (step 10), booming snare on 2 & 4, sloshy 8th hats',
          kicks: [0, 7, 8, 10],
          kicksBar2: [0, 7, 8, 10, 15],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'bonham'
        },
        {
          id: 'zep_kashmir',
          title: 'Kashmir',
          bpm: 80,
          swing: 6,
          kit: 'bonham',
          desc: 'Towering desert march: double-kick pulse on 1-& and 3-&, phased snare crack on 2 & 4, and thunderous Bar-4 tom turnaround',
          kicks: [0, 2, 8, 10],
          kicksBar2: [0, 2, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [0, 8],
          tomsBar2: [14, 15],
          hatMode: '8th_heavy',
          fillStyle: 'bonham'
        },
        {
          id: 'zep_goodtimes',
          title: 'Good Times Bad Times',
          bpm: 95,
          swing: 8,
          kit: 'bonham',
          desc: 'Cowbell rock groove with Bonham’s famous right-foot 16th-triplet double-kick bursts (steps 6-7 & 14-15)',
          kicks: [0, 2, 7, 8, 10, 15],
          kicksBar2: [0, 2, 6, 7, 8, 10, 14, 15],
          snares: [4, 12],
          rims: [0, 4, 8, 12],
          claps: [],
          ghostSnares: [9],
          openHats: [2, 10],
          tomsBar2: [11, 13],
          hatMode: '8th_drive',
          fillStyle: 'bonham'
        },
        {
          id: 'zep_wholelotta',
          title: 'Whole Lotta Love',
          bpm: 89,
          swing: 10,
          kit: 'bonham',
          desc: 'Deep blues-rock pocket locking with the riff (kick on 1, 1-&, 3, 3-&), ghost-snare chatter & open-hat bark on 4-&',
          kicks: [0, 2, 8, 10],
          kicksBar2: [0, 2, 7, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [14],
          tomsBar2: [13, 14],
          hatMode: '8th_heavy',
          fillStyle: 'bonham'
        },
        {
          id: 'zep_immigrant',
          title: 'Immigrant Song',
          bpm: 112,
          swing: 4,
          kit: 'bonham',
          desc: 'Relentless galloping right-foot hammer (1, 1-&-a, 3, 3-&-a) with driving 8th hats and cracking SupraPhonic snare',
          kicks: [0, 2, 3, 8, 10, 11],
          kicksBar2: [0, 2, 3, 6, 8, 10, 11, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [0, 8],
          tomsBar2: [],
          hatMode: '8th_drive',
          fillStyle: 'bonham'
        }
      ]
    },
    {
      artistId: 'jamesbrown',
      artistName: '👑 James Brown',
      drummer: 'Clyde Stubblefield & Jabo Starks',
      defaultKit: 'jamesbrown',
      songs: [
        {
          id: 'jb_funkydrummer',
          title: 'Funky Drummer',
          bpm: 101,
          swing: 16,
          kit: 'jamesbrown',
          desc: 'Clyde Stubblefield’s immortal breakbeat: kick on 1, 1-&, 3-&, 4-e, ghost snares on 7/9/11/15 & open-hat barks on 7 & 13',
          kicks: [0, 2, 10, 13],
          kicksBar2: [0, 2, 6, 10, 13, 15],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 9, 11, 15],
          openHats: [7, 13],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'clyde_funk'
        },
        {
          id: 'jb_coldsweat',
          title: 'Cold Sweat',
          bpm: 114,
          swing: 14,
          kit: 'jamesbrown',
          desc: 'Clyde’s displaced Bar-2 snare masterpiece: Bar 1 hits 2 & 4, Bar 2 shifts the second snare to 4-& (step 14) with an open hat on 3-&',
          kicks: [0, 6, 10],
          kicksBar2: [0, 6, 8, 10],
          snares: [4, 12],
          snaresBar2: [4, 14],
          rims: [],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [10],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'clyde_funk'
        },
        {
          id: 'jb_sexmachine',
          title: 'Get Up (Sex Machine)',
          bpm: 108,
          swing: 14,
          kit: 'jamesbrown',
          desc: 'Jabo Starks’s razor-tight pocket: syncopated kick locking with Bootsy’s bass (0, 3, 10, 11), brass snare crack & ghost chatter',
          kicks: [0, 3, 10, 11],
          kicksBar2: [0, 3, 6, 10, 11, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [1, 7, 9, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'clyde_funk'
        },
        {
          id: 'jb_giveitup',
          title: 'Give It Up or Turnit a Loose',
          bpm: 110,
          swing: 15,
          kit: 'jamesbrown',
          desc: 'Foundational b-boy funk break: rolling syncopated kick (0, 3, 6, 10, 14), ghost snares, and conga/tom accents',
          kicks: [0, 3, 6, 10, 14],
          kicksBar2: [0, 3, 6, 10, 13, 15],
          snares: [4, 12],
          rims: [2, 10],
          claps: [],
          ghostSnares: [1, 7, 9, 15],
          openHats: [6, 14],
          tomsBar2: [11, 14],
          hatMode: '16th_funk',
          fillStyle: 'clyde_funk'
        },
        {
          id: 'jb_payback',
          title: 'The Payback',
          bpm: 93,
          swing: 18,
          kit: 'jamesbrown',
          desc: 'Heavy 70s soul-funk strut: deep "On the One" double kick (0, 2, 9, 10), rim+snare snap, and open-hat sighs on 2-& & 4-&',
          kicks: [0, 2, 9, 10],
          kicksBar2: [0, 2, 6, 9, 10, 14],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [6, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'clyde_funk'
        }
      ]
    },
    {
      artistId: 'prince',
      artistName: '☔ Prince',
      drummer: 'LinnDrum LM-1 / Sheila E. / Bobby Z',
      defaultKit: 'linndrum',
      songs: [
        {
          id: 'prince_doves',
          title: 'When Doves Cry',
          bpm: 126,
          swing: 6,
          kit: 'linndrum',
          desc: 'Bassless LinnDrum LM-1 masterpiece: punchy kick on 1, 1-a, 3, 3-&, iconic pitched-down rimshot knock & gated snare',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 4, 7, 11, 12],
          claps: [12],
          ghostSnares: [15],
          openHats: [14],
          tomsBar2: [13, 14, 15],
          hatMode: '16th_drive',
          fillStyle: 'linndrum'
        },
        {
          id: 'prince_kiss',
          title: 'Kiss',
          bpm: 111,
          swing: 16,
          kit: 'linndrum',
          desc: 'Stripped-down Minneapolis machine-funk: syncopated dry kick (0, 3, 6, 10, 14), gated snare+clap & tight cabasa/hat pulse',
          kicks: [0, 3, 6, 10, 14],
          kicksBar2: [0, 3, 8, 10, 11, 14],
          snares: [4, 12],
          rims: [4, 7, 12, 15],
          claps: [4, 12],
          ghostSnares: [],
          openHats: [6, 14],
          tomsBar2: [14, 15],
          hatMode: '16th_funk',
          fillStyle: 'linndrum'
        },
        {
          id: 'prince_1999',
          title: '1999',
          bpm: 119,
          swing: 8,
          kit: 'linndrum',
          desc: 'Infectious Minneapolis party groove: driving LinnDrum kick pulse, clap+snare backbeat, offbeat open hats & pitched tom fills',
          kicks: [0, 4, 8, 10, 12],
          kicksBar2: [0, 3, 4, 8, 10, 12, 14],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [11, 14],
          hatMode: '16th_funk',
          fillStyle: 'linndrum'
        },
        {
          id: 'prince_raspberry',
          title: 'Raspberry Beret',
          bpm: 121,
          swing: 8,
          kit: 'linndrum',
          desc: 'Bouncy LinnDrum pop-funk: kick pickup on 2-a (step 7), bright snare+clap on 2 & 4, and signature gated tom accents',
          kicks: [0, 7, 8, 10],
          kicksBar2: [0, 3, 7, 8, 10, 14],
          snares: [4, 12],
          rims: [3, 11],
          claps: [4, 12],
          ghostSnares: [15],
          openHats: [14],
          tomsBar2: [6, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'linndrum'
        },
        {
          id: 'prince_purplerain',
          title: 'Purple Rain',
          bpm: 58,
          swing: 6,
          kit: 'linndrum',
          desc: 'Slow stadium rock anthem: cross-stick rimshot on beat 2, massive gated snare+clap on beat 4, and 16th hi-hat shimmer',
          kicks: [0, 7, 8],
          kicksBar2: [0, 6, 8, 10, 15],
          snares: [12],
          rims: [4, 12],
          claps: [12],
          ghostSnares: [15],
          openHats: [14],
          tomsBar2: [13, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'linndrum'
        }
      ]
    },
    {
      artistId: 'gorillaz',
      artistName: '🦍 Gorillaz',
      drummer: 'Cass Browne / Russ Hobbs',
      defaultKit: 'gorillaz',
      songs: [
        {
          id: 'gor_clint',
          title: 'Clint Eastwood',
          bpm: 84,
          swing: 22,
          kit: 'gorillaz',
          desc: 'Swung zombie hip-hop breakbeat: booming sub-kick (0, 3, 8, 10), crunchy snare, dub rim skanks & open-hat sigh on 4-&',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 7, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 11],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [14],
          tomsBar2: [14, 15],
          hatMode: '8th_heavy',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'gor_feelgood',
          title: 'Feel Good Inc.',
          bpm: 139,
          swing: 12,
          kit: 'gorillaz',
          desc: 'Iconic bass-locked breakbeat stomp: kick on 1, 2-&, 3, 4-& (0, 6, 8, 14), heavy snare+clap backbeat & open hat on 4-&',
          kicks: [0, 6, 8, 14],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [14, 15],
          hatMode: '8th_drive',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'gor_dare',
          title: 'DARE',
          bpm: 120,
          swing: 10,
          kit: 'gorillaz',
          desc: 'Electro-funk Madchester dance groove: 4-on-the-floor kick, punchy snare+clap, and upbeat open hi-hats on every "&"',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 4, 8, 12, 14],
          snares: [4, 12],
          rims: [3, 11],
          claps: [4, 12],
          ghostSnares: [],
          openHats: [2, 6, 10, 14],
          tomsBar2: [13, 14],
          hatMode: '16th_funk',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'gor_dirtyharry',
          title: 'Dirty Harry',
          bpm: 96,
          swing: 14,
          kit: 'gorillaz',
          desc: 'Funky breakbeat bounce: syncopated double kick (0, 2, 7, 10), woodblock/rim counter-rhythm & crisp ghost snares',
          kicks: [0, 2, 7, 10],
          kicksBar2: [0, 2, 6, 10, 14],
          snares: [4, 12],
          rims: [3, 6, 11, 14],
          claps: [4, 12],
          ghostSnares: [9, 15],
          openHats: [14],
          tomsBar2: [14, 15],
          hatMode: '16th_funk',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'gor_tomorrow',
          title: 'Tomorrow Comes Today',
          bpm: 90,
          swing: 18,
          kit: 'gorillaz',
          desc: 'Dark lo-fi trip-hop dub break: deep kick on 1, 1-&, 3, 3-a, spring-reverb rim+snare & moody open-hat barks',
          kicks: [0, 2, 8, 11],
          kicksBar2: [0, 2, 7, 8, 11, 14],
          snares: [4, 12],
          rims: [4, 12, 14],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [6, 14],
          tomsBar2: [13, 15],
          hatMode: '8th_heavy',
          fillStyle: 'hiphop_mpc'
        }
      ]
    },
    {
      artistId: 'dangelo',
      artistName: "🍯 D'Angelo",
      drummer: 'Questlove & Chris Dave',
      defaultKit: 'neosoul',
      songs: [
        {
          id: 'dan_untitled',
          title: 'Untitled (How Does It Feel)',
          bpm: 66,
          swing: 36,
          kit: 'neosoul',
          desc: 'Electric Lady 6/8-feel slow jam: lazy rim+snare backbeat, warm sub-kick pickups on 2-a & 4-a, and delicate hat pulse',
          kicks: [0, 7, 8, 15],
          kicksBar2: [0, 6, 8, 10, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [3, 9, 11],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'dan_brownsugar',
          title: 'Brown Sugar',
          bpm: 83,
          swing: 28,
          kit: 'neosoul',
          desc: 'Smokey neo-soul head-nod: deep MPC/live-kit hybrid kick (0, 3, 8, 10), crisp wood rimshot+snare & buttery ghost notes',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 7, 10, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [1, 7, 9, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_shuffle',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'dan_devilspie',
          title: "Devil's Pie",
          bpm: 91,
          swing: 32,
          kit: 'neosoul',
          desc: 'DJ Premier × Questlove unquantized boom-bap drag: heavy double-thump kicks (0, 2, 7, 10, 11) and laid-back snare crack',
          kicks: [0, 2, 7, 10, 11],
          kicksBar2: [0, 2, 7, 10, 11, 14],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'dan_playaplaya',
          title: 'Playa Playa',
          bpm: 80,
          swing: 36,
          kit: 'neosoul',
          desc: 'Classic Voodoo "drunk" Dilla-feel pocket: snare laid behind the beat, displaced sub-kicks (0, 3, 9, 11) & ghost chatter',
          kicks: [0, 3, 9, 11],
          kicksBar2: [0, 3, 7, 9, 11, 15],
          snares: [4, 12],
          rims: [4, 6, 12],
          claps: [],
          ghostSnares: [7, 13, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_shuffle',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'dan_sugah',
          title: 'Sugah Daddy',
          bpm: 107,
          swing: 24,
          kit: 'neosoul',
          desc: 'Black Messiah gospel-funk strut: syncopated linear kicks (0, 2, 6, 10, 14), handclap+snare snap & wood-rim clicks',
          kicks: [0, 2, 6, 10, 14],
          kicksBar2: [0, 3, 6, 10, 11, 14],
          snares: [4, 12],
          rims: [3, 7, 11, 15],
          claps: [4, 12],
          ghostSnares: [1, 9],
          openHats: [6, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'questlove_pocket'
        }
      ]
    },
    {
      artistId: 'badu',
      artistName: '🔮 Erykah Badu',
      drummer: 'J Dilla & Questlove',
      defaultKit: 'neosoul',
      songs: [
        {
          id: 'badu_onandon',
          title: 'On & On',
          bpm: 82,
          swing: 26,
          kit: 'neosoul',
          desc: 'Smooth Baduizm debut pocket: warm sub-kick on 1, 1-a, 3, 3-&, crisp rim+snare backbeat & open-hat sigh on 4-&',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 7, 8, 10, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_shuffle',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'badu_didntcha',
          title: "Didn't Cha Know",
          bpm: 83,
          swing: 34,
          kit: 'neosoul',
          desc: 'J Dilla’s Mama’s Gun masterpiece: unquantized MPC-3000 kick bounce (0, 3, 6, 10), wood rimshot & whispered 16th shaker/hats',
          kicks: [0, 3, 6, 10],
          kicksBar2: [0, 3, 6, 10, 13, 15],
          snares: [12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [1, 7, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_shuffle',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'badu_baglady',
          title: 'Bag Lady',
          bpm: 76,
          swing: 28,
          kit: 'neosoul',
          desc: 'West Coast soul-hop bounce: deep 808/sub-kick on 0, 2, 7, 10, 15, crisp rim+snare crack & open-hat barks on 2-& & 4-&',
          kicks: [0, 2, 7, 10, 15],
          kicksBar2: [0, 2, 7, 10, 13, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [9, 15],
          openHats: [6, 14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'badu_loveofmylife',
          title: 'Love of My Life (Ode to Hip Hop)',
          bpm: 96,
          swing: 24,
          kit: 'neosoul',
          desc: 'Punchy funk-hop bounce: syncopated kick (0, 3, 6, 10, 11), layered snare+clap backbeat & open-hat lifts',
          kicks: [0, 3, 6, 10, 11],
          kicksBar2: [0, 3, 6, 10, 11, 14],
          snares: [4, 12],
          rims: [4, 12],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'badu_windowseat',
          title: 'Window Seat',
          bpm: 81,
          swing: 28,
          kit: 'neosoul',
          desc: 'Warm live-room Questlove pocket: laid-back cross-stick rim+snare, rolling pickup kicks (7, 15) & breathing 8th hats',
          kicks: [0, 7, 8, 10, 15],
          kicksBar2: [0, 6, 8, 10, 14, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [3, 9, 13],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        }
      ]
    },
    {
      artistId: 'mosdef',
      artistName: '🌙 Mos Def',
      drummer: 'DJ Premier / Ayatollah / Madlib',
      defaultKit: 'mpc3000',
      songs: [
        {
          id: 'mos_mathematics',
          title: 'Mathematics',
          bpm: 95,
          swing: 28,
          kit: 'mpc3000',
          desc: 'DJ Premier’s signature SP-1200/MPC-60 chop: kick on 0, 3, 8, 10, 11, crisp boom-bap snare & steady 8th hats',
          kicks: [0, 3, 8, 10, 11],
          kicksBar2: [0, 2, 7, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'mos_fatbooty',
          title: 'Ms. Fat Booty',
          bpm: 93,
          swing: 26,
          kit: 'mpc3000',
          desc: 'Ayatollah’s Aretha soul-sample pocket: double kick pickups (0, 2, 7, 10), rim+snare snap & open-hat bark on 2-& & 4-&',
          kicks: [0, 2, 7, 10],
          kicksBar2: [0, 3, 8, 10, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [9, 15],
          openHats: [6, 14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'mos_hiphop',
          title: 'Hip Hop',
          bpm: 92,
          swing: 26,
          kit: 'mpc3000',
          desc: 'Diamond D heavy crate-digger stomp: booming kick on 0, 2, 8, 11, 14, layered snare+clap & dusty ghost pickups',
          kicks: [0, 2, 8, 11, 14],
          kicksBar2: [0, 2, 7, 8, 11, 14],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'mos_umisays',
          title: 'Umi Says',
          bpm: 82,
          swing: 22,
          kit: 'mpc3000',
          desc: 'Warm meditative jazz-soul pulse: cross-stick rimshot backbeat on 2 & 4, deep sub-kick (0, 7, 8, 14) & ride shimmer',
          kicks: [0, 7, 8, 14],
          kicksBar2: [0, 3, 7, 10, 14],
          snares: [12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [3, 11, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'mos_auditorium',
          title: 'Auditorium',
          bpm: 111,
          swing: 20,
          kit: 'mpc3000',
          desc: 'Madlib’s Ecstatic orchestral breakbeat: rolling funk kicks (0, 3, 6, 10, 14), crisp snare & busy ghost chatter',
          kicks: [0, 3, 6, 10, 14],
          kicksBar2: [0, 2, 6, 10, 11, 14],
          snares: [4, 12],
          rims: [6, 14],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [2, 10],
          tomsBar2: [13, 14],
          hatMode: '16th_funk',
          fillStyle: 'questlove_pocket'
        }
      ]
    },
    {
      artistId: 'kanye',
      artistName: '🐻 Kanye West',
      drummer: 'MPC-2000XL Soul Chop & 808',
      defaultKit: 'kanye',
      songs: [
        {
          id: 'ye_jesuswalks',
          title: 'Jesus Walks',
          bpm: 87,
          swing: 18,
          kit: 'kanye',
          desc: 'Military choir stomp: heavy kick on 1, 1-&, 3, 3-&, snare+clap backbeat, and marching ghost-snare pickups (steps 6-7 & 14-15)',
          kicks: [0, 2, 8, 10],
          kicksBar2: [0, 2, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 10],
          claps: [4, 12],
          ghostSnares: [6, 7, 14, 15],
          openHats: [],
          tomsBar2: [2, 10],
          hatMode: '8th_heavy',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'ye_golddigger',
          title: 'Gold Digger',
          bpm: 93,
          swing: 20,
          kit: 'kanye',
          desc: 'Ray Charles soul-chop bounce: punchy MPC kick (0, 3, 8, 10, 14), heavy handclap+snare & upbeat tambourine/rim pulse',
          kicks: [0, 3, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'ye_flashing',
          title: 'Flashing Lights',
          bpm: 90,
          swing: 16,
          kit: 'kanye',
          desc: 'Graduation synth-orchestral stadium bounce: kick on 1, 1-a, 3, 3-a (0, 3, 8, 11) and huge layered clap+snare backbeat',
          kicks: [0, 3, 8, 11],
          kicksBar2: [0, 3, 7, 8, 11, 14],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [7],
          openHats: [14],
          tomsBar2: [14, 15],
          hatMode: '8th_heavy',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'ye_runaway',
          title: 'Runaway',
          bpm: 85,
          swing: 14,
          kit: 'kanye',
          desc: 'Chopped Pete Rock MPC breakbeat: booming sub-kick on 0, 7, 8, 10, crunchy snare+rim crack & open-hat sigh on 4-&',
          kicks: [0, 7, 8, 10],
          kicksBar2: [0, 3, 7, 8, 10, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [12],
          ghostSnares: [9, 15],
          openHats: [14],
          tomsBar2: [13, 14],
          hatMode: '16th_funk',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'ye_blackskinhead',
          title: 'Black Skinhead',
          bpm: 130,
          swing: 6,
          kit: 'trap808',
          desc: 'Industrial tribal floor-tom stampede: pounding floor toms (0, 2, 3, 6, 8, 10, 11, 14), heavy kick & razor claps',
          kicks: [0, 4, 8, 10, 12, 14],
          kicksBar2: [0, 3, 4, 8, 10, 12, 14, 15],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [],
          openHats: [6, 14],
          tomsBar2: [0, 2, 3, 6, 8, 10, 11, 14],
          hatMode: '8th_drive',
          fillStyle: 'bonham'
        }
      ]
    },
    {
      artistId: 'beatles',
      artistName: '🪲 The Beatles',
      drummer: 'Ringo Starr',
      defaultKit: 'abbey60s',
      songs: [
        {
          id: 'bea_cometogether',
          title: 'Come Together',
          bpm: 82,
          swing: 14,
          kit: 'abbey60s',
          desc: 'Swampy Abbey Road tea-towel muffled drums: kick on 1 & 3, 16th hat burst on beat 1 & Ringo’s descending tom run on beats 3–4',
          kicks: [0, 2, 8, 10],
          kicksBar2: [0, 2, 8, 10, 15],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7],
          openHats: [2],
          tomsBar2: [8, 9, 10, 11, 12, 14],
          hatMode: '16th_funk',
          fillStyle: 'garage_rock'
        },
        {
          id: 'bea_tomorrow',
          title: 'Tomorrow Never Knows',
          bpm: 126,
          swing: 12,
          kit: 'abbey60s',
          desc: 'Hypnotic Revolver psyche-breakbeat: boom-boom kick (0, 2, 8), snare on beat 2, and displaced tom+snare skip on 3-&-a-4',
          kicks: [0, 2, 8],
          kicksBar2: [0, 2, 8, 14],
          snares: [4, 11, 12],
          rims: [2, 6, 10, 14],
          claps: [],
          ghostSnares: [7],
          openHats: [6, 14],
          tomsBar2: [10, 11],
          hatMode: '8th_drive',
          fillStyle: 'garage_rock'
        },
        {
          id: 'bea_tickettoride',
          title: 'Ticket to Ride',
          bpm: 123,
          swing: 10,
          kit: 'abbey60s',
          desc: 'Syncopated stuttering rock beat: kick on 1, 2-&, 3 (0, 6, 8), snare on 2, 3-&, 4 (4, 10, 12) & tom skips on 2-& & 4-&',
          kicks: [0, 6, 8],
          kicksBar2: [0, 6, 8, 14],
          snares: [4, 10, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [],
          openHats: [14],
          tomsBar2: [6, 14],
          hatMode: '8th_heavy',
          fillStyle: 'garage_rock'
        },
        {
          id: 'bea_rain',
          title: 'Rain',
          bpm: 88,
          swing: 12,
          kit: 'abbey60s',
          desc: 'Ringo’s favorite drum track: varispeeded heavy tape drums, kick on 0, 3, 8, 10, busy snare drags & melodic tom fills',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [0, 8],
          tomsBar2: [11, 13, 14],
          hatMode: '8th_heavy',
          fillStyle: 'garage_rock'
        },
        {
          id: 'bea_sgtpepper',
          title: "Sgt. Pepper's (Reprise)",
          bpm: 119,
          swing: 12,
          kit: 'abbey60s',
          desc: 'Famous 4-bar solo drum break: punchy close-mic’d kick (0, 2, 7, 8, 10, 14), crisp snare backbeat & driving open hats',
          kicks: [0, 2, 7, 8, 10, 14],
          kicksBar2: [0, 2, 6, 7, 8, 10, 14, 15],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [],
          ghostSnares: [9, 15],
          openHats: [2, 10],
          tomsBar2: [13, 14],
          hatMode: '8th_drive',
          fillStyle: 'garage_rock'
        }
      ]
    },
    {
      artistId: 'daftpunk',
      artistName: '🤖 Daft Punk',
      drummer: 'French Touch 909 & Omar Hakim',
      defaultKit: 'daftpunk',
      songs: [
        {
          id: 'dp_aroundtheworld',
          title: 'Around the World',
          bpm: 121,
          swing: 14,
          kit: 'daftpunk',
          desc: 'Classic French Touch TR-909 house groove: 4-on-the-floor kick, punchy 909 clap+snare & offbeat open hats on every "&"',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 4, 8, 12, 15],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [],
          openHats: [2, 6, 10, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'french_house'
        },
        {
          id: 'dp_onemoretime',
          title: 'One More Time',
          bpm: 123,
          swing: 12,
          kit: 'daftpunk',
          desc: 'Filtered disco-house euphoria: sidechain-pumping 909 kick (0, 4, 8, 12), compressed disco clap & 16th hat shimmer',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 4, 8, 11, 12, 14],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [],
          hatMode: '16th_drive',
          fillStyle: 'french_house'
        },
        {
          id: 'dp_getlucky',
          title: 'Get Lucky',
          bpm: 116,
          swing: 14,
          kit: 'daftpunk',
          desc: 'Omar Hakim live disco-funk strut: four-on-the-floor kick with Bar-2 syncopation (10, 15), crisp snare+clap & 16th ghost hats',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 4, 8, 10, 12, 15],
          snares: [4, 12],
          rims: [3, 11],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'french_house'
        },
        {
          id: 'dp_dafunk',
          title: 'Da Funk',
          bpm: 111,
          swing: 22,
          kit: 'daftpunk',
          desc: 'Heavy head-nodding electro-boom-bap hybrid: slammed drum-machine kick (0, 3, 8, 10, 14) and compressed snare+clap crack',
          kicks: [0, 3, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [14, 15],
          hatMode: '8th_heavy',
          fillStyle: 'french_house'
        },
        {
          id: 'dp_something',
          title: 'Something About Us',
          bpm: 100,
          swing: 18,
          kit: 'daftpunk',
          desc: 'Late-night synth-soul lounge pocket: soft analog kick on 0, 7, 8, 10, lazy rimshot+clap backbeat & open-hat sigh on 4-&',
          kicks: [0, 7, 8, 10],
          kicksBar2: [0, 3, 7, 8, 10, 14],
          snares: [12],
          rims: [4, 12],
          claps: [4, 12],
          ghostSnares: [15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'french_house'
        }
      ]
    },
    {
      artistId: 'strokes',
      artistName: '🎸 The Strokes',
      drummer: 'Fab Moretti',
      defaultKit: 'strokes',
      songs: [
        {
          id: 'str_lastnite',
          title: 'Last Nite',
          bpm: 104,
          swing: 4,
          kit: 'strokes',
          desc: 'Tight NYC garage-rock stomp: kick on 1, 1-a, 2-&, 3, 3-& (0, 3, 6, 8, 10), punchy snare+rim & laser-straight 8th hats',
          kicks: [0, 3, 6, 8, 10],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [],
          openHats: [14],
          tomsBar2: [4, 12],
          hatMode: '8th_drive',
          fillStyle: 'garage_rock'
        },
        {
          id: 'str_hardtoexplain',
          title: 'Hard to Explain',
          bpm: 165,
          swing: 0,
          kit: 'strokes',
          desc: 'Drum-machine-tight motorik 8th-note pulse: driving kick on 1, 1-&, 3, 3-&, double-snare punch in Bar 2 & crash ride',
          kicks: [0, 2, 8, 10],
          kicksBar2: [0, 2, 8, 10, 14],
          snares: [4, 12],
          snaresBar2: [4, 6, 12],
          rims: [],
          claps: [],
          ghostSnares: [],
          openHats: [0, 8],
          tomsBar2: [],
          hatMode: '8th_drive',
          fillStyle: 'garage_rock'
        },
        {
          id: 'str_someday',
          title: 'Someday',
          bpm: 116,
          swing: 6,
          kit: 'strokes',
          desc: 'Bouncy garage-pop groove: syncopated kick (0, 6, 8, 10, 14), crisp snare backbeat with Bar-2 pickup (step 7) & open hat on 4-&',
          kicks: [0, 6, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7],
          openHats: [14],
          tomsBar2: [14, 15],
          hatMode: '8th_drive',
          fillStyle: 'garage_rock'
        },
        {
          id: 'str_reptilia',
          title: 'Reptilia',
          bpm: 158,
          swing: 0,
          kit: 'strokes',
          desc: 'High-octane NYC rock sprint: relentless 8th hi-hats, pounding kicks (0, 2, 6, 8, 10, 14) & Bar-2 double-snare punch',
          kicks: [0, 2, 6, 8, 10, 14],
          kicksBar2: [0, 2, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 12, 14],
          rims: [],
          claps: [],
          ghostSnares: [],
          openHats: [2, 10],
          tomsBar2: [12, 14],
          hatMode: '8th_drive',
          fillStyle: 'garage_rock'
        },
        {
          id: 'str_1251',
          title: '12:51',
          bpm: 145,
          swing: 0,
          kit: 'strokes',
          desc: 'Minimalist clapping garage stomp: steady 4-on-the-floor kick, handclap+snare on 2 & 4, and constant 8th floor-tom pulse',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 4, 8, 10, 12],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [],
          openHats: [],
          tomsBar2: [0, 2, 4, 6, 8, 10, 12, 14],
          hatMode: '8th_heavy',
          fillStyle: 'garage_rock'
        }
      ]
    },
    {
      artistId: 'outkast',
      artistName: '🛸 OutKast',
      drummer: 'Organized Noize / Earthtone III',
      defaultKit: 'outkast',
      songs: [
        {
          id: 'out_msjackson',
          title: 'Ms. Jackson',
          bpm: 95,
          swing: 18,
          kit: 'outkast',
          desc: 'Stankonia reversed-loop bounce: syncopated kick (0, 3, 6, 11, 14), crisp snare+rim crack, woodblock clicks & ghost pickups',
          kicks: [0, 3, 6, 11, 14],
          kicksBar2: [0, 3, 6, 8, 11, 14],
          snares: [4, 12],
          rims: [2, 4, 9, 12],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'out_sofresh',
          title: 'So Fresh, So Clean',
          bpm: 83,
          swing: 20,
          kit: 'outkast',
          desc: 'Organized Noize trunk-rattling 808 bounce: sub-kick on 0, 2, 7, 10, 13, snapping snare+clap & 16th hat groove',
          kicks: [0, 2, 7, 10, 13],
          kicksBar2: [0, 2, 7, 10, 13, 15],
          snares: [4, 12],
          rims: [],
          claps: [4, 12],
          ghostSnares: [9, 15],
          openHats: [6, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'out_rosaparks',
          title: 'Rosa Parks',
          bpm: 103,
          swing: 16,
          kit: 'outkast',
          desc: 'Aquemini Dirty South acoustic-stomp: bouncy kick (0, 3, 6, 8, 10, 14), heavy handclap+snare & tambourine/hat lift',
          kicks: [0, 3, 6, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 13, 15],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [4, 12],
          ghostSnares: [7],
          openHats: [2, 10, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'hiphop_mpc'
        },
        {
          id: 'out_atliens',
          title: 'ATLiens',
          bpm: 98,
          swing: 22,
          kit: 'outkast',
          desc: 'Hypnotic Dungeon Family boom-bap funk: deep kick on 0, 3, 8, 10, crisp rim+snare backbeat & open-hat sigh on 4-&',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 7, 8, 10, 14],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '8th_heavy',
          fillStyle: 'questlove_pocket'
        },
        {
          id: 'out_heyya',
          title: 'Hey Ya!',
          bpm: 160,
          swing: 6,
          kit: 'outkast',
          desc: 'André 3000’s high-speed acoustic + drum-machine shake-it pulse: driving kick (0, 3, 6, 8, 10, 14), claps on 2 & 4 & 16th shaker',
          kicks: [0, 3, 6, 8, 10, 14],
          kicksBar2: [0, 2, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [12, 14],
          hatMode: '16th_drive',
          fillStyle: 'hiphop_mpc'
        }
      ]
    },
    {
      artistId: 'beegees',
      artistName: '🕺 The Bee Gees',
      drummer: 'Dennis Bryon ("Bernard Lupe" Tape Loop)',
      defaultKit: 'beegees',
      songs: [
        {
          id: 'bg_stayinalive',
          title: "Stayin' Alive",
          bpm: 104,
          swing: 12,
          kit: 'beegees',
          desc: 'Famous "Bernard Lupe" 2-bar tape loop: damped 4-on-the-floor kick with Bar-2 4-a pickup (step 15), tight snare & 4-& open-hat sigh',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 4, 8, 12, 15],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'french_house'
        },
        {
          id: 'bg_nightfever',
          title: 'Night Fever',
          bpm: 109,
          swing: 10,
          kit: 'beegees',
          desc: 'Silky 70s disco glide: 4-on-the-floor kick with 3-& bass lock (step 10), crisp dry snare & upbeat open hi-hats on every "&"',
          kicks: [0, 4, 8, 10, 12],
          kicksBar2: [0, 4, 8, 10, 12, 14],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [13, 14],
          hatMode: '16th_funk',
          fillStyle: 'french_house'
        },
        {
          id: 'bg_youshouldbedancing',
          title: 'You Should Be Dancing',
          bpm: 123,
          swing: 10,
          kit: 'beegees',
          desc: 'Explosive Latin-disco percussion groove: driving kick, syncopated bongo/timbale rim clicks (2, 3, 6, 10, 11, 14) & open hats',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 3, 4, 8, 11, 12, 14],
          snares: [4, 12],
          rims: [2, 3, 6, 10, 11, 14],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [11, 13, 14],
          hatMode: '16th_drive',
          fillStyle: 'garage_rock'
        },
        {
          id: 'bg_jivetalkin',
          title: "Jive Talkin'",
          bpm: 106,
          swing: 14,
          kit: 'beegees',
          desc: 'Miami bridge-rhythm R&B-funk: syncopated kick (0, 3, 6, 8, 10, 14), scratchy 16th hi-hat chucking & open-hat barks on 2-& & 4-&',
          kicks: [0, 3, 6, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 11, 14],
          snares: [4, 12],
          rims: [3, 11],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [6, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'clyde_funk'
        },
        {
          id: 'bg_morethanawoman',
          title: 'More Than a Woman',
          bpm: 106,
          swing: 12,
          kit: 'beegees',
          desc: 'Breezy disco-soul pocket: 4-on-the-floor kick with 16th pickups on 2-a & 4-a (7, 15), warm snare+clap & shimmering open hats',
          kicks: [0, 4, 7, 8, 12, 15],
          kicksBar2: [0, 4, 7, 8, 10, 12, 15],
          snares: [4, 12],
          rims: [4, 12],
          claps: [4, 12],
          ghostSnares: [9, 15],
          openHats: [2, 10, 14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'french_house'
        }
      ]
    },
    {
      artistId: 'rush',
      artistName: '🦉 Rush',
      drummer: 'Neil Peart ("The Professor")',
      defaultKit: 'rush',
      songs: [
        {
          id: 'rush_tomsawyer',
          title: 'Tom Sawyer',
          bpm: 88,
          swing: 0,
          kit: 'rush',
          desc: 'Neil Peart’s powerhouse 16th-hat groove: kick on 1, 2-&, 3, 3-& (0, 6, 8, 10), cracking snare, open hats on 1-& & 4-&, and concert-tom fill',
          kicks: [0, 6, 8, 10],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [2, 14],
          tomsBar2: [13, 14, 15],
          hatMode: '16th_drive',
          fillStyle: 'peart'
        },
        {
          id: 'rush_yyz',
          title: 'YYZ',
          bpm: 126,
          swing: 0,
          kit: 'rush',
          desc: 'Syncopated jazz-fusion prog main groove: kick on 0, 3, 6, 9, 10, 14, Paragon ride-bell pattern & blazing Bar-4 concert-tom cascade',
          kicks: [0, 3, 6, 9, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 7, 12],
          rims: [0, 3, 6, 9, 12, 14],
          claps: [],
          ghostSnares: [1, 15],
          openHats: [2, 10],
          tomsBar2: [12, 13, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'peart'
        },
        {
          id: 'rush_subdivisions',
          title: 'Subdivisions',
          bpm: 123,
          swing: 0,
          kit: 'rush',
          desc: 'Precision prog-synth pocket: syncopated kick (0, 2, 7, 10, 14), Paragon ride-bell counter-rhythm & melodic Bar-2/Bar-4 tom runs',
          kicks: [0, 2, 7, 10, 14],
          kicksBar2: [0, 2, 6, 7, 10, 14],
          snares: [4, 12],
          rims: [0, 3, 6, 10, 13],
          claps: [],
          ghostSnares: [9, 15],
          openHats: [2, 14],
          tomsBar2: [11, 13, 14],
          hatMode: '16th_funk',
          fillStyle: 'peart'
        },
        {
          id: 'rush_spiritofradio',
          title: 'The Spirit of Radio',
          bpm: 136,
          swing: 0,
          kit: 'rush',
          desc: 'High-energy prog-rock & reggae-inflected stadium drive: punchy double kicks, timbale/rim accents & explosive Peart tom fills',
          kicks: [0, 2, 6, 8, 10, 14],
          kicksBar2: [0, 2, 6, 8, 10, 11, 14],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [6, 14],
          tomsBar2: [12, 13, 14],
          hatMode: '8th_drive',
          fillStyle: 'peart'
        },
        {
          id: 'rush_limelight',
          title: 'Limelight',
          bpm: 131,
          swing: 0,
          kit: 'rush',
          desc: 'Le Studio rock anthem: syncopated kick pickup on 2-a (0, 2, 7, 8, 10), crisp Slingerland snare crack & open-hat barks on 1-& & 3-&',
          kicks: [0, 2, 7, 8, 10],
          kicksBar2: [0, 2, 6, 7, 8, 10, 14],
          snares: [4, 12],
          rims: [3, 11],
          claps: [],
          ghostSnares: [9, 15],
          openHats: [2, 10],
          tomsBar2: [13, 14, 15],
          hatMode: '8th_drive',
          fillStyle: 'peart'
        }
      ]
    },
    {
      artistId: 'radiohead',
      artistName: '📻 Radiohead',
      drummer: 'Philip Selway & CR-78 / Modular',
      defaultKit: 'radiohead',
      songs: [
        {
          id: 'rad_weirdfishes',
          title: 'Weird Fishes / Arpeggi',
          bpm: 153,
          swing: 0,
          kit: 'radiohead',
          desc: 'Hypnotic In Rainbows krautrock motorik pulse: relentless 16th hi-hats, kick on 0, 3, 8, 10, crisp rim+snare & ghost chatter',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [4, 12],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_drive',
          fillStyle: 'selway'
        },
        {
          id: 'rad_15step',
          title: '15 Step',
          bpm: 94,
          swing: 12,
          kit: 'radiohead',
          desc: 'Glitchy drum-machine + Phil Selway live kit: syncopated kicks (0, 3, 7, 10, 13), wood rimclicks, handclaps & displaced Bar-2 snare',
          kicks: [0, 3, 7, 10, 13],
          kicksBar2: [0, 3, 6, 10, 13, 15],
          snares: [4, 12],
          snaresBar2: [4, 11, 12],
          rims: [2, 4, 9, 12],
          claps: [4, 12],
          ghostSnares: [1, 6, 15],
          openHats: [14],
          tomsBar2: [],
          hatMode: '16th_funk',
          fillStyle: 'selway'
        },
        {
          id: 'rad_nationalanthem',
          title: 'The National Anthem',
          bpm: 92,
          swing: 8,
          kit: 'radiohead',
          desc: 'Fuzz-bass-locked Kid A breakbeat stomp: heavy kick on 1, 1-&, 3, 3-& (0, 2, 8, 10), dry cracking snare & sloshy open hats',
          kicks: [0, 2, 8, 10],
          kicksBar2: [0, 2, 7, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [6, 14],
          tomsBar2: [14, 15],
          hatMode: '8th_heavy',
          fillStyle: 'selway'
        },
        {
          id: 'rad_paranoidandroid',
          title: 'Paranoid Android',
          bpm: 84,
          swing: 8,
          kit: 'radiohead',
          desc: 'OK Computer acoustic-prog groove: syncopated kick (0, 3, 6, 10, 11), cabasa/rim pulse, dry snare & Bar-2 tom accents',
          kicks: [0, 3, 6, 10, 11],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 4, 6, 10, 12, 14],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [14],
          tomsBar2: [13, 14],
          hatMode: '16th_funk',
          fillStyle: 'selway'
        },
        {
          id: 'rad_idioteque',
          title: 'Idioteque',
          bpm: 138,
          swing: 4,
          kit: 'radiohead',
          desc: 'Modular-synth Kid A electronic breakbeat: syncopated pulse (0, 3, 6, 10, 12), crunchy snare+rim & metallic hi-hat bursts',
          kicks: [0, 3, 6, 10, 12],
          kicksBar2: [0, 3, 6, 8, 11, 14],
          snares: [4, 12],
          rims: [4, 7, 12, 15],
          claps: [4, 12],
          ghostSnares: [9, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [],
          hatMode: '16th_drive',
          fillStyle: 'selway'
        }
      ]
    },
    {
      artistId: 'philcollins',
      artistName: '🥁 Phil Collins',
      drummer: 'Phil Collins (Genesis / Townhouse Gated Kit)',
      defaultKit: 'philcollins',
      songs: [
        {
          id: 'pc_intheair',
          title: 'In the Air Tonight',
          bpm: 95,
          swing: 0,
          kit: 'philcollins',
          desc: 'Hypnotic Roland CR-78 pulse in Sections 1–3, erupting at Bar 12 into the legendary 10-note concert-tom fill & massive gated Climax!',
          kicks: [0, 10],
          kicksBar2: [0, 6, 10, 14],
          snares: [4, 12],
          rims: [4, 6, 12, 14],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [2, 10],
          tomsBar2: [12, 13, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'phil_collins'
        },
        {
          id: 'pc_sussudio',
          title: 'Sussudio',
          bpm: 121,
          swing: 8,
          kit: 'philcollins',
          desc: 'Oberheim DMX + live Townhouse gated-reverb funk-pop pocket: syncopated kick (0, 3, 6, 10, 14), snapping snare+clap & concert-tom fills',
          kicks: [0, 3, 6, 10, 14],
          kicksBar2: [0, 3, 6, 8, 11, 14],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [4, 12],
          ghostSnares: [7, 9, 15],
          openHats: [2, 14],
          tomsBar2: [13, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'phil_collins'
        },
        {
          id: 'pc_easylover',
          title: 'Easy Lover',
          bpm: 131,
          swing: 0,
          kit: 'philcollins',
          desc: 'High-energy rock-fusion duet groove: driving kick (0, 2, 6, 8, 10, 14), cracking gated snare pickups & blazing concert-tom cascades',
          kicks: [0, 2, 6, 8, 10, 14],
          kicksBar2: [0, 2, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 7, 12, 15],
          rims: [4, 12],
          claps: [],
          ghostSnares: [1, 9, 15],
          openHats: [2, 10, 14],
          tomsBar2: [12, 13, 14, 15],
          hatMode: '16th_drive',
          fillStyle: 'phil_collins'
        },
        {
          id: 'pc_mama',
          title: 'Mama (Genesis)',
          bpm: 96,
          swing: 4,
          kit: 'philcollins',
          desc: 'Industrial LinnDrum LM-1 stomp in Intro/Verse (0, 4, 6, 10, 11, 14) exploding into thunderous gated Townhouse drums in Chorus & Climax',
          kicks: [0, 4, 6, 10, 11, 14],
          kicksBar2: [0, 3, 4, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 4, 8, 12, 14],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [6, 14],
          tomsBar2: [12, 14, 15],
          hatMode: '16th_drive',
          fillStyle: 'phil_collins'
        },
        {
          id: 'pc_invisibletouch',
          title: 'Invisible Touch',
          bpm: 130,
          swing: 4,
          kit: 'philcollins',
          desc: '80s stadium synth-pop pocket: tight kick (0, 3, 8, 10, 14), gated snare+clap backbeat & Simmons/concert-tom melodic hooks',
          kicks: [0, 3, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 10, 14],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 14],
          tomsBar2: [11, 13, 14],
          hatMode: '16th_funk',
          fillStyle: 'phil_collins'
        }
      ]
    },
    {
      artistId: 'hotchip',
      artistName: '🎹 Hot Chip',
      drummer: 'Sarah Jones, Felix Martin & Joe Goddard',
      defaultKit: 'hotchip',
      songs: [
        {
          id: 'hc_overandover',
          title: 'Over and Over',
          bpm: 122,
          swing: 10,
          kit: 'hotchip',
          desc: 'Relentless indie-dance floor-filler: 4-on-the-floor kick + 16th pickups (0, 4, 7, 8, 12, 15), persistent cowbell/rim ostinato & offbeat open hats',
          kicks: [0, 4, 7, 8, 12, 15],
          kicksBar2: [0, 4, 6, 8, 11, 12, 15],
          snares: [4, 12],
          rims: [0, 2, 4, 6, 8, 10, 12, 14],
          claps: [4, 12],
          ghostSnares: [9, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [13, 14],
          hatMode: '16th_funk',
          fillStyle: 'hot_chip'
        },
        {
          id: 'hc_readyforthefloor',
          title: 'Ready for the Floor',
          bpm: 125,
          swing: 8,
          kit: 'hotchip',
          desc: 'Euphoric synth-pop house groove: bouncing kick (0, 4, 6, 8, 12, 14), crisp clap+snare backbeat, syncopated rimclicks & sparkling 16th hats',
          kicks: [0, 4, 6, 8, 12, 14],
          kicksBar2: [0, 3, 4, 8, 10, 12, 15],
          snares: [4, 12],
          rims: [3, 6, 11, 15],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 10, 14],
          tomsBar2: [14, 15],
          hatMode: '16th_funk',
          fillStyle: 'hot_chip'
        },
        {
          id: 'hc_boyfromschool',
          title: 'Boy From School',
          bpm: 117,
          swing: 12,
          kit: 'hotchip',
          desc: 'Hypnotic mid-tempo filter-disco pulse: syncopated kick (0, 3, 8, 10, 14), woody rim counter-rhythm (2, 6, 9, 14) & sloshy open-hat barks',
          kicks: [0, 3, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 11, 14],
          snares: [4, 12],
          rims: [2, 6, 9, 14],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 10, 14],
          tomsBar2: [12, 14],
          hatMode: '16th_funk',
          fillStyle: 'hot_chip'
        },
        {
          id: 'hc_flutes',
          title: 'Flutes',
          bpm: 123,
          swing: 6,
          kit: 'hotchip',
          desc: 'Propulsive motorik deep-house roller: 4-on-the-floor kick (0, 4, 8, 12) with sub-pickups, arpeggiated rim/tom interplay & offbeat open hats',
          kicks: [0, 4, 8, 12],
          kicksBar2: [0, 4, 8, 11, 12, 15],
          snares: [4, 12],
          rims: [2, 5, 10, 13],
          claps: [4, 12],
          ghostSnares: [7, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [6, 11, 14],
          hatMode: '16th_drive',
          fillStyle: 'hot_chip'
        },
        {
          id: 'hc_onelifes',
          title: 'One Life Stand',
          bpm: 121,
          swing: 8,
          kit: 'hotchip',
          desc: 'Steel-pan & 808 electro-soul pocket: syncopated kick (0, 4, 7, 10, 12), layered clap+snare backbeat & tropical rimclick polyrhythm',
          kicks: [0, 4, 7, 10, 12],
          kicksBar2: [0, 3, 6, 8, 10, 12, 14],
          snares: [4, 12],
          rims: [2, 5, 10, 13, 15],
          claps: [4, 12],
          ghostSnares: [9, 15],
          openHats: [2, 10],
          tomsBar2: [13, 15],
          hatMode: '16th_funk',
          fillStyle: 'hot_chip'
        }
      ]
    },
    {
      artistId: 'blink182',
      artistName: '🛹 blink-182',
      drummer: 'Travis Barker',
      defaultKit: 'blink182',
      songs: [
        {
          id: 'blink_allthesmall',
          title: 'All the Small Things',
          bpm: 149,
          swing: 0,
          kit: 'blink182',
          desc: 'Stadium pop-punk anthem: punchy kick on 1, 3, 3-& (0, 8, 10) with Bar-2 pickup, sloshy open hats, cracking OCDP snare & rudimental fills',
          kicks: [0, 8, 10],
          kicksBar2: [0, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [13, 14, 15],
          hatMode: '8th_heavy',
          fillStyle: 'travis_barker'
        },
        {
          id: 'blink_whatsmyage',
          title: "What's My Age Again?",
          bpm: 158,
          swing: 0,
          kit: 'blink182',
          desc: 'Blazing melodic punk sprint: rapid double-kick punctuation (0, 2, 6, 8, 10, 14), high-tuned OCDP snare crack & marching-snare roll turnarounds',
          kicks: [0, 2, 6, 8, 10, 14],
          kicksBar2: [0, 2, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 7, 12, 15],
          rims: [4, 12],
          claps: [],
          ghostSnares: [1, 9, 15],
          openHats: [2, 14],
          tomsBar2: [12, 13, 14, 15],
          hatMode: '16th_drive',
          fillStyle: 'travis_barker'
        },
        {
          id: 'blink_feelingthis',
          title: 'Feeling This',
          bpm: 173,
          swing: 0,
          kit: 'blink182',
          desc: 'Flanged Intro/Verse cowbell & latin-tom hip-hop-punk breakbeat (0, 3, 6, 10) erupting into full-throttle crash-driven punk in the Chorus!',
          kicks: [0, 3, 6, 10],
          kicksBar2: [0, 2, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [0, 2, 6, 8, 10, 14],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [2, 10, 14],
          tomsBar2: [7, 13, 14, 15],
          hatMode: '16th_drive',
          fillStyle: 'travis_barker'
        },
        {
          id: 'blink_imissyou',
          title: 'I Miss You',
          bpm: 110,
          swing: 8,
          kit: 'blink182',
          desc: 'Hypnotic acoustic hip-hop loop: booming kick (0, 3, 8, 10, 11), woody rim+snare backbeat, 16th brush/shaker drive & marching-snare ghost rolls',
          kicks: [0, 3, 8, 10, 11],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [4, 7, 12, 15],
          claps: [],
          ghostSnares: [6, 7, 13, 15],
          openHats: [14],
          tomsBar2: [14, 15],
          hatMode: '16th_funk',
          fillStyle: 'travis_barker'
        },
        {
          id: 'blink_adamssong',
          title: "Adam's Song",
          bpm: 136,
          swing: 0,
          kit: 'blink182',
          desc: 'Travis Barker’s creative linear Verse groove: melodic tom + ride-bell + cross-stick pattern opening into massive Chorus crashes & snare rolls',
          kicks: [0, 3, 8, 10],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          rims: [2, 4, 10, 12],
          claps: [],
          ghostSnares: [7, 9, 15],
          openHats: [6, 14],
          tomsBar2: [2, 6, 10, 14],
          hatMode: '16th_funk',
          fillStyle: 'travis_barker'
        }
      ]
    }
  ];

  // ==========================================================================
  // 4. WebAudio Drum Synthesis Engine (Uses Active Kit Profile!)
  // ==========================================================================
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function getActiveKitProfile() {
    return DRUM_KITS.find((k) => k.id === state.kitId) || DRUM_KITS[0];
  }

  function triggerDrumVoice(ctx, pitch, velocity, when) {
    const kit = getActiveKitProfile();
    const gainScale = Math.max(0.12, Math.min(1.0, (velocity || 100) / 127));

    if (pitch === 35 || pitch === 36) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(kit.kickStart, when);
      osc.frequency.exponentialRampToValueAtTime(kit.kickEnd, when + 0.085);
      gain.gain.setValueAtTime(0.98 * gainScale, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + kit.kickDecay);
      osc.connect(gain).connect(ctx.destination);
      osc.start(when);
      osc.stop(when + kit.kickDecay + 0.02);

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(880, when);
      clickOsc.frequency.exponentialRampToValueAtTime(110, when + 0.022);
      clickGain.gain.setValueAtTime(kit.kickClick * gainScale, when);
      clickGain.gain.exponentialRampToValueAtTime(0.001, when + 0.026);
      clickOsc.connect(clickGain).connect(ctx.destination);
      clickOsc.start(when);
      clickOsc.stop(when + 0.03);
      return;
    }

    if (pitch === 37) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(480, when);
      osc2.frequency.setValueAtTime(1720, when);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1250, when);
      gain.gain.setValueAtTime(0.62 * kit.rimMix * gainScale, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.055);
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain).connect(ctx.destination);
      osc1.start(when);
      osc2.start(when);
      osc1.stop(when + 0.06);
      osc2.stop(when + 0.06);
      return;
    }

    if (pitch === 39) {
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1320, when);
      filter.Q.setValueAtTime(1.7, when);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.65 * gainScale, when);
      gain.gain.setValueAtTime(0.15 * gainScale, when + 0.009);
      gain.gain.setValueAtTime(0.62 * gainScale, when + 0.012);
      gain.gain.setValueAtTime(0.15 * gainScale, when + 0.02);
      gain.gain.setValueAtTime(0.75 * gainScale, when + 0.023);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start(when);
      return;
    }

    if (pitch === 38 || pitch === 40) {
      const dur = kit.snareDecay;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(kit.snareHp, when);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.64 * gainScale, when);
      nGain.gain.exponentialRampToValueAtTime(0.001, when + dur);
      noise.connect(filter).connect(nGain).connect(ctx.destination);
      noise.start(when);

      const osc = ctx.createOscillator();
      const oGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(kit.snareTone, when);
      osc.frequency.exponentialRampToValueAtTime(92, when + 0.085);
      oGain.gain.setValueAtTime(0.58 * gainScale, when);
      oGain.gain.exponentialRampToValueAtTime(0.001, when + 0.12);
      osc.connect(oGain).connect(ctx.destination);
      osc.start(when);
      osc.stop(when + 0.13);
      return;
    }

    if ([42, 44, 46, 49, 51, 52, 55, 57, 59].includes(pitch)) {
      const isCrash = [49, 51, 52, 55, 57, 59].includes(pitch);
      const isOpen = pitch === 46;
      const dur = isCrash ? 0.62 : isOpen ? kit.openHatDecay : kit.hatDecay;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(isCrash ? 4000 : kit.hatHp, when);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime((isCrash ? 0.42 : 0.36) * gainScale, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
      noise.connect(hp).connect(gain).connect(ctx.destination);
      noise.start(when);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(kit.tomBase, when);
    osc.frequency.exponentialRampToValueAtTime(48, when + 0.21);
    gain.gain.setValueAtTime(0.78 * gainScale, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.23);
    osc.connect(gain).connect(ctx.destination);
    osc.start(when);
    osc.stop(when + 0.24);
  }

  // ==========================================================================
  // 5. 16-Bar (256-Step) 4-Section Song Arrangement Generator
  //    Covers 4 Distinct Song Parts per Reference Track:
  //    - Sec 1 (Bars 1–4):  🟢 Intro / Verse (Stripped Groove & Signature Riff)
  //    - Sec 2 (Bars 5–8):  🔥 Chorus / Main Hook (Crash Lift, Claps, Open Hats)
  //    - Sec 3 (Bars 9–12): ⚡ Bridge / Solo Break (Ride Bell, Funk Break or Tom Stabs)
  //    - Sec 4 (Bars 13–16): 🚀 Climax / Outro & Showstopper Multi-Beat Fill
  // ==========================================================================
  const TOTAL_BARS = 16;
  const TOTAL_STEPS = 256; // 16 bars * 16 sixteenth-note steps

  const SONG_SECTIONS = [
    {
      index: 0,
      id: 'verse',
      badge: '🟢 SEC 1',
      name: '🟢 1. Intro / Verse',
      shortTitle: 'Intro / Verse (Bars 1–4)',
      roleDesc: 'Signature intro hook & tight verse pocket',
      startBar: 0,
      endBar: 3,
      startStep: 0,
      endStep: 63,
      color: '#10b981'
    },
    {
      index: 1,
      id: 'chorus',
      badge: '🔥 SEC 2',
      name: '🔥 2. Chorus / Hook',
      shortTitle: 'Chorus / Main Hook (Bars 5–8)',
      roleDesc: 'Downbeat crash, full backbeat, open hats & Bar-2 syncopation',
      startBar: 4,
      endBar: 7,
      startStep: 64,
      endStep: 127,
      color: '#f59e0b'
    },
    {
      index: 2,
      id: 'bridge',
      badge: '⚡ SEC 3',
      name: '⚡ 3. Bridge / Break',
      shortTitle: 'Bridge / Solo Break (Bars 9–12)',
      roleDesc: 'Solo breakbeat, Ride-bell shift, or floor-tom breakdown',
      startBar: 8,
      endBar: 11,
      startStep: 128,
      endStep: 191,
      color: '#38bdf8'
    },
    {
      index: 3,
      id: 'climax',
      badge: '🚀 SEC 4',
      name: '🚀 4. Climax / Big Fill',
      shortTitle: 'Climax / Signature Fill (Bars 13–16)',
      roleDesc: 'Full band ride/crash drive + signature Bar-16 showstopper fill',
      startBar: 12,
      endBar: 15,
      startStep: 192,
      endStep: 255,
      color: '#e73ff6'
    }
  ];

  function createEmptyGrid256() {
    return DRUM_VOICES.map(() =>
      Array.from({ length: TOTAL_STEPS }, () => ({ state: 0, sub: 1 }))
    );
  }
  const createEmptyGrid64 = createEmptyGrid256;

  function cloneGrid256(g) {
    return g.map((row) => row.map((c) => ({ state: c.state, sub: c.sub })));
  }
  const cloneGrid64 = cloneGrid256;

  function findSongById(songId) {
    for (const artist of ARTIST_CATALOG) {
      for (const song of artist.songs) {
        if (song.id === songId) return { artist, song };
      }
    }
    return { artist: ARTIST_CATALOG[0], song: ARTIST_CATALOG[0].songs[0] };
  }

  function clearStepRange(g, startStep, endStep) {
    for (let s = startStep; s <= endStep; s++) {
      if (s < 0 || s >= TOTAL_STEPS) continue;
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        g[v][s] = { state: 0, sub: 1 };
      }
    }
  }

  function applySectionTurnaroundFill(g, sectionEndStep, style, effectiveFillPct, isClimaxSection = false) {
    const hit = (vIdx, step, st = 1, sub = 1) => {
      if (step >= 0 && step < TOTAL_STEPS) g[vIdx][step] = { state: st, sub };
    };
    const nextSectionFirstStep = (sectionEndStep + 1) % TOTAL_STEPS;
    const base64 = sectionEndStep - 63; // Start of this 4-bar section

    // Mid-section Bar-2 pickup (step 30..31 of the 4-bar section)
    if (effectiveFillPct >= 25) {
      if (g[2][base64 + 30].state === 0) hit(2, base64 + 30, 3, 1);
      hit(0, base64 + 31, 1, 1);
    }

    // For Climax section (Bar 16), also add a Bar-14 pickup and optional Beat-2 launch at high fillPct
    if (isClimaxSection && effectiveFillPct >= 50) {
      clearStepRange(g, base64 + 44, base64 + 47); // End of Bar 15 setup
      hit(0, base64 + 44, 2, 1);
      hit(2, base64 + 45, 3, 1);
      hit(2, base64 + 46, 2, 1);
      hit(5, base64 + 46, 2, 1);
      hit(0, base64 + 47, 2, 1);
    }

    if (effectiveFillPct < 30) return;

    if (effectiveFillPct < 62 && !isClimaxSection) {
      // 1-Beat Turnaround Fill on Beat 4 of the section's 4th bar (steps 60..63 relative to section)
      const s60 = sectionEndStep - 3;
      clearStepRange(g, s60, sectionEndStep);
      if (style === 'bonham' || style === 'peart') {
        hit(2, s60, 2, 1);
        hit(6, s60 + 1, 2, 1);
        hit(6, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
        hit(7, nextSectionFirstStep, 2, 1);
      } else if (style === 'clyde_funk' || style === 'questlove_pocket') {
        hit(2, s60, 2, 1);
        hit(1, s60, 2, 1);
        hit(2, s60 + 1, 3, 1);
        hit(5, s60 + 2, 2, 1);
        hit(2, s60 + 2, 1, 1);
        hit(0, s60 + 3, 2, 1);
      } else if (style === 'linndrum' || style === 'french_house') {
        hit(2, s60, 2, 1);
        hit(3, s60, 2, 1);
        hit(6, s60 + 1, 2, 1);
        hit(5, s60 + 2, 2, 1);
        hit(6, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
      } else if (style === 'selway') {
        hit(1, s60, 2, 1);
        hit(2, s60 + 1, 3, 1);
        hit(2, s60 + 2, 2, 1);
        hit(5, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
      } else if (style === 'phil_collins') {
        // Townhouse gated concert-tom cascade into Bar-1 crash
        hit(6, s60, 2, 1);
        hit(6, s60 + 1, 2, 1);
        hit(2, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
        hit(7, nextSectionFirstStep, 2, 1);
      } else if (style === 'hot_chip') {
        // Indie-dance cowbell/rim + clap + synth-tom turnaround
        hit(1, s60, 2, 1);
        hit(3, s60, 2, 1);
        hit(6, s60 + 1, 1, 1);
        hit(5, s60 + 2, 2, 1);
        hit(1, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
      } else if (style === 'travis_barker') {
        // Travis Barker rudimental snare drag + floor tom + kick pickup
        hit(2, s60, 2, 2);
        hit(2, s60 + 1, 1, 1);
        hit(6, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
        hit(7, nextSectionFirstStep, 2, 1);
      } else {
        hit(2, s60, 2, 1);
        hit(2, s60 + 1, 1, 1);
        hit(6, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
      }
      return;
    }

    // 2-Beat (or 3-Beat Climax) Artist-Specific Turnaround Fill (steps 56..63 relative to section)
    const s56 = sectionEndStep - 7;
    if (isClimaxSection && effectiveFillPct >= 75) {
      // Expand Climax fill to Beat 2 of Bar 16 (steps 52..55 relative to section) for a full-bar showcase!
      const s52 = sectionEndStep - 11;
      clearStepRange(g, s52, sectionEndStep);
      hit(0, s52, 2, 1);
      hit(2, s52 + 1, 1, 1);
      hit(2, s52 + 2, 2, 1);
      hit(6, s52 + 3, 2, 1);
    } else {
      clearStepRange(g, s56, sectionEndStep);
    }

    const highFill = effectiveFillPct >= 82 || isClimaxSection;

    if (style === 'bonham') {
      hit(0, s56, 2, 1);
      hit(2, s56 + 1, 2, highFill ? 2 : 1);
      hit(2, s56 + 2, 2, 1);
      hit(0, s56 + 3, 2, 1);
      hit(6, s56 + 4, 2, 1);
      hit(6, s56 + 5, 2, 1);
      hit(6, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'peart') {
      hit(0, s56, 2, 1);
      hit(2, s56, 2, highFill ? 2 : 1);
      hit(2, s56 + 1, 2, 1);
      hit(6, s56 + 2, 2, 1);
      hit(6, s56 + 3, 1, 1);
      hit(6, s56 + 4, 2, 1);
      hit(6, s56 + 5, 2, 1);
      hit(2, s56 + 6, 2, 1);
      hit(5, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'selway') {
      hit(0, s56, 2, 1);
      hit(4, s56, 1, 1);
      hit(2, s56 + 1, 3, 1);
      hit(1, s56 + 2, 2, 1);
      hit(2, s56 + 3, 2, 1);
      hit(6, s56 + 4, 2, 1);
      hit(2, s56 + 5, 3, 1);
      hit(2, s56 + 6, 2, highFill ? 2 : 1);
      hit(5, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
    } else if (style === 'phil_collins') {
      // Phil Collins signature descending Townhouse concert-tom + kick cascade ("DA-DA, DA-DA, DUM-DUM!")
      hit(6, s56, 2, 1);
      hit(6, s56 + 1, 2, 1);
      hit(0, s56 + 2, 2, 1);
      hit(6, s56 + 3, 2, 1);
      hit(6, s56 + 4, 2, 1);
      hit(0, s56 + 5, 2, 1);
      hit(2, s56 + 6, 2, highFill ? 2 : 1);
      hit(6, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(2, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'hot_chip') {
      // Hot Chip indie-dance 707/808 cowbell + clap + synth-tom polyrhythmic turnaround
      hit(0, s56, 2, 1);
      hit(1, s56, 2, 1);
      hit(1, s56 + 2, 2, 1);
      hit(5, s56 + 2, 2, 1);
      hit(2, s56 + 3, 1, 1);
      hit(0, s56 + 4, 2, 1);
      hit(2, s56 + 4, 2, 1);
      hit(3, s56 + 4, 2, 1);
      hit(6, s56 + 5, 2, 1);
      hit(6, s56 + 6, 2, 1);
      hit(5, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'travis_barker') {
      // Travis Barker rudimental drum-corps 32nd-drag snare roll + floor tom & double-kick explosion
      hit(0, s56, 2, 1);
      hit(2, s56 + 1, 2, 2);
      hit(2, s56 + 2, 2, 1);
      hit(0, s56 + 3, 2, 1);
      hit(2, s56 + 4, 2, highFill ? 2 : 1);
      hit(6, s56 + 5, 2, 1);
      hit(6, s56 + 6, 2, 1);
      hit(2, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'clyde_funk') {
      hit(0, s56, 2, 1);
      hit(4, s56, 1, 1);
      hit(2, s56 + 1, 3, 1);
      hit(5, s56 + 2, 2, 1);
      hit(2, s56 + 2, 2, 1);
      hit(0, s56 + 3, 1, 1);
      hit(2, s56 + 4, 2, 1);
      hit(2, s56 + 5, 3, highFill ? 2 : 1);
      hit(5, s56 + 6, 2, 1);
      hit(2, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
    } else if (style === 'linndrum') {
      hit(2, s56, 2, highFill ? 2 : 1);
      hit(2, s56 + 1, 1, 1);
      hit(2, s56 + 2, 2, 1);
      hit(3, s56 + 2, 2, 1);
      hit(2, s56 + 3, 1, 1);
      hit(6, s56 + 4, 2, 1);
      hit(6, s56 + 5, 2, 1);
      hit(6, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'questlove_pocket') {
      hit(0, s56, 2, 1);
      hit(4, s56, 1, 1);
      hit(2, s56 + 1, 3, 1);
      hit(1, s56 + 2, 2, 1);
      hit(0, s56 + 3, 1, 1);
      hit(2, s56 + 4, 2, 1);
      hit(1, s56 + 4, 2, 1);
      hit(2, s56 + 5, 3, 1);
      hit(5, s56 + 6, 2, 1);
      hit(0, s56 + 6, 1, 1);
      hit(0, s56 + 7, 2, 1);
    } else if (style === 'french_house') {
      hit(0, s56, 2, 1);
      hit(4, s56, 1, 1);
      hit(5, s56 + 2, 2, 1);
      hit(2, s56 + 2, 2, 1);
      hit(0, s56 + 4, 2, 1);
      hit(2, s56 + 4, 2, 1);
      hit(3, s56 + 4, 2, 1);
      hit(2, s56 + 5, 1, 1);
      hit(5, s56 + 6, 2, 1);
      hit(2, s56 + 6, 2, highFill ? 2 : 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'garage_rock') {
      hit(0, s56, 2, 1);
      hit(2, s56 + 1, 1, 1);
      hit(2, s56 + 2, 2, 1);
      hit(2, s56 + 3, 1, 1);
      hit(6, s56 + 4, 2, 1);
      hit(6, s56 + 5, 1, 1);
      hit(2, s56 + 6, 2, 1);
      hit(6, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else {
      hit(0, s56, 2, 1);
      hit(2, s56 + 2, 2, highFill ? 2 : 1);
      hit(0, s56 + 3, 1, 1);
      hit(2, s56 + 4, 2, 1);
      hit(3, s56 + 4, 2, 1);
      hit(6, s56 + 5, 1, 1);
      hit(6, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
    }
  }

  function generateSongGrooveGrid(songId, intensity, ghostPct, hatEnergy, fillPct) {
    const { song } = findSongById(songId);
    const g = createEmptyGrid256();
    const hit = (vIdx, step, st = 1, sub = 1) => {
      if (step >= 0 && step < TOTAL_STEPS) g[vIdx][step] = { state: st, sub };
    };
    const style = song.fillStyle || 'hiphop_mpc';

    for (let b = 0; b < TOTAL_BARS; b++) {
      const o = b * 16;
      const secIdx = Math.floor(b / 4); // 0: Verse, 1: Chorus, 2: Bridge, 3: Climax
      const barInSec = b % 4;           // 0..3 within each 4-bar section
      const isEvenBar = barInSec % 2 === 1;

      // Section-aware dynamic modifiers so each 4-bar section feels like a real record arrangement:
      const secIntensity =
        secIdx === 0
          ? Math.max(15, intensity - 14) // Sec 1 (Intro/Verse): tighter, more intimate
          : secIdx === 1
          ? Math.min(100, intensity + 10) // Sec 2 (Chorus/Hook): fuller lift
          : secIdx === 2
          ? intensity                     // Sec 3 (Bridge/Break): distinct texture shift
          : Math.min(100, intensity + 22); // Sec 4 (Climax/Outro): maximum band energy

      const secHatEnergy =
        secIdx === 0
          ? Math.max(12, hatEnergy - 15)
          : secIdx === 1
          ? Math.min(100, hatEnergy + 12)
          : secIdx === 2
          ? hatEnergy
          : Math.min(100, hatEnergy + 25);

      const secGhostPct =
        secIdx === 2
          ? Math.min(100, ghostPct + 20) // Extra pocket chatter in Bridge/Break
          : secIdx === 3
          ? Math.min(100, ghostPct + 12)
          : ghostPct;

      // ----------------------------------------------------------------------
      // 1. KICKS (Section-aware variation)
      // ----------------------------------------------------------------------
      const useBar2Kicks =
        isEvenBar || secIdx === 3 || (secIdx === 2 && (style === 'clyde_funk' || style === 'questlove_pocket'));
      const kickList = useBar2Kicks && song.kicksBar2 ? song.kicksBar2 : song.kicks;

      // In Electro/House Bridge (Sec 2, Bars 9–10), strip kicks to downbeat or filter-break before building in Bars 11–12
      const isElectroBreakdownBar =
        secIdx === 2 && barInSec < 2 && (style === 'french_house' || style === 'linndrum' || style === 'hot_chip');

      for (let i = 0; i < kickList.length; i++) {
        const s = kickList[i];
        if (isElectroBreakdownBar && s > 0 && s !== 8) continue;
        if (s === 0 || s === 8 || secIntensity >= 25 + (i % 3) * 15) {
          hit(0, o + s, s % 4 === 0 ? 2 : 1, 1);
        }
      }

      // ----------------------------------------------------------------------
      // 2. SNARES, RIMS & CLAPS (Section-aware layering)
      // ----------------------------------------------------------------------
      const useBar2Snares =
        (isEvenBar || (secIdx === 2 && barInSec >= 1)) && song.snaresBar2;
      const snareList = useBar2Snares ? song.snaresBar2 : song.snares;

      // Iconic Song-Specific Section 1 (Intro/Verse) Arrangement Nuances:
      if (songId === 'pc_intheair' && secIdx < 3) {
        // Phil Collins "In the Air Tonight" Sections 1–3 (Bars 1–12): Minimalist Roland CR-78 pulse (NO gated snare until Section 4 Climax!)
        for (const s of [4, 6, 12, 14]) hit(1, o + s, s === 4 || s === 12 ? 2 : 1, 1);
        if (secIdx === 2 && barInSec < 3) {
          // Tense low-tom heartbeat in Section 3 (Bars 9–11) right before the legendary Bar-12 drum fill!
          hit(6, o + 14, 1, 1);
          hit(6, o + 15, 2, 1);
        }
      } else if (songId === 'bea_cometogether' && secIdx === 0 && barInSec < 2) {
        // Ringo's famous "Come Together" Intro/Riff (Bars 1–2): NO snare backbeat, just Kick + 16th hat burst + floor-tom slide!
        for (const s of [8, 10, 12, 14]) hit(6, o + s, s === 8 ? 2 : 1, 1);
      } else if (songId === 'prince_purplerain' && secIdx === 0 && barInSec < 2) {
        // "Purple Rain" Intro/Verse (Bars 1–2): cross-stick rim on Beat 2 (step 4), huge snare on Beat 4 (step 12)
        hit(1, o + 4, 2, 1);
        hit(2, o + 12, 2, 1);
      } else if ((songId === 'rad_weirdfishes' || songId === 'rad_paranoidandroid') && secIdx === 0 && barInSec < 2) {
        // Radiohead Intro (Bars 1–2): crisp wood-rim pulse on 2 & 4 before full snare enters in Bar 3
        for (const s of song.rims || [4, 12]) hit(1, o + s, s === 4 || s === 12 ? 2 : 1, 1);
      } else if (songId === 'blink_adamssong' && secIdx === 0) {
        // Travis Barker "Adam's Song" Verse (Bars 1–4): cross-stick rim on Beat 2, snare on Beat 4 + melodic tom pulse
        hit(1, o + 4, 2, 1);
        hit(2, o + 12, 2, 1);
        for (const s of [2, 6, 10, 14]) hit(6, o + s, 1, 1);
      } else if (songId === 'blink_feelingthis' && secIdx === 0) {
        // Travis Barker "Feeling This" Flanged Intro/Verse (Bars 1–4): cowbell/rim ostinato + latin tom accents
        for (const s of snareList || []) hit(2, o + s, 2, 1);
        for (const s of [7, 14, 15]) hit(6, o + s, s === 14 ? 2 : 1, 1);
      } else {
        for (const s of snareList || []) {
          hit(2, o + s, 2, 1);
        }
      }

      // Rims: active in Intro/Verse for cross-stick warmth, and extra syncopated in Bridge (Sec 2)
      for (const s of song.rims || []) {
        if (s === 4 || s === 12 || secIntensity >= 30 || secIdx === 0 || secIdx === 2) {
          hit(1, o + s, s === 4 || s === 12 ? 2 : 1, 1);
        }
      }

      // Handclaps: held back in Intro/Verse (Sec 0) unless song is clap-driven, then unleashed in Chorus & Climax!
      if (secIdx >= 1 || secIntensity >= 65) {
        for (const s of song.claps || []) {
          hit(3, o + s, 2, 1);
        }
      }

      // ----------------------------------------------------------------------
      // 3. GHOST SNARES & POCKET CHATTER
      // ----------------------------------------------------------------------
      if (secGhostPct >= 15) {
        for (const s of song.ghostSnares || []) {
          if (secGhostPct >= 28 || s === 7 || s === 15) {
            if (g[2][o + s].state === 0) hit(2, o + s, 3, 1);
          }
        }
      }
      if (secGhostPct >= 55) {
        const extraGhosts = [1, 7, 9, 15];
        for (const s of extraGhosts) {
          if (g[2][o + s].state === 0 && g[0][o + s].state === 0 && (s + b) % 2 === 1) {
            hit(2, o + s, 3, 1);
          }
        }
      }

      // ----------------------------------------------------------------------
      // 4. TOM RIFFS & BRIDGE BREAKDOWNS
      // ----------------------------------------------------------------------
      if (isEvenBar || secIdx === 3 || secIntensity >= 70) {
        for (const s of song.tomsBar2 || []) {
          hit(6, o + s, s % 2 === 0 ? 2 : 1, 1);
        }
      }

      // Section 3 (Bridge / Solo Break, Bars 9–12) Signature Texture Shifts by Style:
      if (secIdx === 2) {
        if (style === 'peart' || style === 'selway') {
          // Prog / Krautrock Bridge: Ride Bell + Rimclick 3+3+2 / 8th polyrhythm
          for (const s of [0, 3, 6, 8, 10, 12, 14]) {
            hit(7, o + s, s % 4 === 0 ? 2 : 1, 1);
          }
          for (const s of [2, 6, 10, 14]) {
            if (g[1][o + s].state === 0) hit(1, o + s, 1, 1);
          }
        } else if (style === 'bonham' || style === 'garage_rock') {
          // Rock Bridge: Floor-tom 8th drive + crash accents on beat 1 & 3
          for (let s = 0; s < 16; s += 2) {
            hit(6, o + s, s % 4 === 0 ? 2 : 1, 1);
          }
          if (barInSec % 2 === 0) {
            hit(7, o + 0, 2, 1);
            hit(7, o + 8, 1, 1);
          }
        } else if (style === 'clyde_funk' || style === 'questlove_pocket' || style === 'hiphop_mpc') {
          // "Give the Drummer Some" Funk / Breakbeat Solo Break: open-hat barks + syncopated ghost chatter
          for (const s of [2, 7, 13, 14]) {
            if (song.openHats && song.openHats.length > 0) hit(5, o + s, 2, 1);
          }
          for (const s of [1, 5, 9, 11, 15]) {
            if (g[2][o + s].state === 0) hit(2, o + s, 3, 1);
          }
        } else if (style === 'french_house' || style === 'linndrum' || style === 'hot_chip') {
          // Disco / Electro / Hot Chip Bridge: offbeat open hats (2, 6, 10, 14) + cowbell/rim ostinato
          for (const s of [2, 6, 10, 14]) hit(5, o + s, 2, 1);
          if (style === 'hot_chip') {
            for (const s of [0, 3, 6, 10, 12, 14]) hit(1, o + s, s % 4 === 0 ? 2 : 1, 1);
          }
          if (barInSec === 3) {
            // Bar 12 16th snare build into Climax
            for (let s = 0; s < 8; s++) hit(2, o + s, s % 2 === 0 ? 2 : 1, 1);
          }
        } else if (style === 'phil_collins') {
          // Phil Collins Townhouse Bridge: melodic concert-tom accents + CR-78/DMX rim pulse
          for (const s of [2, 6, 10, 14]) hit(1, o + s, 1, 1);
          if (barInSec % 2 === 1 && songId !== 'pc_intheair') {
            for (const s of [11, 12, 14, 15]) hit(6, o + s, 2, 1);
          }
        } else if (style === 'travis_barker') {
          // Travis Barker Half-Time Breakdown / Marching-Snare Bridge (Bars 9–12):
          // Crash on beat 1, huge half-time snare on beat 3 (step 8), rudimental 32nd drags & floor-tom accents
          hit(7, o + 0, 2, 1);
          hit(2, o + 8, 2, 1);
          hit(2, o + 11, 3, 2);
          hit(6, o + 12, 2, 1);
          hit(6, o + 14, 2, 1);
          hit(0, o + 15, 2, 1);
        }
      }

      // ----------------------------------------------------------------------
      // 5. OPEN HATS (More frequent in Chorus, Bridge & Climax)
      // ----------------------------------------------------------------------
      if (secHatEnergy >= 28) {
        for (const s of song.openHats || []) {
          if (secHatEnergy >= 42 || secIdx >= 1 || s === 14 || s === 2) {
            hit(5, o + s, 2, 1);
          }
        }
      }

      // ----------------------------------------------------------------------
      // 6. HI-HATS & RIDE / CRASH CYMBALS
      // ----------------------------------------------------------------------
      if (songId === 'bea_cometogether' && secIdx === 0 && barInSec < 2) {
        // Come Together Intro 16th hi-hat sizzle on Beat 1 (steps 0..3)
        for (let s = 0; s < 4; s++) hit(4, o + s, s === 0 ? 2 : 1, 1);
        hit(5, o + 4, 2, 1);
      } else if (secHatEnergy < 30) {
        for (let s = 0; s < 16; s += 2) {
          if (g[5][o + s].state === 0 && (secHatEnergy >= 15 || s % 4 === 0)) {
            hit(4, o + s, s % 4 === 0 ? 1 : 3, 1);
          }
        }
      } else if (secHatEnergy < 68) {
        for (let s = 0; s < 16; s += 2) {
          if (g[5][o + s].state === 0) hit(4, o + s, s % 4 === 0 ? 2 : 1, 1);
        }
        if (song.hatMode.includes('16th') || secGhostPct >= 50 || secIdx === 3) {
          for (let s = 1; s < 16; s += 2) {
            if (g[5][o + s].state === 0 && ((s + b) % 2 === 0 || secHatEnergy >= 52)) {
              hit(4, o + s, 3, 1);
            }
          }
        }
      } else {
        for (let s = 0; s < 16; s++) {
          if (g[5][o + s].state === 0) {
            hit(4, o + s, s % 4 === 0 ? 2 : s % 2 === 0 ? 1 : 3, 1);
          }
        }
      }

      // Section Downbeat Crashes & Climax Ride Drive:
      if (barInSec === 0 && (secIdx === 1 || secIdx === 3 || (secIdx === 0 && intensity >= 75))) {
        hit(7, o + 0, 2, 1); // Downbeat Crash at start of Chorus (Bar 5) & Climax (Bar 13)
      }
      if (secIdx === 3 && secIntensity >= 65) {
        // Climax Section (Bars 13–16): Ride/Crash 8th-note or quarter-note lift
        const rideStep = secIntensity >= 82 ? 2 : 4;
        for (let s = 0; s < 16; s += rideStep) {
          hit(7, o + s, s % 4 === 0 ? 2 : 1, 1);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 7. SECTION-END TURNAROUND FILLS (Bars 4, 8, 12, and Showstopper Bar 16!)
    // ------------------------------------------------------------------------
    if (songId === 'pc_intheair') {
      // "In the Air Tonight" Special Arrangement:
      // Keep Bars 1–11 pure Roland CR-78 tension, then unleash the legendary 1-Bar 10-note concert-tom fill in Bar 12 (steps 176..191) into Section 4 Climax!
      if (fillPct >= 20) {
        clearStepRange(g, 176, 191);
        const f = 176;
        // "DA-DA (kick), DA-DA (kick), DA-DA (kick), DA-DA, DUM-DUM!"
        hit(6, f + 0, 2, 1);
        hit(6, f + 1, 2, 1);
        hit(0, f + 2, 2, 1);
        hit(6, f + 3, 2, 1);
        hit(6, f + 4, 2, 1);
        hit(0, f + 5, 2, 1);
        hit(6, f + 6, 2, 1);
        hit(6, f + 7, 2, 1);
        hit(0, f + 8, 2, 1);
        hit(6, f + 9, 2, 1);
        hit(6, f + 10, 2, 1);
        hit(0, f + 11, 2, 1);
        hit(2, f + 12, 2, 1);
        hit(6, f + 12, 2, 1);
        hit(2, f + 14, 2, 1);
        hit(6, f + 14, 2, 1);
        hit(0, f + 15, 2, 1);
        hit(7, 192, 2, 1); // Massive Bar-13 Downbeat Crash!
      }
      applySectionTurnaroundFill(g, 255, style, Math.min(100, fillPct + 25), true);
    } else {
      // Section 1 End (Bar 4, step 63): subtle pickup into Chorus
      applySectionTurnaroundFill(g, 63, style, Math.max(30, fillPct - 20), false);
      // Section 2 End (Bar 8, step 127): solid turnaround into Bridge/Break
      applySectionTurnaroundFill(g, 127, style, fillPct, false);
      // Section 3 End (Bar 12, step 191): energetic launch fill into Climax
      applySectionTurnaroundFill(g, 191, style, Math.min(100, fillPct + 12), false);
      // Section 4 End (Bar 16, step 255): Full Artist Signature Showstopper Fill!
      applySectionTurnaroundFill(g, 255, style, Math.min(100, fillPct + 25), true);
    }

    return g;
  }

  // ==========================================================================
  // 6. Client-Side Standard MIDI File (.mid) Builder
  // ==========================================================================
  function writeVarLen(value) {
    let buffer = value & 0x7f;
    const bytes = [];
    while ((value >>= 7)) {
      buffer <<= 8;
      buffer |= (value & 0x7f) | 0x80;
    }
    while (true) {
      bytes.push(buffer & 0xff);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
    return bytes;
  }

  function buildMidiBlob(notes, durationBeats = 16, bpm = 120) {
    const tpq = 480;
    const events = [];
    for (const n of notes || []) {
      if (n.muted) continue;
      const pitch = Math.max(0, Math.min(127, Math.round(Number(n.pitch) || 36)));
      const vel = Math.max(1, Math.min(127, Math.round(Number(n.velocity) || 100)));
      const startBeat = Number(n.startTime ?? n.time ?? 0);
      const durBeat = Number(n.duration ?? 0.2);
      const startTick = Math.max(0, Math.round(startBeat * tpq));
      const endTick = Math.max(startTick + 12, Math.round((startBeat + Math.max(0.04, durBeat)) * tpq));
      events.push({ tick: startTick, type: 0x90, pitch, velocity: vel });
      events.push({ tick: endTick, type: 0x80, pitch, velocity: 0 });
    }
    events.sort((a, b) => a.tick - b.tick || a.type - b.type);

    const trackBytes = [];
    const usPerQuarter = Math.round(60000000 / (bpm || 120));
    trackBytes.push(
      0x00, 0xff, 0x51, 0x03,
      (usPerQuarter >> 16) & 0xff,
      (usPerQuarter >> 8) & 0xff,
      usPerQuarter & 0xff
    );

    let lastTick = 0;
    for (const ev of events) {
      const delta = Math.max(0, ev.tick - lastTick);
      lastTick = ev.tick;
      trackBytes.push(...writeVarLen(delta), ev.type, ev.pitch, ev.velocity);
    }
    const endTick = Math.max(lastTick, Math.round((durationBeats || 16) * tpq));
    trackBytes.push(...writeVarLen(Math.max(0, endTick - lastTick)), 0xff, 0x2f, 0x00);

    const totalLen = 14 + 8 + trackBytes.length;
    const out = new Uint8Array(totalLen);
    const view = new DataView(out.buffer);
    out.set([0x4d, 0x54, 0x68, 0x64], 0);
    view.setUint32(4, 6);
    view.setUint16(8, 0);
    view.setUint16(10, 1);
    view.setUint16(12, tpq);
    out.set([0x4d, 0x54, 0x72, 0x6b], 14);
    view.setUint32(18, trackBytes.length);
    out.set(trackBytes, 22);

    return new Blob([out], { type: 'audio/midi' });
  }

  // ==========================================================================
  // 7. Workstation State + Offline LocalStorage Persistence ("sessh_state_v1")
  // ==========================================================================
  const STORAGE_KEY = 'sessh_state_v1';
  const BRIDGE_URL_KEY = 'sessh_bridge_url';
  const isLocalBridgeOrigin =
    window.location.port === '3333' ||
    window.location.hostname === 'localhost' ||
    /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(window.location.hostname);

  const state = {
    abletonConnected: false,
    bridgeUrl: isLocalBridgeOrigin
      ? window.location.origin
      : localStorage.getItem(BRIDGE_URL_KEY) || '',

    selectedArtistId: 'zeppelin',
    selectedSongId: 'zep_levee',
    kitId: 'bonham',
    tempo: 71,

    // 6 Session Drummer Dials
    intensityPct: 70,
    ghostPct: 45,
    hatEnergyPct: 60,
    fillPct: 65,
    swingPct: 12,
    pocketPct: 25,

    // 16-Bar / 4-Section Arrangement Controls
    activeSection: 0,          // 0: Intro/Verse (Bars 1–4), 1: Chorus (Bars 5–8), 2: Bridge (Bars 9–12), 3: Climax (Bars 13–16)
    loopMode: 'all16',         // 'all16' (Bars 1–16), 'bars8' (Bars 1–8), 'section4' (Lock active 4-bar section)
    autoFollowSection: true,   // Automatically flip the 4-bar section view as the playhead crosses sections
    viewMode: 'section4',      // 'section4' (Active 4-Bar Section, 64 steps), 'all16' (All 16 Bars Stacked, 256 steps), 'zoom1' (1 Bar, 16 steps)
    zoomedBar: 0,              // 0..15 (Bar 1..16)
    brushMode: 'normal',
    mutedLanes: new Array(DRUM_VOICES.length).fill(false),
    grid: createEmptyGrid256(),
    undoHistory: [],

    activeStep: -1,
    activeBar: -1,
    overdubRecord: false,
    noteRepeatRate: 0,

    currentNotes: [],
    phonePlayer: {
      playing: false,
      startWallTime: 0,
      lastStepTime: -1,
      rafId: null
    }
  };

  function getApiUrl(pathStr) {
    const base = (state.bridgeUrl || '').replace(/\/+$/, '');
    return base ? `${base}${pathStr}` : pathStr;
  }

  function savePersistedState() {
    try {
      const payload = {
        selectedArtistId: state.selectedArtistId,
        selectedSongId: state.selectedSongId,
        kitId: state.kitId,
        tempo: state.tempo,
        intensityPct: state.intensityPct,
        ghostPct: state.ghostPct,
        hatEnergyPct: state.hatEnergyPct,
        fillPct: state.fillPct,
        swingPct: state.swingPct,
        pocketPct: state.pocketPct,
        activeSection: state.activeSection,
        loopMode: state.loopMode,
        autoFollowSection: state.autoFollowSection,
        grid: state.grid
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || !saved.selectedSongId) return false;
      const { artist, song } = findSongById(saved.selectedSongId);
      state.selectedArtistId = artist.artistId;
      state.selectedSongId = song.id;
      state.kitId = saved.kitId || song.kit || artist.defaultKit;
      state.tempo = Number(saved.tempo) || song.bpm;
      state.intensityPct = Number(saved.intensityPct ?? 70);
      state.ghostPct = Number(saved.ghostPct ?? 45);
      state.hatEnergyPct = Number(saved.hatEnergyPct ?? 60);
      state.fillPct = Number(saved.fillPct ?? 65);
      state.swingPct = Number(saved.swingPct ?? song.swing);
      state.pocketPct = Number(saved.pocketPct ?? 25);
      state.activeSection = Number(saved.activeSection ?? 0);
      state.loopMode = saved.loopMode || 'all16';
      state.autoFollowSection = saved.autoFollowSection !== false;

      if (
        Array.isArray(saved.grid) &&
        saved.grid.length === DRUM_VOICES.length &&
        Array.isArray(saved.grid[0]) &&
        saved.grid[0].length === TOTAL_STEPS
      ) {
        state.grid = cloneGrid256(saved.grid);
      } else {
        state.grid = generateSongGrooveGrid(
          state.selectedSongId,
          state.intensityPct,
          state.ghostPct,
          state.hatEnergyPct,
          state.fillPct
        );
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function getActiveLoopStepBounds() {
    if (state.loopMode === 'section4') {
      const startStep = state.activeSection * 64;
      return { startStep, endStep: startStep + 64, barsCount: 4, durationBeats: 16.0 };
    }
    if (state.loopMode === 'bars8') {
      return { startStep: 0, endStep: 128, barsCount: 8, durationBeats: 32.0 };
    }
    return { startStep: 0, endStep: 256, barsCount: 16, durationBeats: 64.0 };
  }

  function pushUndoState() {
    state.undoHistory.push(cloneGrid256(state.grid));
    if (state.undoHistory.length > 15) state.undoHistory.shift();
    const undoBtn = document.getElementById('fold-undo-btn');
    if (undoBtn) undoBtn.disabled = false;
  }

  function loadSongGroove(songId, resetDials = true) {
    const { artist, song } = findSongById(songId);
    state.selectedArtistId = artist.artistId;
    state.selectedSongId = song.id;
    if (resetDials) {
      state.tempo = song.bpm;
      state.swingPct = song.swing;
      state.kitId = song.kit || artist.defaultKit;
    }
    state.grid = generateSongGrooveGrid(
      state.selectedSongId,
      state.intensityPct,
      state.ghostPct,
      state.hatEnergyPct,
      state.fillPct
    );
    syncSequencerNotes();
    renderArtistTabsAndSongs();
    renderSectionTabs();
    renderMini4BarMap();
    renderSequencerGrid();
    updateDialsUI();
    updatePlayerButtons();
  }

  function regenerateFromDials() {
    state.grid = generateSongGrooveGrid(
      state.selectedSongId,
      state.intensityPct,
      state.ghostPct,
      state.hatEnergyPct,
      state.fillPct
    );
    syncSequencerNotes();
    renderSectionTabs();
    renderMini4BarMap();
    renderSequencerGrid();
  }

  function buildNotesFromSequencer(rangeStartStep = 0, rangeEndStep = TOTAL_STEPS) {
    const notes = [];
    const stepDur = 0.25;
    const swingOffset = (state.swingPct / 100) * 0.145;
    const pocketScale = state.pocketPct / 100;
    const kit = getActiveKitProfile();
    const snareLaybackBeats = ((kit.laybackMs || 0) / 1000) * (state.tempo / 60) * pocketScale;

    const getSwungStepStart = (stepIdx) =>
      stepIdx * stepDur + (stepIdx % 2 === 1 ? swingOffset : 0);

    const baseBeatOffset = rangeStartStep * stepDur;

    for (let vIdx = 0; vIdx < DRUM_VOICES.length; vIdx++) {
      if (state.mutedLanes[vIdx]) continue;
      const voice = DRUM_VOICES[vIdx];
      const isSnareOrRim = vIdx === 1 || vIdx === 2;

      for (let s = rangeStartStep; s < rangeEndStep; s++) {
        const cell = state.grid[vIdx][s];
        if (!cell || cell.state === 0) continue;

        const baseVel = cell.state === 2 ? 124 : cell.state === 3 ? 46 : 96;
        const subCount = cell.sub || 1;
        // Turnaround fill zones at the end of Bars 4, 8, 12, and 16 (last 2–3 beats of each 64-step section)
        const isTurnaroundFillZone = (s % 64) >= 48;

        const stepStart = getSwungStepStart(s) - baseBeatOffset;
        const nextStepStart = getSwungStepStart(s + 1) - baseBeatOffset;
        const actualStepSpan = Math.max(0.12, nextStepStart - stepStart);
        const subStepDur = subCount > 1 ? actualStepSpan / subCount : stepDur;

        // Only apply snare layback on single groove hits (never smear fast rolls or turnaround fills)
        const layback =
          isSnareOrRim && subCount === 1 && !isTurnaroundFillZone ? snareLaybackBeats : 0;

        for (let r = 0; r < subCount; r++) {
          const seed = Math.sin((vIdx + 1) * 97 + s * 31 + r * 17);
          const timeJitter =
            subCount === 1 && !isTurnaroundFillZone ? pocketScale * seed * 0.012 : 0;
          const velJitter = Math.round(pocketScale * Math.cos(seed * 7) * 8);
          const rollRamp = subCount > 1 ? Math.round(((r + 1) / subCount) * 16 - 12) : 0;

          const startTime = Math.max(0, stepStart + layback + r * subStepDur + timeJitter);
          const velocity = Math.max(20, Math.min(127, baseVel + velJitter + rollRamp));
          notes.push({
            pitch: voice.pitch,
            startTime: Number(startTime.toFixed(4)),
            duration: Number((subStepDur * 0.85).toFixed(4)),
            velocity,
            muted: 0
          });
        }
      }
    }
    notes.sort((a, b) => a.startTime - b.startTime || a.pitch - b.pitch);
    return notes;
  }

  function syncSequencerNotes() {
    state.currentNotes = buildNotesFromSequencer(0, TOTAL_STEPS);
    savePersistedState();
    renderMini4BarMap();
  }

  // ==========================================================================
  // 8. Real-Time 16-Bar / 4-Section Phone Playback Clock (WebAudio Lookahead)
  // ==========================================================================
  function startPhonePlayback() {
    const ctx = getAudioCtx();
    state.phonePlayer.playing = true;
    state.phonePlayer.startWallTime = ctx.currentTime + 0.02;
    state.phonePlayer.lastStepTime = -0.001;
    updatePlayerButtons();

    function scheduleWindow(
      windowStartRelBeat,
      windowEndRelBeat,
      loopStartBeatOffset,
      loopStartWallTime,
      beatsPerSec,
      now
    ) {
      const notes = state.currentNotes || [];
      const absStart = loopStartBeatOffset + windowStartRelBeat;
      const absEnd = loopStartBeatOffset + windowEndRelBeat;
      for (const n of notes) {
        if (n.muted) continue;
        const st = Number(n.startTime ?? 0);
        if (st > absStart && st <= absEnd) {
          const relBeat = st - loopStartBeatOffset;
          const exactWhen = Math.max(now, loopStartWallTime + relBeat / beatsPerSec);
          triggerDrumVoice(ctx, Number(n.pitch), Number(n.velocity || 100), exactWhen);
        }
      }
    }

    function tick() {
      if (!state.phonePlayer.playing) return;
      const now = ctx.currentTime;
      const bpm = state.tempo || 90;
      const beatsPerSec = bpm / 60;
      const { startStep, durationBeats: clipDur } = getActiveLoopStepBounds();
      const loopStartBeatOffset = startStep * 0.25;
      const lookaheadBeats = 0.085 * beatsPerSec;

      let elapsedBeats = Math.max(0, (now - state.phonePlayer.startWallTime) * beatsPerSec);
      const targetBeat = elapsedBeats + lookaheadBeats;
      const prevBeat = state.phonePlayer.lastStepTime;

      if (targetBeat >= clipDur) {
        scheduleWindow(
          prevBeat,
          clipDur + 0.05,
          loopStartBeatOffset,
          state.phonePlayer.startWallTime,
          beatsPerSec,
          now
        );
        const nextLoopWallTime = state.phonePlayer.startWallTime + clipDur / beatsPerSec;
        const wrappedTargetBeat = targetBeat - clipDur;
        scheduleWindow(
          -0.001,
          wrappedTargetBeat,
          loopStartBeatOffset,
          nextLoopWallTime,
          beatsPerSec,
          now
        );
        state.phonePlayer.startWallTime = nextLoopWallTime;
        state.phonePlayer.lastStepTime = wrappedTargetBeat;
        elapsedBeats = Math.max(0, (now - state.phonePlayer.startWallTime) * beatsPerSec);
      } else {
        scheduleWindow(
          prevBeat,
          targetBeat,
          loopStartBeatOffset,
          state.phonePlayer.startWallTime,
          beatsPerSec,
          now
        );
        state.phonePlayer.lastStepTime = targetBeat;
      }

      const relStep = Math.floor(elapsedBeats / 0.25) % Math.round(clipDur * 4);
      const current16th = startStep + relStep;
      const currentBar = Math.floor(current16th / 16);
      const currentSec = Math.floor(currentBar / 4);

      if (current16th !== state.activeStep) {
        state.activeStep = current16th;
        state.activeBar = currentBar;

        // If Auto-Follow is enabled during 16-bar or 8-bar playback, flip activeSection as playhead enters a new section!
        if (
          state.autoFollowSection &&
          state.loopMode !== 'section4' &&
          currentSec !== state.activeSection
        ) {
          state.activeSection = currentSec;
          if (state.viewMode === 'zoom1') {
            state.zoomedBar = currentBar;
          }
          renderSectionTabs();
          renderMini4BarMap();
          renderSequencerGrid();
          updateHeaderSummaries();
        } else {
          highlightPlayheadStep(current16th, currentBar, currentSec);
        }
      }

      state.phonePlayer.rafId = requestAnimationFrame(tick);
    }

    if (state.phonePlayer.rafId) cancelAnimationFrame(state.phonePlayer.rafId);
    state.phonePlayer.rafId = requestAnimationFrame(tick);
  }

  function stopPhonePlayback() {
    state.phonePlayer.playing = false;
    state.activeStep = -1;
    state.activeBar = -1;
    if (state.phonePlayer.rafId) {
      cancelAnimationFrame(state.phonePlayer.rafId);
      state.phonePlayer.rafId = null;
    }
    highlightPlayheadStep(-1, -1, -1);
    updatePlayerButtons();
  }

  function highlightPlayheadStep(stepIdx, barIdx, secIdx) {
    document.querySelectorAll('.drum-step-cell').forEach((el) => {
      const s = Number(el.getAttribute('data-step'));
      el.classList.toggle('playhead', s === stepIdx);
    });
    document.querySelectorAll('.fold-minimap-bar').forEach((el) => {
      const b = Number(el.getAttribute('data-minibar'));
      el.classList.toggle('playing-bar', b === barIdx);
    });
    document.querySelectorAll('.fold-sec-tab').forEach((el) => {
      const idx = Number(el.getAttribute('data-sec-idx'));
      el.classList.toggle('playing-sec', idx === secIdx);
    });
  }

  function updatePlayerButtons() {
    const playBtn = document.getElementById('fold-play-phone-btn');
    const sendBtn = document.getElementById('fold-send-ableton-btn');
    const { barsCount } = getActiveLoopStepBounds();
    const secName = SONG_SECTIONS[state.activeSection]?.badge || '4-Bar';
    const loopLabel =
      state.loopMode === 'section4'
        ? `${secName} (4 Bars)`
        : `${barsCount}-Bar Song`;

    if (playBtn) {
      playBtn.textContent = state.phonePlayer.playing
        ? '⏹ Stop Drummer'
        : `▶ Play ${loopLabel} on Phone`;
      playBtn.classList.toggle('active', state.phonePlayer.playing);
    }
    if (sendBtn) {
      sendBtn.textContent = `🚀 Play in Ableton (${loopLabel})`;
    }
  }

  // ==========================================================================
  // 9. Send 16-Bar Song or 4 Split Song Sections to Ableton Live 12
  // ==========================================================================
  async function sendOsc(address, args = [], expectReply = false) {
    if (!state.bridgeUrl) return { ok: false };
    try {
      const res = await fetch(getApiUrl('/api/osc'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, args, expectReply })
      });
      return await res.json();
    } catch (e) {
      return { ok: false };
    }
  }

  async function sendCurrentBeatToAbleton(fire = true) {
    const btn = document.getElementById('fold-send-ableton-btn');
    const { startStep, endStep, barsCount, durationBeats } = getActiveLoopStepBounds();
    if (!state.bridgeUrl) {
      configureStudioBridgeUrl();
      if (!state.bridgeUrl) return;
    }
    if (btn) btn.textContent = `⏳ Sending ${barsCount} Bars...`;

    try {
      const notes = buildNotesFromSequencer(startStep, endStep);
      const { artist, song } = findSongById(state.selectedSongId);
      const slotIdx = Math.max(0, ARTIST_CATALOG.findIndex((a) => a.artistId === artist.artistId));
      const secSuffix =
        state.loopMode === 'section4'
          ? ` [${SONG_SECTIONS[state.activeSection].shortTitle}]`
          : ` [${barsCount} Bars]`;
      await sendOsc('/live/song/set/tempo', [{ type: 'f', value: state.tempo }], false);
      const res = await fetch(getApiUrl('/api/write-clip'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackIndex: 0,
          slotIndex: slotIdx,
          name: `${artist.artistName.replace(/^[^\w]+/, '')} - ${song.title}${secSuffix}`,
          duration: durationBeats,
          color: 0xe73ff6,
          fire,
          notes
        })
      });
      const data = await res.json();
      if (btn) {
        btn.textContent = data.ok
          ? `✅ Playing "${song.title}" (${barsCount} Bars)!`
          : `✅ Saved ${barsCount}-Bar MIDI!`;
        setTimeout(() => updatePlayerButtons(), 1800);
      }
    } catch (e) {
      if (btn) {
        btn.textContent = '📱 Saved Offline (Use ⬇ .mid)';
        setTimeout(() => updatePlayerButtons(), 1500);
      }
    }
  }

  async function sendSplitSectionsToAbletonScenes() {
    const btn = document.getElementById('fold-split-scenes-btn');
    const origText = btn ? btn.textContent : '🎛️ Split 4 Sections → Ableton Scenes 1–4';
    if (!state.bridgeUrl) {
      configureStudioBridgeUrl();
      if (!state.bridgeUrl) return;
    }
    if (btn) btn.textContent = '⏳ Writing 4 Song Sections to Scenes 1–4...';

    try {
      const { artist, song } = findSongById(state.selectedSongId);
      const cleanArtist = artist.artistName.replace(/^[^\w]+/, '');
      await sendOsc('/live/song/set/tempo', [{ type: 'f', value: state.tempo }], false);

      const sectionColors = [0x10b981, 0xf59e0b, 0x38bdf8, 0xe73ff6];
      for (let secIdx = 0; secIdx < SONG_SECTIONS.length; secIdx++) {
        const sec = SONG_SECTIONS[secIdx];
        const secNotes = buildNotesFromSequencer(sec.startStep, sec.endStep + 1);
        await fetch(getApiUrl('/api/write-clip'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackIndex: 0,
            slotIndex: secIdx,
            name: `${secIdx + 1}-${sec.id.toUpperCase()}: ${cleanArtist} - ${song.title}`,
            duration: 16.0,
            color: sectionColors[secIdx],
            fire: secIdx === state.activeSection,
            notes: secNotes
          })
        });
      }

      if (btn) {
        btn.textContent = '✅ 4 Sections Loaded in Ableton Scenes 1–4!';
        setTimeout(() => (btn.textContent = origText), 2400);
      }
    } catch (e) {
      if (btn) {
        btn.textContent = '⚠️ Tap Badge to Set Studio Bridge IP';
        setTimeout(() => (btn.textContent = origText), 2000);
      }
    }
  }

  // ==========================================================================
  // 10. Render Artist Pills, 5 Songs, 4 Song Sections & 16-Bar Mini-Map
  // ==========================================================================
  function renderArtistTabsAndSongs() {
    const artistTabsEl = document.getElementById('fold-artist-tabs');
    const songsGridEl = document.getElementById('fold-artist-songs');
    if (!artistTabsEl || !songsGridEl) return;

    artistTabsEl.innerHTML = ARTIST_CATALOG.map((a) => {
      const active = a.artistId === state.selectedArtistId;
      return `
        <button class="fold-artist-pill ${active ? 'active' : ''}" data-artist-tab="${a.artistId}">
          <span>${a.artistName}</span>
          <span class="drummer-sub">${a.drummer}</span>
        </button>`;
    }).join('');

    artistTabsEl.querySelectorAll('[data-artist-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aid = btn.getAttribute('data-artist-tab');
        const foundArtist = ARTIST_CATALOG.find((a) => a.artistId === aid);
        if (foundArtist && foundArtist.songs[0]) {
          pushUndoState();
          loadSongGroove(foundArtist.songs[0].id, true);
        }
      });
    });

    const activeArtist = ARTIST_CATALOG.find((a) => a.artistId === state.selectedArtistId) || ARTIST_CATALOG[0];
    songsGridEl.innerHTML = activeArtist.songs
      .map((s, idx) => {
        const active = s.id === state.selectedSongId;
        return `
          <button class="fold-song-card ${active ? 'active' : ''}" data-song-id="${s.id}">
            <div class="song-top-row">
              <span class="song-tempo-tag">#${idx + 1} · ${s.bpm} BPM (${s.swing}% Swing) · 16 Bars</span>
              ${active ? `<span class="song-active-badge">● LOADED</span>` : ''}
            </div>
            <div class="song-title">${s.title}</div>
            <div class="song-desc">${s.desc}</div>
          </button>`;
      })
      .join('');

    songsGridEl.querySelectorAll('[data-song-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pushUndoState();
        loadSongGroove(btn.getAttribute('data-song-id'), true);
      });
    });
  }

  function renderSectionTabs() {
    const secTabsEl = document.getElementById('fold-section-tabs');
    if (!secTabsEl) return;

    const playingSec = state.activeBar >= 0 ? Math.floor(state.activeBar / 4) : -1;
    secTabsEl.innerHTML = SONG_SECTIONS.map((sec) => {
      const isSelected = state.activeSection === sec.index;
      const isPlaying = playingSec === sec.index;
      return `
        <button class="fold-sec-tab ${isSelected ? 'active' : ''} ${isPlaying ? 'playing-sec' : ''}"
                data-sec-idx="${sec.index}"
                style="--sec-color:${sec.color};">
          <div class="sec-tab-top">
            <span class="sec-tab-title">${sec.name}</span>
            <span class="sec-tab-bars">Bars ${sec.startBar + 1}–${sec.endBar + 1}</span>
          </div>
          <div class="sec-tab-desc">${sec.roleDesc}</div>
        </button>`;
    }).join('');

    secTabsEl.querySelectorAll('[data-sec-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-sec-idx'));
        state.activeSection = idx;
        if (state.viewMode === 'zoom1') {
          state.zoomedBar = idx * 4;
        }
        // If locked to a 4-bar section while playing, reset loop clock to start cleanly on the new section!
        if (state.phonePlayer.playing && state.loopMode === 'section4') {
          const ctx = getAudioCtx();
          state.phonePlayer.startWallTime = ctx.currentTime + 0.01;
          state.phonePlayer.lastStepTime = -0.001;
        }
        updatePlayerButtons();
        updateViewModeButtons();
        updateHeaderSummaries();
        renderSectionTabs();
        renderMini4BarMap();
        renderSequencerGrid();
      });
    });
  }

  function renderMini4BarMap() {
    const container = document.getElementById('fold-4bar-minimap');
    if (!container) return;

    let html = '';
    for (let b = 0; b < TOTAL_BARS; b++) {
      const start = b * 16;
      const secIdx = Math.floor(b / 4);
      const sec = SONG_SECTIONS[secIdx];
      const isInActiveSection = secIdx === state.activeSection;
      const isZoomSelected =
        (state.viewMode === 'zoom1' && state.zoomedBar === b) ||
        (state.viewMode === 'section4' && isInActiveSection);
      const isPlaying = state.activeBar === b;

      let barsHtml = '';
      for (let s = start; s < start + 16; s++) {
        let count = 0;
        let hasKick = false;
        let hasSnare = false;
        for (let v = 0; v < DRUM_VOICES.length; v++) {
          if (state.grid[v][s] && state.grid[v][s].state > 0) {
            count++;
            if (v === 0) hasKick = true;
            if (v === 2 || v === 1) hasSnare = true;
          }
        }
        const h = count === 0 ? 15 : Math.min(100, 28 + count * 24);
        const col = hasKick ? '#f43f5e' : hasSnare ? '#eab308' : count > 0 ? '#38bdf8' : 'rgba(255,255,255,0.1)';
        barsHtml += `<span style="height:${h}%;background:${col};"></span>`;
      }

      const isSectionEndFill = (b + 1) % 4 === 0;
      const barLabel = isSectionEndFill ? `BAR ${b + 1} (FILL)` : `BAR ${b + 1}`;
      html += `
        <div class="fold-minimap-bar ${isZoomSelected ? 'zoom-active' : ''} ${isPlaying ? 'playing-bar' : ''}"
             data-minibar="${b}"
             style="border-top: 3px solid ${sec.color};">
          <div class="minimap-top">
            <strong>${barLabel}</strong>
            <span>${sec.badge}</span>
          </div>
          <div class="minimap-wave">${barsHtml}</div>
        </div>`;
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-minibar]').forEach((el) => {
      el.addEventListener('click', () => {
        const b = Number(el.getAttribute('data-minibar'));
        state.zoomedBar = b;
        state.activeSection = Math.floor(b / 4);
        if (state.viewMode === 'all16') {
          state.viewMode = 'section4';
        }
        updatePlayerButtons();
        updateViewModeButtons();
        updateHeaderSummaries();
        renderSectionTabs();
        renderMini4BarMap();
        renderSequencerGrid();
      });
    });
  }

  let isPaintingSteps = false;
  let paintTargetState = null;

  function applyBrushToCell(vIdx, stepIdx, forceState = null) {
    const cell = state.grid[vIdx][stepIdx];
    const mode = state.brushMode;

    if (forceState !== null) {
      state.grid[vIdx][stepIdx] = { ...forceState };
    } else if (mode === 'normal') {
      cell.state = cell.state === 1 && cell.sub === 1 ? 0 : 1;
      cell.sub = 1;
    } else if (mode === 'accent') {
      cell.state = cell.state === 2 ? 0 : 2;
      cell.sub = 1;
    } else if (mode === 'ghost') {
      cell.state = cell.state === 3 ? 0 : 3;
      cell.sub = 1;
    } else if (mode === 'roll2') {
      if (cell.state > 0 && cell.sub === 2) {
        cell.state = 0;
        cell.sub = 1;
      } else {
        cell.state = cell.state || 1;
        cell.sub = 2;
      }
    } else if (mode === 'roll3') {
      if (cell.state > 0 && cell.sub === 3) {
        cell.state = 0;
        cell.sub = 1;
      } else {
        cell.state = cell.state || 2;
        cell.sub = 3;
      }
    }

    const updated = state.grid[vIdx][stepIdx];
    if (updated.state > 0 && !state.phonePlayer.playing) {
      const ctx = getAudioCtx();
      const vel = updated.state === 2 ? 124 : updated.state === 3 ? 48 : 100;
      triggerDrumVoice(ctx, DRUM_VOICES[vIdx].pitch, vel, ctx.currentTime);
    }

    syncSequencerNotes();
    renderSequencerGrid();
    return { ...updated };
  }

  function render4BarSectionBlock(secIdx) {
    const sec = SONG_SECTIONS[secIdx] || SONG_SECTIONS[0];
    const startBar = sec.startBar;
    let html = `<div class="drum-seq-64-wrapper" style="border-left: 4px solid ${sec.color}; padding-left: 8px; margin-bottom: 10px;">`;
    html += `<div class="drum-seq-row-64 header">
      <div class="drum-lane-controls-header" style="color:${sec.color};">${sec.name}<br><span style="font-size:9px;color:#9ca3af;">Steps ${sec.startStep + 1}–${sec.endStep + 1}</span></div>
      <div class="drum-bars-4-grid">
        <div class="bar-banner">BAR ${startBar + 1} (Beats ${startBar * 4 + 1}–${startBar * 4 + 4})</div>
        <div class="bar-banner">BAR ${startBar + 2} (Beats ${(startBar + 1) * 4 + 1}–${(startBar + 1) * 4 + 4})</div>
        <div class="bar-banner">BAR ${startBar + 3} (Beats ${(startBar + 2) * 4 + 1}–${(startBar + 2) * 4 + 4})</div>
        <div class="bar-banner fill-bar">BAR ${startBar + 4} (${secIdx === 3 ? 'Showstopper Climax Fill' : 'Section Turnaround Fill'})</div>
      </div>
    </div>`;

    for (let vIdx = 0; vIdx < DRUM_VOICES.length; vIdx++) {
      const voice = DRUM_VOICES[vIdx];
      const muted = state.mutedLanes[vIdx];
      html += `
        <div class="drum-seq-row-64 ${muted ? 'muted' : ''}">
          <div class="drum-lane-info">
            <button class="drum-voice-btn" data-voice-audition="${vIdx}" style="border-left: 4px solid ${voice.color};">
              ${voice.name}
            </button>
            <button class="drum-mini-ctrl ${muted ? 'muted-on' : ''}" data-voice-mute="${vIdx}" title="Mute">M</button>
            <button class="drum-mini-ctrl" data-voice-clear="${vIdx}" data-clear-sec="${secIdx}" title="Clear Voice in Section">×</button>
          </div>
          <div class="drum-bars-4-grid">`;

      for (let b = startBar; b < startBar + 4; b++) {
        html += `<div class="drum-bar-16-subgrid">`;
        for (let i = 0; i < 16; i++) {
          const s = b * 16 + i;
          const cell = state.grid[vIdx][s] || { state: 0, sub: 1 };
          const isBeat = i % 4 === 0;
          const stClass =
            cell.state === 2
              ? 'on accent'
              : cell.state === 3
              ? 'on ghost'
              : cell.state === 1
              ? 'on normal'
              : '';
          const bgStyle = cell.state > 0 ? `background:${voice.color};border-color:${voice.color};` : '';
          const subBadge = cell.state > 0 && cell.sub > 1 ? `<span class="sub-badge-mini">${cell.sub}</span>` : '';
          html += `
            <div class="drum-step-cell compact64 ${isBeat ? 'beat-start' : ''} ${stClass} ${s === state.activeStep ? 'playhead' : ''}"
                 data-v="${vIdx}" data-step="${s}" style="${bgStyle}">
              ${subBadge}
            </div>`;
        }
        html += `</div>`;
      }
      html += `</div></div>`;
    }
    html += `</div>`;
    return html;
  }

  function renderSequencerGrid() {
    const container = document.getElementById('fold-sequencer-grid');
    if (!container) return;

    if (state.viewMode === 'section4') {
      container.innerHTML = render4BarSectionBlock(state.activeSection);
    } else if (state.viewMode === 'all16') {
      container.innerHTML = SONG_SECTIONS.map((sec) => render4BarSectionBlock(sec.index)).join('');
    } else {
      const startStep = state.zoomedBar * 16;
      const endStep = startStep + 16;
      const sec = SONG_SECTIONS[Math.floor(state.zoomedBar / 4)] || SONG_SECTIONS[0];

      let html = `<div class="drum-seq-header-row">
        <div class="drum-lane-controls-header" style="color:${sec.color};">BAR ${state.zoomedBar + 1} · ${sec.badge} (STEPS ${startStep + 1}–${endStep})</div>
        <div class="drum-steps-row">`;
      for (let s = startStep; s < endStep; s++) {
        const isBeat = s % 4 === 0;
        const beatNum = Math.floor((s % 16) / 4) + 1;
        html += `<div class="drum-step-num ${isBeat ? 'beat' : ''}">${isBeat ? `Beat ${beatNum}` : (s % 4) + 1}</div>`;
      }
      html += `</div></div>`;

      for (let vIdx = 0; vIdx < DRUM_VOICES.length; vIdx++) {
        const voice = DRUM_VOICES[vIdx];
        const muted = state.mutedLanes[vIdx];
        html += `
          <div class="drum-seq-row ${muted ? 'muted' : ''}">
            <div class="drum-lane-info">
              <button class="drum-voice-btn" data-voice-audition="${vIdx}" style="border-left: 4px solid ${voice.color};">
                ${voice.name}
              </button>
              <button class="drum-mini-ctrl ${muted ? 'muted-on' : ''}" data-voice-mute="${vIdx}">M</button>
              <button class="drum-mini-ctrl" data-voice-clear="${vIdx}" data-clear-bar="${state.zoomedBar}">×</button>
            </div>
            <div class="drum-steps-row">`;

        for (let s = startStep; s < endStep; s++) {
          const cell = state.grid[vIdx][s] || { state: 0, sub: 1 };
          const beatGroup = Math.floor((s % 16) / 4) % 2 === 1 ? 'alt-group' : '';
          const stClass =
            cell.state === 2
              ? 'on accent'
              : cell.state === 3
              ? 'on ghost'
              : cell.state === 1
              ? 'on normal'
              : '';
          const subBadge = cell.state > 0 && cell.sub > 1 ? `<span class="sub-badge">${cell.sub}x</span>` : '';
          const bgStyle = cell.state > 0 ? `background:${voice.color};border-color:${voice.color};` : '';

          html += `
            <div class="drum-step-cell ${beatGroup} ${stClass} ${s === state.activeStep ? 'playhead' : ''}"
                 data-v="${vIdx}" data-step="${s}" style="${bgStyle}">
              ${subBadge}
            </div>`;
        }
        html += `</div></div>`;
      }
      container.innerHTML = html;
    }

    container.querySelectorAll('[data-voice-audition]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vIdx = Number(btn.getAttribute('data-voice-audition'));
        const ctx = getAudioCtx();
        triggerDrumVoice(ctx, DRUM_VOICES[vIdx].pitch, 118, ctx.currentTime);
      });
    });

    container.querySelectorAll('[data-voice-mute]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vIdx = Number(btn.getAttribute('data-voice-mute'));
        state.mutedLanes[vIdx] = !state.mutedLanes[vIdx];
        syncSequencerNotes();
        renderSequencerGrid();
      });
    });

    container.querySelectorAll('[data-voice-clear]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pushUndoState();
        const vIdx = Number(btn.getAttribute('data-voice-clear'));
        const clearSec = btn.hasAttribute('data-clear-sec') ? Number(btn.getAttribute('data-clear-sec')) : null;
        const clearBar = btn.hasAttribute('data-clear-bar') ? Number(btn.getAttribute('data-clear-bar')) : null;
        if (clearBar !== null) {
          for (let s = clearBar * 16; s < (clearBar + 1) * 16; s++) state.grid[vIdx][s] = { state: 0, sub: 1 };
        } else if (clearSec !== null) {
          for (let s = clearSec * 64; s < (clearSec + 1) * 64; s++) state.grid[vIdx][s] = { state: 0, sub: 1 };
        } else {
          for (let s = 0; s < TOTAL_STEPS; s++) state.grid[vIdx][s] = { state: 0, sub: 1 };
        }
        syncSequencerNotes();
        renderSequencerGrid();
      });
    });

    container.querySelectorAll('.drum-step-cell').forEach((cellEl) => {
      cellEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        pushUndoState();
        const vIdx = Number(cellEl.getAttribute('data-v'));
        const sIdx = Number(cellEl.getAttribute('data-step'));
        isPaintingSteps = true;
        paintTargetState = applyBrushToCell(vIdx, sIdx, null);
      });
      cellEl.addEventListener('pointerenter', () => {
        if (!isPaintingSteps || !paintTargetState) return;
        const vIdx = Number(cellEl.getAttribute('data-v'));
        const sIdx = Number(cellEl.getAttribute('data-step'));
        applyBrushToCell(vIdx, sIdx, paintTargetState);
      });
    });
  }

  window.addEventListener('pointerup', () => {
    isPaintingSteps = false;
    paintTargetState = null;
  });

  function updateViewModeButtons() {
    const sec4Btn = document.getElementById('fold-view-sec4-btn');
    const all16Btn = document.getElementById('fold-view-all16-btn');
    const zoom1Btn = document.getElementById('fold-view-zoom1-btn');
    const copyBarBtn = document.getElementById('fold-copy-bar-btn');
    const sec = SONG_SECTIONS[state.activeSection] || SONG_SECTIONS[0];

    if (sec4Btn) {
      sec4Btn.classList.toggle('chip-on', state.viewMode === 'section4');
      sec4Btn.textContent = `🔭 4-Bar Section (${sec.badge}: Bars ${sec.startBar + 1}–${sec.endBar + 1})`;
    }
    if (all16Btn) {
      all16Btn.classList.toggle('chip-on', state.viewMode === 'all16');
    }
    if (zoom1Btn) {
      zoom1Btn.classList.toggle('chip-on', state.viewMode === 'zoom1');
      zoom1Btn.textContent = `🔍 Zoom 1 Bar (Bar ${state.zoomedBar + 1} of 16)`;
    }
    if (copyBarBtn) {
      copyBarBtn.style.display = state.viewMode === 'zoom1' ? 'inline-flex' : 'none';
      copyBarBtn.textContent = `📋 Copy Bar ${state.zoomedBar + 1} → Section Bars ${sec.startBar + 1}–${sec.endBar + 1}`;
    }

    document.querySelectorAll('[data-loop-mode]').forEach((btn) => {
      btn.classList.toggle('chip-on', btn.getAttribute('data-loop-mode') === state.loopMode);
    });
    const followBtn = document.getElementById('fold-autofollow-btn');
    if (followBtn) {
      followBtn.classList.toggle('chip-on', state.autoFollowSection);
      followBtn.textContent = `👁️ Auto-Follow Playhead: ${state.autoFollowSection ? 'ON' : 'OFF'}`;
    }
  }

  // ==========================================================================
  // 11. Finger Drum Pads + Play-Along Overdub
  // ==========================================================================
  const activePadRepeats = {};

  function triggerFingerPad(vIdx, velocity = 118) {
    const ctx = getAudioCtx();
    const voice = DRUM_VOICES[vIdx];
    triggerDrumVoice(ctx, voice.pitch, velocity, ctx.currentTime);

    if (state.overdubRecord && state.phonePlayer.playing && state.activeStep >= 0) {
      const sub = state.noteRepeatRate === 0.125 ? 2 : state.noteRepeatRate === 0.1667 ? 3 : 1;
      state.grid[vIdx][state.activeStep] = { state: velocity >= 115 ? 2 : 1, sub };
      syncSequencerNotes();
      renderSequencerGrid();
    }
  }

  function startPadPress(vIdx, padEl) {
    padEl.classList.add('pressed');
    triggerFingerPad(vIdx, 122);

    if (state.noteRepeatRate > 0) {
      const intervalSec = (60 / (state.tempo || 90)) * state.noteRepeatRate;
      const intervalMs = Math.max(35, Math.round(intervalSec * 1000));
      clearInterval(activePadRepeats[vIdx]);
      activePadRepeats[vIdx] = setInterval(() => {
        triggerFingerPad(vIdx, 112);
      }, intervalMs);
    }
  }

  function stopPadPress(vIdx, padEl) {
    padEl.classList.remove('pressed');
    if (activePadRepeats[vIdx]) {
      clearInterval(activePadRepeats[vIdx]);
      delete activePadRepeats[vIdx];
    }
  }

  function updateHeaderSummaries() {
    const { artist, song } = findSongById(state.selectedSongId);
    const kit = getActiveKitProfile();
    const sec = SONG_SECTIONS[state.activeSection] || SONG_SECTIONS[0];
    const nowPlayingEl = document.getElementById('fold-now-playing-pill');
    if (nowPlayingEl && artist && song) {
      nowPlayingEl.textContent = `${artist.artistName} — ${song.title} (${state.tempo} BPM · ${sec.badge})`;
    }
    const sumArtistEl = document.getElementById('fold-summary-artist');
    if (sumArtistEl && artist && song) {
      sumArtistEl.textContent = `${artist.artistName} · ${song.title} (${state.tempo} BPM · 16 Bars)`;
    }
    const sumDialsEl = document.getElementById('fold-summary-dials');
    if (sumDialsEl && kit) {
      sumDialsEl.textContent = `Intensity ${state.intensityPct}% · Swing ${state.swingPct}% · Fill ${state.fillPct}%`;
    }
    const sumSeqEl = document.getElementById('fold-summary-seq');
    if (sumSeqEl) {
      sumSeqEl.textContent = `${sec.shortTitle} · Loop: ${state.loopMode === 'all16' ? '16 Bars' : state.loopMode === 'bars8' ? '8 Bars' : '4-Bar Section'}`;
    }
  }

  function updateDialsUI() {
    const setDial = (sliderId, valId, val, suffix = '%') => {
      const s = document.getElementById(sliderId);
      const v = document.getElementById(valId);
      if (s) s.value = val;
      if (v) v.textContent = `${val}${suffix}`;
    };
    setDial('dial-intensity', 'val-intensity', state.intensityPct, '%');
    setDial('dial-ghost', 'val-ghost', state.ghostPct, '%');
    setDial('dial-hats', 'val-hats', state.hatEnergyPct, '%');
    setDial('dial-fill', 'val-fill', state.fillPct, '%');
    setDial('dial-swing', 'val-swing', state.swingPct, '%');
    setDial('dial-pocket', 'val-pocket', state.pocketPct, '%');
    setDial('dial-bpm', 'val-bpm', state.tempo, ' BPM');

    const kitSelect = document.getElementById('fold-kit-select');
    if (kitSelect) kitSelect.value = state.kitId;
    updateHeaderSummaries();
  }

  function configureStudioBridgeUrl() {
    const current = state.bridgeUrl || 'http://192.168.1.247:3333';
    const input = window.prompt(
      'Optional Ableton Live 12 Studio Bridge URL (leave blank for pure Standalone Offline PWA mode):',
      current
    );
    if (input === null) return;
    const cleaned = input.trim().replace(/\/+$/, '');
    state.bridgeUrl = cleaned;
    try {
      if (cleaned) localStorage.setItem(BRIDGE_URL_KEY, cleaned);
      else localStorage.removeItem(BRIDGE_URL_KEY);
    } catch (e) {}
    refreshAbletonStatus();
  }

  async function refreshAbletonStatus() {
    const badge = document.getElementById('fold-conn-badge');
    if (!state.bridgeUrl) {
      state.abletonConnected = false;
      if (badge) {
        badge.textContent = '📱 Standalone PWA (Tap for Studio Bridge)';
        badge.className = 'fold-badge offline';
      }
      return;
    }
    try {
      const res = await fetch(getApiUrl('/api/status'));
      if (!res.ok) throw new Error('status error');
      const data = await res.json();
      state.abletonConnected = Boolean(data.abletonOscConnected);
      if (badge) {
        badge.textContent = state.abletonConnected
          ? '🟢 Ableton Live Connected'
          : '📱 Bridge Ready (Standalone Mode)';
        badge.className = state.abletonConnected ? 'fold-badge online' : 'fold-badge offline';
      }
    } catch (e) {
      state.abletonConnected = false;
      if (badge) {
        badge.textContent = '📱 Standalone PWA (Offline Ready)';
        badge.className = 'fold-badge offline';
      }
    }
  }

  // ==========================================================================
  // 12. Mount 16-Bar Session Drummer ("sessh") Workstation UI
  // ==========================================================================
  function mountFoldDock() {
    if (document.getElementById('fold-studio-dock')) return;
    document.body.style.display = 'block';
    document.body.classList.add('fold-drum-fullscreen');

    const style = document.createElement('style');
    style.textContent = `
      html {
        overflow-x: hidden !important;
        overflow-y: auto !important;
        height: auto !important;
      }
      body.fold-drum-fullscreen {
        overflow: visible !important;
        height: auto !important;
        min-height: 100vh;
        display: block !important;
        margin: 0 !important;
        padding: 8px 10px 28px 10px !important;
      }
      body.fold-drum-fullscreen .logo-container,
      body.fold-drum-fullscreen nav,
      body.fold-drum-fullscreen #plugin-container {
        display: none !important;
      }
      #fold-studio-dock {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: #f3f4f6;
        font-family: 'Roboto', system-ui, sans-serif;
        box-sizing: border-box;
        user-select: none;
        padding-bottom: 24px;
      }
      .fold-top-bar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 99999 !important;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 14px;
        background: rgba(14, 15, 22, 0.96);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 2px solid rgba(231, 63, 246, 0.55);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.8);
        box-sizing: border-box;
      }
      #fold-top-bar-spacer {
        width: 100%;
        height: 58px;
        flex-shrink: 0;
      }
      .fold-now-playing {
        font-size: 12px;
        font-weight: 800;
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.14);
        border: 1px solid rgba(251, 191, 36, 0.35);
        padding: 4px 10px;
        border-radius: 999px;
      }
      .fold-badge {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
      }
      .fold-badge.online { background: rgba(132, 220, 198, 0.18); color: #84dcc6; border: 1px solid rgba(132,220,198,0.4); }
      .fold-badge.offline { background: rgba(231, 63, 246, 0.2); color: #f0abfc; border: 1px solid rgba(231,63,246,0.4); }

      .fold-card {
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.11);
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: padding 0.15s ease;
      }
      .fold-card.collapsed {
        padding: 9px 14px;
        gap: 0;
        background: rgba(255,255,255,0.02);
      }
      .fold-card.collapsed .fold-card-body {
        display: none !important;
      }
      .fold-card-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .fold-card-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .fold-card-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        flex-wrap: wrap;
      }
      .fold-card-header h3 {
        margin: 0;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #fff;
      }
      .fold-panel-summary {
        font-size: 11px;
        font-weight: 700;
        color: #84dcc6;
        background: rgba(132, 220, 198, 0.12);
        padding: 2px 8px;
        border-radius: 6px;
      }
      .fold-collapse-btn {
        background: rgba(255,255,255,0.08);
        color: #e5e7eb;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 6px;
        padding: 4px 9px;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        min-height: 28px;
      }
      .fold-collapse-btn:hover {
        background: rgba(231, 63, 246, 0.22);
        border-color: #e73ff6;
      }
      .fold-btn-row {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        align-items: center;
      }
      .fold-btn {
        background: #252630;
        color: #f3f4f6;
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 8px;
        padding: 7px 11px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        min-height: 36px;
        touch-action: manipulation;
        transition: transform 0.08s ease, background 0.12s ease;
      }
      .fold-btn:active { transform: scale(0.95); }
      .fold-btn:disabled { opacity: 0.4; pointer-events: none; }
      .fold-btn.primary { background: #e73ff6; border-color: #e73ff6; color: #fff; }
      .fold-btn.primary.active { background: #f43f5e; border-color: #f43f5e; }
      .fold-btn.teal { background: #0d9488; border-color: #14b8a6; color: #fff; }
      .fold-btn.amber { background: #d97706; border-color: #f59e0b; color: #fff; }
      .fold-btn.rec { background: #991b1b; border-color: #ef4444; color: #fff; }
      .fold-btn.chip-on { background: #e73ff6; border-color: #f0abfc; color: #fff; box-shadow: 0 0 10px rgba(231,63,246,0.4); }

      .fold-select {
        background: #1a1b24;
        color: #fff;
        border: 1.5px solid #84dcc6;
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 700;
        min-height: 36px;
        cursor: pointer;
      }

      /* Artist Pills & Slow/Mid/Fast Song Cards */
      #fold-artist-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .fold-artist-pill {
        background: #1c1d26;
        border: 1.5px solid rgba(255,255,255,0.14);
        border-radius: 9px;
        padding: 7px 11px;
        color: #e5e7eb;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1px;
        touch-action: manipulation;
      }
      .fold-artist-pill .drummer-sub {
        font-size: 9px;
        font-weight: 500;
        color: #9ca3af;
      }
      .fold-artist-pill.active {
        background: rgba(231,63,246,0.22);
        border-color: #e73ff6;
        color: #fff;
        box-shadow: 0 0 12px rgba(231,63,246,0.35);
      }
      .fold-artist-pill.active .drummer-sub { color: #f0abfc; }

      #fold-artist-songs {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
        gap: 8px;
      }
      .fold-song-card {
        background: linear-gradient(155deg, #21222d, #161720);
        border: 1.5px solid rgba(255,255,255,0.14);
        border-radius: 10px;
        padding: 10px 12px;
        text-align: left;
        color: #e5e7eb;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        touch-action: manipulation;
      }
      .fold-song-card.active {
        background: linear-gradient(155deg, rgba(13,148,136,0.28), rgba(231,63,246,0.2));
        border: 2px solid #84dcc6;
        box-shadow: 0 0 14px rgba(132,220,198,0.3);
      }
      .song-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .song-tempo-tag {
        font-size: 10px;
        font-weight: 800;
        color: #fbbf24;
        background: rgba(251,191,36,0.14);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .song-active-badge {
        font-size: 10px;
        font-weight: 800;
        color: #84dcc6;
      }
      .song-title {
        font-size: 14px;
        font-weight: 800;
        color: #fff;
      }
      .song-desc {
        font-size: 11px;
        color: #9ca3af;
        line-height: 1.3;
      }

      /* Session Drummer Dials Grid */
      .fold-dials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
        gap: 10px;
        background: rgba(0,0,0,0.3);
        padding: 11px 13px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.08);
      }
      .fold-dial-box {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .fold-dial-box label {
        font-size: 11px;
        font-weight: 700;
        color: #e5e7eb;
        display: flex;
        justify-content: space-between;
      }
      .fold-dial-box label span.dial-val {
        color: #84dcc6;
        font-weight: 800;
      }
      .fold-dial-box input[type="range"] {
        width: 100%;
        accent-color: #e73ff6;
        height: 24px;
        cursor: pointer;
      }

      /* 4 Song Section Selector Tabs (Intro/Verse, Chorus, Bridge, Climax) */
      #fold-section-tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      .fold-sec-tab {
        background: linear-gradient(155deg, #21222d, #15161f);
        border: 1.5px solid rgba(255,255,255,0.14);
        border-top: 3.5px solid var(--sec-color, #84dcc6);
        border-radius: 10px;
        padding: 9px 11px;
        text-align: left;
        color: #e5e7eb;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        touch-action: manipulation;
        transition: transform 0.08s ease, box-shadow 0.14s ease;
      }
      .fold-sec-tab.active {
        background: rgba(255,255,255,0.09);
        border-color: var(--sec-color, #84dcc6);
        box-shadow: 0 0 14px rgba(132, 220, 198, 0.25);
      }
      .fold-sec-tab.playing-sec {
        box-shadow: 0 0 16px var(--sec-color, #e73ff6), inset 0 0 0 1px var(--sec-color, #e73ff6);
      }
      .sec-tab-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }
      .sec-tab-title {
        font-size: 12px;
        font-weight: 800;
        color: #fff;
      }
      .sec-tab-bars {
        font-size: 10px;
        font-weight: 800;
        color: #fbbf24;
        background: rgba(251,191,36,0.14);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .sec-tab-desc {
        font-size: 10px;
        color: #9ca3af;
        line-height: 1.25;
      }

      /* 16-Bar Mini-Map Strip */
      #fold-4bar-minimap {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 6px;
      }
      .fold-minimap-bar {
        background: rgba(0,0,0,0.32);
        border: 1.5px solid rgba(255,255,255,0.12);
        border-radius: 7px;
        padding: 5px 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .fold-minimap-bar.zoom-active {
        border-color: #e73ff6;
        background: rgba(231,63,246,0.14);
      }
      .fold-minimap-bar.playing-bar {
        border-color: #84dcc6;
        box-shadow: 0 0 10px rgba(132,220,198,0.45);
      }
      .minimap-top {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: #d1d5db;
      }
      .minimap-wave {
        display: grid;
        grid-template-columns: repeat(16, 1fr);
        gap: 1px;
        height: 16px;
        align-items: end;
      }
      .minimap-wave span {
        display: block;
        width: 100%;
        border-radius: 1px;
      }

      /* 64-Step Full 4-Bar Grid & 16-Step Zoomed Grid */
      #fold-sequencer-grid {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .drum-seq-64-wrapper {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 780px;
      }
      .drum-seq-row-64 {
        display: grid;
        grid-template-columns: 145px 1fr;
        gap: 8px;
        align-items: center;
      }
      .drum-bars-4-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 7px;
      }
      .bar-banner {
        background: rgba(255,255,255,0.06);
        color: #d1d5db;
        font-size: 10px;
        font-weight: 800;
        text-align: center;
        padding: 4px;
        border-radius: 5px;
      }
      .bar-banner.fill-bar {
        background: rgba(231,63,246,0.18);
        color: #f0abfc;
      }
      .drum-bar-16-subgrid {
        display: grid;
        grid-template-columns: repeat(16, 1fr);
        gap: 2px;
        background: rgba(0,0,0,0.28);
        padding: 3px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.08);
      }
      .drum-step-cell.compact64 {
        height: 30px;
        border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.07);
      }
      .drum-step-cell.compact64.beat-start {
        border-left: 1.5px solid rgba(255,255,255,0.28);
      }
      .sub-badge-mini {
        font-size: 8px;
        font-weight: 900;
        color: #000;
        background: rgba(255,255,255,0.88);
        padding: 0 2px;
        border-radius: 2px;
        pointer-events: none;
      }

      /* 1-Bar Zoomed Grid */
      .drum-seq-header-row, .drum-seq-row {
        display: grid;
        grid-template-columns: 155px minmax(420px, 1fr);
        gap: 8px;
        align-items: center;
        margin-bottom: 4px;
      }
      .drum-seq-row.muted, .drum-seq-row-64.muted { opacity: 0.4; }
      .drum-lane-controls-header {
        font-size: 10px;
        font-weight: 800;
        color: #9ca3af;
      }
      .drum-lane-info {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .drum-voice-btn {
        flex: 1;
        background: #1c1d24;
        color: #f3f4f6;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px;
        padding: 5px 6px;
        font-size: 11px;
        font-weight: 800;
        text-align: left;
        cursor: pointer;
        min-height: 30px;
      }
      .drum-mini-ctrl {
        background: #23242d;
        color: #d1d5db;
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 5px;
        padding: 4px 6px;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        min-height: 28px;
      }
      .drum-mini-ctrl.muted-on { background: #dc2626; color: #fff; }
      .drum-steps-row {
        display: grid;
        grid-template-columns: repeat(16, 1fr);
        gap: 4px;
      }
      .drum-step-num {
        text-align: center;
        font-size: 10px;
        color: #6b7280;
        font-weight: 600;
      }
      .drum-step-num.beat { color: #e5e7eb; font-weight: 800; }
      .drum-step-cell {
        position: relative;
        height: 38px;
        border-radius: 6px;
        background: #181920;
        border: 1px solid rgba(255,255,255,0.1);
        cursor: pointer;
        touch-action: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .drum-step-cell.alt-group { background: #20222b; }
      .drum-step-cell.on.normal { opacity: 0.88; }
      .drum-step-cell.on.accent {
        opacity: 1;
        box-shadow: 0 0 6px rgba(255,255,255,0.45), inset 0 0 0 1px #fff;
      }
      .drum-step-cell.on.ghost {
        opacity: 0.46;
        transform: scaleY(0.65);
      }
      .drum-step-cell.playhead {
        outline: 2px solid #84dcc6;
        outline-offset: 1px;
        z-index: 2;
      }
      .sub-badge {
        font-size: 9px;
        font-weight: 900;
        color: #000;
        background: rgba(255,255,255,0.9);
        padding: 1px 3px;
        border-radius: 3px;
        pointer-events: none;
      }

      /* Finger Drum Pads */
      .fold-pads-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      .fold-drum-pad {
        height: 62px;
        border-radius: 10px;
        background: linear-gradient(145deg, #252733, #191a22);
        border: 2px solid rgba(255,255,255,0.15);
        color: #fff;
        font-weight: 800;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        cursor: pointer;
        touch-action: none;
      }
      .fold-drum-pad span.sub-note { font-size: 10px; color: #9ca3af; font-weight: 500; }
      .fold-drum-pad.pressed {
        transform: scale(0.95);
        background: rgba(231,63,246,0.32);
        box-shadow: 0 0 16px rgba(231,63,246,0.6);
      }
      @media (max-width: 780px) {
        #fold-section-tabs { grid-template-columns: repeat(2, 1fr); }
        #fold-4bar-minimap { grid-template-columns: repeat(4, 1fr); }
      }
    `;
    document.head.appendChild(style);

    const dock = document.createElement('section');
    dock.id = 'fold-studio-dock';
    dock.innerHTML = `
      <!-- Pinned Top Transport Bar -->
      <div class="fold-top-bar" id="fold-top-bar">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <strong style="font-size:14px;color:#fff;">🥁 Session Drummer</strong>
          <span id="fold-now-playing-pill" class="fold-now-playing">🔨 Led Zeppelin — When the Levee Breaks (71 BPM · 🟢 SEC 1)</span>
          <span id="fold-conn-badge" class="fold-badge online">🟢 Ready</span>
        </div>
        <div class="fold-btn-row">
          <button id="fold-play-phone-btn" class="fold-btn primary">▶ Play 16-Bar Song on Phone</button>
          <button id="fold-send-ableton-btn" class="fold-btn teal">🚀 Play in Ableton (16-Bar Song)</button>
          <button id="fold-split-scenes-btn" class="fold-btn amber" title="Write Intro/Verse, Chorus, Bridge, and Climax as 4 separate clips in Ableton Scenes 1–4">🎛️ Split 4 Sections → Ableton Scenes 1–4</button>
          <button id="fold-download-midi-btn" class="fold-btn">⬇ .mid</button>
          <button id="fold-collapse-all-btn" class="fold-btn" title="Collapse or Expand All Panels">↕ Collapse All</button>
          <button id="fold-install-btn" class="fold-btn amber" style="display:none;">📲 Install App</button>
        </div>
      </div>
      <div id="fold-top-bar-spacer"></div>

      <!-- ================================================================ -->
      <!-- 1. ARTIST BAND SELECTOR + 5 ICONIC GROOVES AT ORIGINAL BPM       -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-artists">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap" data-toggle-card="card-artists">
            <h3>🎸 1. Band / Drummer & Song Groove (18 Artists · 90 Songs · 16-Bar Arrangements)</h3>
            <span id="fold-summary-artist" class="fold-panel-summary">🔨 Led Zeppelin · When the Levee Breaks (71 BPM · 16 Bars)</span>
          </div>
          <div class="fold-btn-row">
            <button class="fold-collapse-btn" data-toggle-card="card-artists">▼ Collapse</button>
          </div>
        </div>
        <div class="fold-card-body">
          <!-- 18 Artist Pills -->
          <div id="fold-artist-tabs"></div>
          <!-- 5 Song Grooves for Selected Artist -->
          <div id="fold-artist-songs"></div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- 2. SESSION DRUMMER DIALS & SWAPPABLE DRUM KIT                    -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-dials">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap" data-toggle-card="card-dials">
            <h3>🎛️ 2. Session Drummer Dials & Swappable Drum Kit</h3>
            <span id="fold-summary-dials" class="fold-panel-summary">Intensity 70% · Swing 8% · Fill 65%</span>
          </div>
          <div class="fold-btn-row">
            <label for="fold-kit-select" style="font-size:11px;font-weight:800;color:#84dcc6;">SWAP KIT:</label>
            <select id="fold-kit-select" class="fold-select">
              ${DRUM_KITS.map((k) => `<option value="${k.id}">${k.name}</option>`).join('')}
            </select>
            <button class="fold-collapse-btn" data-toggle-card="card-dials">▼ Collapse</button>
          </div>
        </div>
        <div class="fold-card-body">
          <div class="fold-dials-grid">
            <div class="fold-dial-box">
              <label><span>🔥 Drummer Intensity</span><span id="val-intensity" class="dial-val">70%</span></label>
              <input id="dial-intensity" type="range" min="10" max="100" step="5" value="70">
            </div>
            <div class="fold-dial-box">
              <label><span>👻 Ghost Notes & Pocket</span><span id="val-ghost" class="dial-val">45%</span></label>
              <input id="dial-ghost" type="range" min="0" max="100" step="5" value="45">
            </div>
            <div class="fold-dial-box">
              <label><span>🎩 Hat & Cymbal Energy</span><span id="val-hats" class="dial-val">60%</span></label>
              <input id="dial-hats" type="range" min="10" max="100" step="5" value="60">
            </div>
            <div class="fold-dial-box">
              <label><span>🥁 Section Turnaround Fills</span><span id="val-fill" class="dial-val">65%</span></label>
              <input id="dial-fill" type="range" min="0" max="100" step="5" value="65">
            </div>
            <div class="fold-dial-box">
              <label><span>🕰️ MPC 16th Swing</span><span id="val-swing" class="dial-val">8%</span></label>
              <input id="dial-swing" type="range" min="0" max="65" step="1" value="8">
            </div>
            <div class="fold-dial-box">
              <label><span>🍯 Snare Layback / Humanize</span><span id="val-pocket" class="dial-val">25%</span></label>
              <input id="dial-pocket" type="range" min="0" max="100" step="2" value="25">
            </div>
            <div class="fold-dial-box">
              <label><span>⏱️ Tempo (BPM)</span><span id="val-bpm" class="dial-val">71 BPM</span></label>
              <input id="dial-bpm" type="range" min="50" max="200" step="1" value="71">
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- 3. 16-BAR (4-SECTION) SONG ARRANGEMENT & MULTI-VIEW SEQUENCER    -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-sequencer">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap" data-toggle-card="card-sequencer">
            <h3>📊 3. 16-Bar Song Arrangement (4 Song Sections · 256 Steps)</h3>
            <span id="fold-summary-seq" class="fold-panel-summary">Intro / Verse (Bars 1–4) · Loop: 16 Bars</span>
          </div>
          <div class="fold-btn-row">
            <button id="fold-view-sec4-btn" class="fold-btn chip-on">🔭 4-Bar Section (🟢 SEC 1: Bars 1–4)</button>
            <button id="fold-view-all16-btn" class="fold-btn">📚 All 16 Bars Stacked (256 Steps)</button>
            <button id="fold-view-zoom1-btn" class="fold-btn">🔍 Zoom 1 Bar (Bar 1 of 16)</button>
            <button id="fold-copy-bar-btn" class="fold-btn" style="display:none;">📋 Copy Bar 1 → Section</button>
            <button id="fold-reset-groove-btn" class="fold-btn" title="Restore factory 16-bar song pattern">🔄 Reset Groove</button>
            <button id="fold-undo-btn" class="fold-btn" disabled>↩ Undo</button>
            <button id="fold-clear-all-btn" class="fold-btn">🗑️ Clear</button>
            <button class="fold-collapse-btn" data-toggle-card="card-sequencer">▼ Collapse</button>
          </div>
        </div>
        <div class="fold-card-body">
          <!-- 4 Song Section Cards: Intro/Verse, Chorus/Hook, Bridge/Break, Climax/Fill -->
          <div id="fold-section-tabs"></div>

          <!-- Loop Mode & Playhead Follow Controls -->
          <div class="fold-btn-row" style="justify-content:space-between;background:rgba(0,0,0,0.26);padding:7px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
            <div class="fold-btn-row">
              <span style="font-size:11px;font-weight:800;color:#84dcc6;">LOOP RANGE:</span>
              <button class="fold-btn chip-on" data-loop-mode="all16">🔁 Full 16-Bar Song (Bars 1–16)</button>
              <button class="fold-btn" data-loop-mode="bars8">🔁 8 Bars (Verse + Chorus, Bars 1–8)</button>
              <button class="fold-btn" data-loop-mode="section4">🔒 Lock Active 4-Bar Section Only</button>
            </div>
            <div class="fold-btn-row">
              <button id="fold-autofollow-btn" class="fold-btn chip-on">👁️ Auto-Follow Playhead: ON</button>
            </div>
          </div>

          <!-- 16-Bar Mini-Map -->
          <div id="fold-4bar-minimap"></div>

          <div class="fold-btn-row">
            <span style="font-size:11px;font-weight:800;color:#9ca3af;">STEP BRUSH:</span>
            <button class="fold-btn chip-on" data-brush="normal">● Normal</button>
            <button class="fold-btn" data-brush="accent">🔥 Accent</button>
            <button class="fold-btn" data-brush="ghost">👻 Ghost</button>
            <button class="fold-btn" data-brush="roll2">⚡ 32nd Roll (2x)</button>
            <button class="fold-btn" data-brush="roll3">⚡ Triplet Roll (3x)</button>
          </div>

          <div id="fold-sequencer-grid"></div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- 4. PLAY-ALONG FINGER DRUM PADS & NOTE REPEAT                     -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-pads">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap" data-toggle-card="card-pads">
            <h3>🖐️ 4. Play-Along Finger Pads (Uses Selected Drum Kit!)</h3>
          </div>
          <div class="fold-btn-row">
            <span style="font-size:11px;font-weight:700;color:#9ca3af;">HOLD REPEAT:</span>
            <button class="fold-btn chip-on" data-repeat="0">Off</button>
            <button class="fold-btn" data-repeat="0.5">1/8</button>
            <button class="fold-btn" data-repeat="0.25">1/16</button>
            <button class="fold-btn" data-repeat="0.1667">1/16T</button>
            <button class="fold-btn" data-repeat="0.125">1/32 Roll</button>
            <button id="fold-overdub-btn" class="fold-btn">⏺ Record Pads into Loop: OFF</button>
            <button class="fold-collapse-btn" data-toggle-card="card-pads">▼ Collapse</button>
          </div>
        </div>
        <div class="fold-card-body">
          <div id="fold-mpc-pads" class="fold-pads-grid">
            ${DRUM_VOICES.map(
              (v, idx) => `
              <div class="fold-drum-pad" data-pad-idx="${idx}" style="border-bottom: 4px solid ${v.color};">
                <span>${v.name}</span>
                <span class="sub-note">Play Along / Overdub</span>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(dock);

    // Keep #fold-top-bar-spacer exact height synced with fixed #fold-top-bar
    const topBarEl = document.getElementById('fold-top-bar');
    const topSpacerEl = document.getElementById('fold-top-bar-spacer');
    const syncTopBarSpacer = () => {
      if (topBarEl && topSpacerEl) {
        topSpacerEl.style.height = `${Math.max(54, topBarEl.offsetHeight + 4)}px`;
      }
    };
    syncTopBarSpacer();
    if (typeof ResizeObserver !== 'undefined' && topBarEl) {
      new ResizeObserver(syncTopBarSpacer).observe(topBarEl);
    }
    window.addEventListener('resize', syncTopBarSpacer);

    // ========================================================================
    // Wire Up Collapsible Panels & Collapse/Expand All
    // ========================================================================
    function setCardCollapsed(cardEl, collapsed) {
      if (!cardEl) return;
      cardEl.classList.toggle('collapsed', collapsed);
      const cardId = cardEl.id;
      dock.querySelectorAll(`.fold-collapse-btn[data-toggle-card="${cardId}"]`).forEach((btn) => {
        btn.textContent = collapsed ? '▶ Expand' : '▼ Collapse';
      });
    }

    dock.querySelectorAll('[data-toggle-card]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = el.getAttribute('data-toggle-card');
        const cardEl = document.getElementById(cardId);
        if (cardEl) {
          setCardCollapsed(cardEl, !cardEl.classList.contains('collapsed'));
        }
      });
    });

    document.getElementById('fold-collapse-all-btn').addEventListener('click', (e) => {
      const cards = Array.from(dock.querySelectorAll('.fold-card'));
      const anyExpanded = cards.some((c) => !c.classList.contains('collapsed'));
      cards.forEach((c) => setCardCollapsed(c, anyExpanded));
      e.currentTarget.textContent = anyExpanded ? '↕ Expand All' : '↕ Collapse All';
    });

    // ========================================================================
    // Wire Up Controls
    // ========================================================================
    document.getElementById('fold-play-phone-btn').addEventListener('click', () => {
      if (state.phonePlayer.playing) stopPhonePlayback();
      else startPhonePlayback();
    });

    document.getElementById('fold-send-ableton-btn').addEventListener('click', () => {
      sendCurrentBeatToAbleton(true);
    });

    document.getElementById('fold-split-scenes-btn').addEventListener('click', () => {
      sendSplitSectionsToAbletonScenes();
    });

    document.getElementById('fold-kit-select').addEventListener('change', (e) => {
      state.kitId = e.target.value;
      syncSequencerNotes();
      updateHeaderSummaries();
      if (!state.phonePlayer.playing) {
        const ctx = getAudioCtx();
        triggerDrumVoice(ctx, 36, 118, ctx.currentTime);
        triggerDrumVoice(ctx, 38, 115, ctx.currentTime + 0.18);
      }
    });

    document.getElementById('dial-intensity').addEventListener('input', (e) => {
      state.intensityPct = Number(e.target.value);
      document.getElementById('val-intensity').textContent = `${state.intensityPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-ghost').addEventListener('input', (e) => {
      state.ghostPct = Number(e.target.value);
      document.getElementById('val-ghost').textContent = `${state.ghostPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-hats').addEventListener('input', (e) => {
      state.hatEnergyPct = Number(e.target.value);
      document.getElementById('val-hats').textContent = `${state.hatEnergyPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-fill').addEventListener('input', (e) => {
      state.fillPct = Number(e.target.value);
      document.getElementById('val-fill').textContent = `${state.fillPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-swing').addEventListener('input', (e) => {
      state.swingPct = Number(e.target.value);
      document.getElementById('val-swing').textContent = `${state.swingPct}%`;
      updateHeaderSummaries();
      syncSequencerNotes();
    });

    document.getElementById('dial-pocket').addEventListener('input', (e) => {
      state.pocketPct = Number(e.target.value);
      document.getElementById('val-pocket').textContent = `${state.pocketPct}%`;
      updateHeaderSummaries();
      syncSequencerNotes();
    });

    document.getElementById('dial-bpm').addEventListener('input', async (e) => {
      state.tempo = Number(e.target.value);
      document.getElementById('val-bpm').textContent = `${state.tempo} BPM`;
      updateHeaderSummaries();
      await sendOsc('/live/song/set/tempo', [{ type: 'f', value: state.tempo }], false);
    });

    document.getElementById('fold-view-sec4-btn').addEventListener('click', () => {
      state.viewMode = 'section4';
      updateViewModeButtons();
      renderMini4BarMap();
      renderSequencerGrid();
    });

    document.getElementById('fold-view-all16-btn').addEventListener('click', () => {
      state.viewMode = 'all16';
      updateViewModeButtons();
      renderMini4BarMap();
      renderSequencerGrid();
    });

    document.getElementById('fold-view-zoom1-btn').addEventListener('click', () => {
      if (state.viewMode === 'zoom1') {
        state.zoomedBar = (state.zoomedBar + 1) % TOTAL_BARS;
        state.activeSection = Math.floor(state.zoomedBar / 4);
      } else {
        state.viewMode = 'zoom1';
        state.zoomedBar = state.activeSection * 4;
      }
      updateViewModeButtons();
      renderSectionTabs();
      renderMini4BarMap();
      renderSequencerGrid();
    });

    dock.querySelectorAll('[data-loop-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.loopMode = btn.getAttribute('data-loop-mode');
        if (state.phonePlayer.playing) {
          const ctx = getAudioCtx();
          state.phonePlayer.startWallTime = ctx.currentTime + 0.01;
          state.phonePlayer.lastStepTime = -0.001;
        }
        updatePlayerButtons();
        updateViewModeButtons();
        updateHeaderSummaries();
      });
    });

    document.getElementById('fold-autofollow-btn').addEventListener('click', () => {
      state.autoFollowSection = !state.autoFollowSection;
      updateViewModeButtons();
    });

    document.getElementById('fold-copy-bar-btn').addEventListener('click', () => {
      pushUndoState();
      const srcStart = state.zoomedBar * 16;
      const secStartBar = state.activeSection * 4;
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        for (let b = secStartBar; b < secStartBar + 4; b++) {
          if (b === state.zoomedBar) continue;
          for (let i = 0; i < 16; i++) {
            state.grid[v][b * 16 + i] = { ...state.grid[v][srcStart + i] };
          }
        }
      }
      syncSequencerNotes();
      renderSequencerGrid();
    });

    document.getElementById('fold-undo-btn').addEventListener('click', (e) => {
      if (state.undoHistory.length > 0) {
        state.grid = state.undoHistory.pop();
        if (state.undoHistory.length === 0) e.currentTarget.disabled = true;
        syncSequencerNotes();
        renderSequencerGrid();
      }
    });

    document.getElementById('fold-clear-all-btn').addEventListener('click', () => {
      pushUndoState();
      const secStart = state.activeSection * 64;
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        for (let s = secStart; s < secStart + 64; s++) {
          state.grid[v][s] = { state: 0, sub: 1 };
        }
      }
      syncSequencerNotes();
      renderSequencerGrid();
    });

    document.getElementById('fold-reset-groove-btn').addEventListener('click', () => {
      pushUndoState();
      loadSongGroove(state.selectedSongId, true);
    });

    document.getElementById('fold-conn-badge').addEventListener('click', () => {
      configureStudioBridgeUrl();
    });
    document.getElementById('fold-conn-badge').style.cursor = 'pointer';

    dock.querySelectorAll('[data-brush]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.brushMode = btn.getAttribute('data-brush');
        dock.querySelectorAll('[data-brush]').forEach((b) => b.classList.remove('chip-on'));
        btn.classList.add('chip-on');
      });
    });

    document.getElementById('fold-download-midi-btn').addEventListener('click', () => {
      const { startStep, endStep, barsCount, durationBeats } = getActiveLoopStepBounds();
      const notes = buildNotesFromSequencer(startStep, endStep);
      const blob = buildMidiBlob(notes, durationBeats, state.tempo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SessionDrummer_${state.selectedSongId}_${state.tempo}bpm_${barsCount}Bars.mid`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    document.getElementById('fold-overdub-btn').addEventListener('click', (e) => {
      state.overdubRecord = !state.overdubRecord;
      e.currentTarget.textContent = `⏺ Record Pads into Loop: ${state.overdubRecord ? 'ON' : 'OFF'}`;
      e.currentTarget.classList.toggle('rec', state.overdubRecord);
    });

    dock.querySelectorAll('[data-repeat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.noteRepeatRate = Number(btn.getAttribute('data-repeat'));
        dock.querySelectorAll('[data-repeat]').forEach((b) => b.classList.remove('chip-on'));
        btn.classList.add('chip-on');
      });
    });

    dock.querySelectorAll('.fold-drum-pad').forEach((padEl) => {
      const vIdx = Number(padEl.getAttribute('data-pad-idx'));
      padEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        startPadPress(vIdx, padEl);
      });
      padEl.addEventListener('pointerup', () => stopPadPress(vIdx, padEl));
      padEl.addEventListener('pointerleave', () => stopPadPress(vIdx, padEl));
      padEl.addEventListener('pointercancel', () => stopPadPress(vIdx, padEl));
    });

    document.getElementById('fold-install-btn').addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
      }
    });

    // Restore persisted PWA state from localStorage or load Led Zeppelin ("When the Levee Breaks") by default!
    if (loadPersistedState()) {
      syncSequencerNotes();
      renderArtistTabsAndSongs();
      renderSectionTabs();
      renderMini4BarMap();
      renderSequencerGrid();
      updateDialsUI();
      updatePlayerButtons();
    } else {
      loadSongGroove('zep_levee', true);
    }
    updateViewModeButtons();
    refreshAbletonStatus();
    setInterval(refreshAbletonStatus, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(mountFoldDock, 40));
  } else {
    setTimeout(mountFoldDock, 40);
  }
})();
