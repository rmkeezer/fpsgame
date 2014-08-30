#pragma strict
// English names whoops
/*var static FirstNames : String[] = [
"Benjamin", "Ernest", "John", "Sampson", "George", "Horace", "Tom"
var static MiddleNames : String[] = [
"William", "Leonard", "George", "Frederick", 
var static LastNames : String[] = [
"Adams", "Adkin", "Allatt", "Allsop", "Alvey", "Antill",*/

static var FirstNamesUSA : String[] = [
"Benjamin", "John", "Sampson", "George", "Tom", "Peter", "Carl", "Nick", "William",
"Elwood", "Henry", "James", "Mike", "Albert", "Alfred", "Charles", "Edward",
"Guiseppe", "Harry", "Jacob", "Gus", "Thomas", "Ben", "Arthur", "Glen", "Walter",
"Max", "Bernard", "Louis", "Clifford", "Francis", "Isadore", "Mathew", "Konstanty",
"Luther", "Joe", "Rayford", "Mat", "Elmer", "Matteo", "Dave", "Birt", "Douglas",
"Frank", "Earl", "Isaiah", "Moses", "Ebeneezer", "Cornelius", "Harold", "Leon", "Lloyd",
"Luigi", "Ralph", "Robert", "Samuel", "Sanford", "Solomon", "Ward", "Paul", "Cyrus",
"Will", "Philip", "Earle", "Fred", "Palmer", "Theodore", "Oscar", "Erik", "Bartholomeo",
"Maurice", "Noel", "Quincy", "Harve", "Herbert", "Joseph", "Toney", "Bernard", "Clarence",
"Isidore", "Guss", "Melvin", "Willie", "Lawrence", "Claud", "Tommie", "Clyde", "Virgil",
"Russell", "Nicholas", "Daniel", "Clinton", "Miles", "Floyd", "Forrest", "Grant", "Jackson",
"Leroy", "Leslie", "Nathan", "Roy", "Wade", "Ed", "Cordie", "Martin", "Oliver",
"Abraham", "Gordie", "David", "Emil", "Allan", "Andrew", "Bert", "Eddie", "Edwin",
"Magnus", "Morgan", "Leonard", "Richard", "Seymour", "Wilber", "Herman", "Rolland",
"Omar", "Stanley", "Vincent", "Sam", "Gust", "Dan", "Don", "Milton", "Ludwig",
"Cornelius", "Lester", "Patrick", "Stephen", "Rocco"
];
static var MiddleNamesUSA : String[] = [
"D.", "A.", "R.", "M.", "T.", "G.", "I.", "B.", "C.", "E.", "F.", "H.", "J.", "K.",
"L.", "N.", "O.", "P.", "S.", "Q.", "U.", "W.", "Y.", "Z."
];
static var LastNamesUSA : String[] = [
"Aaron", "Abbott", "Abrams", "Ackerman", "Achenbach", "Adams", "Adderley", "Addington",
"Adkins", "Adwell", "Atiken", "Akins", "Alderman", "Alfonso", "Allen", "Allison", "Anagnostopoulos",
"Anderson", "Anderson", "Anderson", "Andrews", "Bacon", "Bailey", "Baker", "Baldwin",
"Ballard", "Bateman", "Bean", "Beck", "Bell", "Bickford", "Bishop", "Black", "Block",
"Boatmon", "Boggs", "Booth", "Bosley", "Bouley", "Bower", "Boyce", "Bradford", "Bradley",
"Brooks", "Brown", "Bryce", "Buckley", "Caldwell", "Callahan", "Campbell", "Carlson",
"Carter", "Casey", "Chandler", "Chase", "Clark", "Coleman", "Collins", "Cook", "Cooper",
"Davidson", "Davis", "Dickenson", "Dolan", "Donovan", "Douglas", "Doyle", "Duffy", "Duncan",
"Edwards", "Elliott", "Erickson", "Evans", "Everett", "Farmer", "Farrell", "Feldman", "Ferguson",
"Fields", "Finn", "Fischer", "Fisher", "Flanagan", "Flemming", "Flemins", "Fletcher", "Flynn",
"Foley", "Ford", "Foster", "Fowler", "Freedman", "Freeman", "Fry", "Gardner", "Garrett", "Gibbons",
"Gibson", "Goldberg", "Goldman", "Goodwin", "Gordon", "Graham", "Gray", "Greeley", "Green",
"Griffin", "Hall", "Hamilton", "Hampton", "Hancock", "Hansen", "Hardy", "Harper", "Harris", "Hartman",
"Hayes", "Higgins", "Hill", "Hoffman", "Holcomb", "Holmes", "Hooper", "Hoover", "Howell",
"Huffman", "Hunter", "Jackson", "Jacobson", "Jamison", "Jenkins", "Johnson", "Jones", "Kelly",
"Kennedy", "Keppler", "Kiesman", "King", "Kuczkowski", "Lambert", "Lincoln", "Lynch", "Lyons",
"Mac", "Mason", "Maxwell", "McCarthy", "McCormick", "McDonnell", "McDonough", "McElroy",
"McGee", "McGraw", "Miller", "Morrison", "Murphy", "Newell", "O'Brien", "O'Connell",
"O'Connor", "O'Donovan", "O'Niel", "Olson", "Osborne", "Packer", "Palmer", "Payne", "Pearson",
"Peters", "Peterson", "Phillips", "Potter", "Quinn", "Raymond", "Reagan", "Reed", "Reilly",
"Reynolds", "Riley", "Roberts", "Robertson", "Robinson", "Rose", "Ross", "Russell", "Russo",
"Ryan", "Schmitt", "Schultz", "Scott", "Shaw", "Sherman", "Simmons", "Smith", "Stewart",
"Stone", "Sullivan", "Thompson", "Thrasher", "Tucker", "Ulrich", "Van", "Walker", "Wallace",
"Walsh", "Ward", "White", "Williams", "Wood", "Wright", "Young", "Zimmerman"
];

