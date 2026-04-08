export interface PlanetInfo {
  id: string;
  name: string;
  diameter: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  dayLength: string;
  moons: number;
  funFact: string;
}

export const PLANET_INFO: PlanetInfo[] = [
  {
    id: "sun",
    name: "Sun",
    diameter: "1,392,700 km",
    distanceFromSun: "—",
    orbitalPeriod: "—",
    dayLength: "25–36 days",
    moons: 0,
    funFact: "Contains 99.86% of the solar system's mass.",
  },
  {
    id: "mercury",
    name: "Mercury",
    diameter: "4,879 km",
    distanceFromSun: "0.39 AU / 57.9M km",
    orbitalPeriod: "87.97 days",
    dayLength: "1,407.6 hours",
    moons: 0,
    funFact:
      "Has the most extreme temperature swings in the solar system: -180°C to 430°C.",
  },
  {
    id: "venus",
    name: "Venus",
    diameter: "12,104 km",
    distanceFromSun: "0.72 AU / 108.2M km",
    orbitalPeriod: "224.7 days",
    dayLength: "5,832.5 hours (retrograde)",
    moons: 0,
    funFact: "A day on Venus is longer than its year.",
  },
  {
    id: "earth",
    name: "Earth",
    diameter: "12,742 km",
    distanceFromSun: "1.0 AU / 149.6M km",
    orbitalPeriod: "365.25 days",
    dayLength: "23.9 hours",
    moons: 1,
    funFact: "The only known planet to harbor life.",
  },
  {
    id: "mars",
    name: "Mars",
    diameter: "6,779 km",
    distanceFromSun: "1.52 AU / 227.9M km",
    orbitalPeriod: "686.97 days",
    dayLength: "24.6 hours",
    moons: 2,
    funFact:
      "Home to Olympus Mons, the tallest volcano in the solar system (21.9 km).",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    diameter: "139,820 km",
    distanceFromSun: "5.20 AU / 778.5M km",
    orbitalPeriod: "11.86 years",
    dayLength: "9.9 hours",
    moons: 95,
    funFact:
      "Its Great Red Spot is a storm that has raged for over 350 years.",
  },
  {
    id: "saturn",
    name: "Saturn",
    diameter: "116,460 km",
    distanceFromSun: "9.54 AU / 1.43B km",
    orbitalPeriod: "29.46 years",
    dayLength: "10.7 hours",
    moons: 146,
    funFact:
      "Its rings are made of ice and rock, stretching 282,000 km but only 10–100 m thick.",
  },
  {
    id: "uranus",
    name: "Uranus",
    diameter: "50,724 km",
    distanceFromSun: "19.19 AU / 2.87B km",
    orbitalPeriod: "84.01 years",
    dayLength: "17.2 hours",
    moons: 27,
    funFact: "Rotates on its side with an axial tilt of 97.77°.",
  },
  {
    id: "neptune",
    name: "Neptune",
    diameter: "49,244 km",
    distanceFromSun: "30.07 AU / 4.50B km",
    orbitalPeriod: "164.8 years",
    dayLength: "16.1 hours",
    moons: 16,
    funFact:
      "Has the strongest winds in the solar system, up to 2,100 km/h.",
  },
];

export const PLANET_INFO_MAP: Record<string, PlanetInfo> = Object.fromEntries(
  PLANET_INFO.map((p) => [p.id, p])
);
