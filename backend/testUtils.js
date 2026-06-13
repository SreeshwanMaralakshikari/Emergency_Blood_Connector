import {
  canDonate,
  getCompatibleDonors,
} from "./utils/bloodCompatibility.js";

import {
  calculatePoints,
} from "./utils/calculatePoints.js";

import {
  calculateLevel,
} from "./utils/calculateLevel.js";

import {
  calculateNextEligibleDate,
} from "./utils/donationCooldown.js";

console.log(
  canDonate("O-", "AB+")
);

console.log(
  canDonate("A+", "O+")
);

console.log(
  getCompatibleDonors("A+")
);

console.log(
  calculatePoints("BLACK")
);

console.log(
  calculateLevel(150)
);

console.log(
  calculateNextEligibleDate(
    "2026-06-13"
  )
);