static var FirstNamesGerman : String[] = [
"Fritz", "Hans"/*, "Heinrich", "Friedrich", "Wilhelm", "Martin"*/
];
static var MiddleNamesGerman : String[] = [
"D.", "A.", "R.", "M.", "T.", "G.", "I.", "B.", "C.", "E.", "F.", "H.", "J.", "K.",
"L.", "N.", "O.", "P.", "S.", "Q.", "U.", "W.", "Y.", "Z."
];
static var LastNamesGerman : String[] = [
"Muller", "Schmidt", "Schneider"/*, "Fischer", "Weber", "Schafer", "Meyer", "Wagner",
"Becker", "Bauer", "Hoffmann", "Schulz", "Koch", "Richter", "Klein", "Wolf", "Schroder",
"Neumann", "Braun", "Werner", "Schwarz", "Hofmann", "Zimmermann", "Schmitt", "Hartmann",
"Schmid", "Schmitz", "Kruger", "Meier", "Walter", "Kohler", "Maier", "Beck", "Konig",
"Krause", "Schulze", "Huber", "Mayer", "Lehmann", "Kaiser", "Herrmann", "Stein", "Moller",
"Otto", "Ludwig", "Jager", "Gunther", "Kramer", "Kraus", "Haas", "Kuhn", "Busch", "Bergmann"*/
];

static var WeaponsUSA : String[] = [
"M1917 Enfield", "M1918 Browning Automatic Rifle", "M1903 Springfield", 
"M1912 Winchester", "M1917 Browning Machine Gun", "Lewis Gun", "M1911 Colt"
];

static var WeaponsGerman : String[] = [
"MP18", "Gewehr 98", "Steyr-Mannlicher M1895", 
"Madsen Light Machine Gun", "Flammenwerfer M16", "Lugar P08"
];

static var RanksUSAenlisted : String[] = [
"Pvt.", "Pfc.", "Cpl.", "Sgt.", "Ssg.", "Sfc."
];

static var RanksUSAofficer : String[] = [
"2lt.", "1lt.", "Cpt.", "Maj.", "Ltc.", "Col.", "Bg.", "Mg.", "Ltg.", "Gen."
];

static var RanksGermanyEnlisted : String[] = [
"Pion.", "Gefr.", "Uffz.", "Sgt.", "Vzfw.", "Fw."
];

