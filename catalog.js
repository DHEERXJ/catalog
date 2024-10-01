// Import required module
const math = require("mathjs");

/**
 * Convert a number from a given base to decimal.
 * @param {string} valueStr - The string representation of the number.
 * @param {number} base - The base of the number.
 * @returns {number} - The decimal equivalent.
 */
function convertToDecimal(valueStr, base) {
  return parseInt(valueStr, base);
}

/**
 * Parse the JSON input and extract shares.
 * @param {string} jsonInput - The JSON string containing shares.
 * @returns {Object} - An object containing n, k, and shares.
 */
function parseJsonInput(jsonInput) {
  const data = JSON.parse(jsonInput);
  const { n, k } = data.keys;

  const shares = {};
  for (const key in data) {
    if (key === "keys") continue;
    const x = parseInt(key, 10);
    const base = parseInt(data[key].base, 10);
    const y = convertToDecimal(data[key].value, base);
    shares[x] = y;
  }

  return { n, k, shares };
}

/**
 * Select the first k shares for reconstruction.
 * @param {Object} shares - An object containing share key-value pairs.
 * @param {number} k - The number of shares to select.
 * @returns {Object} - An object containing the selected shares.
 */
function selectShares(shares, k) {
  const sortedKeys = Object.keys(shares)
    .map(Number)
    .sort((a, b) => a - b);
  const selected = {};
  for (let i = 0; i < k; i++) {
    const key = sortedKeys[i];
    selected[key] = shares[key];
  }
  return selected;
}

/**
 * Reconstruct the polynomial and return its coefficients.
 * @param {Object} selectedShares - The selected shares for reconstruction.
 * @returns {Array<number>} - An array of polynomial coefficients.
 */
function reconstructPolynomial(selectedShares) {
  const xs = [];
  const ys = [];
  for (const [x, y] of Object.entries(selectedShares)) {
    xs.push(Number(x));
    ys.push(Number(y));
  }

  // Construct the Vandermonde matrix
  const A = xs.map((x) => {
    const row = [];
    for (let i = xs.length - 1; i >= 0; i--) {
      row.push(Math.pow(x, i));
    }
    return row;
  });

  // Solve the system A * coeffs = ys
  const coeffsMatrix = math.lusolve(A, ys);
  return coeffsMatrix.map((row) => row[0]);
}

/**
 * Extract the constant term from the polynomial coefficients.
 * @param {Array<number>} coeffs - The polynomial coefficients.
 * @returns {number} - The constant term.
 */
function findConstantTerm(coeffs) {
  return coeffs[coeffs.length - 1];
}

/**
 * Main function to execute the reconstruction process.
 */
function main() {
  // Example JSON input
  const jsonInput = `
{
  "keys": {
    "n": 9,
    "k": 6
  },
  "1": {
    "base": "10",
    "value": "28735619723837"
  },
  "2": {
    "base": "16",
    "value": "1A228867F0CA"
  },
  "3": {
    "base": "12",
    "value": "32811A4AA0B7B"
  },
  "4": {
    "base": "11",
    "value": "917978721331A"
  },
  "5": {
    "base": "16",
    "value": "1A22886782E1"
  },
  "6": {
    "base": "10",
    "value": "28735619654702"
  },
  "7": {
    "base": "14",
    "value": "71AB5070CC4B"
  },
  "8": {
    "base": "9",
    "value": "122662581541670"
  },
  "9": {
    "base": "8",
    "value": "642121030037605"
  }
}`;

  // Step 1: Parse the JSON input
  const { n, k, shares } = parseJsonInput(jsonInput);
  console.log(`Total Shares (n): ${n}`);
  console.log(`Threshold (k): ${k}\n`);

  // Step 2: Converted share values
  console.log("Converted Shares:");
  for (const [x, y] of Object.entries(shares)) {
    console.log(`Share ${x}: (x=${x}, y=${y})`);
  }
  console.log();

  // Step 3: Select k shares for reconstruction
  const selectedShares = selectShares(shares, k);
  console.log(`Selected ${k} Shares for Reconstruction:`);
  for (const [x, y] of Object.entries(selectedShares)) {
    console.log(`(x=${x}, y=${y})`);
  }
  console.log();

  // Step 4: Reconstruct the polynomial
  const coeffs = reconstructPolynomial(selectedShares);
  const constantTerm = findConstantTerm(coeffs);

  // Display the polynomial
  const polynomialTerms = [];
  for (let i = 0; i < coeffs.length - 1; i++) {
    const currentDegree = coeffs.length - 1 - i;
    const coeff = coeffs[i];
    if (coeff !== 0) {
      polynomialTerms.push(
        currentDegree !== 0 ? `${coeff}x^${currentDegree}` : `${coeff}`
      );
    }
  }
  polynomialTerms.push(`${constantTerm}`);

  const polynomial = polynomialTerms.join(" + ");
  console.log(`Reconstructed Polynomial: f(x) = ${polynomial}\n`);

  // Step 5: Output the constant term
  console.log(`The constant term (c) of the polynomial is: ${constantTerm}`);
}

// Execute the main function
main();
