/**
 * Session Drummer ("sessh") — 16-Bar (4-Section) Artist Groove Workstation PWA
 * 18 Legendary Artists × 90 Iconic Song Arrangements + 18 Swappable Drum Kits
 * Runs 100% Standalone Offline (GitHub Pages PWA) + Optional Ableton Live 12 Studio Bridge
 */
(function () {
  function isStandaloneApp() {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true
    );
  }

  if ('serviceWorker' in navigator) {
    const registerSw = () => {
      navigator.serviceWorker
        .register('./sw.js', { scope: './', updateViaCache: 'none' })
        .then((reg) => {
          try {
            reg.update();
          } catch (_) {}
        })
        .catch(() => {});
    };
    if (document.readyState === 'complete') {
      registerSw();
    } else {
      window.addEventListener('load', registerSw, { once: true });
    }
  }

  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('fold-install-btn');
    if (btn && !isStandaloneApp()) {
      btn.style.display = 'inline-flex';
      btn.textContent = '📲 Install App';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const btn = document.getElementById('fold-install-btn');
    if (btn) btn.style.display = 'none';
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
      id: 'tameimpala',
      name: '🌀 Parker DBX-165A Crushed Ludwigs (Tame Impala)',
      kickStart: 156, kickEnd: 44, kickDecay: 0.28, kickClick: 0.56,
      snareTone: 208, snareHp: 390, snareDecay: 0.17, rimMix: 1.25,
      hatHp: 6400, hatDecay: 0.052, openHatDecay: 0.34, tomBase: 118, laybackMs: 6
    },
    {
      id: 'paulsimon',
      name: '🌍 Steve Gadd Studio Custom & Graceland Kit (Paul Simon)',
      kickStart: 146, kickEnd: 47, kickDecay: 0.25, kickClick: 0.48,
      snareTone: 194, snareHp: 360, snareDecay: 0.15, rimMix: 1.48,
      hatHp: 6800, hatDecay: 0.044, openHatDecay: 0.27, tomBase: 108, laybackMs: 3
    },
    {
      id: 'nirvana',
      name: '🧷 Sound City Tama Granstar / Albini Room Kit (Nirvana / Dave Grohl)',
      kickStart: 168, kickEnd: 43, kickDecay: 0.36, kickClick: 0.66,
      snareTone: 184, snareHp: 230, snareDecay: 0.29, rimMix: 1.1,
      hatHp: 5100, hatDecay: 0.082, openHatDecay: 0.44, tomBase: 88, laybackMs: 2
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
    },
    {
      artistId: 'tameimpala',
      artistName: '🌀 Tame Impala',
      drummer: 'Kevin Parker (DBX-165A Psych-Disco Pocket)',
      defaultKit: 'tameimpala',
      songs: [
        {
          id: 'ti_letithappen',
          title: 'Let It Happen',
          bpm: 125,
          swing: 12,
          kit: 'tameimpala',
          desc: 'Hypnotic 7-minute psych-disco odyssey: DBX-165A squashed Ludwig kick/snare, crisp handclaps, and relentless 16th hi-hat propulsion',
          kicks: [0, 3, 6, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 12, 15],
          rims: [2, 10],
          claps: [4, 12],
          ghostSnares: [1, 7, 9, 15],
          openHats: [2, 14],
          tomsBar2: [13, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'kevin_parker'
        },
        {
          id: 'ti_lessiknow',
          title: 'The Less I Know the Better',
          bpm: 117,
          swing: 16,
          kit: 'tameimpala',
          desc: 'Iconic Currents disco-funk strut locking with the fuzz-bass riff, tight snare+clap backbeat, and barking open hi-hats on 2-& and 4-&',
          kicks: [0, 4, 7, 8, 10, 12],
          kicksBar2: [0, 3, 4, 7, 8, 10, 12, 14],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [4, 12],
          ghostSnares: [1, 9, 15],
          openHats: [6, 14],
          tomsBar2: [11, 13, 14],
          hatMode: '16th_funk',
          fillStyle: 'kevin_parker'
        },
        {
          id: 'ti_elephant',
          title: 'Elephant',
          bpm: 123,
          swing: 28,
          kit: 'tameimpala',
          desc: 'Heavy Lonerism glam-psych shuffle stomp with swung kicks, sloshy open hats, and signature Kevin Parker flanged tom-roll turnarounds',
          kicks: [0, 3, 6, 8, 11, 14],
          kicksBar2: [0, 2, 3, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 7, 12, 15],
          rims: [],
          claps: [],
          ghostSnares: [2, 7, 10, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [6, 7, 13, 14, 15],
          hatMode: '8th_rock',
          fillStyle: 'kevin_parker'
        },
        {
          id: 'ti_backwards',
          title: 'Feels Like We Only Go Backwards',
          bpm: 76,
          swing: 18,
          kit: 'tameimpala',
          desc: 'Dreamy Lonerism psych-soul sway with booming tape-saturated snare cracks, lazy kick pickups, and constant tumbling tom fills',
          kicks: [0, 2, 7, 8, 10, 15],
          kicksBar2: [0, 2, 6, 7, 8, 10, 14, 15],
          snares: [4, 12],
          snaresBar2: [4, 12, 15],
          rims: [6, 14],
          claps: [4, 12],
          ghostSnares: [1, 5, 9, 13, 15],
          openHats: [6, 14],
          tomsBar2: [11, 12, 13, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'kevin_parker'
        },
        {
          id: 'ti_borderline',
          title: 'Borderline',
          bpm: 98,
          swing: 14,
          kit: 'tameimpala',
          desc: 'Modern yacht-disco groove from The Slow Rush with syncopated bongo/rim counter-rhythm, punchy four-on-the-floor lift & crisp claps',
          kicks: [0, 3, 6, 8, 10, 14],
          kicksBar2: [0, 4, 6, 8, 10, 12, 14],
          snares: [4, 12],
          rims: [2, 6, 11, 14],
          claps: [4, 12],
          ghostSnares: [1, 7, 9, 15],
          openHats: [2, 10, 14],
          tomsBar2: [12, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'kevin_parker'
        }
      ]
    },
    {
      artistId: 'paulsimon',
      artistName: '🌍 Paul Simon',
      drummer: 'Steve Gadd, Isaac Mtshali & Bakithi Kumalo',
      defaultKit: 'paulsimon',
      songs: [
        {
          id: 'ps_50ways',
          title: '50 Ways to Leave Your Lover',
          bpm: 101,
          swing: 14,
          kit: 'paulsimon',
          desc: 'Steve Gadd’s immortal linear drum groove: military paradiddle ostinato between inverted hi-hat, snare ghost notes & floor tom opening to Chorus backbeat',
          kicks: [0, 3, 6, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 14],
          snares: [4, 12],
          snaresBar2: [4, 7, 12, 15],
          rims: [1, 3, 6, 9, 11, 14],
          claps: [],
          ghostSnares: [1, 2, 5, 7, 9, 10, 13, 15],
          openHats: [2, 10],
          tomsBar2: [7, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'steve_gadd'
        },
        {
          id: 'ps_callmeal',
          title: 'You Can Call Me Al',
          bpm: 128,
          swing: 10,
          kit: 'paulsimon',
          desc: 'Joyous Graceland township jive / mbaqanga bounce with Isaac Mtshali’s propulsive kick/snare pocket, crisp rim clicks & talking-drum tom accents',
          kicks: [0, 4, 7, 8, 10, 12, 14],
          kicksBar2: [0, 3, 4, 7, 8, 10, 12, 14, 15],
          snares: [4, 12],
          rims: [2, 6, 10, 14],
          claps: [4, 12],
          ghostSnares: [1, 5, 9, 13, 15],
          openHats: [6, 14],
          tomsBar2: [3, 6, 11, 14],
          hatMode: '16th_funk',
          fillStyle: 'steve_gadd'
        },
        {
          id: 'ps_lateintheevening',
          title: 'Late in the Evening',
          bpm: 118,
          swing: 16,
          kit: 'paulsimon',
          desc: 'Steve Gadd playing with 4 drumsticks (2 in each hand!) to weave a legendary Mozambique/salsa cowbell, rack-tom & snare polyrhythm',
          kicks: [0, 3, 6, 10, 14],
          kicksBar2: [0, 3, 6, 7, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 9, 12, 15],
          rims: [0, 2, 5, 7, 10, 12, 15],
          claps: [4, 12],
          ghostSnares: [1, 5, 9, 13, 15],
          openHats: [2, 10],
          tomsBar2: [3, 6, 11, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'steve_gadd'
        },
        {
          id: 'ps_graceland',
          title: 'Graceland',
          bpm: 119,
          swing: 12,
          kit: 'paulsimon',
          desc: 'Rolling South African train-beat country-jive shuffle with cross-stick rim+snare backbeat, melodic tom pickups & shimmering 16th hats',
          kicks: [0, 3, 8, 11],
          kicksBar2: [0, 3, 6, 8, 11, 14],
          snares: [4, 12],
          rims: [2, 4, 6, 10, 12, 14],
          claps: [],
          ghostSnares: [1, 5, 7, 9, 13, 15],
          openHats: [14],
          tomsBar2: [6, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'steve_gadd'
        },
        {
          id: 'ps_diamonds',
          title: 'Diamonds on the Soles of Her Shoes',
          bpm: 112,
          swing: 14,
          kit: 'paulsimon',
          desc: 'Afro-pop rhythm showcase: intricate Intro/Verse rim, shaker & talking-drum interplay erupting into the full horn-section groove',
          kicks: [0, 3, 6, 8, 11, 14],
          kicksBar2: [0, 3, 6, 8, 10, 11, 14, 15],
          snares: [4, 12],
          rims: [2, 3, 6, 10, 11, 14],
          claps: [4, 12],
          ghostSnares: [1, 7, 9, 15],
          openHats: [2, 10, 14],
          tomsBar2: [3, 6, 7, 13, 14, 15],
          hatMode: '16th_funk',
          fillStyle: 'steve_gadd'
        }
      ]
    },
    {
      artistId: 'nirvana',
      artistName: '🧷 Nirvana',
      drummer: 'Dave Grohl (Sound City / In Utero Thunder)',
      defaultKit: 'nirvana',
      songs: [
        {
          id: 'nir_teenspirit',
          title: 'Smells Like Teen Spirit',
          bpm: 117,
          swing: 0,
          kit: 'nirvana',
          desc: 'Dave Grohl’s immortal Sound City Gap-Band-inspired disco-punk stomp: tight bassline Verse exploding into sloshy Chorus crashes & 16th snare launch fills',
          kicks: [0, 2, 6, 8, 11, 14],
          kicksBar2: [0, 2, 3, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 7, 10, 12, 15],
          rims: [],
          claps: [],
          ghostSnares: [7, 10, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [12, 13, 14, 15],
          hatMode: '8th_rock',
          fillStyle: 'dave_grohl'
        },
        {
          id: 'nir_inbloom',
          title: 'In Bloom',
          bpm: 79,
          swing: 4,
          kit: 'nirvana',
          desc: 'Colossal half-time sludge-grunge stomp with 24" kick pairs, 8x14" Tama Birch "Terminator" snare flams, and thunderous 18" floor-tom turnarounds',
          kicks: [0, 2, 7, 8, 10],
          kicksBar2: [0, 2, 6, 7, 8, 10, 14],
          snares: [4, 12],
          snaresBar2: [4, 12, 15],
          rims: [],
          claps: [],
          ghostSnares: [5, 11, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [6, 7, 13, 14, 15],
          hatMode: '8th_rock',
          fillStyle: 'dave_grohl'
        },
        {
          id: 'nir_comeasyouare',
          title: 'Come as You Are',
          bpm: 120,
          swing: 0,
          kit: 'nirvana',
          desc: 'Driving watery Chorus-pedal grunge groove: hypnotic kick lock with Krist Novoselic’s bass riff, steady ride/hat pulse & explosive Chorus crashes',
          kicks: [0, 2, 8, 10, 14],
          kicksBar2: [0, 2, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 12, 15],
          rims: [],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [6, 14],
          tomsBar2: [12, 14, 15],
          hatMode: '8th_rock',
          fillStyle: 'dave_grohl'
        },
        {
          id: 'nir_heartshapedbox',
          title: 'Heart-Shaped Box',
          bpm: 101,
          swing: 4,
          kit: 'nirvana',
          desc: 'Steve Albini In Utero room-mic dynamics: restrained brooding Verse pocket erupting into mammoth Chorus crashes and flam-snare/floor-tom cascades',
          kicks: [0, 6, 8, 10, 14],
          kicksBar2: [0, 3, 6, 8, 10, 11, 14],
          snares: [4, 12],
          snaresBar2: [4, 7, 12, 15],
          rims: [4, 12],
          claps: [],
          ghostSnares: [7, 15],
          openHats: [2, 6, 10, 14],
          tomsBar2: [11, 12, 14, 15],
          hatMode: '8th_rock',
          fillStyle: 'dave_grohl'
        },
        {
          id: 'nir_scentless',
          title: 'Scentless Apprentice',
          bpm: 89,
          swing: 6,
          kit: 'nirvana',
          desc: 'Dave Grohl’s monstrous Bonham-inspired main drum riff from In Utero: rapid double-kick pairs slamming into cracking snare and open-hat barks',
          kicks: [0, 1, 6, 7, 8, 9, 14],
          kicksBar2: [0, 1, 6, 7, 8, 9, 11, 14, 15],
          snares: [4, 12],
          snaresBar2: [4, 12, 15],
          rims: [],
          claps: [],
          ghostSnares: [3, 11, 15],
          openHats: [2, 4, 10, 12, 14],
          tomsBar2: [12, 13, 14, 15],
          hatMode: '8th_rock',
          fillStyle: 'dave_grohl'
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
  // 4B. 21 Swappable Bass Rigs & Artist Bassist Profiles (WebAudio + MIDI)
  // ==========================================================================
  const BASS_KITS = [
    {
      id: 'jpj_jazz',
      name: "🔨 John Paul Jones '62 Fender Jazz Bass (Led Zeppelin)",
      oscType: 'sawtooth', subMix: 0.78, cutoffBase: 420, cutoffEnv: 1150, resonance: 2.2, decay: 0.38, drive: 0.28
    },
    {
      id: 'bootsy_funk',
      name: '👑 Bootsy Space-Funk & One-Drop P-Bass (James Brown)',
      oscType: 'sawtooth', subMix: 0.72, cutoffBase: 520, cutoffEnv: 1850, resonance: 4.2, decay: 0.28, drive: 0.32
    },
    {
      id: 'prince_synth',
      name: '☔ Minneapolis Oberheim OB-Xa & Slap Bass (Prince)',
      oscType: 'sawtooth', subMix: 0.82, cutoffBase: 480, cutoffEnv: 2100, resonance: 4.8, decay: 0.26, drive: 0.35
    },
    {
      id: 'gorillaz_dub',
      name: '🦍 Demon Days Dub Reggae Sub & P-Bass (Gorillaz)',
      oscType: 'triangle', subMix: 0.92, cutoffBase: 310, cutoffEnv: 880, resonance: 2.5, decay: 0.44, drive: 0.34
    },
    {
      id: 'pino_flatwound',
      name: "🍯 Pino Palladino Flatwound '63 P-Bass (D'Angelo)",
      oscType: 'triangle', subMix: 0.95, cutoffBase: 260, cutoffEnv: 580, resonance: 1.5, decay: 0.42, drive: 0.14
    },
    {
      id: 'badu_sub',
      name: "🔮 Mama's Gun Warm Sub & Upright Pocket (Erykah Badu)",
      oscType: 'triangle', subMix: 0.94, cutoffBase: 280, cutoffEnv: 640, resonance: 1.8, decay: 0.4, drive: 0.16
    },
    {
      id: 'mosdef_upright',
      name: '🌙 Brooklyn SP-1200 Filtered Jazz & Upright Bass (Mos Def)',
      oscType: 'triangle', subMix: 0.88, cutoffBase: 320, cutoffEnv: 740, resonance: 2.1, decay: 0.34, drive: 0.22
    },
    {
      id: 'kanye_soul',
      name: '🐻 Warm Motown P-Bass & 808 Sub (Kanye West)',
      oscType: 'sawtooth', subMix: 0.86, cutoffBase: 360, cutoffEnv: 920, resonance: 2.0, decay: 0.4, drive: 0.25
    },
    {
      id: 'mccartney_hofner',
      name: "🪲 Paul McCartney '61 Höfner Violin & Rickenbacker (The Beatles)",
      oscType: 'triangle', subMix: 0.82, cutoffBase: 440, cutoffEnv: 1080, resonance: 2.1, decay: 0.32, drive: 0.24
    },
    {
      id: 'daft_synth',
      name: '🤖 French Touch Slap & MS-20 Disco Filter Bass (Daft Punk)',
      oscType: 'sawtooth', subMix: 0.8, cutoffBase: 460, cutoffEnv: 2200, resonance: 5.2, decay: 0.25, drive: 0.36
    },
    {
      id: 'strokes_pick',
      name: '🎸 Nikolai Fraiture Picked Ampeg SVT P-Bass (The Strokes)',
      oscType: 'sawtooth', subMix: 0.68, cutoffBase: 580, cutoffEnv: 1450, resonance: 2.4, decay: 0.26, drive: 0.42
    },
    {
      id: 'outkast_sub',
      name: '🛸 ATLiens Trunk-Rattling 808 & P-Funk Bass (OutKast)',
      oscType: 'sawtooth', subMix: 0.92, cutoffBase: 340, cutoffEnv: 1380, resonance: 3.6, decay: 0.42, drive: 0.3
    },
    {
      id: 'beegees_disco',
      name: '🕺 Maurice Gibb Octave-Strut Disco Bass (Bee Gees)',
      oscType: 'sawtooth', subMix: 0.76, cutoffBase: 490, cutoffEnv: 1420, resonance: 2.8, decay: 0.24, drive: 0.22
    },
    {
      id: 'geddy_rick',
      name: '🦉 Geddy Lee Rickenbacker 4001 Growl & Taurus (Rush)',
      oscType: 'sawtooth', subMix: 0.72, cutoffBase: 640, cutoffEnv: 2150, resonance: 3.4, decay: 0.31, drive: 0.48
    },
    {
      id: 'radiohead_p',
      name: "📻 Colin Greenwood '70s P-Bass & Prophet Sub (Radiohead)",
      oscType: 'triangle', subMix: 0.84, cutoffBase: 390, cutoffEnv: 1020, resonance: 2.3, decay: 0.35, drive: 0.22
    },
    {
      id: 'collins_taurus',
      name: '🥁 Leland Sklar & Moog Taurus Sub Pedals (Phil Collins)',
      oscType: 'sawtooth', subMix: 0.9, cutoffBase: 350, cutoffEnv: 980, resonance: 2.6, decay: 0.46, drive: 0.24
    },
    {
      id: 'hotchip_sh101',
      name: '🎹 Modular Roland SH-101 & Acid Disco Bass (Hot Chip)',
      oscType: 'square', subMix: 0.82, cutoffBase: 430, cutoffEnv: 1950, resonance: 4.9, decay: 0.22, drive: 0.3
    },
    {
      id: 'hoppus_pbass',
      name: '🛹 Mark Hoppus Ernie Ball P-Bass Pick Drive (blink-182)',
      oscType: 'sawtooth', subMix: 0.66, cutoffBase: 660, cutoffEnv: 1750, resonance: 2.5, decay: 0.24, drive: 0.45
    },
    {
      id: 'parker_fuzz',
      name: '🌀 Kevin Parker Höfner Club Bass + KTG-1 Fuzz (Tame Impala)',
      oscType: 'sawtooth', subMix: 0.78, cutoffBase: 540, cutoffEnv: 1820, resonance: 3.8, decay: 0.29, drive: 0.52
    },
    {
      id: 'kumalo_fretless',
      name: '🌍 Bakithi Kumalo Washburn Fretless & StingRay (Paul Simon)',
      oscType: 'triangle', subMix: 0.82, cutoffBase: 510, cutoffEnv: 1580, resonance: 3.1, decay: 0.36, drive: 0.2
    },
    {
      id: 'novoselic_svt',
      name: '🧷 Krist Novoselic Gibson Ripper + Ampeg SVT (Nirvana)',
      oscType: 'sawtooth', subMix: 0.74, cutoffBase: 590, cutoffEnv: 1680, resonance: 2.9, decay: 0.33, drive: 0.46
    }
  ];

  const ARTIST_BASS_PROFILES = {
    zeppelin: { bassist: 'John Paul Jones', kit: 'jpj_jazz', bassKit: 'jpj_jazz', rootMidi: 40, scale: 'minor', scaleLabel: 'E1 Minor Blues', style: 'blues_riff' },
    jamesbrown: { bassist: 'Bootsy Collins & Bernard Odum', kit: 'bootsy_funk', bassKit: 'bootsy_funk', rootMidi: 38, scale: 'dorian', scaleLabel: 'D1 Dorian Funk', style: 'funk_one' },
    prince: { bassist: 'BrownMark & Prince Synth Bass', kit: 'prince_synth', bassKit: 'prince_synth', rootMidi: 45, scale: 'minor', scaleLabel: 'A1 Synth Funk', style: 'synth_funk' },
    gorillaz: { bassist: 'Murdoc Niccals / Dub Sub', kit: 'gorillaz_dub', bassKit: 'gorillaz_dub', rootMidi: 39, scale: 'minor', scaleLabel: 'Eb1 Dub Minor', style: 'dub_bounce' },
    dangelo: { bassist: 'Pino Palladino', kit: 'pino_flatwound', bassKit: 'pino_flatwound', rootMidi: 38, scale: 'minor', scaleLabel: 'D1 Neo-Soul Pocket', style: 'neosoul_pocket' },
    badu: { bassist: 'Ron Carter & Braylon Lacy', kit: 'badu_sub', bassKit: 'badu_sub', rootMidi: 41, scale: 'minor', scaleLabel: 'F1 Warm Sub', style: 'neosoul_pocket' },
    mosdef: { bassist: 'Doug Wimbish / SP-1200 Sub', kit: 'mosdef_upright', bassKit: 'mosdef_upright', rootMidi: 43, scale: 'minor', scaleLabel: 'G1 Boom-Bap Upright', style: 'boombap_walk' },
    kanye: { bassist: 'Motown Soul-Chop & 808 Sub', kit: 'kanye_soul', bassKit: 'kanye_soul', rootMidi: 41, scale: 'minor', scaleLabel: 'F1 Soul & 808', style: 'soul_walk' },
    beatles: { bassist: 'Paul McCartney', kit: 'mccartney_hofner', bassKit: 'mccartney_hofner', rootMidi: 38, scale: 'dorian', scaleLabel: 'D1 McCartney Melodic', style: 'mccartney_melodic' },
    daftpunk: { bassist: 'Thomas Bangalter & Nathan East', kit: 'daft_synth', bassKit: 'daft_synth', rootMidi: 45, scale: 'minor', scaleLabel: 'A1 French Touch', style: 'disco_octave' },
    strokes: { bassist: 'Nikolai Fraiture', kit: 'strokes_pick', bassKit: 'strokes_pick', rootMidi: 48, scale: 'major', scaleLabel: 'C2 Picked Garage', style: 'picked_8th' },
    outkast: { bassist: 'Preston Crump & Stankonia Sub', kit: 'outkast_sub', bassKit: 'outkast_sub', rootMidi: 40, scale: 'minor', scaleLabel: 'E1 ATLiens Funk', style: 'pfunk_sub' },
    beegees: { bassist: 'Maurice Gibb', kit: 'beegees_disco', bassKit: 'beegees_disco', rootMidi: 41, scale: 'minor', scaleLabel: 'F1 Disco Strut', style: 'disco_octave' },
    rush: { bassist: 'Geddy Lee', kit: 'geddy_rick', bassKit: 'geddy_rick', rootMidi: 40, scale: 'minor', scaleLabel: 'E1 Rick & Taurus', style: 'prog_drive' },
    radiohead: { bassist: 'Colin Greenwood', kit: 'radiohead_p', bassKit: 'radiohead_p', rootMidi: 40, scale: 'minor', scaleLabel: 'E1 Kraut Ostinato', style: 'kraut_ostinato' },
    philcollins: { bassist: 'Leland Sklar & Moog Taurus', kit: 'collins_taurus', bassKit: 'collins_taurus', rootMidi: 38, scale: 'minor', scaleLabel: 'D1 Taurus Pedal', style: 'pedal_pulse' },
    hotchip: { bassist: 'Al Doyle & Joe Goddard', kit: 'hotchip_sh101', bassKit: 'hotchip_sh101', rootMidi: 43, scale: 'minor', scaleLabel: 'G1 SH-101 Arp', style: 'sh101_arp' },
    blink182: { bassist: 'Mark Hoppus', kit: 'hoppus_pbass', bassKit: 'hoppus_pbass', rootMidi: 48, scale: 'major', scaleLabel: 'C2 Pop-Punk Pick', style: 'punk_8th' },
    tameimpala: { bassist: 'Kevin Parker (Höfner Fuzz)', kit: 'parker_fuzz', bassKit: 'parker_fuzz', rootMidi: 37, scale: 'minor', scaleLabel: 'C#1 Psych Fuzz', style: 'parker_psych' },
    paulsimon: { bassist: 'Bakithi Kumalo (Fretless)', kit: 'kumalo_fretless', bassKit: 'kumalo_fretless', rootMidi: 41, scale: 'major', scaleLabel: 'F1 Graceland Fretless', style: 'kumalo_graceland' },
    nirvana: { bassist: 'Krist Novoselic (Gibson Ripper)', kit: 'novoselic_svt', bassKit: 'novoselic_svt', rootMidi: 40, scale: 'minor', scaleLabel: 'E1 Grunge Ripper', style: 'novoselic_grunge' }
  };

  // ==========================================================================
  // 95 Distinct Song-Specific Basslines (Unique Key, Bar 1 & Bar 2 Riffs, & Bar Progression)
  // Voice indices: 0=Root, 1=Low Sub(b7), 2=3rd, 3=4th, 4=5th, 5=6th/b7th, 6=Octave, 7=High 10th
  // ==========================================================================
  const SONG_KEY_OVERRIDES = {
    // 1. LED ZEPPELIN (John Paul Jones)
    zep_levee: {
      rootMidi: 41, scale: 'minor', label: 'F1 Minor Stairwell Drone',
      bar1: [[0, 0, 2], [6, 1, 3], [7, 0, 2], [8, 0, 2], [10, 5, 1], [14, 4, 1]],
      bar2: [[0, 0, 2], [7, 2, 1], [8, 3, 2], [10, 4, 2], [13, 5, 1], [14, 6, 2], [15, 1, 2]]
    },
    zep_kashmir: {
      rootMidi: 38, scale: 'dorian', label: 'D1 Dadgad Ascending Modal',
      bar1: [[0, 0, 2], [2, 2, 1], [4, 2, 2], [6, 3, 1], [8, 3, 2], [10, 4, 1], [12, 4, 2], [14, 5, 2]],
      bar2: [[0, 5, 2], [2, 6, 2], [4, 4, 1], [6, 3, 1], [8, 2, 2], [10, 1, 1], [12, 0, 2], [14, 4, 2]]
    },
    zep_goodtimes: {
      rootMidi: 40, scale: 'minor', label: 'E1 16th-Run Riff',
      bar1: [[0, 0, 2], [2, 0, 2], [5, 2, 1], [6, 3, 1], [7, 4, 2], [8, 6, 2], [10, 5, 1], [11, 4, 1], [13, 3, 1], [14, 2, 2], [15, 1, 1]],
      bar2: [[0, 3, 2], [2, 3, 2], [6, 4, 1], [7, 5, 2], [8, 4, 2], [10, 6, 2], [12, 7, 1], [14, 4, 2], [15, 2, 1]]
    },
    zep_wholelotta: {
      rootMidi: 40, scale: 'minor', label: 'E1 Blues Chug Ostinato',
      bar1: [[0, 0, 2], [2, 1, 1], [3, 1, 2], [4, 0, 2], [6, 1, 1], [7, 1, 2], [8, 0, 2], [10, 1, 1], [11, 1, 2], [12, 0, 2], [14, 2, 2], [15, 1, 1]],
      bar2: [[0, 0, 2], [2, 1, 1], [3, 1, 2], [4, 0, 2], [6, 2, 1], [7, 4, 2], [8, 0, 2], [10, 1, 1], [11, 1, 2], [12, 4, 2], [14, 6, 2], [15, 4, 1]]
    },
    zep_immigrant: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Octave Hammer Gallop',
      bar1: [[0, 0, 2], [2, 0, 1], [3, 6, 2], [6, 0, 1], [8, 0, 2], [10, 0, 1], [11, 6, 2], [14, 5, 1]],
      bar2: [[0, 0, 2], [2, 0, 1], [3, 6, 2], [6, 4, 1], [8, 0, 2], [10, 0, 1], [11, 6, 2], [13, 5, 1], [14, 3, 2], [15, 2, 1]]
    },

    // 2. JAMES BROWN (Bootsy Collins & Bernard Odum)
    jb_funkydrummer: {
      rootMidi: 38, scale: 'dorian', label: 'D1 Clyde Break Pocket',
      bar1: [[0, 0, 2], [2, 0, 1], [6, 5, 1], [7, 6, 2], [10, 4, 2], [13, 5, 1], [15, 2, 1]],
      bar2: [[0, 0, 2], [2, 4, 1], [6, 5, 2], [9, 2, 3], [10, 3, 2], [12, 4, 1], [13, 6, 2], [15, 1, 1]]
    },
    jb_coldsweat: {
      rootMidi: 38, scale: 'dorian', label: 'D1 Bernard Odum Displaced Hook',
      bar1: [[0, 0, 2], [3, 2, 1], [6, 4, 2], [8, 0, 2], [10, 5, 2], [12, 4, 1]],
      bar2: [[0, 3, 2], [4, 5, 2], [6, 6, 2], [8, 4, 1], [10, 2, 2], [11, 3, 1], [14, 1, 2]]
    },
    jb_sexmachine: {
      rootMidi: 39, scale: 'dorian', label: 'Eb1 Bootsy Staccato 16ths',
      bar1: [[0, 0, 2], [1, 0, 3], [3, 6, 2], [4, 5, 1], [7, 2, 1], [10, 0, 2], [11, 6, 2], [14, 4, 1], [15, 5, 2]],
      bar2: [[0, 0, 2], [3, 6, 2], [6, 5, 1], [7, 4, 2], [10, 2, 2], [11, 3, 1], [13, 5, 2], [14, 6, 2], [15, 7, 1]]
    },
    jb_giveitup: {
      rootMidi: 41, scale: 'minor', label: 'F1 B-Boy Rolling Ostinato',
      bar1: [[0, 0, 2], [2, 2, 1], [3, 3, 2], [6, 4, 2], [8, 0, 2], [10, 5, 1], [12, 4, 2], [14, 2, 1]],
      bar2: [[0, 0, 2], [2, 2, 1], [3, 3, 2], [6, 6, 2], [8, 5, 1], [10, 4, 2], [13, 2, 2], [15, 1, 1]]
    },
    jb_payback: {
      rootMidi: 46, scale: 'minor', label: 'Bb1 On-The-One Revenge Strut',
      bar1: [[0, 0, 2], [2, 0, 2], [6, 2, 1], [9, 4, 2], [10, 5, 2], [14, 1, 1]],
      bar2: [[0, 0, 2], [2, 0, 2], [6, 6, 2], [7, 5, 1], [9, 4, 2], [10, 2, 2], [14, 4, 2], [15, 1, 1]]
    },

    // 3. PRINCE (Minneapolis Synth & Slap Bass)
    prince_doves: {
      rootMidi: 45, scale: 'minor', label: 'A1 Baroque Synth Stabs',
      bar1: [[0, 0, 2], [3, 6, 2], [8, 0, 2], [10, 4, 2], [14, 5, 1]],
      bar2: [[0, 0, 2], [3, 2, 1], [6, 3, 2], [8, 4, 2], [11, 5, 1], [12, 6, 2], [13, 7, 2], [14, 6, 1], [15, 4, 2]]
    },
    prince_kiss: {
      rootMidi: 45, scale: 'dorian', label: 'A1 Staccato Slap Pocket',
      bar1: [[0, 0, 2], [3, 1, 3], [6, 2, 2], [10, 0, 2], [14, 6, 2], [15, 5, 1]],
      bar2: [[0, 3, 2], [3, 3, 3], [6, 5, 2], [8, 4, 2], [10, 6, 2], [11, 7, 2], [14, 4, 1]]
    },
    prince_1999: {
      rootMidi: 41, scale: 'major', label: 'F1 OB-Xa Party Synth',
      bar1: [[0, 0, 2], [2, 6, 1], [4, 4, 2], [7, 5, 1], [8, 0, 2], [10, 2, 2], [12, 3, 2], [14, 4, 2]],
      bar2: [[0, 3, 2], [3, 5, 2], [4, 4, 2], [6, 6, 2], [8, 0, 2], [10, 5, 1], [12, 4, 2], [14, 1, 2]]
    },
    prince_raspberry: {
      rootMidi: 45, scale: 'major', label: 'A1 Major Pop-Funk Walk',
      bar1: [[0, 0, 2], [4, 2, 1], [7, 3, 2], [8, 4, 2], [10, 5, 1], [12, 6, 2], [14, 4, 1]],
      bar2: [[0, 3, 2], [3, 4, 1], [7, 6, 2], [8, 4, 2], [10, 2, 2], [12, 1, 1], [14, 0, 2]]
    },
    prince_purplerain: {
      rootMidi: 46, scale: 'major', label: 'Bb1 Stadium Ballad Pedal',
      bar1: [[0, 0, 2], [6, 0, 1], [7, 4, 1], [8, 5, 2], [14, 4, 1], [15, 2, 1]],
      bar2: [[0, 3, 2], [6, 3, 1], [8, 4, 2], [10, 6, 2], [12, 7, 1], [14, 4, 2], [15, 1, 1]]
    },

    // 4. GORILLAZ (Murdoc Niccals / Dub Sub)
    gor_clint: {
      rootMidi: 39, scale: 'minor', label: 'Eb1 Swung Dub Sub',
      bar1: [[0, 0, 2], [3, 0, 2], [6, 4, 1], [8, 1, 2], [10, 1, 2], [14, 2, 1]],
      bar2: [[0, 0, 2], [3, 5, 2], [6, 4, 2], [7, 3, 1], [8, 2, 2], [10, 1, 2], [14, 4, 1]]
    },
    gor_feelgood: {
      rootMidi: 39, scale: 'minor', label: 'Eb1 Murdoc Iconic Riff',
      bar1: [[0, 0, 2], [2, 1, 2], [3, 2, 2], [6, 3, 2], [8, 5, 2], [14, 4, 2]],
      bar2: [[0, 3, 2], [2, 4, 2], [3, 5, 2], [6, 3, 2], [8, 0, 2], [10, 0, 1], [14, 1, 1]]
    },
    gor_dare: {
      rootMidi: 40, scale: 'minor', label: 'E1 Electro-Bounce Synth',
      bar1: [[0, 0, 2], [2, 6, 1], [4, 0, 2], [6, 5, 2], [8, 3, 2], [10, 2, 1], [12, 4, 2], [14, 5, 1]],
      bar2: [[0, 0, 2], [2, 6, 2], [4, 5, 2], [6, 4, 1], [8, 2, 2], [10, 3, 2], [12, 1, 2], [14, 4, 2]]
    },
    gor_dirtyharry: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Clav-Funk Bounce',
      bar1: [[0, 0, 2], [2, 0, 2], [6, 2, 1], [7, 3, 2], [10, 4, 2], [11, 6, 2], [14, 5, 1]],
      bar2: [[0, 0, 2], [2, 2, 1], [6, 4, 2], [10, 5, 2], [12, 6, 2], [14, 4, 1], [15, 2, 1]]
    },
    gor_tomorrow: {
      rootMidi: 36, scale: 'minor', label: 'C1 Trip-Hop Dub Walk',
      bar1: [[0, 0, 2], [2, 0, 1], [8, 3, 2], [11, 3, 2], [14, 4, 1]],
      bar2: [[0, 2, 2], [2, 2, 1], [7, 5, 1], [8, 4, 2], [11, 4, 2], [14, 1, 2]]
    },

    // 5. D'ANGELO (Pino Palladino)
    dan_untitled: {
      rootMidi: 40, scale: 'major', label: 'E1 6/8 Pino Soul Walk',
      bar1: [[0, 0, 2], [4, 2, 1], [7, 3, 1], [8, 4, 2], [11, 5, 1], [14, 6, 2], [15, 4, 1]],
      bar2: [[0, 3, 2], [4, 5, 1], [6, 6, 2], [8, 7, 2], [10, 6, 1], [12, 4, 2], [15, 1, 2]]
    },
    dan_brownsugar: {
      rootMidi: 46, scale: 'minor', label: 'Bb1 Smokey Rhodes Sub',
      bar1: [[0, 0, 2], [3, 0, 2], [6, 2, 1], [8, 3, 2], [10, 3, 2], [15, 1, 1]],
      bar2: [[0, 5, 2], [3, 5, 1], [7, 4, 2], [8, 4, 2], [10, 6, 2], [14, 4, 1], [15, 2, 1]]
    },
    dan_devilspie: {
      rootMidi: 36, scale: 'minor', label: 'C1 Premier Two-Note Sub',
      bar1: [[0, 0, 2], [2, 0, 2], [7, 1, 2], [10, 0, 2], [11, 0, 1], [15, 1, 3]],
      bar2: [[0, 0, 2], [2, 0, 2], [7, 2, 1], [10, 3, 2], [11, 4, 2], [14, 1, 2]]
    },
    dan_playaplaya: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Pino High Slide Pocket',
      bar1: [[0, 0, 2], [3, 4, 1], [6, 6, 2], [9, 7, 2], [11, 5, 2], [15, 4, 1]],
      bar2: [[0, 3, 2], [3, 5, 1], [7, 6, 2], [9, 4, 2], [11, 2, 2], [13, 1, 1], [15, 0, 2]]
    },
    dan_sugah: {
      rootMidi: 41, scale: 'minor', label: 'F1 Black Messiah Pentatonic',
      bar1: [[0, 0, 2], [2, 0, 1], [3, 2, 2], [6, 3, 2], [7, 4, 1], [10, 5, 2], [11, 6, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [3, 6, 2], [6, 5, 2], [8, 4, 1], [10, 2, 2], [11, 3, 2], [13, 4, 1], [14, 1, 2]]
    },

    // 6. ERYKAH BADU (J Dilla & Ron Carter)
    badu_onandon: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Baduizm Two-Chord Sway',
      bar1: [[0, 0, 2], [3, 0, 2], [7, 2, 1], [8, 4, 2], [10, 4, 2], [14, 5, 1]],
      bar2: [[0, 3, 2], [3, 3, 2], [7, 5, 1], [8, 2, 2], [10, 4, 2], [14, 1, 2], [15, 0, 1]]
    },
    badu_didntcha: {
      rootMidi: 39, scale: 'minor', label: 'Eb1 Dilla Tarika Walk',
      bar1: [[0, 0, 2], [3, 2, 2], [6, 3, 2], [7, 4, 1], [10, 5, 2], [12, 4, 1], [14, 2, 2]],
      bar2: [[0, 3, 2], [3, 4, 2], [6, 5, 2], [10, 6, 2], [12, 7, 1], [13, 5, 2], [15, 4, 1]]
    },
    badu_baglady: {
      rootMidi: 43, scale: 'minor', label: 'G1 West Coast Sub Bounce',
      bar1: [[0, 0, 2], [2, 0, 2], [7, 1, 2], [10, 0, 2], [14, 4, 1], [15, 5, 2]],
      bar2: [[0, 3, 2], [2, 3, 2], [7, 6, 2], [10, 5, 2], [13, 4, 2], [15, 2, 1]]
    },
    badu_loveofmylife: {
      rootMidi: 38, scale: 'minor', label: 'D1 Saadiq Funk-Hop Pocket',
      bar1: [[0, 0, 2], [3, 6, 2], [6, 5, 1], [8, 0, 2], [10, 2, 2], [11, 3, 2], [14, 4, 1]],
      bar2: [[0, 0, 2], [3, 2, 2], [6, 3, 2], [10, 4, 2], [11, 5, 2], [14, 6, 2], [15, 4, 1]]
    },
    badu_windowseat: {
      rootMidi: 36, scale: 'minor', label: 'C1 Warm Chord-Change Walk',
      bar1: [[0, 0, 2], [7, 4, 1], [8, 5, 2], [10, 5, 2], [15, 4, 1]],
      bar2: [[0, 3, 2], [6, 3, 1], [8, 4, 2], [10, 4, 2], [14, 6, 2], [15, 1, 1]]
    },

    // 7. MOS DEF (DJ Premier, Ayatollah & Madlib)
    mos_mathematics: {
      rootMidi: 43, scale: 'minor', label: 'G1 Premier Chopped Upright',
      bar1: [[0, 0, 2], [3, 0, 2], [8, 4, 2], [10, 5, 2], [11, 4, 2], [14, 1, 1]],
      bar2: [[0, 0, 2], [2, 2, 2], [6, 3, 2], [7, 2, 1], [10, 1, 2], [14, 4, 2]]
    },
    mos_fatbooty: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Aretha Soul Bassline',
      bar1: [[0, 0, 2], [2, 2, 1], [4, 3, 2], [7, 4, 2], [8, 6, 2], [10, 5, 1], [12, 4, 2], [14, 2, 1]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 6, 2], [8, 4, 2], [10, 2, 2], [12, 0, 2], [15, 1, 2]]
    },
    mos_hiphop: {
      rootMidi: 46, scale: 'minor', label: 'Bb1 Descending Crate Stomp',
      bar1: [[0, 6, 2], [2, 6, 2], [6, 5, 2], [8, 4, 2], [11, 3, 2], [14, 2, 2]],
      bar2: [[0, 0, 2], [2, 0, 2], [7, 1, 2], [8, 2, 2], [11, 4, 2], [14, 5, 2]]
    },
    mos_umisays: {
      rootMidi: 39, scale: 'major', label: 'Eb1 Meditative Jazz Upright',
      bar1: [[0, 0, 2], [4, 2, 1], [7, 4, 1], [8, 5, 2], [12, 4, 1], [14, 6, 2]],
      bar2: [[0, 3, 2], [3, 4, 1], [7, 5, 2], [10, 4, 2], [12, 2, 1], [14, 1, 2]]
    },
    mos_auditorium: {
      rootMidi: 40, scale: 'minor', label: 'E1 Madlib Orchestral Walk',
      bar1: [[0, 0, 2], [3, 2, 2], [6, 3, 2], [8, 4, 2], [10, 5, 2], [14, 4, 2]],
      bar2: [[0, 5, 2], [2, 6, 2], [6, 4, 2], [10, 3, 2], [11, 2, 2], [14, 1, 2]]
    },

    // 8. KANYE WEST (Soul-Chop P-Bass & 808)
    ye_jesuswalks: {
      rootMidi: 39, scale: 'minor', label: 'Eb1 Gospel Choir March',
      bar1: [[0, 0, 2], [2, 0, 2], [6, 2, 1], [7, 2, 2], [8, 3, 2], [10, 3, 2], [14, 4, 2], [15, 4, 2]],
      bar2: [[0, 0, 2], [2, 0, 2], [6, 5, 1], [7, 5, 2], [8, 4, 2], [10, 2, 2], [14, 1, 2], [15, 0, 1]]
    },
    ye_golddigger: {
      rootMidi: 44, scale: 'major', label: 'Ab1 Ray Charles Soul Walk',
      bar1: [[0, 0, 2], [3, 2, 1], [4, 4, 2], [6, 5, 1], [8, 3, 2], [10, 4, 2], [12, 6, 2], [14, 4, 1]],
      bar2: [[0, 4, 2], [3, 5, 2], [6, 6, 2], [8, 0, 2], [10, 2, 1], [12, 4, 2], [14, 1, 2]]
    },
    ye_flashing: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Synth-String Progression',
      bar1: [[0, 0, 2], [3, 0, 2], [7, 6, 1], [8, 5, 2], [11, 5, 2], [14, 4, 1]],
      bar2: [[0, 3, 2], [3, 3, 2], [7, 5, 1], [8, 4, 2], [11, 4, 2], [14, 6, 2]]
    },
    ye_runaway: {
      rootMidi: 40, scale: 'major', label: 'E1 Minimal Piano-Root Sub',
      bar1: [[0, 6, 2], [7, 6, 1], [8, 5, 2], [10, 5, 2], [14, 4, 1]],
      bar2: [[0, 4, 2], [3, 4, 1], [7, 2, 1], [8, 0, 2], [10, 0, 2], [15, 6, 2]]
    },
    ye_blackskinhead: {
      rootMidi: 41, scale: 'minor', label: 'F1 Industrial Fuzz Stampede',
      bar1: [[0, 0, 2], [2, 0, 1], [4, 0, 2], [6, 2, 2], [8, 0, 2], [10, 3, 2], [12, 0, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [3, 6, 2], [4, 0, 2], [6, 5, 2], [8, 0, 2], [10, 4, 2], [12, 2, 2], [14, 1, 2], [15, 0, 2]]
    },

    // 9. THE BEATLES (Paul McCartney)
    bea_cometogether: {
      rootMidi: 38, scale: 'dorian', label: 'D1 Swampy Slide Hook',
      bar1: [[0, 0, 2], [2, 0, 2], [3, 4, 1], [4, 7, 2], [6, 7, 1], [8, 6, 2], [12, 0, 1]],
      bar2: [[0, 0, 2], [2, 0, 2], [3, 4, 1], [4, 7, 2], [8, 6, 2], [10, 4, 2], [12, 3, 2], [14, 2, 1]]
    },
    bea_tomorrow: {
      rootMidi: 36, scale: 'major', label: 'C1 Revolver Raga Drone',
      bar1: [[0, 0, 2], [2, 0, 2], [6, 6, 2], [8, 0, 2], [10, 5, 2], [11, 6, 2], [14, 4, 1]],
      bar2: [[0, 0, 2], [2, 0, 2], [6, 5, 2], [8, 0, 2], [10, 6, 2], [11, 7, 1], [12, 5, 2], [14, 4, 2]]
    },
    bea_tickettoride: {
      rootMidi: 45, scale: 'major', label: 'A1 Stuttering Rickenbacker',
      bar1: [[0, 0, 2], [4, 4, 1], [6, 4, 2], [8, 6, 2], [10, 4, 2], [12, 2, 2]],
      bar2: [[0, 0, 2], [6, 4, 2], [8, 6, 2], [10, 5, 2], [12, 4, 2], [14, 2, 2]]
    },
    bea_rain: {
      rootMidi: 43, scale: 'major', label: 'G1 High Melodic Lead-Bass',
      bar1: [[0, 6, 2], [2, 6, 1], [3, 5, 2], [6, 4, 2], [8, 3, 2], [10, 4, 2], [12, 6, 2], [14, 7, 2]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 6, 2], [8, 4, 2], [10, 2, 2], [11, 3, 1], [13, 4, 2], [14, 0, 2]]
    },
    bea_sgtpepper: {
      rootMidi: 41, scale: 'major', label: 'F1 Walking Reprise Drive',
      bar1: [[0, 0, 2], [2, 2, 1], [4, 3, 2], [6, 4, 1], [8, 5, 2], [10, 6, 2], [12, 4, 1], [14, 2, 2]],
      bar2: [[0, 3, 2], [2, 4, 1], [6, 5, 2], [7, 6, 2], [8, 4, 2], [10, 2, 1], [14, 1, 2], [15, 0, 1]]
    },

    // 10. DAFT PUNK (Thomas Bangalter & Nathan East)
    dp_aroundtheworld: {
      rootMidi: 45, scale: 'minor', label: 'A1 Iconic Melodic Walk',
      bar1: [[0, 0, 2], [2, 0, 1], [4, 1, 2], [6, 1, 1], [8, 2, 2], [10, 2, 1], [12, 3, 2], [14, 4, 2]],
      bar2: [[0, 4, 2], [2, 6, 2], [4, 7, 2], [6, 6, 1], [8, 5, 2], [10, 4, 2], [12, 3, 2], [14, 2, 2], [15, 1, 1]]
    },
    dp_onemoretime: {
      rootMidi: 38, scale: 'major', label: 'D1 Sidechain Filter-House',
      bar1: [[0, 4, 2], [2, 6, 1], [4, 4, 2], [6, 6, 2], [8, 0, 2], [10, 6, 1], [12, 0, 2], [14, 2, 1]],
      bar2: [[0, 3, 2], [2, 6, 1], [4, 3, 2], [8, 3, 2], [11, 5, 2], [12, 4, 2], [14, 6, 2]]
    },
    dp_getlucky: {
      rootMidi: 47, scale: 'dorian', label: 'B1 Nathan East 4-Chord Slap',
      bar1: [[0, 0, 2], [2, 6, 1], [3, 0, 3], [4, 0, 2], [6, 5, 2], [8, 2, 2], [10, 7, 2], [12, 2, 2], [14, 4, 1]],
      bar2: [[0, 4, 2], [2, 6, 2], [4, 4, 2], [6, 5, 1], [8, 3, 2], [10, 6, 2], [12, 3, 2], [14, 2, 2], [15, 1, 2]]
    },
    dp_dafunk: {
      rootMidi: 43, scale: 'minor', label: 'G1 Acid MS-20 Gangsta Riff',
      bar1: [[0, 0, 2], [3, 2, 2], [4, 3, 2], [6, 4, 1], [8, 0, 2], [10, 5, 2], [11, 6, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [3, 6, 2], [6, 5, 2], [8, 4, 2], [10, 3, 2], [12, 2, 2], [14, 1, 2]]
    },
    dp_something: {
      rootMidi: 38, scale: 'minor', label: 'D1 Late-Night Lounge Glide',
      bar1: [[0, 5, 2], [6, 6, 1], [7, 5, 2], [8, 4, 2], [10, 4, 1], [14, 2, 1]],
      bar2: [[0, 0, 2], [3, 2, 1], [7, 3, 2], [8, 3, 2], [10, 4, 2], [14, 5, 2]]
    },

    // 11. THE STROKES (Nikolai Fraiture)
    str_lastnite: {
      rootMidi: 48, scale: 'major', label: 'C2 Garage-Soul Bounce',
      bar1: [[0, 0, 2], [3, 0, 2], [4, 2, 1], [6, 3, 2], [8, 3, 2], [10, 4, 2], [12, 5, 1], [14, 4, 2]],
      bar2: [[0, 4, 2], [3, 4, 2], [6, 6, 2], [8, 3, 2], [10, 2, 2], [12, 0, 2], [14, 1, 2]]
    },
    str_hardtoexplain: {
      rootMidi: 43, scale: 'major', label: 'G1 Motorik 8th Chord Chug',
      bar1: [[0, 0, 2], [2, 0, 1], [4, 0, 2], [6, 0, 1], [8, 5, 2], [10, 5, 1], [12, 5, 2], [14, 6, 2]],
      bar2: [[0, 3, 2], [2, 3, 1], [4, 3, 2], [6, 3, 1], [8, 4, 2], [10, 4, 1], [12, 4, 2], [14, 7, 2]]
    },
    str_someday: {
      rootMidi: 45, scale: 'major', label: 'A1 Melodic Counter-Walk',
      bar1: [[0, 0, 2], [2, 2, 1], [6, 4, 2], [8, 6, 2], [10, 5, 2], [12, 4, 1], [14, 2, 2]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 4, 2], [8, 2, 2], [10, 4, 2], [12, 1, 1], [14, 0, 2]]
    },
    str_reptilia: {
      rootMidi: 47, scale: 'minor', label: 'B1 Staccato Two-Chord Hook',
      bar1: [[0, 0, 2], [2, 0, 2], [3, 6, 1], [6, 0, 2], [8, 0, 2], [10, 5, 2], [12, 4, 1], [14, 2, 2]],
      bar2: [[0, 3, 2], [2, 3, 2], [3, 7, 1], [6, 3, 2], [8, 3, 2], [10, 4, 2], [11, 5, 2], [14, 6, 2]]
    },
    str_1251: {
      rootMidi: 40, scale: 'major', label: 'E1 Synth-Locked Quarter Pulse',
      bar1: [[0, 0, 2], [4, 0, 2], [6, 2, 1], [8, 3, 2], [12, 3, 2], [14, 4, 1]],
      bar2: [[0, 5, 2], [4, 5, 2], [8, 4, 2], [10, 6, 2], [12, 4, 2], [14, 2, 1]]
    },

    // 12. OUTKAST (Preston Crump & Stankonia 808)
    out_msjackson: {
      rootMidi: 41, scale: 'minor', label: 'F1 Preston Crump Melodic Walk',
      bar1: [[0, 0, 2], [3, 2, 2], [6, 3, 2], [9, 4, 1], [11, 5, 2], [14, 6, 2]],
      bar2: [[0, 3, 2], [2, 4, 1], [6, 6, 2], [8, 7, 2], [11, 5, 2], [13, 4, 1], [14, 2, 2]]
    },
    out_sofresh: {
      rootMidi: 39, scale: 'minor', label: 'Eb1 Trunk-Rattling 808 Sub',
      bar1: [[0, 0, 2], [2, 0, 2], [7, 1, 2], [10, 0, 2], [13, 1, 2], [15, 2, 1]],
      bar2: [[0, 0, 2], [2, 0, 2], [7, 3, 2], [10, 4, 2], [13, 5, 2], [15, 1, 2]]
    },
    out_rosaparks: {
      rootMidi: 43, scale: 'minor', label: 'G1 Aquemini Acoustic-Funk',
      bar1: [[0, 0, 2], [3, 2, 2], [6, 3, 2], [8, 0, 2], [10, 4, 2], [12, 5, 1], [14, 4, 2]],
      bar2: [[0, 0, 2], [3, 6, 2], [6, 5, 2], [8, 4, 2], [10, 3, 2], [13, 2, 2], [15, 1, 2]]
    },
    out_atliens: {
      rootMidi: 37, scale: 'minor', label: 'C#1 Dungeon Space-Bass',
      bar1: [[0, 0, 2], [3, 2, 2], [6, 1, 1], [8, 0, 2], [10, 5, 2], [14, 4, 1]],
      bar2: [[0, 0, 2], [3, 3, 2], [7, 4, 2], [8, 5, 2], [10, 6, 2], [14, 2, 2]]
    },
    out_heyya: {
      rootMidi: 43, scale: 'major', label: 'G1 4-Chord Shake-It Walk',
      bar1: [[0, 0, 2], [2, 6, 1], [3, 0, 2], [6, 2, 2], [8, 3, 2], [10, 6, 2], [12, 3, 2], [14, 4, 2]],
      bar2: [[0, 4, 2], [2, 7, 2], [6, 4, 2], [8, 5, 2], [10, 6, 2], [12, 5, 2], [14, 2, 2]]
    },

    // 13. THE BEE GEES (Maurice Gibb)
    bg_stayinalive: {
      rootMidi: 41, scale: 'minor', label: 'F1 Maurice Gibb Disco Strut',
      bar1: [[0, 0, 2], [2, 6, 2], [3, 5, 1], [4, 0, 2], [6, 4, 2], [8, 0, 2], [10, 6, 2], [12, 5, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [2, 6, 2], [4, 3, 2], [6, 4, 2], [8, 5, 2], [10, 4, 2], [12, 2, 2], [14, 1, 2], [15, 0, 2]]
    },
    bg_nightfever: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Silky 16th Disco Glide',
      bar1: [[0, 0, 2], [3, 2, 1], [4, 4, 2], [6, 6, 2], [8, 5, 2], [10, 4, 2], [12, 3, 2], [14, 4, 1]],
      bar2: [[0, 3, 2], [2, 5, 1], [4, 6, 2], [8, 4, 2], [10, 6, 2], [12, 2, 2], [14, 1, 2]]
    },
    bg_youshouldbedancing: {
      rootMidi: 43, scale: 'minor', label: 'G1 Horn-Locked Latin Disco',
      bar1: [[0, 0, 2], [2, 6, 2], [3, 5, 2], [6, 4, 2], [8, 0, 2], [10, 2, 2], [11, 3, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [3, 6, 2], [4, 7, 2], [6, 5, 2], [8, 4, 2], [11, 2, 2], [12, 3, 2], [14, 1, 2]]
    },
    bg_jivetalkin: {
      rootMidi: 39, scale: 'major', label: 'Eb1 Syncopated Moog + Bass Hook',
      bar1: [[0, 0, 2], [2, 2, 1], [3, 4, 2], [6, 6, 2], [8, 5, 2], [10, 4, 2], [14, 2, 1]],
      bar2: [[0, 0, 2], [3, 3, 2], [6, 4, 2], [8, 6, 2], [10, 5, 2], [11, 4, 2], [14, 1, 2]]
    },
    bg_morethanawoman: {
      rootMidi: 36, scale: 'major', label: 'C1 Breezy Octave-Bounce Walk',
      bar1: [[0, 0, 2], [2, 6, 1], [4, 0, 2], [6, 6, 2], [7, 4, 1], [8, 3, 2], [10, 6, 2], [12, 3, 2], [14, 4, 2], [15, 5, 1]],
      bar2: [[0, 2, 2], [2, 7, 1], [4, 2, 2], [7, 5, 2], [8, 4, 2], [10, 6, 2], [12, 4, 2], [14, 2, 1], [15, 1, 2]]
    },

    // 14. RUSH (Geddy Lee)
    rush_tomsawyer: {
      rootMidi: 40, scale: 'minor', label: 'E1 Taurus Pedal + Rick Hook',
      bar1: [[0, 0, 2], [6, 6, 2], [7, 5, 1], [8, 0, 2], [10, 4, 2], [13, 3, 1], [14, 2, 2]],
      bar2: [[0, 0, 2], [3, 2, 2], [6, 3, 2], [8, 4, 2], [10, 5, 2], [12, 6, 2], [14, 7, 2], [15, 4, 1]]
    },
    rush_yyz: {
      rootMidi: 47, scale: 'minor', label: 'B1 Virtuoso Jazz-Prog Runs',
      bar1: [[0, 0, 2], [2, 3, 1], [3, 4, 2], [6, 6, 2], [7, 7, 2], [9, 5, 2], [10, 4, 2], [12, 3, 1], [14, 2, 2]],
      bar2: [[0, 0, 2], [3, 6, 2], [6, 5, 2], [8, 4, 2], [10, 7, 2], [11, 6, 2], [13, 4, 1], [14, 2, 2], [15, 1, 2]]
    },
    rush_subdivisions: {
      rootMidi: 42, scale: 'minor', label: 'F#1 Synth-Prog Counterpoint',
      bar1: [[0, 0, 2], [2, 0, 2], [6, 4, 1], [7, 5, 2], [10, 3, 2], [14, 4, 2]],
      bar2: [[0, 2, 2], [2, 2, 2], [6, 6, 2], [7, 5, 2], [10, 4, 2], [13, 3, 1], [14, 1, 2]]
    },
    rush_spiritofradio: {
      rootMidi: 40, scale: 'major', label: 'E1 Stadium Prog-Reggae Drive',
      bar1: [[0, 0, 2], [2, 4, 1], [4, 6, 2], [6, 4, 2], [8, 3, 2], [10, 5, 2], [12, 4, 2], [14, 2, 2]],
      bar2: [[0, 0, 2], [2, 6, 2], [6, 5, 2], [8, 4, 2], [10, 7, 2], [11, 6, 2], [14, 4, 2]]
    },
    rush_limelight: {
      rootMidi: 47, scale: 'major', label: 'B1 Le Studio Melodic Riff',
      bar1: [[0, 0, 2], [2, 0, 2], [7, 2, 2], [8, 3, 2], [10, 4, 2], [12, 5, 1], [14, 6, 2]],
      bar2: [[0, 3, 2], [2, 3, 2], [6, 5, 2], [7, 6, 2], [8, 4, 2], [10, 7, 2], [14, 4, 2]]
    },

    // 15. RADIOHEAD (Colin Greenwood)
    rad_weirdfishes: {
      rootMidi: 40, scale: 'minor', label: 'E1 Arpeggi Kraut-Melody',
      bar1: [[0, 0, 2], [3, 2, 2], [6, 4, 1], [8, 0, 2], [10, 5, 2], [12, 4, 1], [14, 3, 2]],
      bar2: [[0, 2, 2], [3, 4, 2], [6, 6, 2], [8, 5, 2], [10, 4, 2], [14, 1, 2]]
    },
    rad_15step: {
      rootMidi: 37, scale: 'minor', label: 'C#1 Late-Bar Soul Walk',
      bar1: [[0, 0, 2], [3, 0, 1], [7, 4, 2], [10, 6, 2], [11, 5, 1], [13, 4, 2], [15, 2, 1]],
      bar2: [[0, 3, 2], [3, 3, 1], [6, 5, 2], [10, 7, 2], [12, 6, 2], [13, 4, 2], [15, 1, 2]]
    },
    rad_nationalanthem: {
      rootMidi: 38, scale: 'dorian', label: 'D1 Fuzz-Bass Hypnotic Loop',
      bar1: [[0, 0, 2], [2, 0, 2], [3, 2, 2], [6, 3, 2], [8, 4, 2], [10, 6, 2], [11, 5, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [2, 0, 2], [3, 2, 2], [6, 3, 2], [7, 4, 1], [8, 4, 2], [10, 6, 2], [12, 7, 2], [14, 5, 2]]
    },
    rad_paranoidandroid: {
      rootMidi: 43, scale: 'minor', label: 'G1 Chromatic Acoustic Walk',
      bar1: [[0, 0, 2], [3, 5, 2], [6, 4, 2], [10, 3, 2], [11, 2, 2], [14, 1, 2]],
      bar2: [[0, 3, 2], [3, 2, 2], [6, 1, 2], [8, 0, 2], [10, 4, 2], [14, 6, 2]]
    },
    rad_idioteque: {
      rootMidi: 39, scale: 'minor', label: 'Eb1 4-Chord Modular Sub',
      bar1: [[0, 0, 2], [3, 0, 2], [6, 0, 1], [10, 4, 2], [12, 4, 2], [14, 5, 1]],
      bar2: [[0, 2, 2], [3, 2, 2], [6, 3, 2], [8, 3, 2], [11, 6, 2], [14, 4, 2]]
    },

    // 16. PHIL COLLINS (Leland Sklar & Moog Taurus)
    pc_intheair: {
      rootMidi: 38, scale: 'minor', label: 'D1 Ominous Taurus Drone',
      bar1: [[0, 0, 2], [10, 1, 2], [14, 0, 1]],
      bar2: [[0, 5, 2], [6, 5, 1], [10, 1, 2], [14, 4, 2]]
    },
    pc_sussudio: {
      rootMidi: 36, scale: 'minor', label: 'C1 David Frank Minimoog Funk',
      bar1: [[0, 0, 2], [2, 6, 2], [3, 5, 1], [6, 3, 2], [7, 4, 2], [10, 6, 2], [11, 5, 1], [14, 4, 2]],
      bar2: [[0, 0, 2], [3, 2, 2], [6, 3, 2], [8, 4, 2], [10, 7, 2], [11, 6, 2], [13, 4, 1], [14, 1, 2]]
    },
    pc_easylover: {
      rootMidi: 41, scale: 'minor', label: 'F1 Nathan East Fusion Drive',
      bar1: [[0, 0, 2], [2, 0, 1], [4, 2, 2], [6, 3, 2], [8, 4, 2], [10, 6, 2], [12, 5, 1], [14, 4, 2]],
      bar2: [[0, 5, 2], [2, 5, 1], [6, 4, 2], [8, 3, 2], [10, 4, 2], [11, 6, 2], [14, 1, 2]]
    },
    pc_mama: {
      rootMidi: 36, scale: 'minor', label: 'C1 Industrial Taurus Pulse',
      bar1: [[0, 0, 2], [4, 0, 2], [6, 6, 2], [10, 0, 2], [11, 5, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [3, 1, 2], [4, 0, 2], [6, 6, 2], [8, 3, 2], [10, 4, 2], [14, 1, 2]]
    },
    pc_invisibletouch: {
      rootMidi: 43, scale: 'major', label: 'G1 80s Stadium Synth-Pop',
      bar1: [[0, 0, 2], [3, 2, 1], [6, 3, 2], [8, 4, 2], [10, 6, 2], [14, 4, 2]],
      bar2: [[0, 3, 2], [3, 4, 2], [6, 5, 2], [8, 6, 2], [10, 4, 2], [12, 2, 1], [14, 0, 2]]
    },

    // 17. HOT CHIP (Al Doyle & Joe Goddard SH-101)
    hc_overandover: {
      rootMidi: 43, scale: 'minor', label: 'G1 Punk-Funk Octave Stomp',
      bar1: [[0, 0, 2], [2, 6, 2], [4, 0, 2], [7, 2, 2], [8, 3, 2], [10, 6, 2], [12, 4, 2], [15, 5, 2]],
      bar2: [[0, 0, 2], [2, 6, 2], [4, 5, 2], [6, 4, 2], [8, 3, 2], [11, 2, 2], [12, 1, 2], [15, 4, 2]]
    },
    hc_readyforthefloor: {
      rootMidi: 45, scale: 'minor', label: 'A1 Euphoric SH-101 Bounce',
      bar1: [[0, 0, 2], [3, 2, 2], [4, 3, 2], [6, 4, 2], [8, 5, 2], [10, 6, 2], [12, 4, 2], [14, 2, 1]],
      bar2: [[0, 3, 2], [3, 5, 2], [4, 6, 2], [8, 4, 2], [10, 7, 2], [12, 5, 2], [15, 1, 2]]
    },
    hc_boyfromschool: {
      rootMidi: 41, scale: 'major', label: 'F1 Filter-Disco Chord Glide',
      bar1: [[0, 0, 2], [3, 2, 1], [6, 5, 2], [8, 5, 2], [10, 4, 2], [14, 2, 1]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 6, 2], [8, 4, 2], [11, 2, 2], [14, 1, 2]]
    },
    hc_flutes: {
      rootMidi: 38, scale: 'minor', label: 'D1 Motorik Arpeggio Roller',
      bar1: [[0, 0, 2], [2, 2, 1], [4, 4, 2], [6, 6, 2], [8, 5, 2], [10, 4, 1], [12, 3, 2], [14, 2, 1]],
      bar2: [[0, 3, 2], [2, 5, 1], [4, 6, 2], [6, 7, 2], [8, 4, 2], [11, 5, 2], [12, 2, 2], [15, 1, 2]]
    },
    hc_onelifes: {
      rootMidi: 36, scale: 'minor', label: 'C1 Steel-Pan Electro-Sub',
      bar1: [[0, 0, 2], [4, 2, 2], [7, 4, 2], [10, 6, 2], [12, 5, 2], [14, 4, 1]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 6, 2], [8, 4, 2], [10, 2, 2], [12, 1, 2], [14, 4, 2]]
    },

    // 18. BLINK-182 (Mark Hoppus)
    blink_allthesmall: {
      rootMidi: 48, scale: 'major', label: 'C2 Power-Pop Picked 8ths',
      bar1: [[0, 0, 2], [2, 0, 1], [4, 0, 2], [6, 0, 1], [8, 4, 2], [10, 4, 1], [12, 4, 2], [14, 6, 2]],
      bar2: [[0, 3, 2], [2, 3, 1], [4, 3, 2], [6, 3, 1], [8, 4, 2], [10, 4, 1], [12, 5, 2], [14, 4, 2]]
    },
    blink_whatsmyage: {
      rootMidi: 42, scale: 'major', label: 'F#1 Melodic Arpeggio Hook',
      bar1: [[0, 0, 2], [2, 4, 1], [4, 6, 2], [6, 4, 1], [8, 5, 2], [10, 4, 1], [12, 6, 2], [14, 7, 2]],
      bar2: [[0, 3, 2], [2, 4, 1], [4, 6, 2], [6, 4, 1], [8, 4, 2], [10, 6, 2], [11, 7, 2], [14, 4, 2]]
    },
    blink_feelingthis: {
      rootMidi: 40, scale: 'major', label: 'E1 Flanged Breakbeat Hook',
      bar1: [[0, 0, 2], [3, 0, 2], [6, 4, 2], [10, 5, 2], [14, 6, 1]],
      bar2: [[0, 3, 2], [2, 3, 1], [6, 4, 2], [8, 5, 2], [10, 6, 2], [12, 4, 2], [14, 2, 2]]
    },
    blink_imissyou: {
      rootMidi: 47, scale: 'major', label: 'B1 Acoustic Upright Loop',
      bar1: [[0, 0, 2], [3, 0, 2], [6, 6, 1], [8, 5, 2], [10, 5, 2], [11, 4, 1], [14, 2, 1]],
      bar2: [[0, 3, 2], [3, 3, 2], [6, 5, 2], [8, 4, 2], [10, 6, 2], [14, 4, 2]]
    },
    blink_adamssong: {
      rootMidi: 38, scale: 'minor', label: 'D1 Hoppus Melodic Verse Riff',
      bar1: [[0, 0, 2], [2, 2, 1], [3, 3, 2], [6, 4, 2], [8, 5, 2], [10, 4, 1], [12, 3, 2], [14, 2, 1]],
      bar2: [[0, 5, 2], [3, 6, 2], [6, 4, 2], [8, 3, 2], [10, 2, 2], [12, 1, 2], [14, 4, 2]]
    },

    // 19. TAME IMPALA (Kevin Parker)
    ti_letithappen: {
      rootMidi: 45, scale: 'minor', label: 'A1 Psych-Disco Odyssey',
      bar1: [[0, 0, 2], [3, 2, 1], [6, 4, 2], [8, 5, 2], [10, 6, 2], [14, 4, 1]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 6, 2], [8, 4, 2], [10, 2, 2], [11, 3, 1], [14, 1, 2]]
    },
    ti_lessiknow: {
      rootMidi: 37, scale: 'minor', label: 'C#1 Currents Fuzz Hook',
      bar1: [[0, 0, 2], [3, 2, 1], [4, 3, 2], [6, 4, 2], [8, 5, 2], [10, 6, 1], [12, 4, 2], [14, 2, 1]],
      bar2: [[0, 0, 2], [2, 6, 1], [3, 4, 2], [6, 5, 1], [8, 3, 2], [10, 2, 1], [12, 4, 2], [14, 5, 1]]
    },
    ti_elephant: {
      rootMidi: 38, scale: 'minor', label: 'D1 Swung Blues-Fuzz Stomp',
      bar1: [[0, 0, 2], [2, 0, 1], [4, 0, 2], [6, 6, 2], [8, 0, 2], [10, 0, 1], [12, 2, 2], [14, 4, 2]],
      bar2: [[0, 0, 2], [2, 0, 1], [4, 2, 2], [6, 3, 2], [8, 4, 2], [10, 6, 2], [12, 5, 2], [14, 2, 2]]
    },
    ti_backwards: {
      rootMidi: 41, scale: 'major', label: 'F1 Singing Psych-Soul Walk',
      bar1: [[0, 0, 2], [2, 2, 1], [4, 3, 2], [7, 4, 2], [8, 5, 2], [10, 6, 2], [12, 4, 1], [15, 2, 1]],
      bar2: [[0, 3, 2], [2, 5, 1], [6, 6, 2], [7, 7, 2], [8, 4, 2], [10, 2, 2], [14, 1, 2], [15, 0, 1]]
    },
    ti_borderline: {
      rootMidi: 45, scale: 'minor', label: 'A1 Slow-Rush Yacht Boogie',
      bar1: [[0, 0, 2], [3, 6, 2], [6, 5, 2], [8, 3, 2], [10, 4, 2], [14, 2, 1]],
      bar2: [[0, 2, 2], [4, 4, 2], [6, 6, 2], [8, 5, 2], [10, 4, 2], [12, 3, 2], [14, 1, 2]]
    },

    // 20. PAUL SIMON (Bakithi Kumalo & Tony Levin)
    ps_50ways: {
      rootMidi: 40, scale: 'minor', label: 'E1 Tony Levin Linear Pocket',
      bar1: [[0, 0, 2], [6, 1, 2], [10, 5, 2], [14, 4, 1]],
      bar2: [[0, 3, 2], [3, 2, 1], [6, 4, 2], [8, 4, 2], [10, 6, 2], [14, 1, 2]]
    },
    ps_callmeal: {
      rootMidi: 41, scale: 'major', label: 'F1 Kumalo Mbaqanga Bounce',
      bar1: [[0, 0, 2], [2, 2, 1], [3, 4, 3], [4, 3, 2], [6, 4, 1], [8, 4, 2], [10, 6, 2], [12, 2, 1], [14, 1, 1]],
      bar2: [[0, 3, 2], [2, 5, 1], [4, 4, 2], [6, 6, 2], [8, 0, 2], [10, 2, 1], [12, 4, 2], [14, 7, 2], [15, 4, 3]]
    },
    ps_lateintheevening: {
      rootMidi: 41, scale: 'major', label: 'F1 Salsa-Funk Horn Tumbao',
      bar1: [[0, 0, 2], [3, 2, 2], [6, 4, 2], [10, 5, 2], [14, 6, 2]],
      bar2: [[0, 0, 2], [3, 3, 2], [6, 4, 2], [7, 6, 2], [10, 5, 2], [11, 4, 2], [14, 2, 2]]
    },
    ps_graceland: {
      rootMidi: 40, scale: 'major', label: 'E1 Train-Beat Fretless Glide',
      bar1: [[0, 0, 2], [3, 4, 1], [6, 6, 2], [8, 3, 2], [11, 5, 2], [14, 4, 1]],
      bar2: [[0, 0, 2], [3, 2, 1], [6, 4, 2], [8, 4, 2], [11, 7, 2], [12, 6, 2], [14, 2, 1]]
    },
    ps_diamonds: {
      rootMidi: 41, scale: 'major', label: 'F1 Singing Fretless Lead',
      bar1: [[0, 0, 2], [3, 6, 2], [6, 7, 2], [8, 3, 2], [11, 5, 2], [14, 4, 2]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 6, 2], [8, 4, 2], [10, 7, 2], [11, 6, 2], [14, 2, 2], [15, 0, 1]]
    },

    // 21. NIRVANA (Krist Novoselic)
    nir_teenspirit: {
      rootMidi: 41, scale: 'minor', label: 'F1 -> Bb -> Ab -> Db Anthem',
      bar1: [[0, 0, 2], [2, 0, 1], [3, 0, 3], [6, 3, 2], [8, 3, 2], [10, 3, 1], [11, 4, 1], [14, 2, 2]],
      bar2: [[0, 2, 2], [2, 2, 1], [3, 6, 1], [6, 5, 2], [8, 5, 2], [10, 5, 1], [11, 4, 2], [14, 1, 2]]
    },
    nir_inbloom: {
      rootMidi: 46, scale: 'minor', label: 'Bb1 Sludge-Grunge Half-Time',
      bar1: [[0, 0, 2], [2, 0, 2], [6, 4, 2], [7, 5, 2], [8, 3, 2], [10, 2, 2], [14, 1, 1]],
      bar2: [[0, 0, 2], [2, 0, 2], [6, 6, 2], [7, 5, 2], [8, 4, 2], [10, 3, 2], [13, 2, 2], [14, 1, 2]]
    },
    nir_comeasyouare: {
      rootMidi: 40, scale: 'minor', label: 'E1 Watery Chorus Walk',
      bar1: [[0, 0, 2], [2, 0, 1], [4, 1, 2], [6, 2, 2], [8, 0, 1], [10, 2, 2], [12, 0, 1], [14, 1, 2]],
      bar2: [[0, 0, 2], [2, 2, 1], [4, 3, 2], [6, 4, 2], [8, 2, 1], [10, 4, 2], [12, 3, 1], [14, 1, 2]]
    },
    nir_heartshapedbox: {
      rootMidi: 45, scale: 'minor', label: 'A1 -> F -> D Drop-D Riff',
      bar1: [[0, 0, 2], [3, 4, 1], [6, 5, 2], [8, 5, 2], [10, 6, 1], [14, 3, 2]],
      bar2: [[0, 3, 2], [3, 5, 2], [6, 4, 2], [8, 4, 2], [10, 2, 2], [11, 1, 2], [14, 0, 2]]
    },
    nir_scentless: {
      rootMidi: 40, scale: 'minor', label: 'E1 Chromatic Double-Kick Riff',
      bar1: [[0, 0, 2], [1, 0, 2], [6, 1, 2], [7, 0, 2], [8, 2, 2], [9, 0, 2], [14, 6, 2]],
      bar2: [[0, 0, 2], [1, 0, 2], [6, 4, 2], [7, 5, 2], [8, 6, 2], [9, 5, 2], [11, 4, 2], [14, 2, 2], [15, 1, 2]]
    }
  };

  const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  function midiToNoteLabel(midiPitch) {
    const p = Math.max(24, Math.min(84, Math.round(Number(midiPitch) || 40)));
    const name = NOTE_NAMES_SHARP[p % 12];
    const oct = Math.floor(p / 12) - 1;
    return `${name}${oct}`;
  }

  function getArtistBassProfile(artistId, songId) {
    const base = ARTIST_BASS_PROFILES[artistId] || ARTIST_BASS_PROFILES.zeppelin;
    const over = songId && SONG_KEY_OVERRIDES[songId] ? SONG_KEY_OVERRIDES[songId] : null;
    const rootMidi = over ? over.rootMidi : base.rootMidi;
    const scale = over ? over.scale : base.scale;
    const label = over && over.label ? over.label : base.scaleLabel || `${midiToNoteLabel(rootMidi)} ${scale}`;
    return {
      ...base,
      kit: base.kit || base.bassKit || 'jpj_jazz',
      bassKit: base.bassKit || base.kit || 'jpj_jazz',
      rootMidi,
      scale,
      scaleLabel: label,
      songBassSpec: over
    };
  }

  function getBassVoicesForSong(songId = null) {
    const sid =
      songId ||
      (typeof state !== 'undefined' && (state.selectedBassSongId || state.selectedSongId)) ||
      'zep_levee';
    const { artist } = findSongById(sid);
    const prof = getArtistBassProfile(artist.artistId, sid);
    const root = prof.rootMidi || 40;
    const isMajor = prof.scale === 'major';
    const thirdInterval = isMajor ? 4 : 3;
    const seventhInterval = isMajor ? 9 : 10; // Major 6th (Mbaqanga/Soul) or Minor 7th (Funk/Rock)

    const pitches = [
      root,                         // 0: Low Root (e.g. E1)
      Math.max(33, root - 2),       // 1: Low b7 / 5th Pickup (e.g. D1)
      root + thirdInterval,         // 2: 3rd (e.g. G1 / G#1)
      root + 5,                     // 3: 4th (e.g. A1)
      root + 7,                     // 4: 5th (e.g. B1)
      root + seventhInterval,       // 5: 6th / b7 (e.g. C#2 / D2)
      root + 12,                    // 6: Octave Root (e.g. E2)
      root + 12 + thirdInterval     // 7: High 10th / Fill (e.g. G2)
    ];

    const labels = [
      { id: 'bass_root', role: 'ROOT', color: '#10b981' },
      { id: 'bass_sub', role: 'LOW SUB', color: '#06b6d4' },
      { id: 'bass_3rd', role: isMajor ? 'MAJ 3RD' : 'MIN 3RD', color: '#38bdf8' },
      { id: 'bass_4th', role: '4TH', color: '#84dcc6' },
      { id: 'bass_5th', role: '5TH', color: '#f59e0b' },
      { id: 'bass_7th', role: isMajor ? '6TH' : 'b7TH', color: '#fb923c' },
      { id: 'bass_oct', role: 'OCTAVE', color: '#e73ff6' },
      { id: 'bass_high', role: 'HIGH RUN', color: '#f43f5e' }
    ];

    return labels.map((l, idx) => {
      const p = pitches[idx];
      const nLbl = midiToNoteLabel(p);
      return {
        id: l.id,
        name: `${l.role} (${nLbl})`,
        short: nLbl,
        noteName: nLbl,
        pitch: p,
        midi: p,
        color: l.color
      };
    });
  }

  const INSTRUMENT_LIST = ['drums', 'bass', 'keys', 'guitar', 'horns', 'vocal'];

  const INSTRUMENT_META = {
    drums: {
      id: 'drums',
      icon: '🥁',
      label: 'Drums',
      short: 'Drums',
      trackLabel: 'DRUM TRACK',
      color: '#10b981',
      border: '#84dcc6',
      bg: 'rgba(13,148,136,0.22)',
      gradient: 'linear-gradient(135deg, rgba(13,148,136,0.24), rgba(231,63,246,0.16))',
      kitLabel: 'DRUM KIT:'
    },
    bass: {
      id: 'bass',
      icon: '🎸',
      label: 'Bass',
      short: 'Bass',
      trackLabel: 'BASS TRACK',
      color: '#0284c7',
      border: '#38bdf8',
      bg: 'rgba(2,132,199,0.22)',
      gradient: 'linear-gradient(135deg, rgba(2,132,199,0.24), rgba(168,85,247,0.16))',
      kitLabel: 'BASS RIG:'
    },
    keys: {
      id: 'keys',
      icon: '🎹',
      label: 'Keys',
      short: 'Keys',
      trackLabel: 'KEYS TRACK',
      color: '#d97706',
      border: '#fbbf24',
      bg: 'rgba(217,119,6,0.22)',
      gradient: 'linear-gradient(135deg, rgba(217,119,6,0.24), rgba(234,179,8,0.16))',
      kitLabel: 'KEYS RIG:'
    },
    guitar: {
      id: 'guitar',
      icon: '⚡',
      label: 'Guitar',
      short: 'Guitar',
      trackLabel: 'GUITAR TRACK',
      color: '#e11d48',
      border: '#fb7185',
      bg: 'rgba(225,29,72,0.22)',
      gradient: 'linear-gradient(135deg, rgba(225,29,72,0.24), rgba(249,115,22,0.16))',
      kitLabel: 'GUITAR RIG:'
    },
    horns: {
      id: 'horns',
      icon: '🎺',
      label: 'Horns',
      short: 'Horns',
      trackLabel: 'HORNS TRACK',
      color: '#9333ea',
      border: '#c084fc',
      bg: 'rgba(147,51,234,0.22)',
      gradient: 'linear-gradient(135deg, rgba(147,51,234,0.24), rgba(56,189,248,0.16))',
      kitLabel: 'HORN SECTION:'
    },
    vocal: {
      id: 'vocal',
      icon: '🎤',
      label: 'Vocal Lead',
      short: 'Vocal',
      trackLabel: 'VOCAL LEAD TRACK',
      color: '#db2777',
      border: '#f472b6',
      bg: 'rgba(219,39,119,0.22)',
      gradient: 'linear-gradient(135deg, rgba(219,39,119,0.24), rgba(231,63,246,0.18))',
      kitLabel: 'VOCAL / LEAD:'
    }
  };

  function getInstrumentMeta(inst = 'drums') {
    return INSTRUMENT_META[inst] || INSTRUMENT_META.drums;
  }

  function isComposeInstrumentTab(tabId) {
    return INSTRUMENT_LIST.includes(tabId);
  }

  // ==========================================================================
  // 4C. Swappable Rigs for Keys, Guitar, Horns & Vocal Lead
  // ==========================================================================
  const KEYS_KITS = [
    {
      id: 'rhodes_warm',
      name: '🎹 Fender Rhodes MkI Suitcase (Warm Bell & Dyno Bark)',
      oscType: 'triangle', tineMix: 0.45, tineMult: 4, cutoffBase: 920, cutoffEnv: 1650, resonance: 1.4, decay: 0.48, detune: 5
    },
    {
      id: 'wurli_200a',
      name: '🎹 Wurlitzer 200A Electric Piano (Funk Reed Bite)',
      oscType: 'sawtooth', tineMix: 0.32, tineMult: 3, cutoffBase: 1150, cutoffEnv: 2100, resonance: 2.1, decay: 0.38, detune: 4
    },
    {
      id: 'hammond_b3',
      name: '🎹 Hammond B3 Organ + Leslie Rotor (Soul / Classic Rock)',
      oscType: 'sawtooth', tineMix: 0.55, tineMult: 2, cutoffBase: 1450, cutoffEnv: 950, resonance: 1.8, decay: 0.52, detune: 9
    },
    {
      id: 'clavinet_d6',
      name: '🎹 Hohner Clavinet D6 (Stevie / Funk Mutronic Snap)',
      oscType: 'square', tineMix: 0.35, tineMult: 2, cutoffBase: 1380, cutoffEnv: 2600, resonance: 3.6, decay: 0.28, detune: 3
    },
    {
      id: 'juno_chorus',
      name: '🎹 Roland Juno-106 Lush Chorus Polysynth (Psych / Indie)',
      oscType: 'sawtooth', tineMix: 0.4, tineMult: 2, cutoffBase: 880, cutoffEnv: 1950, resonance: 2.8, decay: 0.54, detune: 14
    },
    {
      id: 'grand_piano',
      name: '🎹 Studio Grand Piano (Bright Harmonic Comping)',
      oscType: 'triangle', tineMix: 0.52, tineMult: 2, cutoffBase: 1600, cutoffEnv: 2400, resonance: 1.2, decay: 0.46, detune: 4
    }
  ];

  const GUITAR_KITS = [
    {
      id: 'funk_strat',
      name: '⚡ Clean Strat Neck+Mid (Nile / JB 16th Funk Chuck)',
      oscType: 'sawtooth', cutoffBase: 1350, cutoffEnv: 2800, resonance: 2.8, decay: 0.24, pluckNoise: 0.48, drive: 0.18
    },
    {
      id: 'tele_twang',
      name: '⚡ Vintage Telecaster Bridge (Soul / Indie Crisp Pluck)',
      oscType: 'sawtooth', cutoffBase: 1550, cutoffEnv: 2600, resonance: 2.4, decay: 0.3, pluckNoise: 0.52, drive: 0.25
    },
    {
      id: 'marshall_crunch',
      name: '⚡ Plexi Tube Crunch Stack (Zeppelin / Strokes Riff)',
      oscType: 'sawtooth', cutoffBase: 1750, cutoffEnv: 2200, resonance: 3.4, decay: 0.38, pluckNoise: 0.38, drive: 0.65
    },
    {
      id: 'psych_phaser',
      name: '⚡ Psych Phaser + Tape Delay Guitar (Tame / Radiohead)',
      oscType: 'triangle', cutoffBase: 1100, cutoffEnv: 2400, resonance: 4.2, decay: 0.42, pluckNoise: 0.34, drive: 0.35
    },
    {
      id: 'grunge_chorus',
      name: '⚡ Small Clone Chorus + DS-1 Distortion (Nirvana / 90s)',
      oscType: 'square', cutoffBase: 1480, cutoffEnv: 2300, resonance: 3.6, decay: 0.36, pluckNoise: 0.4, drive: 0.72
    },
    {
      id: 'jazz_hollow',
      name: '⚡ Warm Hollowbody Archtop (Neo-Soul / D’Angelo Chords)',
      oscType: 'triangle', cutoffBase: 820, cutoffEnv: 1200, resonance: 1.6, decay: 0.36, pluckNoise: 0.24, drive: 0.12
    }
  ];

  const HORNS_KITS = [
    {
      id: 'jb_brass',
      name: '🎺 JB Funk Horns (Trumpet + Tenor Sax + Trombone Punch)',
      oscType: 'sawtooth', attack: 0.018, cutoffBase: 1150, cutoffEnv: 2300, resonance: 2.6, decay: 0.34, detune: 8
    },
    {
      id: 'stax_memphis',
      name: '🎺 Memphis Soul Brass Section (Warm Bari + Swell)',
      oscType: 'sawtooth', attack: 0.028, cutoffBase: 980, cutoffEnv: 1850, resonance: 2.2, decay: 0.44, detune: 10
    },
    {
      id: 'afrobeat_horns',
      name: '🎺 Afrobeat / Salsa Unison Horn Ensemble',
      oscType: 'sawtooth', attack: 0.02, cutoffBase: 1320, cutoffEnv: 2450, resonance: 2.9, decay: 0.38, detune: 11
    },
    {
      id: 'big_band_stab',
      name: '🎺 Big Band Tight Brass Stabs (Crisp Section Attack)',
      oscType: 'sawtooth', attack: 0.012, cutoffBase: 1450, cutoffEnv: 2700, resonance: 2.4, decay: 0.28, detune: 7
    },
    {
      id: 'synth_brass_80s',
      name: '🎺 Oberheim OB-Xa 80s Analog Synth Brass (Prince / Rush)',
      oscType: 'sawtooth', attack: 0.024, cutoffBase: 1050, cutoffEnv: 2600, resonance: 3.8, decay: 0.42, detune: 14
    },
    {
      id: 'muted_harmon',
      name: '🎺 Harmon Muted Trumpet + Cool Jazz Sax',
      oscType: 'square', attack: 0.016, cutoffBase: 1650, cutoffEnv: 2200, resonance: 4.1, decay: 0.32, detune: 6
    }
  ];

  const VOCAL_KITS = [
    {
      id: 'formant_choir',
      name: '🎤 Expressive Vowel Formant Lead ("Ah / Oh" Vocal Hook)',
      oscType: 'sawtooth', f1: 730, f2: 1220, vibratoHz: 5.5, vibratoDepth: 4.5, decay: 0.45
    },
    {
      id: 'talkbox_funk',
      name: '🎤 Classic Funk Talkbox / Vocoder Lead (Roger / Daft)',
      oscType: 'sawtooth', f1: 620, f2: 1680, vibratoHz: 6.0, vibratoDepth: 3.5, decay: 0.36
    },
    {
      id: 'soul_soprano',
      name: '🎤 Warm Soul / Falsetto Lead Voice (Prince / D’Angelo)',
      oscType: 'triangle', f1: 820, f2: 1480, vibratoHz: 5.2, vibratoDepth: 5.5, decay: 0.48
    },
    {
      id: 'theremin_glide',
      name: '🎤 Silky Portamento Synth-Vocal Lead',
      oscType: 'sine', f1: 680, f2: 1350, vibratoHz: 5.8, vibratoDepth: 6.5, decay: 0.5
    },
    {
      id: 'daft_robo',
      name: '🎤 French Touch Robotic Formant Melody',
      oscType: 'square', f1: 540, f2: 1850, vibratoHz: 4.8, vibratoDepth: 2.0, decay: 0.34
    },
    {
      id: 'indie_dream',
      name: '🎤 Dream-Pop Washed Vocal Melody (Tame / Radiohead)',
      oscType: 'sawtooth', f1: 760, f2: 1320, vibratoHz: 5.0, vibratoDepth: 5.0, decay: 0.52
    }
  ];

  function getKeysVoicesForSong(songId = null) {
    const sid = songId || (typeof state !== 'undefined' && (state.selectedKeysSongId || state.selectedSongId)) || 'zep_levee';
    const { artist } = findSongById(sid);
    const prof = getArtistBassProfile(artist.artistId, sid);
    const root = (prof.rootMidi || 40) + 24; // Octave 3-4 chord comping register
    const isMajor = prof.scale === 'major';
    const third = isMajor ? 4 : 3;
    const sixth = isMajor ? 9 : 8;
    const seventh = isMajor ? 11 : 10;
    const pitches = [
      root,               // 0: Root
      root + 2,           // 1: 9th / 2nd
      root + third,       // 2: 3rd
      root + 5,           // 3: 4th / 11th
      root + 7,           // 4: 5th
      root + sixth,       // 5: 6th / 13th
      root + seventh,     // 6: 7th
      root + 12           // 7: High Octave
    ];
    const roles = [
      { id: 'keys_root', role: 'CHORD ROOT', color: '#fbbf24' },
      { id: 'keys_9th', role: '9TH COLOR', color: '#f59e0b' },
      { id: 'keys_3rd', role: isMajor ? 'MAJ 3RD' : 'MIN 3RD', color: '#fcd34d' },
      { id: 'keys_4th', role: '11TH / SUS4', color: '#84dcc6' },
      { id: 'keys_5th', role: '5TH VOICING', color: '#38bdf8' },
      { id: 'keys_6th', role: '13TH / 6TH', color: '#a855f7' },
      { id: 'keys_7th', role: isMajor ? 'MAJ 7TH' : 'DOM/MIN 7', color: '#fb923c' },
      { id: 'keys_oct', role: 'TOP OCTAVE', color: '#e73ff6' }
    ];
    return roles.map((r, i) => {
      const p = pitches[i];
      const nLbl = midiToNoteLabel(p);
      return { id: r.id, name: `${r.role} (${nLbl})`, short: nLbl, noteName: nLbl, pitch: p, midi: p, color: r.color };
    });
  }

  function getGuitarVoicesForSong(songId = null) {
    const sid = songId || (typeof state !== 'undefined' && (state.selectedGuitarSongId || state.selectedSongId)) || 'zep_levee';
    const { artist } = findSongById(sid);
    const prof = getArtistBassProfile(artist.artistId, sid);
    const root = (prof.rootMidi || 40) + 12; // Guitar low-mid riff & chuck register (Octave 2-3)
    const isMajor = prof.scale === 'major';
    const third = isMajor ? 4 : 3;
    const seventh = isMajor ? 9 : 10;
    const pitches = [
      root,                   // 0: Low Root Riff
      root + third,           // 1: 3rd Riff
      root + 5,               // 2: 4th Riff
      root + 7,               // 3: Power 5th
      root + seventh,         // 4: 6th / b7th
      root + 12,              // 5: Octave Root Pluck
      root + 12 + third,      // 6: High 3rd Skank
      root + 14               // 7: Funk 9th / Chuck
    ];
    const roles = [
      { id: 'gtr_root', role: 'LOW RIFF', color: '#fb7185' },
      { id: 'gtr_3rd', role: isMajor ? 'MAJ 3RD' : 'BLUES 3RD', color: '#f43f5e' },
      { id: 'gtr_4th', role: '4TH BEND', color: '#fb923c' },
      { id: 'gtr_5th', role: 'POWER 5TH', color: '#f59e0b' },
      { id: 'gtr_7th', role: isMajor ? '6TH PLUCK' : 'b7TH RIFF', color: '#eab308' },
      { id: 'gtr_oct', role: 'OCTAVE LEAD', color: '#38bdf8' },
      { id: 'gtr_skank', role: 'FUNK SKANK', color: '#a855f7' },
      { id: 'gtr_chuck', role: '9TH / CHUCK', color: '#e73ff6' }
    ];
    return roles.map((r, i) => {
      const p = pitches[i];
      const nLbl = midiToNoteLabel(p);
      return { id: r.id, name: `${r.role} (${nLbl})`, short: nLbl, noteName: nLbl, pitch: p, midi: p, color: r.color };
    });
  }

  function getHornsVoicesForSong(songId = null) {
    const sid = songId || (typeof state !== 'undefined' && (state.selectedHornsSongId || state.selectedSongId)) || 'zep_levee';
    const { artist } = findSongById(sid);
    const prof = getArtistBassProfile(artist.artistId, sid);
    const root = (prof.rootMidi || 40) + 24; // Brass section register
    const isMajor = prof.scale === 'major';
    const third = isMajor ? 4 : 3;
    const seventh = isMajor ? 9 : 10;
    const pitches = [
      root - 12,              // 0: Bari Sax Low Root
      root - 5,               // 1: Trombone Low 5th
      root,                   // 2: Tenor Sax Root
      root + third,           // 3: Horn Section 3rd
      root + 7,               // 4: Brass 5th Stab
      root + seventh,         // 5: Soul 6th / b7th
      root + 12,              // 6: Trumpet High Oct
      root + 12 + third       // 7: High Brass Swell
    ];
    const roles = [
      { id: 'horn_bari', role: 'BARI SAX', color: '#c084fc' },
      { id: 'horn_bone', role: 'TROMBONE', color: '#a855f7' },
      { id: 'horn_tenor', role: 'TENOR ROOT', color: '#38bdf8' },
      { id: 'horn_3rd', role: 'HORN 3RD', color: '#84dcc6' },
      { id: 'horn_5th', role: 'BRASS 5TH', color: '#fbbf24' },
      { id: 'horn_7th', role: 'BRASS 7TH', color: '#fb923c' },
      { id: 'horn_tpt', role: 'TRUMPET OCT', color: '#f43f5e' },
      { id: 'horn_high', role: 'HIGH STAB', color: '#e73ff6' }
    ];
    return roles.map((r, i) => {
      const p = pitches[i];
      const nLbl = midiToNoteLabel(p);
      return { id: r.id, name: `${r.role} (${nLbl})`, short: nLbl, noteName: nLbl, pitch: p, midi: p, color: r.color };
    });
  }

  function getVocalVoicesForSong(songId = null) {
    const sid = songId || (typeof state !== 'undefined' && (state.selectedVocalSongId || state.selectedSongId)) || 'zep_levee';
    const { artist } = findSongById(sid);
    const prof = getArtistBassProfile(artist.artistId, sid);
    const root = (prof.rootMidi || 40) + 24; // Lead vocal register
    const isMajor = prof.scale === 'major';
    const third = isMajor ? 4 : 3;
    const sixth = isMajor ? 9 : 10;
    const pitches = [
      root - 5,               // 0: Low 5th Pickup
      root,                   // 1: Tonic Lead Root
      root + 2,               // 2: 2nd Passing Tone
      root + third,           // 3: 3rd Melody Hook
      root + 5,               // 4: 4th Chorus Lift
      root + 7,               // 5: 5th Anthem Peak
      root + sixth,           // 6: Soul 6th / b7th
      root + 12               // 7: High Octave Hook
    ];
    const roles = [
      { id: 'voc_low', role: 'LOW PICKUP', color: '#f472b6' },
      { id: 'voc_root', role: 'TONIC LEAD', color: '#ec4899' },
      { id: 'voc_2nd', role: '2ND PASS', color: '#fb7185' },
      { id: 'voc_3rd', role: '3RD MELODY', color: '#fbbf24' },
      { id: 'voc_4th', role: '4TH LIFT', color: '#84dcc6' },
      { id: 'voc_5th', role: '5TH PEAK', color: '#38bdf8' },
      { id: 'voc_6th', role: 'SOUL NOTE', color: '#c084fc' },
      { id: 'voc_oct', role: 'HIGH HOOK', color: '#e73ff6' }
    ];
    return roles.map((r, i) => {
      const p = pitches[i];
      const nLbl = midiToNoteLabel(p);
      return { id: r.id, name: `${r.role} (${nLbl})`, short: nLbl, noteName: nLbl, pitch: p, midi: p, color: r.color };
    });
  }

  function getActiveVoices(instrumentOverride = null, songIdOverride = null) {
    const inst = instrumentOverride || (typeof state !== 'undefined' && state.composeInstrument) || 'drums';
    const sid =
      songIdOverride ||
      (typeof state !== 'undefined' && getInstrumentSongId(inst)) ||
      'zep_levee';
    if (inst === 'bass') return getBassVoicesForSong(sid);
    if (inst === 'keys') return getKeysVoicesForSong(sid);
    if (inst === 'guitar') return getGuitarVoicesForSong(sid);
    if (inst === 'horns') return getHornsVoicesForSong(sid);
    if (inst === 'vocal') return getVocalVoicesForSong(sid);
    return DRUM_VOICES;
  }

  function getKitsForInstrument(inst = 'drums') {
    if (inst === 'bass') return BASS_KITS;
    if (inst === 'keys') return KEYS_KITS;
    if (inst === 'guitar') return GUITAR_KITS;
    if (inst === 'horns') return HORNS_KITS;
    if (inst === 'vocal') return VOCAL_KITS;
    return DRUM_KITS;
  }

  function getActiveBassKitProfile(bassKitIdOverride = null) {
    const kid = bassKitIdOverride || (typeof state !== 'undefined' && state.bassKitId) || 'jpj_jazz';
    return BASS_KITS.find((k) => k.id === kid) || BASS_KITS[0];
  }

  function getActiveKeysKitProfile(kitOverride = null) {
    const kid = kitOverride || (typeof state !== 'undefined' && state.keysKitId) || 'rhodes_warm';
    return KEYS_KITS.find((k) => k.id === kid) || KEYS_KITS[0];
  }

  function getActiveGuitarKitProfile(kitOverride = null) {
    const kid = kitOverride || (typeof state !== 'undefined' && state.guitarKitId) || 'funk_strat';
    return GUITAR_KITS.find((k) => k.id === kid) || GUITAR_KITS[0];
  }

  function getActiveHornsKitProfile(kitOverride = null) {
    const kid = kitOverride || (typeof state !== 'undefined' && state.hornsKitId) || 'jb_brass';
    return HORNS_KITS.find((k) => k.id === kid) || HORNS_KITS[0];
  }

  function getActiveVocalKitProfile(kitOverride = null) {
    const kid = kitOverride || (typeof state !== 'undefined' && state.vocalKitId) || 'formant_choir';
    return VOCAL_KITS.find((k) => k.id === kid) || VOCAL_KITS[0];
  }

  function triggerKeysVoice(ctx, pitch, velocity = 100, when = 0, durationSec = 0.36, kitOverride = null) {
    const kit = getActiveKeysKitProfile(kitOverride);
    const t0 = Math.max(ctx.currentTime, when || ctx.currentTime);
    const midi = Math.max(36, Math.min(88, Number(pitch) || 64));
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const velNorm = Math.max(0.15, Math.min(1.0, (velocity || 100) / 127));
    const isGhost = velocity < 62;
    const isAccent = velocity >= 115;
    const noteDur = isGhost ? Math.min(0.14, durationSec * 0.5) : Math.max(0.22, Math.min(0.95, durationSec || kit.decay || 0.44));

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = kit.oscType || 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t0);
    osc2.frequency.setValueAtTime(freq * (kit.tineMult || 2), t0);
    osc1.detune.setValueAtTime(-(kit.detune || 4), t0);
    osc2.detune.setValueAtTime(kit.detune || 4, t0);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const peakCut = (kit.cutoffBase || 1000) + (kit.cutoffEnv || 1600) * velNorm * (isAccent ? 1.2 : 0.85);
    filter.frequency.setValueAtTime(peakCut, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(220, kit.cutoffBase || 800), t0 + noteDur * 0.8);
    filter.Q.setValueAtTime(kit.resonance || 1.5, t0);

    const g1 = ctx.createGain();
    const gTine = ctx.createGain();
    const master = ctx.createGain();
    g1.gain.setValueAtTime(0.42, t0);
    gTine.gain.setValueAtTime(0.26 * (kit.tineMix || 0.4) * velNorm, t0);
    gTine.gain.exponentialRampToValueAtTime(0.001, t0 + Math.min(0.16, noteDur * 0.5));

    master.gain.setValueAtTime(0.001, t0);
    master.gain.linearRampToValueAtTime(0.48 * velNorm, t0 + 0.008);
    master.gain.exponentialRampToValueAtTime(0.001, t0 + noteDur + 0.04);

    osc1.connect(g1).connect(filter);
    osc2.connect(gTine).connect(filter);

    if (isAccent) {
      // Rich chord fifth harmonic on accented comping stabs
      const oscFifth = ctx.createOscillator();
      const gFifth = ctx.createGain();
      oscFifth.type = 'triangle';
      oscFifth.frequency.setValueAtTime(freq * 1.4983, t0);
      gFifth.gain.setValueAtTime(0.18 * velNorm, t0);
      oscFifth.connect(gFifth).connect(filter);
      oscFifth.start(t0);
      oscFifth.stop(t0 + noteDur + 0.04);
    }

    filter.connect(master).connect(ctx.destination);
    osc1.start(t0);
    osc2.start(t0);
    osc1.stop(t0 + noteDur + 0.05);
    osc2.stop(t0 + noteDur + 0.05);
  }

  function triggerGuitarVoice(ctx, pitch, velocity = 100, when = 0, durationSec = 0.26, kitOverride = null) {
    const kit = getActiveGuitarKitProfile(kitOverride);
    const t0 = Math.max(ctx.currentTime, when || ctx.currentTime);
    const midi = Math.max(36, Math.min(86, Number(pitch) || 52));
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const velNorm = Math.max(0.15, Math.min(1.0, (velocity || 100) / 127));
    const isGhost = velocity < 62; // Tight muted fret-hand funk chuck
    const isAccent = velocity >= 115;
    const noteDur = isGhost ? 0.065 : Math.max(0.14, Math.min(0.75, durationSec || kit.decay || 0.28));

    const filter = ctx.createBiquadFilter();
    filter.type = isGhost ? 'bandpass' : 'lowpass';
    const cutStart = isGhost
      ? 1850
      : (kit.cutoffBase || 1400) + (kit.cutoffEnv || 2400) * velNorm * (isAccent ? 1.25 : 0.9);
    filter.frequency.setValueAtTime(cutStart, t0);
    if (!isGhost) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(320, kit.cutoffBase || 1100), t0 + noteDur * 0.7);
    }
    filter.Q.setValueAtTime(isGhost ? 3.2 : kit.resonance || 2.8, t0);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, t0);
    master.gain.linearRampToValueAtTime((isGhost ? 0.38 : 0.5) * velNorm, t0 + 0.004);
    master.gain.exponentialRampToValueAtTime(0.001, t0 + noteDur + 0.025);
    filter.connect(master).connect(ctx.destination);

    // Pick transient / fret-chuck burst
    const noiseDur = isGhost ? 0.045 : 0.018;
    const bufLen = Math.max(64, Math.floor(ctx.sampleRate * noiseDur));
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime((isGhost ? 0.75 : kit.pluckNoise || 0.4) * velNorm, t0);
    noise.connect(nGain).connect(filter);
    noise.start(t0);

    if (!isGhost) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = kit.oscType || 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, t0);
      osc2.frequency.setValueAtTime(freq * (isAccent && (kit.drive || 0) >= 0.4 ? 1.4983 : 1.003), t0);
      const oGain = ctx.createGain();
      oGain.gain.setValueAtTime(0.45 * (1 + (kit.drive || 0.2) * 0.35), t0);
      osc1.connect(oGain);
      osc2.connect(oGain);
      oGain.connect(filter);
      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + noteDur + 0.03);
      osc2.stop(t0 + noteDur + 0.03);
    }
  }

  function triggerHornsVoice(ctx, pitch, velocity = 105, when = 0, durationSec = 0.34, kitOverride = null) {
    const kit = getActiveHornsKitProfile(kitOverride);
    const t0 = Math.max(ctx.currentTime, when || ctx.currentTime);
    const midi = Math.max(36, Math.min(88, Number(pitch) || 64));
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const velNorm = Math.max(0.18, Math.min(1.0, (velocity || 100) / 127));
    const isGhost = velocity < 62;
    const isAccent = velocity >= 115;
    const noteDur = isGhost ? 0.13 : Math.max(0.18, Math.min(0.95, durationSec || kit.decay || 0.36));
    const atk = isGhost ? 0.01 : kit.attack || 0.02;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    osc1.type = kit.oscType || 'sawtooth';
    osc2.type = kit.oscType || 'sawtooth';
    osc3.type = 'triangle';
    osc1.frequency.setValueAtTime(freq * 0.985, t0);
    osc1.frequency.linearRampToValueAtTime(freq, t0 + atk);
    osc2.frequency.setValueAtTime(freq, t0);
    osc2.detune.setValueAtTime(kit.detune || 8, t0);
    osc3.frequency.setValueAtTime(isAccent ? freq * 1.4983 : freq * 0.5, t0);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const baseCut = kit.cutoffBase || 1100;
    const peakCut = baseCut + (kit.cutoffEnv || 2200) * velNorm * (isAccent ? 1.25 : 0.9);
    filter.frequency.setValueAtTime(baseCut * 0.65, t0);
    filter.frequency.linearRampToValueAtTime(peakCut, t0 + atk * 1.3);
    filter.frequency.exponentialRampToValueAtTime(Math.max(400, baseCut), t0 + noteDur);
    filter.Q.setValueAtTime(kit.resonance || 2.5, t0);

    const mix = ctx.createGain();
    const master = ctx.createGain();
    mix.gain.setValueAtTime(0.32, t0);
    master.gain.setValueAtTime(0.001, t0);
    master.gain.linearRampToValueAtTime(0.54 * velNorm, t0 + atk);
    master.gain.exponentialRampToValueAtTime(0.001, t0 + noteDur + 0.04);

    osc1.connect(mix);
    osc2.connect(mix);
    osc3.connect(mix);
    mix.connect(filter).connect(master).connect(ctx.destination);

    osc1.start(t0);
    osc2.start(t0);
    osc3.start(t0);
    osc1.stop(t0 + noteDur + 0.05);
    osc2.stop(t0 + noteDur + 0.05);
    osc3.stop(t0 + noteDur + 0.05);
  }

  function triggerVocalVoice(ctx, pitch, velocity = 105, when = 0, durationSec = 0.42, kitOverride = null) {
    const kit = getActiveVocalKitProfile(kitOverride);
    const t0 = Math.max(ctx.currentTime, when || ctx.currentTime);
    const midi = Math.max(40, Math.min(92, Number(pitch) || 64));
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const velNorm = Math.max(0.18, Math.min(1.0, (velocity || 100) / 127));
    const isGhost = velocity < 62;
    const isAccent = velocity >= 115;
    const noteDur = isGhost ? 0.16 : Math.max(0.22, Math.min(1.05, durationSec || kit.decay || 0.45));

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = kit.oscType || 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq * 0.992, t0);
    osc1.frequency.exponentialRampToValueAtTime(freq, t0 + 0.028);
    osc2.frequency.setValueAtTime(freq, t0);

    // Expressive vibrato LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(kit.vibratoHz || 5.5, t0);
    lfoGain.gain.setValueAtTime(kit.vibratoDepth || 4.5, t0);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    // Dual Parallel Vowel Formant Filters (F1 & F2)
    const f1 = ctx.createBiquadFilter();
    const f2 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f2.type = 'bandpass';
    const vowelShift = isAccent ? 1.18 : isGhost ? 0.85 : 1.0;
    f1.frequency.setValueAtTime((kit.f1 || 730) * vowelShift, t0);
    f2.frequency.setValueAtTime((kit.f2 || 1220) * vowelShift, t0);
    f1.Q.setValueAtTime(4.2, t0);
    f2.Q.setValueAtTime(5.0, t0);

    const srcMix = ctx.createGain();
    const master = ctx.createGain();
    srcMix.gain.setValueAtTime(0.55, t0);
    master.gain.setValueAtTime(0.001, t0);
    master.gain.linearRampToValueAtTime(0.62 * velNorm, t0 + 0.022);
    master.gain.exponentialRampToValueAtTime(0.001, t0 + noteDur + 0.05);

    osc1.connect(srcMix);
    osc2.connect(srcMix);
    srcMix.connect(f1).connect(master);
    srcMix.connect(f2).connect(master);
    master.connect(ctx.destination);

    osc1.start(t0);
    osc2.start(t0);
    lfo.start(t0);
    osc1.stop(t0 + noteDur + 0.06);
    osc2.stop(t0 + noteDur + 0.06);
    lfo.stop(t0 + noteDur + 0.06);
  }

  function triggerInstrumentVoice(ctx, inst, pitch, velocity = 105, when = 0, durationSec = 0.28, kitOverride = null) {
    if (inst === 'bass') {
      triggerBassVoice(ctx, pitch, velocity, when, durationSec, kitOverride);
    } else if (inst === 'keys') {
      triggerKeysVoice(ctx, pitch, velocity, when, durationSec, kitOverride);
    } else if (inst === 'guitar') {
      triggerGuitarVoice(ctx, pitch, velocity, when, durationSec, kitOverride);
    } else if (inst === 'horns') {
      triggerHornsVoice(ctx, pitch, velocity, when, durationSec, kitOverride);
    } else if (inst === 'vocal') {
      triggerVocalVoice(ctx, pitch, velocity, when, durationSec, kitOverride);
    } else {
      triggerDrumVoice(ctx, pitch, velocity, when);
    }
  }

  function triggerBassVoice(ctx, pitch, velocity = 105, when = 0, durationSec = 0.28, bassKitOverride = null) {
    const kit = getActiveBassKitProfile(bassKitOverride);
    const t0 = Math.max(ctx.currentTime, when || ctx.currentTime);
    const midi = Math.max(28, Math.min(76, Number(pitch) || 40));
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const velNorm = Math.max(0.15, Math.min(1.0, (velocity || 100) / 127));
    const isGhost = velocity < 62;
    const isAccent = velocity >= 115;

    const noteDur = isGhost
      ? Math.min(0.11, durationSec * 0.55)
      : Math.max(0.16, Math.min(0.85, durationSec || kit.decay || 0.32));

    // Main harmonic oscillator (Sawtooth / Triangle / Square)
    const oscMain = ctx.createOscillator();
    oscMain.type = kit.oscType || 'sawtooth';
    oscMain.frequency.setValueAtTime(freq, t0);
    if (isAccent) {
      // Subtle pluck pitch-attack on accented slap/picked notes
      oscMain.frequency.setValueAtTime(freq * 1.035, t0);
      oscMain.frequency.exponentialRampToValueAtTime(freq, t0 + 0.025);
    }

    // Deep Sub-Oscillator (Sine at fundamental)
    const oscSub = ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(freq, t0);

    // Low-pass resonant filter with envelope
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const baseCut = isGhost ? kit.cutoffBase * 0.65 : kit.cutoffBase;
    const peakCut = isGhost
      ? baseCut + 220
      : baseCut + kit.cutoffEnv * (isAccent ? 1.25 : 0.85) * velNorm;
    filter.frequency.setValueAtTime(peakCut, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(90, baseCut), t0 + Math.min(0.18, noteDur * 0.75));
    filter.Q.setValueAtTime(isAccent ? kit.resonance * 1.2 : kit.resonance, t0);

    const mainGain = ctx.createGain();
    const subGain = ctx.createGain();
    const masterGain = ctx.createGain();

    mainGain.gain.setValueAtTime(0.54 * (1 + (kit.drive || 0.2) * 0.4), t0);
    subGain.gain.setValueAtTime(0.68 * (kit.subMix || 0.8), t0);

    const peakAmp = 0.72 * velNorm;
    masterGain.gain.setValueAtTime(0.001, t0);
    masterGain.gain.linearRampToValueAtTime(peakAmp, t0 + 0.006);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t0 + noteDur + 0.03);

    oscMain.connect(mainGain).connect(filter);
    oscSub.connect(subGain).connect(filter);
    filter.connect(masterGain).connect(ctx.destination);

    oscMain.start(t0);
    oscSub.start(t0);
    oscMain.stop(t0 + noteDur + 0.04);
    oscSub.stop(t0 + noteDur + 0.04);
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
      } else if (style === 'kevin_parker') {
        // Kevin Parker flanged psych-tom + squashed snare + clap pickup
        hit(2, s60, 2, 1);
        hit(3, s60, 2, 1);
        hit(6, s60 + 1, 2, 1);
        hit(6, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
        hit(7, nextSectionFirstStep, 2, 1);
      } else if (style === 'steve_gadd') {
        // Steve Gadd linear inverted paradiddle (snare ghost -> rim -> floor tom -> kick)
        hit(2, s60, 3, 2);
        hit(1, s60 + 1, 2, 1);
        hit(6, s60 + 2, 2, 1);
        hit(0, s60 + 3, 2, 1);
      } else if (style === 'dave_grohl') {
        // Dave Grohl flam-snare + floor-tom + 24" kick cannon turnaround
        hit(2, s60, 2, 2);
        hit(6, s60, 2, 1);
        hit(0, s60 + 1, 2, 1);
        hit(2, s60 + 2, 2, 1);
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
    } else if (style === 'kevin_parker') {
      // Kevin Parker signature DBX-165A psychedelic tumbling tom + snare triplet-drag fill
      hit(0, s56, 2, 1);
      hit(2, s56 + 1, 2, highFill ? 2 : 1);
      hit(6, s56 + 2, 2, 1);
      hit(6, s56 + 3, 1, 1);
      hit(0, s56 + 4, 2, 1);
      hit(2, s56 + 4, 2, 1);
      hit(6, s56 + 5, 2, 1);
      hit(6, s56 + 6, 2, highFill ? 2 : 1);
      hit(5, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'steve_gadd') {
      // Steve Gadd linear 6-stroke roll / paradiddle-diddle across snare, rim, rack & floor tom
      hit(2, s56, 2, 2);
      hit(2, s56 + 1, 3, 1);
      hit(1, s56 + 2, 2, 1);
      hit(0, s56 + 3, 2, 1);
      hit(6, s56 + 4, 2, 1);
      hit(2, s56 + 5, 3, highFill ? 2 : 1);
      hit(6, s56 + 6, 2, 1);
      hit(0, s56 + 7, 2, 1);
      hit(7, nextSectionFirstStep, 2, 1);
    } else if (style === 'dave_grohl') {
      // Dave Grohl "Teen Spirit / Scentless" 16th-note snare & floor-tom cannon crescendo with kick triplets
      hit(0, s56, 2, 1);
      hit(2, s56 + 1, 2, 1);
      hit(2, s56 + 2, 2, highFill ? 2 : 1);
      hit(6, s56 + 2, 2, 1);
      hit(0, s56 + 3, 2, 1);
      hit(2, s56 + 4, 2, 1);
      hit(6, s56 + 4, 2, 1);
      hit(2, s56 + 5, 2, 1);
      hit(2, s56 + 6, 2, highFill ? 2 : 1);
      hit(6, s56 + 6, 2, 1);
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
      } else if (songId === 'ps_50ways' && (secIdx === 0 || secIdx === 2)) {
        // Steve Gadd "50 Ways" Verse/Bridge (Sections 1 & 3): linear military paradiddle ostinato (light snare on 4, floor tom on 6/14, ghost snares)
        hit(2, o + 4, 1, 1);
        hit(1, o + 12, 2, 1);
        for (const s of [6, 14, 15]) hit(6, o + s, s === 14 ? 2 : 1, 1);
      } else if (songId === 'nir_teenspirit' && secIdx === 0 && barInSec < 3) {
        // Nirvana "Smells Like Teen Spirit" Verse (Bars 1–3): restrained closed-hat + kick/snare pocket before Bar 4 pre-chorus build
        hit(2, o + 4, 2, 1);
        hit(2, o + 12, 2, 1);
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
        } else if (style === 'kevin_parker') {
          // Kevin Parker Psych-Disco / Phased Breakdown Bridge (Bars 9–12):
          // Offbeat open hats + syncopated rim/clap + tumbling DBX tom rolls
          for (const s of [2, 6, 10, 14]) hit(5, o + s, 2, 1);
          for (const s of [4, 12]) hit(3, o + s, 2, 1);
          if (barInSec % 2 === 1) {
            for (const s of [11, 13, 14, 15]) hit(6, o + s, s % 2 === 0 ? 2 : 1, 1);
          }
        } else if (style === 'steve_gadd') {
          // Steve Gadd / Graceland Percussion & Linear Pocket Bridge (Bars 9–12):
          // Mozambique cowbell/rim pattern + talking-drum tom accents + ghost snare chatter
          for (const s of [0, 2, 5, 7, 10, 12, 15]) hit(1, o + s, s % 5 === 0 ? 2 : 1, 1);
          for (const s of [3, 6, 11, 14]) hit(6, o + s, 1, 1);
          for (const s of [1, 9, 13]) if (g[2][o + s].state === 0) hit(2, o + s, 3, 1);
        } else if (style === 'dave_grohl') {
          // Dave Grohl Sound City / Albini Room Bridge (Bars 9–12):
          // Thunderous floor-tom & crash quarter-note stomp with Bar-12 16th-note snare/tom launch build!
          for (let s = 0; s < 16; s += 4) {
            hit(7, o + s, 2, 1);
            hit(6, o + s, 2, 1);
          }
          if (barInSec === 3) {
            for (let s = 8; s < 16; s++) {
              hit(2, o + s, s % 2 === 0 ? 2 : 1, 1);
              hit(6, o + s, s % 2 === 0 ? 2 : 1, 1);
            }
          }
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
  // 5B. 16-Bar (256-Step) Song-Specific Signature Bassline Generator
  //     Maps 8 Bass Scale Voices (0: Root, 1: Sub, 2: 3rd, 3: 4th, 4: 5th, 5: 7th, 6: Octave, 7: High Run)
  // ==========================================================================
  function generateSongBassGrid(songId, intensity = 70, ghostPct = 45, octaveEnergy = 60, fillPct = 65) {
    const { artist, song } = findSongById(songId);
    const prof = getArtistBassProfile(artist.artistId, song.id);
    const songSpec = prof.songBassSpec || SONG_KEY_OVERRIDES[song.id] || SONG_KEY_OVERRIDES.zep_levee;
    const g = createEmptyGrid256();

    // Deterministic song hash so any procedural fills/ghosts also differ per song within the same artist
    let songHash = 0;
    const idStr = String(song.id || '');
    for (let c = 0; c < idStr.length; c++) {
      songHash = (songHash * 31 + idStr.charCodeAt(c)) & 0x7fffffff;
    }

    const setNote = (vIdx, step, st = 1, sub = 1) => {
      if (step < 0 || step >= TOTAL_STEPS) return;
      const clampedV = Math.max(0, Math.min(7, Number(vIdx) || 0));
      for (let v = 0; v < 8; v++) {
        g[v][step] = { state: 0, sub: 1 };
      }
      g[clampedV][step] = { state: st, sub };
    };

    for (let b = 0; b < TOTAL_BARS; b++) {
      const o = b * 16;
      const secIdx = Math.floor(b / 4); // 0: Verse, 1: Chorus, 2: Bridge, 3: Climax
      const barInSec = b % 4;
      const isEvenBar = barInSec % 2 === 1;

      const secIntensity =
        secIdx === 0
          ? Math.max(20, intensity - 10)
          : secIdx === 1
          ? Math.min(100, intensity + 10)
          : secIdx === 2
          ? intensity
          : Math.min(100, intensity + 18);

      const secOctave =
        secIdx === 0
          ? Math.max(15, octaveEnergy - 12)
          : secIdx === 1
          ? Math.min(100, octaveEnergy + 15)
          : secIdx === 3
          ? Math.min(100, octaveEnergy + 22)
          : octaveEnergy;

      // 1. Lay down the Song's Unique Bar 1 / Bar 2 Signature Bass Riff from SONG_KEY_OVERRIDES
      const baseRiff = isEvenBar
        ? (songSpec.bar2 || songSpec.bar1 || [[0, 0, 2], [8, 4, 2]])
        : (songSpec.bar1 || [[0, 0, 2], [8, 0, 2]]);

      for (let i = 0; i < baseRiff.length; i++) {
        const [st, rawV, rawVel] = baseRiff[i];
        // Filter out lighter passing notes if Intensity dial is turned down low
        if (secIntensity < 40 && st % 4 !== 0 && i % 2 === 1) continue;
        if (rawVel === 3 && ghostPct < 20) continue;

        let v = rawV;
        // Section-aware musical progression & harmonic development:
        if (secIdx === 1) {
          // Chorus (Bars 5–8): harmonic lift on Bar 2/3 & Octave/High-10th energy boost
          if (barInSec === 1 && v === 0) {
            v = (songHash % 2 === 0) ? 3 : 4;
          } else if (barInSec === 2 && v === 0) {
            v = 2;
          }
          if (secOctave >= 68 && st % 4 === 2 && v === 0) {
            v = 6;
          }
        } else if (secIdx === 2) {
          // Bridge (Bars 9–12): shift root voice to relative degree (3rd, 4th, 5th, or b7th) for Bridge contrast
          const bridgeMap = [3, 5, 2, 4, 3, 6, 4, 7];
          if (barInSec < 2) {
            v = bridgeMap[rawV] ?? rawV;
          } else if (barInSec === 2 && rawV === 0) {
            v = 1; // Deep Sub drop in Bar 11
          }
        } else if (secIdx === 3) {
          // Climax (Bars 13–16): push upper tones & octaves harder
          if (secOctave >= 55 && (v === 4 || v === 5) && st >= 10) {
            v = v === 4 ? 6 : 7;
          }
        }

        // If Octave / Filter dial is set very low (<30%), fold high octave notes down to Root/5th
        if (secOctave < 30 && v >= 6) {
          v = v === 6 ? 0 : 4;
        }

        setNote(v, o + st, rawVel || 1, 1);
      }

      // 2. Lock extra syncopated Kick Drum hits from this specific song when Intensity is high
      const kickList = isEvenBar && song.kicksBar2 ? song.kicksBar2 : song.kicks || [0, 8];
      if (secIntensity >= 62) {
        const songScaleWalk = [0, 2, 3, 4, 5, 6, 1];
        for (let kIdx = 0; kIdx < kickList.length; kIdx++) {
          const ks = kickList[kIdx];
          const alreadyHasNote = [0, 1, 2, 3, 4, 5, 6, 7].some((v) => g[v][o + ks].state > 0);
          if (!alreadyHasNote && (secIntensity >= 80 || (kIdx + barInSec) % 2 === 0)) {
            const pickV = songScaleWalk[(ks + songHash + b + secIdx) % songScaleWalk.length];
            setNote(pickV, o + ks, ks % 4 === 0 ? 2 : 1, 1);
          }
        }
      }

      // 3. Ghost / Muted Percussive Dead-Notes in the Pocket (unique positions per song)
      if (ghostPct >= 35) {
        const ghostCandidates = [1, 5, 9, 11, 13, 15];
        for (let gIdx = 0; gIdx < ghostCandidates.length; gIdx++) {
          const gs = ghostCandidates[gIdx];
          const hasAny = [0, 1, 2, 3, 4, 5, 6, 7].some((v) => g[v][o + gs].state > 0);
          if (!hasAny && (gs + b + songHash) % 3 === 0 && ghostPct >= 38 + (gIdx % 3) * 14) {
            const ghostV = (songHash + gIdx) % 2 === 0 ? 0 : 1;
            setNote(ghostV, o + gs, 3, 1); // State 3 = Muted/Dead Ghost Pluck
          }
        }
      }

      // 4. Song-Specific Section-End Bass Walkup / Turnaround Runs (Bar 4, 8, 12, 16)
      if (barInSec === 3 && fillPct >= 30) {
        const isClimaxBar = secIdx === 3;
        const fillVariant = (songHash + secIdx) % 4;
        if (fillPct >= 65 || isClimaxBar) {
          const turnaroundPatterns = [
            [[10, 2, 1], [12, 3, 2], [13, 4, 1], [14, 5, 2], [15, 6, 2]],
            [[10, 6, 2], [11, 5, 1], [12, 4, 2], [14, 2, 2], [15, 1, 2]],
            [[9, 2, 1], [10, 3, 2], [12, 4, 2], [13, 6, 2], [14, 7, 2], [15, 4, 1]],
            [[10, 4, 2], [12, 5, 2], [13, 6, 1], [14, 4, 2], [15, 2, 2]]
          ];
          const climaxPatterns = [
            [[8, 2, 2], [9, 3, 1], [10, 4, 2], [11, 5, 1], [12, 6, 2], [13, 7, 2], [14, 6, 2], [15, 4, 2]],
            [[8, 6, 2], [9, 7, 2], [10, 6, 1], [11, 5, 2], [12, 4, 2], [13, 3, 1], [14, 2, 2], [15, 1, 2]],
            [[8, 0, 2], [9, 2, 1], [10, 4, 2], [11, 6, 2], [12, 7, 2], [13, 5, 2], [14, 4, 2], [15, 1, 2]],
            [[8, 3, 2], [10, 4, 2], [11, 5, 1], [12, 6, 2], [13, 7, 2], [14, 5, 2], [15, 2, 2]]
          ];
          const runSteps = isClimaxBar ? climaxPatterns[fillVariant] : turnaroundPatterns[fillVariant];
          for (const [st, v, vel] of runSteps) {
            setNote(v, o + st, vel, 1);
          }
        } else {
          // 1-beat approach (steps 12..15)
          const v12 = [2, 3, 4, 5][fillVariant];
          const v14 = [4, 5, 6, 2][fillVariant];
          setNote(v12, o + 12, 1, 1);
          setNote(v14, o + 14, 2, 1);
          setNote(1, o + 15, 2, 1);
        }
      }
    }

    return g;
  }

  // ==========================================================================
  // 5C. Song-Aware 16-Bar Pattern Generators for Keys, Guitar, Horns & Vocal Lead
  // ==========================================================================
  function getSongHarmonicBlueprint(songId) {
    const { artist, song } = findSongById(songId);
    const prof = getArtistBassProfile(artist.artistId, song.id);
    const spec = prof.songBassSpec || SONG_KEY_OVERRIDES[song.id] || SONG_KEY_OVERRIDES.zep_levee;
    const bar1 = Array.isArray(spec.bar1) && spec.bar1.length > 0 ? spec.bar1 : [[0, 0, 2], [8, 4, 1]];
    const bar2 = Array.isArray(spec.bar2) && spec.bar2.length > 0 ? spec.bar2 : bar1;
    let hash = 0;
    const str = String(song.id || 'zep_levee');
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0x7fffffff;
    return { artist, song, prof, bar1, bar2, hash };
  }

  function generateSongKeysGrid(songId, intensityPct = 70, ghostPct = 45, hatEnergyPct = 60, fillPct = 65) {
    const { song, bar1, bar2, hash } = getSongHarmonicBlueprint(songId);
    const g = createEmptyGrid256();
    const setNote = (v, step, st = 1, sub = 1) => {
      if (v >= 0 && v < 8 && step >= 0 && step < TOTAL_STEPS) g[v][step] = { state: st, sub };
    };

    const compPattern = hash % 4; // 4 distinct song-specific comping rhythmic templates
    for (let bar = 0; bar < TOTAL_BARS; bar++) {
      const o = bar * 16;
      const secIdx = Math.floor(bar / 4);
      const isBar2 = bar % 2 === 1;
      const isTurnaround = (bar + 1) % 4 === 0;
      const srcBar = isBar2 ? bar2 : bar1;
      const anchorVoice = srcBar[0] ? Math.min(4, srcBar[0][1]) : 0;

      // Primary chord comping hits (Root + 3rd + 5th/7th)
      const compSteps =
        compPattern === 0
          ? [0, 6, 12]
          : compPattern === 1
          ? [0, 3, 8, 14]
          : compPattern === 2
          ? [0, 4, 10, 12]
          : [0, 6, 10, 14];

      for (let idx = 0; idx < compSteps.length; idx++) {
        const st = compSteps[idx];
        if (secIdx === 0 && idx > 2 && intensityPct < 60) continue;
        const velState = idx === 0 || (secIdx >= 1 && st === 6) ? 2 : 1;
        const rootV = (anchorVoice + (secIdx === 1 && idx >= 2 ? 2 : 0)) % 6;
        const thirdV = Math.min(7, rootV + 2);
        const fifthV = Math.min(7, rootV + 4);
        setNote(rootV, o + st, velState, 1);
        setNote(thirdV, o + st, 1, 1);
        if (secIdx >= 1 || intensityPct >= 65) {
          setNote(fifthV, o + st, 1, 1);
        }
        if (secIdx === 3 && hatEnergyPct >= 55) {
          setNote(7, o + st, 1, 1); // High octave sparkle in Climax
        }
      }

      // Ghost Rhodes/Clav grace notes
      if (ghostPct >= 35) {
        const ghostStep = isBar2 ? 11 : 7;
        setNote(1, o + ghostStep, 3, 1);
        if (ghostPct >= 65) setNote(5, o + 15, 3, 1);
      }

      // Section turnaround chord run
      if (isTurnaround && fillPct >= 35) {
        setNote(3, o + 12, 2, 1);
        setNote(5, o + 12, 1, 1);
        setNote(4, o + 14, 2, 1);
        setNote(6, o + 14, 2, 1);
        if (fillPct >= 70 || secIdx === 3) {
          setNote(7, o + 15, 2, 2);
        }
      }
    }
    return g;
  }

  function generateSongGuitarGrid(songId, intensityPct = 70, ghostPct = 45, hatEnergyPct = 60, fillPct = 65) {
    const { artist, bar1, bar2, hash } = getSongHarmonicBlueprint(songId);
    const g = createEmptyGrid256();
    const setNote = (v, step, st = 1, sub = 1) => {
      if (v >= 0 && v < 8 && step >= 0 && step < TOTAL_STEPS) g[v][step] = { state: st, sub };
    };

    const isRockOrGrunge = ['zeppelin', 'nirvana', 'strokes', 'blink182', 'rush'].includes(artist.artistId);
    const skankSteps = (hash % 2 === 0) ? [2, 6, 10, 14] : [3, 6, 11, 14];

    for (let bar = 0; bar < TOTAL_BARS; bar++) {
      const o = bar * 16;
      const secIdx = Math.floor(bar / 4);
      const isBar2 = bar % 2 === 1;
      const isTurnaround = (bar + 1) % 4 === 0;
      const srcBar = isBar2 ? bar2 : bar1;

      if (isRockOrGrunge || secIdx === 1 || secIdx === 3) {
        // Double the song's signature riff in guitar register + power 5ths on accents
        for (let i = 0; i < srcBar.length; i++) {
          const [st, vRaw, velState] = srcBar[i];
          if (secIdx === 0 && i % 2 === 1 && intensityPct < 55 && !isRockOrGrunge) continue;
          const v = Math.min(5, vRaw % 6);
          setNote(v, o + st, velState, 1);
          if (velState === 2 && (isRockOrGrunge || secIdx >= 1)) {
            setNote(Math.min(7, v + 3), o + st, 1, 1); // Power 5th dyad
          }
        }
      }

      // Funk / Soul / Indie offbeat skanks & 16th-note fret-hand chucks
      if (!isRockOrGrunge || secIdx === 2) {
        for (const st of skankSteps) {
          setNote(6, o + st, secIdx >= 1 ? 2 : 1, 1);
          if (hatEnergyPct >= 50) setNote(7, o + st, 1, 1);
        }
      }

      if (ghostPct >= 30) {
        const chuckSteps = [1, 5, 9, 13];
        for (let c = 0; c < chuckSteps.length; c++) {
          if (c % 2 === 1 && ghostPct < 60) continue;
          setNote(7, o + chuckSteps[c], 3, 1); // Ghost state 3 triggers tight muted guitar chuck!
        }
      }

      if (isTurnaround && fillPct >= 35) {
        setNote(4, o + 13, 2, 1);
        setNote(5, o + 14, 2, 1);
        setNote(6, o + 15, 2, fillPct >= 75 ? 2 : 1);
      }
    }
    return g;
  }

  function generateSongHornsGrid(songId, intensityPct = 70, ghostPct = 45, hatEnergyPct = 60, fillPct = 65) {
    const { bar1, bar2, hash } = getSongHarmonicBlueprint(songId);
    const g = createEmptyGrid256();
    const setNote = (v, step, st = 1, sub = 1) => {
      if (v >= 0 && v < 8 && step >= 0 && step < TOTAL_STEPS) g[v][step] = { state: st, sub };
    };

    const hornStyle = hash % 3;
    for (let bar = 0; bar < TOTAL_BARS; bar++) {
      const o = bar * 16;
      const secIdx = Math.floor(bar / 4);
      const isBar2 = bar % 2 === 1;
      const isTurnaround = (bar + 1) % 4 === 0;
      const srcBar = isBar2 ? bar2 : bar1;

      // Verse: sparse punctuated stabs on Bar 1 beat 1 or Bar 2 answer
      if (secIdx === 0) {
        if (!isBar2) {
          setNote(0, o + 0, 2, 1);
          setNote(2, o + 0, 2, 1);
          setNote(4, o + 0, 1, 1);
        } else {
          const ansStep = hornStyle === 0 ? 6 : hornStyle === 1 ? 10 : 12;
          setNote(2, o + ansStep, 2, 1);
          setNote(3, o + ansStep, 2, 1);
          setNote(5, o + ansStep + 2, 1, 1);
        }
      } else if (secIdx === 1 || secIdx === 3) {
        // Chorus & Climax: full brass section stabs locked to the song's accented hits
        const stabSteps = isBar2 ? [0, 6, 10, 14] : [0, 3, 12];
        for (let idx = 0; idx < stabSteps.length; idx++) {
          const st = stabSteps[idx];
          if (idx === 3 && intensityPct < 55) continue;
          const isBig = idx === 0 || idx === stabSteps.length - 1;
          setNote(0, o + st, isBig ? 2 : 1, 1); // Bari Sax
          setNote(3, o + st, isBig ? 2 : 1, 1); // Horn 3rd
          setNote(4, o + st, 2, 1);             // Brass 5th
          if (secIdx === 3 || hatEnergyPct >= 65) {
            setNote(6, o + st, 2, 1);           // High Trumpet Octave
          }
        }
      } else {
        // Bridge: syncopated horn line following the song's bar2 melody
        for (let i = 0; i < Math.min(4, srcBar.length); i++) {
          const [st, vRaw] = srcBar[i];
          const hv = Math.min(7, (vRaw % 5) + 2);
          setNote(hv, o + st, i === 0 ? 2 : 1, 1);
          if (i === 0) setNote(1, o + st, 1, 1);
        }
      }

      if (isTurnaround && fillPct >= 40) {
        setNote(3, o + 12, 2, 1);
        setNote(4, o + 13, 2, 1);
        setNote(5, o + 14, 2, 1);
        setNote(6, o + 15, 2, 1);
        if (secIdx === 3) setNote(7, o + 15, 2, 1);
      }
    }
    return g;
  }

  function generateSongVocalGrid(songId, intensityPct = 70, ghostPct = 45, hatEnergyPct = 60, fillPct = 65) {
    const { bar1, bar2, hash } = getSongHarmonicBlueprint(songId);
    const g = createEmptyGrid256();
    const setNote = (v, step, st = 1, sub = 1) => {
      if (v >= 0 && v < 8 && step >= 0 && step < TOTAL_STEPS) g[v][step] = { state: st, sub };
    };

    // Build singable call-and-response vocal lead phrases per section
    const phraseShift = hash % 3;
    const verseCall = [
      [0, 1, 2],
      [3, 3, 1],
      [6, 4, 2],
      [10, 3, 1],
      [12, 2, 1]
    ];
    const verseResp = [
      [2, 3, 1],
      [4, 5, 2],
      [8, 4, 1],
      [11, 3, 1],
      [14, 1, 2]
    ];
    const chorusHook1 = [
      [0, 5, 2],
      [3, 6, 2],
      [6, 7, 2],
      [10, 5, 1],
      [12, 4, 2],
      [14, 3, 1]
    ];
    const chorusHook2 = [
      [0, 4, 2],
      [4, 5, 2],
      [6, 6, 1],
      [8, 5, 2],
      [12, 3, 2],
      [14, 1, 2]
    ];

    for (let bar = 0; bar < TOTAL_BARS; bar++) {
      const o = bar * 16;
      const secIdx = Math.floor(bar / 4);
      const isBar2 = bar % 2 === 1;
      const isTurnaround = (bar + 1) % 4 === 0;
      const srcBar = isBar2 ? bar2 : bar1;

      if (secIdx === 0) {
        const tpl = isBar2 ? verseResp : verseCall;
        for (const [st, vBase, vel] of tpl) {
          const v = Math.max(0, Math.min(7, (vBase + phraseShift) % 6 + 1));
          setNote(v, o + st, vel, 1);
        }
      } else if (secIdx === 1 || secIdx === 3) {
        const tpl = isBar2 ? chorusHook2 : chorusHook1;
        for (const [st, vBase, vel] of tpl) {
          const v = Math.max(1, Math.min(7, vBase + (secIdx === 3 && vBase < 7 ? 1 : 0)));
          setNote(v, o + st, vel, 1);
        }
      } else {
        // Bridge vocal counter-melody locked to the song's harmonic rhythm
        for (let i = 0; i < Math.min(5, srcBar.length); i++) {
          const [st, vRaw, vel] = srcBar[i];
          const v = Math.max(1, Math.min(7, 6 - (vRaw % 5)));
          setNote(v, o + st, vel, 1);
        }
      }

      if (isTurnaround && fillPct >= 45) {
        setNote(0, o + 15, 2, 1); // Vocal pickup into next section
      }
    }
    return g;
  }

  function generateSongInstrumentGrid(
    inst,
    songId,
    intensityPct = 70,
    ghostPct = 45,
    hatEnergyPct = 60,
    fillPct = 65
  ) {
    if (inst === 'bass') return generateSongBassGrid(songId, intensityPct, ghostPct, hatEnergyPct, fillPct);
    if (inst === 'keys') return generateSongKeysGrid(songId, intensityPct, ghostPct, hatEnergyPct, fillPct);
    if (inst === 'guitar') return generateSongGuitarGrid(songId, intensityPct, ghostPct, hatEnergyPct, fillPct);
    if (inst === 'horns') return generateSongHornsGrid(songId, intensityPct, ghostPct, hatEnergyPct, fillPct);
    if (inst === 'vocal') return generateSongVocalGrid(songId, intensityPct, ghostPct, hatEnergyPct, fillPct);
    return generateSongGrooveGrid(songId, intensityPct, ghostPct, hatEnergyPct, fillPct);
  }

  // ==========================================================================
  // 6. Client-Side Standard MIDI File (.mid) & Stereo Audio (.wav) Builders
  // ==========================================================================
  function audioBufferToWavBlob(audioBuffer) {
    const numCh = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numFrames = audioBuffer.length;
    const bytesPerSample = 2;
    const blockAlign = numCh * bytesPerSample;
    const dataSize = numFrames * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numCh, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // 16-bit
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels = [];
    for (let c = 0; c < numCh; c++) channels.push(audioBuffer.getChannelData(c));

    let offset = 44;
    for (let i = 0; i < numFrames; i++) {
      for (let c = 0; c < numCh; c++) {
        // Soft-clipping limiter to prevent digital clipping when all 6 tracks play together
        const raw = channels[c][i];
        const sample = Math.max(-1, Math.min(1, Math.tanh(raw * 0.85)));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }
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
  const CRATE_STORAGE_KEY = 'sessh_crate_v1';
  const HISTORY_STORAGE_KEY = 'sessh_history_v1';
  const PLAYER_PROFILE_KEY = 'sessh_player_v1';
  const APP_VERSION = 'v3.0.0 (PWA Build v32)';

  const WORKSPACE_TABS = [
    { id: 'drums', icon: '🥁', label: 'Drums', sub: 'Groove · Grid · Kits' },
    { id: 'bass', icon: '🎸', label: 'Bass', sub: 'Bassline · Grid · Rigs' },
    { id: 'keys', icon: '🎹', label: 'Keys', sub: 'Rhodes · Wurli · Synth' },
    { id: 'guitar', icon: '⚡', label: 'Guitar', sub: 'Chucks · Plucks · Riffs' },
    { id: 'horns', icon: '🎺', label: 'Horns', sub: 'Brass Section · Stabs' },
    { id: 'vocal', icon: '🎤', label: 'Vocal Lead', sub: 'Formant · Hook Lead' },
    { id: 'arrange', icon: '🎬', label: 'Master Timeline', sub: 'Master Song Board · Export' },
    { id: 'arrangements', icon: '📂', label: 'Saved Songs', sub: 'Saved Songs & History' }
  ];

  const ARRANGEMENT_ROLES = [
    { id: 'intro', label: '🟢 Intro', color: '#10b981', defaultSlice: 0 },
    { id: 'verse', label: '🟢 Verse', color: '#10b981', defaultSlice: 0 },
    { id: 'prechorus', label: '🟡 Pre-Chorus', color: '#f59e0b', defaultSlice: 1 },
    { id: 'chorus', label: '🟠 Chorus', color: '#f59e0b', defaultSlice: 1 },
    { id: 'bridge', label: '🔵 Bridge', color: '#38bdf8', defaultSlice: 2 },
    { id: 'breakdown', label: '🟣 Breakdown', color: '#a855f7', defaultSlice: 2 },
    { id: 'solo', label: '⚡ Solo', color: '#38bdf8', defaultSlice: 2 },
    { id: 'fill', label: '🥁 Fill / Break', color: '#f43f5e', defaultSlice: 3 },
    { id: 'climax', label: '🔥 Climax', color: '#e73ff6', defaultSlice: 3 },
    { id: 'outro', label: '🏁 Outro', color: '#e73ff6', defaultSlice: 3 }
  ];

  function createDefaultArrangementSections(
    songId = 'zep_levee',
    authorName = 'Producer',
    authorColor = '#10b981',
    trackType = 'drums',
    forceStarter = false
  ) {
    if (!forceStarter) return [];
    return [
      {
        id: `sec_${trackType}_${Date.now().toString(36)}_0_${Math.random().toString(36).slice(2, 5)}`,
        trackType,
        roleId: 'verse',
        songId,
        sourceSlice: 0,
        sourceBar: 0,
        bars: 4,
        customEdited: false,
        customGrid: null,
        addedBy: authorName,
        addedColor: authorColor
      }
    ];
  }

  function extractGridSlice(srcGrid, startStep = 0, stepCount = 64) {
    const count = Math.max(16, Number(stepCount) || 64);
    const out = [];
    for (let v = 0; v < DRUM_VOICES.length; v++) {
      const row = [];
      for (let i = 0; i < count; i++) {
        const srcIdx = (startStep + i) % TOTAL_STEPS;
        const cell = srcGrid && srcGrid[v] && srcGrid[v][srcIdx] ? srcGrid[v][srcIdx] : { state: 0, sub: 1 };
        row.push({ state: Number(cell.state || 0), sub: Number(cell.sub || 1) });
      }
      out.push(row);
    }
    return out;
  }

  function getTimelineBlockGrid(secItem, trackTypeOverride = null) {
    const trackType = trackTypeOverride || (secItem && secItem.trackType) || 'drums';
    const bars = Math.max(1, Math.min(16, Number(secItem?.bars) || 4));
    const targetSteps = bars * 16;
    if (
      secItem &&
      Array.isArray(secItem.customGrid) &&
      secItem.customGrid.length === DRUM_VOICES.length &&
      Array.isArray(secItem.customGrid[0]) &&
      secItem.customGrid[0].length > 0
    ) {
      const srcLen = secItem.customGrid[0].length;
      const out = [];
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        const row = [];
        for (let i = 0; i < targetSteps; i++) {
          const c = secItem.customGrid[v][i % srcLen] || { state: 0, sub: 1 };
          row.push({ state: Number(c.state || 0), sub: Number(c.sub || 1) });
        }
        out.push(row);
      }
      return out;
    }

    const sid = (secItem && secItem.songId) || getInstrumentSongId(trackType) || state.selectedSongId || 'zep_levee';
    const fullSongGrid = generateSongInstrumentGrid(
      trackType,
      sid,
      state.intensityPct,
      state.ghostPct,
      state.hatEnergyPct,
      state.fillPct
    );
    let startStep = 0;
    if (bars === 1) {
      const barIdx = Math.max(0, Math.min(15, Number(secItem?.sourceBar ?? (Number(secItem?.sourceSlice || 0) * 4))));
      startStep = barIdx * 16;
    } else if (bars < 16) {
      const sliceIdx = Math.max(0, Math.min(3, Number(secItem?.sourceSlice ?? 0)));
      startStep = sliceIdx * 64;
    }
    return extractGridSlice(fullSongGrid, startStep, targetSteps);
  }

  function normalizeTabId(rawTab) {
    if (
      rawTab === 'drums' ||
      rawTab === 'bass' ||
      rawTab === 'keys' ||
      rawTab === 'guitar' ||
      rawTab === 'horns' ||
      rawTab === 'vocal' ||
      rawTab === 'arrange' ||
      rawTab === 'arrangements'
    ) {
      return rawTab;
    }
    if (rawTab === 'compose' || rawTab === 'songs') {
      return state && isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
    }
    if (rawTab === 'builder' || rawTab === 'master') return 'arrange';
    if (rawTab === 'crate' || rawTab === 'settings' || rawTab === 'collab') return 'arrangements';
    return 'drums';
  }

  function getInstrumentSongId(inst = null) {
    const target = inst || (state && state.composeInstrument) || 'drums';
    if (!state) return 'zep_levee';
    if (target === 'bass') return state.selectedBassSongId || state.selectedSongId || 'zep_levee';
    if (target === 'keys') return state.selectedKeysSongId || state.selectedSongId || 'zep_levee';
    if (target === 'guitar') return state.selectedGuitarSongId || state.selectedSongId || 'zep_levee';
    if (target === 'horns') return state.selectedHornsSongId || state.selectedSongId || 'zep_levee';
    if (target === 'vocal') return state.selectedVocalSongId || state.selectedSongId || 'zep_levee';
    return state.selectedDrumSongId || state.selectedSongId || 'zep_levee';
  }

  function setInstrumentSongSelection(inst, artistId, songId) {
    if (!state) return;
    if (inst === 'bass') {
      state.selectedBassArtistId = artistId;
      state.selectedBassSongId = songId;
    } else if (inst === 'keys') {
      state.selectedKeysArtistId = artistId;
      state.selectedKeysSongId = songId;
    } else if (inst === 'guitar') {
      state.selectedGuitarArtistId = artistId;
      state.selectedGuitarSongId = songId;
    } else if (inst === 'horns') {
      state.selectedHornsArtistId = artistId;
      state.selectedHornsSongId = songId;
    } else if (inst === 'vocal') {
      state.selectedVocalArtistId = artistId;
      state.selectedVocalSongId = songId;
    } else {
      state.selectedDrumArtistId = artistId;
      state.selectedDrumSongId = songId;
    }
  }

  function getKitIdForInstrument(inst = null) {
    const target = inst || (state && state.composeInstrument) || 'drums';
    if (!state) return 'bonham';
    if (target === 'bass') return state.bassKitId || 'jpj_jazz';
    if (target === 'keys') return state.keysKitId || 'rhodes_mk1';
    if (target === 'guitar') return state.guitarKitId || 'strat_funk';
    if (target === 'horns') return state.hornsKitId || 'jb_funk_horns';
    if (target === 'vocal') return state.vocalKitId || 'soul_lead';
    return state.kitId || 'bonham';
  }

  function setKitIdForInstrument(inst, kitVal) {
    if (!state) return;
    if (inst === 'bass') state.bassKitId = kitVal;
    else if (inst === 'keys') state.keysKitId = kitVal;
    else if (inst === 'guitar') state.guitarKitId = kitVal;
    else if (inst === 'horns') state.hornsKitId = kitVal;
    else if (inst === 'vocal') state.vocalKitId = kitVal;
    else state.kitId = kitVal;
  }

  function getInstrumentGrid(inst = null) {
    const target = inst || (state && state.composeInstrument) || 'drums';
    if (!state) return createEmptyGrid256();
    if (target === 'bass') return state.bassGrid;
    if (target === 'keys') return state.keysGrid;
    if (target === 'guitar') return state.guitarGrid;
    if (target === 'horns') return state.hornsGrid;
    if (target === 'vocal') return state.vocalGrid;
    return state.drumGrid;
  }

  function setInstrumentGrid(inst, gridVal) {
    if (!state) return;
    if (inst === 'bass') state.bassGrid = gridVal;
    else if (inst === 'keys') state.keysGrid = gridVal;
    else if (inst === 'guitar') state.guitarGrid = gridVal;
    else if (inst === 'horns') state.hornsGrid = gridVal;
    else if (inst === 'vocal') state.vocalGrid = gridVal;
    else state.drumGrid = gridVal;
  }

  function getTrackSections(inst = 'drums') {
    if (!state) return [];
    if (inst === 'bass') return state.bassArrangementSections;
    if (inst === 'keys') return state.keysArrangementSections;
    if (inst === 'guitar') return state.guitarArrangementSections;
    if (inst === 'horns') return state.hornsArrangementSections;
    if (inst === 'vocal') return state.vocalArrangementSections;
    return state.arrangementSections;
  }

  function setTrackSections(inst, arr) {
    if (!state) return;
    if (inst === 'bass') state.bassArrangementSections = arr;
    else if (inst === 'keys') state.keysArrangementSections = arr;
    else if (inst === 'guitar') state.guitarArrangementSections = arr;
    else if (inst === 'horns') state.hornsArrangementSections = arr;
    else if (inst === 'vocal') state.vocalArrangementSections = arr;
    else state.arrangementSections = arr;
  }

  function getSelectedTimelineIdx(inst = 'drums') {
    if (!state) return 0;
    if (inst === 'bass') return state.selectedBassTimelineIdx || 0;
    if (inst === 'keys') return state.selectedKeysTimelineIdx || 0;
    if (inst === 'guitar') return state.selectedGuitarTimelineIdx || 0;
    if (inst === 'horns') return state.selectedHornsTimelineIdx || 0;
    if (inst === 'vocal') return state.selectedVocalTimelineIdx || 0;
    return state.selectedTimelineIdx || 0;
  }

  function setSelectedTimelineIdx(inst, idx) {
    if (!state) return;
    if (inst === 'bass') state.selectedBassTimelineIdx = idx;
    else if (inst === 'keys') state.selectedKeysTimelineIdx = idx;
    else if (inst === 'guitar') state.selectedGuitarTimelineIdx = idx;
    else if (inst === 'horns') state.selectedHornsTimelineIdx = idx;
    else if (inst === 'vocal') state.selectedVocalTimelineIdx = idx;
    else state.selectedTimelineIdx = idx;
  }

  function isTrackMuted(inst = 'drums') {
    if (!state) return false;
    if (inst === 'bass') return Boolean(state.bassTrackMuted);
    if (inst === 'keys') return Boolean(state.keysTrackMuted);
    if (inst === 'guitar') return Boolean(state.guitarTrackMuted);
    if (inst === 'horns') return Boolean(state.hornsTrackMuted);
    if (inst === 'vocal') return Boolean(state.vocalTrackMuted);
    return Boolean(state.drumTrackMuted);
  }

  function setTrackMuted(inst, muted) {
    if (!state) return;
    if (inst === 'bass') state.bassTrackMuted = Boolean(muted);
    else if (inst === 'keys') state.keysTrackMuted = Boolean(muted);
    else if (inst === 'guitar') state.guitarTrackMuted = Boolean(muted);
    else if (inst === 'horns') state.hornsTrackMuted = Boolean(muted);
    else if (inst === 'vocal') state.vocalTrackMuted = Boolean(muted);
    else state.drumTrackMuted = Boolean(muted);
  }

  function isMasterTrackEnabled(inst = 'drums') {
    if (!state || !state.masterTrackEnabled) return false;
    const arr = getTrackSections(inst);
    return Boolean(state.masterTrackEnabled[inst] && Array.isArray(arr) && arr.length > 0);
  }

  function setMasterTrackEnabled(inst, enabled, synced = true) {
    if (!state) return;
    if (!state.masterTrackEnabled) {
      state.masterTrackEnabled = {
        drums: false,
        bass: false,
        keys: false,
        guitar: false,
        horns: false,
        vocal: false
      };
    }
    if (!state.masterTrackSynced) {
      state.masterTrackSynced = {
        drums: false,
        bass: false,
        keys: false,
        guitar: false,
        horns: false,
        vocal: false
      };
    }
    state.masterTrackEnabled[inst] = Boolean(enabled);
    state.masterTrackSynced[inst] = Boolean(enabled && synced);
  }

  function getActiveMasterTracks() {
    if (!state) return [];
    return INSTRUMENT_LIST.filter((inst) => isMasterTrackEnabled(inst));
  }

  const PLAYER_COLORS = [
    { id: '#10b981', label: '🟢 Emerald' },
    { id: '#e73ff6', label: '🟣 Magenta' },
    { id: '#f59e0b', label: '🟠 Amber' },
    { id: '#38bdf8', label: '🔵 Sky' }
  ];

  function loadPlayerProfile() {
    const isMobileUA = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || '');
    const defaultName = isMobileUA ? 'Fold / Phone' : 'Studio PC';
    const defaultColor = isMobileUA ? '#e73ff6' : '#10b981';
    try {
      const raw = localStorage.getItem(PLAYER_PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.clientId) return p;
      }
    } catch (_) {}
    const fresh = {
      clientId: `peer_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name: defaultName,
      color: defaultColor,
      device: isMobileUA ? 'Phone' : 'PC',
      jamMode: 'shared',         // 'shared' | 'split_roles' | 'independent'
      jamRole: isMobileUA ? 'percussion' : 'foundation', // 'foundation' (Kick/Snare/Hats) | 'percussion' (Rim/Clap/Toms/Crash)
      hearPartnerPads: true
    };
    try {
      localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(fresh));
    } catch (_) {}
    return fresh;
  }

  function savePlayerProfile() {
    try {
      localStorage.setItem(
        PLAYER_PROFILE_KEY,
        JSON.stringify({
          clientId: state.clientId,
          name: state.playerName,
          color: state.playerColor,
          device: state.playerDevice,
          jamMode: state.jamMode,
          jamRole: state.jamRole,
          hearPartnerPads: state.hearPartnerPads
        })
      );
    } catch (_) {}
  }

  function loadLocalCrate() {
    try {
      const raw = localStorage.getItem(CRATE_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveLocalCrate() {
    try {
      localStorage.setItem(CRATE_STORAGE_KEY, JSON.stringify((state.localCrate || []).slice(0, 60)));
    } catch (_) {}
  }

  function loadSessionHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveSessionHistory() {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify((state.sessionHistory || []).slice(0, 25)));
    } catch (_) {}
  }

  const initialProfile = loadPlayerProfile();
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramBridge = urlParams.get('bridge');
    if (paramBridge && /^https?:\/\//i.test(paramBridge)) {
      localStorage.setItem(BRIDGE_URL_KEY, paramBridge.replace(/\/+$/, ''));
    }
  } catch (_) {}

  const isLocalBridgeOrigin =
    window.location.port === '3333' ||
    window.location.hostname === 'localhost' ||
    /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(window.location.hostname);

  const state = {
    // 8-Tab Workspace State (6 Instruments: Drums, Bass, Keys, Guitar, Horns, Vocal + Master Timeline + Saved Songs)
    activeTab: 'drums',
    composeInstrument: 'drums',     // 'drums' | 'bass' | 'keys' | 'guitar' | 'horns' | 'vocal'
    playBothInCompose: true,        // Play enabled ensemble instruments together in Compose playback
    composeEnsemble: {
      drums: true,
      bass: true,
      keys: true,
      guitar: false,
      horns: false,
      vocal: false
    },
    songModalOpen: false,           // True when the Select Song Modal is open
    songModalInstrument: 'drums',   // 'drums' | 'bass' | 'keys' | 'guitar' | 'horns' | 'vocal' | 'both'
    workspaceLayoutMode: 'tabs',    // 'tabs' (focused zone view) | 'all' (show all zones stacked)
    desktopMenuClosed: false,       // True = desktop left navigation menu collapsed/closed
    showDialsDrawer: false,         // Decluttered UI: Tone Shaping & Feel Dials drawer hidden by default
    showInlinePadsInEdit: false,    // Decluttered UI: Finger Pads drawer hidden by default
    showFineTuneDials: false,       // Progressive disclosure for secondary dials
    showPrimaryTimelineStrip: true, // Persistent Instrument Timeline Strip on all instrument tabs
    showSharedGridInCollab: false,
    songSearchQuery: '',
    songTempoFilter: 'all',         // 'all' | 'slow' | 'mid' | 'fast'
    crateVaultFilter: 'all',        // 'all' | 'outbox' | 'crate' | 'history' | 'pcfiles'
    sectionSources: ['zep_levee', 'zep_levee', 'zep_levee', 'zep_levee'],
    addSectionBars: 4,              // Bar length selector (1 | 4 | 16) when adding a section to Instrument Timeline
    arrangementSections: [],
    bassArrangementSections: [],
    keysArrangementSections: [],
    guitarArrangementSections: [],
    hornsArrangementSections: [],
    vocalArrangementSections: [],
    masterTrackEnabled: {
      drums: false,
      bass: false,
      keys: false,
      guitar: false,
      horns: false,
      vocal: false
    },
    masterTrackSynced: {
      drums: false,
      bass: false,
      keys: false,
      guitar: false,
      horns: false,
      vocal: false
    },
    timelinePlayScope: 'master',    // 'master' | 'drums' | 'bass' | 'keys' | 'guitar' | 'horns' | 'vocal'

    // Multi-Track Timeline Review (All 6 Instrument Tracks), Global Timeline BPM & Section Modal State
    selectedTimelineIdx: 0,
    selectedBassTimelineIdx: 0,
    selectedKeysTimelineIdx: 0,
    selectedGuitarTimelineIdx: 0,
    selectedHornsTimelineIdx: 0,
    selectedVocalTimelineIdx: 0,
    editingTimelineIdx: null,       // Non-null when editing a specific timeline block inside Compose
    editingTimelineTrack: 'drums',
    modalSectionIdx: null,          // Non-null when the Section Sequence Editor Modal is open
    modalTrack: 'drums',
    modalSubSlice: 0,               // Active 4-bar slice (0..3) when viewing a 16-bar block in modal
    timelineHasUserSection: false,  // Becomes true when the first section is added to the timeline
    timelineBpm: null,              // Global BPM for the timeline, defined by the first section added
    timelineBpmSourceTitle: '',     // Name of the first section that defined the global timeline BPM
    timelineLoopSingle: false,      // True = loop only selected block; False = play entire timeline
    timelineLoopTrack: 'drums',     // Which track's selected block defines the loop range
    drumTrackMuted: false,
    bassTrackMuted: false,
    keysTrackMuted: false,
    guitarTrackMuted: false,
    hornsTrackMuted: false,
    vocalTrackMuted: false,
    playbackMode: 'compose',        // 'compose' | 'timeline'
    activeTimelineIdx: -1,
    activeBassTimelineIdx: -1,
    activeTimelineIdxByTrack: { drums: -1, bass: -1, keys: -1, guitar: -1, horns: -1, vocal: -1 },
    activeTimelineBar: -1,
    timelineToastMessage: '',

    abletonConnected: false,
    bridgeReachable: false,
    bridgeUrl: isLocalBridgeOrigin
      ? window.location.origin
      : localStorage.getItem(BRIDGE_URL_KEY) || 'http://192.168.1.247:3333',
    targetTrack: 'selected',
    targetBassTrack: 'auto_bass',
    targetSlot: 'selected',
    abletonSelectedTrackIndex: 0,
    abletonSelectedTrackName: 'Selected Track',
    abletonSelectedSceneIndex: 0,
    abletonTracks: [],
    abletonClipSlots: [],
    localMidiFiles: [],

    // Offline Beat Crate, Studio Outbox & Auto-Saved Session History ("Old Stuff")
    localCrate: loadLocalCrate(),
    studioCrate: [],
    sessionHistory: loadSessionHistory(),

    // Same-Network Multi-Player Collaboration ("LAN Jam Room")
    clientId: initialProfile.clientId,
    playerName: initialProfile.name,
    playerColor: initialProfile.color,
    playerDevice: initialProfile.device,
    jamMode: initialProfile.jamMode || 'shared',     // 'shared' | 'split_roles' | 'independent'
    jamRole: initialProfile.jamRole || 'foundation', // 'foundation' | 'percussion'
    hearPartnerPads: initialProfile.hearPartnerPads !== false,
    jamPeers: [],
    jamConnected: false,
    jamStatusMessage: '',
    remoteStepHighlights: {},
    suppressJamBroadcast: false,

    // Separate Song Selection per Instrument + Most Recent Song BPM Tracking
    selectedArtistId: 'zeppelin',
    selectedSongId: 'zep_levee',
    selectedDrumArtistId: 'zeppelin',
    selectedDrumSongId: 'zep_levee',
    selectedBassArtistId: 'zeppelin',
    selectedBassSongId: 'zep_levee',
    selectedKeysArtistId: 'zeppelin',
    selectedKeysSongId: 'zep_levee',
    selectedGuitarArtistId: 'zeppelin',
    selectedGuitarSongId: 'zep_levee',
    selectedHornsArtistId: 'zeppelin',
    selectedHornsSongId: 'zep_levee',
    selectedVocalArtistId: 'zeppelin',
    selectedVocalSongId: 'zep_levee',
    lastSelectedSongBpm: 71,
    lastSelectedSongTitle: 'When the Levee Breaks',
    kitId: 'bonham',
    bassKitId: 'jpj_jazz',
    keysKitId: 'rhodes_mk1',
    guitarKitId: 'strat_funk',
    hornsKitId: 'jb_funk_horns',
    vocalKitId: 'soul_lead',
    tempo: 71,

    // 6 Session Feel Dials
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
    drumGrid: null,
    bassGrid: null,
    keysGrid: null,
    guitarGrid: null,
    hornsGrid: null,
    vocalGrid: null,
    undoHistory: [],

    activeStep: -1,
    activeBar: -1,
    overdubRecord: false,
    noteRepeatRate: 0,

    currentNotes: [],
    currentCompanionNotes: [],
    phonePlayer: {
      playing: false,
      startWallTime: 0,
      lastStepTime: -0.001,
      rafId: null
    }
  };

  function getApiUrl(pathStr) {
    const base = (state.bridgeUrl || '').replace(/\/+$/, '');
    return base ? `${base}${pathStr}` : pathStr;
  }

  function savePersistedState() {
    try {
      setInstrumentGrid(state.composeInstrument, cloneGrid256(state.grid));
      const payload = {
        timelineV32Clean: true,
        activeTab: state.activeTab,
        composeInstrument: state.composeInstrument,
        playBothInCompose: state.playBothInCompose,
        composeEnsemble: state.composeEnsemble,
        workspaceLayoutMode: state.workspaceLayoutMode,
        desktopMenuClosed: state.desktopMenuClosed,
        showDialsDrawer: state.showDialsDrawer,
        showInlinePadsInEdit: state.showInlinePadsInEdit,
        showFineTuneDials: state.showFineTuneDials,
        showPrimaryTimelineStrip: state.showPrimaryTimelineStrip,
        sectionSources: state.sectionSources,
        addSectionBars: state.addSectionBars,
        arrangementSections: state.arrangementSections,
        bassArrangementSections: state.bassArrangementSections,
        keysArrangementSections: state.keysArrangementSections,
        guitarArrangementSections: state.guitarArrangementSections,
        hornsArrangementSections: state.hornsArrangementSections,
        vocalArrangementSections: state.vocalArrangementSections,
        masterTrackEnabled: state.masterTrackEnabled,
        masterTrackSynced: state.masterTrackSynced,
        timelinePlayScope: state.timelinePlayScope,
        selectedTimelineIdx: state.selectedTimelineIdx,
        selectedBassTimelineIdx: state.selectedBassTimelineIdx,
        selectedKeysTimelineIdx: state.selectedKeysTimelineIdx,
        selectedGuitarTimelineIdx: state.selectedGuitarTimelineIdx,
        selectedHornsTimelineIdx: state.selectedHornsTimelineIdx,
        selectedVocalTimelineIdx: state.selectedVocalTimelineIdx,
        timelineHasUserSection: state.timelineHasUserSection,
        timelineBpm: state.timelineBpm,
        timelineBpmSourceTitle: state.timelineBpmSourceTitle,
        timelineLoopSingle: state.timelineLoopSingle,
        timelineLoopTrack: state.timelineLoopTrack,
        drumTrackMuted: state.drumTrackMuted,
        bassTrackMuted: state.bassTrackMuted,
        keysTrackMuted: state.keysTrackMuted,
        guitarTrackMuted: state.guitarTrackMuted,
        hornsTrackMuted: state.hornsTrackMuted,
        vocalTrackMuted: state.vocalTrackMuted,
        selectedArtistId: state.selectedArtistId,
        selectedSongId: state.selectedSongId,
        selectedDrumArtistId: state.selectedDrumArtistId,
        selectedDrumSongId: state.selectedDrumSongId,
        selectedBassArtistId: state.selectedBassArtistId,
        selectedBassSongId: state.selectedBassSongId,
        selectedKeysArtistId: state.selectedKeysArtistId,
        selectedKeysSongId: state.selectedKeysSongId,
        selectedGuitarArtistId: state.selectedGuitarArtistId,
        selectedGuitarSongId: state.selectedGuitarSongId,
        selectedHornsArtistId: state.selectedHornsArtistId,
        selectedHornsSongId: state.selectedHornsSongId,
        selectedVocalArtistId: state.selectedVocalArtistId,
        selectedVocalSongId: state.selectedVocalSongId,
        lastSelectedSongBpm: state.lastSelectedSongBpm,
        lastSelectedSongTitle: state.lastSelectedSongTitle,
        kitId: state.kitId,
        bassKitId: state.bassKitId,
        keysKitId: state.keysKitId,
        guitarKitId: state.guitarKitId,
        hornsKitId: state.hornsKitId,
        vocalKitId: state.vocalKitId,
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
        bassEngineVer: 3,
        grid: state.grid,
        drumGrid: state.drumGrid,
        bassGrid: state.bassGrid,
        keysGrid: state.keysGrid,
        guitarGrid: state.guitarGrid,
        hornsGrid: state.hornsGrid,
        vocalGrid: state.vocalGrid
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || (!saved.selectedSongId && !saved.selectedDrumSongId)) return false;

      const drumLookup = findSongById(saved.selectedDrumSongId || saved.selectedSongId);
      const bassLookup = findSongById(saved.selectedBassSongId || saved.selectedSongId);
      const keysLookup = findSongById(saved.selectedKeysSongId || saved.selectedSongId);
      const guitarLookup = findSongById(saved.selectedGuitarSongId || saved.selectedSongId);
      const hornsLookup = findSongById(saved.selectedHornsSongId || saved.selectedSongId);
      const vocalLookup = findSongById(saved.selectedVocalSongId || saved.selectedSongId);

      if (isComposeInstrumentTab(saved.composeInstrument)) {
        state.composeInstrument = saved.composeInstrument;
      }
      if (saved.activeTab) {
        state.activeTab = normalizeTabId(saved.activeTab);
      }
      if (isComposeInstrumentTab(state.activeTab)) {
        state.composeInstrument = state.activeTab;
      }
      if (typeof saved.playBothInCompose === 'boolean') {
        state.playBothInCompose = saved.playBothInCompose;
      }
      if (saved.composeEnsemble && typeof saved.composeEnsemble === 'object') {
        state.composeEnsemble = {
          ...state.composeEnsemble,
          ...saved.composeEnsemble
        };
      }
      if (saved.workspaceLayoutMode === 'all' || saved.workspaceLayoutMode === 'tabs') {
        state.workspaceLayoutMode = saved.workspaceLayoutMode;
      }
      if (typeof saved.desktopMenuClosed === 'boolean') {
        state.desktopMenuClosed = saved.desktopMenuClosed;
      }
      if (typeof saved.showDialsDrawer === 'boolean') {
        state.showDialsDrawer = saved.showDialsDrawer;
      }
      if (typeof saved.showInlinePadsInEdit === 'boolean') {
        state.showInlinePadsInEdit = saved.showInlinePadsInEdit;
      }
      if (typeof saved.showFineTuneDials === 'boolean') {
        state.showFineTuneDials = saved.showFineTuneDials;
      }
      if (typeof saved.showPrimaryTimelineStrip === 'boolean') {
        state.showPrimaryTimelineStrip = saved.showPrimaryTimelineStrip;
      }
      if (typeof saved.timelineLoopSingle === 'boolean') {
        state.timelineLoopSingle = saved.timelineLoopSingle;
      }
      if (isComposeInstrumentTab(saved.timelineLoopTrack)) {
        state.timelineLoopTrack = saved.timelineLoopTrack;
      }
      if (typeof saved.drumTrackMuted === 'boolean') state.drumTrackMuted = saved.drumTrackMuted;
      if (typeof saved.bassTrackMuted === 'boolean') state.bassTrackMuted = saved.bassTrackMuted;
      if (typeof saved.keysTrackMuted === 'boolean') state.keysTrackMuted = saved.keysTrackMuted;
      if (typeof saved.guitarTrackMuted === 'boolean') state.guitarTrackMuted = saved.guitarTrackMuted;
      if (typeof saved.hornsTrackMuted === 'boolean') state.hornsTrackMuted = saved.hornsTrackMuted;
      if (typeof saved.vocalTrackMuted === 'boolean') state.vocalTrackMuted = saved.vocalTrackMuted;

      const isV32Clean = Boolean(saved.timelineV32Clean);
      if (isV32Clean && typeof saved.timelineHasUserSection === 'boolean') {
        state.timelineHasUserSection = saved.timelineHasUserSection;
      } else {
        state.timelineHasUserSection = false;
      }
      if (isV32Clean && saved.timelineBpm) {
        state.timelineBpm = Number(saved.timelineBpm);
      } else {
        state.timelineBpm = null;
      }
      if (isV32Clean && saved.timelineBpmSourceTitle) {
        state.timelineBpmSourceTitle = String(saved.timelineBpmSourceTitle);
      } else {
        state.timelineBpmSourceTitle = '';
      }
      if (saved.addSectionBars === 1 || saved.addSectionBars === 4 || saved.addSectionBars === 16) {
        state.addSectionBars = saved.addSectionBars;
      }

      state.selectedDrumArtistId = drumLookup.artist.artistId;
      state.selectedDrumSongId = drumLookup.song.id;
      state.selectedBassArtistId = bassLookup.artist.artistId;
      state.selectedBassSongId = bassLookup.song.id;
      state.selectedKeysArtistId = keysLookup.artist.artistId;
      state.selectedKeysSongId = keysLookup.song.id;
      state.selectedGuitarArtistId = guitarLookup.artist.artistId;
      state.selectedGuitarSongId = guitarLookup.song.id;
      state.selectedHornsArtistId = hornsLookup.artist.artistId;
      state.selectedHornsSongId = hornsLookup.song.id;
      state.selectedVocalArtistId = vocalLookup.artist.artistId;
      state.selectedVocalSongId = vocalLookup.song.id;

      const activeLookup = findSongById(getInstrumentSongId(state.composeInstrument));
      const { artist, song } = activeLookup;
      state.selectedArtistId = artist.artistId;
      state.selectedSongId = song.id;
      state.lastSelectedSongBpm = Number(saved.lastSelectedSongBpm || song.bpm);
      state.lastSelectedSongTitle = String(saved.lastSelectedSongTitle || song.title);

      state.sectionSources =
        Array.isArray(saved.sectionSources) && saved.sectionSources.length === 4
          ? saved.sectionSources
          : [drumLookup.song.id, drumLookup.song.id, drumLookup.song.id, drumLookup.song.id];

      if (isV32Clean) {
        state.arrangementSections = Array.isArray(saved.arrangementSections) ? saved.arrangementSections : [];
        state.bassArrangementSections = Array.isArray(saved.bassArrangementSections) ? saved.bassArrangementSections : [];
        state.keysArrangementSections = Array.isArray(saved.keysArrangementSections) ? saved.keysArrangementSections : [];
        state.guitarArrangementSections = Array.isArray(saved.guitarArrangementSections) ? saved.guitarArrangementSections : [];
        state.hornsArrangementSections = Array.isArray(saved.hornsArrangementSections) ? saved.hornsArrangementSections : [];
        state.vocalArrangementSections = Array.isArray(saved.vocalArrangementSections) ? saved.vocalArrangementSections : [];
        if (saved.masterTrackEnabled && typeof saved.masterTrackEnabled === 'object') {
          state.masterTrackEnabled = {
            ...state.masterTrackEnabled,
            ...saved.masterTrackEnabled
          };
        }
        if (saved.masterTrackSynced && typeof saved.masterTrackSynced === 'object') {
          state.masterTrackSynced = {
            ...state.masterTrackSynced,
            ...saved.masterTrackSynced
          };
        }
      } else {
        state.arrangementSections = [];
        state.bassArrangementSections = [];
        state.keysArrangementSections = [];
        state.guitarArrangementSections = [];
        state.hornsArrangementSections = [];
        state.vocalArrangementSections = [];
        state.masterTrackEnabled = { drums: false, bass: false, keys: false, guitar: false, horns: false, vocal: false };
        state.masterTrackSynced = { drums: false, bass: false, keys: false, guitar: false, horns: false, vocal: false };
      }

      state.selectedTimelineIdx = Math.max(0, Math.min(Math.max(0, state.arrangementSections.length - 1), Number(saved.selectedTimelineIdx || 0)));
      state.selectedBassTimelineIdx = Math.max(0, Math.min(Math.max(0, state.bassArrangementSections.length - 1), Number(saved.selectedBassTimelineIdx || 0)));
      state.selectedKeysTimelineIdx = Math.max(0, Math.min(Math.max(0, state.keysArrangementSections.length - 1), Number(saved.selectedKeysTimelineIdx || 0)));
      state.selectedGuitarTimelineIdx = Math.max(0, Math.min(Math.max(0, state.guitarArrangementSections.length - 1), Number(saved.selectedGuitarTimelineIdx || 0)));
      state.selectedHornsTimelineIdx = Math.max(0, Math.min(Math.max(0, state.hornsArrangementSections.length - 1), Number(saved.selectedHornsTimelineIdx || 0)));
      state.selectedVocalTimelineIdx = Math.max(0, Math.min(Math.max(0, state.vocalArrangementSections.length - 1), Number(saved.selectedVocalTimelineIdx || 0)));

      const bProf = ARTIST_BASS_PROFILES[bassLookup.artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
      state.kitId = saved.kitId || drumLookup.song.kit || drumLookup.artist.defaultKit;
      state.bassKitId = saved.bassKitId || bProf.bassKit;
      state.keysKitId = saved.keysKitId || 'rhodes_mk1';
      state.guitarKitId = saved.guitarKitId || 'strat_funk';
      state.hornsKitId = saved.hornsKitId || 'jb_funk_horns';
      state.vocalKitId = saved.vocalKitId || 'soul_lead';

      state.tempo = (state.timelineHasUserSection && state.timelineBpm)
        ? state.timelineBpm
        : Number(saved.tempo) || state.lastSelectedSongBpm || song.bpm;
      state.intensityPct = Number(saved.intensityPct ?? 70);
      state.ghostPct = Number(saved.ghostPct ?? 45);
      state.hatEnergyPct = Number(saved.hatEnergyPct ?? 60);
      state.fillPct = Number(saved.fillPct ?? 65);
      state.swingPct = Number(saved.swingPct ?? song.swing);
      state.pocketPct = Number(saved.pocketPct ?? 25);
      state.activeSection = Number(saved.activeSection ?? 0);
      state.loopMode = saved.loopMode || 'all16';
      state.autoFollowSection = saved.autoFollowSection !== false;

      const isValidGrid = (g) =>
        Array.isArray(g) &&
        g.length === DRUM_VOICES.length &&
        Array.isArray(g[0]) &&
        g[0].length === TOTAL_STEPS;

      state.drumGrid = isValidGrid(saved.drumGrid)
        ? cloneGrid256(saved.drumGrid)
        : generateSongGrooveGrid(state.selectedDrumSongId, state.intensityPct, state.ghostPct, state.hatEnergyPct, state.fillPct);
      state.bassGrid =
        saved.bassEngineVer >= 2 && isValidGrid(saved.bassGrid)
          ? cloneGrid256(saved.bassGrid)
          : generateSongBassGrid(state.selectedBassSongId, state.intensityPct, state.ghostPct, state.hatEnergyPct, state.fillPct);
      state.keysGrid = isValidGrid(saved.keysGrid)
        ? cloneGrid256(saved.keysGrid)
        : generateSongKeysGrid(state.selectedKeysSongId, state.intensityPct, state.ghostPct, state.hatEnergyPct, state.fillPct);
      state.guitarGrid = isValidGrid(saved.guitarGrid)
        ? cloneGrid256(saved.guitarGrid)
        : generateSongGuitarGrid(state.selectedGuitarSongId, state.intensityPct, state.ghostPct, state.hatEnergyPct, state.fillPct);
      state.hornsGrid = isValidGrid(saved.hornsGrid)
        ? cloneGrid256(saved.hornsGrid)
        : generateSongHornsGrid(state.selectedHornsSongId, state.intensityPct, state.ghostPct, state.hatEnergyPct, state.fillPct);
      state.vocalGrid = isValidGrid(saved.vocalGrid)
        ? cloneGrid256(saved.vocalGrid)
        : generateSongVocalGrid(state.selectedVocalSongId, state.intensityPct, state.ghostPct, state.hatEnergyPct, state.fillPct);

      state.grid = cloneGrid256(getInstrumentGrid(state.composeInstrument) || state.drumGrid);
      return true;
    } catch (e) {
      return false;
    }
  }

  function recordSessionHistoryEntry(reasonLabel = 'Session Groove') {
    try {
      const { artist, song } = findSongById(state.selectedSongId);
      const cleanArtist = artist ? artist.artistName.replace(/^[^\w]+/, '').trim() : 'Session';
      const title = `${cleanArtist} — ${song ? song.title : 'Groove'} (${state.tempo} BPM)`;
      const top = state.sessionHistory && state.sessionHistory[0];
      if (
        top &&
        top.songId === state.selectedSongId &&
        top.tempo === state.tempo &&
        top.reason === reasonLabel
      ) {
        top.createdAt = new Date().toISOString();
        top.intensityPct = state.intensityPct;
        top.ghostPct = state.ghostPct;
        top.hatEnergyPct = state.hatEnergyPct;
        top.fillPct = state.fillPct;
        top.swingPct = state.swingPct;
        top.pocketPct = state.pocketPct;
        top.kitId = state.kitId;
        top.bassKitId = state.bassKitId;
        top.sectionSources = [...(state.sectionSources || [])];
        top.arrangementSections = JSON.parse(JSON.stringify(state.arrangementSections || []));
        top.bassArrangementSections = JSON.parse(JSON.stringify(state.bassArrangementSections || []));
        top.grid = cloneGrid256(state.grid);
        saveSessionHistory();
        return;
      }
      const entry = {
        id: `hist_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        title,
        reason: reasonLabel,
        artistId: state.selectedArtistId,
        songId: state.selectedSongId,
        kitId: state.kitId,
        bassKitId: state.bassKitId,
        tempo: state.tempo,
        intensityPct: state.intensityPct,
        ghostPct: state.ghostPct,
        hatEnergyPct: state.hatEnergyPct,
        fillPct: state.fillPct,
        swingPct: state.swingPct,
        pocketPct: state.pocketPct,
        sectionSources: [...(state.sectionSources || [])],
        arrangementSections: JSON.parse(JSON.stringify(state.arrangementSections || [])),
        bassArrangementSections: JSON.parse(JSON.stringify(state.bassArrangementSections || [])),
        createdAt: new Date().toISOString(),
        grid: cloneGrid256(state.grid)
      };
      state.sessionHistory = [entry, ...(state.sessionHistory || [])].slice(0, 25);
      saveSessionHistory();
    } catch (_) {}
  }

  function getActiveLoopStepBounds() {
    if (state.viewMode === 'zoom1' && state.loopMode === 'section4') {
      const startStep = state.zoomedBar * 16;
      return { startStep, endStep: startStep + 16, barsCount: 1, durationBeats: 4.0 };
    }
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

  function syncEditingTimelineBlockFromCompose() {
    if (state.editingTimelineIdx === null || state.editingTimelineIdx === undefined) return;
    const targetArr = getTrackSections(state.editingTimelineTrack || state.composeInstrument || 'drums');
    const secItem = targetArr && targetArr[state.editingTimelineIdx];
    if (!secItem) {
      state.editingTimelineIdx = null;
      return;
    }
    const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
    let startStep = 0;
    if (bars === 1) {
      startStep = state.zoomedBar * 16;
    } else if (bars < 16) {
      startStep = state.activeSection * 64;
    }
    secItem.trackType = state.editingTimelineTrack || state.composeInstrument || 'drums';
    secItem.customGrid = extractGridSlice(state.grid, startStep, bars * 16);
    secItem.customEdited = true;
    secItem.songId = state.selectedSongId;
    secItem.addedBy = state.playerName;
    secItem.addedColor = state.playerColor;
  }

  function setGlobalTimelineBpm(newBpm, sourceLabel = '') {
    const clamped = Math.max(50, Math.min(200, Math.round(Number(newBpm) || 90)));
    state.timelineBpm = clamped;
    state.tempo = clamped;
    if (sourceLabel) {
      state.timelineBpmSourceTitle = sourceLabel;
    }
    updateDialsUI();
    updateHeaderSummaries();
    savePersistedState();
    sendOsc('/live/song/set/tempo', [{ type: 'f', value: state.tempo }], false).catch(() => {});
  }

  function setComposeInstrument(inst) {
    const nextInst = isComposeInstrumentTab(inst) ? inst : 'drums';
    if (state.composeInstrument === nextInst) return;

    // Save current edits into the active instrument's grid before switching
    setInstrumentGrid(state.composeInstrument, cloneGrid256(state.grid));

    state.composeInstrument = nextInst;
    state.editingTimelineIdx = null;

    // Sync state.selectedSongId & state.selectedArtistId to the newly active instrument's song
    const nextSongId = getInstrumentSongId(nextInst);
    const { artist, song } = findSongById(nextSongId);
    state.selectedArtistId = artist.artistId;
    state.selectedSongId = song.id;

    let targetGrid = getInstrumentGrid(nextInst);
    if (!targetGrid) {
      targetGrid = generateSongInstrumentGrid(
        nextInst,
        nextSongId || song.id,
        state.intensityPct,
        state.ghostPct,
        state.hatEnergyPct,
        state.fillPct
      );
      setInstrumentGrid(nextInst, targetGrid);
    }
    state.grid = cloneGrid256(targetGrid);

    syncSequencerNotes();
    renderComposeInstrumentUI();
    renderArtistTabsAndSongs();
    renderSectionTabs();
    renderMini4BarMap();
    renderSequencerGrid();
    renderComposeTimelineBanner();
    updateDialsUI();
    updatePlayerButtons();
  }

  function loadSongGroove(songId, resetDials = true, targetInstOverride = null) {
    const { artist, song } = findSongById(songId);
    const targetInst =
      targetInstOverride || (state.songModalOpen ? state.songModalInstrument : state.composeInstrument) || 'drums';
    const updateAll = targetInst === 'both' || targetInst === 'all';

    // Save current edits on the currently active instrument before modifying grids
    if (state.grid && isComposeInstrumentTab(state.composeInstrument)) {
      setInstrumentGrid(state.composeInstrument, cloneGrid256(state.grid));
    }

    state.editingTimelineIdx = null;
    for (const inst of INSTRUMENT_LIST) {
      const secArr = getTrackSections(inst);
      if (!Array.isArray(secArr) || secArr.length === 0) {
        setTrackSections(inst, createDefaultArrangementSections(song.id, state.playerName, state.playerColor, inst));
      }
    }

    const bProf = ARTIST_BASS_PROFILES[artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
    const instrumentsToUpdate = updateAll ? INSTRUMENT_LIST : [isComposeInstrumentTab(targetInst) ? targetInst : 'drums'];

    for (const inst of instrumentsToUpdate) {
      setInstrumentSongSelection(inst, artist.artistId, song.id);
      if (resetDials) {
        if (inst === 'drums') state.kitId = song.kit || artist.defaultKit;
        else if (inst === 'bass') state.bassKitId = bProf.bassKit;
      }
      const nextGrid = generateSongInstrumentGrid(
        inst,
        song.id,
        state.intensityPct,
        state.ghostPct,
        state.hatEnergyPct,
        state.fillPct
      );
      setInstrumentGrid(inst, nextGrid);
    }

    // Track most recent song BPM selected: sets state.tempo unless Global Timeline BPM is set!
    state.lastSelectedSongBpm = song.bpm;
    state.lastSelectedSongTitle = song.title;
    if (resetDials) {
      if (state.timelineHasUserSection && state.timelineBpm) {
        state.tempo = state.timelineBpm;
      } else {
        state.tempo = song.bpm;
      }
      state.swingPct = song.swing;
    }

    // Keep state.selectedSongId / state.selectedArtistId synced to the currently active Compose tab
    const activeSongId = getInstrumentSongId(state.composeInstrument);
    const activeLookup = findSongById(activeSongId);
    state.selectedArtistId = activeLookup.artist.artistId;
    state.selectedSongId = activeLookup.song.id;

    state.grid = cloneGrid256(getInstrumentGrid(state.composeInstrument) || state.drumGrid);
    syncSequencerNotes();
    const meta = getInstrumentMeta(targetInst);
    recordSessionHistoryEntry(
      `Loaded ${updateAll ? 'All Band Tracks' : meta.label}: ${song.title}`
    );
    renderComposeInstrumentUI();
    renderArtistTabsAndSongs();
    renderSectionTabs();
    renderMini4BarMap();
    renderSequencerGrid();
    renderSongBuilderAndClipsUI();
    renderCrateAndJamUI();
    updateDialsUI();
    updatePlayerButtons();
    renderComposeTimelineBanner();
    const titleInput = document.getElementById('fold-crate-title-input');
    const arrangeTitleInput = document.getElementById('fold-arrange-title-input');
    const cleanDefault = `${activeLookup.artist.artistName.replace(/^[^\w]+/, '').trim()} - ${activeLookup.song.title} (${state.tempo} BPM)`;
    if (titleInput && activeLookup.artist && activeLookup.song) {
      titleInput.placeholder = cleanDefault;
    }
    if (arrangeTitleInput && activeLookup.artist && activeLookup.song) {
      arrangeTitleInput.placeholder = `${cleanDefault} Timeline`;
    }
    if (!state.suppressJamBroadcast && state.jamMode === 'shared') {
      broadcastFullJamState(`Selected ${song.title} for ${updateAll ? 'All Band' : meta.label}`);
    }
  }

  function rebuildGridFromArrangementSections() {
    const arr = Array.isArray(state.arrangementSections) && state.arrangementSections.length > 0
      ? state.arrangementSections
      : createDefaultArrangementSections(state.selectedDrumSongId || state.selectedSongId, state.playerName, state.playerColor, 'drums');
    const merged = createEmptyGrid256();
    const newSources = [];
    let dstStep = 0;
    let idx = 0;
    while (dstStep < TOTAL_STEPS && arr.length > 0) {
      const secItem = arr[idx % arr.length];
      if (newSources.length < 4) newSources.push(secItem.songId || state.selectedDrumSongId || state.selectedSongId);
      const blockGrid = getTimelineBlockGrid(secItem, 'drums');
      const blockSteps = blockGrid[0] ? blockGrid[0].length : 64;
      for (let i = 0; i < blockSteps && dstStep + i < TOTAL_STEPS; i++) {
        for (let v = 0; v < DRUM_VOICES.length; v++) {
          merged[v][dstStep + i] = { ...blockGrid[v][i] };
        }
      }
      dstStep += blockSteps;
      idx++;
    }
    while (newSources.length < 4) newSources.push(state.selectedDrumSongId || state.selectedSongId);
    state.sectionSources = newSources;
    state.drumGrid = merged;
    if (state.composeInstrument === 'drums') {
      state.grid = cloneGrid256(merged);
    }
    syncSequencerNotes();
  }

  function regenerateFromDials() {
    const inst = state.composeInstrument || 'drums';
    const nextGrid = generateSongInstrumentGrid(
      inst,
      getInstrumentSongId(inst),
      state.intensityPct,
      state.ghostPct,
      state.hatEnergyPct,
      state.fillPct
    );
    setInstrumentGrid(inst, nextGrid);
    state.grid = cloneGrid256(nextGrid);
    syncEditingTimelineBlockFromCompose();
    syncSequencerNotes();
    recordSessionHistoryEntry('Tweaked Dials');
    renderSectionTabs();
    renderMini4BarMap();
    renderSequencerGrid();
    renderSongBuilderAndClipsUI();
    if (!state.suppressJamBroadcast && state.jamMode === 'shared') {
      broadcastFullJamState('Adjusted Dials');
    }
  }

  function buildNotesFromArbitraryGrid(
    gridObj,
    rangeStartStep = 0,
    rangeEndStep = TOTAL_STEPS,
    instrumentType = 'drums',
    songId = null
  ) {
    const isDrums = instrumentType === 'drums';
    const notes = [];
    const stepDur = 0.25;
    const swingOffset = (state.swingPct / 100) * 0.145;
    const pocketScale = state.pocketPct / 100;
    const kit = getActiveKitProfile();
    const snareLaybackBeats = ((kit.laybackMs || 0) / 1000) * (state.tempo / 60) * pocketScale;
    const voices = getActiveVoices(instrumentType, songId || getInstrumentSongId(instrumentType));

    const getSwungStepStart = (stepIdx) =>
      stepIdx * stepDur + (stepIdx % 2 === 1 ? swingOffset : 0);

    const baseBeatOffset = rangeStartStep * stepDur;

    for (let vIdx = 0; vIdx < voices.length; vIdx++) {
      if (state.mutedLanes[vIdx]) continue;
      const voice = voices[vIdx];
      const isSnareOrRim = isDrums && (vIdx === 1 || vIdx === 2);
      const row = gridObj && gridObj[vIdx] ? gridObj[vIdx] : [];

      for (let s = rangeStartStep; s < rangeEndStep; s++) {
        const cell = row[s];
        if (!cell || cell.state === 0) continue;

        const baseVel = cell.state === 2 ? 124 : cell.state === 3 ? 52 : 98;
        const subCount = cell.sub || 1;
        const isTurnaroundFillZone = (s % 64) >= 48;

        const stepStart = getSwungStepStart(s) - baseBeatOffset;
        const nextStepStart = getSwungStepStart(s + 1) - baseBeatOffset;
        const actualStepSpan = Math.max(0.12, nextStepStart - stepStart);
        const subStepDur = subCount > 1 ? actualStepSpan / subCount : stepDur;

        const layback =
          isSnareOrRim && subCount === 1 && !isTurnaroundFillZone ? snareLaybackBeats : 0;

        let noteDurBeats = subStepDur * 0.85;
        if (!isDrums && subCount === 1) {
          let hasImmediateNext = false;
          for (let nv = 0; nv < voices.length; nv++) {
            if (gridObj && gridObj[nv] && gridObj[nv][s + 1] && gridObj[nv][s + 1].state > 0) {
              hasImmediateNext = true;
              break;
            }
          }
          if (cell.state === 3) {
            noteDurBeats = instrumentType === 'guitar' ? 0.1 : 0.14;
          } else if (instrumentType === 'keys' || instrumentType === 'horns') {
            noteDurBeats = !hasImmediateNext && cell.state === 2 ? 0.72 : 0.36;
          } else if (instrumentType === 'vocal') {
            noteDurBeats = !hasImmediateNext && cell.state === 2 ? 0.65 : 0.34;
          } else if (instrumentType === 'guitar') {
            noteDurBeats = !hasImmediateNext && cell.state === 2 ? 0.42 : 0.2;
          } else {
            noteDurBeats = !hasImmediateNext && cell.state === 2 ? 0.44 : 0.23;
          }
        }

        for (let r = 0; r < subCount; r++) {
          const seed = Math.sin((vIdx + 1) * 97 + s * 31 + r * 17);
          const timeJitter =
            subCount === 1 && !isTurnaroundFillZone ? pocketScale * seed * 0.01 : 0;
          const velJitter = Math.round(pocketScale * Math.cos(seed * 7) * 7);
          const rollRamp = subCount > 1 ? Math.round(((r + 1) / subCount) * 16 - 12) : 0;

          const startTime = Math.max(0, stepStart + layback + r * subStepDur + timeJitter);
          const velocity = Math.max(20, Math.min(127, baseVel + velJitter + rollRamp));
          notes.push({
            pitch: voice.pitch,
            startTime: Number(startTime.toFixed(4)),
            duration: Number((subCount > 1 ? subStepDur * 0.82 : noteDurBeats).toFixed(4)),
            velocity,
            muted: 0,
            instrument: instrumentType
          });
        }
      }
    }
    notes.sort((a, b) => a.startTime - b.startTime || a.pitch - b.pitch);
    return notes;
  }

  function buildNotesFromSequencer(rangeStartStep = 0, rangeEndStep = TOTAL_STEPS, instrumentOverride = null) {
    const inst = instrumentOverride || state.composeInstrument || 'drums';
    return buildNotesFromArbitraryGrid(
      state.grid,
      rangeStartStep,
      rangeEndStep,
      inst,
      getInstrumentSongId(inst)
    );
  }

  function buildTimelinePlaybackData(onlySelectedBlock = false, trackType = 'drums') {
    const rawArr = getTrackSections(trackType);
    const fullGrid = Array.from({ length: DRUM_VOICES.length }, () => []);
    if (!Array.isArray(rawArr) || rawArr.length === 0) {
      return {
        trackType,
        totalBars: 0,
        totalSteps: 0,
        durationBeats: 0,
        notes: [],
        blockRanges: [],
        fullGrid
      };
    }
    const arr = rawArr;
    const selIdx = getSelectedTimelineIdx(trackType);
    const blocksToBuild =
      onlySelectedBlock && arr[selIdx]
        ? [{ secItem: arr[selIdx], origIdx: selIdx }]
        : arr.map((secItem, origIdx) => ({ secItem, origIdx }));

    const blockRanges = [];
    const allNotes = [];
    let runningStep = 0;
    let runningBar = 0;

    for (const { secItem, origIdx } of blocksToBuild) {
      const blockGrid = getTimelineBlockGrid(secItem, trackType);
      const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
      const steps = bars * 16;
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        for (let i = 0; i < steps; i++) {
          fullGrid[v].push(blockGrid[v][i] || { state: 0, sub: 1 });
        }
      }
      const blockNotes = buildNotesFromArbitraryGrid(
        blockGrid,
        0,
        steps,
        trackType,
        secItem.songId || getInstrumentSongId(trackType)
      );
      const beatOffset = runningBar * 4.0;
      for (const n of blockNotes) {
        allNotes.push({
          ...n,
          startTime: Number((n.startTime + beatOffset).toFixed(4))
        });
      }

      blockRanges.push({
        origIdx,
        secItem,
        startStep: runningStep,
        endStep: runningStep + steps,
        startBar: runningBar,
        endBar: runningBar + bars - 1,
        bars,
        steps
      });
      runningStep += steps;
      runningBar += bars;
    }

    const totalSteps = Math.max(16, runningStep);
    const totalBars = Math.max(1, runningBar);
    const durationBeats = totalBars * 4.0;
    allNotes.sort((a, b) => a.startTime - b.startTime || a.pitch - b.pitch);
    return {
      trackType,
      totalBars,
      totalSteps,
      durationBeats,
      notes: allNotes,
      blockRanges,
      fullGrid
    };
  }

  function getTimelineTracksForPlayback() {
    if (state.timelinePlayScope && isComposeInstrumentTab(state.timelinePlayScope)) {
      const inst = state.timelinePlayScope;
      return getTrackSections(inst).length > 0 ? [inst] : [];
    }
    const masterTracks = getActiveMasterTracks().filter((inst) => !isTrackMuted(inst));
    if (masterTracks.length > 0) return masterTracks;
    return INSTRUMENT_LIST.filter((inst) => getTrackSections(inst).length > 0 && !isTrackMuted(inst));
  }

  function syncSequencerNotes() {
    const activeInst = state.composeInstrument || 'drums';
    setInstrumentGrid(activeInst, cloneGrid256(state.grid));

    for (const inst of INSTRUMENT_LIST) {
      if (!getInstrumentGrid(inst)) {
        setInstrumentGrid(
          inst,
          generateSongInstrumentGrid(
            inst,
            getInstrumentSongId(inst),
            state.intensityPct,
            state.ghostPct,
            state.hatEnergyPct,
            state.fillPct
          )
        );
      }
    }

    state.currentNotes = buildNotesFromSequencer(0, TOTAL_STEPS, activeInst);
    const companionNotes = [];
    for (const inst of INSTRUMENT_LIST) {
      if (inst === activeInst) continue;
      if (!state.composeEnsemble || !state.composeEnsemble[inst]) continue;
      const g = getInstrumentGrid(inst);
      if (!g) continue;
      const list = buildNotesFromArbitraryGrid(g, 0, TOTAL_STEPS, inst, getInstrumentSongId(inst));
      for (const n of list) companionNotes.push(n);
    }
    companionNotes.sort((a, b) => a.startTime - b.startTime || a.pitch - b.pitch);
    state.currentCompanionNotes = companionNotes;
    savePersistedState();
    renderMini4BarMap();
  }

  // ==========================================================================
  // 8. Real-Time Phone Playback Clock (Compose Mode + Instrument/Master Timeline Mode) + .WAV Audio Export
  // ==========================================================================
  function startPhonePlayback(modeOverride = null, scopeOverride = null) {
    const ctx = getAudioCtx();
    if (modeOverride) {
      state.playbackMode = modeOverride;
    } else {
      state.playbackMode = state.activeTab === 'arrange' ? 'timeline' : 'compose';
    }
    if (state.playbackMode === 'timeline') {
      if (scopeOverride) {
        state.timelinePlayScope = scopeOverride;
      } else {
        state.timelinePlayScope =
          state.activeTab === 'arrange' ? 'master' : state.composeInstrument || 'drums';
      }
    }
    state.phonePlayer.playing = true;
    state.phonePlayer.startWallTime = ctx.currentTime + 0.02;
    state.phonePlayer.lastStepTime = -0.001;
    updatePlayerButtons();

    function scheduleWindow(
      notesList,
      windowStartRelBeat,
      windowEndRelBeat,
      loopStartBeatOffset,
      loopStartWallTime,
      beatsPerSec,
      now
    ) {
      const absStart = loopStartBeatOffset + windowStartRelBeat;
      const absEnd = loopStartBeatOffset + windowEndRelBeat;
      for (const n of notesList) {
        if (n.muted) continue;
        const st = Number(n.startTime ?? 0);
        if (st > absStart && st <= absEnd) {
          const relBeat = st - loopStartBeatOffset;
          const exactWhen = Math.max(now, loopStartWallTime + relBeat / beatsPerSec);
          const inst = n.instrument || 'drums';
          const durSec = Math.max(0.08, Number(n.duration || 0.22) / beatsPerSec);
          triggerInstrumentVoice(
            ctx,
            inst,
            Number(n.pitch),
            Number(n.velocity || 100),
            exactWhen,
            durSec,
            getKitIdForInstrument(inst)
          );
        }
      }
    }

    function tick() {
      if (!state.phonePlayer.playing) return;
      const now = ctx.currentTime;
      const bpm = state.tempo || 90;
      const beatsPerSec = bpm / 60;

      const isTimelineMode = state.playbackMode === 'timeline';
      const tlByTrack = {};
      const activePlayTracks = isTimelineMode ? getTimelineTracksForPlayback() : [];
      if (isTimelineMode) {
        for (const inst of INSTRUMENT_LIST) {
          const loopOnlyThis = state.timelineLoopSingle && state.timelineLoopTrack === inst;
          tlByTrack[inst] = buildTimelinePlaybackData(loopOnlyThis, inst);
        }
      }
      const composeBounds = isTimelineMode ? null : getActiveLoopStepBounds();

      const startStep = isTimelineMode ? 0 : composeBounds.startStep;
      let clipDur = composeBounds ? composeBounds.durationBeats : 16;
      if (isTimelineMode) {
        if (state.timelineLoopSingle && tlByTrack[state.timelineLoopTrack] && tlByTrack[state.timelineLoopTrack].durationBeats > 0) {
          clipDur = tlByTrack[state.timelineLoopTrack].durationBeats;
        } else {
          let maxDur = 4;
          for (const inst of activePlayTracks) {
            if (tlByTrack[inst] && tlByTrack[inst].durationBeats > 0) {
              maxDur = Math.max(maxDur, tlByTrack[inst].durationBeats);
            }
          }
          clipDur = maxDur;
        }
      }

      let notesList = [];
      if (isTimelineMode) {
        for (const inst of activePlayTracks) {
          const tData = tlByTrack[inst];
          if (!tData || tData.durationBeats <= 0) continue;
          const tDur = Math.max(4, tData.durationBeats);
          for (let offset = 0; offset < clipDur - 0.01; offset += tDur) {
            for (const tn of tData.notes) {
              if (tn.startTime + offset < clipDur) {
                notesList.push(offset === 0 ? tn : { ...tn, startTime: tn.startTime + offset });
              }
            }
          }
        }
      } else {
        notesList = state.playBothInCompose
          ? [...(state.currentNotes || []), ...(state.currentCompanionNotes || [])]
          : state.currentNotes || [];
      }

      const loopStartBeatOffset = startStep * 0.25;
      const lookaheadBeats = 0.085 * beatsPerSec;

      let elapsedBeats = Math.max(0, (now - state.phonePlayer.startWallTime) * beatsPerSec);
      const targetBeat = elapsedBeats + lookaheadBeats;
      const prevBeat = state.phonePlayer.lastStepTime;

      if (targetBeat >= clipDur) {
        scheduleWindow(
          notesList,
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
          notesList,
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
          notesList,
          prevBeat,
          targetBeat,
          loopStartBeatOffset,
          state.phonePlayer.startWallTime,
          beatsPerSec,
          now
        );
        state.phonePlayer.lastStepTime = targetBeat;
      }

      const totalClipSteps = Math.max(1, Math.round(clipDur * 4));
      const relStep = Math.floor(elapsedBeats / 0.25) % totalClipSteps;

      if (isTimelineMode) {
        const currentTimelineBar = Math.floor(relStep / 16);
        const trackStates = {};
        for (const inst of INSTRUMENT_LIST) {
          const tData = tlByTrack[inst];
          if (!activePlayTracks.includes(inst) || !tData || tData.totalSteps <= 0) {
            trackStates[inst] = { blockIdx: -1, progressPct: 0, activeRange: null };
            state.activeTimelineIdxByTrack[inst] = -1;
            continue;
          }
          const tStep = relStep % Math.max(16, tData.totalSteps);
          let activeRange = tData.blockRanges[0];
          for (const br of tData.blockRanges) {
            if (tStep >= br.startStep && tStep < br.endStep) {
              activeRange = br;
              break;
            }
          }
          const blockIdx = activeRange ? activeRange.origIdx : 0;
          const progressPct = activeRange
            ? Math.min(100, Math.max(0, (((tStep - activeRange.startStep) + 0.5) / activeRange.steps) * 100))
            : 0;
          trackStates[inst] = { blockIdx, progressPct, activeRange };
          state.activeTimelineIdxByTrack[inst] = blockIdx;
        }

        const primaryHudInst = activePlayTracks[0] || 'drums';
        const primaryTrackState = trackStates[primaryHudInst] || { blockIdx: -1, progressPct: 0, activeRange: null };
        state.activeTimelineIdx = trackStates.drums ? trackStates.drums.blockIdx : -1;
        state.activeBassTimelineIdx = trackStates.bass ? trackStates.bass.blockIdx : -1;
        state.activeTimelineBar = currentTimelineBar;
        highlightTimelinePlayhead(
          primaryTrackState.blockIdx,
          currentTimelineBar,
          Math.round(clipDur / 4),
          relStep,
          primaryTrackState.progressPct,
          primaryTrackState.activeRange,
          trackStates.bass ? trackStates.bass.blockIdx : -1,
          trackStates.bass ? trackStates.bass.progressPct : 0,
          trackStates.bass ? trackStates.bass.activeRange : null,
          trackStates
        );
      } else {
        const current16th = startStep + relStep;
        const currentBar = Math.floor(current16th / 16);
        const currentSec = Math.floor(currentBar / 4);

        if (current16th !== state.activeStep) {
          state.activeStep = current16th;
          state.activeBar = currentBar;

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
      }

      state.phonePlayer.rafId = requestAnimationFrame(tick);
    }

    if (state.phonePlayer.rafId) cancelAnimationFrame(state.phonePlayer.rafId);
    state.phonePlayer.rafId = requestAnimationFrame(tick);
  }

  async function exportArrangementToWavFile(mode = 'timeline', triggerBtn = null) {
    const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineCtx) {
      window.alert('OfflineAudioContext is not supported in this browser.');
      return;
    }
    const origText = triggerBtn ? triggerBtn.textContent : '';
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.textContent = '⏳ Compiling Stereo .WAV...';
    }
    try {
      const bpm = state.tempo || 90;
      const beatsPerSec = bpm / 60;
      let clipDurBeats = 16;
      let notesToRender = [];

      if (mode === 'compose') {
        const bounds = getActiveLoopStepBounds();
        clipDurBeats = bounds.durationBeats;
        const startBeatOffset = bounds.startStep * 0.25;
        const rawList = state.playBothInCompose
          ? [...(state.currentNotes || []), ...(state.currentCompanionNotes || [])]
          : state.currentNotes || [];
        for (const n of rawList) {
          if (n.muted) continue;
          const st = Number(n.startTime ?? 0);
          if (st >= startBeatOffset && st < startBeatOffset + clipDurBeats) {
            notesToRender.push({
              ...n,
              startTime: st - startBeatOffset
            });
          }
        }
      } else {
        const tracksToExport =
          getActiveMasterTracks().filter((inst) => !isTrackMuted(inst)).length > 0
            ? getActiveMasterTracks().filter((inst) => !isTrackMuted(inst))
            : INSTRUMENT_LIST.filter((inst) => getTrackSections(inst).length > 0 && !isTrackMuted(inst));
        const tlByTrack = {};
        let maxDur = 4;
        for (const inst of tracksToExport) {
          tlByTrack[inst] = buildTimelinePlaybackData(false, inst);
          if (tlByTrack[inst].durationBeats > 0) {
            maxDur = Math.max(maxDur, tlByTrack[inst].durationBeats);
          }
        }
        clipDurBeats = maxDur;
        for (const inst of tracksToExport) {
          const tData = tlByTrack[inst];
          if (!tData || tData.durationBeats <= 0) continue;
          const tDur = Math.max(4, tData.durationBeats);
          for (let offset = 0; offset < clipDurBeats - 0.01; offset += tDur) {
            for (const tn of tData.notes) {
              if (tn.startTime + offset < clipDurBeats) {
                notesToRender.push(offset === 0 ? tn : { ...tn, startTime: tn.startTime + offset });
              }
            }
          }
        }
      }

      const sampleRate = 44100;
      const tailSec = 1.25;
      const totalDurSec = clipDurBeats / beatsPerSec + tailSec;
      const totalSamples = Math.max(sampleRate, Math.ceil(totalDurSec * sampleRate));
      const offlineCtx = new OfflineCtx(2, totalSamples, sampleRate);

      for (const n of notesToRender) {
        if (n.muted) continue;
        const whenSec = Math.max(0.01, Number(n.startTime || 0) / beatsPerSec + 0.02);
        const durSec = Math.max(0.08, Number(n.duration || 0.22) / beatsPerSec);
        const inst = n.instrument || 'drums';
        triggerInstrumentVoice(
          offlineCtx,
          inst,
          Number(n.pitch),
          Number(n.velocity || 100),
          whenSec,
          durSec,
          getKitIdForInstrument(inst)
        );
      }

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const { artist, song } = findSongById(state.selectedSongId);
      const cleanSong = (song ? song.title : 'Arrangement').replace(/[^a-z0-9]+/gi, '_');
      const totalBars = Math.round(clipDurBeats / 4);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessh_${cleanSong}_${bpm}BPM_${totalBars}Bars.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);

      showTimelineToast(`🎧 Exported ${totalBars}-Bar Stereo .WAV (${bpm} BPM)`);
      if (triggerBtn) {
        triggerBtn.textContent = `✅ Downloaded .WAV (${totalBars}B)!`;
        setTimeout(() => {
          triggerBtn.disabled = false;
          triggerBtn.textContent = origText;
        }, 2200);
      }
    } catch (err) {
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.textContent = origText || '🎧 Export .WAV';
      }
    }
  }

  function stopPhonePlayback() {
    state.phonePlayer.playing = false;
    state.activeStep = -1;
    state.activeBar = -1;
    state.activeTimelineIdx = -1;
    state.activeBassTimelineIdx = -1;
    for (const inst of INSTRUMENT_LIST) {
      state.activeTimelineIdxByTrack[inst] = -1;
    }
    state.activeTimelineBar = -1;
    if (state.phonePlayer.rafId) {
      cancelAnimationFrame(state.phonePlayer.rafId);
      state.phonePlayer.rafId = null;
    }
    highlightPlayheadStep(-1, -1, -1);
    highlightTimelinePlayhead(-1, -1, 0, -1, 0, null, -1, 0, null, null);
    updatePlayerButtons();
  }

  function highlightTimelinePlayhead(
    drumBlockIdx,
    timelineBarIdx,
    totalBars,
    relStep,
    drumProgressPct,
    activeDrumRange,
    bassBlockIdx = -1,
    bassProgressPct = 0,
    activeBassRange = null,
    trackStates = null
  ) {
    for (const inst of INSTRUMENT_LIST) {
      const tState = trackStates && trackStates[inst]
        ? trackStates[inst]
        : inst === 'drums'
        ? { blockIdx: drumBlockIdx, progressPct: drumProgressPct, activeRange: activeDrumRange }
        : inst === 'bass'
        ? { blockIdx: bassBlockIdx, progressPct: bassProgressPct, activeRange: activeBassRange }
        : { blockIdx: -1, progressPct: 0, activeRange: null };

      document.querySelectorAll(`.fold-tl-block[data-tl-track="${inst}"]`).forEach((el) => {
        const idx = Number(el.getAttribute('data-tl-block'));
        const isPlaying = idx === tState.blockIdx && tState.blockIdx >= 0;
        el.classList.toggle('playing-tl-block', isPlaying);
        const needle = el.querySelector('.fold-tl-needle');
        if (needle) {
          needle.style.display = isPlaying ? 'block' : 'none';
          if (isPlaying) needle.style.left = `${tState.progressPct}%`;
        }
      });
    }

    // Also highlight step playhead inside the Section Sequence Modal if open for this block!
    const modalGridEl = document.getElementById('fold-modal-seq-grid');
    if (modalGridEl) {
      const mTrack = state.modalTrack || 'drums';
      const mState = trackStates && trackStates[mTrack]
        ? trackStates[mTrack]
        : mTrack === 'bass'
        ? { blockIdx: bassBlockIdx, activeRange: activeBassRange }
        : { blockIdx: drumBlockIdx, activeRange: activeDrumRange };
      const stepInBlock =
        mState.blockIdx >= 0 && mState.blockIdx === state.modalSectionIdx && mState.activeRange
          ? (relStep % Math.max(16, mState.activeRange.endStep)) - mState.activeRange.startStep
          : -1;
      modalGridEl.querySelectorAll('.drum-step-cell[data-modal-step]').forEach((cellEl) => {
        const s = Number(cellEl.getAttribute('data-modal-step'));
        cellEl.classList.toggle('playhead', s === stepInBlock);
      });
    }
    const tlHudEl = document.getElementById('fold-timeline-hud-pill');
    if (tlHudEl) {
      if (drumBlockIdx >= 0 && activeDrumRange && activeDrumRange.secItem) {
        const secItem = activeDrumRange.secItem;
        const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === secItem.roleId) || ARRANGEMENT_ROLES[1];
        const { song } = findSongById(secItem.songId || state.selectedSongId);
        const beatInBar = Math.floor((relStep % 16) / 4) + 1;
        tlHudEl.textContent = `▶ Bar ${timelineBarIdx + 1}/${totalBars} · Beat ${beatInBar} (${roleObj.label} · ${song.title}) · ${state.tempo} BPM`;
        tlHudEl.style.borderColor = roleObj.color;
        tlHudEl.style.color = '#fff';
      } else {
        const masterTracks = getActiveMasterTracks();
        let maxBars = 0;
        for (const inst of masterTracks) {
          const bSum = (getTrackSections(inst) || []).reduce((sum, s) => sum + (Number(s.bars) || 4), 0);
          maxBars = Math.max(maxBars, bSum);
        }
        tlHudEl.textContent =
          masterTracks.length > 0
            ? `⏸ Ready (${masterTracks.length} Master Track${masterTracks.length === 1 ? '' : 's'} · ${maxBars}B · ${state.tempo} BPM)`
            : `⏸ Ready (0 Master Tracks yet · Send an Instrument Timeline!)`;
        tlHudEl.style.borderColor = 'rgba(255,255,255,0.2)';
        tlHudEl.style.color = '#d1d5db';
      }
    }
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
    const performHudEl = document.getElementById('fold-perform-hud-pill');
    if (performHudEl) {
      if (stepIdx >= 0 && barIdx >= 0 && secIdx >= 0) {
        const sec = SONG_SECTIONS[secIdx] || SONG_SECTIONS[0];
        const beatInBar = Math.floor((stepIdx % 16) / 4) + 1;
        performHudEl.textContent = `▶ ${sec.name} · Bar ${barIdx + 1} of 16 · Beat ${beatInBar}`;
        performHudEl.style.borderColor = sec.color;
        performHudEl.style.color = '#fff';
      } else {
        const sec = SONG_SECTIONS[state.activeSection] || SONG_SECTIONS[0];
        performHudEl.textContent = `⏸ Ready (${sec.name} · ${state.tempo} BPM)`;
        performHudEl.style.borderColor = 'rgba(255,255,255,0.2)';
        performHudEl.style.color = '#d1d5db';
      }
    }
  }

  function updatePlayerButtons() {
    const playBtn = document.getElementById('fold-play-phone-btn');
    const padsPlayBtn = document.getElementById('fold-pads-play-btn');
    const tlPlayBtn = document.getElementById('fold-timeline-play-btn');
    const primaryStripPlayBtn = document.getElementById('fold-primary-strip-play-btn');
    const tlLoopBtn = document.getElementById('fold-timeline-loop-mode-btn');
    const disableSecLoopBtn = document.getElementById('fold-disable-sec-loop-btn');
    const playBothBtn = document.getElementById('fold-compose-play-both-btn');
    const playSoloBtn = document.getElementById('fold-compose-play-solo-btn');
    const playTogetherBtn = document.getElementById('fold-compose-play-together-btn');
    const { barsCount } = getActiveLoopStepBounds();
    const secName = SONG_SECTIONS[state.activeSection]?.badge || '4-Bar';
    const loopLabel =
      state.loopMode === 'section4'
        ? state.viewMode === 'zoom1'
          ? `Bar ${state.zoomedBar + 1} (1 Bar)`
          : `${secName} (4 Bars)`
        : `${barsCount} Bars`;

    const activeInst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
    const activeMeta = getInstrumentMeta(activeInst);
    const activeInstArr = getTrackSections(activeInst) || [];
    const activeInstBars = activeInstArr.reduce((acc, s) => acc + (Number(s.bars) || 4), 0);

    const masterTracks = getActiveMasterTracks();
    let totalMasterBars = 0;
    for (const inst of masterTracks) {
      const secList = getTrackSections(inst) || [];
      const bSum = secList.reduce((acc, s) => acc + (Number(s.bars) || 4), 0);
      totalMasterBars = Math.max(totalMasterBars, bSum);
    }

    const loopTrackMeta = getInstrumentMeta(state.timelineLoopTrack || 'drums');
    const loopTrackArr = getTrackSections(loopTrackMeta.id) || [];
    const activeLoopSecIdx = Math.max(0, Math.min(Math.max(0, loopTrackArr.length - 1), getSelectedTimelineIdx(loopTrackMeta.id)));
    const loopTrackIcon = `${loopTrackMeta.icon} ${loopTrackMeta.short}`;

    const isPlayingCompose = state.phonePlayer.playing && state.playbackMode !== 'timeline';
    const enabledIcons = INSTRUMENT_LIST.filter((i) => i === activeMeta.id || (state.composeEnsemble && state.composeEnsemble[i]))
      .map((i) => getInstrumentMeta(i).icon)
      .join('+');

    if (playBothBtn) {
      playBothBtn.classList.toggle('chip-on', Boolean(state.playBothInCompose));
      playBothBtn.textContent = state.playBothInCompose
        ? `🔊 Ensemble (${enabledIcons})`
        : `🔈 Solo ${activeMeta.short} Only`;
    }

    if (playSoloBtn) {
      const isPlayingSolo = isPlayingCompose && !state.playBothInCompose;
      playSoloBtn.classList.toggle('active', isPlayingSolo);
      playSoloBtn.classList.toggle('chip-on', !state.playBothInCompose);
      playSoloBtn.textContent = isPlayingSolo
        ? `⏹ Stop ${activeMeta.icon} ${activeMeta.short} Solo`
        : `▶ Play ${activeMeta.icon} ${activeMeta.short} Solo`;
    }

    if (playTogetherBtn) {
      const isPlayingTogether = isPlayingCompose && state.playBothInCompose;
      playTogetherBtn.classList.toggle('active', isPlayingTogether);
      playTogetherBtn.classList.toggle('chip-on', Boolean(state.playBothInCompose));
      playTogetherBtn.textContent = isPlayingTogether
        ? `⏹ Stop Band (${enabledIcons})`
        : `▶ Play Band (${enabledIcons})`;
    }

    document.querySelectorAll('[data-ensemble-toggle]').forEach((btn) => {
      const inst = btn.getAttribute('data-ensemble-toggle');
      const isOn = inst === activeMeta.id || Boolean(state.composeEnsemble && state.composeEnsemble[inst]);
      btn.classList.toggle('chip-on', isOn);
    });

    const isTlPlaying = state.phonePlayer.playing && state.playbackMode === 'timeline';
    const isPlayingThisInstTl = isTlPlaying && state.timelinePlayScope === activeInst;
    const isPlayingMasterTl = isTlPlaying && state.timelinePlayScope === 'master';

    if (playBtn) {
      if (state.phonePlayer.playing) {
        playBtn.textContent =
          state.playbackMode === 'timeline'
            ? state.timelinePlayScope === 'master'
              ? '⏹ Stop Master Timeline'
              : `⏹ Stop ${activeMeta.short} Timeline`
            : '⏹ Stop Playback';
      } else if (state.activeTab === 'arrange') {
        playBtn.textContent = state.timelineLoopSingle
          ? `▶ Play ${loopTrackIcon} #${activeLoopSecIdx + 1} Loop`
          : `▶ Play Master Timeline (${totalMasterBars || 4} Bars)`;
      } else {
        const instBadge = state.playBothInCompose
          ? enabledIcons
          : `${activeMeta.icon} ${activeMeta.short}`;
        playBtn.textContent = `▶ Play ${instBadge} (${loopLabel})`;
      }
      playBtn.classList.toggle('active', state.phonePlayer.playing);
    }

    if (padsPlayBtn) {
      const instBadge = state.playBothInCompose ? `Band (${enabledIcons})` : `${activeMeta.icon} ${activeMeta.short} Solo`;
      padsPlayBtn.textContent = isPlayingCompose
        ? `⏹ Stop ${instBadge} (${loopLabel})`
        : `▶ Play ${instBadge} (${loopLabel})`;
      padsPlayBtn.classList.toggle('active', isPlayingCompose);
    }

    if (primaryStripPlayBtn) {
      primaryStripPlayBtn.textContent = isPlayingThisInstTl
        ? `⏹ Stop ${activeMeta.short} Timeline`
        : `▶ Play ${activeMeta.icon} ${activeMeta.short} Timeline${activeInstBars > 0 ? ` (${activeInstBars}B)` : ''}`;
      primaryStripPlayBtn.classList.toggle('active', isPlayingThisInstTl);
    }

    if (tlPlayBtn) {
      tlPlayBtn.textContent = isPlayingMasterTl
        ? '⏹ Stop Master Timeline'
        : state.timelineLoopSingle
        ? `▶ Play ${loopTrackIcon} Section #${activeLoopSecIdx + 1} Loop`
        : `▶ Play Master Timeline (${masterTracks.length} Track${masterTracks.length === 1 ? '' : 's'} · ${totalMasterBars}B)`;
      tlPlayBtn.classList.toggle('active', isPlayingMasterTl);
    }

    if (tlLoopBtn) {
      tlLoopBtn.classList.toggle('chip-on', state.timelineLoopSingle);
      tlLoopBtn.style.borderColor = state.timelineLoopSingle ? '#f59e0b' : '';
      tlLoopBtn.style.color = state.timelineLoopSingle ? '#fde68a' : '';
      tlLoopBtn.textContent = state.timelineLoopSingle
        ? `🔁 Looping ${loopTrackIcon} Section #${activeLoopSecIdx + 1} Only`
        : `🔁 Loop Full Master Timeline (${totalMasterBars}B)`;
    }

    if (disableSecLoopBtn) {
      disableSecLoopBtn.style.display = state.timelineLoopSingle ? 'inline-flex' : 'none';
      disableSecLoopBtn.textContent = `✕ Disable ${loopTrackIcon} Section #${activeLoopSecIdx + 1} Loop`;
    }

    const modalPlayBtn = document.getElementById('fold-modal-play-btn');
    if (modalPlayBtn) {
      const mMeta = getInstrumentMeta(state.modalTrack || 'drums');
      const activeIdxForModalTrack = getSelectedTimelineIdx(mMeta.id);
      const isModalPlaying =
        state.phonePlayer.playing &&
        state.playbackMode === 'timeline' &&
        activeIdxForModalTrack === state.modalSectionIdx &&
        state.timelineLoopTrack === mMeta.id;
      modalPlayBtn.textContent = isModalPlaying
        ? '⏹ Stop Playback'
        : `▶ Play ${mMeta.icon} ${mMeta.short} Section #${(state.modalSectionIdx ?? 0) + 1}`;
      modalPlayBtn.classList.toggle('active', isModalPlaying);
    }

    const modalLoopToggleBtn = document.getElementById('fold-modal-loop-toggle-btn');
    if (modalLoopToggleBtn) {
      const mMeta = getInstrumentMeta(state.modalTrack || 'drums');
      const activeIdxForModalTrack = getSelectedTimelineIdx(mMeta.id);
      const isThisSectionLooped =
        state.timelineLoopSingle &&
        state.timelineLoopTrack === mMeta.id &&
        activeIdxForModalTrack === state.modalSectionIdx;
      modalLoopToggleBtn.classList.toggle('chip-on', isThisSectionLooped);
      modalLoopToggleBtn.style.borderColor = isThisSectionLooped ? '#f59e0b' : 'rgba(255,255,255,0.22)';
      modalLoopToggleBtn.style.background = isThisSectionLooped
        ? 'rgba(245, 158, 11, 0.28)'
        : 'rgba(255,255,255,0.06)';
      modalLoopToggleBtn.style.color = isThisSectionLooped ? '#fef08a' : '#d1d5db';
      modalLoopToggleBtn.textContent = isThisSectionLooped
        ? `🔁 Section Loop: ON (Tap to Disable)`
        : `🔁 Loop This Section: OFF`;
    }
  }

  // ==========================================================================
  // 9. Send 16-Bar Song, Full Timeline, or Split Blocks to Ableton Live 12
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

  function sendVia204Endpoint(endpointPath, payload) {
    const base = (state.bridgeUrl || 'http://192.168.1.247:3333').replace(/\/+$/, '');
    const url = `${base}${endpointPath}?q=${encodeURIComponent(JSON.stringify(payload))}&_t=${Date.now()}`;
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function sendVia204Bridge(payload) {
    sendVia204Endpoint('/api/write-clip-204', payload);
  }

  // ==========================================================================
  // 9B. Offline Beat Crate, Studio Outbox & Same-Network LAN Jam Engine
  // ==========================================================================
  function buildCurrentIdeaSnapshot(options = {}) {
    const { artist, song } = findSongById(state.selectedSongId);
    const cleanArtist = artist ? artist.artistName.replace(/^[^\w]+/, '').trim() : 'Session';
    const arr = Array.isArray(state.arrangementSections) ? state.arrangementSections : [];
    const bassArr = Array.isArray(state.bassArrangementSections) ? state.bassArrangementSections : [];
    const totalBars = arr.reduce((acc, s) => acc + (Number(s.bars) || 4), 0) || 16;
    const defaultTitle = `${cleanArtist} - ${song ? song.title : 'Groove'} (${state.tempo} BPM · ${arr.length} Drum / ${bassArr.length} Bass Blocks)`;
    const inputEl = document.getElementById('fold-crate-title-input');
    const arrangeInputEl = document.getElementById('fold-arrange-title-input');
    const customTitle =
      options.customTitle ||
      (arrangeInputEl && arrangeInputEl.value.trim() ? arrangeInputEl.value.trim() : '') ||
      (inputEl && inputEl.value.trim() ? inputEl.value.trim() : '') ||
      defaultTitle;

    const tlData = buildTimelinePlaybackData(false, 'drums');
    const fullNotes = tlData.notes.map((n) => [
      n.pitch,
      Number(n.startTime.toFixed(3)),
      Number(n.duration.toFixed(3)),
      n.velocity
    ]);

    return {
      id: options.id || `idea_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      title: customTitle,
      artistId: state.selectedArtistId,
      songId: state.selectedSongId,
      sectionSources: [...(state.sectionSources || [state.selectedSongId, state.selectedSongId, state.selectedSongId, state.selectedSongId])],
      arrangementSections: JSON.parse(
        JSON.stringify(
          arr.length > 0
            ? arr
            : createDefaultArrangementSections(state.selectedSongId, state.playerName, state.playerColor, 'drums')
        )
      ),
      bassArrangementSections: JSON.parse(
        JSON.stringify(
          bassArr.length > 0
            ? bassArr
            : createDefaultArrangementSections(state.selectedSongId, state.playerName, state.playerColor, 'bass')
        )
      ),
      kitId: state.kitId,
      bassKitId: state.bassKitId,
      tempo: state.tempo,
      duration: tlData.durationBeats || 64.0,
      intensityPct: state.intensityPct,
      ghostPct: state.ghostPct,
      hatEnergyPct: state.hatEnergyPct,
      fillPct: state.fillPct,
      swingPct: state.swingPct,
      pocketPct: state.pocketPct,
      exportMode: options.exportMode || 'clip16',
      queuedForOutbox: Boolean(options.queuedForOutbox),
      syncedToStudio: Boolean(options.syncedToStudio),
      pushedToAbleton: Boolean(options.pushedToAbleton),
      authorName: state.playerName,
      authorColor: state.playerColor,
      createdAt: new Date().toISOString(),
      grid: cloneGrid256(state.grid),
      drumGrid: state.drumGrid ? cloneGrid256(state.drumGrid) : null,
      bassGrid: state.bassGrid ? cloneGrid256(state.bassGrid) : null,
      notes: fullNotes
    };
  }

  async function saveCurrentIdeaToCrate(options = {}) {
    const snapshot = buildCurrentIdeaSnapshot(options);
    state.localCrate.unshift(snapshot);
    if (state.localCrate.length > 60) state.localCrate.length = 60;
    saveLocalCrate();

    const inputEl = document.getElementById('fold-crate-title-input');
    if (inputEl) inputEl.value = '';
    const arrangeInputEl = document.getElementById('fold-arrange-title-input');
    if (arrangeInputEl) arrangeInputEl.value = '';

    // If Studio Bridge is reachable, also sync a copy into studio-crate.json right away
    if (state.bridgeReachable && !options.offlineOnly) {
      try {
        const res = await fetch(getApiUrl('/api/crate/sync'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [snapshot],
            pushToAbleton: false
          })
        });
        if (res.ok) {
          const data = await res.json();
          snapshot.syncedToStudio = true;
          saveLocalCrate();
          if (Array.isArray(data.items)) state.studioCrate = data.items;
        }
      } catch (_) {}
    }

    renderCrateAndJamUI();
    return snapshot;
  }

  function loadIdeaObjectIntoWorkstation(idea, broadcastIfShared = true) {
    if (!idea) return;
    pushUndoState();
    const { artist, song } = findSongById(idea.songId || 'zep_levee');
    const bProf = ARTIST_BASS_PROFILES[artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
    state.selectedArtistId = idea.artistId || artist.artistId;
    state.selectedSongId = idea.songId || song.id;
    state.editingTimelineIdx = null;
    state.sectionSources =
      Array.isArray(idea.sectionSources) && idea.sectionSources.length === 4
        ? [...idea.sectionSources]
        : [state.selectedSongId, state.selectedSongId, state.selectedSongId, state.selectedSongId];
    if (Array.isArray(idea.arrangementSections) && idea.arrangementSections.length > 0) {
      state.arrangementSections = JSON.parse(JSON.stringify(idea.arrangementSections));
    } else {
      const roles = ['verse', 'chorus', 'bridge', 'climax'];
      state.arrangementSections = state.sectionSources.map((sid, i) => ({
        id: `sec_drums_${Date.now().toString(36)}_${i}_${Math.random().toString(36).slice(2, 5)}`,
        trackType: 'drums',
        roleId: roles[i] || 'verse',
        songId: sid || state.selectedSongId,
        sourceSlice: i,
        sourceBar: i * 4,
        bars: 4,
        addedBy: idea.authorName || state.playerName,
        addedColor: idea.authorColor || state.playerColor
      }));
    }
    if (Array.isArray(idea.bassArrangementSections) && idea.bassArrangementSections.length > 0) {
      state.bassArrangementSections = JSON.parse(JSON.stringify(idea.bassArrangementSections));
    } else {
      state.bassArrangementSections = state.arrangementSections.map((dSec, i) => ({
        id: `sec_bass_${Date.now().toString(36)}_${i}_${Math.random().toString(36).slice(2, 5)}`,
        trackType: 'bass',
        roleId: dSec.roleId || 'verse',
        songId: dSec.songId || state.selectedSongId,
        sourceSlice: dSec.sourceSlice ?? (i % 4),
        sourceBar: dSec.sourceBar ?? ((i % 4) * 4),
        bars: Number(dSec.bars) || 4,
        customEdited: false,
        customGrid: null,
        addedBy: dSec.addedBy || state.playerName,
        addedColor: dSec.addedColor || state.playerColor
      }));
    }
    state.selectedTimelineIdx = 0;
    state.selectedBassTimelineIdx = 0;
    setMasterTrackEnabled('drums', (state.arrangementSections || []).length > 0, true);
    setMasterTrackEnabled('bass', (state.bassArrangementSections || []).length > 0, true);
    state.kitId = idea.kitId || song.kit || artist.defaultKit;
    state.bassKitId = idea.bassKitId || bProf.bassKit;
    state.tempo = Number(idea.tempo) || song.bpm;
    state.intensityPct = Number(idea.intensityPct ?? 70);
    state.ghostPct = Number(idea.ghostPct ?? 45);
    state.hatEnergyPct = Number(idea.hatEnergyPct ?? 60);
    state.fillPct = Number(idea.fillPct ?? 65);
    state.swingPct = Number(idea.swingPct ?? song.swing);
    state.pocketPct = Number(idea.pocketPct ?? 25);

    const isValidGrid = (g) =>
      Array.isArray(g) &&
      g.length === DRUM_VOICES.length &&
      Array.isArray(g[0]) &&
      g[0].length === TOTAL_STEPS;

    state.drumGrid = isValidGrid(idea.drumGrid)
      ? cloneGrid256(idea.drumGrid)
      : isValidGrid(idea.grid)
      ? cloneGrid256(idea.grid)
      : generateSongGrooveGrid(
          state.selectedSongId,
          state.intensityPct,
          state.ghostPct,
          state.hatEnergyPct,
          state.fillPct
        );
    state.bassGrid = isValidGrid(idea.bassGrid)
      ? cloneGrid256(idea.bassGrid)
      : generateSongBassGrid(
          state.selectedSongId,
          state.intensityPct,
          state.ghostPct,
          state.hatEnergyPct,
          state.fillPct
        );
    state.grid = cloneGrid256(state.composeInstrument === 'bass' ? state.bassGrid : state.drumGrid);
    syncSequencerNotes();

    recordSessionHistoryEntry(`Restored "${idea.title || song.title}"`);
    renderComposeInstrumentUI();
    renderArtistTabsAndSongs();
    renderSectionTabs();
    renderMini4BarMap();
    renderSequencerGrid();
    renderSongBuilderAndClipsUI();
    renderCrateAndJamUI();
    updateDialsUI();
    updatePlayerButtons();
    renderComposeTimelineBanner();
    if (broadcastIfShared && !state.suppressJamBroadcast && state.jamMode === 'shared') {
      broadcastFullJamState(`Loaded "${idea.title}"`);
    }
  }

  async function pushOutboxOrCrateToStudio({ onlyOutbox = true, pushToAbleton = true } = {}) {
    const candidates = (state.localCrate || []).filter((item) =>
      onlyOutbox ? item.queuedForOutbox : true
    );
    const itemsToPush = candidates.length > 0 ? candidates : [buildCurrentIdeaSnapshot({ queuedForOutbox: false })];
    const useSelectedTrack = state.targetTrack === 'selected';
    const trackIndex = useSelectedTrack ? -1 : Number(state.targetTrack) || 0;
    const startSceneIndex =
      state.targetSlot === 'selected' ? -1 : state.targetSlot === 'artist' ? 0 : Number(state.targetSlot) || 0;

    const pushBtn = document.getElementById('fold-push-outbox-btn');
    const topOutboxBtn = document.getElementById('fold-top-outbox-btn');
    if (pushBtn) pushBtn.textContent = `⏳ Pushing ${itemsToPush.length} Beat(s)...`;
    if (topOutboxBtn) topOutboxBtn.textContent = `⏳ Pushing (${itemsToPush.length})...`;

    try {
      const res = await fetch(getApiUrl('/api/crate/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToPush,
          pushToAbleton,
          useSelectedTrack,
          trackIndex,
          startSceneIndex,
          fireFirst: pushToAbleton
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.items)) state.studioCrate = data.items;
      for (const it of itemsToPush) {
        it.queuedForOutbox = false;
        it.syncedToStudio = true;
        if (pushToAbleton) it.pushedToAbleton = true;
      }
      saveLocalCrate();
      renderCrateAndJamUI();
      if (pushBtn) {
        pushBtn.textContent = pushToAbleton
          ? `✅ Pushed ${itemsToPush.length} Beat(s) → Ableton Scenes!`
          : `✅ Synced ${itemsToPush.length} Beat(s) → Studio PC!`;
        setTimeout(() => renderCrateAndJamUI(), 2200);
      }
      refreshAbletonStatus();
    } catch (e) {
      // Fallback for HTTPS Installed PWA -> HTTP Studio Bridge via 204 No Content
      for (let i = 0; i < itemsToPush.length; i++) {
        const it = itemsToPush[i];
        const compactItem = {
          ...it,
          grid: undefined
        };
        setTimeout(() => {
          sendVia204Endpoint('/api/crate/push-204', {
            item: compactItem,
            pushToAbleton,
            useSelectedTrack,
            trackIndex,
            startSceneIndex: startSceneIndex < 0 ? i : startSceneIndex + i,
            fireFirst: pushToAbleton && i === 0
          });
        }, i * 180);
        it.queuedForOutbox = false;
        it.syncedToStudio = true;
        if (pushToAbleton) it.pushedToAbleton = true;
      }
      saveLocalCrate();
      renderCrateAndJamUI();
      if (pushBtn) {
        pushBtn.textContent = pushToAbleton
          ? `✅ Sent ${itemsToPush.length} Beat(s) → Ableton!`
          : `✅ Sent ${itemsToPush.length} Beat(s) → Studio PC!`;
        setTimeout(() => renderCrateAndJamUI(), 2200);
      }
    }
  }

  function isVoiceOwnedByCurrentPlayer(vIdx) {
    if (state.jamMode !== 'split_roles') return true;
    const isFoundationVoice = vIdx === 0 || vIdx === 2 || vIdx === 4 || vIdx === 5; // Kick, Snare, CH, OH
    return state.jamRole === 'foundation' ? isFoundationVoice : !isFoundationVoice;
  }

  let jamEventSource = null;

  async function emitJamEvent(payload) {
    const full = {
      ...payload,
      clientId: state.clientId,
      authorName: state.playerName,
      authorColor: state.playerColor
    };
    try {
      const res = await fetch(getApiUrl('/api/jam/event'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full)
      });
      if (!res.ok) throw new Error('jam post error');
    } catch (_) {
      if (window.location.protocol === 'https:' && payload.type === 'beam_groove') {
        sendVia204Endpoint('/api/jam/event-204', {
          ...full,
          idea: full.idea ? { ...full.idea, notes: undefined } : undefined
        });
      }
    }
  }

  function broadcastFullJamState(activityLabel = 'Updated Groove') {
    if (state.suppressJamBroadcast || state.jamMode === 'independent') return;
    emitJamEvent({
      type: 'state_sync',
      activity: activityLabel,
      state: {
        selectedArtistId: state.selectedArtistId,
        selectedSongId: state.selectedSongId,
        sectionSources: state.sectionSources,
        arrangementSections: state.arrangementSections,
        bassArrangementSections: state.bassArrangementSections,
        kitId: state.kitId,
        bassKitId: state.bassKitId,
        tempo: state.tempo,
        intensityPct: state.intensityPct,
        ghostPct: state.ghostPct,
        hatEnergyPct: state.hatEnergyPct,
        fillPct: state.fillPct,
        swingPct: state.swingPct,
        pocketPct: state.pocketPct,
        grid: state.grid,
        drumGrid: state.drumGrid,
        bassGrid: state.bassGrid
      }
    });
  }

  function handleIncomingJamMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (Array.isArray(msg.peers)) {
      state.jamPeers = msg.peers;
    }
    if (Array.isArray(msg.crateItems)) {
      state.studioCrate = msg.crateItems;
    }
    if (msg.type === 'welcome' || msg.type === 'peers_updated' || msg.type === 'crate_updated') {
      renderCrateAndJamUI();
      return;
    }
    if (msg.clientId === state.clientId) return;

    if (msg.type === 'cell_edit' && state.jamMode !== 'independent') {
      const { vIdx, stepIdx, cell, authorColor, authorName } = msg;
      if (state.grid[vIdx] && stepIdx >= 0 && stepIdx < TOTAL_STEPS && cell) {
        state.suppressJamBroadcast = true;
        state.grid[vIdx][stepIdx] = { ...cell };
        state.remoteStepHighlights[`${vIdx}_${stepIdx}`] = {
          color: authorColor || '#e73ff6',
          name: authorName || 'Partner',
          expires: Date.now() + 2800
        };
        syncSequencerNotes();
        renderSequencerGrid();
        state.suppressJamBroadcast = false;
      }
      state.jamStatusMessage = `🎨 ${authorName || 'Partner'} edited ${getActiveVoices()[vIdx]?.short || 'Step'} (Bar ${Math.floor(stepIdx / 16) + 1})`;
      renderCrateAndJamUI();
    } else if (msg.type === 'state_sync' && state.jamMode !== 'independent' && msg.state) {
      state.suppressJamBroadcast = true;
      loadIdeaObjectIntoWorkstation(
        {
          ...msg.state,
          title: msg.activity || 'Shared Jam'
        },
        false
      );
      state.suppressJamBroadcast = false;
      state.jamStatusMessage = `🤝 ${msg.authorName || 'Partner'}: ${msg.activity || 'Synced Arrangement'}`;
      renderSongBuilderAndClipsUI();
      renderCrateAndJamUI();
    } else if (msg.type === 'pad_hit') {
      const padEl = document.querySelector(`.fold-drum-pad[data-pad-idx="${msg.vIdx}"]`);
      if (padEl) {
        padEl.style.boxShadow = `0 0 22px ${msg.authorColor || '#e73ff6'}`;
        padEl.style.borderColor = msg.authorColor || '#e73ff6';
        setTimeout(() => {
          padEl.style.boxShadow = '';
          padEl.style.borderColor = '';
        }, 220);
      }
      if (state.hearPartnerPads) {
        const ctx = getAudioCtx();
        if (msg.instrument === 'bass') {
          const bVoices = getBassVoicesForSong(state.selectedSongId);
          const bv = bVoices[msg.vIdx] || bVoices[0];
          triggerBassVoice(ctx, msg.pitch || bv.pitch, msg.velocity || 115, ctx.currentTime, 0.24, msg.bassKitId);
        } else {
          const voice = DRUM_VOICES[msg.vIdx] || DRUM_VOICES[0];
          triggerDrumVoice(ctx, msg.pitch || voice.pitch, msg.velocity || 115, ctx.currentTime);
        }
      }
      state.jamStatusMessage = `${msg.instrument === 'bass' ? '🎸' : '🥁'} ${msg.authorName || 'Partner'} hit ${
        getActiveVoices(msg.instrument)[msg.vIdx]?.name || 'Pad'
      }`;
      renderCrateAndJamUI();
    } else if (msg.type === 'beam_groove' && msg.idea) {
      const existing = state.localCrate.find((x) => x.id === msg.idea.id);
      if (!existing) {
        state.localCrate.unshift({
          ...msg.idea,
          queuedForOutbox: false,
          syncedToStudio: true
        });
        saveLocalCrate();
      }
      state.jamStatusMessage = `📡 ${msg.authorName || 'Partner'} shared arrangement "${msg.idea.title}"!`;
      if (state.jamMode === 'shared') {
        state.suppressJamBroadcast = true;
        loadIdeaObjectIntoWorkstation(msg.idea, false);
        state.suppressJamBroadcast = false;
      }
      renderSongBuilderAndClipsUI();
      renderCrateAndJamUI();
    }
  }

  function connectLanJamStream() {
    if (typeof EventSource === 'undefined') return;
    if (jamEventSource) {
      try {
        jamEventSource.close();
      } catch (_) {}
      jamEventSource = null;
    }
    if (window.location.protocol === 'https:' && (state.bridgeUrl || '').startsWith('http://192.')) {
      return;
    }
    try {
      const streamUrl = getApiUrl(
        `/api/jam/stream?clientId=${encodeURIComponent(state.clientId)}&name=${encodeURIComponent(
          state.playerName
        )}&color=${encodeURIComponent(state.playerColor)}&device=${encodeURIComponent(state.playerDevice)}`
      );
      const es = new EventSource(streamUrl);
      jamEventSource = es;
      es.onopen = () => {
        state.jamConnected = true;
        renderCrateAndJamUI();
      };
      es.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          handleIncomingJamMessage(parsed);
        } catch (_) {}
      };
      es.onerror = () => {
        state.jamConnected = false;
      };
    } catch (_) {}
  }

  async function sendJamHeartbeat() {
    try {
      const res = await fetch(getApiUrl('/api/jam/heartbeat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: state.clientId,
          name: state.playerName,
          color: state.playerColor,
          device: state.playerDevice,
          jamMode: state.jamMode,
          role: state.jamRole,
          activeSection: state.activeSection,
          selectedSongId: state.selectedSongId,
          kitId: state.kitId,
          tempo: state.tempo,
          targetTrack: state.targetTrack,
          lastActivity: `${state.composeInstrument === 'bass' ? '🎸 Bass' : '🥁 Drums'} · ${SONG_SECTIONS[state.activeSection]?.badge || 'SEC 1'} · ${state.tempo} BPM`
        })
      });
      if (res.ok) {
        const data = await res.json();
        state.bridgeReachable = true;
        state.jamConnected = true;
        if (Array.isArray(data.peers)) state.jamPeers = data.peers;
        renderCrateAndJamUI();
      }
    } catch (_) {}
  }

  async function sendCurrentBeatToAbleton(fire = true, forceTimeline = false) {
    const btn = document.getElementById('fold-builder-send-drums-btn') || document.getElementById('fold-send-ableton-btn');
    const isTimelineSend = forceTimeline || state.activeTab === 'arrange';
    const tlData = isTimelineSend ? buildTimelinePlaybackData(false, 'drums') : null;
    const composeBounds = isTimelineSend ? null : getActiveLoopStepBounds();
    const barsCount = isTimelineSend ? tlData.totalBars : composeBounds.barsCount;
    const durationBeats = isTimelineSend ? tlData.durationBeats : composeBounds.durationBeats;

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await saveCurrentIdeaToCrate({ queuedForOutbox: true, offlineOnly: true });
      if (btn) {
        btn.textContent = '📦 Queued in Outbox (Offline)';
        setTimeout(() => updatePlayerButtons(), 2200);
      }
      return;
    }

    if (!state.bridgeUrl) {
      await autoDiscoverStudioBridge();
      if (!state.bridgeUrl) {
        state.bridgeUrl = 'http://192.168.1.247:3333';
      }
    }
    if (btn) btn.textContent = `⏳ Sending ${barsCount}B Drums...`;

    const notes = isTimelineSend
      ? tlData.notes
      : buildNotesFromSequencer(composeBounds.startStep, composeBounds.endStep, 'drums');
    const { artist, song } = findSongById(state.selectedSongId);
    const artistSlotIdx = Math.max(0, ARTIST_CATALOG.findIndex((a) => a.artistId === artist.artistId));
    const useSelectedTrack = state.targetTrack === 'selected';
    const useSelectedScene = state.targetSlot === 'selected';
    const resolvedSlot =
      state.targetSlot === 'selected'
        ? -1
        : state.targetSlot === 'artist'
        ? artistSlotIdx
        : Number(state.targetSlot) || 0;

    const clipName = isTimelineSend
      ? `🥁 Drum Timeline (${(state.arrangementSections || []).length} Blocks · ${barsCount} Bars)`
      : `🥁 ${artist.artistName.replace(/^[^\w]+/, '')} - ${song.title} [${barsCount}B]`;
    const reqPayload = {
      useSelectedTrack,
      useSelectedScene,
      trackIndex: useSelectedTrack ? -1 : Number(state.targetTrack) || 0,
      slotIndex: resolvedSlot,
      tempo: state.tempo,
      name: clipName,
      duration: durationBeats,
      color: 0xe73ff6,
      fire,
      notes
    };

    try {
      const res = await fetch(getApiUrl('/api/write-clip'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqPayload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (btn) {
        const trackLabel = data.trackName || state.abletonSelectedTrackName || 'Drum Track';
        const sceneNum = (Number(data.slotIndex ?? 0) || 0) + 1;
        btn.textContent = data.ok
          ? `✅ Drums → "${trackLabel}" (Sc ${sceneNum})!`
          : `✅ Saved ${barsCount}B Drums!`;
        setTimeout(() => updatePlayerButtons(), 2000);
      }
      refreshAbletonStatus();
    } catch (e) {
      try {
        const compactNotes = notes.map((n) => [
          n.pitch,
          Number(n.startTime.toFixed(3)),
          Number(n.duration.toFixed(3)),
          n.velocity
        ]);
        sendVia204Bridge({
          ...reqPayload,
          notes: compactNotes
        });
        if (btn) {
          btn.textContent = `✅ Drums Sent to Ableton!`;
          setTimeout(() => updatePlayerButtons(), 2000);
        }
      } catch (_) {
        await saveCurrentIdeaToCrate({ queuedForOutbox: true, offlineOnly: true });
      }
    }
  }

  async function sendBassTimelineToAbleton(fire = true) {
    const btn = document.getElementById('fold-builder-send-bass-btn');
    const bassTlData = buildTimelinePlaybackData(false, 'bass');
    const barsCount = bassTlData.totalBars;
    const durationBeats = bassTlData.durationBeats;

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await saveCurrentIdeaToCrate({ queuedForOutbox: true, offlineOnly: true });
      if (btn) {
        btn.textContent = '📦 Queued in Outbox';
        setTimeout(() => updatePlayerButtons(), 2000);
      }
      return;
    }

    if (!state.bridgeUrl) {
      await autoDiscoverStudioBridge();
      if (!state.bridgeUrl) {
        state.bridgeUrl = 'http://192.168.1.247:3333';
      }
    }
    if (btn) btn.textContent = `⏳ Sending ${barsCount}B Bass...`;

    const drumTrackIdx =
      state.targetTrack === 'selected'
        ? Number(state.abletonSelectedTrackIndex || 0)
        : Number(state.targetTrack || 0);
    const isAutoBass = state.targetBassTrack === 'auto_bass';
    const isNewMidi = state.targetBassTrack === 'new_midi';

    const clipName = `🎸 Bass Timeline (${(state.bassArrangementSections || []).length} Blocks · ${barsCount} Bars)`;
    const reqPayload = {
      useSelectedTrack: false,
      useSelectedScene: state.targetSlot === 'selected',
      autoOtherTrack: isAutoBass,
      createNewTrack: isNewMidi,
      avoidTrackIndex: drumTrackIdx,
      trackIndex: isAutoBass ? 'auto_bass' : isNewMidi ? 'new_midi' : Number(state.targetBassTrack) || 0,
      slotIndex: state.targetSlot === 'selected' ? -1 : Number(state.targetSlot) || 0,
      tempo: state.tempo,
      name: clipName,
      duration: durationBeats,
      color: 0x38bdf8,
      fire,
      notes: bassTlData.notes
    };

    try {
      const res = await fetch(getApiUrl('/api/write-clip'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqPayload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (btn) {
        const trackLabel = data.trackName || `Track #${Number(data.trackIndex ?? 1) + 1}`;
        const sceneNum = (Number(data.slotIndex ?? 0) || 0) + 1;
        btn.textContent = data.ok
          ? `✅ Bass → "${trackLabel}" (Sc ${sceneNum})!`
          : `✅ Saved ${barsCount}B Bass!`;
        setTimeout(() => updatePlayerButtons(), 2200);
      }
      refreshAbletonStatus();
    } catch (e) {
      try {
        const compactNotes = bassTlData.notes.map((n) => [
          n.pitch,
          Number(n.startTime.toFixed(3)),
          Number(n.duration.toFixed(3)),
          n.velocity
        ]);
        sendVia204Bridge({
          ...reqPayload,
          notes: compactNotes
        });
        if (btn) {
          btn.textContent = `✅ Bass Sent to Separate Track!`;
          setTimeout(() => updatePlayerButtons(), 2000);
        }
      } catch (_) {}
    }
  }

  async function sendBothTracksToAbleton(fire = true) {
    const fullBtn = document.getElementById('fold-builder-send-full-btn');
    if (fullBtn) fullBtn.textContent = '⏳ Sending 🥁 Drums + 🎸 Bass to Ableton Tracks...';
    await sendCurrentBeatToAbleton(fire, true);
    await sendBassTimelineToAbleton(fire);
    if (fullBtn) {
      fullBtn.textContent = '✅ Sent 🥁 Drums + 🎸 Bass to Separate Ableton Tracks!';
      setTimeout(() => updatePlayerButtons(), 2200);
    }
  }

  function getNotesForArrangementSectionIndex(secIdx) {
    const arr =
      Array.isArray(state.arrangementSections) && state.arrangementSections.length > 0
        ? state.arrangementSections
        : createDefaultArrangementSections(state.selectedSongId, state.playerName, state.playerColor);
    const secItem = arr[secIdx] || arr[0];
    const bars = Math.max(1, Math.min(16, Number(secItem?.bars) || 4));
    const steps = bars * 16;
    const blockGrid = getTimelineBlockGrid(secItem);
    return buildNotesFromArbitraryGrid(blockGrid, 0, steps);
  }

  async function sendSplitSectionsToAbletonScenes() {
    const btn = document.getElementById('fold-split-scenes-btn');
    const builderBtn = document.getElementById('fold-builder-split-scenes-btn');
    const arr =
      Array.isArray(state.arrangementSections) && state.arrangementSections.length > 0
        ? state.arrangementSections
        : createDefaultArrangementSections(state.selectedSongId, state.playerName, state.playerColor);
    const count = arr.length;
    const origText = btn ? btn.textContent : `🎛️ Split → Scenes`;
    const origBuilderText = builderBtn ? builderBtn.textContent : `🎛️ Split ${count} Blocks → Ableton Scenes 1–${count}`;

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await saveCurrentIdeaToCrate({ queuedForOutbox: true, exportMode: 'split4', offlineOnly: true });
      if (btn) {
        btn.textContent = `📦 ${count}-Block Split Queued in Outbox!`;
        setTimeout(() => (btn.textContent = origText), 2200);
      }
      if (builderBtn) {
        builderBtn.textContent = `📦 ${count} Blocks Queued in Outbox!`;
        setTimeout(() => (builderBtn.textContent = origBuilderText), 2200);
      }
      return;
    }
    if (!state.bridgeUrl) {
      await autoDiscoverStudioBridge();
      if (!state.bridgeUrl) {
        state.bridgeUrl = 'http://192.168.1.247:3333';
      }
    }
    if (btn) btn.textContent = `⏳ Writing ${count} Blocks to Scenes 1–${count}...`;
    if (builderBtn) builderBtn.textContent = `⏳ Writing ${count} Blocks to Scenes 1–${count}...`;

    const useSelectedTrack = state.targetTrack === 'selected';
    const sectionColors = [0x10b981, 0xf59e0b, 0x38bdf8, 0xe73ff6, 0xa855f7, 0xf43f5e, 0x14b8a6, 0xeab308];

    try {
      let targetTrackName = state.abletonSelectedTrackName || 'Selected Track';
      for (let secIdx = 0; secIdx < count; secIdx++) {
        const secItem = arr[secIdx];
        const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
        const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === secItem.roleId) || ARRANGEMENT_ROLES[1];
        const { artist, song } = findSongById(secItem.songId || state.selectedSongId);
        const cleanArtist = artist.artistName.replace(/^[^\w]+/, '').trim();
        const roleLabel = roleObj.id.toUpperCase();
        const secNotes = getNotesForArrangementSectionIndex(secIdx);
        const res = await fetch(getApiUrl('/api/write-clip'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            useSelectedTrack,
            useSelectedScene: false,
            trackIndex: useSelectedTrack ? -1 : Number(state.targetTrack) || 0,
            slotIndex: secIdx,
            tempo: secIdx === 0 ? state.tempo : null,
            name: `${secIdx + 1}-${roleLabel} (${bars}B): ${cleanArtist} - ${song.title}`,
            duration: bars * 4.0,
            color: sectionColors[secIdx % sectionColors.length],
            fire: secIdx === 0,
            notes: secNotes
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.trackName) targetTrackName = data.trackName;
      }

      if (btn) {
        btn.textContent = `✅ ${count} Blocks → "${targetTrackName}" (Scenes 1–${count})!`;
        setTimeout(() => (btn.textContent = origText), 2400);
      }
      if (builderBtn) {
        builderBtn.textContent = `✅ ${count} Blocks → "${targetTrackName}" (Scenes 1–${count})!`;
        setTimeout(() => renderSongBuilderAndClipsUI(), 2400);
      }
      refreshAbletonStatus();
    } catch (e) {
      try {
        const clips = arr.map((secItem, secIdx) => {
          const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
          const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === secItem.roleId) || ARRANGEMENT_ROLES[1];
          const { artist, song } = findSongById(secItem.songId || state.selectedSongId);
          const cleanArtist = artist.artistName.replace(/^[^\w]+/, '').trim();
          const secNotes = getNotesForArrangementSectionIndex(secIdx).map((n) => [
            n.pitch,
            Number(n.startTime.toFixed(3)),
            Number(n.duration.toFixed(3)),
            n.velocity
          ]);
          return {
            useSelectedTrack,
            useSelectedScene: false,
            trackIndex: useSelectedTrack ? -1 : Number(state.targetTrack) || 0,
            slotIndex: secIdx,
            tempo: secIdx === 0 ? state.tempo : null,
            name: `${secIdx + 1}-${roleObj.id.toUpperCase()} (${bars}B): ${cleanArtist} - ${song.title}`,
            duration: bars * 4.0,
            color: sectionColors[secIdx % sectionColors.length],
            fire: secIdx === 0,
            notes: secNotes
          };
        });
        sendVia204Bridge({ clips });
        if (btn) {
          btn.textContent = `✅ ${count} Blocks → Selected Track (Scenes 1–${count})!`;
          setTimeout(() => (btn.textContent = origText), 2400);
        }
        if (builderBtn) {
          builderBtn.textContent = `✅ ${count} Blocks → Scenes 1–${count}!`;
          setTimeout(() => renderSongBuilderAndClipsUI(), 2400);
        }
      } catch (_) {
        if (btn) {
          btn.textContent = '⚠️ Check Settings → Ableton Bridge IP';
          setTimeout(() => (btn.textContent = origText), 2000);
        }
      }
    }
  }

  // ==========================================================================
  // 10. 5-Tab Navigation (Drums, Bass, Arrange, Arrangements, Settings), Song Picker Modal & Timeline
  // ==========================================================================
  function openSongSelectModal(targetInst = null) {
    state.songModalOpen = true;
    state.songModalInstrument = targetInst || state.composeInstrument || 'drums';
    state.songModalArtistBrowseId = null;
    const modalEl = document.getElementById('fold-song-modal');
    if (modalEl) {
      modalEl.style.display = 'flex';
    }
    const artistsCard = document.getElementById('card-artists');
    if (artistsCard) {
      artistsCard.classList.remove('collapsed');
      artistsCard.style.display = 'flex';
    }
    renderArtistTabsAndSongs();
  }

  function closeSongSelectModal() {
    state.songModalOpen = false;
    const modalEl = document.getElementById('fold-song-modal');
    if (modalEl) {
      modalEl.style.display = 'none';
    }
  }

  function switchWorkspaceTab(rawTabId) {
    const tabId = normalizeTabId(rawTabId);
    state.activeTab = tabId;
    if (isComposeInstrumentTab(tabId) && state.composeInstrument !== tabId) {
      setComposeInstrument(tabId);
    }
    if (state.phonePlayer.playing) {
      state.playbackMode = tabId === 'arrange' ? 'timeline' : 'compose';
      if (tabId === 'arrange') {
        state.timelinePlayScope = 'master';
      }
    }
    savePersistedState();
    applyWorkspaceTabVisibility();
    updatePlayerButtons();
    renderPrimaryTimelineStripUI();
    if (tabId === 'arrange') {
      renderSongBuilderAndClipsUI();
    } else if (tabId === 'arrangements') {
      renderCrateAndJamUI();
    } else if (isComposeInstrumentTab(tabId)) {
      renderComposeInstrumentUI();
      renderSectionTabs();
      renderMini4BarMap();
      renderSequencerGrid();
      renderComposeTimelineBanner();
      highlightPlayheadStep(
        state.activeStep,
        state.activeBar,
        state.activeBar >= 0 ? Math.floor(state.activeBar / 4) : -1
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applyWorkspaceTabVisibility() {
    const dock = document.getElementById('fold-studio-dock');
    if (!dock) return;

    const tab = normalizeTabId(state.activeTab);
    state.activeTab = tab;

    // Highlight active tab button in #fold-nav-rail
    dock.querySelectorAll('[data-ws-tab]').forEach((btn) => {
      const tid = btn.getAttribute('data-ws-tab');
      btn.classList.toggle('active', state.workspaceLayoutMode === 'tabs' && tid === tab);
    });

    const layoutBtn = document.getElementById('fold-layout-mode-btn');
    if (layoutBtn) {
      layoutBtn.classList.toggle('chip-on', state.workspaceLayoutMode === 'all');
      layoutBtn.textContent =
        state.workspaceLayoutMode === 'all' ? '🗂️ Use Tab View' : '⊞ Show All Zones';
    }

    const primaryTimelineStrip = document.getElementById('fold-primary-timeline-strip');
    const cardComposeInst = document.getElementById('card-compose-inst');
    const cardDials = document.getElementById('card-dials');
    const cardSeq = document.getElementById('card-sequencer');
    const cardPads = document.getElementById('card-pads');
    const cardBuilder = document.getElementById('card-builder');
    const cardCrate = document.getElementById('card-crate');
    const cardCollab = document.getElementById('card-collab');

    if (state.workspaceLayoutMode === 'all') {
      if (primaryTimelineStrip) primaryTimelineStrip.style.display = 'flex';
      [cardComposeInst, cardDials, cardSeq, cardPads, cardBuilder, cardCrate].forEach((el) => {
        if (el) el.style.display = 'flex';
      });
      if (cardCollab) cardCollab.style.display = 'none';
      return;
    }

    const isCompose = isComposeInstrumentTab(tab);

    // Instrument Top Header + Instrument Timeline Strip + Section Selector & Step Grid
    if (cardComposeInst) cardComposeInst.style.display = isCompose ? 'flex' : 'none';
    if (primaryTimelineStrip) {
      primaryTimelineStrip.style.display =
        isCompose && state.showPrimaryTimelineStrip !== false ? 'flex' : 'none';
    }
    if (cardSeq) cardSeq.style.display = isCompose ? 'flex' : 'none';

    // DECLUTTER: Move Tone Shaping / Feel Dials & Finger Pads into toggleable popovers/drawers
    if (cardDials) {
      cardDials.style.display = isCompose && state.showDialsDrawer ? 'flex' : 'none';
    }
    if (cardPads) {
      cardPads.style.display = isCompose && state.showInlinePadsInEdit ? 'flex' : 'none';
      cardPads.classList.toggle('perform-focus-mode', Boolean(state.tallPadsInCompose));
    }

    // MASTER TIMELINE: Multi-Track Visual Song Timeline + Section Modal + Export .WAV
    if (cardBuilder) cardBuilder.style.display = tab === 'arrange' ? 'flex' : 'none';

    // SAVED SONGS: Saved Arrangements + Session History
    if (cardCrate) cardCrate.style.display = tab === 'arrangements' ? 'flex' : 'none';

    if (cardCollab) cardCollab.style.display = 'none';

    const toggleDialsDrawerBtn = document.getElementById('fold-toggle-dials-drawer-btn');
    if (toggleDialsDrawerBtn) {
      toggleDialsDrawerBtn.classList.toggle('chip-on', Boolean(state.showDialsDrawer));
      toggleDialsDrawerBtn.textContent = `🎛️ Tone & Feel ${state.showDialsDrawer ? '▴' : '▾'}`;
    }
    const toggleEditPadsBtn = document.getElementById('fold-toggle-edit-pads-btn');
    if (toggleEditPadsBtn) {
      toggleEditPadsBtn.classList.toggle('chip-on', Boolean(state.showInlinePadsInEdit));
      toggleEditPadsBtn.textContent = `🎹 Finger Pads ${state.showInlinePadsInEdit ? '▴' : '▾'}`;
    }
    const fineTuneWrap = document.getElementById('fold-fine-tune-dials-wrap');
    const fineTuneBtn = document.getElementById('fold-toggle-fine-dials-btn');
    if (fineTuneWrap) {
      fineTuneWrap.style.display = state.showFineTuneDials ? 'grid' : 'none';
    }
    if (fineTuneBtn) {
      fineTuneBtn.classList.toggle('chip-on', Boolean(state.showFineTuneDials));
      fineTuneBtn.textContent = state.showFineTuneDials
        ? '⚙️ Hide Fine-Tune Dials'
        : '⚙️ Fine-Tune (Ghost, Hats, Pocket)';
    }
    const tallPadsBtn = document.getElementById('fold-tall-pads-btn');
    if (tallPadsBtn) {
      tallPadsBtn.classList.toggle('chip-on', Boolean(state.tallPadsInCompose));
      tallPadsBtn.textContent = state.tallPadsInCompose ? '↕ Tall Pads: ON' : '↕ Tall Pads: OFF';
    }
  }

  function showTimelineToast(msg) {
    state.timelineToastMessage = msg;
    const toastEls = document.querySelectorAll('.fold-timeline-toast');
    toastEls.forEach((el) => {
      el.style.display = 'inline-flex';
      el.textContent = msg;
    });
    clearTimeout(showTimelineToast._timer);
    showTimelineToast._timer = setTimeout(() => {
      state.timelineToastMessage = '';
      document.querySelectorAll('.fold-timeline-toast').forEach((el) => {
        el.style.display = 'none';
      });
    }, 3800);
  }

  function renderComposeInstrumentUI() {
    const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
    const meta = getInstrumentMeta(inst);
    const activeSongId = getInstrumentSongId(inst);
    const { artist, song } = findSongById(activeSongId);
    const drumLookup = findSongById(getInstrumentSongId('drums'));
    const bProf = ARTIST_BASS_PROFILES[artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
    const keyOverride = SONG_KEY_OVERRIDES[song.id];
    const scaleBadge = keyOverride ? keyOverride.label : bProf.scaleLabel;
    const voices = getActiveVoices(inst, activeSongId);

    const cardComposeInst = document.getElementById('card-compose-inst');
    if (cardComposeInst) {
      cardComposeInst.style.background = `linear-gradient(135deg, ${meta.bgTint}, rgba(20,22,33,0.92))`;
      cardComposeInst.style.borderColor = meta.borderTint;
    }

    const composeInstTitleEl = document.getElementById('fold-compose-inst-title');
    if (composeInstTitleEl) {
      const playerSub =
        inst === 'drums'
          ? artist.drummer
          : inst === 'bass'
          ? `${bProf.bassist} (${scaleBadge})`
          : `${scaleBadge} · ${meta.roleLabel}`;
      composeInstTitleEl.textContent = `STEP 1 · ${meta.icon} ${meta.label.toUpperCase()} — ${playerSub}`;
    }

    const openSongModalBtn = document.getElementById('fold-open-song-modal-btn');
    if (openSongModalBtn) {
      openSongModalBtn.textContent = `🔍 Search & Select Artist / Song (${artist.artistName} — ${song.title})`;
      openSongModalBtn.style.borderColor = meta.color;
      openSongModalBtn.style.background = meta.bgTint;
      openSongModalBtn.style.color = '#fff';
    }

    const composeInstSummaryEl = document.getElementById('fold-compose-inst-summary');
    if (composeInstSummaryEl) {
      composeInstSummaryEl.textContent = `${meta.icon} ${artist.artistName} — ${song.title} (${song.bpm} BPM${inst === 'drums' ? '' : ` · ${scaleBadge}`})`;
      composeInstSummaryEl.style.color = meta.color;
      composeInstSummaryEl.style.borderColor = meta.borderTint;
    }

    const companionSummaryEl = document.getElementById('fold-compose-companion-summary');
    if (companionSummaryEl) {
      companionSummaryEl.textContent = `🎵 Set Song for All Instruments`;
    }

    const bpmStatusPillEl = document.getElementById('fold-compose-bpm-status-pill');
    if (bpmStatusPillEl) {
      if (state.timelineHasUserSection && state.timelineBpm) {
        bpmStatusPillEl.textContent = `🔒 Master ${state.tempo} BPM (${state.timelineBpmSourceTitle || 'Timeline'})`;
        bpmStatusPillEl.style.borderColor = '#f59e0b';
        bpmStatusPillEl.style.color = '#fde68a';
        bpmStatusPillEl.style.background = 'rgba(245,158,11,0.18)';
      } else {
        bpmStatusPillEl.textContent = `⏱️ ${state.tempo} BPM (${state.lastSelectedSongTitle || song.title})`;
        bpmStatusPillEl.style.borderColor = 'rgba(132,220,198,0.4)';
        bpmStatusPillEl.style.color = '#d1fae5';
        bpmStatusPillEl.style.background = 'rgba(16,185,129,0.15)';
      }
    }

    // Update Band Ensemble Toggle Pills
    document.querySelectorAll('[data-ensemble-toggle]').forEach((btn) => {
      const tInst = btn.getAttribute('data-ensemble-toggle');
      const isOn = Boolean(state.composeEnsemble && state.composeEnsemble[tInst]);
      btn.classList.toggle('chip-on', isOn);
      btn.style.opacity = isOn ? '1' : '0.55';
    });

    const artistSongsStripEl = document.getElementById('fold-compose-artist-songs-strip');
    if (artistSongsStripEl && artist && Array.isArray(artist.songs)) {
      artistSongsStripEl.innerHTML = '';
      const stripLabel = document.createElement('span');
      stripLabel.style.cssText = 'font-size:11px;font-weight:800;color:#9ca3af;margin-right:4px;';
      stripLabel.textContent = `Same Artist (${artist.artistName}):`;
      artistSongsStripEl.appendChild(stripLabel);

      artist.songs.forEach((s) => {
        const isCurrent = s.id === activeSongId;
        const sKey = SONG_KEY_OVERRIDES[s.id]?.label || bProf.scaleLabel;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `fold-btn ${isCurrent ? 'chip-on' : ''}`;
        btn.style.cssText = isCurrent
          ? `font-size:11px;padding:3px 9px;font-weight:900;border-color:${meta.color};background:${meta.bgTint};color:#fff;`
          : 'font-size:11px;padding:3px 9px;opacity:0.88;';
        btn.textContent =
          inst === 'drums'
            ? `${isCurrent ? `${meta.icon} ` : ''}${s.title} (${s.bpm} BPM)`
            : `${isCurrent ? `${meta.icon} ` : ''}${s.title} (${s.bpm} · ${sKey})`;
        btn.addEventListener('click', () => {
          loadSongGroove(s.id, true, inst);
        });
        artistSongsStripEl.appendChild(btn);
      });
    }

    // Update all 6 instrument tab badges in the nav rail
    for (const navInst of INSTRUMENT_LIST) {
      const badgeEl = document.getElementById(`fold-tab-badge-${navInst}`);
      if (badgeEl) {
        const navArr = getTrackSections(navInst) || [];
        const sent = isMasterTrackEnabled(navInst);
        if (sent) {
          badgeEl.textContent = `✓ ${navArr.length} Sec`;
          badgeEl.style.background = 'rgba(16,185,129,0.28)';
          badgeEl.style.color = '#6ee7b7';
        } else if (navArr.length > 0) {
          badgeEl.textContent = `${navArr.length} Sec`;
          badgeEl.style.background = 'rgba(245,158,11,0.25)';
          badgeEl.style.color = '#fde68a';
        } else {
          const lookup = findSongById(getInstrumentSongId(navInst));
          badgeEl.textContent =
            lookup.song.title.split(' ').slice(0, 2).join(' ') || getInstrumentMeta(navInst).shortLabel;
          badgeEl.style.background = '';
          badgeEl.style.color = '';
        }
      }
    }

    const dialsHeaderTitle = document.querySelector('#card-dials .fold-card-title-wrap h3');
    if (dialsHeaderTitle) {
      dialsHeaderTitle.textContent = `🎛️ Tone & Feel Drawer — ${meta.icon} ${meta.label} (${inst === 'drums' ? drumLookup.artist.drummer : scaleBadge})`;
    }

    const kitLabelEl = document.querySelector('label[for="fold-kit-select"]');
    if (kitLabelEl) {
      kitLabelEl.textContent = `${meta.shortLabel.toUpperCase()} PATCH:`;
    }
    const kitSelect = document.getElementById('fold-kit-select');
    if (kitSelect) {
      const kits = getKitsForInstrument(inst);
      kitSelect.innerHTML = kits.map((k) => `<option value="${k.id}">${k.name}</option>`).join('');
      kitSelect.value = getKitIdForInstrument(inst);
    }

    const seqHeaderTitle = document.querySelector('#card-sequencer .fold-card-title-wrap h3');
    if (seqHeaderTitle) {
      seqHeaderTitle.textContent = `STEP 2 · PICK SONG SECTION & EDIT ${meta.label.toUpperCase()} GRID (${song.title})`;
    }

    const padsHeaderTitle = document.querySelector('#card-pads .fold-card-title-wrap h3');
    if (padsHeaderTitle) {
      padsHeaderTitle.textContent = `${meta.icon} Finger ${meta.shortLabel} Pads & Live Overdub (${inst === 'drums' ? 'Keys 1–8' : `${scaleBadge} · Keys 1–8`})`;
    }

    const mpcPadsEl = document.getElementById('fold-mpc-pads');
    if (mpcPadsEl) {
      mpcPadsEl.querySelectorAll('.fold-drum-pad').forEach((padEl, idx) => {
        const v = voices[idx];
        if (!v) return;
        padEl.style.borderBottomColor = v.color;
        const spans = padEl.querySelectorAll('span');
        if (spans[0]) spans[0].textContent = v.name;
        if (spans[1]) {
          spans[1].textContent =
            inst === 'drums'
              ? `Key [${idx + 1}] · Tap / Hold Roll`
              : `Key [${idx + 1}] · ${v.noteName || meta.shortLabel} · Tap / Hold`;
        }
      });
    }
    renderComposeTimelineBanner();
    applyWorkspaceTabVisibility();
    updatePlayerButtons();
  }

  function renderComposeTimelineBanner() {
    const bannerEl = document.getElementById('fold-compose-editing-banner');
    const addMainBtn = document.getElementById('fold-compose-add-4bar-btn');
    const addSeqMainBtn = document.getElementById('fold-seq-add-active-sec-btn');
    const add1Btn = document.getElementById('fold-compose-add-1bar-btn');
    const add16Btn = document.getElementById('fold-compose-add-16bar-btn');
    const padsAdd4Btn = document.getElementById('fold-pads-add-4bar-btn');

    const sec = SONG_SECTIONS[state.activeSection] || SONG_SECTIONS[0];
    const meta = getInstrumentMeta(state.composeInstrument);
    const { song } = findSongById(getInstrumentSongId(state.composeInstrument));

    const mainAddLabel = `➕ Add Selected Section (${sec.badge} · 4 Bars) to ${meta.icon} ${meta.shortLabel} Timeline`;
    if (addMainBtn) {
      addMainBtn.textContent = `➕ Add ${sec.badge} (4B) to ${meta.icon} ${meta.shortLabel} Timeline`;
    }
    if (addSeqMainBtn) {
      addSeqMainBtn.textContent = mainAddLabel;
      addSeqMainBtn.style.borderColor = meta.color;
    }
    if (add1Btn) {
      add1Btn.textContent = `+ 1-Bar Fill (Bar ${state.zoomedBar + 1})`;
    }
    if (add16Btn) {
      add16Btn.textContent = `+ Full Song (16B)`;
    }
    if (padsAdd4Btn) {
      padsAdd4Btn.textContent = `➕ Add ${sec.badge} (4B) to ${meta.icon} ${meta.shortLabel} Timeline`;
    }

    const activeSecInfoEl = document.getElementById('fold-seq-active-sec-info');
    if (activeSecInfoEl) {
      activeSecInfoEl.innerHTML = `Selected: <strong style="color:#fff;">${sec.name}</strong> of <strong style="color:${meta.color};">${song.title}</strong>`;
    }

    if (!bannerEl) return;
    const editTrack = isComposeInstrumentTab(state.editingTimelineTrack) ? state.editingTimelineTrack : 'drums';
    const editArr = getTrackSections(editTrack);
    if (state.editingTimelineIdx !== null && editArr && editArr[state.editingTimelineIdx]) {
      const idx = state.editingTimelineIdx;
      const secItem = editArr[idx];
      const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === secItem.roleId) || ARRANGEMENT_ROLES[1];
      const sInfo = findSongById(secItem.songId || getInstrumentSongId(editTrack));
      const tMeta = getInstrumentMeta(editTrack);
      bannerEl.style.display = 'flex';
      bannerEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="background:#e73ff6;color:#fff;font-size:11px;font-weight:900;padding:3px 8px;border-radius:6px;">🎬 EDITING ${tMeta.trackBadge} SECTION #${idx + 1}</span>
          <strong style="font-size:13px;color:#fff;">${roleObj.label} · ${sInfo.song.title} (${secItem.bars || 4} Bar${Number(secItem.bars) === 1 ? '' : 's'})</strong>
          <span style="font-size:12px;color:#d1d5db;">Every step, dial, or pad edit you make here updates Section #${idx + 1} on your timeline automatically!</span>
        </div>
        <div class="fold-btn-row">
          <button type="button" id="fold-return-timeline-btn" class="fold-btn teal">🎬 Done — Open Master Timeline →</button>
          <button type="button" id="fold-detach-timeline-edit-btn" class="fold-btn">✕ Stop Editing Section</button>
        </div>`;
      const retBtn = document.getElementById('fold-return-timeline-btn');
      if (retBtn) {
        retBtn.addEventListener('click', () => {
          syncEditingTimelineBlockFromCompose();
          switchWorkspaceTab('arrange');
        });
      }
      const detBtn = document.getElementById('fold-detach-timeline-edit-btn');
      if (detBtn) {
        detBtn.addEventListener('click', () => {
          state.editingTimelineIdx = null;
          renderComposeTimelineBanner();
        });
      }
    } else {
      bannerEl.style.display = 'none';
      bannerEl.innerHTML = '';
    }
  }

  function addComposeToTimeline(
    barsToAdd = 4,
    songIdOverride = null,
    roleIdOverride = null,
    trackTypeOverride = null,
    sectionSliceOverride = null
  ) {
    pushUndoState();
    // Ensure latest active grid edits are synced into the active instrument grid
    setInstrumentGrid(state.composeInstrument, cloneGrid256(state.grid));

    const rawType = trackTypeOverride || state.composeInstrument || 'drums';
    const isBandTogether = rawType === 'both' || rawType === 'all';
    const targetTracks = isBandTogether
      ? INSTRUMENT_LIST.filter((inst) => inst === state.composeInstrument || Boolean(state.composeEnsemble?.[inst]))
      : [isComposeInstrumentTab(rawType) ? rawType : state.composeInstrument || 'drums'];
    if (targetTracks.length === 0) targetTracks.push('drums');

    const bars = barsToAdd === 1 ? 1 : barsToAdd === 16 ? 16 : 4;
    const primaryInst = targetTracks[0];
    const primarySongId = songIdOverride || getInstrumentSongId(primaryInst);
    const { song } = findSongById(primarySongId);

    const effectiveSlice =
      sectionSliceOverride !== null && sectionSliceOverride !== undefined
        ? Number(sectionSliceOverride)
        : state.activeSection || 0;

    const defaultRoleForBars =
      roleIdOverride ||
      (bars === 1
        ? 'fill'
        : bars === 16
        ? 'verse'
        : ['verse', 'chorus', 'bridge', 'climax'][effectiveSlice] || 'chorus');
    const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === defaultRoleForBars) || ARRANGEMENT_ROLES[1];

    const buildBlockForTrack = (tType) => {
      const trackSelectedSongId = getInstrumentSongId(tType);
      const trackSongId = songIdOverride || trackSelectedSongId;
      const isTrackCurrentSong = trackSongId === trackSelectedSongId;

      let startStep = 0;
      let sourceBar = state.zoomedBar || 0;
      let sourceSlice = effectiveSlice;
      if (bars === 1) {
        sourceBar = isTrackCurrentSong ? state.zoomedBar : 0;
        startStep = sourceBar * 16;
      } else if (bars === 4) {
        sourceSlice =
          sectionSliceOverride !== null && sectionSliceOverride !== undefined
            ? Number(sectionSliceOverride)
            : isTrackCurrentSong
            ? state.activeSection
            : roleObj.defaultSlice ?? 0;
        startStep = sourceSlice * 64;
      } else {
        sourceSlice = 0;
        sourceBar = 0;
        startStep = 0;
      }

      const srcGrid = isTrackCurrentSong
        ? getInstrumentGrid(tType) ||
          generateSongInstrumentGrid(
            tType,
            trackSongId,
            state.intensityPct,
            state.ghostPct,
            state.hatEnergyPct,
            state.fillPct
          )
        : generateSongInstrumentGrid(
            tType,
            trackSongId,
            state.intensityPct,
            state.ghostPct,
            state.hatEnergyPct,
            state.fillPct
          );
      return {
        id: `sec_${tType}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        trackType: tType,
        roleId: roleObj.id,
        songId: trackSongId,
        sourceSlice,
        sourceBar,
        bars,
        customEdited: isTrackCurrentSong,
        customGrid: extractGridSlice(srcGrid, startStep, bars * 16),
        addedBy: state.playerName,
        addedColor: state.playerColor
      };
    };

    const isFirstSectionEver = !state.timelineHasUserSection;
    if (isFirstSectionEver) {
      const firstSectionBpm = songIdOverride ? song.bpm : state.tempo;
      state.timelineHasUserSection = true;
      setGlobalTimelineBpm(firstSectionBpm, state.lastSelectedSongTitle || song.title);
    } else if (state.timelineBpm) {
      state.tempo = state.timelineBpm;
    }

    for (const tType of targetTracks) {
      let arr = getTrackSections(tType);
      if (!Array.isArray(arr)) {
        arr = [];
        setTrackSections(tType, arr);
      }
      arr.push(buildBlockForTrack(tType));
      setSelectedTimelineIdx(tType, arr.length - 1);
      if (state.masterTrackEnabled && state.masterTrackEnabled[tType]) {
        state.masterTrackSynced[tType] = false;
      }
    }

    const barDesc =
      bars === 1
        ? `1-Bar Fill (Bar ${(state.zoomedBar || 0) + 1})`
        : bars === 16
        ? 'All 16 Bars'
        : `${roleObj.label} (4 Bars)`;
    const trackNamesSummary = targetTracks
      .map((t) => `${getInstrumentMeta(t).icon} ${getInstrumentMeta(t).shortLabel} Timeline`)
      .join(' + ');
    const updatedArr = getTrackSections(primaryInst) || [];
    const totalBars = updatedArr.reduce((acc, s) => acc + (Number(s.bars) || 4), 0);
    const msg = `✅ Added ${barDesc} of "${song.title}" to ${trackNamesSummary} (${updatedArr.length} Section${updatedArr.length === 1 ? '' : 's'} · ${totalBars} Bars) — Tap "🚀 Send to Master Timeline" when ready!`;
    showTimelineToast(msg);

    recordSessionHistoryEntry(`Added ${barDesc} ("${song.title}") to ${trackNamesSummary}`);
    savePersistedState();
    renderPrimaryTimelineStripUI();
    renderSongBuilderAndClipsUI();
    renderCrateAndJamUI();
    renderComposeInstrumentUI();
    updatePlayerButtons();
    if (!state.suppressJamBroadcast && state.jamMode !== 'independent') {
      broadcastFullJamState(`Added ${barDesc} ("${song.title}") to ${trackNamesSummary}`);
    }
  }

  function sendInstrumentTimelineToMaster(inst = null, openMasterTab = false) {
    const targetInst = isComposeInstrumentTab(inst) ? inst : state.composeInstrument || 'drums';
    const meta = getInstrumentMeta(targetInst);
    let arr = getTrackSections(targetInst);
    if (!Array.isArray(arr) || arr.length === 0) {
      addComposeToTimeline(4, null, null, targetInst);
      arr = getTrackSections(targetInst) || [];
    }
    setMasterTrackEnabled(targetInst, true, true);
    setTrackMuted(targetInst, false);

    if (!state.timelineHasUserSection && arr[0]) {
      const firstSong = findSongById(arr[0].songId || getInstrumentSongId(targetInst)).song;
      state.timelineHasUserSection = true;
      setGlobalTimelineBpm(firstSong ? firstSong.bpm : state.tempo, firstSong ? firstSong.title : '1st Section');
    }

    const totalBars = arr.reduce((sum, s) => sum + (Number(s.bars) || 4), 0);
    const masterCount = getActiveMasterTracks().length;
    showTimelineToast(
      `🚀 Sent ${meta.icon} ${meta.label} Timeline (${arr.length} Section${arr.length === 1 ? '' : 's'} · ${totalBars} Bars) → Master Timeline! (${masterCount} Track${masterCount === 1 ? '' : 's'} on Master)`
    );

    recordSessionHistoryEntry(`Sent ${meta.label} Timeline (${totalBars}B) to Master Timeline`);
    savePersistedState();
    renderPrimaryTimelineStripUI();
    renderSongBuilderAndClipsUI();
    renderCrateAndJamUI();
    renderComposeInstrumentUI();
    updatePlayerButtons();
    if (openMasterTab) {
      switchWorkspaceTab('arrange');
    }
  }

  function clearInstrumentTimeline(inst = null) {
    const targetInst = isComposeInstrumentTab(inst) ? inst : state.composeInstrument || 'drums';
    const meta = getInstrumentMeta(targetInst);
    pushUndoState();
    setTrackSections(targetInst, []);
    setSelectedTimelineIdx(targetInst, 0);
    setMasterTrackEnabled(targetInst, false, false);
    if (state.editingTimelineTrack === targetInst) {
      state.editingTimelineIdx = null;
    }
    const anyRemaining = INSTRUMENT_LIST.some((i) => (getTrackSections(i) || []).length > 0);
    if (!anyRemaining) {
      state.timelineHasUserSection = false;
      state.timelineBpm = null;
      state.timelineBpmSourceTitle = '';
    }
    showTimelineToast(`🧹 Cleared ${meta.icon} ${meta.label} Timeline`);
    commitArrangementChange(`Cleared ${meta.shortLabel} Timeline`);
    renderComposeInstrumentUI();
  }

  function matchTrackTimelineToDrums(targetTrack = 'bass') {
    const tType = isComposeInstrumentTab(targetTrack) ? targetTrack : 'bass';
    if (tType === 'drums') return;
    const drumArr = Array.isArray(state.arrangementSections) ? state.arrangementSections : [];
    if (drumArr.length === 0) {
      showTimelineToast('🥁 Add at least 1 section to your Drums Timeline first so you can copy its structure!');
      return;
    }
    pushUndoState();
    const matched = drumArr.map((dSec, i) => ({
      id: `sec_${tType}_${Date.now().toString(36)}_${i}_${Math.random().toString(36).slice(2, 5)}`,
      trackType: tType,
      roleId: dSec.roleId || 'verse',
      songId: dSec.songId || getInstrumentSongId('drums'),
      sourceSlice: dSec.sourceSlice ?? 0,
      sourceBar: dSec.sourceBar ?? 0,
      bars: Number(dSec.bars) || 4,
      customEdited: false,
      customGrid: null,
      addedBy: state.playerName,
      addedColor: state.playerColor
    }));
    setTrackSections(tType, matched);
    setSelectedTimelineIdx(tType, 0);
    setMasterTrackEnabled(tType, true, true);
    const meta = getInstrumentMeta(tType);
    showTimelineToast(`🪄 Matched ${meta.icon} ${meta.label} (${matched.length} Sections) to 🥁 Drums & Sent to Master Timeline!`);
    commitArrangementChange(`Matched ${meta.shortLabel} Timeline to Drum Timeline`);
    renderComposeInstrumentUI();
  }

  function matchBassTimelineToDrums() {
    matchTrackTimelineToDrums('bass');
  }

  function openTimelineBlockInCompose(secIdx, trackType = 'drums') {
    const tType = isComposeInstrumentTab(trackType) ? trackType : 'drums';
    const arr = getTrackSections(tType);
    if (!Array.isArray(arr) || !arr[secIdx]) return;
    const secItem = arr[secIdx];
    const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
    const { artist, song } = findSongById(secItem.songId || getInstrumentSongId(tType));

    state.composeInstrument = tType;
    setSelectedTimelineIdx(tType, secIdx);
    setInstrumentSongSelection(tType, artist, song);
    state.editingTimelineIdx = secIdx;
    state.editingTimelineTrack = tType;
    state.selectedArtistId = artist.artistId;
    state.selectedSongId = song.id;

    const baseGrid = generateSongInstrumentGrid(
      tType,
      song.id,
      state.intensityPct,
      state.ghostPct,
      state.hatEnergyPct,
      state.fillPct
    );
    const blockGrid = getTimelineBlockGrid(secItem, tType);

    if (bars === 1) {
      const targetBar = Math.max(0, Math.min(15, Number(secItem.sourceBar ?? 0)));
      state.zoomedBar = targetBar;
      state.activeSection = Math.floor(targetBar / 4);
      state.viewMode = 'zoom1';
      state.loopMode = 'section4';
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        for (let i = 0; i < 16; i++) {
          baseGrid[v][targetBar * 16 + i] = { ...blockGrid[v][i] };
        }
      }
    } else if (bars === 16) {
      state.activeSection = 0;
      state.viewMode = 'all16';
      state.loopMode = 'all16';
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        for (let i = 0; i < TOTAL_STEPS; i++) {
          baseGrid[v][i] = { ...(blockGrid[v][i] || baseGrid[v][i]) };
        }
      }
    } else {
      const targetSlice = Math.max(0, Math.min(3, Number(secItem.sourceSlice ?? 0)));
      state.activeSection = targetSlice;
      state.zoomedBar = targetSlice * 4;
      state.viewMode = 'section4';
      state.loopMode = 'section4';
      for (let v = 0; v < DRUM_VOICES.length; v++) {
        for (let i = 0; i < 64; i++) {
          baseGrid[v][targetSlice * 64 + i] = { ...(blockGrid[v][i] || baseGrid[v][targetSlice * 64 + i]) };
        }
      }
    }

    state.grid = baseGrid;
    setInstrumentGrid(tType, cloneGrid256(baseGrid));
    syncSequencerNotes();
    renderComposeInstrumentUI();
    updateViewModeButtons();
    updateDialsUI();
    switchWorkspaceTab(tType);
    setTimeout(() => {
      const seqEl = document.getElementById('card-sequencer');
      if (seqEl) seqEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function renderArtistTabsAndSongs() {
    const artistTabsEl = document.getElementById('fold-artist-tabs');
    const songsGridEl = document.getElementById('fold-artist-songs');
    if (!artistTabsEl || !songsGridEl) return;

    const modalInst = state.songModalInstrument || state.composeInstrument || 'drums';
    const isModalAll = modalInst === 'both' || modalInst === 'all';
    const targetInst = isComposeInstrumentTab(modalInst) ? modalInst : state.composeInstrument || 'drums';
    const targetMeta = getInstrumentMeta(targetInst);
    const targetSongId = getInstrumentSongId(targetInst);
    const targetLookup = findSongById(targetSongId);
    const activeModalArtistId = state.songModalArtistBrowseId || targetLookup.artist.artistId;

    const modalTitleEl = document.getElementById('fold-song-modal-title');
    if (modalTitleEl) {
      modalTitleEl.textContent = isModalAll
        ? '🎵 Search & Select Artist / Song for All Instruments'
        : `${targetMeta.icon} Search & Select Artist / Song for ${targetMeta.label}`;
    }
    const modalSubEl = document.getElementById('fold-summary-artist');
    if (modalSubEl) {
      const curSong = findSongById(getInstrumentSongId(targetInst)).song;
      const bpmNote =
        state.timelineHasUserSection && state.timelineBpm
          ? `🔒 Master BPM Locked at ${state.timelineBpm} BPM`
          : `⏱️ Selecting a song sets BPM (${state.tempo} BPM)`;
      modalSubEl.textContent = `Current ${targetMeta.shortLabel} Song: ${curSong.title} · ${bpmNote}`;
    }

    document.querySelectorAll('[data-song-modal-inst]').forEach((btn) => {
      const instVal = btn.getAttribute('data-song-modal-inst');
      btn.classList.toggle('chip-on', instVal === modalInst);
    });

    const q = (state.songSearchQuery || '').trim().toLowerCase();
    const tf = state.songTempoFilter || 'all';
    const isFilteringAll = q.length > 0 || tf !== 'all';

    document.querySelectorAll('[data-tempo-filter]').forEach((btn) => {
      btn.classList.toggle('chip-on', btn.getAttribute('data-tempo-filter') === tf);
    });

    artistTabsEl.innerHTML = ARTIST_CATALOG.map((a) => {
      const active = !isFilteringAll && a.artistId === activeModalArtistId;
      const bProf = ARTIST_BASS_PROFILES[a.artistId] || ARTIST_BASS_PROFILES.zeppelin;
      return `
        <button class="fold-artist-pill ${active ? 'active' : ''}" data-artist-tab="${a.artistId}">
          <span>${a.artistName}</span>
          <span class="drummer-sub">🥁 ${a.drummer} · 🎸 ${bProf.bassist}</span>
        </button>`;
    }).join('');

    artistTabsEl.querySelectorAll('[data-artist-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aid = btn.getAttribute('data-artist-tab');
        state.songModalArtistBrowseId = aid;
        state.songSearchQuery = '';
        state.songTempoFilter = 'all';
        const searchInput = document.getElementById('fold-song-search-input');
        if (searchInput) searchInput.value = '';
        renderArtistTabsAndSongs();
      });
    });

    let songsToRender = [];
    if (isFilteringAll) {
      for (const a of ARTIST_CATALOG) {
        const bProf = ARTIST_BASS_PROFILES[a.artistId] || ARTIST_BASS_PROFILES.zeppelin;
        for (let idx = 0; idx < a.songs.length; idx++) {
          const s = a.songs[idx];
          const matchesQuery =
            !q ||
            s.title.toLowerCase().includes(q) ||
            s.desc.toLowerCase().includes(q) ||
            a.artistName.toLowerCase().includes(q) ||
            a.drummer.toLowerCase().includes(q) ||
            bProf.bassist.toLowerCase().includes(q);
          const matchesTempo =
            tf === 'all' ||
            (tf === 'slow' && s.bpm < 95) ||
            (tf === 'mid' && s.bpm >= 95 && s.bpm < 125) ||
            (tf === 'fast' && s.bpm >= 125);
          if (matchesQuery && matchesTempo) {
            songsToRender.push({ artist: a, song: s, idx });
          }
        }
      }
    } else {
      const activeArtist =
        ARTIST_CATALOG.find((a) => a.artistId === activeModalArtistId) || ARTIST_CATALOG[0];
      songsToRender = activeArtist.songs.map((s, idx) => ({ artist: activeArtist, song: s, idx }));
    }

    const filterCountEl = document.getElementById('fold-song-filter-count');
    if (filterCountEl) {
      const targetLabel = isModalAll ? 'All Instruments' : `${targetMeta.icon} ${targetMeta.label}`;
      filterCountEl.textContent = isFilteringAll
        ? `Showing ${songsToRender.length} matching song(s) — Tap any song card to select it for ${targetLabel}!`
        : `${(ARTIST_CATALOG.find((a) => a.artistId === activeModalArtistId) || ARTIST_CATALOG[0]).artistName} — Tap any song card to select it for ${targetLabel}`;
    }

    if (songsToRender.length === 0) {
      songsGridEl.innerHTML = `
        <div style="grid-column:1/-1;padding:16px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.16);text-align:center;color:#9ca3af;font-size:13px;">
          🔍 No songs matched your search. Try clearing the search box or choosing <strong>All Tempos</strong>!
        </div>`;
      return;
    }

    songsGridEl.innerHTML = songsToRender
      .map(({ artist, song: s }) => {
        const activeForTarget = isModalAll
          ? s.id === getInstrumentSongId('drums') && s.id === getInstrumentSongId('bass')
          : s.id === getInstrumentSongId(targetInst);
        const bProf = ARTIST_BASS_PROFILES[artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
        const keyOverride = SONG_KEY_OVERRIDES[s.id];
        const scaleBadge = keyOverride ? keyOverride.label : bProf.scaleLabel;
        const artistBadge = isFilteringAll
          ? `<div style="font-size:11px;font-weight:800;color:#f0abfc;margin-bottom:2px;">${artist.artistName} · <span style="color:#d1d5db;font-weight:600;">${artist.drummer} / ${bProf.bassist}</span></div>`
          : '';
        const activeBadgesHtml = INSTRUMENT_LIST.filter((inst) => getInstrumentSongId(inst) === s.id)
          .map((inst) => {
            const m = getInstrumentMeta(inst);
            return `<span class="song-active-badge" style="background:${m.bgTint};color:${m.color};border:1px solid ${m.color};">${m.icon} ${m.shortLabel.toUpperCase()}</span>`;
          })
          .join('');
        return `
          <div class="fold-song-card ${activeForTarget ? 'active' : ''}" data-song-id="${s.id}">
            ${artistBadge}
            <div class="song-top-row">
              <span class="song-tempo-tag">${s.bpm} BPM · ${s.swing}% Swing · 🎼 ${scaleBadge}</span>
              <div style="display:flex;gap:3px;flex-wrap:wrap;">${activeBadgesHtml}</div>
            </div>
            <div class="song-title">${s.title}</div>
            <div class="song-desc">🥁 ${artist.drummer} · 🎸 ${bProf.bassist} — ${s.desc}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);">
              <button type="button" class="fold-song-send-btn" style="border-color:${targetMeta.color};color:#fff;background:${targetMeta.bgTint};padding:4px 10px;" data-card-select-inst="${targetInst}" data-card-song="${s.id}">✓ Select for ${targetMeta.icon} ${targetMeta.shortLabel}</button>
              <button type="button" class="fold-song-send-btn" style="border-color:rgba(255,255,255,0.22);color:#d1d5db;background:rgba(255,255,255,0.06);" data-card-select-inst="both" data-card-song="${s.id}">🎵 All Instruments</button>
            </div>
          </div>`;
      })
      .join('');

    songsGridEl.querySelectorAll('[data-card-select-inst]').forEach((selBtn) => {
      selBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sid = selBtn.getAttribute('data-card-song');
        const selInst = selBtn.getAttribute('data-card-select-inst') || modalInst;
        pushUndoState();
        loadSongGroove(sid, true, selInst);
        closeSongSelectModal();
      });
    });

    songsGridEl.querySelectorAll('[data-song-id]').forEach((cardEl) => {
      cardEl.addEventListener('click', (e) => {
        if (e.target.closest('[data-card-select-inst]')) {
          return;
        }
        pushUndoState();
        loadSongGroove(cardEl.getAttribute('data-song-id'), true, modalInst);
        closeSongSelectModal();
      });
    });
  }

  // ==========================================================================
  // Collaborative Arrangement Timeline Addition, Removal & Reordering (All 6 Tracks)
  // ==========================================================================
  function commitArrangementChange(activityDesc) {
    recordSessionHistoryEntry(activityDesc);
    savePersistedState();
    renderPrimaryTimelineStripUI();
    renderSongBuilderAndClipsUI();
    renderCrateAndJamUI();
    updatePlayerButtons();
    if (!state.suppressJamBroadcast && state.jamMode !== 'independent') {
      broadcastFullJamState(activityDesc);
    }
  }

  function addArrangementSection(roleId = 'chorus', songId = null, barsCount = 4, trackType = 'drums') {
    const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === roleId) || ARRANGEMENT_ROLES[1];
    addComposeToTimeline(barsCount, songId || state.selectedSongId, roleObj.id, trackType);
  }

  function removeArrangementSection(secIdx, trackType = 'drums') {
    const tType = isComposeInstrumentTab(trackType) ? trackType : 'drums';
    const arr = getTrackSections(tType);
    if (!Array.isArray(arr) || arr.length === 0 || !arr[secIdx]) return;
    pushUndoState();
    const removed = arr.splice(secIdx, 1)[0];
    if (arr.length === 0) {
      setSelectedTimelineIdx(tType, 0);
      setMasterTrackEnabled(tType, false, false);
    } else if (getSelectedTimelineIdx(tType) >= arr.length) {
      setSelectedTimelineIdx(tType, Math.max(0, arr.length - 1));
    }
    if (state.editingTimelineTrack === tType) {
      if (state.editingTimelineIdx === secIdx || arr.length === 0) {
        state.editingTimelineIdx = null;
      } else if (state.editingTimelineIdx !== null && state.editingTimelineIdx > secIdx) {
        state.editingTimelineIdx--;
      }
    }
    if (state.modalTrack === tType) {
      if (state.modalSectionIdx === secIdx || arr.length === 0) {
        closeSectionSequenceModal();
      } else if (state.modalSectionIdx !== null && state.modalSectionIdx > secIdx) {
        state.modalSectionIdx--;
      }
    }
    const anyRemaining = INSTRUMENT_LIST.some((i) => (getTrackSections(i) || []).length > 0);
    if (!anyRemaining) {
      state.timelineHasUserSection = false;
      state.timelineBpm = null;
      state.timelineBpmSourceTitle = '';
    }
    const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === removed?.roleId) || ARRANGEMENT_ROLES[1];
    const meta = getInstrumentMeta(tType);
    commitArrangementChange(`Removed ${meta.shortLabel} Section #${secIdx + 1} (${roleObj.label})`);
    renderComposeInstrumentUI();
  }

  function reorderArrangementSection(fromIdx, toIdx, trackType = 'drums') {
    const tType = isComposeInstrumentTab(trackType) ? trackType : 'drums';
    const arr = getTrackSections(tType);
    if (!Array.isArray(arr)) return;
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= arr.length ||
      toIdx >= arr.length
    ) {
      return;
    }
    pushUndoState();
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    setSelectedTimelineIdx(tType, toIdx);
    if (state.editingTimelineTrack === tType) {
      if (state.editingTimelineIdx === fromIdx) {
        state.editingTimelineIdx = toIdx;
      } else if (state.editingTimelineIdx !== null) {
        if (fromIdx < state.editingTimelineIdx && toIdx >= state.editingTimelineIdx) {
          state.editingTimelineIdx--;
        } else if (fromIdx > state.editingTimelineIdx && toIdx <= state.editingTimelineIdx) {
          state.editingTimelineIdx++;
        }
      }
    }
    if (state.modalTrack === tType && state.modalSectionIdx === fromIdx) {
      state.modalSectionIdx = toIdx;
    }
    const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === moved?.roleId) || ARRANGEMENT_ROLES[1];
    const meta = getInstrumentMeta(tType);
    commitArrangementChange(`Dragged ${meta.shortLabel} Block #${fromIdx + 1} (${roleObj.label}) → #${toIdx + 1}`);
  }

  function moveArrangementSection(secIdx, delta, trackType = 'drums') {
    reorderArrangementSection(secIdx, secIdx + delta, trackType);
  }

  function duplicateArrangementSection(secIdx, trackType = 'drums') {
    const tType = isComposeInstrumentTab(trackType) ? trackType : 'drums';
    const arr = getTrackSections(tType);
    if (!Array.isArray(arr) || !arr[secIdx]) return;
    pushUndoState();
    const src = arr[secIdx];
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = `sec_${tType}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    copy.trackType = tType;
    copy.addedBy = state.playerName;
    copy.addedColor = state.playerColor;
    arr.splice(secIdx + 1, 0, copy);
    setSelectedTimelineIdx(tType, secIdx + 1);
    const meta = getInstrumentMeta(tType);
    commitArrangementChange(`Duplicated ${meta.shortLabel} Block #${secIdx + 1}`);
  }

  function randomize4SectionMashup() {
    pushUndoState();
    const allSongs = [];
    for (const a of ARTIST_CATALOG) {
      for (const s of a.songs) {
        allSongs.push({ artist: a, song: s });
      }
    }
    const currentLen =
      Array.isArray(state.arrangementSections) && state.arrangementSections.length > 0
        ? state.arrangementSections.length
        : 4;
    const defaultRoles = ['intro', 'verse', 'chorus', 'bridge', 'breakdown', 'climax', 'outro'];
    const nextTracks = {};
    for (const inst of INSTRUMENT_LIST) {
      nextTracks[inst] = [];
    }
    for (let i = 0; i < currentLen; i++) {
      const pick = allSongs[Math.floor(Math.random() * allSongs.length)];
      const existingRole = state.arrangementSections?.[i]?.roleId || defaultRoles[i % defaultRoles.length];
      const existingBars = Number(state.arrangementSections?.[i]?.bars) || 4;
      const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === existingRole) || ARRANGEMENT_ROLES[1];
      for (const inst of INSTRUMENT_LIST) {
        nextTracks[inst].push({
          id: `sec_${inst}_${Date.now().toString(36)}_${i}_${Math.random().toString(36).slice(2, 5)}`,
          trackType: inst,
          roleId: roleObj.id,
          songId: pick.song.id,
          sourceSlice: i % 4,
          sourceBar: (i % 4) * 4,
          bars: existingBars,
          customEdited: false,
          customGrid: null,
          addedBy: state.playerName,
          addedColor: state.playerColor
        });
      }
    }
    for (const inst of INSTRUMENT_LIST) {
      setTrackSections(inst, nextTracks[inst]);
      setMasterTrackEnabled(inst, true, true);
    }
    if (!state.timelineHasUserSection && nextTracks.drums[0]) {
      const firstSong = findSongById(nextTracks.drums[0].songId).song;
      state.timelineHasUserSection = true;
      setGlobalTimelineBpm(firstSong ? firstSong.bpm : state.tempo, firstSong ? firstSong.title : 'Block #1');
    }
    commitArrangementChange(`Randomized ${currentLen}-Block Master Band Timeline`);
  }

  // ==========================================================================
  // Section Sequence Modal Editor (Opens when clicking a section in Timeline)
  // ==========================================================================
  let isPaintingModalSteps = false;
  let modalPaintTargetState = null;

  function openSectionSequenceModal(secIdx, trackType = 'drums') {
    const tType = isComposeInstrumentTab(trackType) ? trackType : 'drums';
    const arr = getTrackSections(tType);
    if (!Array.isArray(arr) || !arr[secIdx]) return;
    state.modalTrack = tType;
    setSelectedTimelineIdx(tType, secIdx);
    state.modalSectionIdx = secIdx;
    state.modalSubSlice = 0;

    const secItem = arr[secIdx];
    secItem.trackType = tType;
    if (!secItem.customGrid) {
      secItem.customGrid = getTimelineBlockGrid(secItem, tType);
    }

    const modalEl = document.getElementById('fold-section-modal');
    if (modalEl) {
      modalEl.style.display = 'flex';
    }
    renderSectionSequenceModal();
    renderPrimaryTimelineStripUI();
    renderSongBuilderAndClipsUI();
    updatePlayerButtons();
  }

  function closeSectionSequenceModal() {
    state.modalSectionIdx = null;
    const modalEl = document.getElementById('fold-section-modal');
    if (modalEl) {
      modalEl.style.display = 'none';
    }
    renderPrimaryTimelineStripUI();
    renderSongBuilderAndClipsUI();
    updatePlayerButtons();
  }

  function applyBrushToModalCell(secIdx, vIdx, stepIdx, forceState = null) {
    const trackType = isComposeInstrumentTab(state.modalTrack) ? state.modalTrack : 'drums';
    const arr = getTrackSections(trackType);
    const secItem = arr && arr[secIdx];
    if (!secItem) return null;
    if (!secItem.customGrid) {
      secItem.customGrid = getTimelineBlockGrid(secItem, trackType);
    }
    if (!secItem.customGrid[vIdx] || !secItem.customGrid[vIdx][stepIdx]) {
      return null;
    }

    const cell = secItem.customGrid[vIdx][stepIdx];
    const mode = state.brushMode;

    if (forceState !== null) {
      secItem.customGrid[vIdx][stepIdx] = { ...forceState };
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

    secItem.customEdited = true;
    secItem.addedBy = state.playerName;
    secItem.addedColor = state.playerColor;

    const updated = secItem.customGrid[vIdx][stepIdx];
    if (updated.state > 0 && !state.phonePlayer.playing) {
      const ctx = getAudioCtx();
      const vel = updated.state === 2 ? 124 : updated.state === 3 ? 48 : 100;
      const voices = getActiveVoices(trackType, secItem.songId || state.selectedSongId);
      const voice = voices[vIdx] || voices[0];
      triggerInstrumentVoice(ctx, trackType, voice.pitch, vel, ctx.currentTime, 0.25, getKitIdForInstrument(trackType));
    }

    savePersistedState();
    renderSectionSequenceModalGridOnly();
    renderPrimaryTimelineStripUI();
    renderSongBuilderAndClipsUI();
    return { ...updated };
  }

  function renderSectionSequenceModalGridOnly() {
    const gridContainer = document.getElementById('fold-modal-seq-grid');
    if (!gridContainer || state.modalSectionIdx === null) return;
    const secIdx = state.modalSectionIdx;
    const trackType = isComposeInstrumentTab(state.modalTrack) ? state.modalTrack : 'drums';
    const meta = getInstrumentMeta(trackType);
    const arr = getTrackSections(trackType);
    const secItem = arr && arr[secIdx];
    if (!secItem) return;

    const voices = getActiveVoices(trackType, secItem.songId || state.selectedSongId);
    const blockGrid = getTimelineBlockGrid(secItem, trackType);
    secItem.customGrid = blockGrid;
    const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
    const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === secItem.roleId) || ARRANGEMENT_ROLES[1];

    if (bars === 1) {
      let html = `<div class="drum-seq-header-row">
        <div class="drum-lane-controls-header" style="color:${roleObj.color};">1-BAR ${meta.shortLabel.toUpperCase()} SECTION · 16 STEPS</div>
        <div class="drum-steps-row">`;
      for (let s = 0; s < 16; s++) {
        const isBeat = s % 4 === 0;
        const beatNum = Math.floor(s / 4) + 1;
        html += `<div class="drum-step-num ${isBeat ? 'beat' : ''}">${isBeat ? `Beat ${beatNum}` : (s % 4) + 1}</div>`;
      }
      html += `</div></div>`;

      for (let vIdx = 0; vIdx < voices.length; vIdx++) {
        const voice = voices[vIdx];
        const muted = state.mutedLanes[vIdx];
        html += `
          <div class="drum-seq-row ${muted ? 'muted' : ''}">
            <div class="drum-lane-info">
              <button type="button" class="drum-voice-btn" data-modal-audition="${vIdx}" style="border-left:4px solid ${voice.color};">
                ${voice.name}
              </button>
              <button type="button" class="drum-mini-ctrl ${muted ? 'muted-on' : ''}" data-modal-mute="${vIdx}" title="Mute Voice">M</button>
              <button type="button" class="drum-mini-ctrl" data-modal-clear-lane="${vIdx}" title="Clear Voice in Section">×</button>
            </div>
            <div class="drum-steps-row">`;
        for (let s = 0; s < 16; s++) {
          const cell = blockGrid[vIdx][s] || { state: 0, sub: 1 };
          const beatGroup = Math.floor(s / 4) % 2 === 1 ? 'alt-group' : '';
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
            <div class="drum-step-cell ${beatGroup} ${stClass}"
                 data-modal-v="${vIdx}" data-modal-step="${s}" style="${bgStyle}">
              ${subBadge}
            </div>`;
        }
        html += `</div></div>`;
      }
      gridContainer.innerHTML = html;
    } else {
      const subSlice = bars === 16 ? Math.max(0, Math.min(3, state.modalSubSlice || 0)) : 0;
      const startBarInBlock = subSlice * 4;
      const startStepInBlock = subSlice * 64;

      let html = `<div class="drum-seq-64-wrapper" style="border-left:4px solid ${roleObj.color};padding-left:8px;">`;
      html += `<div class="drum-seq-row-64 header">
        <div class="drum-lane-controls-header" style="color:${roleObj.color};">
          ${bars === 16 ? `SLICE ${subSlice + 1} (BARS ${startBarInBlock + 1}–${startBarInBlock + 4})` : `4-BAR ${meta.shortLabel.toUpperCase()} SECTION`}<br>
          <span style="font-size:9px;color:#9ca3af;">Steps ${startStepInBlock + 1}–${startStepInBlock + 64}</span>
        </div>
        <div class="drum-bars-4-grid">
          <div class="bar-banner">BAR ${startBarInBlock + 1}</div>
          <div class="bar-banner">BAR ${startBarInBlock + 2}</div>
          <div class="bar-banner">BAR ${startBarInBlock + 3}</div>
          <div class="bar-banner fill-bar">BAR ${startBarInBlock + 4} (Turnaround / Fill)</div>
        </div>
      </div>`;

      for (let vIdx = 0; vIdx < voices.length; vIdx++) {
        const voice = voices[vIdx];
        const muted = state.mutedLanes[vIdx];
        html += `
          <div class="drum-seq-row-64 ${muted ? 'muted' : ''}">
            <div class="drum-lane-info">
              <button type="button" class="drum-voice-btn" data-modal-audition="${vIdx}" style="border-left:4px solid ${voice.color};">
                ${voice.name}
              </button>
              <button type="button" class="drum-mini-ctrl ${muted ? 'muted-on' : ''}" data-modal-mute="${vIdx}" title="Mute Voice">M</button>
              <button type="button" class="drum-mini-ctrl" data-modal-clear-lane="${vIdx}" title="Clear Voice in Section">×</button>
            </div>
            <div class="drum-bars-4-grid">`;

        for (let b = 0; b < 4; b++) {
          html += `<div class="drum-bar-16-subgrid">`;
          for (let i = 0; i < 16; i++) {
            const s = startStepInBlock + b * 16 + i;
            const cell = blockGrid[vIdx][s] || { state: 0, sub: 1 };
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
              <div class="drum-step-cell compact64 ${isBeat ? 'beat-start' : ''} ${stClass}"
                   data-modal-v="${vIdx}" data-modal-step="${s}" style="${bgStyle}">
                ${subBadge}
              </div>`;
          }
          html += `</div>`;
        }
        html += `</div></div>`;
      }
      html += `</div>`;
      gridContainer.innerHTML = html;
    }

    gridContainer.querySelectorAll('[data-modal-audition]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vIdx = Number(btn.getAttribute('data-modal-audition'));
        const ctx = getAudioCtx();
        const voice = voices[vIdx] || voices[0];
        triggerInstrumentVoice(ctx, trackType, voice.pitch, 118, ctx.currentTime, 0.26, getKitIdForInstrument(trackType));
      });
    });

    gridContainer.querySelectorAll('[data-modal-mute]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vIdx = Number(btn.getAttribute('data-modal-mute'));
        state.mutedLanes[vIdx] = !state.mutedLanes[vIdx];
        renderSectionSequenceModalGridOnly();
      });
    });

    gridContainer.querySelectorAll('[data-modal-clear-lane]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vIdx = Number(btn.getAttribute('data-modal-clear-lane'));
        if (!secItem.customGrid) secItem.customGrid = getTimelineBlockGrid(secItem, trackType);
        const totalSteps = secItem.customGrid[vIdx] ? secItem.customGrid[vIdx].length : 64;
        for (let s = 0; s < totalSteps; s++) {
          secItem.customGrid[vIdx][s] = { state: 0, sub: 1 };
        }
        secItem.customEdited = true;
        savePersistedState();
        renderSectionSequenceModalGridOnly();
        renderPrimaryTimelineStripUI();
        renderSongBuilderAndClipsUI();
      });
    });

    gridContainer.querySelectorAll('.drum-step-cell[data-modal-step]').forEach((cellEl) => {
      cellEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const vIdx = Number(cellEl.getAttribute('data-modal-v'));
        const sIdx = Number(cellEl.getAttribute('data-modal-step'));
        isPaintingModalSteps = true;
        modalPaintTargetState = applyBrushToModalCell(secIdx, vIdx, sIdx, null);
      });
      cellEl.addEventListener('pointerenter', () => {
        if (!isPaintingModalSteps || !modalPaintTargetState) return;
        const vIdx = Number(cellEl.getAttribute('data-modal-v'));
        const sIdx = Number(cellEl.getAttribute('data-modal-step'));
        applyBrushToModalCell(secIdx, vIdx, sIdx, modalPaintTargetState);
      });
    });
  }

  window.addEventListener('pointerup', () => {
    isPaintingModalSteps = false;
    modalPaintTargetState = null;
  });

  function renderSectionSequenceModal() {
    const contentEl = document.getElementById('fold-section-modal-content');
    if (!contentEl || state.modalSectionIdx === null) return;
    const secIdx = state.modalSectionIdx;
    const trackType = isComposeInstrumentTab(state.modalTrack) ? state.modalTrack : 'drums';
    const meta = getInstrumentMeta(trackType);
    const arr = getTrackSections(trackType) || [];
    const secItem = arr[secIdx];
    if (!secItem) {
      closeSectionSequenceModal();
      return;
    }

    const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === secItem.roleId) || ARRANGEMENT_ROLES[1];
    const curSongId = secItem.songId || state.selectedSongId;
    const { artist, song } = findSongById(curSongId);
    const bProf = ARTIST_BASS_PROFILES[artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
    const keyOverride = SONG_KEY_OVERRIDES[curSongId];
    const scaleBadge = keyOverride ? keyOverride.label : bProf.scaleLabel;
    const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
    const sliceIdx = Math.max(0, Math.min(3, Number(secItem.sourceSlice ?? 0)));
    const sourceBarIdx = Math.max(0, Math.min(15, Number(secItem.sourceBar ?? sliceIdx * 4)));

    let startBarNum = 1;
    for (let i = 0; i < secIdx; i++) {
      startBarNum += Math.max(1, Math.min(16, Number(arr[i].bars) || 4));
    }
    const endBarNum = startBarNum + bars - 1;
    const barRangeText = bars === 1 ? `Timeline Bar ${startBarNum}` : `Timeline Bars ${startBarNum}–${endBarNum}`;

    const songOptionsHtml = ARTIST_CATALOG.map((a) => {
      const bp = ARTIST_BASS_PROFILES[a.artistId] || ARTIST_BASS_PROFILES.zeppelin;
      return `<optgroup label="${a.artistName} (${trackType === 'drums' ? a.drummer : bp.bassist})">${a.songs
        .map((s) => `<option value="${s.id}" ${s.id === curSongId ? 'selected' : ''}>${s.title}</option>`)
        .join('')}</optgroup>`;
    }).join('');

    const sliceLabels = [
      'Sec 1: Intro / Verse (Bars 1–4)',
      'Sec 2: Chorus / Hook (Bars 5–8)',
      'Sec 3: Bridge / Break (Bars 9–12)',
      'Sec 4: Climax & Fill (Bars 13–16)'
    ];

    let sourcePickerHtml = '';
    if (bars === 1) {
      sourcePickerHtml = `
        <select id="fold-modal-source-bar" class="fold-select" style="height:34px;font-size:12px;">
          ${Array.from({ length: 16 }, (_, b) => {
            const secNum = Math.floor(b / 4) + 1;
            const isFill = (b + 1) % 4 === 0;
            return `<option value="${b}" ${b === sourceBarIdx ? 'selected' : ''}>Source Bar ${b + 1} of 16 (Sec ${secNum}${isFill ? ' · Fill' : ''})</option>`;
          }).join('')}
        </select>`;
    } else if (bars === 4) {
      sourcePickerHtml = `
        <select id="fold-modal-source-slice" class="fold-select" style="height:34px;font-size:12px;">
          ${sliceLabels.map((lbl, idx) => `<option value="${idx}" ${idx === sliceIdx ? 'selected' : ''}>${lbl}</option>`).join('')}
        </select>`;
    } else {
      sourcePickerHtml = `
        <div class="fold-btn-row" style="gap:4px;">
          ${[0, 1, 2, 3]
            .map(
              (sIdx) =>
                `<button type="button" class="fold-btn ${state.modalSubSlice === sIdx ? 'chip-on' : ''}" data-modal-subslice="${sIdx}" style="padding:5px 9px;font-size:11px;">Bars ${sIdx * 4 + 1}–${sIdx * 4 + 4}</button>`
            )
            .join('')}
        </div>`;
    }

    const selIdx = getSelectedTimelineIdx(trackType);
    const isThisSectionLooped =
      state.timelineLoopSingle && state.timelineLoopTrack === trackType && selIdx === secIdx;
    const trackBadgeHtml = `<span style="font-size:12px;font-weight:900;color:#fff;background:${meta.color};padding:4px 9px;border-radius:7px;">${meta.trackBadge}</span>`;

    contentEl.innerHTML = `
      <!-- Modal Top Header with Clear Top-Right Close Button -->
      <div style="position:sticky;top:0;z-index:10;background:#141621;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding-bottom:12px;margin-bottom:10px;border-bottom:1.5px solid rgba(255,255,255,0.15);">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          ${trackBadgeHtml}
          <span style="font-size:13px;font-weight:900;color:#fff;background:${roleObj.color};padding:4px 10px;border-radius:7px;">SECTION #${secIdx + 1}</span>
          <strong style="font-size:15px;color:#fff;">${artist.artistName} — ${song.title}</strong>
          ${trackType !== 'drums' ? `<span style="font-size:11px;font-weight:800;color:${meta.color};background:${meta.bgTint};padding:3px 8px;border-radius:6px;">${meta.icon} ${scaleBadge}</span>` : ''}
          <span style="font-size:12px;font-weight:800;color:#fbbf24;background:rgba(251,191,36,0.16);padding:3px 9px;border-radius:6px;">${barRangeText} (${bars}B)</span>
          <span id="fold-modal-bpm-badge" style="font-size:12px;font-weight:800;color:#84dcc6;background:rgba(132,220,198,0.14);padding:3px 9px;border-radius:6px;">⏱️ ${state.tempo} BPM</span>
          ${
            isThisSectionLooped
              ? `<span style="font-size:11px;font-weight:900;color:#000;background:#fbbf24;padding:3px 9px;border-radius:999px;box-shadow:0 0 12px rgba(251,191,36,0.6);">🔁 LOOPING THIS SECTION</span>`
              : ''
          }
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto;">
          <button type="button" id="fold-modal-play-btn" class="fold-btn primary">▶ Play ${meta.shortLabel} Section #${secIdx + 1}</button>
          <button type="button" id="fold-modal-loop-toggle-btn" class="fold-btn">🔁 Loop This Section</button>
          <button type="button" id="fold-modal-close-btn" class="fold-modal-close-x" title="Close Section Editor (Esc)">✕ Close</button>
        </div>
      </div>

      <!-- Section Management Bar: Role, Length (1B/4B/16B), Song, Source Bar & Reorder/Duplicate/Delete -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:rgba(0,0,0,0.34);padding:9px 12px;border-radius:9px;border:1px solid rgba(255,255,255,0.12);margin-bottom:10px;">
        <div class="fold-btn-row" style="gap:6px;">
          <span style="font-size:11px;font-weight:800;color:#9ca3af;">ROLE:</span>
          <select id="fold-modal-role-select" class="fold-select" style="height:34px;font-size:12px;border-color:${roleObj.color};">
            ${ARRANGEMENT_ROLES.map((r) => `<option value="${r.id}" ${r.id === roleObj.id ? 'selected' : ''}>${r.label}</option>`).join('')}
          </select>
          <span style="font-size:11px;font-weight:800;color:#9ca3af;margin-left:4px;">LENGTH:</span>
          <div style="display:inline-flex;background:#14151e;border:1px solid rgba(255,255,255,0.2);border-radius:7px;overflow:hidden;">
            ${[1, 4, 16]
              .map(
                (bLen) =>
                  `<button type="button" data-modal-bars="${bLen}" style="border:none;padding:5px 10px;font-size:12px;font-weight:800;cursor:pointer;background:${
                    bars === bLen ? '#e73ff6' : 'transparent'
                  };color:${bars === bLen ? '#fff' : '#9ca3af'};">${bLen} Bar${bLen === 1 ? '' : 's'}</button>`
              )
              .join('')}
          </div>
          <select id="fold-modal-song-select" class="fold-select" style="height:34px;font-size:12px;max-width:240px;">
            ${songOptionsHtml}
          </select>
          ${sourcePickerHtml}
        </div>
        <div class="fold-btn-row" style="gap:6px;">
          <button type="button" id="fold-modal-move-left" class="fold-btn" title="Move Section Earlier in Timeline" ${secIdx === 0 ? 'disabled' : ''}>← Move Left</button>
          <button type="button" id="fold-modal-move-right" class="fold-btn" title="Move Section Later in Timeline" ${secIdx >= arr.length - 1 ? 'disabled' : ''}>Move Right →</button>
          <button type="button" id="fold-modal-dup-btn" class="fold-btn" title="Duplicate this Section on Timeline">📋 Duplicate</button>
          <button type="button" id="fold-modal-reset-btn" class="fold-btn" title="Reset this section back to the factory pattern of its selected song">🔄 Reset</button>
          <button type="button" id="fold-modal-open-compose-btn" class="fold-btn teal" title="Open this section in ${meta.shortLabel} Tab">🎛️ Open in ${meta.shortLabel} Tab</button>
          <button type="button" id="fold-modal-delete-btn" class="fold-btn" style="border-color:rgba(244,63,94,0.5);color:#fda4af;background:rgba(244,63,94,0.14);" title="Remove this Section from Timeline">🗑️ Delete</button>
        </div>
      </div>

      <!-- Step Brush Bar inside Modal -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:rgba(0,0,0,0.26);padding:7px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-bottom:10px;">
        <div class="fold-btn-row">
          <span style="font-size:11px;font-weight:800;color:#84dcc6;">STEP BRUSH (TAP OR DRAG STEPS):</span>
          <button type="button" class="fold-btn ${state.brushMode === 'normal' ? 'chip-on' : ''}" data-modal-brush="normal">● Normal</button>
          <button type="button" class="fold-btn ${state.brushMode === 'accent' ? 'chip-on' : ''}" data-modal-brush="accent">🔥 Accent</button>
          <button type="button" class="fold-btn ${state.brushMode === 'ghost' ? 'chip-on' : ''}" data-modal-brush="ghost">👻 Ghost</button>
          <button type="button" class="fold-btn ${state.brushMode === 'roll2' ? 'chip-on' : ''}" data-modal-brush="roll2">⚡ 32nd (2x)</button>
          <button type="button" class="fold-btn ${state.brushMode === 'roll3' ? 'chip-on' : ''}" data-modal-brush="roll3">⚡ Triplet (3x)</button>
        </div>
        <span style="font-size:11px;color:#d1d5db;">💡 Edits save automatically to ${meta.shortLabel} Section #${secIdx + 1} on your timeline</span>
      </div>

      <!-- Interactive Step Sequencer Grid for this Section -->
      <div id="fold-modal-seq-grid" style="overflow-x:auto;padding-bottom:6px;"></div>
    `;

    renderSectionSequenceModalGridOnly();
    updatePlayerButtons();

    // Wire up modal controls
    document.getElementById('fold-modal-close-btn')?.addEventListener('click', closeSectionSequenceModal);
    document.getElementById('fold-modal-play-btn')?.addEventListener('click', () => {
      const curSel = getSelectedTimelineIdx(trackType);
      const isPlayingThis =
        state.phonePlayer.playing &&
        state.playbackMode === 'timeline' &&
        state.timelineLoopTrack === trackType &&
        curSel === secIdx;
      if (isPlayingThis) {
        stopPhonePlayback();
      } else {
        setSelectedTimelineIdx(trackType, secIdx);
        state.timelineLoopTrack = trackType;
        state.timelineLoopSingle = true;
        startPhonePlayback('timeline');
      }
      renderSectionSequenceModal();
      renderPrimaryTimelineStripUI();
      renderSongBuilderAndClipsUI();
    });

    document.getElementById('fold-modal-loop-toggle-btn')?.addEventListener('click', () => {
      const curSel = getSelectedTimelineIdx(trackType);
      if (state.timelineLoopSingle && state.timelineLoopTrack === trackType && curSel === secIdx) {
        state.timelineLoopSingle = false;
      } else {
        setSelectedTimelineIdx(trackType, secIdx);
        state.timelineLoopTrack = trackType;
        state.timelineLoopSingle = true;
      }
      if (state.phonePlayer.playing && state.playbackMode === 'timeline') {
        const ctx = getAudioCtx();
        state.phonePlayer.startWallTime = ctx.currentTime + 0.01;
        state.phonePlayer.lastStepTime = -0.001;
      }
      renderSectionSequenceModal();
      renderPrimaryTimelineStripUI();
      renderSongBuilderAndClipsUI();
      updatePlayerButtons();
    });

    document.getElementById('fold-modal-move-left')?.addEventListener('click', () => {
      if (secIdx > 0) {
        moveArrangementSection(secIdx, -1, trackType);
        renderSectionSequenceModal();
      }
    });

    document.getElementById('fold-modal-move-right')?.addEventListener('click', () => {
      if (secIdx < arr.length - 1) {
        moveArrangementSection(secIdx, 1, trackType);
        renderSectionSequenceModal();
      }
    });

    document.getElementById('fold-modal-dup-btn')?.addEventListener('click', () => {
      duplicateArrangementSection(secIdx, trackType);
      state.modalSectionIdx = secIdx + 1;
      renderSectionSequenceModal();
    });

    document.getElementById('fold-modal-delete-btn')?.addEventListener('click', () => {
      removeArrangementSection(secIdx, trackType);
    });

    document.getElementById('fold-modal-reset-btn')?.addEventListener('click', () => {
      secItem.customGrid = null;
      secItem.customEdited = false;
      secItem.customGrid = getTimelineBlockGrid(secItem, trackType);
      commitArrangementChange(`Reset ${meta.shortLabel} Section #${secIdx + 1} Sequence`);
      renderSectionSequenceModal();
    });

    document.getElementById('fold-modal-open-compose-btn')?.addEventListener('click', () => {
      closeSectionSequenceModal();
      openTimelineBlockInCompose(secIdx, trackType);
    });

    document.getElementById('fold-modal-role-select')?.addEventListener('change', (e) => {
      const newRole = ARRANGEMENT_ROLES.find((r) => r.id === e.target.value) || ARRANGEMENT_ROLES[1];
      secItem.roleId = newRole.id;
      commitArrangementChange(`Changed ${meta.shortLabel} Section #${secIdx + 1} Role → ${newRole.label}`);
      renderSectionSequenceModal();
    });

    contentEl.querySelectorAll('[data-modal-bars]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const newBars = Number(btn.getAttribute('data-modal-bars')) || 4;
        secItem.bars = newBars;
        secItem.customGrid = null;
        secItem.customEdited = false;
        secItem.customGrid = getTimelineBlockGrid(secItem, trackType);
        commitArrangementChange(`Changed ${meta.shortLabel} Section #${secIdx + 1} Length → ${newBars} Bar(s)`);
        renderSectionSequenceModal();
      });
    });

    document.getElementById('fold-modal-song-select')?.addEventListener('change', (e) => {
      secItem.songId = e.target.value;
      secItem.customGrid = null;
      secItem.customEdited = false;
      secItem.customGrid = getTimelineBlockGrid(secItem, trackType);
      const { song: newSong } = findSongById(e.target.value);
      commitArrangementChange(`Changed ${meta.shortLabel} Section #${secIdx + 1} Song → ${newSong.title}`);
      renderSectionSequenceModal();
    });

    document.getElementById('fold-modal-source-bar')?.addEventListener('change', (e) => {
      secItem.sourceBar = Number(e.target.value);
      secItem.customGrid = null;
      secItem.customEdited = false;
      secItem.customGrid = getTimelineBlockGrid(secItem, trackType);
      commitArrangementChange(`Changed ${meta.shortLabel} Section #${secIdx + 1} Source Bar → Bar ${Number(e.target.value) + 1}`);
      renderSectionSequenceModal();
    });

    document.getElementById('fold-modal-source-slice')?.addEventListener('change', (e) => {
      secItem.sourceSlice = Number(e.target.value);
      secItem.customGrid = null;
      secItem.customEdited = false;
      secItem.customGrid = getTimelineBlockGrid(secItem, trackType);
      commitArrangementChange(`Changed ${meta.shortLabel} Section #${secIdx + 1} 4-Bar Slice`);
      renderSectionSequenceModal();
    });

    contentEl.querySelectorAll('[data-modal-subslice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.modalSubSlice = Number(btn.getAttribute('data-modal-subslice')) || 0;
        renderSectionSequenceModal();
      });
    });

    contentEl.querySelectorAll('[data-modal-brush]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.brushMode = btn.getAttribute('data-modal-brush');
        document.querySelectorAll('[data-brush]').forEach((b) => {
          b.classList.toggle('chip-on', b.getAttribute('data-brush') === state.brushMode);
        });
        renderSectionSequenceModal();
      });
    });
  }

  function renderBlockMiniWaveformHtml(secItem, trackType = 'drums') {
    const tType = isComposeInstrumentTab(trackType) ? trackType : 'drums';
    const meta = getInstrumentMeta(tType);
    const blockGrid = getTimelineBlockGrid(secItem, tType);
    const totalSteps = blockGrid[0] ? blockGrid[0].length : 64;
    const bucketCount = 16;
    const stepsPerBucket = Math.max(1, Math.floor(totalSteps / bucketCount));
    let spans = '';
    for (let b = 0; b < bucketCount; b++) {
      let density = 0;
      let hasLow = false;
      let hasMid = false;
      const startS = b * stepsPerBucket;
      const endS = Math.min(totalSteps, startS + stepsPerBucket);
      for (let s = startS; s < endS; s++) {
        for (let v = 0; v < DRUM_VOICES.length; v++) {
          const cell = blockGrid[v] && blockGrid[v][s];
          if (cell && cell.state > 0) {
            density++;
            if (v === 0) hasLow = true;
            if (v === 2 || v === 1 || v === 3) hasMid = true;
          }
        }
      }
      const norm = Math.min(100, density === 0 ? 14 : Math.round(24 + (density / stepsPerBucket) * 26));
      const color =
        density === 0
          ? 'rgba(255,255,255,0.12)'
          : tType === 'drums'
          ? hasLow
            ? '#f43f5e'
            : hasMid
            ? '#fbbf24'
            : '#38bdf8'
          : hasLow
          ? meta.color
          : hasMid
          ? '#a855f7'
          : '#e73ff6';
      spans += `<span style="height:${norm}%;background:${color};border-radius:2px;display:block;width:100%;"></span>`;
    }
    return `<div style="display:grid;grid-template-columns:repeat(16,1fr);gap:2px;height:20px;align-items:end;margin-top:3px;">${spans}</div>`;
  }

  let draggedTimelineBlockIdx = null;
  let draggedTimelineTrack = 'drums';
  let pointerDragState = null;

  function wireTimelineDragAndClick(containerEl, selector, attrName) {
    if (!containerEl) return;
    const items = Array.from(containerEl.querySelectorAll(selector));

    items.forEach((itemEl) => {
      const idx = Number(itemEl.getAttribute(attrName));
      const trackType = itemEl.getAttribute('data-tl-track') || 'drums';

      // 1. HTML5 Drag & Drop (Desktop Mouse)
      itemEl.addEventListener('dragstart', (e) => {
        if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT')) {
          e.preventDefault();
          return;
        }
        draggedTimelineBlockIdx = idx;
        draggedTimelineTrack = trackType;
        itemEl.classList.add('dragging-tl-block');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          try {
            e.dataTransfer.setData('text/plain', String(idx));
          } catch (_) {}
        }
      });

      itemEl.addEventListener('dragover', (e) => {
        if (draggedTimelineBlockIdx === null || draggedTimelineTrack !== trackType || draggedTimelineBlockIdx === idx) {
          return;
        }
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        const rect = itemEl.getBoundingClientRect();
        const isAfter = e.clientX > rect.left + rect.width / 2;
        itemEl.classList.toggle('drag-over-left', !isAfter);
        itemEl.classList.toggle('drag-over-right', isAfter);
      });

      itemEl.addEventListener('dragleave', () => {
        itemEl.classList.remove('drag-over-left', 'drag-over-right');
      });

      itemEl.addEventListener('drop', (e) => {
        e.preventDefault();
        itemEl.classList.remove('drag-over-left', 'drag-over-right');
        const fromIdx = draggedTimelineBlockIdx;
        const fromTrack = draggedTimelineTrack;
        draggedTimelineBlockIdx = null;
        if (fromIdx === null || fromTrack !== trackType || fromIdx === idx) return;
        reorderArrangementSection(fromIdx, idx, trackType);
      });

      itemEl.addEventListener('dragend', () => {
        draggedTimelineBlockIdx = null;
        items.forEach((el) => el.classList.remove('dragging-tl-block', 'drag-over-left', 'drag-over-right'));
      });

      // 2. Touch / Pointer Drag Reordering + Click-to-Open-Modal
      itemEl.addEventListener('pointerdown', (e) => {
        if (e.button && e.button !== 0) return;
        if (e.target.closest('button, select, input')) return;
        pointerDragState = {
          fromIdx: idx,
          trackType,
          startX: e.clientX,
          startY: e.clientY,
          moved: false,
          overIdx: idx,
          sourceEl: itemEl
        };
      });
    });
  }

  window.addEventListener('pointermove', (e) => {
    if (!pointerDragState) return;
    const dx = e.clientX - pointerDragState.startX;
    const dy = e.clientY - pointerDragState.startY;
    if (!pointerDragState.moved && Math.hypot(dx, dy) > 10) {
      pointerDragState.moved = true;
      pointerDragState.sourceEl.classList.add('dragging-tl-block');
    }
    if (pointerDragState.moved) {
      document.querySelectorAll('.fold-tl-block').forEach((el) => {
        el.classList.remove('drag-over-left', 'drag-over-right');
      });
      const underEl = document.elementFromPoint(e.clientX, e.clientY);
      const targetBlock = underEl && underEl.closest('[data-tl-block]');
      if (targetBlock) {
        const targetTrack = targetBlock.getAttribute('data-tl-track') || 'drums';
        const targetIdx = Number(targetBlock.getAttribute('data-tl-block'));
        if (
          targetTrack === pointerDragState.trackType &&
          !Number.isNaN(targetIdx) &&
          targetIdx !== pointerDragState.fromIdx
        ) {
          pointerDragState.overIdx = targetIdx;
          const rect = targetBlock.getBoundingClientRect();
          const isAfter = e.clientX > rect.left + rect.width / 2;
          targetBlock.classList.toggle('drag-over-left', !isAfter);
          targetBlock.classList.toggle('drag-over-right', isAfter);
        }
      }
    }
  });

  window.addEventListener('pointerup', () => {
    if (!pointerDragState) return;
    const st = pointerDragState;
    pointerDragState = null;
    document.querySelectorAll('.fold-tl-block').forEach((el) => {
      el.classList.remove('dragging-tl-block', 'drag-over-left', 'drag-over-right');
    });
    if (st.moved) {
      if (st.overIdx !== st.fromIdx) {
        reorderArrangementSection(st.fromIdx, st.overIdx, st.trackType || 'drums');
      }
    } else if (st.sourceEl && st.sourceEl.hasAttribute('data-tl-block')) {
      // Touch/click on a Timeline Block opens the Section Sequence Modal Card!
      openSectionSequenceModal(st.fromIdx, st.trackType || 'drums');
    }
  });

  function renderTimelineTrackRowHtml(arr, trackType = 'drums', compactMode = false) {
    const tType = isComposeInstrumentTab(trackType) ? trackType : 'drums';
    const meta = getInstrumentMeta(tType);
    let runningBar = 1;
    return arr
      .map((secItem, secIdx) => {
        const bars = Math.max(1, Math.min(16, Number(secItem.bars) || 4));
        const startBar = runningBar;
        const endBar = runningBar + bars - 1;
        runningBar = endBar + 1;
        const barLabel = bars === 1 ? `Bar ${startBar}` : `Bars ${startBar}–${endBar}`;
        const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === secItem.roleId) || ARRANGEMENT_ROLES[1];
        const { artist, song } = findSongById(secItem.songId || state.selectedSongId);
        const bProf = ARTIST_BASS_PROFILES[artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
        const cleanArtist = artist.artistName.replace(/^[^\w]+/, '').trim();
        const selIdx = getSelectedTimelineIdx(tType);
        const isSelected = secIdx === selIdx;
        const isLooped =
          state.timelineLoopSingle && state.timelineLoopTrack === tType && secIdx === selIdx;
        const activeIdx =
          tType === 'drums'
            ? state.activeTimelineIdx
            : tType === 'bass'
            ? state.activeBassTimelineIdx
            : state.activeTrackTimelineIdx?.[tType] ?? -1;
        const isPlaying =
          state.phonePlayer.playing && state.playbackMode === 'timeline' && activeIdx === secIdx;
        const flexWeight = bars === 1 ? 1.35 : bars === 16 ? 3.2 : 2.0;
        const minW = compactMode ? (bars === 1 ? 120 : 145) : bars === 1 ? 140 : bars === 16 ? 230 : 170;

        return `
          <div class="fold-tl-block ${isSelected ? 'selected-tl-block' : ''} ${isLooped ? 'looping-tl-block' : ''} ${isPlaying ? 'playing-tl-block' : ''}"
               data-tl-block="${secIdx}"
               data-tl-track="${tType}"
               draggable="true"
               title="Drag to reorder · Tap/Click to open ${meta.shortLabel} Section Sequence Modal"
               style="flex:${flexWeight} 1 ${minW}px;min-width:${minW}px;border-top:4px solid ${roleObj.color};position:relative;overflow:hidden;padding:${compactMode ? '5px 7px' : '8px 9px'};">
            <div class="fold-tl-needle" style="display:${isPlaying ? 'block' : 'none'};left:0%;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
              <span style="font-size:10px;font-weight:900;color:${meta.color};">${meta.icon} ${barLabel} (${bars}B)</span>
              <button type="button"
                      data-tl-loop-toggle="${secIdx}"
                      data-tl-loop-track="${tType}"
                      title="${isLooped ? 'Tap to Disable Section Loop' : 'Tap to Loop Only This Section'}"
                      style="border:1px solid ${isLooped ? '#fbbf24' : 'rgba(255,255,255,0.2)'};background:${
                        isLooped ? '#fbbf24' : 'rgba(255,255,255,0.08)'
                      };color:${isLooped ? '#000' : '#d1d5db'};border-radius:999px;padding:1px 6px;font-size:9px;font-weight:900;cursor:pointer;">
                ${isLooped ? '🔁 LOOP · ✕' : '🔁 Loop'}
              </button>
            </div>
            <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:2px;">
              <strong style="font-size:${compactMode ? '11px' : '12px'};color:#fff;">#${secIdx + 1} ${roleObj.label}</strong>
              ${secItem.customEdited ? `<span style="font-size:9px;font-weight:800;background:rgba(231,63,246,0.28);color:#f5d0fe;padding:1px 5px;border-radius:4px;">✏️</span>` : ''}
            </div>
            <div style="font-size:10px;font-weight:700;color:${meta.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${cleanArtist} — ${song.title}">
              ${song.title} <span style="color:#9ca3af;font-weight:500;">· ${tType === 'bass' ? bProf.bassist : cleanArtist}</span>
            </div>
            ${compactMode ? '' : renderBlockMiniWaveformHtml(secItem, tType)}
          </div>`;
      })
      .join('');
  }

  function wireTimelineLoopButtons(containerEl) {
    if (!containerEl) return;
    containerEl.querySelectorAll('[data-tl-loop-toggle]').forEach((loopBtn) => {
      loopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(loopBtn.getAttribute('data-tl-loop-toggle'));
        const trackType = loopBtn.getAttribute('data-tl-loop-track') || 'drums';
        const curSel = getSelectedTimelineIdx(trackType);
        if (state.timelineLoopSingle && state.timelineLoopTrack === trackType && curSel === idx) {
          state.timelineLoopSingle = false;
        } else {
          setSelectedTimelineIdx(trackType, idx);
          state.timelineLoopTrack = trackType;
          state.timelineLoopSingle = true;
        }
        if (state.phonePlayer.playing && state.playbackMode === 'timeline') {
          const ctx = getAudioCtx();
          state.phonePlayer.startWallTime = ctx.currentTime + 0.01;
          state.phonePlayer.lastStepTime = -0.001;
        }
        renderPrimaryTimelineStripUI();
        renderSongBuilderAndClipsUI();
        updatePlayerButtons();
      });
    });
  }

  function renderPrimaryTimelineStripUI() {
    const stripTrackEl = document.getElementById('fold-primary-tl-track-row');
    const stripLabelEl = document.getElementById('fold-primary-tl-track-label');
    const stripMasterBadgeEl = document.getElementById('fold-primary-tl-master-badge');
    const sendMasterBtn = document.getElementById('fold-send-inst-to-master-btn');
    const clearInstBtn = document.getElementById('fold-primary-strip-clear-btn');
    if (!stripTrackEl) return;

    const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
    const meta = getInstrumentMeta(inst);
    const arr = getTrackSections(inst) || [];
    const totalBars = arr.reduce((acc, s) => acc + (Number(s.bars) || 4), 0);
    const isOnMaster = isMasterTrackEnabled(inst);
    const isSynced = Boolean(state.masterTrackSynced && state.masterTrackSynced[inst]);
    const curSong = findSongById(getInstrumentSongId(inst)).song;

    if (stripLabelEl) {
      stripLabelEl.innerHTML = `<span style="color:${meta.color};font-weight:900;">STEP 3 · ${meta.icon} ${meta.label.toUpperCase()} TIMELINE (${arr.length} Section${arr.length === 1 ? '' : 's'} · ${totalBars} Bars @ ${state.tempo} BPM)</span>`;
    }

    if (stripMasterBadgeEl) {
      if (isOnMaster && isSynced) {
        stripMasterBadgeEl.textContent = '✅ On Master Timeline';
        stripMasterBadgeEl.style.background = 'rgba(16,185,129,0.2)';
        stripMasterBadgeEl.style.borderColor = '#10b981';
        stripMasterBadgeEl.style.color = '#6ee7b7';
      } else if (isOnMaster && !isSynced) {
        stripMasterBadgeEl.textContent = '🔄 Updated — Tap Send to Sync Master';
        stripMasterBadgeEl.style.background = 'rgba(251,191,36,0.2)';
        stripMasterBadgeEl.style.borderColor = '#fbbf24';
        stripMasterBadgeEl.style.color = '#fde68a';
      } else {
        stripMasterBadgeEl.textContent = '⚪ Not Yet Sent to Master Timeline';
        stripMasterBadgeEl.style.background = 'rgba(255,255,255,0.06)';
        stripMasterBadgeEl.style.borderColor = 'rgba(255,255,255,0.18)';
        stripMasterBadgeEl.style.color = '#9ca3af';
      }
    }

    if (sendMasterBtn) {
      if (arr.length === 0) {
        sendMasterBtn.textContent = `🚀 Add & Send ${meta.icon} ${meta.shortLabel} → Master Timeline`;
      } else if (isOnMaster && isSynced) {
        sendMasterBtn.textContent = `✅ ${meta.icon} ${meta.shortLabel} Sent to Master Timeline (View Master →)`;
      } else if (isOnMaster && !isSynced) {
        sendMasterBtn.textContent = `🚀 Update ${meta.icon} ${meta.shortLabel} on Master Timeline (${totalBars}B)`;
      } else {
        sendMasterBtn.textContent = `🚀 Send ${meta.icon} ${meta.shortLabel} Timeline (${arr.length} Sec · ${totalBars}B) → Master Timeline`;
      }
    }

    if (clearInstBtn) {
      clearInstBtn.disabled = arr.length === 0;
      clearInstBtn.style.opacity = arr.length === 0 ? '0.45' : '1';
    }

    if (arr.length === 0) {
      stripTrackEl.innerHTML = `
        <div style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px dashed ${meta.borderTint};background:rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div>
            <div style="font-size:12px;font-weight:900;color:#fff;">${meta.icon} Your ${meta.label} Timeline is empty — add your first section!</div>
            <div style="font-size:11px;color:#9ca3af;margin-top:2px;">Tap a section from <strong>${curSong.title}</strong> below (or use Step 2 above) to build your ${meta.shortLabel} arrangement:</div>
          </div>
          <div class="fold-btn-row" style="gap:6px;">
            <button type="button" class="fold-btn" style="border-color:#22c55e;color:#86efac;background:rgba(34,197,94,0.14);font-size:11px;padding:6px 10px;" data-empty-tl-add-slice="0">+ 🟢 Verse (4B)</button>
            <button type="button" class="fold-btn" style="border-color:#f97316;color:#fdba74;background:rgba(249,115,22,0.14);font-size:11px;padding:6px 10px;" data-empty-tl-add-slice="1">+ 🟠 Chorus (4B)</button>
            <button type="button" class="fold-btn" style="border-color:#38bdf8;color:#7dd3fc;background:rgba(56,189,248,0.14);font-size:11px;padding:6px 10px;" data-empty-tl-add-slice="2">+ 🔵 Bridge (4B)</button>
            <button type="button" class="fold-btn" style="border-color:#f43f5e;color:#fda4af;background:rgba(244,63,94,0.14);font-size:11px;padding:6px 10px;" data-empty-tl-add-slice="3">+ 🔥 Climax (4B)</button>
          </div>
        </div>`;
      stripTrackEl.querySelectorAll('[data-empty-tl-add-slice]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sliceIdx = Number(btn.getAttribute('data-empty-tl-add-slice')) || 0;
          const roles = ['verse', 'chorus', 'bridge', 'climax'];
          addComposeToTimeline(4, getInstrumentSongId(inst), roles[sliceIdx] || 'verse', inst, sliceIdx);
        });
      });
      return;
    }

    stripTrackEl.innerHTML = renderTimelineTrackRowHtml(arr, inst, false);
    wireTimelineLoopButtons(stripTrackEl);
    wireTimelineDragAndClick(stripTrackEl, '[data-tl-block]', 'data-tl-block');
  }

  function renderSongBuilderAndClipsUI() {
    const visualTimelineEl = document.getElementById('fold-visual-timeline');
    for (const inst of INSTRUMENT_LIST) {
      const arr = getTrackSections(inst);
      if (!Array.isArray(arr)) {
        setTrackSections(inst, []);
      }
      const updated = getTrackSections(inst) || [];
      if (getSelectedTimelineIdx(inst) >= updated.length) {
        setSelectedTimelineIdx(inst, Math.max(0, updated.length - 1));
      }
    }

    const activeMasterTracks = getActiveMasterTracks();
    let maxTotalBars = 0;
    const trackBarCounts = {};
    for (const inst of INSTRUMENT_LIST) {
      const arr = getTrackSections(inst) || [];
      const bCount = arr.reduce((acc, s) => acc + (Number(s.bars) || 4), 0);
      trackBarCounts[inst] = bCount;
      if (isMasterTrackEnabled(inst) && bCount > maxTotalBars) {
        maxTotalBars = bCount;
      }
    }

    const arrangeSummaryEl = document.getElementById('fold-summary-arrange');
    if (arrangeSummaryEl) {
      arrangeSummaryEl.textContent =
        activeMasterTracks.length > 0
          ? `${activeMasterTracks.length} Instrument Track${activeMasterTracks.length === 1 ? '' : 's'} on Master Timeline (${maxTotalBars} Bars · ${state.tempo} BPM)`
          : `No instrument timelines sent yet — build an Instrument Timeline and tap "🚀 Send to Master Timeline"`;
    }
    const arrangeBadgeEl = document.getElementById('fold-tab-badge-arrange');
    if (arrangeBadgeEl) {
      arrangeBadgeEl.textContent =
        activeMasterTracks.length > 0
          ? `${activeMasterTracks.length} Trk · ${maxTotalBars}B`
          : '0 Trk';
    }

    const tlBpmSlider = document.getElementById('fold-timeline-bpm-slider');
    const tlBpmVal = document.getElementById('fold-timeline-bpm-val');
    const tlBpmSource = document.getElementById('fold-timeline-bpm-source');
    if (tlBpmSlider) tlBpmSlider.value = state.tempo;
    if (tlBpmVal) tlBpmVal.textContent = `${state.tempo} BPM`;
    if (tlBpmSource) {
      const srcTitle = state.timelineBpmSourceTitle || state.lastSelectedSongTitle || 'Selected Song';
      tlBpmSource.textContent = state.timelineHasUserSection
        ? `Locked by 1st Section (${srcTitle})`
        : `Set by latest song (${srcTitle})`;
    }

    renderPrimaryTimelineStripUI();
    updatePlayerButtons();

    if (!visualTimelineEl) return;
    visualTimelineEl.style.flexDirection = 'column';
    visualTimelineEl.style.gap = '12px';

    const unsentInstruments = INSTRUMENT_LIST.filter((inst) => !isMasterTrackEnabled(inst));
    const drumHasSections = (getTrackSections('drums') || []).length > 0;

    let masterTracksHtml = '';
    if (activeMasterTracks.length === 0) {
      const readyInstruments = INSTRUMENT_LIST.filter((inst) => (getTrackSections(inst) || []).length > 0);
      masterTracksHtml = `
        <div style="padding:18px;border-radius:12px;border:1.5px dashed rgba(132,220,198,0.4);background:rgba(132,220,198,0.06);display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="font-size:15px;font-weight:900;color:#fff;">🎬 Master Timeline is Empty</div>
            <div style="font-size:12px;color:#d1d5db;margin-top:4px;line-height:1.45;">
              Build sections on any <strong>Instrument Tab</strong> (<strong>🥁 Drums</strong>, <strong>🎸 Bass</strong>, <strong>🎹 Keys</strong>, <strong>⚡ Guitar</strong>, <strong>🎺 Horns</strong>, <strong>🎤 Vocal</strong>), then tap <strong>"🚀 Send to Master Timeline"</strong> to layer your tracks together here.
            </div>
          </div>
          ${
            readyInstruments.length > 0
              ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:4px;">
                  <span style="font-size:11px;font-weight:900;color:#84dcc6;">READY TO SEND NOW:</span>
                  ${readyInstruments
                    .map((inst) => {
                      const m = getInstrumentMeta(inst);
                      const c = (getTrackSections(inst) || []).length;
                      const b = trackBarCounts[inst] || 0;
                      return `<button type="button" class="fold-btn primary" data-master-send-ready="${inst}" style="padding:7px 12px;font-size:12px;">🚀 Send ${m.icon} ${m.shortLabel} (${c} Sec · ${b}B) → Master</button>`;
                    })
                    .join('')}
                </div>`
              : ''
          }
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:11px;font-weight:800;color:#9ca3af;">OPEN AN INSTRUMENT TAB:</span>
            ${INSTRUMENT_LIST.map((inst) => {
              const m = getInstrumentMeta(inst);
              return `<button type="button" class="fold-btn" data-tl-open-tab="${inst}" style="border-color:${m.color};color:#fff;background:${m.bgTint};padding:6px 11px;font-size:11px;">${m.icon} Build ${m.shortLabel} Timeline →</button>`;
            }).join('')}
          </div>
        </div>`;
    } else {
      masterTracksHtml = activeMasterTracks
        .map((inst, tIdx) => {
          const meta = getInstrumentMeta(inst);
          const arr = getTrackSections(inst) || [];
          const barsCount = trackBarCounts[inst] || 0;
          const muted = isTrackMuted(inst);
          const curSong = findSongById(getInstrumentSongId(inst)).song;
          return `
            <div style="background:${meta.bgTint};border:1.5px solid ${meta.borderTint};border-radius:11px;padding:10px 12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span style="font-size:11px;font-weight:900;color:#fff;background:${meta.color};padding:3px 9px;border-radius:6px;">${meta.icon} TRACK ${tIdx + 1}: ${meta.label.toUpperCase()}</span>
                  <span style="font-size:11px;font-weight:800;color:${meta.color};">${arr.length} Section${arr.length === 1 ? '' : 's'} · ${barsCount} Bars</span>
                  <button type="button" class="fold-btn ${muted ? 'amber' : ''}" data-tl-mute-track="${inst}" style="padding:3px 9px;font-size:10px;">
                    ${muted ? `🔇 Muted` : `🔊 On`}
                  </button>
                  <button type="button" class="fold-btn" data-tl-play-track="${inst}" style="padding:3px 9px;font-size:10px;" title="Play only this instrument's timeline">
                    ▶ Solo ${meta.shortLabel}
                  </button>
                  ${
                    inst !== 'drums' && drumHasSections
                      ? `<button type="button" class="fold-btn teal" data-tl-match-drums="${inst}" style="padding:3px 9px;font-size:10px;" title="Match section roles & bar lengths from your Drum Timeline">🪄 Match Drums</button>`
                      : ''
                  }
                  <button type="button" class="fold-btn" data-tl-open-tab="${inst}" style="padding:3px 9px;font-size:10px;">✏️ Edit in ${meta.shortLabel} Tab →</button>
                  <button type="button" class="fold-btn" data-tl-remove-master="${inst}" style="padding:3px 8px;font-size:10px;border-color:rgba(244,63,94,0.4);color:#fda4af;" title="Remove ${meta.shortLabel} from Master Timeline (keeps sections in ${meta.shortLabel} tab)">✕ Hide from Master</button>
                </div>
                <div class="fold-btn-row" style="gap:4px;">
                  <span style="font-size:10px;font-weight:800;color:${meta.color};">+ ${curSong.title}:</span>
                  <button type="button" class="fold-btn" style="padding:2px 7px;font-size:10px;" data-tl-add-track="${inst}" data-tl-add-bars="4" data-tl-add-role="verse" data-tl-add-slice="0">+ Verse</button>
                  <button type="button" class="fold-btn" style="padding:2px 7px;font-size:10px;" data-tl-add-track="${inst}" data-tl-add-bars="4" data-tl-add-role="chorus" data-tl-add-slice="1">+ Chorus</button>
                  <button type="button" class="fold-btn" style="padding:2px 7px;font-size:10px;" data-tl-add-track="${inst}" data-tl-add-bars="4" data-tl-add-role="bridge" data-tl-add-slice="2">+ Bridge</button>
                  <button type="button" class="fold-btn" style="padding:2px 7px;font-size:10px;" data-tl-add-track="${inst}" data-tl-add-bars="4" data-tl-add-role="climax" data-tl-add-slice="3">+ Climax</button>
                </div>
              </div>
              <div class="fold-tl-track" style="${muted ? 'opacity:0.42;' : ''}">
                ${renderTimelineTrackRowHtml(arr, inst, false)}
              </div>
            </div>`;
        })
        .join('');
    }

    const addTrackTrayHtml =
      unsentInstruments.length > 0
        ? `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
            <span style="font-size:11px;font-weight:900;color:#9ca3af;">➕ ADD / SEND MORE INSTRUMENTS TO MASTER TIMELINE:</span>
            <div class="fold-btn-row" style="gap:6px;">
              ${unsentInstruments
                .map((inst) => {
                  const m = getInstrumentMeta(inst);
                  const arr = getTrackSections(inst) || [];
                  const bCount = trackBarCounts[inst] || 0;
                  if (arr.length > 0) {
                    return `<button type="button" class="fold-btn primary" data-master-send-ready="${inst}" style="padding:5px 10px;font-size:11px;">🚀 Send ${m.icon} ${m.shortLabel} (${arr.length} Sec · ${bCount}B)</button>`;
                  }
                  if (inst !== 'drums' && drumHasSections) {
                    return `<button type="button" class="fold-btn teal" data-tl-match-drums="${inst}" style="padding:5px 10px;font-size:11px;" title="Auto-create ${m.shortLabel} sections matching your Drums timeline and add to Master">🪄 Match Drums & Add ${m.icon} ${m.shortLabel}</button>`;
                  }
                  return `<button type="button" class="fold-btn" data-tl-open-tab="${inst}" style="border-color:${m.color};color:#d1d5db;padding:5px 10px;font-size:11px;">${m.icon} Build ${m.shortLabel} →</button>`;
                })
                .join('')}
            </div>
          </div>`
        : '';

    visualTimelineEl.innerHTML = masterTracksHtml + addTrackTrayHtml;

    visualTimelineEl.querySelectorAll('[data-master-send-ready]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-master-send-ready');
        sendInstrumentTimelineToMaster(inst, false);
      });
    });

    visualTimelineEl.querySelectorAll('[data-tl-mute-track]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-tl-mute-track');
        setTrackMuted(inst, !isTrackMuted(inst));
        savePersistedState();
        renderSongBuilderAndClipsUI();
      });
    });

    visualTimelineEl.querySelectorAll('[data-tl-play-track]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-tl-play-track');
        if (
          state.phonePlayer.playing &&
          state.playbackMode === 'timeline' &&
          state.timelinePlayScope === inst
        ) {
          stopPhonePlayback();
        } else {
          startPhonePlayback('timeline', inst);
        }
      });
    });

    visualTimelineEl.querySelectorAll('[data-tl-remove-master]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-tl-remove-master');
        const meta = getInstrumentMeta(inst);
        setMasterTrackEnabled(inst, false, false);
        savePersistedState();
        showTimelineToast(`Removed ${meta.icon} ${meta.label} from Master Timeline (sections remain saved in ${meta.shortLabel} tab)`);
        renderSongBuilderAndClipsUI();
      });
    });

    visualTimelineEl.querySelectorAll('[data-tl-match-drums]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-tl-match-drums');
        matchTrackTimelineToDrums(inst);
      });
    });

    visualTimelineEl.querySelectorAll('[data-tl-open-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-tl-open-tab');
        switchWorkspaceTab(inst);
      });
    });

    visualTimelineEl.querySelectorAll('[data-tl-add-track]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const track = btn.getAttribute('data-tl-add-track') || 'drums';
        const bars = Number(btn.getAttribute('data-tl-add-bars')) || 4;
        const role = btn.getAttribute('data-tl-add-role') || 'verse';
        const sliceAttr = btn.getAttribute('data-tl-add-slice');
        const sliceIdx = sliceAttr !== null ? Number(sliceAttr) : null;
        const songIdForAdd = isComposeInstrumentTab(track) ? getInstrumentSongId(track) : state.selectedSongId;
        addComposeToTimeline(bars, songIdForAdd, role, track, sliceIdx);
        if (isComposeInstrumentTab(track)) {
          setMasterTrackEnabled(track, true, true);
          savePersistedState();
          renderSongBuilderAndClipsUI();
        }
      });
    });

    wireTimelineLoopButtons(visualTimelineEl);
    wireTimelineDragAndClick(visualTimelineEl, '[data-tl-block]', 'data-tl-block');
  }

  function renderSectionTabs() {
    const secTabsEl = document.getElementById('fold-section-tabs');
    const performSecTabsEl = document.getElementById('fold-perform-sec-tabs');
    const playingSec = state.activeBar >= 0 ? Math.floor(state.activeBar / 4) : -1;

    if (performSecTabsEl) {
      performSecTabsEl.innerHTML = SONG_SECTIONS.map((sec) => {
        const isSelected = state.activeSection === sec.index;
        return `<button type="button" class="fold-btn ${isSelected ? 'chip-on' : ''}" data-perf-sec-idx="${sec.index}" style="border-color:${sec.color};">
          ${sec.name} (Bars ${sec.startBar + 1}–${sec.endBar + 1})
        </button>`;
      }).join('');
      performSecTabsEl.querySelectorAll('[data-perf-sec-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.activeSection = Number(btn.getAttribute('data-perf-sec-idx'));
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

    if (!secTabsEl) return;

    const activeSecObj = SONG_SECTIONS[state.activeSection] || SONG_SECTIONS[0];
    const activeInst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
    const activeMeta = getInstrumentMeta(activeInst);
    const addActiveSecBtn = document.getElementById('fold-seq-add-active-sec-btn');
    if (addActiveSecBtn) {
      addActiveSecBtn.textContent = `➕ Add "${activeSecObj.name} (4B)" → ${activeMeta.icon} ${activeMeta.shortLabel} Timeline`;
      addActiveSecBtn.style.borderColor = activeSecObj.color;
    }

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
        renderComposeTimelineBanner();
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
        renderComposeTimelineBanner();
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
      const voices = getActiveVoices(state.composeInstrument, state.selectedSongId);
      const voice = voices[vIdx] || voices[0];
      triggerInstrumentVoice(
        ctx,
        state.composeInstrument,
        voice.pitch,
        vel,
        ctx.currentTime,
        0.25,
        getKitIdForInstrument(state.composeInstrument)
      );
    }

    syncEditingTimelineBlockFromCompose();
    syncSequencerNotes();
    renderSequencerGrid();

    if (!state.suppressJamBroadcast && state.jamMode !== 'independent') {
      emitJamEvent({
        type: 'cell_edit',
        vIdx,
        stepIdx,
        cell: { ...updated }
      });
    }
    return { ...updated };
  }

  function getRemoteStepHighlightStyle(vIdx, stepIdx) {
    const key = `${vIdx}_${stepIdx}`;
    const hl = state.remoteStepHighlights[key];
    if (!hl) return '';
    if (Date.now() > hl.expires) {
      delete state.remoteStepHighlights[key];
      return '';
    }
    return `outline: 2px solid ${hl.color}; outline-offset: 1px; box-shadow: 0 0 8px ${hl.color};`;
  }

  function render4BarSectionBlock(secIdx) {
    const sec = SONG_SECTIONS[secIdx] || SONG_SECTIONS[0];
    const startBar = sec.startBar;
    const voices = getActiveVoices(state.composeInstrument, state.selectedSongId);
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

    for (let vIdx = 0; vIdx < voices.length; vIdx++) {
      const voice = voices[vIdx];
      const muted = state.mutedLanes[vIdx];
      const owned = isVoiceOwnedByCurrentPlayer(vIdx);
      const roleTag =
        state.jamMode === 'split_roles'
          ? `<span style="font-size:8px;padding:1px 3px;border-radius:3px;background:${
              owned ? 'rgba(16,185,129,0.25)' : 'rgba(231,63,246,0.2)'
            };color:${owned ? '#6ee7b7' : '#f5d0fe'};">${owned ? 'YOU' : 'PAIR'}</span>`
          : '';
      html += `
        <div class="drum-seq-row-64 ${muted ? 'muted' : ''}" style="${
          state.jamMode === 'split_roles' && !owned ? 'opacity:0.78;' : ''
        }">
          <div class="drum-lane-info">
            <button class="drum-voice-btn" data-voice-audition="${vIdx}" style="border-left: 4px solid ${voice.color};">
              ${voice.name} ${roleTag}
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
          const remoteHl = getRemoteStepHighlightStyle(vIdx, s);
          const subBadge = cell.state > 0 && cell.sub > 1 ? `<span class="sub-badge-mini">${cell.sub}</span>` : '';
          html += `
            <div class="drum-step-cell compact64 ${isBeat ? 'beat-start' : ''} ${stClass} ${s === state.activeStep ? 'playhead' : ''}"
                 data-v="${vIdx}" data-step="${s}" style="${bgStyle}${remoteHl}">
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
    const voices = getActiveVoices(state.composeInstrument, state.selectedSongId);

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

      for (let vIdx = 0; vIdx < voices.length; vIdx++) {
        const voice = voices[vIdx];
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
        const voice = voices[vIdx] || voices[0];
        triggerInstrumentVoice(
          ctx,
          state.composeInstrument,
          voice.pitch,
          118,
          ctx.currentTime,
          0.28,
          getKitIdForInstrument(state.composeInstrument)
        );
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
    renderComposeTimelineBanner();
  }

  // ==========================================================================
  // 11. Finger Drum & Bass Pads + Play-Along Overdub
  // ==========================================================================
  const activePadRepeats = {};

  function triggerFingerPad(vIdx, velocity = 118) {
    const ctx = getAudioCtx();
    const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
    const voices = getActiveVoices(inst, state.selectedSongId);
    const voice = voices[vIdx] || voices[0];
    const kitId = getKitIdForInstrument(inst);
    triggerInstrumentVoice(ctx, inst, voice.pitch, velocity, ctx.currentTime, 0.3, kitId);

    if (!state.suppressJamBroadcast) {
      emitJamEvent({
        type: 'pad_hit',
        vIdx,
        pitch: voice.pitch,
        velocity,
        kitId
      });
    }

    if (state.overdubRecord && state.phonePlayer.playing && state.activeStep >= 0) {
      const sub = state.noteRepeatRate === 0.125 ? 2 : state.noteRepeatRate === 0.1667 ? 3 : 1;
      const newCell = { state: velocity >= 115 ? 2 : 1, sub };
      state.grid[vIdx][state.activeStep] = newCell;
      syncEditingTimelineBlockFromCompose();
      syncSequencerNotes();
      renderSequencerGrid();
      if (!state.suppressJamBroadcast && state.jamMode !== 'independent') {
        emitJamEvent({
          type: 'cell_edit',
          vIdx,
          stepIdx: state.activeStep,
          cell: newCell
        });
      }
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
    const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
    const meta = getInstrumentMeta(inst);
    const { artist, song } = findSongById(getInstrumentSongId(inst));
    const bProf = ARTIST_BASS_PROFILES[artist.artistId] || ARTIST_BASS_PROFILES.zeppelin;
    const kits = getKitsForInstrument(inst);
    const kit = kits.find((k) => k.id === getKitIdForInstrument(inst)) || kits[0];
    const sec = SONG_SECTIONS[state.activeSection] || SONG_SECTIONS[0];
    const nowPlayingEl = document.getElementById('fold-now-playing-pill');
    if (nowPlayingEl && artist && song) {
      nowPlayingEl.textContent = `${artist.artistName} — ${song.title} (${state.tempo} BPM · ${meta.icon} ${meta.shortLabel} · ${sec.badge})`;
    }
    const sumArtistEl = document.getElementById('fold-summary-artist');
    if (sumArtistEl && artist && song) {
      sumArtistEl.textContent = `${artist.artistName} · ${song.title} (${state.tempo} BPM · 🥁 ${artist.drummer} / 🎸 ${bProf.bassist})`;
    }
    const sumDialsEl = document.getElementById('fold-summary-dials');
    if (sumDialsEl && kit) {
      sumDialsEl.textContent = `${kit.name} · Intensity ${state.intensityPct}% · Swing ${state.swingPct}% · Fill ${state.fillPct}%`;
    }
    const sumSeqEl = document.getElementById('fold-summary-seq');
    if (sumSeqEl) {
      sumSeqEl.textContent = `${meta.icon} ${meta.shortLabel} · ${sec.shortTitle} · Loop: ${state.loopMode === 'all16' ? '16 Bars' : state.loopMode === 'bars8' ? '8 Bars' : '4-Bar Section'}`;
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

    renderComposeInstrumentUI();
    updateHeaderSummaries();
  }

  async function autoDiscoverStudioBridge() {
    const candidates = ['http://localhost:3333', 'http://192.168.1.247:3333'];
    for (const candidate of candidates) {
      try {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = ctrl ? setTimeout(() => ctrl.abort(), 900) : null;
        const res = await fetch(`${candidate}/api/status`, ctrl ? { signal: ctrl.signal } : {});
        if (timer) clearTimeout(timer);
        if (res.ok) {
          state.bridgeUrl = candidate;
          try {
            localStorage.setItem(BRIDGE_URL_KEY, candidate);
          } catch (_) {}
          return candidate;
        }
      } catch (_) {}
    }
    return state.bridgeUrl || 'http://192.168.1.247:3333';
  }

  function renderAbletonTargetSelectors() {
    const trackSel = document.getElementById('fold-target-track-select');
    const bassTrackSel = document.getElementById('fold-target-bass-track-select');
    const slotSel = document.getElementById('fold-target-slot-select');
    const midiTracks = (state.abletonTracks || []).filter((t) => t.isMidi);

    if (trackSel) {
      const selTrackLabel = state.abletonConnected
        ? `🥁 Drums → Selected Track (#${state.abletonSelectedTrackIndex + 1}: ${state.abletonSelectedTrackName})`
        : '🥁 Drums → Selected Track in Ableton';
      const trackOptions = [
        `<option value="selected">${selTrackLabel}</option>`,
        ...midiTracks.map(
          (t) =>
            `<option value="${t.index}">🥁 Drums → Track #${t.index + 1}: ${t.name}${t.armed ? ' (● Armed)' : ''}</option>`
        )
      ];
      const prevVal = state.targetTrack;
      trackSel.innerHTML = trackOptions.join('');
      trackSel.value = trackOptions.some((o) => o.includes(`value="${prevVal}"`)) ? prevVal : 'selected';
    }
    if (bassTrackSel) {
      const bassTrackOptions = [
        `<option value="auto_bass">🎸 Bass → Auto 2nd MIDI Track (or Create Bass Track)</option>`,
        `<option value="new_midi">🎸 Bass → ➕ Create New MIDI Track in Ableton</option>`,
        ...midiTracks.map(
          (t) =>
            `<option value="${t.index}">🎸 Bass → Track #${t.index + 1}: ${t.name}${t.armed ? ' (● Armed)' : ''}</option>`
        )
      ];
      const prevBassVal = state.targetBassTrack || 'auto_bass';
      bassTrackSel.innerHTML = bassTrackOptions.join('');
      bassTrackSel.value = bassTrackOptions.some((o) => o.includes(`value="${prevBassVal}"`))
        ? prevBassVal
        : 'auto_bass';
    }
    if (slotSel) {
      const selSceneLabel = state.abletonConnected
        ? `🎯 Selected Slot (Scene ${state.abletonSelectedSceneIndex + 1})`
        : '🎯 Selected Slot in Ableton';
      const prevSlot = state.targetSlot;
      const slotOptions = [
        `<option value="selected">${selSceneLabel}</option>`,
        `<option value="artist">🗂️ Auto Slot by Artist</option>`,
        ...Array.from({ length: 8 }, (_, i) => `<option value="${i}">🎬 Scene ${i + 1}</option>`)
      ];
      slotSel.innerHTML = slotOptions.join('');
      slotSel.value = prevSlot;
    }
    updatePlayerButtons();
  }

  function configureStudioBridgeUrl() {
    const current = state.bridgeUrl || 'http://192.168.1.247:3333';
    const input = window.prompt(
      'Ableton Live 12 Studio Bridge URL (e.g. http://localhost:3333 on PC or http://192.168.1.247:3333 on Phone Wi-Fi; leave blank for pure Standalone Offline mode):',
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
      await autoDiscoverStudioBridge();
    }
    if (!state.bridgeUrl) {
      state.abletonConnected = false;
      state.bridgeReachable = false;
      if (badge) {
        badge.textContent = '📱 Standalone PWA (Tap for Studio Bridge)';
        badge.className = 'fold-badge offline';
      }
      renderAbletonTargetSelectors();
      renderCrateAndJamUI();
      return;
    }
    try {
      const res = await fetch(getApiUrl('/api/status'));
      if (!res.ok) throw new Error('status error');
      const data = await res.json();
      state.bridgeReachable = true;
      state.abletonConnected = Boolean(data.abletonOscConnected);
      if (Array.isArray(data.localMidiFiles)) {
        state.localMidiFiles = data.localMidiFiles;
      }
      if (data.session) {
        state.abletonSelectedTrackIndex = Number(data.session.selectedTrackIndex ?? 0);
        state.abletonSelectedTrackName =
          data.session.selectedTrackName || `Track ${state.abletonSelectedTrackIndex + 1}`;
        state.abletonSelectedSceneIndex = Number(data.session.selectedSceneIndex ?? 0);
        state.abletonTracks = Array.isArray(data.session.tracks) ? data.session.tracks : [];
      }
      if (badge) {
        badge.textContent = state.abletonConnected
          ? `🟢 Ableton: #${state.abletonSelectedTrackIndex + 1} "${state.abletonSelectedTrackName}"`
          : '📱 Bridge Ready (Open Ableton Live)';
        badge.className = state.abletonConnected ? 'fold-badge online' : 'fold-badge offline';
      }
      renderAbletonTargetSelectors();
      if (state.activeTab === 'arrange' || state.workspaceLayoutMode === 'all') {
        refreshAbletonTrackClips();
      }
      sendJamHeartbeat();
      if (!state.jamConnected) {
        connectLanJamStream();
      }
      if (state.studioCrate.length === 0) {
        fetch(getApiUrl('/api/crate'))
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d && Array.isArray(d.items)) {
              state.studioCrate = d.items;
              renderCrateAndJamUI();
            }
          })
          .catch(() => {});
      }
      renderCrateAndJamUI();
    } catch (e) {
      state.abletonConnected = false;
      state.bridgeReachable = false;
      if (badge) {
        badge.textContent = '📱 Standalone PWA (Offline Ready)';
        badge.className = 'fold-badge offline';
      }
      renderAbletonTargetSelectors();
      renderCrateAndJamUI();
    }
  }

  function getCombinedCrateList() {
    const map = new Map();
    for (const item of state.localCrate || []) {
      if (item && item.id) {
        map.set(item.id, { ...item, source: 'local' });
      }
    }
    for (const item of state.studioCrate || []) {
      if (item && item.id) {
        if (map.has(item.id)) {
          const prev = map.get(item.id);
          map.set(item.id, {
            ...item,
            ...prev,
            syncedToStudio: true,
            pushedToAbleton: Boolean(prev.pushedToAbleton || item.pushedToAbleton)
          });
        } else {
          map.set(item.id, { ...item, syncedToStudio: true, source: 'studio' });
        }
      }
    }
    return Array.from(map.values());
  }

  function renderArrangementChainPillsHtml(item) {
    const sections = Array.isArray(item.arrangementSections) && item.arrangementSections.length > 0
      ? item.arrangementSections
      : Array.isArray(item.mashupSongIds) && item.mashupSongIds.length === 4
      ? item.mashupSongIds.map((sid, idx) => ({
          roleId: ['verse', 'chorus', 'bridge', 'climax'][idx] || 'verse',
          songId: sid,
          bars: 4
        }))
      : null;
    if (!sections || sections.length === 0) return '';
    return `<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px;">
      ${sections
        .map((sec, idx) => {
          const roleObj = ARRANGEMENT_ROLES.find((r) => r.id === sec.roleId) || ARRANGEMENT_ROLES[1];
          const { song } = findSongById(sec.songId || item.songId || 'zep_levee');
          return `<span style="font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.06);border-left:3px solid ${roleObj.color};color:#e5e7eb;">${idx + 1}. ${roleObj.label}: ${song.title}</span>`;
        })
        .join('<span style="color:#6b7280;font-size:10px;">→</span>')}
    </div>`;
  }

  function renderCrateAndJamUI() {
    const combined = getCombinedCrateList();
    const outboxItems = (state.localCrate || []).filter((x) => x.queuedForOutbox);
    const outboxCount = outboxItems.length;
    const historyItems = state.sessionHistory || [];
    const pcMidiItems = state.localMidiFiles || [];

    // 1. Update Top Bar Outbox Button, Workspace Tab Badges & Jam Presence Pill
    const topOutboxBtn = document.getElementById('fold-top-outbox-btn');
    if (topOutboxBtn) {
      if (outboxCount > 0) {
        topOutboxBtn.style.display = 'inline-flex';
        topOutboxBtn.textContent = `📦 Push Outbox (${outboxCount}) → Ableton`;
      } else {
        topOutboxBtn.style.display = 'none';
      }
    }

    const crateBadgeEl = document.getElementById('fold-tab-badge-crate');
    if (crateBadgeEl) {
      if (outboxCount > 0) {
        crateBadgeEl.textContent = `${outboxCount} Outbox`;
        crateBadgeEl.style.background = 'rgba(245,158,11,0.28)';
        crateBadgeEl.style.color = '#fde68a';
      } else {
        crateBadgeEl.textContent = `${combined.length} Saved`;
        crateBadgeEl.style.background = 'rgba(132,220,198,0.18)';
        crateBadgeEl.style.color = '#84dcc6';
      }
    }

    const arrangeBadgeEl = document.getElementById('fold-tab-badge-arrange');
    if (arrangeBadgeEl) {
      const activeTracksCount = getActiveMasterTracks().length;
      arrangeBadgeEl.textContent = `${activeTracksCount} Trk`;
    }

    const jamPillEl = document.getElementById('fold-jam-pill');
    const peers =
      state.jamPeers && state.jamPeers.length > 0
        ? state.jamPeers
        : [
            {
              clientId: state.clientId,
              name: state.playerName,
              color: state.playerColor,
              device: state.playerDevice,
              lastActivity: 'Local Session'
            }
          ];
    if (jamPillEl) {
      const peerNames = peers
        .slice(0, 3)
        .map((p) => `<span style="color:${p.color || '#10b981'};">●</span> ${p.name}`)
        .join(' · ');
      jamPillEl.innerHTML =
        peers.length > 1
          ? `👥 ${peers.length} Collabing: ${peerNames}`
          : `⚙️ Settings & Collab (${peers.length} Online: ${peerNames})`;
    }

    const collabBadgeEl = document.getElementById('fold-tab-badge-collab');
    if (collabBadgeEl) {
      collabBadgeEl.textContent = `${peers.length} Peer${peers.length === 1 ? '' : 's'}`;
      collabBadgeEl.style.background =
        peers.length > 1 ? 'rgba(16,185,129,0.26)' : 'rgba(231,63,246,0.2)';
      collabBadgeEl.style.color = peers.length > 1 ? '#6ee7b7' : '#f5d0fe';
    }

    const sumCrateEl = document.getElementById('fold-summary-crate');
    if (sumCrateEl) {
      sumCrateEl.textContent = `${combined.length} Saved Arrangements · ${historyItems.length} Past Session History`;
    }
    const sumCollabEl = document.getElementById('fold-summary-collab');
    if (sumCollabEl) {
      sumCollabEl.textContent = `${APP_VERSION} · ${state.abletonConnected ? 'Ableton Live Connected' : state.bridgeReachable ? 'Studio Bridge Ready' : 'Offline PWA'} · ${peers.length} Peer(s)`;
    }

    // 2. Render Live Status Cards in #card-collab (Settings Tab)
    const syncStatusEl = document.getElementById('fold-settings-sync-status');
    if (syncStatusEl) {
      const modeName =
        state.jamMode === 'shared'
          ? '🤝 Shared Arrangement & 16-Bar Live Grid'
          : state.jamMode === 'split_roles'
          ? `🥁 Split Roles (${state.jamRole === 'foundation' ? 'Foundation Drums' : 'Percussion & Fills'})`
          : '📡 Independent Sandbox + Manual Beam';
      syncStatusEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#d1d5db;">
          <div><strong>Collab Sync Stream:</strong> ${
            state.jamConnected
              ? '<span style="color:#6ee7b7;font-weight:800;">🟢 Real-Time SSE Jam Stream Active</span>'
              : state.bridgeReachable
              ? '<span style="color:#fde68a;font-weight:800;">🟡 LAN Bridge Polling Active</span>'
              : '<span style="color:#f5d0fe;font-weight:800;">📱 Local Offline Storage (Auto-Syncs on Wi-Fi)</span>'
          }</div>
          <div><strong>Saved Arrangements:</strong> <span style="color:#84dcc6;font-weight:800;">${combined.length} Saved</span> · <strong>Studio Outbox Queue:</strong> <span style="color:#fbbf24;font-weight:800;">${outboxCount} Queued</span></div>
          <div><strong>Active Collab Mode:</strong> <span style="color:#fff;">${modeName}</span></div>
        </div>`;
    }

    const versionStatusEl = document.getElementById('fold-settings-version');
    if (versionStatusEl) {
      const pwaMode = isStandaloneApp() ? '📲 Installed Standalone PWA' : '🌐 Web Browser Session';
      versionStatusEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#d1d5db;">
          <div><strong>Version:</strong> <span style="color:#84dcc6;font-weight:800;">${APP_VERSION}</span></div>
          <div><strong>Sound & Groove Engine:</strong> <span style="color:#fff;">21 Iconic Bands · 105 Songs · 21 Custom Drum Kits</span></div>
          <div><strong>App Runtime:</strong> <span style="color:#f5d0fe;">${pwaMode}</span> · Offline Service Worker Cached</div>
        </div>`;
    }

    const abletonStatusEl = document.getElementById('fold-settings-ableton');
    if (abletonStatusEl) {
      const connLabel = state.abletonConnected
        ? `<span style="color:#6ee7b7;font-weight:800;">🟢 Connected to Ableton Live 12 (OSC Port 11000/11001)</span>`
        : state.bridgeReachable
        ? `<span style="color:#fde68a;font-weight:800;">🟡 Studio Bridge Reachable — Open Ableton Live 12 to Link OSC</span>`
        : `<span style="color:#f5d0fe;font-weight:800;">⚪ Not Connected (Offline Standalone Mode)</span>`;
      abletonStatusEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#d1d5db;">
          <div><strong>Status:</strong> ${connLabel}</div>
          <div><strong>Selected Ableton Track:</strong> <span style="color:#84dcc6;font-weight:800;">Track #${
            (state.abletonSelectedTrackIndex || 0) + 1
          } "${state.abletonSelectedTrackName || 'Drums'}"</span> · <strong>Scene Row:</strong> <span style="color:#fbbf24;font-weight:800;">Scene #${
        (state.abletonSelectedSceneIndex || 0) + 1
      }</span></div>
          <div><strong>Studio Bridge Endpoint:</strong> <code>${state.bridgeUrl || 'None (Standalone Offline)'}</code></div>
        </div>`;
    }
    const bridgeInputEl = document.getElementById('fold-bridge-url-input');
    if (bridgeInputEl && document.activeElement !== bridgeInputEl) {
      bridgeInputEl.value = state.bridgeUrl || '';
    }

    const wifiStatusEl = document.getElementById('fold-settings-wifi');
    if (wifiStatusEl) {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
      wifiStatusEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#d1d5db;">
          <div><strong>Device Wi-Fi / Network:</strong> ${
            isOnline
              ? '<span style="color:#6ee7b7;font-weight:800;">🟢 Online (Wi-Fi / Network Active)</span>'
              : '<span style="color:#fbbf24;font-weight:800;">🟠 Offline Mode (Composing Locally on Device)</span>'
          }</div>
          <div><strong>Studio LAN Bridge:</strong> ${
            state.bridgeReachable
              ? `<span style="color:#84dcc6;font-weight:800;">🟢 Reachable on Same Wi-Fi Network (${state.bridgeUrl})</span>`
              : `<span style="color:#9ca3af;">⚪ Not detected on current network (Outbox will queue automatically)</span>`
          }</div>
          <div><strong>Current App Host:</strong> <code>${window.location.origin}</code> (${state.playerDevice})</div>
        </div>`;
    }

    const peersListEl = document.getElementById('fold-jam-peers-list');
    if (peersListEl) {
      const isHttpsRemoteOrigin =
        window.location.protocol === 'https:' && (state.bridgeUrl || '').startsWith('http://192.');
      const switchLanBanner = isHttpsRemoteOrigin
        ? `<div style="background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.45);border-radius:8px;padding:8px 10px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
             <span style="font-size:11px;color:#e0f2fe;">⚡ <strong>Same-Network Live Jam:</strong> You are in the standalone HTTPS PWA. To see live partner cursors & two-way Wi-Fi sync on your studio LAN, open the LAN Jam Hub (your Saved Arrangements will sync automatically!):</span>
             <button type="button" id="fold-open-lan-jam-btn" class="fold-btn teal">⚡ Sync & Open Live LAN Jam (${state.bridgeUrl})</button>
           </div>`
        : '';

      const peersHtml = peers
        .map((p) => {
          const isMe = p.clientId === state.clientId;
          return `
            <div class="fold-peer-card" style="border-left: 4px solid ${p.color || '#10b981'};">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <strong style="font-size:12px;color:#fff;">
                  <span style="color:${p.color || '#10b981'};">●</span> ${p.name} ${isMe ? '(You)' : ''}
                </strong>
                <span style="font-size:10px;color:#9ca3af;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">${p.device || 'Device'}</span>
              </div>
              <div style="font-size:10px;color:#84dcc6;margin-top:3px;">
                ${p.lastActivity || 'Ready'} · Target: ${p.targetTrack === 'selected' ? '🎯 Selected Track' : `Track #${Number(p.targetTrack) + 1}`}
              </div>
            </div>`;
        })
        .join('');

      const statusMsgHtml = state.jamStatusMessage
        ? `<div style="font-size:11px;color:#fde68a;background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.35);padding:5px 9px;border-radius:6px;margin-top:6px;">${state.jamStatusMessage}</div>`
        : '';

      peersListEl.innerHTML = `${switchLanBanner}<div class="fold-peers-grid">${peersHtml}</div>${statusMsgHtml}`;

      const openLanBtn = document.getElementById('fold-open-lan-jam-btn');
      if (openLanBtn) {
        openLanBtn.addEventListener('click', () => {
          const localItems = state.localCrate || [];
          for (let i = 0; i < localItems.length; i++) {
            const compact = { ...localItems[i], grid: undefined };
            setTimeout(() => {
              sendVia204Endpoint('/api/crate/push-204', {
                item: compact,
                pushToAbleton: false
              });
            }, i * 120);
          }
          setTimeout(() => {
            window.location.href = `${(state.bridgeUrl || 'http://192.168.1.247:3333').replace(/\/+$/, '')}/?jam=1`;
          }, localItems.length * 120 + 150);
        });
      }
    }

    // Update Jam Mode & Role Buttons
    document.querySelectorAll('[data-jam-mode]').forEach((btn) => {
      btn.classList.toggle('chip-on', btn.getAttribute('data-jam-mode') === state.jamMode);
    });
    const roleWrap = document.getElementById('fold-jam-role-wrap');
    if (roleWrap) {
      roleWrap.style.display = state.jamMode === 'split_roles' ? 'flex' : 'none';
    }
    document.querySelectorAll('[data-jam-role]').forEach((btn) => {
      btn.classList.toggle('chip-on', btn.getAttribute('data-jam-role') === state.jamRole);
    });
    const hearBtn = document.getElementById('fold-hear-partner-pads-btn');
    if (hearBtn) {
      hearBtn.classList.toggle('chip-on', state.hearPartnerPads);
      hearBtn.textContent = `🔊 Hear Partner Pads: ${state.hearPartnerPads ? 'ON' : 'OFF'}`;
    }

    // 3. Update Arrangements Vault Filter Buttons & Render Past Arrangements inside #card-crate
    const vf = state.crateVaultFilter === 'crate' || state.crateVaultFilter === 'history' ? state.crateVaultFilter : 'all';
    document.querySelectorAll('[data-vault-filter]').forEach((btn) => {
      const f = btn.getAttribute('data-vault-filter');
      btn.classList.toggle('chip-on', f === vf);
      if (f === 'all') btn.textContent = `🗂️ All (${combined.length + historyItems.length})`;
      if (f === 'crate') btn.textContent = `💾 Saved Arrangements (${combined.length})`;
      if (f === 'history') btn.textContent = `🕒 Past Session History (${historyItems.length})`;
    });

    const crateSectionWrap = document.getElementById('fold-vault-crate-section');
    const historySectionWrap = document.getElementById('fold-vault-history-section');
    if (crateSectionWrap) {
      crateSectionWrap.style.display = vf === 'all' || vf === 'crate' ? 'flex' : 'none';
    }
    if (historySectionWrap) {
      historySectionWrap.style.display = vf === 'all' || vf === 'history' ? 'flex' : 'none';
    }

    const crateListEl = document.getElementById('fold-crate-items-list');
    if (crateListEl) {
      const visibleCrate = combined;

      if (visibleCrate.length === 0) {
        crateListEl.innerHTML = `
          <div style="padding:12px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.15);font-size:12px;color:#9ca3af;text-align:center;">
            📂 No saved arrangements yet. Build an arrangement in the <strong>Arrange</strong> tab and tap <strong>💾 Save Arrangement</strong>!
          </div>`;
      } else {
        crateListEl.innerHTML = visibleCrate
          .map((item) => {
            const statusBadge = item.syncedToStudio
              ? `<span style="background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid #38bdf8;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800;">💻 SYNCED</span>`
              : `<span style="background:rgba(231,63,246,0.2);color:#f5d0fe;border:1px solid #e73ff6;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800;">📱 SAVED ARRANGEMENT</span>`;

            const secCount = Array.isArray(item.arrangementSections) ? item.arrangementSections.length : 4;
            const totalBars = Array.isArray(item.arrangementSections)
              ? item.arrangementSections.reduce((acc, s) => acc + (Number(s.barsCount) || 4), 0)
              : secCount * 4;
            const chainPills = renderArrangementChainPillsHtml(item);

            return `
              <div class="fold-crate-card" data-crate-id="${item.id}">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <strong style="font-size:12px;color:#fff;">${item.title}</strong>
                    ${statusBadge}
                    <span style="font-size:10px;color:#84dcc6;font-weight:700;">${secCount} Sections (${totalBars} Bars)</span>
                    <span style="font-size:10px;color:#9ca3af;">by <span style="color:${item.authorColor || '#84dcc6'};font-weight:700;">${item.authorName || 'Producer'}</span></span>
                  </div>
                  <div class="fold-btn-row" style="gap:5px;">
                    <button type="button" class="fold-song-send-btn" data-crate-arrange="${item.id}">🎬 Load in Arrange</button>
                    <button type="button" class="fold-song-send-btn" style="border-color:#e73ff6;color:#f5d0fe;background:rgba(231,63,246,0.16);" data-crate-edit="${item.id}">🎛️ Load in Compose</button>
                    <button type="button" class="fold-song-send-btn" data-crate-load="${item.id}">▶ Play</button>
                    <button type="button" class="fold-song-send-btn" data-crate-beam="${item.id}" title="Beam this arrangement to everyone in the LAN Jam Room">📡 Beam</button>
                    <button type="button" class="fold-song-send-btn" style="border-color:#f43f5e;color:#fda4af;background:rgba(244,63,94,0.15);" data-crate-del="${item.id}">🗑️</button>
                  </div>
                </div>
                ${chainPills}
                <div style="font-size:10px;color:#9ca3af;margin-top:4px;">
                  ${item.tempo || 120} BPM · Kit: ${item.kitId || 'bonham'} · Intensity ${item.intensityPct ?? 70}% · Swing ${item.swingPct ?? 12}%
                </div>
              </div>`;
          })
          .join('');

        crateListEl.querySelectorAll('[data-crate-arrange]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-crate-arrange');
            const found = getCombinedCrateList().find((x) => x.id === id);
            if (found) {
              loadIdeaObjectIntoWorkstation(found, true);
              switchWorkspaceTab('arrange');
            }
          });
        });

        crateListEl.querySelectorAll('[data-crate-load]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-crate-load');
            const found = getCombinedCrateList().find((x) => x.id === id);
            if (found) loadIdeaObjectIntoWorkstation(found, true);
          });
        });

        crateListEl.querySelectorAll('[data-crate-edit]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-crate-edit');
            const found = getCombinedCrateList().find((x) => x.id === id);
            if (found) {
              loadIdeaObjectIntoWorkstation(found, true);
              switchWorkspaceTab('compose');
            }
          });
        });

        crateListEl.querySelectorAll('[data-crate-beam]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-crate-beam');
            const found = getCombinedCrateList().find((x) => x.id === id);
            if (!found) return;
            btn.textContent = '📡 Beaming...';
            await emitJamEvent({
              type: 'beam_groove',
              idea: found
            });
            btn.textContent = '✅ Beamed!';
            setTimeout(() => renderCrateAndJamUI(), 1200);
          });
        });

        crateListEl.querySelectorAll('[data-crate-del]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-crate-del');
            state.localCrate = (state.localCrate || []).filter((x) => x.id !== id);
            state.studioCrate = (state.studioCrate || []).filter((x) => x.id !== id);
            saveLocalCrate();
            renderCrateAndJamUI();
            if (state.bridgeReachable) {
              fetch(getApiUrl('/api/crate/delete'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
              }).catch(() => {});
            }
          });
        });
      }
    }

    // 4. Render Past Session History ("Old Stuff" Auto-Saved from Your Session)
    const historyListEl = document.getElementById('fold-history-items-list');
    if (historyListEl) {
      if (historyItems.length === 0) {
        historyListEl.innerHTML = `
          <div style="padding:10px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.14);font-size:11px;color:#9ca3af;text-align:center;">
            🕒 Arrangements and grooves you audition, tweak, or build during your session automatically appear here so you can load past ideas anytime!
          </div>`;
      } else {
        historyListEl.innerHTML = historyItems
          .map((h) => {
            const timeStr = h.createdAt
              ? new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';
            const chainPills = renderArrangementChainPillsHtml(h);
            return `
              <div class="fold-crate-card" style="border-left: 3px solid #38bdf8;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <strong style="font-size:12px;color:#fff;">${h.title}</strong>
                    <span style="background:rgba(56,189,248,0.18);color:#7dd3fc;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800;">🕒 ${h.reason || 'Session'} · ${timeStr}</span>
                  </div>
                  <div class="fold-btn-row" style="gap:5px;">
                    <button type="button" class="fold-song-send-btn" data-hist-arrange="${h.id}">🎬 Load in Arrange</button>
                    <button type="button" class="fold-song-send-btn" style="border-color:#e73ff6;color:#f5d0fe;background:rgba(231,63,246,0.16);" data-hist-edit="${h.id}">🎛️ Load in Compose</button>
                    <button type="button" class="fold-song-send-btn" data-hist-restore="${h.id}">▶ Play</button>
                    <button type="button" class="fold-song-send-btn" data-hist-save="${h.id}">💾 Save Arrangement</button>
                  </div>
                </div>
                ${chainPills}
                <div style="font-size:10px;color:#9ca3af;margin-top:3px;">
                  ${h.tempo || 120} BPM · Kit: ${h.kitId || 'bonham'} · Intensity ${h.intensityPct ?? 70}% · Swing ${h.swingPct ?? 12}%
                </div>
              </div>`;
          })
          .join('');

        historyListEl.querySelectorAll('[data-hist-arrange]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-hist-arrange');
            const found = (state.sessionHistory || []).find((x) => x.id === id);
            if (found) {
              loadIdeaObjectIntoWorkstation(found, true);
              switchWorkspaceTab('arrange');
            }
          });
        });

        historyListEl.querySelectorAll('[data-hist-restore]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-hist-restore');
            const found = (state.sessionHistory || []).find((x) => x.id === id);
            if (found) loadIdeaObjectIntoWorkstation(found, true);
          });
        });

        historyListEl.querySelectorAll('[data-hist-edit]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-hist-edit');
            const found = (state.sessionHistory || []).find((x) => x.id === id);
            if (found) {
              loadIdeaObjectIntoWorkstation(found, true);
              switchWorkspaceTab('compose');
            }
          });
        });

        historyListEl.querySelectorAll('[data-hist-save]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-hist-save');
            const found = (state.sessionHistory || []).find((x) => x.id === id);
            if (!found) return;
            loadIdeaObjectIntoWorkstation(found, false);
            await saveCurrentIdeaToCrate({ customTitle: found.title, queuedForOutbox: false });
            btn.textContent = '✅ Saved!';
            setTimeout(() => renderCrateAndJamUI(), 1200);
          });
        });
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
      body.fold-drum-fullscreen nav:not(#fold-nav-rail),
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
        height: 64px;
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
        gap: 3px;
        cursor: pointer;
        touch-action: none;
        transition: height 0.14s ease, transform 0.06s ease;
      }
      #card-pads.perform-focus-mode .fold-drum-pad {
        height: 112px;
        font-size: 15px;
        border-radius: 14px;
      }
      .fold-drum-pad span.sub-note { font-size: 10px; color: #9ca3af; font-weight: 500; }
      .fold-drum-pad.pressed {
        transform: scale(0.95);
        background: rgba(231,63,246,0.32);
        box-shadow: 0 0 16px rgba(231,63,246,0.6);
      }
      .fold-song-send-btn {
        background: rgba(132, 220, 198, 0.2);
        border: 1px solid #84dcc6;
        color: #84dcc6;
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 10px;
        font-weight: 800;
        cursor: pointer;
        white-space: nowrap;
      }
      .fold-song-send-btn:hover {
        background: rgba(132, 220, 198, 0.35);
      }
      .fold-top-select {
        height: 34px;
        background: #14151e;
        color: #84dcc6;
        border: 1px solid rgba(132, 220, 198, 0.55);
        border-radius: 8px;
        padding: 0 8px;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        max-width: 235px;
      }
      /* Responsive Navigation: Left Menu on Desktop (>=820px), Bottom Tab Bar on Mobile (<820px) */
      #fold-nav-rail {
        display: flex !important;
        box-sizing: border-box;
        background: rgba(12, 13, 20, 0.98);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        z-index: 99999 !important;
      }
      .fold-ws-tab-list {
        display: flex;
        gap: 6px;
      }
      .fold-ws-tab-btn {
        background: #181a24;
        border: 1.5px solid rgba(255, 255, 255, 0.14);
        border-radius: 10px;
        padding: 9px 11px;
        color: #d1d5db;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        text-align: left;
        touch-action: manipulation;
        transition: all 0.12s ease;
      }
      .fold-ws-tab-btn:hover {
        border-color: rgba(132, 220, 198, 0.6);
        color: #fff;
      }
      .fold-ws-tab-btn.active {
        background: linear-gradient(145deg, rgba(231, 63, 246, 0.3), rgba(13, 148, 136, 0.25));
        border-color: #e73ff6;
        color: #fff;
        box-shadow: 0 0 14px rgba(231, 63, 246, 0.38);
      }
      .fold-ws-tab-main {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .fold-ws-tab-label {
        font-size: 13px;
        font-weight: 900;
        color: inherit;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .fold-ws-tab-sub {
        font-size: 10px;
        font-weight: 600;
        color: #9ca3af;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fold-ws-tab-btn.active .fold-ws-tab-sub {
        color: #f5d0fe;
      }
      .fold-ws-tab-badge {
        font-size: 9px;
        font-weight: 900;
        padding: 2px 6px;
        border-radius: 999px;
        background: rgba(132, 220, 198, 0.18);
        color: #84dcc6;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .fold-nav-footer {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      /* Desktop Layout: Fixed Left Sidebar Menu */
      @media (min-width: 820px) {
        #fold-nav-rail {
          position: fixed;
          top: var(--fold-topbar-h, 58px);
          left: 0;
          bottom: 0;
          width: 224px;
          border-right: 1.5px solid rgba(231, 63, 246, 0.38);
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 6px 0 24px rgba(0, 0, 0, 0.65);
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        body.fold-desktop-menu-closed #fold-nav-rail {
          transform: translateX(-105%) !important;
          pointer-events: none !important;
          opacity: 0 !important;
        }
        #fold-nav-rail .fold-ws-tab-list {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }
        #fold-studio-dock {
          padding-left: 228px !important;
          transition: padding-left 0.2s ease;
        }
        body.fold-desktop-menu-closed #fold-studio-dock {
          padding-left: 0 !important;
        }
        #fold-desktop-menu-btn {
          display: inline-flex;
        }
      }

      /* Mobile Layout: Fixed Bottom Tab Bar */
      @media (max-width: 819px) {
        #fold-desktop-menu-btn,
        #fold-close-desktop-menu-btn {
          display: none !important;
        }
        #fold-nav-rail {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          border-top: 2px solid rgba(231, 63, 246, 0.55);
          padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -8px 26px rgba(0, 0, 0, 0.85);
        }
        #fold-nav-rail .fold-ws-tab-list {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
          width: 100%;
        }
        #fold-nav-rail .fold-ws-tab-btn {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 5px 2px;
          gap: 2px;
        }
        #fold-nav-rail .fold-ws-tab-main {
          align-items: center;
        }
        #fold-nav-rail .fold-ws-tab-label {
          font-size: 10px;
          gap: 2px;
        }
        #fold-nav-rail .fold-ws-tab-sub {
          display: none;
        }
        #fold-nav-rail .fold-nav-footer {
          display: none;
        }
        #fold-studio-dock {
          padding-bottom: 92px !important;
        }
      }

      .fold-peers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 8px;
      }
      .fold-peer-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 10px;
      }
      .fold-crate-card {
        background: rgba(20, 22, 32, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 9px;
        padding: 9px 11px;
        margin-bottom: 6px;
      }
      .fold-crate-input {
        height: 34px;
        background: #14151e;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 8px;
        padding: 0 10px;
        font-size: 12px;
        min-width: 220px;
        flex: 1;
      }
      .fold-mashup-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(265px, 1fr));
        gap: 10px;
      }
      .fold-clips-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
        gap: 8px;
      }
      .fold-settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(265px, 1fr));
        gap: 10px;
      }
      .fold-settings-box {
        background: rgba(0, 0, 0, 0.32);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 11px 13px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Horizontal Visual Song Arrangement Timeline & Capture Bar */
      .fold-tl-track {
        display: flex;
        align-items: stretch;
        gap: 8px;
        overflow-x: auto;
        padding: 10px 6px 12px 6px;
        background: rgba(8, 9, 14, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 10px;
      }
      .fold-tl-block {
        background: linear-gradient(160deg, #222432, #161822);
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        border-radius: 10px;
        padding: 9px 11px;
        cursor: grab;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: transform 0.1s ease, box-shadow 0.14s ease, border-color 0.14s ease, opacity 0.14s ease;
        user-select: none;
      }
      .fold-tl-block:active {
        cursor: grabbing;
      }
      .fold-tl-block:hover {
        border-color: rgba(132, 220, 198, 0.7);
      }
      .fold-tl-block.selected-tl-block {
        background: linear-gradient(160deg, rgba(231, 63, 246, 0.24), rgba(13, 148, 136, 0.18));
        border-color: #e73ff6;
        box-shadow: 0 0 14px rgba(231, 63, 246, 0.36);
      }
      .fold-tl-block.looping-tl-block {
        background: linear-gradient(160deg, rgba(245, 158, 11, 0.28), rgba(231, 63, 246, 0.22));
        border: 2px solid #f59e0b !important;
        box-shadow: 0 0 18px rgba(245, 158, 11, 0.55), inset 0 0 0 1px rgba(252, 211, 77, 0.65) !important;
      }
      .fold-tl-block.playing-tl-block {
        border-color: #84dcc6;
        box-shadow: 0 0 18px rgba(132, 220, 198, 0.55), inset 0 0 0 1px #84dcc6;
      }
      .fold-tl-block.dragging-tl-block,
      .fold-seq-card-row.dragging-tl-block {
        opacity: 0.45 !important;
        transform: scale(0.96);
      }
      .fold-tl-block.drag-over-left,
      .fold-seq-card-row.drag-over-left {
        box-shadow: -5px 0 0 0 #84dcc6, 0 0 16px rgba(132, 220, 198, 0.55) !important;
        border-left: 3px solid #84dcc6 !important;
      }
      .fold-tl-block.drag-over-right,
      .fold-seq-card-row.drag-over-right {
        box-shadow: 5px 0 0 0 #e73ff6, 0 0 16px rgba(231, 63, 246, 0.55) !important;
        border-right: 3px solid #e73ff6 !important;
      }
      .fold-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(6, 7, 12, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 100020;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        box-sizing: border-box;
        overflow-y: auto;
      }
      .fold-modal-box {
        width: 100%;
        max-width: 1120px;
        max-height: 92vh;
        overflow-y: auto;
        background: #141621;
        border: 2px solid #e73ff6;
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.88), 0 0 28px rgba(231, 63, 246, 0.35);
        color: #f4f4f6;
        box-sizing: border-box;
      }
      .fold-modal-close-x {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        min-height: 36px;
        padding: 6px 14px;
        border-radius: 9px;
        border: 2px solid #f43f5e;
        background: rgba(244, 63, 94, 0.25);
        color: #fff;
        font-size: 13px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(244, 63, 94, 0.35);
        transition: all 0.14s ease;
      }
      .fold-modal-close-x:hover {
        background: #f43f5e;
        color: #fff;
      }
      .fold-tl-needle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 3px;
        background: #84dcc6;
        box-shadow: 0 0 10px #84dcc6;
        pointer-events: none;
        z-index: 4;
      }
      .fold-timeline-capture-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        background: linear-gradient(135deg, rgba(13, 148, 136, 0.22), rgba(231, 63, 246, 0.18));
        border: 1.5px solid rgba(132, 220, 198, 0.45);
        border-radius: 10px;
        padding: 9px 12px;
      }
      .fold-timeline-toast {
        display: none;
        width: 100%;
        font-size: 12px;
        font-weight: 800;
        color: #6ee7b7;
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(16, 185, 129, 0.45);
        border-radius: 7px;
        padding: 6px 10px;
        margin-top: 4px;
      }

      .fold-group-box {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
        background: rgba(0, 0, 0, 0.34);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 9px;
        padding: 4px 8px;
      }
      .fold-group-label {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.04em;
        color: #84dcc6;
        text-transform: uppercase;
        margin-right: 2px;
      }
      .fold-step-pill {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 6px;
        background: rgba(231, 63, 246, 0.22);
        border: 1px solid rgba(231, 63, 246, 0.55);
        color: #f5d0fe;
      }
      @media (max-width: 819px) {
        #fold-nav-rail .fold-ws-tab-list {
          grid-template-columns: repeat(4, 1fr) !important;
        }
        .fold-nav-sec-header {
          display: none !important;
        }
      }
      @media (max-width: 780px) {
        #fold-section-tabs { grid-template-columns: repeat(2, 1fr); }
        #fold-4bar-minimap { grid-template-columns: repeat(4, 1fr); }
        .fold-pads-grid { grid-template-columns: repeat(2, 1fr); }
      }
    `;
    document.head.appendChild(style);

    const dock = document.createElement('section');
    dock.id = 'fold-studio-dock';
    dock.innerHTML = `
      <!-- Pinned Top Studio Transport Bar (Clean — No Ableton Clutter) -->
      <div class="fold-top-bar" id="fold-top-bar" style="padding:8px 12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;width:100%;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button type="button" id="fold-desktop-menu-btn" class="fold-btn chip-on" title="Open or Close Left Menu on Desktop">✕ Close Menu</button>
            <strong style="font-size:14px;color:#fff;">🎛️ Session Band Studio</strong>
            <span id="fold-now-playing-pill" class="fold-now-playing">🔨 Led Zeppelin — When the Levee Breaks (71 BPM · 🟢 SEC 1)</span>
          </div>
          <div class="fold-btn-row">
            <button id="fold-play-phone-btn" class="fold-btn primary">▶ Play (16 Bars)</button>
            <button type="button" id="fold-export-wav-top-btn" class="fold-btn teal" title="Compile and export your arrangement or active loop as a stereo .WAV audio file">🎧 Export .WAV</button>
            <button id="fold-install-btn" class="fold-btn amber" style="display:none;">📲 Install App</button>
          </div>
        </div>
      </div>
      <div id="fold-top-bar-spacer"></div>

      <!-- Responsive Navigation Rail: 6 Instruments + Master Timeline + Saved Songs -->
      <div id="fold-nav-rail" role="navigation" aria-label="Workspace Navigation">
        <div class="fold-ws-tab-list">
          <div class="fold-nav-sec-header" style="font-size:10px;font-weight:900;color:#84dcc6;letter-spacing:0.06em;padding:2px 4px;">1. INSTRUMENTS</div>
          <button type="button" class="fold-ws-tab-btn active" data-ws-tab="drums">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">🥁 Drums</span>
              <span class="fold-ws-tab-sub">Groove, fills & kit</span>
            </div>
            <span id="fold-tab-badge-drums" class="fold-ws-tab-badge">Drums</span>
          </button>
          <button type="button" class="fold-ws-tab-btn" data-ws-tab="bass">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">🎸 Bass</span>
              <span class="fold-ws-tab-sub">Pocket basslines & rig</span>
            </div>
            <span id="fold-tab-badge-bass" class="fold-ws-tab-badge">Bass</span>
          </button>
          <button type="button" class="fold-ws-tab-btn" data-ws-tab="keys">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">🎹 Keys</span>
              <span class="fold-ws-tab-sub">Rhodes, B3 & synth chords</span>
            </div>
            <span id="fold-tab-badge-keys" class="fold-ws-tab-badge">Keys</span>
          </button>
          <button type="button" class="fold-ws-tab-btn" data-ws-tab="guitar">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">⚡ Guitar</span>
              <span class="fold-ws-tab-sub">Funk chucks, plucks & riffs</span>
            </div>
            <span id="fold-tab-badge-guitar" class="fold-ws-tab-badge">Guitar</span>
          </button>
          <button type="button" class="fold-ws-tab-btn" data-ws-tab="horns">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">🎺 Horns</span>
              <span class="fold-ws-tab-sub">Brass stabs, swells & lines</span>
            </div>
            <span id="fold-tab-badge-horns" class="fold-ws-tab-badge">Horns</span>
          </button>
          <button type="button" class="fold-ws-tab-btn" data-ws-tab="vocal">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">🎤 Vocal</span>
              <span class="fold-ws-tab-sub">Formant lead hooks & melody</span>
            </div>
            <span id="fold-tab-badge-vocal" class="fold-ws-tab-badge">Vocal</span>
          </button>

          <div class="fold-nav-sec-header" style="font-size:10px;font-weight:900;color:#f5d0fe;letter-spacing:0.06em;padding:6px 4px 2px 4px;border-top:1px solid rgba(255,255,255,0.1);margin-top:2px;">2. MASTER ARRANGEMENT</div>
          <button type="button" class="fold-ws-tab-btn" data-ws-tab="arrange">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">🎬 Master Timeline</span>
              <span class="fold-ws-tab-sub">Multi-track song & .WAV export</span>
            </div>
            <span id="fold-tab-badge-arrange" class="fold-ws-tab-badge">0 Trk</span>
          </button>
          <button type="button" class="fold-ws-tab-btn" data-ws-tab="arrangements">
            <div class="fold-ws-tab-main">
              <span class="fold-ws-tab-label">📂 Saved Songs</span>
              <span class="fold-ws-tab-sub">Saved songs & history</span>
            </div>
            <span id="fold-tab-badge-crate" class="fold-ws-tab-badge">0 Saved</span>
          </button>
        </div>
        <div class="fold-nav-footer">
          <button type="button" id="fold-layout-mode-btn" class="fold-btn" style="width:100%;" title="Switch between focused Tab View or showing All Zones stacked">⊞ Show All Zones</button>
          <button type="button" id="fold-collapse-all-btn" class="fold-btn" style="width:100%;" title="Collapse or Expand All Panels">↕ Collapse All</button>
          <button type="button" id="fold-close-desktop-menu-btn" class="fold-btn" style="width:100%;border-color:rgba(231,63,246,0.45);color:#f5d0fe;" title="Close Left Menu on Desktop">✕ Close Menu</button>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- SEARCH & SELECT ARTIST / SONG MODAL                              -->
      <!-- ================================================================ -->
      <div id="fold-song-modal" class="fold-modal-backdrop" style="display:none;">
        <div class="fold-modal-box" style="max-width:1160px;">
          <div class="fold-card" id="card-artists" style="border:none;background:transparent;padding:0;margin:0;box-shadow:none;">
            <div class="fold-card-header" style="border-bottom:1px solid rgba(255,255,255,0.14);padding-bottom:10px;margin-bottom:8px;">
              <div class="fold-card-title-wrap" style="cursor:default;">
                <h3 id="fold-song-modal-title" style="font-size:15px;">🔍 Search & Select Artist / Song for DRUMS</h3>
                <span id="fold-summary-artist" class="fold-panel-summary">🥁 When the Levee Breaks · 71 BPM</span>
              </div>
              <div class="fold-btn-row" style="gap:6px;">
                <div class="fold-group-box">
                  <span class="fold-group-label">FOR:</span>
                  <button type="button" class="fold-btn chip-on" data-song-modal-inst="drums" style="padding:4px 8px;font-size:11px;">🥁 Drums</button>
                  <button type="button" class="fold-btn" data-song-modal-inst="bass" style="padding:4px 8px;font-size:11px;">🎸 Bass</button>
                  <button type="button" class="fold-btn" data-song-modal-inst="keys" style="padding:4px 8px;font-size:11px;">🎹 Keys</button>
                  <button type="button" class="fold-btn" data-song-modal-inst="guitar" style="padding:4px 8px;font-size:11px;">⚡ Guitar</button>
                  <button type="button" class="fold-btn" data-song-modal-inst="horns" style="padding:4px 8px;font-size:11px;">🎺 Horns</button>
                  <button type="button" class="fold-btn" data-song-modal-inst="vocal" style="padding:4px 8px;font-size:11px;">🎤 Vocal</button>
                  <button type="button" class="fold-btn" data-song-modal-inst="both" style="padding:4px 8px;font-size:11px;">🎵 All Instruments</button>
                </div>
                <button type="button" id="fold-random-groove-btn" class="fold-btn amber" title="Pick a random iconic song from all 105 songs">🎲 Random Song</button>
                <button type="button" id="fold-close-song-modal-btn" class="fold-modal-close-x" title="Close Select Song Modal (Esc)">✕ Close</button>
              </div>
            </div>
            <div class="fold-card-body">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:rgba(0,0,0,0.34);padding:8px 10px;border-radius:9px;border:1px solid rgba(255,255,255,0.1);">
                <input id="fold-song-search-input" class="fold-crate-input" type="text" placeholder="🔍 Search artist, song title, drummer, or bassist (e.g. Led Zeppelin, Daft Punk, Stevie Wonder, Tame Impala, Flea)...">
                <div class="fold-group-box">
                  <span class="fold-group-label">TEMPO:</span>
                  <button type="button" class="fold-btn chip-on" data-tempo-filter="all" style="padding:4px 8px;font-size:11px;">All (105)</button>
                  <button type="button" class="fold-btn" data-tempo-filter="slow" style="padding:4px 8px;font-size:11px;">🐢 Slow &lt;95</button>
                  <button type="button" class="fold-btn" data-tempo-filter="mid" style="padding:4px 8px;font-size:11px;">🚶 Mid 95–124</button>
                  <button type="button" class="fold-btn" data-tempo-filter="fast" style="padding:4px 8px;font-size:11px;">⚡ Fast 125+</button>
                  <button type="button" id="fold-clear-song-filter-btn" class="fold-btn" style="padding:4px 8px;font-size:11px;">✕ Clear</button>
                </div>
              </div>
              <div id="fold-song-filter-count" style="font-size:11px;color:#84dcc6;font-weight:800;">Tap any artist below, then tap any song card to select it!</div>
              <div id="fold-artist-tabs"></div>
              <div id="fold-artist-songs"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- STEP 1: SELECT ARTIST & SONG + AUDITION PLAYBACK                 -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-compose-inst" style="padding:10px 13px;display:flex;flex-direction:column;gap:9px;">
        <!-- ROW 1: STEP 1 HEADER + SEARCH & SELECT ARTIST / SONG -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="fold-step-pill">STEP 1 · ARTIST & SONG</span>
            <strong id="fold-compose-inst-title" style="font-size:14px;color:#fff;">🥁 Drums — John Bonham</strong>
            <button type="button" id="fold-open-song-modal-btn" class="fold-btn teal" style="font-size:12px;padding:7px 14px;font-weight:900;">🔍 Search & Select Artist / Song</button>
            <button type="button" id="fold-compose-random-song-btn" class="fold-btn amber" style="padding:6px 10px;font-size:11px;" title="Pick a random song for this instrument">🎲 Random Song</button>
            <button type="button" id="fold-compose-companion-summary" class="fold-btn" style="font-size:11px;padding:6px 10px;" title="Select a song for all 6 band instruments at once">🎵 Set Song for All Instruments</button>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span id="fold-compose-inst-summary" style="font-size:11px;font-weight:800;color:#84dcc6;background:rgba(0,0,0,0.4);padding:4px 10px;border-radius:7px;border:1px solid rgba(132,220,198,0.38);">🥁 Led Zeppelin — When the Levee Breaks</span>
            <span id="fold-compose-bpm-status-pill" style="font-size:11px;font-weight:800;padding:4px 10px;border-radius:7px;border:1px solid rgba(132,220,198,0.4);background:rgba(16,185,129,0.15);color:#d1fae5;">⏱️ 71 BPM</span>
          </div>
        </div>

        <!-- ROW 2: 1-TAP SAME-ARTIST SONG SWITCHER PILLS -->
        <div id="fold-compose-artist-songs-strip" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;"></div>

        <!-- ROW 3: ORGANIZED PLAYBACK & SOUND DRAWERS -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div class="fold-group-box">
              <span class="fold-group-label">LISTEN:</span>
              <button type="button" id="fold-compose-play-solo-btn" class="fold-btn teal" style="padding:5px 10px;font-size:11px;">▶ Play Solo</button>
              <button type="button" id="fold-compose-play-together-btn" class="fold-btn primary chip-on" style="padding:5px 10px;font-size:11px;">▶ Play Band</button>
            </div>
            <div class="fold-group-box" title="Choose which instruments play when 'Play Band' is active">
              <span class="fold-group-label">BAND MIX:</span>
              <button type="button" class="fold-btn chip-on" data-ensemble-toggle="drums" style="padding:3px 7px;font-size:11px;" title="Include Drums in Band playback">🥁</button>
              <button type="button" class="fold-btn chip-on" data-ensemble-toggle="bass" style="padding:3px 7px;font-size:11px;" title="Include Bass in Band playback">🎸</button>
              <button type="button" class="fold-btn" data-ensemble-toggle="keys" style="padding:3px 7px;font-size:11px;" title="Include Keys in Band playback">🎹</button>
              <button type="button" class="fold-btn" data-ensemble-toggle="guitar" style="padding:3px 7px;font-size:11px;" title="Include Guitar in Band playback">⚡</button>
              <button type="button" class="fold-btn" data-ensemble-toggle="horns" style="padding:3px 7px;font-size:11px;" title="Include Horns in Band playback">🎺</button>
              <button type="button" class="fold-btn" data-ensemble-toggle="vocal" style="padding:3px 7px;font-size:11px;" title="Include Vocal Lead in Band playback">🎤</button>
            </div>
          </div>
          <div class="fold-group-box">
            <span class="fold-group-label">SOUND & PADS:</span>
            <button type="button" id="fold-toggle-dials-drawer-btn" class="fold-btn" style="padding:4px 9px;font-size:11px;" title="Open or close Tone Shaping, Kit/Rig & Feel Dials">🎛️ Tone & Feel ▾</button>
            <button type="button" id="fold-toggle-edit-pads-btn" class="fold-btn" style="padding:4px 9px;font-size:11px;" title="Open or close Finger Pads & Live Overdub">🎹 Finger Pads ▾</button>
            <button type="button" id="fold-compose-export-wav-btn" class="fold-btn teal" style="padding:4px 9px;font-size:11px;" title="Export current loop as a .WAV audio file">🎧 Export .WAV</button>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- STEP 2: PICK SONG SECTION & EDIT PATTERN                         -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-sequencer">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap" data-toggle-card="card-sequencer">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="fold-step-pill">STEP 2 · PICK SECTION & EDIT</span>
              <h3>📊 Song Sections & Step Sequencer</h3>
            </div>
            <span id="fold-summary-seq" class="fold-panel-summary">Intro / Verse (Bars 1–4) · Loop: 16 Bars</span>
          </div>
          <div class="fold-btn-row" style="gap:6px;">
            <div class="fold-group-box">
              <span class="fold-group-label">VIEW:</span>
              <button id="fold-view-sec4-btn" class="fold-btn chip-on" style="padding:4px 8px;font-size:11px;">4-Bar Section</button>
              <button id="fold-view-zoom1-btn" class="fold-btn" style="padding:4px 8px;font-size:11px;">Zoom 1 Bar</button>
              <button id="fold-view-all16-btn" class="fold-btn" style="padding:4px 8px;font-size:11px;">All 16 Bars</button>
            </div>
            <div class="fold-group-box">
              <span class="fold-group-label">EDIT:</span>
              <button id="fold-copy-bar-btn" class="fold-btn" style="display:none;padding:4px 8px;font-size:11px;">📋 Copy Bar</button>
              <button id="fold-undo-btn" class="fold-btn" disabled style="padding:4px 8px;font-size:11px;">↩ Undo</button>
              <button id="fold-reset-groove-btn" class="fold-btn" style="padding:4px 8px;font-size:11px;" title="Restore factory 16-bar song pattern">🔄 Reset</button>
              <button id="fold-clear-all-btn" class="fold-btn" style="padding:4px 8px;font-size:11px;">🗑️ Clear</button>
            </div>
          </div>
        </div>
        <div class="fold-card-body">
          <!-- Banner shown when editing a specific Timeline Block -->
          <div id="fold-compose-editing-banner" style="display:none;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:rgba(231,63,246,0.16);border:1.5px solid #e73ff6;border-radius:10px;padding:9px 12px;"></div>

          <!-- 4 Song Section Cards: Intro/Verse, Chorus/Hook, Bridge/Break, Climax/Fill -->
          <div id="fold-section-tabs"></div>

          <!-- Prominent "Add Section to Instrument Timeline" Bar right below Section Selector -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:linear-gradient(135deg, rgba(13,148,136,0.22), rgba(231,63,246,0.18));border:1.5px solid rgba(132,220,198,0.5);border-radius:10px;padding:8px 11px;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <button type="button" id="fold-seq-add-active-sec-btn" class="fold-btn primary" style="padding:7px 14px;font-size:12px;font-weight:900;">➕ Add Selected Section (4B) → Instrument Timeline</button>
            </div>
            <div class="fold-group-box">
              <span class="fold-group-label">QUICK ADD SECTION:</span>
              <button type="button" class="fold-btn" style="border-color:#22c55e;color:#86efac;padding:4px 9px;font-size:11px;" data-quick-add-slice="0">+ 🟢 Verse (4B)</button>
              <button type="button" class="fold-btn" style="border-color:#f97316;color:#fdba74;padding:4px 9px;font-size:11px;" data-quick-add-slice="1">+ 🟠 Chorus (4B)</button>
              <button type="button" class="fold-btn" style="border-color:#38bdf8;color:#7dd3fc;padding:4px 9px;font-size:11px;" data-quick-add-slice="2">+ 🔵 Bridge (4B)</button>
              <button type="button" class="fold-btn" style="border-color:#f43f5e;color:#fda4af;padding:4px 9px;font-size:11px;" data-quick-add-slice="3">+ 🔥 Climax (4B)</button>
              <button type="button" id="fold-compose-add-1bar-btn" class="fold-btn teal" style="padding:4px 8px;font-size:11px;" title="Add 1-Bar Fill to Instrument Timeline">+ 1B Fill</button>
              <button type="button" id="fold-compose-add-16bar-btn" class="fold-btn teal" style="padding:4px 8px;font-size:11px;" title="Add all 16 Bars to Instrument Timeline">+ Full 16B</button>
            </div>
          </div>

          <!-- Grouped Loop Mode & Step Brush Toolbar -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
            <div class="fold-group-box">
              <span class="fold-group-label">LOOP:</span>
              <button class="fold-btn chip-on" data-loop-mode="all16" style="padding:4px 8px;font-size:11px;">🔁 16 Bars</button>
              <button class="fold-btn" data-loop-mode="bars8" style="padding:4px 8px;font-size:11px;">🔁 8 Bars</button>
              <button class="fold-btn" data-loop-mode="section4" style="padding:4px 8px;font-size:11px;">🔒 4-Bar Section</button>
              <button id="fold-autofollow-btn" class="fold-btn chip-on" style="padding:4px 8px;font-size:11px;">👁️ Follow: ON</button>
            </div>
            <div class="fold-group-box">
              <span class="fold-group-label">STEP BRUSH:</span>
              <button class="fold-btn chip-on" data-brush="normal" style="padding:4px 8px;font-size:11px;">● Normal</button>
              <button class="fold-btn" data-brush="accent" style="padding:4px 8px;font-size:11px;">🔥 Accent</button>
              <button class="fold-btn" data-brush="ghost" style="padding:4px 8px;font-size:11px;">👻 Ghost</button>
              <button class="fold-btn" data-brush="roll2" style="padding:4px 8px;font-size:11px;">⚡ 32nd (2x)</button>
              <button class="fold-btn" data-brush="roll3" style="padding:4px 8px;font-size:11px;">⚡ Triplet (3x)</button>
            </div>
          </div>

          <!-- 16-Bar Mini-Map -->
          <div id="fold-4bar-minimap"></div>

          <!-- Step Grid -->
          <div id="fold-sequencer-grid"></div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- STEP 3: INSTRUMENT TIMELINE → SEND TO MASTER TIMELINE            -->
      <!-- ================================================================ -->
      <div class="fold-card" id="fold-primary-timeline-strip" style="padding:10px 13px;gap:8px;background:rgba(14,16,24,0.96);border:2px solid rgba(132,220,198,0.5);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span id="fold-primary-tl-track-label" style="font-size:13px;font-weight:900;color:#84dcc6;">STEP 3 · 🥁 DRUMS TIMELINE (0 Sections · 0 Bars)</span>
            <span id="fold-primary-tl-master-badge" style="font-size:10px;font-weight:900;padding:3px 9px;border-radius:999px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.06);color:#9ca3af;">⚪ Not Yet Sent to Master Timeline</span>
            <span style="font-size:11px;color:#9ca3af;">✋ Drag blocks to reorder · Tap any block to edit sequence</span>
          </div>
          <div class="fold-btn-row" style="gap:6px;">
            <button type="button" id="fold-primary-strip-play-btn" class="fold-btn teal" style="padding:6px 11px;font-size:11px;">▶ Play Drums Timeline</button>
            <button type="button" id="fold-primary-strip-clear-btn" class="fold-btn" style="padding:6px 10px;font-size:11px;" title="Clear all sections from this instrument's timeline">🧹 Clear</button>
            <button type="button" id="fold-send-inst-to-master-btn" class="fold-btn primary" style="padding:7px 14px;font-size:12px;font-weight:900;box-shadow:0 0 16px rgba(231,63,246,0.45);">🚀 Send 🥁 Drums Timeline → Master Timeline</button>
            <button type="button" id="fold-compose-go-arrange-btn" class="fold-btn" style="padding:6px 11px;font-size:11px;border-color:#e73ff6;color:#f5d0fe;">🎬 Open Master Timeline →</button>
          </div>
        </div>
        <div id="fold-primary-tl-track-row" class="fold-tl-track" style="padding:8px;gap:8px;"></div>
        <div class="fold-timeline-toast"></div>
      </div>

      <!-- ================================================================ -->
      <!-- DRAWER 1: TONE SHAPING, KIT/PATCH & FEEL DIALS                   -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-dials" style="display:none;border-color:rgba(231,63,246,0.45);">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap">
            <h3>🎛️ Tone & Feel Drawer</h3>
            <span id="fold-summary-dials" class="fold-panel-summary">Intensity 70% · Swing 8% · Fill 65%</span>
          </div>
          <div class="fold-btn-row">
            <label for="fold-kit-select" style="font-size:11px;font-weight:800;color:#84dcc6;">PATCH:</label>
            <select id="fold-kit-select" class="fold-select">
              ${DRUM_KITS.map((k) => `<option value="${k.id}">${k.name}</option>`).join('')}
            </select>
            <button type="button" id="fold-toggle-fine-dials-btn" class="fold-btn" title="Show or hide Fine-Tune dials (Ghost Notes, High Energy, Pocket)">⚙️ Fine-Tune</button>
            <button type="button" id="fold-close-dials-drawer-btn" class="fold-btn">✕ Hide Drawer</button>
          </div>
        </div>
        <div class="fold-card-body">
          <div class="fold-dials-grid">
            <div class="fold-dial-box">
              <label><span>⏱️ Tempo (BPM)</span><span id="val-bpm" class="dial-val">71 BPM</span></label>
              <input id="dial-bpm" type="range" min="50" max="200" step="1" value="71">
            </div>
            <div class="fold-dial-box">
              <label><span>🔥 Groove Intensity</span><span id="val-intensity" class="dial-val">70%</span></label>
              <input id="dial-intensity" type="range" min="10" max="100" step="5" value="70">
            </div>
            <div class="fold-dial-box">
              <label><span>🥁 Turnaround Fills</span><span id="val-fill" class="dial-val">65%</span></label>
              <input id="dial-fill" type="range" min="0" max="100" step="5" value="65">
            </div>
            <div class="fold-dial-box">
              <label><span>🕰️ Groove Swing</span><span id="val-swing" class="dial-val">8%</span></label>
              <input id="dial-swing" type="range" min="0" max="65" step="1" value="8">
            </div>
          </div>

          <div id="fold-fine-tune-dials-wrap" class="fold-dials-grid" style="display:none;margin-top:4px;border-color:rgba(231,63,246,0.3);">
            <div class="fold-dial-box">
              <label><span>👻 Ghost Notes & Detail</span><span id="val-ghost" class="dial-val">45%</span></label>
              <input id="dial-ghost" type="range" min="0" max="100" step="5" value="45">
            </div>
            <div class="fold-dial-box">
              <label><span>🎩 High / Octave Energy</span><span id="val-hats" class="dial-val">60%</span></label>
              <input id="dial-hats" type="range" min="10" max="100" step="5" value="60">
            </div>
            <div class="fold-dial-box">
              <label><span>🍯 Layback / Pocket</span><span id="val-pocket" class="dial-val">25%</span></label>
              <input id="dial-pocket" type="range" min="0" max="100" step="2" value="25">
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- DRAWER 2: PLAY OVER IT WITH FINGER PADS                          -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-pads" style="display:none;border-color:rgba(132,220,198,0.45);">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap">
            <h3>🎹 Finger Pads & Live Overdub Drawer (Keys 1–8)</h3>
            <span id="fold-perform-hud-pill" class="fold-panel-summary" style="border:1px solid rgba(255,255,255,0.2);">⏸ Ready (🟢 SEC 1: Intro / Verse)</span>
          </div>
          <div class="fold-btn-row">
            <button type="button" id="fold-pads-play-btn" class="fold-btn primary">▶ Play Groove to Jam Over</button>
            <button id="fold-overdub-btn" class="fold-btn">⏺ Record Pads into Loop: OFF</button>
            <span style="font-size:11px;font-weight:700;color:#9ca3af;">REPEAT:</span>
            <button class="fold-btn chip-on" data-repeat="0">Off</button>
            <button class="fold-btn" data-repeat="0.5">1/8</button>
            <button class="fold-btn" data-repeat="0.25">1/16</button>
            <button class="fold-btn" data-repeat="0.1667">1/16T</button>
            <button class="fold-btn" data-repeat="0.125">1/32</button>
            <button type="button" id="fold-tall-pads-btn" class="fold-btn" title="Expand pad height for two-handed playing">↕ Tall Pads: OFF</button>
            <button type="button" id="fold-close-pads-drawer-btn" class="fold-btn">✕ Hide Drawer</button>
          </div>
        </div>
        <div class="fold-card-body">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:rgba(0,0,0,0.25);padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
            <div class="fold-btn-row" id="fold-perform-sec-tabs"></div>
            <div class="fold-btn-row">
              <button type="button" id="fold-change-song-from-pads-btn" class="fold-btn">🎵 Pick Another Song ↑</button>
            </div>
          </div>

          <div id="fold-mpc-pads" class="fold-pads-grid">
            ${DRUM_VOICES.map(
              (v, idx) => `
              <div class="fold-drum-pad" data-pad-idx="${idx}" style="border-bottom: 4px solid ${v.color};">
                <span>${v.name}</span>
                <span class="sub-note">Key [${idx + 1}] · Tap / Hold Roll</span>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- TAB: MASTER TIMELINE (MULTI-TRACK ARRANGEMENT & .WAV EXPORT)     -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-builder">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap" data-toggle-card="card-builder">
            <h3>🎬 Master Timeline — Multi-Track Song Arrangement</h3>
            <span id="fold-summary-arrange" class="fold-panel-summary">Build an Instrument Timeline and tap "🚀 Send to Master Timeline"</span>
          </div>
          <div class="fold-btn-row">
            <button type="button" id="fold-arrange-export-wav-btn" class="fold-btn teal" style="font-weight:900;border-color:#84dcc6;" title="Render and download the Master Timeline as a stereo .WAV audio file">🎧 Export Master .WAV</button>
            <button type="button" id="fold-random-mashup-btn" class="fold-btn amber" title="Generate a random 4-section band arrangement across all instruments">🎲 Random Song Mashup</button>
            <button type="button" id="fold-timeline-clear-btn" class="fold-btn" title="Clear all tracks from the Master Timeline">🧹 Clear Master Timeline</button>
          </div>
        </div>
        <div class="fold-card-body">
          <!-- Master Timeline Transport & Global BPM Bar -->
          <div style="background:linear-gradient(135deg, rgba(231,63,246,0.18), rgba(13,148,136,0.18));border:1.5px solid rgba(231,63,246,0.45);border-radius:11px;padding:11px 13px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div class="fold-btn-row" style="gap:6px;">
              <button type="button" id="fold-timeline-play-btn" class="fold-btn primary" style="font-size:13px;padding:8px 16px;">▶ Play Master Timeline</button>
              <button type="button" id="fold-timeline-loop-mode-btn" class="fold-btn">🔁 Loop: Full Master Timeline</button>
              <button type="button" id="fold-disable-sec-loop-btn" class="fold-btn amber" style="display:none;border-color:#f59e0b;background:rgba(245,158,11,0.28);color:#fff;font-weight:900;">✕ Disable Section Loop</button>
              <span id="fold-timeline-hud-pill" class="fold-panel-summary" style="border:1px solid rgba(255,255,255,0.2);font-size:12px;">⏸ Ready</span>
            </div>

            <div class="fold-group-box" style="padding:6px 10px;">
              <strong style="font-size:12px;color:#84dcc6;">⏱️ Master BPM:</strong>
              <span id="fold-timeline-bpm-val" style="font-size:13px;font-weight:900;color:#fff;background:rgba(132,220,198,0.2);padding:2px 8px;border-radius:6px;border:1px solid #84dcc6;">71 BPM</span>
              <input id="fold-timeline-bpm-slider" type="range" min="50" max="200" step="1" value="71" style="width:150px;accent-color:#84dcc6;cursor:pointer;" title="Master Timeline Tempo (BPM)">
              <span id="fold-timeline-bpm-source" style="font-size:11px;color:#d1d5db;font-weight:700;">Set by 1st section</span>
            </div>
          </div>

          <!-- Multi-Track Master Timeline Lanes -->
          <div style="background:rgba(0,0,0,0.32);border:1px solid rgba(255,255,255,0.11);border-radius:11px;padding:11px 13px;display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <div>
                <strong style="font-size:13px;color:#fff;">📏 Master Timeline Tracks (✋ Drag Blocks to Reorder · 🎹 Tap Any Block to Edit Notes)</strong>
                <span style="font-size:11px;color:#9ca3af;margin-left:8px;">All tracks sent to the Master Timeline play together in sync</span>
              </div>
            </div>
            <div id="fold-visual-timeline" class="fold-tl-track"></div>
            <div class="fold-timeline-toast"></div>
          </div>

          <!-- Save Master Song Arrangement -->
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
            <input id="fold-arrange-title-input" class="fold-crate-input" type="text" placeholder="Song Arrangement Name (optional — e.g. My Funk Jam)">
            <div class="fold-btn-row">
              <button type="button" id="fold-builder-save-crate-btn" class="fold-btn primary">💾 Save Song Arrangement</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- TAB: SAVED SONGS & SESSION HISTORY                               -->
      <!-- ================================================================ -->
      <div class="fold-card" id="card-crate">
        <div class="fold-card-header">
          <div class="fold-card-title-wrap" data-toggle-card="card-crate">
            <h3>📂 Saved Songs & Session History</h3>
            <span id="fold-summary-crate" class="fold-panel-summary">0 Saved Arrangements · 0 Past Session History</span>
          </div>
          <div class="fold-btn-row">
            <button type="button" class="fold-btn chip-on" data-vault-filter="all">🗂️ All</button>
            <button type="button" class="fold-btn" data-vault-filter="crate">💾 Saved Songs</button>
            <button type="button" class="fold-btn" data-vault-filter="history">🕒 Session History</button>
          </div>
        </div>
        <div class="fold-card-body">
          <div id="fold-vault-crate-section" style="background:rgba(0,0,0,0.28);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <strong style="font-size:12px;color:#84dcc6;">💾 Saved Songs</strong>
              <span style="font-size:11px;color:#9ca3af;">Load any saved song into the <strong>Master Timeline</strong> or an <strong>Instrument Tab</strong>!</span>
            </div>

            <div class="fold-btn-row" style="gap:8px;">
              <input id="fold-crate-title-input" class="fold-crate-input" type="text" placeholder="Save Current Song As (optional — defaults to Artist + Song + BPM)">
              <button type="button" id="fold-save-crate-btn" class="fold-btn primary">💾 Save Current Song</button>
            </div>

            <div id="fold-crate-items-list"></div>
          </div>

          <div id="fold-vault-history-section" style="background:rgba(0,0,0,0.28);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <div>
                <strong style="font-size:12px;color:#38bdf8;">🕒 Session History (Auto-Saved Changes)</strong>
                <span style="font-size:11px;color:#9ca3af;margin-left:8px;">Every groove or timeline change is logged here so you can reload earlier versions anytime.</span>
              </div>
              <button type="button" id="fold-clear-history-btn" class="fold-btn">🧹 Clear History</button>
            </div>
            <div id="fold-history-items-list"></div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- SECTION SEQUENCE EDITOR MODAL (Click any Timeline Section)       -->
      <!-- ================================================================ -->
      <div id="fold-section-modal" class="fold-modal-backdrop" style="display:none;">
        <div id="fold-section-modal-content" class="fold-modal-box"></div>
      </div>
    `;
    document.body.appendChild(dock);

    // Keep #fold-top-bar-spacer and CSS variable --fold-topbar-h synced with fixed #fold-top-bar
    const topBarEl = document.getElementById('fold-top-bar');
    const topSpacerEl = document.getElementById('fold-top-bar-spacer');
    const syncTopBarSpacer = () => {
      if (topBarEl && topSpacerEl) {
        const h = Math.max(54, topBarEl.offsetHeight);
        topSpacerEl.style.height = `${h + 6}px`;
        document.documentElement.style.setProperty('--fold-topbar-h', `${h}px`);
      }
    };
    syncTopBarSpacer();
    if (typeof ResizeObserver !== 'undefined' && topBarEl) {
      new ResizeObserver(syncTopBarSpacer).observe(topBarEl);
    }
    window.addEventListener('resize', syncTopBarSpacer);

    // Wire Up Desktop Left Menu Close / Toggle Buttons
    const setDesktopMenuClosed = (closed) => {
      state.desktopMenuClosed = Boolean(closed);
      document.body.classList.toggle('fold-desktop-menu-closed', state.desktopMenuClosed);
      const menuBtn = document.getElementById('fold-desktop-menu-btn');
      if (menuBtn) {
        menuBtn.textContent = state.desktopMenuClosed ? '☰ Menu' : '✕ Close Menu';
        menuBtn.classList.toggle('chip-on', !state.desktopMenuClosed);
      }
      savePersistedState();
    };

    const desktopMenuBtn = document.getElementById('fold-desktop-menu-btn');
    if (desktopMenuBtn) {
      desktopMenuBtn.addEventListener('click', () => {
        setDesktopMenuClosed(!state.desktopMenuClosed);
      });
    }
    const closeDesktopMenuBtn = document.getElementById('fold-close-desktop-menu-btn');
    if (closeDesktopMenuBtn) {
      closeDesktopMenuBtn.addEventListener('click', () => {
        setDesktopMenuClosed(true);
      });
    }

    // Wire Up Section Sequence Editor Modal & Song Picker Modal Backdrop & Escape Key
    const sectionModalBackdrop = document.getElementById('fold-section-modal');
    if (sectionModalBackdrop) {
      sectionModalBackdrop.addEventListener('click', (e) => {
        if (e.target === sectionModalBackdrop) {
          closeSectionSequenceModal();
        }
      });
    }
    const songModalBackdrop = document.getElementById('fold-song-modal');
    if (songModalBackdrop) {
      songModalBackdrop.addEventListener('click', (e) => {
        if (e.target === songModalBackdrop) {
          closeSongSelectModal();
        }
      });
    }
    const closeSongModalBtn = document.getElementById('fold-close-song-modal-btn');
    if (closeSongModalBtn) {
      closeSongModalBtn.addEventListener('click', () => {
        closeSongSelectModal();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.songModalOpen) {
          closeSongSelectModal();
        } else if (state.modalSectionIdx !== null) {
          closeSectionSequenceModal();
        }
      }
    });

    // ========================================================================
    // Wire Up 5 Workspace Tabs (Drums, Bass, Arrange, Arrangements, Settings)
    // ========================================================================
    dock.querySelectorAll('[data-ws-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tid = btn.getAttribute('data-ws-tab');
        if (state.workspaceLayoutMode === 'all') {
          state.workspaceLayoutMode = 'tabs';
        }
        switchWorkspaceTab(tid);
      });
    });

    const layoutModeBtn = document.getElementById('fold-layout-mode-btn');
    if (layoutModeBtn) {
      layoutModeBtn.addEventListener('click', () => {
        state.workspaceLayoutMode = state.workspaceLayoutMode === 'all' ? 'tabs' : 'all';
        savePersistedState();
        applyWorkspaceTabVisibility();
      });
    }

    // Wire Up Compose Instrument Switcher (Drums vs Bass), Song Modal Openers & Solo / Together Playback Controls
    dock.querySelectorAll('[data-compose-inst]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-compose-inst');
        setComposeInstrument(inst);
      });
    });

    const openSongModalBtn = document.getElementById('fold-open-song-modal-btn');
    if (openSongModalBtn) {
      openSongModalBtn.addEventListener('click', () => {
        openSongSelectModal(state.composeInstrument);
      });
    }

    const composeCompanionSummaryBtn = document.getElementById('fold-compose-companion-summary');
    if (composeCompanionSummaryBtn) {
      composeCompanionSummaryBtn.addEventListener('click', () => {
        openSongSelectModal('both');
      });
    }

    dock.querySelectorAll('[data-ensemble-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = btn.getAttribute('data-ensemble-toggle');
        if (!state.composeEnsemble || typeof state.composeEnsemble !== 'object') {
          state.composeEnsemble = {
            drums: true,
            bass: true,
            keys: false,
            guitar: false,
            horns: false,
            vocal: false
          };
        }
        state.composeEnsemble[inst] = !state.composeEnsemble[inst];
        state.playBothInCompose = true;
        savePersistedState();
        renderComposeInstrumentUI();
        updatePlayerButtons();
      });
    });

    const toggleDialsDrawerBtn = document.getElementById('fold-toggle-dials-drawer-btn');
    if (toggleDialsDrawerBtn) {
      toggleDialsDrawerBtn.addEventListener('click', () => {
        state.showDialsDrawer = !state.showDialsDrawer;
        savePersistedState();
        applyWorkspaceTabVisibility();
      });
    }

    const closeDialsDrawerBtn = document.getElementById('fold-close-dials-drawer-btn');
    if (closeDialsDrawerBtn) {
      closeDialsDrawerBtn.addEventListener('click', () => {
        state.showDialsDrawer = false;
        savePersistedState();
        applyWorkspaceTabVisibility();
      });
    }

    const closePadsDrawerBtn = document.getElementById('fold-close-pads-drawer-btn');
    if (closePadsDrawerBtn) {
      closePadsDrawerBtn.addEventListener('click', () => {
        state.showInlinePadsInEdit = false;
        savePersistedState();
        applyWorkspaceTabVisibility();
      });
    }

    const exportWavTopBtn = document.getElementById('fold-export-wav-top-btn');
    if (exportWavTopBtn) {
      exportWavTopBtn.addEventListener('click', () => {
        const mode = state.activeTab === 'arrange' ? 'timeline' : 'compose';
        exportArrangementToWavFile(mode, exportWavTopBtn);
      });
    }

    const composeExportWavBtn = document.getElementById('fold-compose-export-wav-btn');
    if (composeExportWavBtn) {
      composeExportWavBtn.addEventListener('click', () => {
        exportArrangementToWavFile('compose', composeExportWavBtn);
      });
    }

    const arrangeExportWavBtn = document.getElementById('fold-arrange-export-wav-btn');
    if (arrangeExportWavBtn) {
      arrangeExportWavBtn.addEventListener('click', () => {
        exportArrangementToWavFile('timeline', arrangeExportWavBtn);
      });
    }

    const composeRandomSongBtn = document.getElementById('fold-compose-random-song-btn');
    if (composeRandomSongBtn) {
      composeRandomSongBtn.addEventListener('click', () => {
        const allSongs = [];
        for (const a of ARTIST_CATALOG) {
          for (const s of a.songs) allSongs.push(s.id);
        }
        const pick = allSongs[Math.floor(Math.random() * allSongs.length)];
        pushUndoState();
        loadSongGroove(pick, true, state.composeInstrument);
      });
    }

    const composeSwitchInstTabBtn = document.getElementById('fold-compose-switch-inst-tab-btn');
    if (composeSwitchInstTabBtn) {
      composeSwitchInstTabBtn.addEventListener('click', () => {
        const nextTab = state.composeInstrument === 'bass' ? 'drums' : 'bass';
        switchWorkspaceTab(nextTab);
      });
    }

    const composePlaySoloBtn = document.getElementById('fold-compose-play-solo-btn');
    if (composePlaySoloBtn) {
      composePlaySoloBtn.addEventListener('click', () => {
        const isPlayingSoloNow =
          state.phonePlayer.playing && state.playbackMode !== 'timeline' && !state.playBothInCompose;
        if (isPlayingSoloNow) {
          stopPhonePlayback();
        } else {
          state.playBothInCompose = false;
          renderComposeInstrumentUI();
          savePersistedState();
          if (!state.phonePlayer.playing || state.playbackMode === 'timeline') {
            startPhonePlayback('compose');
          } else {
            updatePlayerButtons();
          }
        }
      });
    }

    const composePlayTogetherBtn = document.getElementById('fold-compose-play-together-btn');
    if (composePlayTogetherBtn) {
      composePlayTogetherBtn.addEventListener('click', () => {
        const isPlayingBothNow =
          state.phonePlayer.playing && state.playbackMode !== 'timeline' && state.playBothInCompose;
        if (isPlayingBothNow) {
          stopPhonePlayback();
        } else {
          state.playBothInCompose = true;
          renderComposeInstrumentUI();
          savePersistedState();
          if (!state.phonePlayer.playing || state.playbackMode === 'timeline') {
            startPhonePlayback('compose');
          } else {
            updatePlayerButtons();
          }
        }
      });
    }

    const composePlayBothBtn = document.getElementById('fold-compose-play-both-btn');
    if (composePlayBothBtn) {
      composePlayBothBtn.addEventListener('click', () => {
        state.playBothInCompose = !state.playBothInCompose;
        renderComposeInstrumentUI();
        savePersistedState();
      });
    }

    // Wire Up Search, Tempo Filter, Instrument Target Pills & Random Groove in Select Song Modal
    dock.querySelectorAll('[data-song-modal-inst]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.songModalInstrument = btn.getAttribute('data-song-modal-inst') || 'drums';
        state.songModalArtistBrowseId = null;
        renderArtistTabsAndSongs();
      });
    });

    const songSearchInput = document.getElementById('fold-song-search-input');
    if (songSearchInput) {
      songSearchInput.addEventListener('input', (e) => {
        state.songSearchQuery = e.target.value;
        renderArtistTabsAndSongs();
      });
    }

    dock.querySelectorAll('[data-tempo-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.songTempoFilter = btn.getAttribute('data-tempo-filter');
        renderArtistTabsAndSongs();
      });
    });

    const clearSongFilterBtn = document.getElementById('fold-clear-song-filter-btn');
    if (clearSongFilterBtn) {
      clearSongFilterBtn.addEventListener('click', () => {
        state.songSearchQuery = '';
        state.songTempoFilter = 'all';
        if (songSearchInput) songSearchInput.value = '';
        renderArtistTabsAndSongs();
      });
    }

    const randomGrooveBtn = document.getElementById('fold-random-groove-btn');
    if (randomGrooveBtn) {
      randomGrooveBtn.addEventListener('click', () => {
        const allSongs = [];
        for (const a of ARTIST_CATALOG) {
          for (const s of a.songs) allSongs.push(s.id);
        }
        const pick = allSongs[Math.floor(Math.random() * allSongs.length)];
        pushUndoState();
        loadSongGroove(pick, true, state.songModalInstrument || state.composeInstrument);
        closeSongSelectModal();
      });
    }

    const toggleFineDialsBtn = document.getElementById('fold-toggle-fine-dials-btn');
    const fineTuneWrap = document.getElementById('fold-fine-tune-dials-wrap');
    if (toggleFineDialsBtn && fineTuneWrap) {
      toggleFineDialsBtn.addEventListener('click', () => {
        state.showFineTuneDials = !state.showFineTuneDials;
        fineTuneWrap.style.display = state.showFineTuneDials ? 'grid' : 'none';
        toggleFineDialsBtn.classList.toggle('chip-on', state.showFineTuneDials);
      });
    }

    const toggleEditPadsBtn = document.getElementById('fold-toggle-edit-pads-btn');
    if (toggleEditPadsBtn) {
      toggleEditPadsBtn.addEventListener('click', () => {
        state.showInlinePadsInEdit = !state.showInlinePadsInEdit;
        savePersistedState();
        applyWorkspaceTabVisibility();
      });
    }

    const tallPadsBtn = document.getElementById('fold-tall-pads-btn');
    if (tallPadsBtn) {
      tallPadsBtn.addEventListener('click', () => {
        state.tallPadsInCompose = !state.tallPadsInCompose;
        applyWorkspaceTabVisibility();
      });
    }

    const changeSongFromPadsBtn = document.getElementById('fold-change-song-from-pads-btn');
    if (changeSongFromPadsBtn) {
      changeSongFromPadsBtn.addEventListener('click', () => {
        openSongSelectModal(state.composeInstrument);
      });
    }

    // Wire Up Step 2 & Step 3: Add Section to Instrument Timeline + Send Instrument Timeline to Master Timeline
    const seqAddActiveSecBtn = document.getElementById('fold-seq-add-active-sec-btn');
    if (seqAddActiveSecBtn) {
      seqAddActiveSecBtn.addEventListener('click', () => {
        const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
        const secIdx = Math.max(0, Math.min(3, Number(state.activeSection) || 0));
        const roles = ['verse', 'chorus', 'bridge', 'climax'];
        addComposeToTimeline(4, getInstrumentSongId(inst), roles[secIdx] || 'verse', inst, secIdx);
      });
    }

    dock.querySelectorAll('[data-quick-add-slice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
        const sliceIdx = Math.max(0, Math.min(3, Number(btn.getAttribute('data-quick-add-slice')) || 0));
        const roles = ['verse', 'chorus', 'bridge', 'climax'];
        addComposeToTimeline(4, getInstrumentSongId(inst), roles[sliceIdx] || 'verse', inst, sliceIdx);
      });
    });

    const bindAddTimelineBtn = (btnId, barsCount) => {
      const el = document.getElementById(btnId);
      if (el) {
        el.addEventListener('click', () => {
          addComposeToTimeline(barsCount);
        });
      }
    };
    bindAddTimelineBtn('fold-compose-add-1bar-btn', 1);
    bindAddTimelineBtn('fold-compose-add-4bar-btn', 4);
    bindAddTimelineBtn('fold-compose-add-16bar-btn', 16);

    const primaryStripPlayBtn = document.getElementById('fold-primary-strip-play-btn');
    if (primaryStripPlayBtn) {
      primaryStripPlayBtn.addEventListener('click', () => {
        const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
        const arr = getTrackSections(inst) || [];
        if (arr.length === 0) {
          showTimelineToast(`➕ Add at least 1 section to your ${getInstrumentMeta(inst).label} Timeline first!`);
          return;
        }
        const isPlayingInstTl =
          state.phonePlayer.playing &&
          state.playbackMode === 'timeline' &&
          state.timelinePlayScope === inst;
        if (isPlayingInstTl) {
          stopPhonePlayback();
        } else {
          startPhonePlayback('timeline', inst);
        }
      });
    }

    const primaryStripClearBtn = document.getElementById('fold-primary-strip-clear-btn');
    if (primaryStripClearBtn) {
      primaryStripClearBtn.addEventListener('click', () => {
        clearInstrumentTimeline(state.composeInstrument);
      });
    }

    const sendInstToMasterBtn = document.getElementById('fold-send-inst-to-master-btn');
    if (sendInstToMasterBtn) {
      sendInstToMasterBtn.addEventListener('click', () => {
        const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
        const alreadySynced =
          isMasterTrackEnabled(inst) &&
          Boolean(state.masterTrackSynced && state.masterTrackSynced[inst]) &&
          (getTrackSections(inst) || []).length > 0;
        sendInstrumentTimelineToMaster(inst, alreadySynced);
      });
    }

    const goArrangeFromCompose = () => {
      syncEditingTimelineBlockFromCompose();
      switchWorkspaceTab('arrange');
    };
    const composeGoArrangeBtn = document.getElementById('fold-compose-go-arrange-btn');
    if (composeGoArrangeBtn) composeGoArrangeBtn.addEventListener('click', goArrangeFromCompose);

    // Wire Up Master Timeline Tab: Playback, Loop Mode & Clear
    const timelinePlayBtn = document.getElementById('fold-timeline-play-btn');
    if (timelinePlayBtn) {
      timelinePlayBtn.addEventListener('click', () => {
        const activeMaster = getActiveMasterTracks();
        if (activeMaster.length === 0) {
          showTimelineToast('🎬 Send at least 1 Instrument Timeline to the Master Timeline first!');
          return;
        }
        const isPlayingMaster =
          state.phonePlayer.playing &&
          state.playbackMode === 'timeline' &&
          state.timelinePlayScope === 'master';
        if (isPlayingMaster) {
          stopPhonePlayback();
        } else {
          startPhonePlayback('timeline', 'master');
        }
      });
    }

    const timelineLoopModeBtn = document.getElementById('fold-timeline-loop-mode-btn');
    if (timelineLoopModeBtn) {
      timelineLoopModeBtn.addEventListener('click', () => {
        state.timelineLoopSingle = !state.timelineLoopSingle;
        if (state.phonePlayer.playing && state.playbackMode === 'timeline') {
          const ctx = getAudioCtx();
          state.phonePlayer.startWallTime = ctx.currentTime + 0.01;
          state.phonePlayer.lastStepTime = -0.001;
        }
        renderPrimaryTimelineStripUI();
        renderSongBuilderAndClipsUI();
        renderSectionSequenceModal();
        updatePlayerButtons();
      });
    }

    const disableSecLoopBtn = document.getElementById('fold-disable-sec-loop-btn');
    if (disableSecLoopBtn) {
      disableSecLoopBtn.addEventListener('click', () => {
        state.timelineLoopSingle = false;
        if (state.phonePlayer.playing && state.playbackMode === 'timeline') {
          const ctx = getAudioCtx();
          state.phonePlayer.startWallTime = ctx.currentTime + 0.01;
          state.phonePlayer.lastStepTime = -0.001;
        }
        renderPrimaryTimelineStripUI();
        renderSongBuilderAndClipsUI();
        renderSectionSequenceModal();
        updatePlayerButtons();
      });
    }

    const timelineClearBtn = document.getElementById('fold-timeline-clear-btn');
    if (timelineClearBtn) {
      timelineClearBtn.addEventListener('click', () => {
        pushUndoState();
        for (const inst of INSTRUMENT_LIST) {
          setMasterTrackEnabled(inst, false, false);
        }
        state.timelineLoopSingle = false;
        showTimelineToast('🧹 Cleared Master Timeline (your individual Instrument Timelines are still saved in their tabs)');
        commitArrangementChange('Cleared Master Timeline');
      });
    }

    const timelineBpmSlider = document.getElementById('fold-timeline-bpm-slider');
    if (timelineBpmSlider) {
      timelineBpmSlider.addEventListener('input', (e) => {
        const nextBpm = Number(e.target.value);
        setGlobalTimelineBpm(nextBpm, state.timelineBpmSourceTitle || 'Manual Master BPM');
      });
    }

    const randomMashupBtn = document.getElementById('fold-random-mashup-btn');
    if (randomMashupBtn) {
      randomMashupBtn.addEventListener('click', () => {
        randomize4SectionMashup();
      });
    }

    const builderSaveCrateBtn = document.getElementById('fold-builder-save-crate-btn');
    if (builderSaveCrateBtn) {
      builderSaveCrateBtn.addEventListener('click', async () => {
        const titleInput = document.getElementById('fold-arrange-title-input');
        const customTitle =
          titleInput && titleInput.value.trim()
            ? titleInput.value.trim()
            : `Master Band Arrangement (${state.tempo} BPM)`;
        await saveCurrentIdeaToCrate({
          customTitle,
          queuedForOutbox: false
        });
        if (titleInput) titleInput.value = '';
        builderSaveCrateBtn.textContent = '✅ Song Saved!';
        setTimeout(() => {
          builderSaveCrateBtn.textContent = '💾 Save Song Arrangement';
        }, 1600);
      });
    }

    // Wire Up Saved Songs Vault Filters & History Clear
    dock.querySelectorAll('[data-vault-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.crateVaultFilter = btn.getAttribute('data-vault-filter');
        renderCrateAndJamUI();
      });
    });

    const clearHistoryBtn = document.getElementById('fold-clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        state.sessionHistory = [];
        saveSessionHistory();
        renderCrateAndJamUI();
      });
    }

    // PC Keyboard Shortcuts (Keys 1–8) to play the 8 Finger Pads when not typing in an input
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key >= '1' && e.key <= '8') {
        const vIdx = Number(e.key) - 1;
        const padEl = dock.querySelector(`.fold-drum-pad[data-pad-idx="${vIdx}"]`);
        if (padEl) startPadPress(vIdx, padEl);
      }
    });
    window.addEventListener('keyup', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key >= '1' && e.key <= '8') {
        const vIdx = Number(e.key) - 1;
        const padEl = dock.querySelector(`.fold-drum-pad[data-pad-idx="${vIdx}"]`);
        if (padEl) stopPadPress(vIdx, padEl);
      }
    });

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

    document.getElementById('fold-collapse-all-btn')?.addEventListener('click', (e) => {
      const cards = Array.from(dock.querySelectorAll('.fold-card'));
      const anyExpanded = cards.some((c) => !c.classList.contains('collapsed'));
      cards.forEach((c) => setCardCollapsed(c, anyExpanded));
      e.currentTarget.textContent = anyExpanded ? '↕ Expand All' : '↕ Collapse All';
    });

    // ========================================================================
    // Wire Up Controls
    // ========================================================================
    document.getElementById('fold-play-phone-btn')?.addEventListener('click', () => {
      if (state.phonePlayer.playing) stopPhonePlayback();
      else startPhonePlayback();
    });

    const padsPlayBtnEl = document.getElementById('fold-pads-play-btn');
    if (padsPlayBtnEl) {
      padsPlayBtnEl.addEventListener('click', () => {
        if (state.phonePlayer.playing && state.playbackMode !== 'timeline') {
          stopPhonePlayback();
        } else {
          startPhonePlayback('compose');
        }
      });
    }

    document.getElementById('fold-kit-select')?.addEventListener('change', (e) => {
      const inst = isComposeInstrumentTab(state.composeInstrument) ? state.composeInstrument : 'drums';
      setKitIdForInstrument(inst, e.target.value);
      syncSequencerNotes();
      updateHeaderSummaries();
      if (!state.phonePlayer.playing) {
        const ctx = getAudioCtx();
        const voices = getActiveVoices(inst, getInstrumentSongId(inst));
        triggerInstrumentVoice(ctx, inst, voices[0].pitch, 118, ctx.currentTime, 0.25, e.target.value);
        triggerInstrumentVoice(ctx, inst, voices[4]?.pitch || voices[1].pitch, 114, ctx.currentTime + 0.18, 0.25, e.target.value);
      }
    });

    document.getElementById('dial-intensity')?.addEventListener('input', (e) => {
      state.intensityPct = Number(e.target.value);
      document.getElementById('val-intensity').textContent = `${state.intensityPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-ghost')?.addEventListener('input', (e) => {
      state.ghostPct = Number(e.target.value);
      document.getElementById('val-ghost').textContent = `${state.ghostPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-hats')?.addEventListener('input', (e) => {
      state.hatEnergyPct = Number(e.target.value);
      document.getElementById('val-hats').textContent = `${state.hatEnergyPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-fill')?.addEventListener('input', (e) => {
      state.fillPct = Number(e.target.value);
      document.getElementById('val-fill').textContent = `${state.fillPct}%`;
      updateHeaderSummaries();
      regenerateFromDials();
    });

    document.getElementById('dial-swing')?.addEventListener('input', (e) => {
      state.swingPct = Number(e.target.value);
      document.getElementById('val-swing').textContent = `${state.swingPct}%`;
      updateHeaderSummaries();
      syncSequencerNotes();
    });

    document.getElementById('dial-pocket')?.addEventListener('input', (e) => {
      state.pocketPct = Number(e.target.value);
      document.getElementById('val-pocket').textContent = `${state.pocketPct}%`;
      updateHeaderSummaries();
      syncSequencerNotes();
    });

    document.getElementById('dial-bpm')?.addEventListener('input', (e) => {
      const nextBpm = Number(e.target.value);
      setGlobalTimelineBpm(nextBpm, state.timelineBpmSourceTitle || 'Manual BPM Adjust');
    });

    document.getElementById('fold-view-sec4-btn')?.addEventListener('click', () => {
      state.viewMode = 'section4';
      updateViewModeButtons();
      renderMini4BarMap();
      renderSequencerGrid();
    });

    document.getElementById('fold-view-all16-btn')?.addEventListener('click', () => {
      state.viewMode = 'all16';
      updateViewModeButtons();
      renderMini4BarMap();
      renderSequencerGrid();
    });

    document.getElementById('fold-view-zoom1-btn')?.addEventListener('click', () => {
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

    document.getElementById('fold-autofollow-btn')?.addEventListener('click', () => {
      state.autoFollowSection = !state.autoFollowSection;
      updateViewModeButtons();
    });

    document.getElementById('fold-copy-bar-btn')?.addEventListener('click', () => {
      pushUndoState();
      const srcStart = state.zoomedBar * 16;
      const secStartBar = state.activeSection * 4;
      const voices = getActiveVoices();
      for (let v = 0; v < voices.length; v++) {
        for (let b = secStartBar; b < secStartBar + 4; b++) {
          if (b === state.zoomedBar) continue;
          for (let i = 0; i < 16; i++) {
            state.grid[v][b * 16 + i] = { ...state.grid[v][srcStart + i] };
          }
        }
      }
      syncEditingTimelineBlockFromCompose();
      syncSequencerNotes();
      renderSequencerGrid();
    });

    document.getElementById('fold-undo-btn')?.addEventListener('click', (e) => {
      if (state.undoHistory.length > 0) {
        state.grid = state.undoHistory.pop();
        if (state.undoHistory.length === 0) e.currentTarget.disabled = true;
        syncEditingTimelineBlockFromCompose();
        syncSequencerNotes();
        renderSequencerGrid();
      }
    });

    document.getElementById('fold-clear-all-btn')?.addEventListener('click', () => {
      pushUndoState();
      const secStart = state.activeSection * 64;
      const voices = getActiveVoices();
      for (let v = 0; v < voices.length; v++) {
        for (let s = secStart; s < secStart + 64; s++) {
          state.grid[v][s] = { state: 0, sub: 1 };
        }
      }
      syncEditingTimelineBlockFromCompose();
      syncSequencerNotes();
      renderSequencerGrid();
    });

    document.getElementById('fold-reset-groove-btn')?.addEventListener('click', () => {
      pushUndoState();
      loadSongGroove(state.selectedSongId, true);
    });

    dock.querySelectorAll('[data-brush]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.brushMode = btn.getAttribute('data-brush');
        dock.querySelectorAll('[data-brush]').forEach((b) => b.classList.remove('chip-on'));
        btn.classList.add('chip-on');
      });
    });

    document.getElementById('fold-overdub-btn')?.addEventListener('click', (e) => {
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

    const installBtnEl = document.getElementById('fold-install-btn');
    if (installBtnEl) {
      if (!isStandaloneApp()) {
        installBtnEl.style.display = 'inline-flex';
      }
      installBtnEl.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          await deferredInstallPrompt.userChoice;
          deferredInstallPrompt = null;
          if (isStandaloneApp()) installBtnEl.style.display = 'none';
          return;
        }
        if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
          window.location.href = `https://barnesy.github.io/sessh/?pwa=1`;
          return;
        }
        window.alert(
          '📲 To install Session Band Studio ("sessh") on your phone:\n\n' +
            '1. Make sure you are on https://barnesy.github.io/sessh/\n' +
            '2. Tap the Chrome ⋮ menu (top-right) → "Add to Home screen" → "Install".'
        );
      });
    }

    const saveCrateBtn = document.getElementById('fold-save-crate-btn');
    if (saveCrateBtn) {
      saveCrateBtn.addEventListener('click', async () => {
        await saveCurrentIdeaToCrate({ queuedForOutbox: false });
        saveCrateBtn.textContent = '✅ Song Saved!';
        setTimeout(() => {
          saveCrateBtn.textContent = '💾 Save Current Song';
        }, 1500);
      });
    }

    // Restore persisted PWA state from localStorage or load Led Zeppelin ("When the Levee Breaks") by default!
    if (loadPersistedState()) {
      syncSequencerNotes();
      renderArtistTabsAndSongs();
      renderSectionTabs();
      renderMini4BarMap();
      renderSequencerGrid();
      renderSongBuilderAndClipsUI();
      updateDialsUI();
      renderComposeInstrumentUI();
      updatePlayerButtons();
    } else {
      loadSongGroove('zep_levee', true, 'both');
    }
    setDesktopMenuClosed(Boolean(state.desktopMenuClosed));
    updateViewModeButtons();
    renderComposeTimelineBanner();
    renderCrateAndJamUI();
    applyWorkspaceTabVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(mountFoldDock, 40));
  } else {
    setTimeout(mountFoldDock, 40);
  }
})();