static var RanksGermanyOfficer : String[] = [
"Ltn.", "Obltn.", "Hptm.", "Maj.", "Obstltn.", "Obst.", "Genmaj.", "Genltn.", "GenObst.", "FM."
];

var Rank : String;
var Experience : int;
var FirstName : String;
var MiddleName : String;
var LastName : String;
var Age : int;
var Nationality : String;
var Height : float;
var HeightFeet : int;
var HeightInches : int;
var Weight : int;
var EyeColor : String;
var Weapon : String;

var WeaponCode : int;
var IsOfficer : boolean;

function Awake()
{
	if(transform.GetComponent(TeamNumber))
	{
		if(transform.GetComponent(TeamNumber).team == 0)
		{
			FirstName = FirstNamesUSA[Random.Range(0,FirstNamesUSA.length)];
			MiddleName = MiddleNamesUSA[Random.Range(0,MiddleNamesUSA.length)];
			LastName = LastNamesUSA[Random.Range(0,LastNamesUSA.length)];
			Age = Random.Range(21,33);
			Nationality = "USA";
			EyeColor = "Brown";
			Weapon = WeaponsUSA[WeaponCode];
			if(!IsOfficer) {
				Experience = Random.Range(-2000, 3100);
				if(Experience < 0)
					Experience = 0;
				Rank = RanksUSAenlisted[Experience/1000];
			} else {
				Experience = Random.Range(-1000, 3100);
				if(Experience < 0)
					Experience = 0;
				Rank = RanksUSAofficer[Experience/1000];
			}
		} 
		else if(transform.GetComponent(TeamNumber).team == 1)
		{
			FirstName = FirstNamesGerman[Random.Range(0,FirstNamesGerman.length)];
			MiddleName = MiddleNamesGerman[Random.Range(0,MiddleNamesGerman.length)];
			LastName = LastNamesGerman[Random.Range(0,LastNamesGerman.length)];
			Age = Random.Range(17,48);
			Nationality = "Germany";
			EyeColor = "Blue";
			Weapon = WeaponsGerman[WeaponCode];
			if(!IsOfficer) {
				Experience = Random.Range(-2000, 3100);
				if(Experience < 0)
					Experience = 0;
				Rank = RanksGermanyEnlisted[Experience/1000];
			} else {
				Experience = Random.Range(-1000, 3100);
				if(Experience < 0)
					Experience = 0;
				Rank = RanksGermanyOfficer[Experience/1000];
			}
		}
		Height = Random.Range(50,70)*0.1;
		HeightFeet = Height;
		HeightInches = (Height*10)%10;
		Weight = Random.Range(180,200)*(Height-3)/3.0;
		SendMessage("NetworkName", FirstName + " " + MiddleName + " " + LastName, SendMessageOptions.DontRequireReceiver);
		SendMessage("NetworkAge", Age, SendMessageOptions.DontRequireReceiver);
		SendMessage("NetworkHeight", Height, SendMessageOptions.DontRequireReceiver);
		SendMessage("NetworkWeight", Weight, SendMessageOptions.DontRequireReceiver);
		SendMessage("NetworkXP", Experience, SendMessageOptions.DontRequireReceiver);
	}
}

function UpdateRank()
{
	if(transform.GetComponent(TeamNumber).team == 0)
	{
		if(!IsOfficer) {
			Rank = RanksUSAenlisted[Experience/1000];
		} else {
			Rank = RanksUSAofficer[Experience/1000];
		}
	} 
	else if(transform.GetComponent(TeamNumber).team == 1)
	{
		if(!IsOfficer) {
			Rank = RanksGermanyEnlisted[Experience/1000];
		} else {
			Rank = RanksGermanyOfficer[Experience/1000];
		}
	}
}

function ChangeName(name : String)
{
	var names = name.Split(" "[0]);
	FirstName = names[0];
	MiddleName = names[1];
	LastName = names[2];
}

function ChangeXP(exp : int)
{
	Experience = exp;
}

function ChangeAge(a : int)
{
	Age = a;
}

function ChangeHeight(h : int)
{
	Height = h;
	HeightFeet = Height;
	HeightInches = (Height*10)%10;
}

function ChangeWeight(w : int)
{
	Weight = w;
}