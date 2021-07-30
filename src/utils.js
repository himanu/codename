export const params =  new URLSearchParams(window.location.search);
export  const getParams =  function (name) {
    return '' + params.get(name);
};
export const getGameSessionId = function () {
    return getParams('roomId') + '+' + getParams('sessionId');
};

export const shuffleArray = function(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
export const create_NewArray_Of_List = function(arr) {
    //First  9 Words are of red colors, next 8 words will be of blue colors and next 7 words will be of Grey color and 1 will be of black color
    let idx = 0;
    let newArray_List = [];
    let color = ["Red","Blue","Grey","Black"];
    let differentColorsCount = [9,8,7,1];
    for(let j = 0; j<4 ; j++)
    {
        for(let i = 0; i<differentColorsCount[j] ; i++)
        {
            newArray_List.push({
                name : arr[idx],
                color : color[j]
            })
            idx++;
        }
    }
    return newArray_List;  
}

let CodenameWordsObj = {
    "default": [
      "AFRICA",
      "AGENT",
      "AIR",
      "ALIEN",
      "ALPS",
      "AMAZON",
      "AMBULANCE",
      "AMERICA",
      "ANGEL",
      "ANTARCTICA",
      "APPLE",
      "ARM",
      "ATLANTIS",
      "AUSTRALIA",
      "AZTEC",
      "BACK",
      "BALL",
      "BAND",
      "BANK",
      "BAR",
      "BARK",
      "BAT",
      "BATTERY",
      "BEACH",
      "BEAR",
      "BEAT",
      "BED",
      "BEIJING",
      "BELL",
      "BELT",
      "BERLIN",
      "BERMUDA",
      "BERRY",
      "BILL",
      "BLOCK",
      "BOARD",
      "BOLT",
      "BOMB",
      "BOND",
      "BOOM",
      "BOOT",
      "BOTTLE",
      "BOW",
      "BOX",
      "BRIDGE",
      "BRUSH",
      "BUCK",
      "BUFFALO",
      "BUG",
      "BUGLE",
      "BUTTON",
      "CALF",
      "CANADA",
      "CAP",
      "CAPITAL",
      "CAR",
      "CARD",
      "CARROT",
      "CASINO",
      "CAST",
      "CAT",
      "CELL",
      "CENTAUR",
      "CENTER",
      "CHAIR",
      "CHANGE",
      "CHARGE",
      "CHECK",
      "CHEST",
      "CHICK",
      "CHINA",
      "CHOCOLATE",
      "CHURCH",
      "CIRCLE",
      "CLIFF",
      "CLOAK",
      "CLUB",
      "CODE",
      "COLD",
      "COMIC",
      "COMPOUND",
      "CONCERT",
      "CONDUCTOR",
      "CONTRACT",
      "COOK",
      "COPPER",
      "COTTON",
      "COURT",
      "COVER",
      "CRANE",
      "CRASH",
      "CRICKET",
      "CROSS",
      "CROWN",
      "CYCLE",
      "CZECH",
      "DANCE",
      "DATE",
      "DAY",
      "DEATH",
      "DECK",
      "DEGREE",
      "DIAMOND",
      "DICE",
      "DINOSAUR",
      "DISEASE",
      "DOCTOR",
      "DOG",
      "DRAFT",
      "DRAGON",
      "DRESS",
      "DRILL",
      "DROP",
      "DUCK",
      "DWARF",
      "EAGLE",
      "EGYPT",
      "EMBASSY",
      "ENGINE",
      "ENGLAND",
      "EUROPE",
      "EYE",
      "FACE",
      "FAIR",
      "FALL",
      "FAN",
      "FENCE",
      "FIELD",
      "FIGHTER",
      "FIGURE",
      "FILE",
      "FILM",
      "FIRE",
      "FISH",
      "FLUTE",
      "FLY",
      "FOOT",
      "FORCE",
      "FOREST",
      "FORK",
      "FRANCE",
      "GAME",
      "GAS",
      "GENIUS",
      "GERMANY",
      "GHOST",
      "GIANT",
      "GLASS",
      "GLOVE",
      "GOLD",
      "GRACE",
      "GRASS",
      "GREECE",
      "GREEN",
      "GROUND",
      "HAM",
      "HAND",
      "HAWK",
      "HEAD",
      "HEART",
      "HELICOPTER",
      "HIMALAYAS",
      "HOLE",
      "HOLLYWOOD",
      "HONEY",
      "HOOD",
      "HOOK",
      "HORN",
      "HORSE",
      "HORSESHOE",
      "HOSPITAL",
      "HOTEL",
      "ICE",
      "ICE CREAM",
      "INDIA",
      "IRON",
      "IVORY",
      "JACK",
      "JAM",
      "JET",
      "JUPITER",
      "KANGAROO",
      "KETCHUP",
      "KEY",
      "KID",
      "KING",
      "KIWI",
      "KNIFE",
      "KNIGHT",
      "LAB",
      "LAP",
      "LASER",
      "LAWYER",
      "LEAD",
      "LEMON",
      "LEPRECHAUN",
      "LIFE",
      "LIGHT",
      "LIMOUSINE",
      "LINE",
      "LINK",
      "LION",
      "LITTER",
      "LOCH NESS",
      "LOCK",
      "LOG",
      "LONDON",
      "LUCK",
      "MAIL",
      "MAMMOTH",
      "MAPLE",
      "MARBLE",
      "MARCH",
      "MASS",
      "MATCH",
      "MERCURY",
      "MEXICO",
      "MICROSCOPE",
      "MILLIONAIRE",
      "MINE",
      "MINT",
      "MISSILE",
      "MODEL",
      "MOLE",
      "MOON",
      "MOSCOW",
      "MOUNT",
      "MOUSE",
      "MOUTH",
      "MUG",
      "NAIL",
      "NEEDLE",
      "NET",
      "NEW YORK",
      "NIGHT",
      "NINJA",
      "NOTE",
      "NOVEL",
      "NURSE",
      "NUT",
      "OCTOPUS",
      "OIL",
      "OLIVE",
      "OLYMPUS",
      "OPERA",
      "ORANGE",
      "ORGAN",
      "PALM",
      "PAN",
      "PANTS",
      "PAPER",
      "PARACHUTE",
      "PARK",
      "PART",
      "PASS",
      "PASTE",
      "PENGUIN",
      "PHOENIX",
      "PIANO",
      "PIE",
      "PILOT",
      "PIN",
      "PIPE",
      "PIRATE",
      "PISTOL",
      "PIT",
      "PITCH",
      "PLANE",
      "PLASTIC",
      "PLATE",
      "PLATYPUS",
      "PLAY",
      "PLOT",
      "POINT",
      "POISON",
      "POLE",
      "POLICE",
      "POOL",
      "PORT",
      "POST",
      "POUND",
      "PRESS",
      "PRINCESS",
      "PUMPKIN",
      "PUPIL",
      "PYRAMID",
      "QUEEN",
      "RABBIT",
      "RACKET",
      "RAY",
      "REVOLUTION",
      "RING",
      "ROBIN",
      "ROBOT",
      "ROCK",
      "ROME",
      "ROOT",
      "ROSE",
      "ROULETTE",
      "ROUND",
      "ROW",
      "RULER",
      "SATELLITE",
      "SATURN",
      "SCALE",
      "SCHOOL",
      "SCIENTIST",
      "SCORPION",
      "SCREEN",
      "SCUBA DIVER",
      "SEAL",
      "SERVER",
      "SHADOW",
      "SHAKESPEARE",
      "SHARK",
      "SHIP",
      "SHOE",
      "SHOP",
      "SHOT",
      "SINK",
      "SKYSCRAPER",
      "SLIP",
      "SLUG",
      "SMUGGLER",
      "SNOW",
      "SNOWMAN",
      "SOCK",
      "SOLDIER",
      "SOUL",
      "SOUND",
      "SPACE",
      "SPELL",
      "SPIDER",
      "SPIKE",
      "SPINE",
      "SPOT",
      "SPRING",
      "SPY",
      "SQUARE",
      "STADIUM",
      "STAFF",
      "STAR",
      "STATE",
      "STICK",
      "STOCK",
      "STRAW",
      "STREAM",
      "STRIKE",
      "STRING",
      "SUB",
      "SUIT",
      "SUPERHERO",
      "SWING",
      "SWITCH",
      "TABLE",
      "TABLET",
      "TAG",
      "TAIL",
      "TAP",
      "TEACHER",
      "TELESCOPE",
      "TEMPLE",
      "THEATER",
      "THIEF",
      "THUMB",
      "TICK",
      "TIE",
      "TIME",
      "TOKYO",
      "TOOTH",
      "TORCH",
      "TOWER",
      "TRACK",
      "TRAIN",
      "TRIANGLE",
      "TRIP",
      "TRUNK",
      "TUBE",
      "TURKEY",
      "UNDERTAKER",
      "UNICORN",
      "VACUUM",
      "VAN",
      "VET",
      "WAKE",
      "WALL",
      "WAR",
      "WASHER",
      "WASHINGTON",
      "WATCH",
      "WATER",
      "WAVE",
      "WEB",
      "WELL",
      "WHALE",
      "WHIP",
      "WIND",
      "WITCH",
      "WORM",
      "YARD"
    ],
    "duet": [
      "ACE",
      "ALASKA",
      "ANCHOR",
      "ANT",
      "ANTHEM",
      "APRON",
      "ARMOR",
      "ARMY",
      "ASTRONAUT",
      "ATTIC",
      "AVALANCHE",
      "AXE",
      "BABY",
      "BACON",
      "BALLOON",
      "BANANA",
      "BARBECUE",
      "BASS",
      "BATH",
      "BATTLE",
      "BATTLESHIP",
      "BAY",
      "BEAM",
      "BEAN",
      "BEARD",
      "BEE",
      "BEER",
      "BENCH",
      "BICYCLE",
      "BIG BANG",
      "BIG BEN",
      "BIKINI",
      "BISCUIT",
      "BLACK HOLE",
      "BLACKSMITH",
      "BLADE",
      "BLIND",
      "BLIZZARD",
      "BLUES",
      "BOIL",
      "BONSAI",
      "BOOK",
      "BOSS",
      "BOWL",
      "BOWLER",
      "BOXER",
      "BRAIN",
      "BRASS",
      "BRAZIL",
      "BREAD",
      "BREAK",
      "BRICK",
      "BRIDE",
      "BROTHER",
      "BUBBLE",
      "BUCKET",
      "BULB",
      "BUNK",
      "BUTTER",
      "BUTTERFLY",
      "CABLE",
      "CAESAR",
      "CAKE",
      "CAMP",
      "CANE",
      "CAPTAIN",
      "CASTLE",
      "CAVE",
      "CHAIN",
      "CHALK",
      "CHEESE",
      "CHERRY",
      "CHIP",
      "CHRISTMAS",
      "CLEOPATRA",
      "CLOCK",
      "CLOUD",
      "COACH",
      "COAST",
      "COFFEE",
      "COLLAR",
      "COLUMBUS",
      "COMB",
      "COMET",
      "COMPUTER",
      "CONE",
      "COW",
      "COWBOY",
      "CRAB",
      "CRAFT",
      "CROW",
      "CRUSADER",
      "CRYSTAL",
      "CUCKOO",
      "CURRY",
      "DASH",
      "DELTA",
      "DENTIST",
      "DESK",
      "DIRECTOR",
      "DISK",
      "DOLL",
      "DOLLAR",
      "DRAWING",
      "DREAM",
      "DRESSING",
      "DRIVER",
      "DRONE",
      "DRUM",
      "DRYER",
      "DUST",
      "EAR",
      "EARTH",
      "EARTHQUAKE",
      "EASTER",
      "EDEN",
      "EGG",
      "EINSTEIN",
      "FARM",
      "FEVER",
      "FIDDLE",
      "FLAG",
      "FLAT",
      "FLOOD",
      "FLOOR",
      "FOAM",
      "FOG",
      "FROG",
      "FROST",
      "FUEL",
      "GANGSTER",
      "GEAR",
      "GENIE",
      "GLACIER",
      "GLASSES",
      "GOAT",
      "GOLDILOCKS",
      "GOLF",
      "GOVERNOR",
      "GREENHOUSE",
      "GROOM",
      "GUITAR",
      "GUM",
      "GYMNAST",
      "HAIR",
      "HALLOWEEN",
      "HAMBURGER",
      "HAMMER",
      "HAWAII",
      "HELMET",
      "HERCULES",
      "HIDE",
      "HIT",
      "HOMER",
      "HOSE",
      "HOUSE",
      "ICE AGE",
      "ICELAND",
      "IGLOO",
      "INK",
      "JAIL",
      "JELLYFISH",
      "JEWELER",
      "JOAN OF ARC",
      "JOCKEY",
      "JOKER",
      "JUDGE",
      "JUMPER",
      "KICK",
      "KILT",
      "KING ARTHUR",
      "KISS",
      "KITCHEN",
      "KNOT",
      "KUNG FU",
      "LACE",
      "LADDER",
      "LAUNDRY",
      "LEATHER",
      "LEMONADE",
      "LETTER",
      "LIGHTNING",
      "LIP",
      "LOCUST",
      "LOVE",
      "LUMBERJACK",
      "LUNCH",
      "MAGAZINE",
      "MAGICIAN",
      "MAKEUP",
      "MANICURE",
      "MAP",
      "MARACAS",
      "MARATHON",
      "MEDIC",
      "MEMORY",
      "MESS",
      "METER",
      "MICROWAVE",
      "MILE",
      "MILK",
      "MILL",
      "MINOTAUR",
      "MINUTE",
      "MIRROR",
      "MISS",
      "MOHAWK",
      "MONA LISA",
      "MONKEY",
      "MOSES",
      "MOSQUITO",
      "MOTHER",
      "MOUNTIE",
      "MUD",
      "MUMMY",
      "MUSKETEER",
      "MUSTARD",
      "NAPOLEON",
      "NERVE",
      "NEWTON",
      "NOAH",
      "NOSE",
      "NOTRE DAME",
      "NYLON",
      "OASIS",
      "ONION",
      "PACIFIC",
      "PAD",
      "PADDLE",
      "PAGE",
      "PAINT",
      "PARADE",
      "PARROT",
      "PATIENT",
      "PEA",
      "PEACH",
      "PEANUT",
      "PEARL",
      "PEN",
      "PENNY",
      "PENTAGON",
      "PEPPER",
      "PEW",
      "PIG",
      "PILLOW",
      "PINE",
      "PIZZA",
      "POCKET",
      "POLISH",
      "POLO",
      "POP",
      "POPCORN",
      "POTATO",
      "POTTER",
      "POWDER",
      "PUPPET",
      "PURSE",
      "QUACK",
      "QUARTER",
      "RADIO",
      "RAIL",
      "RAINBOW",
      "RAM",
      "RANCH",
      "RAT",
      "RAZOR",
      "RECORD",
      "REINDEER",
      "RICE",
      "RIFLE",
      "RIP",
      "RIVER",
      "ROAD",
      "RODEO",
      "ROLL",
      "ROPE",
      "RUBBER",
      "RUSSIA",
      "RUST",
      "SACK",
      "SADDLE",
      "SAHARA",
      "SAIL",
      "SALAD",
      "SALOON",
      "SALSA",
      "SALT",
      "SAND",
      "SANTA",
      "SAW",
      "SCARECROW",
      "SCRATCH",
      "SCROLL",
      "SECOND",
      "SHAMPOO",
      "SHED",
      "SHEET",
      "SHELL",
      "SHERLOCK",
      "SHERWOOD",
      "SHOOT",
      "SHORTS",
      "SHOULDER",
      "SHOWER",
      "SIGN",
      "SILK",
      "SISTER",
      "SKATES",
      "SKI",
      "SKULL",
      "SLED",
      "SLEEP",
      "SLING",
      "SLIPPER",
      "SLOTH",
      "SMOKE",
      "SMOOTHIE",
      "SNAKE",
      "SNAP",
      "SOAP",
      "SOUP",
      "SPHINX",
      "SPIRIT",
      "SPOON",
      "SPRAY",
      "SPURS",
      "SQUASH",
      "SQUIRREL",
      "ST.PATRICK",
      "STABLE",
      "STAMP",
      "STEAM",
      "STEEL",
      "STEP",
      "STETHOSCOPE",
      "STICKER",
      "STORM",
      "STORY",
      "STREET",
      "SUGAR",
      "SUMO",
      "SUN",
      "SWAMP",
      "SWEAT",
      "SWORD",
      "TANK",
      "TASTE",
      "TATTOO",
      "TEA",
      "TEAM",
      "TEAR",
      "TEXAS",
      "THUNDER",
      "TIGER",
      "TIN",
      "TIP",
      "TIPI",
      "TOAST",
      "TORNADO",
      "TRICK",
      "TROLL",
      "TUNNEL",
      "TURTLE",
      "TUTU",
      "TUXEDO",
      "UNIVERITY",
      "VALENTINE",
      "VAMPIRE",
      "VENUS",
      "VIKING",
      "VIOLET",
      "VIRUS",
      "VOLCANO",
      "VOLUME",
      "WAGON",
      "WAITRESS",
      "WALRUS",
      "WEDDING",
      "WEREWOLF",
      "WHEEL",
      "WHEELCHAIR",
      "WHISTLE",
      "WINDOW",
      "WING",
      "WISH",
      "WIZARD",
      "WONDERLAND",
      "WOOL",
      "YELLOWSTONE",
      "ZOMBIE"
    ]
  }
export const defaultWordsArray = CodenameWordsObj["default"];
export const duetWordsArray = CodenameWordsObj["duet"];
     
