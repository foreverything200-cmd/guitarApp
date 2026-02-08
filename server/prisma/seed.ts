import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.song.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.chordStatus.deleteMany();

  // ─── Non-Jewish Artists ───
  const oasis = await prisma.artist.create({
    data: { name: "Oasis", category: "non-jewish" },
  });
  const eagles = await prisma.artist.create({
    data: { name: "Eagles", category: "non-jewish" },
  });
  const leonardCohen = await prisma.artist.create({
    data: { name: "Leonard Cohen", category: "non-jewish" },
  });
  const pinkFloyd = await prisma.artist.create({
    data: { name: "Pink Floyd", category: "non-jewish" },
  });
  const beatles = await prisma.artist.create({
    data: { name: "The Beatles", category: "non-jewish" },
  });
  const bobDylan = await prisma.artist.create({
    data: { name: "Bob Dylan", category: "non-jewish" },
  });
  const metallica = await prisma.artist.create({
    data: { name: "Metallica", category: "non-jewish" },
  });
  const johnLegend = await prisma.artist.create({
    data: { name: "John Legend", category: "non-jewish" },
  });
  const edSheeran = await prisma.artist.create({
    data: { name: "Ed Sheeran", category: "non-jewish" },
  });
  const benEKing = await prisma.artist.create({
    data: { name: "Ben E. King", category: "non-jewish" },
  });

  // ─── Jewish Artists ───
  const traditional = await prisma.artist.create({
    data: { name: "Traditional", category: "jewish" },
  });
  const carlebach = await prisma.artist.create({
    data: { name: "Shlomo Carlebach", category: "jewish" },
  });
  const naomiShemer = await prisma.artist.create({
    data: { name: "Naomi Shemer", category: "jewish" },
  });
  const yaakov = await prisma.artist.create({
    data: { name: "Yaakov Shwekey", category: "jewish" },
  });
  const mbd = await prisma.artist.create({
    data: { name: "Mordechai Ben David", category: "jewish" },
  });
  const avrahamFried = await prisma.artist.create({
    data: { name: "Avraham Fried", category: "jewish" },
  });

  console.log("  ✅ Artists created");

  // ─── Non-Jewish Songs ───
  const nonJewishSongs = [
    {
      title: "Wonderwall",
      artistId: oasis.id,
      category: "non-jewish",
      capoOriginal: 2,
      youtubeUrl: "https://www.youtube.com/watch?v=6hzrDeceEKc",
      content: `[Em7]Today is [G]gonna be the day
That they're [Dsus4]gonna throw it back to [A7sus4]you
[Em7]By now you [G]should've somehow
[Dsus4]Realized what you gotta [A7sus4]do
[Em7]I don't believe that [G]anybody
[Dsus4]Feels the way I [A7sus4]do
About you [C]now [Dsus4] [A7sus4]

[Em7]Backbeat, the [G]word is on the street
That the [Dsus4]fire in your heart is [A7sus4]out
[Em7]I'm sure you've [G]heard it all before
But you [Dsus4]never really had a [A7sus4]doubt

[C]And all the [D]roads we have to [Em7]walk are winding
[C]And all the [D]lights that lead us [Em7]there are blinding
[C]There are many [D]things that I would
[G]Like to [D/F#]say to [Em7]you
But I don't know [A7sus4]how

[C]Because [Em7]maybe [G]
[Em7]You're gonna be the one that [G]saves me
[Em7]And after [G]all
[Em7]You're my wonder[G]wall`,
    },
    {
      title: "Hallelujah",
      artistId: leonardCohen.id,
      category: "non-jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=ttEMYvpoR-k",
      content: `[C]I've heard there was a [Am]secret chord
That [C]David played, and it [Am]pleased the Lord
But [F]you don't really [G]care for music, [C]do you? [G]
It [C]goes like this, the [F]fourth, the [G]fifth
The [Am]minor fall, the [F]major lift
The [G]baffled king com[E7]posing Halle[Am]lujah

[F]Hallelu[Am]jah, [F]Hallelu[Am]jah
[F]Hallelu[C]jah, Hallelu[G]u[C]jah

[C]Your faith was strong but you [Am]needed proof
You [C]saw her bathing [Am]on the roof
Her [F]beauty and the [G]moonlight over[C]threw you [G]
She [C]tied you to a [F]kitchen [G]chair
She [Am]broke your throne, she [F]cut your hair
And [G]from your lips she [E7]drew the Halle[Am]lujah

[F]Hallelu[Am]jah, [F]Hallelu[Am]jah
[F]Hallelu[C]jah, Hallelu[G]u[C]jah`,
    },
    {
      title: "Hotel California",
      artistId: eagles.id,
      category: "non-jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=EqPtz5qN7HM",
      content: `[Am]On a dark desert highway, [E7]cool wind in my hair
[G]Warm smell of colitas, [D]rising up through the air
[F]Up ahead in the distance, [C]I saw a shimmering light
[Dm]My head grew heavy and my sight grew dim
[E7]I had to stop for the night

[Am]There she stood in the doorway, [E7]I heard the mission bell
[G]And I was thinking to myself, this could be [D]heaven or this could be hell
[F]Then she lit up a candle, [C]and she showed me the way
[Dm]There were voices down the corridor
[E7]I thought I heard them say

[F]Welcome to the Hotel Cali[C]fornia
Such a [E7]lovely place, such a [Am]lovely face
[F]Plenty of room at the Hotel Cali[C]fornia
Any [Dm]time of year, you can [E7]find it here`,
    },
    {
      title: "Wish You Were Here",
      artistId: pinkFloyd.id,
      category: "non-jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=IXdNnw99-Ic",
      content: `[Em] [G] [Em] [G] [Em] [A7sus4] [Em] [A7sus4] [G]

[C]So, so you think you can [D]tell
Heaven from [Am]hell, blue skies from [G]pain
Can you tell a green [D]field from a cold steel [C]rail?
A smile from a [Am]veil? Do you think you can [G]tell?

[C]Did they get you to [D]trade your heroes for [Am]ghosts?
Hot ashes for [G]trees? Hot air for a [D]cool breeze?
Cold comfort for [C]change? Did you ex[Am]change
A walk-on part in the [G]war for a lead role in a cage?

[Em]How I wish, how I wish you were [G]here
We're just [C]two lost souls swimming in a fish bowl
[D]Year after year
[Am]Running over the same old [G]ground
What have we [D]found? The same old [C]fears
Wish you were [Am]here [G]`,
    },
    {
      title: "Let It Be",
      artistId: beatles.id,
      category: "non-jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=QDYfEBY9NM4",
      content: `[C]When I find myself in [G]times of trouble
[Am]Mother Mary [F]comes to me
[C]Speaking words of [G]wisdom, let it [F]be [C]
[C]And in my hour of [G]darkness
She is [Am]standing right in [F]front of me
[C]Speaking words of [G]wisdom, let it [F]be [C]

Let it [Am]be, let it [G]be
Let it [F]be, let it [C]be
[C]Whisper words of [G]wisdom, let it [F]be [C]

[C]And when the broken [G]hearted people
[Am]Living in the [F]world agree
[C]There will be an [G]answer, let it [F]be [C]
[C]For though they may be [G]parted there is
[Am]Still a chance that [F]they will see
[C]There will be an [G]answer, let it [F]be [C]`,
    },
    {
      title: "Knockin' on Heaven's Door",
      artistId: bobDylan.id,
      category: "non-jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=rm9coqlk8eU",
      content: `[G]Mama, take this [D]badge off of [Am]me
[G]I can't [D]use it any[C]more
[G]It's gettin' [D]dark, too dark to [Am]see
[G]I feel I'm [D]knockin' on heaven's [C]door

[G]Knock, knock, [D]knockin' on heaven's [Am]door
[G]Knock, knock, [D]knockin' on heaven's [C]door
[G]Knock, knock, [D]knockin' on heaven's [Am]door
[G]Knock, knock, [D]knockin' on heaven's [C]door

[G]Mama, put my [D]guns in the [Am]ground
[G]I can't [D]shoot them any[C]more
[G]That long black [D]cloud is comin' [Am]down
[G]I feel I'm [D]knockin' on heaven's [C]door`,
    },
    {
      title: "Nothing Else Matters",
      artistId: metallica.id,
      category: "non-jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=tAGnKpE4NCI",
      content: `[Em] [Em] [Em] [Em]

[Em]So close, no matter [D]how far
[C]Couldn't be much more [Em]from the heart
[Em]Forever trusting [D]who we are
[C]And nothing else [G]mat[B7]ters

[Em]Never opened [D]myself this way
[C]Life is ours, we live it [Em]our way
[Em]All these words I [D]don't just say
[C]And nothing else [G]mat[B7]ters

[Em]Trust I [C]seek and I [D]find in [Em]you
[Em]Every [C]day for [D]us something [Em]new
[Em]Open [C]mind for a [D]different [Em]view
[C]And nothing else [G]mat[B7]ters`,
    },
    {
      title: "All of Me",
      artistId: johnLegend.id,
      category: "non-jewish",
      capoOriginal: 1,
      youtubeUrl: "https://www.youtube.com/watch?v=450p7goxZqg",
      content: `[Em]What would I [C]do without your smart [G]mouth
Drawing me [D]in, and you kicking me [Em]out
You've got my [C]head spinning, [G]no kidding
I [D]can't pin you down

[Em]What's going [C]on in that [G]beautiful mind
I'm on your [D]magical mystery [Em]ride
And I'm [C]so dizzy, don't [G]know what hit me
But [D]I'll be alright

[Am]My head's under [G]water
But [D]I'm breathing fine
[Am]You're crazy and [G]I'm out of my [D]mind

'Cause [G]all of me loves [Em]all of you
Love your [Am]curves and all your edges
All your [D]perfect imperfections
[G]Give your all to me, I'll [Em]give my all to you
You're my [Am]end and my beginning
Even [D]when I lose I'm winning`,
    },
    {
      title: "Perfect",
      artistId: edSheeran.id,
      category: "non-jewish",
      capoOriginal: 1,
      youtubeUrl: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
      content: `[G]I found a [Em]love for [C]me
[D]Darling, just dive right in and follow my [G]lead
Well, I found a [Em]girl, beauti[C]ful and sweet
[D]Well, I never knew you were the someone waiting for [G]me

'Cause we were just kids when we [Em]fell in love
Not knowing [C]what it was
I will not [D]give you up this [G]time
Darling, just [Em]kiss me slow
Your heart is [C]all I own
And in your [D]eyes, you're holding mine

Baby, [Em]I'm [C]dancing in the [G]dark
With [D]you between my [Em]arms
[C]Barefoot on the [G]grass, [D]listening to our
[Em]Favorite song, when you [C]said you looked a [G]mess
I whispered [D]underneath my breath
But you [Em]heard it, [C]darling, you look [G]per[D]fect tonight`,
    },
    {
      title: "Stand by Me",
      artistId: benEKing.id,
      category: "non-jewish",
      capoOriginal: 2,
      youtubeUrl: "https://www.youtube.com/watch?v=hwZNL7QVJjE",
      content: `[G]When the night has come
[Em]And the land is dark
And the [C]moon is the [D]only light we'll [G]see

[G]No, I won't be afraid
Oh, [Em]I won't be afraid
Just as [C]long as you [D]stand, stand by [G]me

So darling, darling, [G]stand by me
Oh, [Em]stand by me
Oh, [C]stand, [D]stand by me, [G]stand by me

[G]If the sky that we look upon
[Em]Should tumble and fall
Or the [C]mountain should [D]crumble to the [G]sea

[G]I won't cry, I won't cry
No, [Em]I won't shed a tear
Just as [C]long as you [D]stand, stand by [G]me`,
    },
  ];

  // ─── Jewish Songs ───
  const jewishSongs = [
    {
      title: "Hava Nagila",
      artistId: traditional.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=vHSNZK4Je-Y",
      content: `[E]Hava na[Am]gila, [E]hava na[Am]gila
[E]Hava nagila [Am]ve'nismeha [E]
[E]Hava na[Am]gila, [E]hava na[Am]gila
[E]Hava nagila [Am]ve'nismeha [E]

[Dm]Hava neranena, [E]hava neranena
[Dm]Hava neranena [E]ve'nismeha
[Dm]Hava neranena, [E]hava neranena
[Dm]Hava neranena [E]ve'nismeha

[Am]Uru, uru [Dm]achim
Uru achim b'lev sa[Am]meach
[Am]Uru achim b'lev sa[Dm]meach
Uru achim b'lev sa[Am]meach
Uru [E]achim
Uru achim b'lev sa[Am]meach`,
    },
    {
      title: "Am Yisrael Chai",
      artistId: carlebach.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=2THb8mRBKoc",
      content: `[Am]Am Yisrael [Dm]Chai
[G]Am Yisrael [C]Chai
[F]Am Yisrael [Dm]Chai
[E]Am Yisrael [Am]Chai

[Am]Od avinu [Dm]chai
[G]Od avinu [C]chai
[F]Od avinu [Dm]chai
[E]Od avinu [Am]chai

[Am] [Dm] [G] [C]
[F] [Dm] [E] [Am]

[Am]Am Yisrael [Dm]Chai
[G]Am Yisrael [C]Chai
[F]Am Yisrael [Dm]Chai
[E]Am Yisrael [Am]Chai`,
    },
    {
      title: "Yerushalayim Shel Zahav",
      artistId: naomiShemer.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=JVtaTgs0wAY",
      content: `[Am]Avir harim [Dm]tzalul kayayin
Ve[G]re'ach oranim [C]
[F]Nisa beru'ach [Dm]ha'arbayim
[E]Im kol pa'amo[Am]nim

[Am]Uvtardemat [Dm]ilan va'even
[G]Shvuya bachal[C]omah
[F]Ha'ir asher [Dm]badad yoshevet
[E]Ulvavah cho[Am]mah

[C]Yerushalayim shel za[G]hav
Veshel [Am]nechoshet veshel [E]or
[F]Halo lechol shi[Dm]rayich
[E]Ani kinor [Am]

[Am]Eicha yavshu [Dm]borot hamayim
[G]Kikar hashu[C]k reikah
[F]Ve'ein poked et [Dm]har habayit
[E]Ba'ir ha'ati[Am]kah`,
    },
    {
      title: "Od Yishama",
      artistId: traditional.id,
      category: "jewish",
      capoOriginal: 2,
      youtubeUrl: "https://www.youtube.com/watch?v=H_wl-AewSJU",
      content: `[G]Od yishama [C]be'arei Ye[G]hudah
Uv'chu[D]tzot Yeru[G]shalaim
[G]Od yishama [C]be'arei Ye[G]hudah
Uv'chu[D]tzot Yeru[G]shalaim

[Em]Kol sasson ve'[Am]kol simcha
[D]Kol chatan ve'[G]kol kalah
[Em]Kol sasson ve'[Am]kol simcha
[D]Kol chatan ve'[G]kol kalah

[G] [C] [G] [D] [G]
[Em] [Am] [D] [G]`,
    },
    {
      title: "Shalom Aleichem",
      artistId: traditional.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=aCXnx5pI5TU",
      content: `[Am]Shalom a[Dm]leichem
Mal'[E7]achei ha[Am]shareit
Mal'[Dm]achei el[E7]yon
Mi[Am]melech mal[Dm]chei ham'la[E7]chim
Ha[Am]kadosh ba[E7]ruch [Am]hu

[Am]Bo'achem l'sha[Dm]lom
Mal'[E7]achei ha[Am]shalom
Mal'[Dm]achei el[E7]yon
Mi[Am]melech mal[Dm]chei ham'la[E7]chim
Ha[Am]kadosh ba[E7]ruch [Am]hu

[Am]Bar'chuni l'sha[Dm]lom
Mal'[E7]achei ha[Am]shalom
Mal'[Dm]achei el[E7]yon
Mi[Am]melech mal[Dm]chei ham'la[E7]chim
Ha[Am]kadosh ba[E7]ruch [Am]hu`,
    },
    {
      title: "Lecha Dodi",
      artistId: carlebach.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=ITVdlq3-h_A",
      content: `[Em]Lecha [Am]dodi [D]likrat [G]kalah
[Em]Penei [Am]Shabbat [B7]nekab'[Em]lah

[Em]Shamor ve'za[Am]chor be'di[D]bur e[G]chad
[Em]Hishmi[Am]anu el [B7]hameyu[Em]chad
[Em]Hashem e[Am]chad u[D]shmo e[G]chad
[Em]Leshem ul'tif[Am]eret ve'lit[B7]hi[Em]lah

[Em]Lecha [Am]dodi [D]likrat [G]kalah
[Em]Penei [Am]Shabbat [B7]nekab'[Em]lah

[Em]Likrat Sha[Am]bbat le[D]chu ve[G]nelcha
[Em]Ki hi me[Am]kor ha[B7]bra[Em]cha
[Em]Merosh mi[Am]kedem ne[D]su[G]cha
[Em]Sof ma'a[Am]seh be'macha[B7]shava tech[Em]ila`,
    },
    {
      title: "Oseh Shalom",
      artistId: traditional.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=P4eM4cf_hbw",
      content: `[G]Oseh sha[Em]lom bimro[C]mav
[D]Hu ya'aseh sha[G]lom aleinu
Ve'al kol Yis[Em]rael
Ve'[C]imru, [D]imru [G]Amen

[G]Oseh sha[Em]lom bimro[C]mav
[D]Hu ya'aseh sha[G]lom aleinu
Ve'al kol Yis[Em]rael
Ve'[C]imru, [D]imru [G]Amen

[G] [Em] [C] [D] [G]

[G]Ya'aseh shalom, [Em]ya'aseh shalom
[C]Shalom [D]aleinu ve'al kol Yis[G]rael
[G]Ya'aseh shalom, [Em]ya'aseh shalom
[C]Shalom [D]aleinu ve'al kol Yis[G]rael`,
    },
    {
      title: "David Melech Yisrael",
      artistId: traditional.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=RHqBxLHIaKY",
      content: `[Am]David me[Dm]lech Yis[E]rael
[Am]Chai, chai ve'ka[E]yam
[Am]David me[Dm]lech Yis[E]rael
[Am]Chai, chai ve'ka[E]yam [Am]

[Am]David, [Dm]David, [E]David
Me[Am]lech Yis[E]rael
[Am]Chai, [Dm]chai [E]ve'ka[Am]yam

[Am] [Dm] [E] [Am]
[Am] [Dm] [E] [Am]

[Am]David me[Dm]lech Yis[E]rael
[Am]Chai, chai ve'ka[E]yam
[Am]David me[Dm]lech Yis[E]rael
[Am]Chai, chai ve'ka[E]yam [Am]`,
    },
    {
      title: "Im Eshkachech",
      artistId: yaakov.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=FHHR6PZ40OE",
      content: `[Am]Im eshka[Dm]chech Yeru[G]shalaim
[C]Tishkach ye[F]mini
[Dm]Tidbak le[E]shoni le'chi[Am]ki
Im lo ez[Dm]kerechi [E]

[Am]Im lo a'a[Dm]leh et [G]Yerushalaim
[C]Al rosh [F]simchati [E]

[Am] [Dm] [G] [C]
[F] [Dm] [E] [Am]

[Am]Im eshka[Dm]chech Yeru[G]shalaim
[C]Tishkach ye[F]mini
[Dm]Tidbak le[E]shoni le'chi[Am]ki
Im lo ez[Dm]kerechi [E]`,
    },
    {
      title: "Ani Ma'amin",
      artistId: mbd.id,
      category: "jewish",
      capoOriginal: 0,
      youtubeUrl: "https://www.youtube.com/watch?v=4eH1YdBdEQg",
      content: `[Am]Ani ma'a[Dm]min, ani ma'a[E]min
[Am]Ani ma'amin be'emu[Dm]nah she[E]leimah
Be'vi[Am]at ha[Dm]mashiach [E]ani ma'a[Am]min

[Am]Ve'af al [Dm]pi she'yitmah[E]meha
[Am]Im kol [Dm]zeh, im kol [E]zeh
[Am]Ani ma'a[Dm]min [E]

[Am] [Dm] [E] [Am]

[Am]Achakeh [Dm]lo bechol [E]yom
[Am]Sheyavo, sheyavo [Dm]achakeh [E]lo
[Am]Ani ma'a[Dm]min be'emu[E]nah she[Am]leimah`,
    },
  ];

  // Create all songs
  for (const song of [...nonJewishSongs, ...jewishSongs]) {
    await prisma.song.create({
      data: {
        ...song,
        capoPreferred: song.capoOriginal,
      },
    });
  }
  console.log(`  ✅ ${nonJewishSongs.length + jewishSongs.length} songs created`);

  // ─── Sample Playlists ───
  const allSongs = await prisma.song.findMany({ orderBy: { title: "asc" } });

  const shabbatPlaylist = await prisma.playlist.create({
    data: { name: "Shabbat Songs", category: "jewish" },
  });
  const jewishSongRecords = allSongs.filter((s) => s.category === "jewish");
  for (let i = 0; i < Math.min(5, jewishSongRecords.length); i++) {
    await prisma.playlistSong.create({
      data: {
        playlistId: shabbatPlaylist.id,
        songId: jewishSongRecords[i].id,
        order: i,
      },
    });
  }

  const campfirePlaylist = await prisma.playlist.create({
    data: { name: "Campfire Classics", category: "non-jewish" },
  });
  const nonJewishRecords = allSongs.filter((s) => s.category === "non-jewish");
  for (let i = 0; i < Math.min(5, nonJewishRecords.length); i++) {
    await prisma.playlistSong.create({
      data: {
        playlistId: campfirePlaylist.id,
        songId: nonJewishRecords[i].id,
        order: i,
      },
    });
  }

  console.log("  ✅ Playlists created");

  // ─── Default Chord Statuses ───
  const commonChords = [
    "A", "Am", "Am7", "A7", "B7", "Bm", "C", "Cadd9",
    "D", "Dm", "Dm7", "D7", "Dsus2", "Dsus4",
    "E", "Em", "Em7", "E7", "F", "Fmaj7",
    "G", "G7",
  ];
  for (const chord of commonChords) {
    await prisma.chordStatus.create({
      data: { chordName: chord, status: "none" },
    });
  }
  console.log("  ✅ Chord statuses initialized");

  console.log("\n🎸 Seed complete!\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
